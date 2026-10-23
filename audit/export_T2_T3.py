# -*- coding: utf-8 -*-
"""从 audit/report.json 导出 T2（重复题）与 T3（短题干/缺材料）判定素材。

用法：
  python audit/export_T2_T3.py --dry-run          # 只看统计，不落盘
  python audit/export_T2_T3.py                    # 导出到 audit/outbox/
  python audit/export_T2_T3.py --samples 20       # 附带导出 P2 两类样本
  python audit/export_T2_T3.py --outdir audit/outbox

产出（沿用 export_batch.py 的 _input.json + _prompt.md 双文件约定）：
  outbox/T2_dup_input.json      F_duplicate 全量分组（含原题对照）
  outbox/T2_dup_prompt.md       T2 判定说明
  outbox/T3_judge_input.json    B_missing_material + B_short_stem_person
  outbox/T3_judge_prompt.md     T3 判定说明
  outbox/S1_type_mismatch_sample.json    （--samples 时）C_type_mismatch 抽样
  outbox/S2_article_conflict_sample.json （--samples 时）G_article_quote_conflict 抽样

每条记录含：id / 学科 / 题型 / 年份 / 题干 / 选项 / 答案 / 解析完整度。
只读 report.json 与 questions/*.json，不写题库。
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')
REPORT = os.path.join(ROOT, 'audit', 'report.json')
OUTBOX = os.path.join(ROOT, 'audit', 'outbox')

PLACEHOLDER = re.compile(
    r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|详细解析请参考', re.I)
DUP_REF = re.compile(r'id\s*([0-9][0-9,\s]*)')

T2_PROMPT = """# T2 判定：重复题（{groups} 组 / {total} 题）

## 背景
`audit/report.json` 的 F_duplicate 类别列出题库中题干完全相同（或高度重复）的题目。
重复题会让刷题用户重复刷到同一题，也会让解析维护成本翻倍，需要人工决定去留。

## 输入
同目录 `T2_dup_input.json`，每组包含：
- `group`：组号
- `report_note`：自动检测给出的重复说明
- `members`：该组每一道题的完整信息（id / 学科 / 题型 / 年份 / 题干 / 选项 / 答案 /
  解析完整度：analysis_status 取值为 empty 空、placeholder 占位、filled 已有实质解析；
  analysis_len 为解析字数）

## 需要你做的
对每一组给出一个结论（写进本文件旁的 T2_decision.md 即可）：
1. 保留哪一题（建议保留：解析已填、题型/年份信息更完整、选项无损坏的那一题）
2. 其余题是删除、还是仅标记为重复
3. 若组内两题选项不一致，说明该保留哪套选项

## 注意
- 组内若有一题解析已填（analysis_status=filled），优先保留它。
- 组内若有题缺材料/选项损坏，优先保留完整的那一题。
- 判定只依据 T2_dup_input.json 内容，不需要改题目原文。

## 输出
一个 Markdown 表即可：组号 | 保留 id | 处理方式 | 理由
"""

T3_PROMPT = """# T3 判定：短题干 / 缺材料（{total} 条）

## 背景
`audit/report.json` 的 B_short_stem_person（题干过短、疑似人物题被截断）与
B_missing_material（分案题引用了"事实四"等外部材料）两类问题，
需要人工判断题干是否真的残缺、是否需要补齐材料。

## 输入
同目录 `T3_judge_input.json`，每条包含：
- `category`：`B_short_stem_person` 或 `B_missing_material`
- `report_note`：自动检测给出的原因说明
- id / 学科 / 题型 / 年份 / 题干 / 选项 / 答案 / 解析完整度

## 需要你做的
逐条给出结论（写进同目录 T3_decision.md）：
1. 题干是否真的残缺（短题干未必残缺，可能是真正的单问句）
2. 若残缺，缺的是什么（人物关系 / 前情 / 事实编号 / 材料原文）
3. 处理方式：可依据现有信息补写解析 / 必须补材料才能作答 / 建议删除

## 注意
- 不要臆造事实：判断为"必须补材料"的题不要硬写解析。
- 分案题（引用"事实一/事实二"）通常属于整卷题被拆散，需回到原卷补材料。
- 解析完整度字段用于判断该题是否已有人工写过的解析，不要覆盖。

## 输出
一个 Markdown 表即可：id | category | 是否残缺 | 缺失内容 | 处理方式
"""


def log(msg=''):
    print(msg)


def load_questions():
    index = {}
    for fn in sorted(os.listdir(QDIR)):
        if not fn.endswith('.json') or fn == 'index.json':
            continue
        data = json.load(io.open(os.path.join(QDIR, fn), encoding='utf-8'))
        if isinstance(data, dict):
            qs = data.get('questions')
            if not isinstance(qs, list):
                continue
        elif isinstance(data, list):
            qs = data
        else:
            continue
        subj = os.path.splitext(fn)[0]
        for q in qs:
            if isinstance(q, dict):
                index[str(q.get('id'))] = (subj, q)
    return index


def analysis_status(q):
    ana = (q.get('analysis') or '').strip()
    if not ana:
        return 'empty', 0
    if PLACEHOLDER.search(ana):
        return 'placeholder', len(ana)
    return 'filled', len(ana)


def record(index, qid, category=None, note=None):
    qid = str(qid).strip()
    hit = index.get(qid)
    rec = {
        'id': qid,
        'category': category,
        'report_note': note,
        'found': bool(hit),
    }
    if not hit:
        rec.update({'subject': None, 'type': None, 'year': None,
                    'question': None, 'options': {}, 'answer': None,
                    'analysis_status': 'missing', 'analysis_len': 0})
        return rec
    subj, q = hit
    st, ln = analysis_status(q)
    rec.update({
        'subject': q.get('subject') or subj,
        'type': q.get('type'),
        'year': q.get('year'),
        'question': q.get('question'),
        'options': q.get('options') or {},
        'answer': q.get('answer'),
        'analysis_status': st,
        'analysis_len': ln,
    })
    return rec


def build_t2(index, items):
    groups, missing = [], []
    for i, it in enumerate(items, 1):
        note = it.get('note') or ''
        ids = [str(it.get('id'))]
        m = DUP_REF.search(note)
        if m:
            for x in re.findall(r'[0-9]+', m.group(1)):
                if x not in ids:
                    ids.append(x)
        members = [record(index, x, 'F_duplicate', note) for x in ids]
        for mem in members:
            if not mem['found']:
                missing.append(mem['id'])
        groups.append({
            'group': i,
            'category': 'F_duplicate',
            'report_note': note,
            'members': members,
        })
    return groups, missing


def build_t3(index, items_map):
    out, missing = [], []
    for category, items in items_map:
        for it in items:
            rec = record(index, it.get('id'), category, it.get('note') or '')
            if not rec['found']:
                missing.append(rec['id'])
            out.append(rec)
    return out, missing


def write_json(path, obj):
    with io.open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(json.dumps(obj, ensure_ascii=False, indent=1))


def write_text(path, text):
    with io.open(path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(text)


def main():
    ap = argparse.ArgumentParser(description='导出 T2/T3 判定素材')
    ap.add_argument('--report', default=REPORT, help='report.json 路径')
    ap.add_argument('--outdir', default=OUTBOX, help='输出目录，默认 audit/outbox')
    ap.add_argument('--dry-run', action='store_true', help='只统计，不落盘')
    ap.add_argument('--samples', type=int, default=0,
                    help='同时导出 C_type_mismatch / G_article_quote_conflict 抽样条数')
    args = ap.parse_args()

    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    report_path = args.report
    if not os.path.isabs(report_path):
        report_path = os.path.join(ROOT, report_path)
    if not os.path.exists(report_path):
        log('[错误] 找不到 report.json：%s' % report_path)
        return 1

    rep = json.load(io.open(report_path, encoding='utf-8'))
    items = rep.get('items') or {}
    index = load_questions()

    dup_items = items.get('F_duplicate') or []
    miss_items = items.get('B_missing_material') or []
    short_items = items.get('B_short_stem_person') or []

    t2_groups, t2_missing = build_t2(index, dup_items)
    t3_items, t3_missing = build_t3(index, [
        ('B_missing_material', miss_items),
        ('B_short_stem_person', short_items),
    ])

    log('report.json：%s（题库 %d 题）' % (os.path.basename(report_path), len(index)))
    log('T2 F_duplicate        %3d 组 / %3d 题'
        % (len(t2_groups), sum(len(g['members']) for g in t2_groups)))
    log('T3 B_missing_material %3d 条' % len(miss_items))
    log('T3 B_short_stem_person%3d 条' % len(short_items))
    if t2_missing:
        log('  [提示] T2 中有 %d 个 id 不在题库：%s'
            % (len(t2_missing), ', '.join(t2_missing[:10])))
    if t3_missing:
        log('  [提示] T3 中有 %d 个 id 不在题库：%s'
            % (len(t3_missing), ', '.join(t3_missing[:10])))

    s1 = s2 = None
    if args.samples:
        s1_items = items.get('C_type_mismatch') or []
        s2_items = items.get('G_article_quote_conflict') or []
        s1 = [record(index, it.get('id'), 'C_type_mismatch', it.get('note') or '')
              for it in s1_items[:args.samples]]
        s2 = []
        for it in s2_items[:args.samples]:
            ids = re.findall(r'[0-9]+', str(it.get('id') or ''))
            mem = [record(index, x, 'G_article_quote_conflict', it.get('note') or '')
                   for x in ids] or [record(index, it.get('id'),
                                           'G_article_quote_conflict',
                                           it.get('note') or '')]
            s2.append({
                'category': 'G_article_quote_conflict',
                'report_note': it.get('note') or '',
                'ids': ids,
                'members': mem,
            })
        log('P2 样本：C_type_mismatch %d 条 / G_article_quote_conflict %d 组'
            % (len(s1), len(s2)))

    if args.dry_run:
        log('')
        log('--dry-run：未写入任何文件。')
        return 0

    outdir = args.outdir
    if not os.path.isabs(outdir):
        outdir = os.path.join(ROOT, outdir)
    os.makedirs(outdir, exist_ok=True)

    write_json(os.path.join(outdir, 'T2_dup_input.json'), t2_groups)
    write_text(os.path.join(outdir, 'T2_dup_prompt.md'), T2_PROMPT.format(
        groups=len(t2_groups),
        total=sum(len(g['members']) for g in t2_groups)))
    write_json(os.path.join(outdir, 'T3_judge_input.json'), t3_items)
    write_text(os.path.join(outdir, 'T3_judge_prompt.md'), T3_PROMPT.format(
        total=len(t3_items)))
    log('')
    log('输出目录：%s' % outdir)
    for fn in ['T2_dup_input.json', 'T2_dup_prompt.md',
               'T3_judge_input.json', 'T3_judge_prompt.md']:
        p = os.path.join(outdir, fn)
        h = hashlib.sha1(io.open(p, 'rb').read()).hexdigest()[:8]
        log('  %-24s %8d B  sha1:%s' % (fn, os.path.getsize(p), h))

    if s1 is not None:
        write_json(os.path.join(outdir, 'S1_type_mismatch_sample.json'), s1)
        write_json(os.path.join(outdir, 'S2_article_conflict_sample.json'), s2)
        for fn in ['S1_type_mismatch_sample.json', 'S2_article_conflict_sample.json']:
            p = os.path.join(outdir, fn)
            log('  %-24s %8d B' % (fn, os.path.getsize(p)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
