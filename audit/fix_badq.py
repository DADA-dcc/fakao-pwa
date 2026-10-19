# -*- coding: utf-8 -*-
"""改写四道"多正确项/无正确项"的坏题，使其恢复唯一解"""
import json, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'questions', '刑法.json')
d = json.load(io.open(P, encoding='utf-8'))
m = {str(q['id']): q for q in d}

# 8761：四项原均正确，将 A 改为错误表述，答案定为 A
q = m['8761']
q['options']['A'] = 'S市中级人民法院判处死刑立即执行后，应当直接报请最高人民法院核准，无需经高级人民法院复核'
q['answer'] = 'A'

# 8836：C、D 均属依法不得担任辩护人的情形，答案应为 CD，题型改多选
q = m['8836']
q['type'] = '多选'
q['answer'] = 'CD'

# 8959：B、C、D 原均正确，改写 B、C 为错误表述，保留 D 为唯一正确项
q = m['8959']
q['options']['B'] = '甲拿出博物馆陈列柜中的枪支向乙射击，因其中没有子弹杀不死乙，甲属于不能犯，不构成犯罪'
q['options']['C'] = '夜晚，甲持刀砍杀女儿乙，并放火焚烧自己的房屋，之后在自杀过程中听到乙的呻吟，心生怜悯，将乙拖到房屋门外，甲自己也因伤势昏迷，路人经过将乙送医脱险。甲的行为成立犯罪未遂'
q['answer'] = 'D'

io.open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1))
for i in ['8725', '8761', '8836', '8959']:
    print(i, m[i]['type'], m[i]['answer'])
