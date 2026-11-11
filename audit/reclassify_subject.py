# -*- coding: utf-8 -*-
"""把 33 道卷一（法制史/法理学/国际公法）真题归回正确学科。

判据：题干强特征词 + 解析首行卷号「卷一」双重校验，逐条见
audit/subject_reclassified_20261111.json。仅改 subject 与所属文件，不改题干/答案。
"""
import json, io, os, glob, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

HIST = r'唐律|《唐律|大清律例|大明律|宋刑统|依照唐宋|十恶|八议|化外人|辜限|造意者|同姓不婚|唐朝开元|清朝乾隆|唐玄宗开元|明律相对于唐律'
JURI = r'法谚|法的价值|法的现代化|关于法系|法律规则、法律原则|法的价值冲突|法律解释方法'
INTL = r'引渡请求|向中国提出引渡|使馆的三等秘书|总领馆|领馆邮袋|外交特权与豁免|维也纳外交关系公约|公海.*海盗|申请到.{0,6}国籍|双重国籍'


def target_of(q, subj):
    s = (q.get('question') or '').strip()
    a = (q.get('analysis') or '')[:60]
    m = re.search(r'【([^】]{1,28})】', a)
    v = m.group(1) if m else ''
    tgt = ''
    if subj != '法制史' and re.search(HIST, s):
        tgt = '法制史'
    elif subj != '法理学' and re.search(JURI, s[:80]):
        tgt = '法理学'
    elif subj != '国际法' and re.search(INTL, s[:90]):
        tgt = '国际法'
    if not tgt:
        return ''
    strong = bool(re.search(r'唐律|清律|十恶|法谚|法系', s[:40]))
    return tgt if ('卷一' in v or strong) else ''


files, moves = {}, []
for f in sorted(glob.glob('questions/*.json')):
    if f.endswith('index.json'):
        continue
    subj = os.path.basename(f)[:-5]
    data = json.load(io.open(f, encoding='utf-8'))
    files[subj] = data
    for q in data:
        t = target_of(q, subj)
        if t:
            moves.append({'id': q['id'], 'from': subj, 'to': t,
                          'question': (q.get('question') or '')[:120]})

print('迁移 %d 题' % len(moves))
print('方向:', dict(collections.Counter((m['from'], m['to']) for m in moves)))

# 从原文件摘出，改 subject，追加到目标文件
by_id = {}
for subj, data in files.items():
    keep = []
    for q in data:
        hit = next((m for m in moves if str(m['id']) == str(q['id']) and m['from'] == subj), None)
        if hit:
            q['subject'] = hit['to']
            by_id[str(q['id'])] = q
        else:
            keep.append(q)
    files[subj] = keep
for m in moves:
    files[m['to']].append(by_id[str(m['id'])])

for subj, data in files.items():
    json.dump(data, io.open(os.path.join('questions', subj + '.json'), 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)

idx = json.load(io.open('questions/index.json', encoding='utf-8'))
for subj, meta in idx['subjects'].items():
    p = os.path.join('questions', meta['file'])
    if os.path.exists(p):
        meta['count'] = len(json.load(io.open(p, encoding='utf-8')))
        meta['size_mb'] = round(os.path.getsize(p) / 1048576, 2)
idx['total'] = sum(m['count'] for m in idx['subjects'].values())
json.dump(idx, io.open('questions/index.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

json.dump(moves, io.open('audit/subject_reclassified_20261111.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('index.total =', idx['total'])
print('清单: audit/subject_reclassified_20261111.json')
