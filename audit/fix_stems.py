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
    '法理学': {
        '230':  {'question': '关于法律解释，下列说法错误的是？'},
        '7393': {'options': {'D': '不违背公序良俗'}},
        '7476': {'options': {'C': '最高人民法院某副院长在接受媒体采访时表示，《刑法修正案（八）》中规定的“醉驾入刑”应结合《刑法》总则当中的“情节显著轻微，危害不大，不认为是犯罪”的规定来理解。因此并非只要醉驾就一定入刑，这属于体系解释方法的运用'}},
        '8252': {'options': {
            'A': '可撤销的民事法律行为一经撤销，自始无效',
            'B': '可撤销的民事法律行为在撤销前效力待定',
            'D': '法官审理案件时发现民事法律行为具有可撤销事由的，可依职权撤销',
        }},
        '8772': {'question': '下列关于两大法系的说法中，错误的是：',
                 'options': {'D': '罗马法系的正式法律渊源为制定法，英美法系的正式法律渊源是普通法与衡平法'}},
        '8914': {'options': {
            'A': '甲毕业后，经过多轮面试，成功被乙公司录用，甲、乙双方签订劳动合同',
            'D': '甲、乙约定十年后，如果甲未娶，乙未嫁，则甲、乙结婚',
        }},
        '9000': {'question': '金发、牧田、杜青三人出资设立苍黄古月文化有限责任公司，后公司因经营不善倒闭。关于清算有关的法律责任，下列选项错误的是？'},
        '9765': {'options': {'B': '大陆法系是在继承罗马法的基础上逐渐形成的'}},
        '9794': {'options': {'B': '《条画五章》'}},
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
