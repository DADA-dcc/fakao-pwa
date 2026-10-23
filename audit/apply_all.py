# -*- coding: utf-8 -*-
"""批量回收 audit/inbox/*.json 的解析。

用法：
  python audit/apply_all.py                 # 默认 dry-run，只校验不写库
  python audit/apply_all.py --write         # 校验通过后写入 questions/*.json
  python audit/apply_all.py --batch 民法    # 只处理文件名含指定片段的批次

行为：
  * 遍历 audit/inbox/*.json（id -> 解析文本）
  * 复用 apply_analysis.py 的校验逻辑（占位词 / 长度>=60 / 答案一致）
  * 按 id 集合去重：minfa_03_output.json 与 民法_40_output.json 题集相同时，
    默认保留后者、跳过前者
  * 汇总表：批名 / 条目 / 可写入 / 错误 / 警告，并列出每批前 5 条错误
  * 只有 --write 才落盘；写库采用临时文件 + os.replace，避免半截文件

注意：本脚本不修改 audit/inbox/*.json。
"""
import argparse
import glob
import hashlib
import io
import json
import os
import re
import sys
import tempfile
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')
INBOX = os.path.join(ROOT, 'audit', 'inbox')

# 必须与 apply_analysis.py 保持一致
PLACEHOLDER = re.compile(
    r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|详细解析请参考', re.I)
ANS_PAT = re.compile(r'正确答案为\s*([A-D]{1,4})')

# 同一题集出现多份输出时，文件名带这些前缀的视为副本（排在后面）
DUP_PREFIXES = ('minfa_03_',)


def log(msg=''):
    print(msg)


def load_questions():
    """返回 (files, index)。

    files: 文件路径 -> 顶层对象（list 或含 questions 的 dict）
    index: id(str) -> (文件路径, 题目 dict)
    """
    files, index = {}, {}
    for fp in sorted(glob.glob(os.path.join(QDIR, '*.json'))):
        if os.path.basename(fp) == 'index.json':
            continue
        data = json.load(io.open(fp, encoding='utf-8'))
        files[fp] = data
        if isinstance(data, dict):
            qs = data.get('questions')
            if not isinstance(qs, list):
                log('[警告] %s 顶层为 dict 但没有 questions 列表，已跳过' % os.path.basename(fp))
                continue
        elif isinstance(data, list):
            qs = data
        else:
            log('[警告] %s 顶层类型不支持，已跳过' % os.path.basename(fp))
            continue
        for q in qs:
            if not isinstance(q, dict):
                continue
            qid = str(q.get('id'))
            if qid in index:
                old = os.path.basename(index[qid][0])
                log('[警告] id %s 重复：%s 与 %s，后出现者生效'
                    % (qid, old, os.path.basename(fp)))
            index[qid] = (fp, q)
    return files, index


def batch_files(pattern=None):
    fps = sorted(glob.glob(os.path.join(INBOX, '*.json')))
    if pattern:
        fps = [p for p in fps if pattern in os.path.basename(p)]
    return fps


def fingerprint(fp):
    """批文件指纹：mtime + 内容 sha1。用于写库前确认校验的是同一版本。"""
    raw = io.open(fp, 'rb').read()
    h = hashlib.sha1(raw).hexdigest()[:8]
    mt = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(os.path.getmtime(fp)))
    return mt, h


def dedupe_batches(fps):
    """按 id 集合去重；返回 (kept, skipped)。

    排序时把 DUP_PREFIXES 开头的文件放后面，确保 minfa_03 副本被跳过而
    民法_40 正本被保留。
    """
    def sort_key(fp):
        name = os.path.basename(fp)
        return (any(name.startswith(p) for p in DUP_PREFIXES), name)

    kept, skipped, seen = [], [], {}
    for fp in sorted(fps, key=sort_key):
        name = os.path.basename(fp)
        try:
            batch = json.load(io.open(fp, encoding='utf-8'))
        except Exception as e:
            log('[错误] 无法读取 %s：%s' % (name, e))
            skipped.append((name, '读取失败'))
            continue
        if not isinstance(batch, dict):
            log('[错误] %s 不是 id->解析 的 JSON 对象，已跳过' % name)
            skipped.append((name, '格式错误'))
            continue
        ids = frozenset(str(k) for k in batch.keys())
        if ids in seen:
            skipped.append((name, seen[ids]))
            continue
        seen[ids] = name
        kept.append((fp, name, batch))
    return kept, skipped


def validate(batch, index):
    """按 apply_analysis.py 的规则校验。返回 (ok, errors, warnings)。"""
    ok, errors, warnings = [], [], []
    for qid, text in batch.items():
        qid = str(qid)
        if qid not in index:
            errors.append((qid, 'id 不存在'))
            continue
        _fp, q = index[qid]
        text = (text or '').strip()
        if PLACEHOLDER.search(text):
            errors.append((qid, '仍含占位词'))
            continue
        if len(text) < 60:
            errors.append((qid, '长度不足 %d' % len(text)))
            continue
        ans = (q.get('answer') or '').strip().upper()
        qtype = q.get('type') or ''
        if '主观' not in qtype and ans:
            m = ANS_PAT.search(text)
            if not m:
                errors.append((qid, '缺少「正确答案为X」'))
                continue
            got = ''.join(sorted(m.group(1)))
            want = ''.join(sorted(re.findall(r'[A-D]', ans)))
            if got != want:
                errors.append((qid, '答案不一致 文中%s / 题库%s' % (got, want)))
                continue
        if not PLACEHOLDER.search(q.get('analysis') or ''):
            warnings.append((qid, '原解析非占位，将被覆盖'))
        ok.append(qid)
    return ok, errors, warnings


def write_files(files, touched):
    """原子写入受影响的题库文件。返回写入的文件数。"""
    n = 0
    for fp in sorted(touched):
        data = files[fp]
        fd, tmp = tempfile.mkstemp(prefix='.apply_', suffix='.json',
                                   dir=os.path.dirname(fp))
        try:
            with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
                json.dump(data, fh, ensure_ascii=False, indent=1)
            os.replace(tmp, fp)
            n += 1
        finally:
            if os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except OSError:
                    pass
    return n


def main():
    ap = argparse.ArgumentParser(description='批量回收 inbox 解析（默认 dry-run）')
    ap.add_argument('--write', action='store_true', help='校验通过后写入题库')
    ap.add_argument('--dry-run', action='store_true',
                    help='显式声明只校验不写入（默认行为，与其它脚本对齐）')
    ap.add_argument('--batch', help='只处理文件名包含该片段的批次')
    ap.add_argument('--show-warnings', type=int, default=3,
                    help='每批最多显示几条警告（默认 3）')
    args = ap.parse_args()

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    files, index = load_questions()
    fps = batch_files(args.batch)
    if not fps:
        log('未找到 inbox 批次文件：%s' % INBOX)
        return 1

    kept, skipped = dedupe_batches(fps)
    log('题库：%d 个文件 / %d 题；inbox：%d 个批次（去重后 %d）'
        % (len(files), len(index), len(fps), len(kept)))
    if skipped:
        log('跳过重复/无效批次：')
        for name, why in skipped:
            log('  - %-40s %s' % (name, why))
    log('')

    rows, details, touched, total_ok = [], [], set(), 0
    has_error = False
    prints = {}
    for fp, name, batch in kept:
        prints[name] = fingerprint(fp)
        ok, errors, warnings = validate(batch, index)
        has_error = has_error or bool(errors)
        rows.append((name, len(batch), len(ok), len(errors), len(warnings)))
        total_ok += len(ok)
        if errors or warnings:
            details.append((name, errors, warnings))
        for qid in ok:
            fn, q = index[qid]
            touched.add(fn)
            if args.write:
                q['analysis'] = (batch[qid] or '').strip()

    name_w = max([len(r[0]) for r in rows] + [12])
    header = '%-*s %6s %8s %6s %6s' % (name_w, '批次', '条目', '可写入', '错误', '警告')
    log(header)
    log('-' * len(header))
    for name, n, okn, en, wn in rows:
        log('%-*s %6d %8d %6d %6d' % (name_w, name, n, okn, en, wn))
    log('-' * len(header))
    log('%-*s %6d %8d %6d %6d' % (
        name_w, '合计（%d 批）' % len(rows),
        sum(r[1] for r in rows), total_ok,
        sum(r[3] for r in rows), sum(r[4] for r in rows)))

    if details:
        log('')
        log('错误/警告明细（每批最多 5 条错误、N 条警告）：')
        for name, errors, warnings in details:
            log('  [%s]' % name)
            for qid, msg in errors[:5]:
                log('    [错误] %-8s %s' % (qid, msg))
            if len(errors) > 5:
                log('    ……另有 %d 条错误' % (len(errors) - 5))
            for qid, msg in warnings[:max(0, args.show_warnings)]:
                log('    [警告] %-8s %s' % (qid, msg))
            if len(warnings) > args.show_warnings:
                log('    ……另有 %d 条警告' % (len(warnings) - args.show_warnings))

    log('')
    log('批次指纹（写库前请核对，协作方可能仍在改动 inbox）：')
    for fp, name, _batch in kept:
        mt, h = prints[name]
        log('  %-40s %s  sha1:%s' % (name, mt, h))

    log('')
    if args.write and not args.dry_run:
        changed = [name for fp, name, _b in kept
                   if fingerprint(fp) != prints[name]]
        if changed:
            log('[中止] 下列批文件在校验后被改动，请重新运行：%s'
                % ', '.join(changed))
            return 2
        nfiles = write_files(files, touched)
        log('本次共写入 %d 条，覆盖 %d 个科目文件。' % (total_ok, nfiles))
    else:
        log('本次可写入 %d 条，覆盖 %d 个科目文件（dry-run，未写入）。'
            % (total_ok, len(touched)))
        log('确认无误后加 --write 执行。')
    return 1 if has_error else 0


if __name__ == '__main__':
    sys.exit(main())
