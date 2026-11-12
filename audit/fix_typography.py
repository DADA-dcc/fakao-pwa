# -*- coding: utf-8 -*-
"""清理题库排版残留字符（幂等，记录 before/after 便于回滚）。

两类问题：
1) OCR / 复制残留：全角方块 ■、Unicode 私用区字符（U+E000–U+F8FF）
   —— 直接删除，删除后文字通顺（如「任何■一方违约」→「任何一方违约」）。
2) 法律名称嵌套书名号被写成尖括号：
   《最高人民法院关于适用<中华人民共和国民法典>有关担保制度的解释》
   —— 中文规范应用单书名号 〈〉；纯序号如 <一> 改为 （一）。

仅处理成对的、内容长度 1–30 的尖括号，且内容不含 <> 本身，
避免误伤比较运算符或代码片段。
"""
import json, io, glob, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

ANGLE = re.compile(r'<([^<>]{1,30})>')
BAD_CHAR = re.compile(r'■|[\ue000-\uf8ff]')
SEQ = re.compile(r'[一二三四五六七八九十0-9]+')


def fix_text(s):
    if not isinstance(s, str):
        return s
    out = BAD_CHAR.sub('', s)

    def angle_repl(m):
        inner = m.group(1).strip()
        # 《婚姻家庭编解释<一>》→《婚姻家庭编解释（一）》
        if SEQ.fullmatch(inner):
            return '（%s）' % inner
        # 其余为法律/司法解释名称，用单书名号
        return '〈%s〉' % inner

    return ANGLE.sub(angle_repl, out)


log = []
for f in sorted(glob.glob('questions/*.json')):
    if f.endswith('index.json'):
        continue
    data = json.load(io.open(f, encoding='utf-8'))
    changed = False
    for q in data:
        for field in ('question', 'analysis'):
            old = q.get(field)
            if not isinstance(old, str):
                continue
            new = fix_text(old)
            if new != old:
                q[field] = new
                changed = True
                log.append({'id': str(q['id']), 'file': os.path.basename(f)[:-5],
                            'field': field, 'before': old, 'after': new})
        opts = q.get('options')
        if isinstance(opts, dict):
            for k, v in opts.items():
                if not isinstance(v, str):
                    continue
                new = fix_text(v)
                if new != v:
                    opts[k] = new
                    changed = True
                    log.append({'id': str(q['id']), 'file': os.path.basename(f)[:-5],
                                'field': 'options.' + k, 'before': v, 'after': new})
    if changed:
        json.dump(data, io.open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

json.dump(log, io.open('audit/typography_fixed_20261113.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=1)
print('修复处数:', len(log), '| 涉及题目:', len(set(x['id'] for x in log)))
print('清单: audit/typography_fixed_20261113.json')
