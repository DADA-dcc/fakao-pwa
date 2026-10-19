# -*- coding: utf-8 -*-
"""把补写的解析合并进题库，并做强制校验。

用法：python audit/apply_analysis.py audit/batches/xxx.json [--dry-run]

批文件格式：{"8528": "解析正文……", "8529": "……"}
校验项：
  1. 不能命中占位词
  2. 正文长度 >= 60
  3. 若题型为单选/多选/不定项，正文须出现"正确答案为X"且 X 与题库 answer 一致
  4. id 必须存在
"""
import json, io, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')

PLACEHOLDER = re.compile(r'请参考相关法条与教材解析|legal knowledge|请参考官方公布|详细解析请参考')
ANS_PAT = re.compile(r'正确答案为\s*([A-D]{1,4})')


def load_all():
    files, index = {}, {}
    for fn in glob.glob(os.path.join(QDIR, '*.json')):
        if os.path.basename(fn) == 'index.json':
            continue
        data = json.load(io.open(fn, encoding='utf-8'))
        files[fn] = data
        for q in data:
            index[str(q.get('id'))] = (fn, q)
    return files, index


def main():
    path = sys.argv[1]
    dry = '--dry-run' in sys.argv
    batch = json.load(io.open(path, encoding='utf-8'))
    files, index = load_all()

    errors, warnings, applied = [], [], 0
    for qid, text in batch.items():
        if qid not in index:
            errors.append((qid, 'id 不存在'))
            continue
        fn, q = index[qid]
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
                errors.append((qid, '缺少"正确答案为X"'))
                continue
            got = ''.join(sorted(m.group(1)))
            want = ''.join(sorted(re.findall(r'[A-D]', ans)))
            if got != want:
                errors.append((qid, '答案不一致 文中%s / 题库%s' % (got, want)))
                continue
        if not PLACEHOLDER.search(q.get('analysis') or ''):
            warnings.append((qid, '原解析非占位，将被覆盖'))
        if not dry:
            q['analysis'] = text
            applied += 1

    if not dry:
        for fn in {index[q][0] for q in batch if q in index}:
            io.open(fn, 'w', encoding='utf-8').write(
                json.dumps(files[fn], ensure_ascii=False, indent=1))

    print('批文件: %s' % os.path.basename(path))
    print('条目 %d | 写入 %d | 错误 %d | 警告 %d' % (len(batch), applied, len(errors), len(warnings)))
    for qid, msg in errors[:20]:
        print('  [错误] %-6s %s' % (qid, msg))
    for qid, msg in warnings[:10]:
        print('  [警告] %-6s %s' % (qid, msg))
    if dry:
        print('（dry-run，未写入）')


if __name__ == '__main__':
    main()
