# -*- coding: utf-8 -*-
"""精确识别「缺少共享案情、无法独立作答」的题目。

判据刻意保守：宁可少标，也不能把可独立作答的题排除出练习池。
用法：python audit/work/classify_incomplete.py           # 预演
      python audit/work/classify_incomplete.py --apply   # 写入标记 + 清单
"""
import json, io, os, glob, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
APPLY = '--apply' in sys.argv

# A：题干直接引用分案事实或共享材料，且自身不是长案情题
CASE_REF = re.compile(
    r'^(关于事实[一二三四五六七八九十]|根据上述(案情|材料|事实)|结合上述|'
    r'根据材料[①②③④一二三四\d]|上述(案情|材料|事实))')
# B：案例题组子题——短、以关于/对于/就/根据开头、指向具体主体或材料。
# 注意：不能把《宪法》《民事诉讼法》等法条名、以及「协议/被害人」等泛称
# 当作具体材料，否则会把「根据《宪法》…下列选项正确」这类独立题误标。
DEP_START = re.compile(r'^(关于|对于|就|根据|本案中)')
PERSON = re.compile(r'[甲乙丙丁]|某[某甲乙丙丁]|公司|材料[①②③④\d]|《协议[^》]*》|本案')
SELF_CONTAINED = re.compile(r'下列(哪一|哪些|何种)?(行为|说法|选项|情形|判断)|下列哪种|四人的下列')
QNUM = re.compile(r'第\s*(\d+)\s*题')
# 「根据《XX法》的规定，…」且没有具体主体/材料指代 → 独立法条题，不算缺材料
LAW_CITE = re.compile(r'^根据[^《]{0,6}《[^》]+》(和[^，。]{0,12})?的规定')
CONCRETE = re.compile(r'[甲乙丙丁]|材料[①②③④\d]|本案')


def classify(q):
    s = (q.get('question') or '').strip()
    ana = q.get('analysis') or ''
    if not s:
        return ''
    # 长题干自带完整案情，不算缺材料（如 7845 内含「（事实一）」全套叙述）
    if len(s) > 80:
        return ''
    if LAW_CITE.match(s) and not CONCRETE.search(s):
        return ''
    if CASE_REF.search(s):
        return 'A 直接引用共享案情/材料'
    if len(s) <= 50 and DEP_START.match(s) and PERSON.search(s):
        m = QNUM.search(ana[:60])
        # 法考不定项案例题通常从第 86 题起；题号可定位时才判 B
        if m and int(m.group(1)) >= 86 and not (
                SELF_CONTAINED.search(s) and not PERSON.search(s[:18])):
            return 'B 案例题组子题（卷号题号 >= 86）'
    return ''


files = {}
marked = []
for f in sorted(glob.glob('questions/*.json')):
    if f.endswith('index.json'):
        continue
    data = json.load(io.open(f, encoding='utf-8'))
    files[f] = data
    for q in data:
        why = classify(q)
        if why:
            m = re.search(r'【([^】]{1,32})】', (q.get('analysis') or '')[:60])
            marked.append({
                'id': q['id'], 'file': os.path.basename(f)[:-5], 'reason': why,
                'source': m.group(1) if m else '',
                'question': s if (s := (q.get('question') or '').strip()) else '',
                'answer': q.get('answer'),
            })

print('标记 %d 题' % len(marked))
print('按判据:', dict(collections.Counter(x['reason'][0] for x in marked)))
print('按科目:', dict(collections.Counter(x['file'] for x in marked)))
print('-' * 78)
for x in marked[:45]:
    print('  %-6s %-8s %-16s | %s' %
          (x['id'], x['file'], x['source'][:16], x['question'][:62]))
if len(marked) > 45:
    print('  ... 其余 %d 条见清单' % (len(marked) - 45))

if not APPLY:
    print('-' * 78)
    print('预演结束。加 --apply 写入标记与清单。')
    sys.exit(0)

ids = {str(x['id']) for x in marked}
for f, data in files.items():
    changed = False
    for q in data:
        if str(q['id']) in ids:
            q['incomplete'] = True
            q['missing_reason'] = 'shared_case_material'
            changed = True
    if changed:
        json.dump(data, io.open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

json.dump(marked, io.open('audit/incomplete_questions_20261111.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('-' * 78)
print('已写入 %d 题的 incomplete 标记；清单 audit/incomplete_questions_20261111.json' % len(ids))
