#!/usr/bin/env python3
"""落库 Qoder 的「股东大会」patch。按 edit 偏移精确替换，校验 guard。幂等。"""
import io
import json
import sys

ROOT = r"C:\Users\Krilenxs\Desktop\fakao-pwa"
PATCH = f"{ROOT}/audit/outbox/qoder_shareholders_patch.json"
WRITE = "--write" in sys.argv

data = json.load(io.open(PATCH, encoding="utf-8"))
patches = data["patches"]
meta = data["meta"]

files = {}
results = []


def load(subject):
    if subject not in files:
        p = f"{ROOT}/questions/{subject}.json"
        files[subject] = (p, json.load(io.open(p, encoding="utf-8")))
    return files[subject]


def find(arr, qid):
    for q in arr:
        if q.get("id") == qid:
            return q
    return None


def get_field(q, field):
    if field.startswith("options."):
        return (q.get("options") or {}).get(field.split(".", 1)[1])
    return q.get(field)


def set_field(q, field, val):
    if field.startswith("options."):
        q.setdefault("options", {})[field.split(".", 1)[1]] = val
    else:
        q[field] = val


for p in patches:
    _, arr = load(p["subject"])
    q = find(arr, p["id"])
    if q is None:
        results.append([p["id"], p["field"], "ERR 题目不存在"])
        continue
    cur = get_field(q, p["field"])
    if cur is None:
        results.append([p["id"], p["field"], "ERR 字段不存在"])
        continue
    if cur == p["before"]:
        # 从后往前替换，避免偏移错位
        new = cur
        for e in sorted(p["edits"], key=lambda x: x["start"], reverse=True):
            s, t = e["start"], e["end"]
            if new[s:t] != e["from"]:
                results.append([p["id"], p["field"], f"ERR 偏移不符 {s}:{t} 期望{e['from']!r} 实际{new[s:t]!r}"])
                new = None
                break
            new = new[:s] + e["to"] + new[t:]
        if new is None:
            continue
        set_field(q, p["field"], new)
        results.append([p["id"], p["field"], f"改 {p['occurrences']} 处"])
    else:
        # 可能已应用，也可能内容漂移
        after = p["before"]
        for e in sorted(p["edits"], key=lambda x: x["start"], reverse=True):
            after = after[:e["start"]] + e["to"] + after[e["end"]:]
        if cur == after:
            results.append([p["id"], p["field"], "SKIP 已应用"])
        else:
            results.append([p["id"], p["field"], "ERR 内容漂移，需人工核对"])

for subj, (path, arr) in files.items():
    if WRITE and any(r[2].startswith("改") for r in results if r[0] in {x["id"] for x in patches if x["subject"] == subj}):
        with io.open(path, "w", encoding="utf-8", newline="\n") as f:
            json.dump(arr, f, ensure_ascii=False, indent=1)
        print(f"写入 {subj}")

for r in results:
    print(r)

bad = [r for r in results if r[2].startswith("ERR")]
print(f"\n合计 {len(results)} 字段，错误 {len(bad)}")
if WRITE and not bad:
    io.open(f"{ROOT}/audit/work/apply_shareholders_log.json", "w", encoding="utf-8").write(
        json.dumps(results, ensure_ascii=False, indent=1))
    print("已写入。预期「股东大会」总数：", meta["termAfter"])
else:
    if not WRITE:
        print("[DRY-RUN] 加 --write 才落库")
