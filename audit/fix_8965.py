# -*- coding: utf-8 -*-
import json, io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'questions', '刑法.json')
d = json.load(io.open(P, encoding='utf-8'))
m = {str(q['id']): q for q in d}

q = m['8965']
q['answer'] = 'C'
q['analysis'] = (
    'A项错误：乙仅举起铁锅格挡，属于消极防御，未实施反击，甲手部重伤系其自己击打所致，不成立防卫过当。'
    'B项错误：乙窃取的是破旧自行车，财产价值微小，甲开枪射击足以致人死亡，防卫手段与不法侵害程度严重不相称，不属于正当防卫。'
    'C项正确：乙窃取手机属轻微不法侵害，甲一掌推倒致乙头部撞击硬物重伤，损害后果明显超出制止侵害所必需，属于防卫过当。'
    'D项错误：甲跑向藏匿砍刀的汽车，说明不法侵害仍有继续实施的现实可能，侵害尚未结束，乙追砍不属事后防卫。'
    '本题正确答案为C。'
)

io.open(P, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1))
print('8965 ->', m['8965']['answer'], '| 总数', len(d))
