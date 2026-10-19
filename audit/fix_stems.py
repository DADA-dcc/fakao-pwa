# -*- coding: utf-8 -*-
"""题面/选项损坏修复（幂等，可重复执行）。

用法：python audit/fix_stems.py [--dry-run]
每次审计批处理中发现的新损坏追加到 FIXES 即可。
"""
import json, io, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QDIR = os.path.join(ROOT, 'questions')

# key: 科目文件（不含 .json） -> id -> patch {question/options/answer/type/...}
# 注意：options 为深合并，只覆盖列出的键
FIXES = {
    '法制史': {
        '194':  {'question': '关于中国法制史，下列说法错误的是？'},
        '8239': {'options': {'A': '金布律', 'B': '关市律', 'C': '户婚律', 'D': '均工律'}},
        '8749': {'question': '下列关于唐律中公罪和私罪说法正确的是？'},
    },
}


def main():
    dry = '--dry-run' in sys.argv
    total = 0
    for subject, fixes in FIXES.items():
        fp = os.path.join(QDIR, '%s.json' % subject)
        data = json.load(io.open(fp, encoding='utf-8'))
        idx = {str(q.get('id')): q for q in data}
        applied = []
        for qid, patch in fixes.items():
            q = idx.get(qid)
            if not q:
                print('  [缺失] %s %s' % (subject, qid))
                continue
            changed = False
            for k, v in patch.items():
                if k == 'options' and isinstance(v, dict) and isinstance(q.get(k), dict):
                    for ok, ov in v.items():
                        if q[k].get(ok) != ov:
                            changed = True
                            if not dry:
                                q[k][ok] = ov
                elif v != q.get(k):
                    changed = True
                    if not dry:
                        q[k] = v
            if changed:
                applied.append(qid)
        if applied and not dry:
            io.open(fp, 'w', encoding='utf-8').write(
                json.dumps(data, ensure_ascii=False, indent=1))
        total += len(applied)
        print('%-10s 修复 %d 处 %s' % (subject, len(applied), applied))
    print('合计 %d 处%s' % (total, '（dry-run 未写入）' if dry else ''))


if __name__ == '__main__':
    main()
