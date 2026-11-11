# -*- coding: utf-8 -*-
"""把 case_materials_20261111.json 中的真题共享案情补回缺材料题。

按「年份 + 卷次 + 题号范围」匹配，把案情作为题干前缀拼入，
并移除 incomplete 标记，使该题重新进入练习池。可重复执行（幂等）。

后续补录新卷次时，只需往 case_materials_20261111.json 追加条目再跑本脚本。
"""
import json, io, os, glob, re, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

MATS = json.load(io.open('audit/case_materials_20261111.json', encoding='utf-8'))
SRC_PAT = re.compile(r'【([^】]{0,20}?)-?卷([一二三四])\s*第\s*(\d+)\s*题】')
PREFIX = '【共享案情】\n'


def find_material(analysis):
    m = SRC_PAT.search((analysis or '')[:60])
    if not m:
        return None
    year, juan, num = m.group(1).strip(), m.group(2), int(m.group(3))
    for x in MATS:
        if x['year'] == year and x['juan'] == juan and x['start'] <= num <= x['end']:
            return x
    return None


restored, no_material = [], []
for f in sorted(glob.glob('questions/*.json')):
    if f.endswith('index.json'):
        continue
    data = json.load(io.open(f, encoding='utf-8'))
    changed = False
    for q in data:
        if not q.get('incomplete'):
            continue
        mat = find_material(q.get('analysis'))
        if not mat:
            no_material.append(q['id'])
            continue
        stem = (q.get('question') or '').strip()
        if not stem.startswith(PREFIX):
            q['question'] = PREFIX + mat['material'] + '\n\n' + stem
        q.pop('incomplete', None)
        q.pop('missing_reason', None)
        q['case_material_source'] = mat['source']
        restored.append({'id': q['id'], 'file': os.path.basename(f)[:-5],
                         'range': '%s-卷%s 第%d-%d题' %
                                  (mat['year'], mat['juan'], mat['start'], mat['end'])})
        changed = True
    if changed:
        json.dump(data, io.open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print('案情库条目:', len(MATS))
print('本轮恢复:', len(restored), '题')
print('按卷次:', dict(collections.Counter(r['range'] for r in restored)))
print('仍缺案情:', len(no_material), '题')
# 清单累积：从题库重建全部已恢复条目，避免多次运行只留最后一批
all_restored = []
for f in sorted(glob.glob('questions/*.json')):
    if f.endswith('index.json'):
        continue
    for q in json.load(io.open(f, encoding='utf-8')):
        if q.get('case_material_source'):
            all_restored.append({'id': q['id'], 'file': os.path.basename(f)[:-5],
                                 'source': q['case_material_source']})
json.dump(all_restored,
          io.open('audit/case_restored_20261111.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('累计已恢复清单:', len(all_restored), '条')
