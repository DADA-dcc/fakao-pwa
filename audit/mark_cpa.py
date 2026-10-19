# -*- coding: utf-8 -*-
"""标注 CPA（注册会计师）来源的试题。

判据（三条并列，取并集）：
  A. CPA 教材标志性表述「根据××法律制度的规定」
  B. 税法独有内容（印花税、企业所得税、增值税等）
  C. 外汇管理、对外贸易、反倾销、国有资产产权登记等

排除：
  1. 涉犯罪题目（危害税收征管罪等属法考刑法，不是 CPA 题）
  2. 行政法中的行政复议/诉讼/信息公开类（法考行政法）

用法：python audit/mark_cpa.py [--apply]   （默认只预览，--apply 才写入）
"""
import json, io, os, re, glob, sys

QDIR = 'C:/Users/Krilenxs/Desktop/fakao-pwa/questions'

PAT_CPA = re.compile(r'根据[^，。、；]{2,16}法律制度的规定')
PAT_TAX = re.compile(r'印花税|企业所得税|增值税|营业税|契税|土地增值税|消费税|资源税|'
                     r'税收征收管理|税收保全|出口退税|税务行政复议|房产税|车船税|'
                     r'城镇土地使用税|耕地占用税|船舶吨税|烟叶税')
PAT_ECON = re.compile(r'外汇管理|经常项目|资本项目|对外贸易|反倾销|反补贴|保障措施|'
                      r'国有资产产权登记|企业国有资产|国有资产评估|国有股东')
# CPA《经济法》不涉及这些科目，一律不标注
EXCLUDE_SUBJ = {'刑法', '刑事诉讼法', '刑诉法', '法制史', '司法制度与职业道德', '知识产权法'}
# 经济法核心科目：CPA 题的主要落点，三类判据均可采信
CORE_SUBJ = {'民法', '商经法'}
# 排除：行政法范畴
PAT_ADMIN = re.compile(r'行政复议|行政诉讼|政府信息|行政处罚|行政许可|国家赔偿|'
                       r'治安管理|行政强制|行政主体|具体行政行为')


def is_cpa(q, subj):
    if subj in EXCLUDE_SUBJ:
        return False
    blob = (q.get('question') or '') + ' ' + \
        ' '.join(str(v) for v in (q.get('options') or {}).values())

    hit_a = bool(PAT_CPA.search(blob))
    hit_b = bool(PAT_TAX.search(blob))
    hit_c = bool(PAT_ECON.search(blob))

    if subj in CORE_SUBJ:
        # 核心科目：任一判据命中即可，但行政法色彩浓厚的排除
        if PAT_ADMIN.search(blob) and not hit_a:
            return False
        return hit_a or hit_b or hit_c

    # 其余科目（行政法、民诉法、宪法、法理学、国际法等）：
    # 仅采信 CPA 教材标志性表述，避免把宪法/诉讼法中的涉税、涉外贸题误标
    if subj == '行政法' and PAT_ADMIN.search(blob):
        return False
    return hit_a


def main():
    apply = '--apply' in sys.argv
    total, marked = 0, 0
    report = []
    for fp in sorted(glob.glob(os.path.join(QDIR, '*.json'))):
        subj = os.path.basename(fp)[:-5]
        if subj == 'index':
            continue
        data = json.load(io.open(fp, encoding='utf-8'))
        hits = [q for q in data if is_cpa(q, subj)]
        total += len(data)
        marked += len(hits)
        if hits:
            report.append((subj, len(data), len(hits), [q['id'] for q in hits[:6]]))
            if apply:
                for q in hits:
                    q['source'] = 'CPA'
                io.open(fp, 'w', encoding='utf-8').write(
                    json.dumps(data, ensure_ascii=False, indent=1))

    print('题库总数 %d | 标注 CPA %d (%.1f%%)' % (total, marked, 100.0 * marked / total))
    print('-' * 64)
    for subj, n, k, ids in sorted(report, key=lambda x: -x[2]):
        print('%-20s 总%5d  CPA%4d  样例%s' % (subj, n, k, ids))
    print('-' * 64)
    print('模式:', '已写入' if apply else '预览（加 --apply 写入）')


if __name__ == '__main__':
    main()
