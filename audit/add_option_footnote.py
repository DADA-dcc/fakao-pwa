# -*- coding: utf-8 -*-
"""给 4494-C / 4542-C 两个保留真题原文的选项加 footnote 说明。

背景：4572195 的分层口径规则3 是「同题内选项真题原文保留 + 脚注」，
但脚注一直没实现 —— 数据无 footnote 字段，UI 也不渲染。
本脚本补上数据侧；UI 侧改动在 index.html。
"""
import io
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

NOTE = "本题为 %d 年真题，选项保留原文「股东大会」。2024 年 7 月 1 日起施行的《公司法》已统一改称「股东会」。"
TARGETS = {4494: 2008, 4542: 2016}

path = "questions/商经法.json"
data = json.load(io.open(path, encoding="utf-8"))

applied = 0
for q in data:
    qid = q.get("id")
    if qid not in TARGETS:
        continue
    if "股东大会" not in q.get("options", {}).get("C", ""):
        raise SystemExit("MISS id=%s option C 不含「股东大会」" % qid)
    fn = q.get("footnote") or {}
    if "C" in fn:
        raise SystemExit("SKIP id=%s 已有 footnote.C" % qid)
    fn["C"] = NOTE % TARGETS[qid]
    q["footnote"] = fn
    applied += 1
    print("OK %s footnote.C" % qid)

with io.open(path, "w", encoding="utf-8", newline="\n") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
    f.write("\n")

print("applied=%d" % applied)
