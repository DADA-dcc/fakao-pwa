# -*- coding: utf-8 -*-
"""修正 3 处 citation_current：把已废止旧法当作现行法引用。

5230 解析：《合同法》->《民法典》合同编
8232 题干：《婚姻法》第二十四条第一款 ->《民法典》第一千零六十一条
8748 题干：《合同法》第135条 -> 原《合同法》第155条 / 现《民法典》第617条（连带引用的条号一并修正）
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# (id, subject, field, old, new)
PATCHES = [
    (
        5230, "商经法", "analysis",
        "其应由《合同法》调整，而不该由《劳动法》调整。",
        "其应由《民法典》合同编调整，而不该由《劳动法》调整。",
    ),
    (
        8232, "民法", "question",
        "我国《婚姻法》第二十四条第一款:“夫妻有相互继承遗产的权利。”",
        "我国《民法典》第一千零六十一条：“夫妻有相互继承遗产的权利。”",
    ),
    (
        8748, "民法", "question",
        "我国《合同法》第135条规定：“出卖人交付的标的物不符合质量要求的，"
        "买受人可以依照本法第111条要求承担违约责任。\"",
        "原《合同法》第155条规定：“出卖人交付的标的物不符合质量要求的，"
        "买受人可以依照本法第111条要求承担违约责任。”"
        "该内容现由《民法典》第617条承继，并准用第582条至第584条。",
    ),
]

by_subject = {}
for qid, subject, field, old, new in PATCHES:
    by_subject.setdefault(subject, []).append((qid, field, old, new))

applied = 0
for subject, patches in by_subject.items():
    path = "questions/%s.json" % subject
    data = json.load(io.open(path, encoding="utf-8"))
    by_id = {q.get("id"): q for q in data}
    for qid, field, old, new in patches:
        q = by_id.get(qid)
        if q is None:
            raise SystemExit("MISS id=%s not found in %s" % (qid, path))
        cur = q.get(field, "")
        if old not in cur:
            raise SystemExit("MISS id=%s field=%s: target text not found in %r" % (qid, field, cur[:200]))
        q[field] = cur.replace(old, new, 1)
        print("OK %s %s %s" % (qid, subject, field))
        print("  - %s" % old)
        print("  + %s" % new)
        applied += 1
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")

print("applied=%d" % applied)
