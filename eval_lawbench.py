"""
LawBench-style evaluation for fakao-pwa AI accuracy.
Samples questions, queries DeepSeek, compares answers, reports by subject/difficulty.
"""
import json
import os
import re
import sys
import time
import asyncio
from pathlib import Path
from collections import defaultdict

# ── Config ──
API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
API_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-reasoner"
SAMPLE_SIZE = 100  # Total questions to evaluate
MAX_CONCURRENT = 5  # API rate limit

# Files
QUESTIONS_DIR = Path(__file__).parent / "questions"

# Prompt template
SYSTEM_PROMPT = """你是一位法考辅导老师。请回答以下法律选择题。
规则：
1. 只输出答案字母（如"A"或"AB"），不要输出解析
2. 单选题只输出一个字母，多选题输出多个字母（如"ABC"）
3. 不要输出任何其他内容"""


def load_sample_questions(n: int = SAMPLE_SIZE) -> list[dict]:
    """Load a stratified sample across subjects."""
    all_qs = []
    if QUESTIONS_DIR.exists():
        for f in sorted(QUESTIONS_DIR.glob("*.json")):
            if f.name == "index.json":
                continue
            with open(f, "r", encoding="utf-8") as fp:
                qs = json.load(fp)
                # Only evaluate 单选 and 多选 (objective questions)
                qs = [q for q in qs if q.get("type") in ("单选", "多选")]
                all_qs.extend(qs)

    # Stratify by subject × difficulty
    strata: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for q in all_qs:
        key = (q.get("subject", ""), q.get("type", ""), q.get("difficulty", ""))
        strata[key].append(q)

    # Sample proportionally from each stratum
    sample = []
    total = len(all_qs)
    for key, qs in strata.items():
        stratum_n = max(1, int(len(qs) / total * n))
        import random
        random.seed(42)
        sample.extend(random.sample(qs, min(stratum_n, len(qs))))

    random.shuffle(sample)
    return sample[:n]


def build_user_prompt(q: dict) -> str:
    """Build a clean prompt for the LLM."""
    prompt = q.get("question", "") + "\n\n"
    options = q.get("options", {})
    for letter in ["A", "B", "C", "D"]:
        if letter in options:
            prompt += f"{letter}. {options[letter]}\n"
    return prompt


def parse_answer(response: str) -> str:
    """Extract answer letters from LLM response."""
    # Clean up
    response = response.strip().upper()
    # Try to find A/B/C/D patterns
    # Pattern 1: just letters
    match = re.match(r"^([ABCD]+)$", response)
    if match:
        return "".join(sorted(match.group(1)))
    # Pattern 2: "答案：A" or "答案是AB"
    match = re.search(r"答案[：:是为]\s*([ABCD]+)", response)
    if match:
        return "".join(sorted(match.group(1)))
    # Pattern 3: "选A" or "选择AB"
    match = re.search(r"选[择]?\s*([ABCD]+)", response)
    if match:
        return "".join(sorted(match.group(1)))
    # Pattern 4: just extract all A-D letters
    letters = re.findall(r"[ABCD]", response)
    if letters:
        return "".join(sorted(set(letters)))
    return response[:10]


async def evaluate_question(q: dict, session) -> dict:
    """Evaluate a single question."""
    user_prompt = build_user_prompt(q)
    correct = "".join(sorted(q.get("answer", "").strip().upper()))

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.0,  # Deterministic for evaluation
        "max_tokens": 100,
    }

    import aiohttp
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }

    start = time.time()
    try:
        async with session.post(API_URL, json=payload, headers=headers, timeout=30) as resp:
            if resp.status != 200:
                text = await resp.text()
                return {"error": f"HTTP {resp.status}: {text[:200]}", "correct": "", "predicted": ""}
            data = await resp.json()
            predicted_raw = data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return {"error": str(e), "correct": "", "predicted": ""}

    elapsed = time.time() - start
    predicted = parse_answer(predicted_raw)
    is_correct = predicted == correct

    return {
        "correct": correct,
        "predicted": predicted,
        "predicted_raw": predicted_raw[:100],
        "is_correct": is_correct,
        "elapsed": round(elapsed, 2),
        "subject": q.get("subject", ""),
        "type": q.get("type", ""),
        "difficulty": q.get("difficulty", ""),
    }


async def main():
    if not API_KEY:
        print("ERROR: Set DEEPSEEK_API_KEY environment variable")
        print("  PowerShell: $env:DEEPSEEK_API_KEY = 'sk-...'")
        print("  Bash: export DEEPSEEK_API_KEY='sk-...'")
        sys.exit(1)

    print(f"Loading sample of {SAMPLE_SIZE} questions...")
    sample = load_sample_questions(SAMPLE_SIZE)
    print(f"Loaded {len(sample)} questions")

    print(f"Evaluating with DeepSeek ({MODEL})...")
    import aiohttp

    results = []
    sem = asyncio.Semaphore(MAX_CONCURRENT)

    async def eval_with_limit(q, session):
        async with sem:
            return await evaluate_question(q, session)

    async with aiohttp.ClientSession() as session:
        tasks = [eval_with_limit(q, session) for q in sample]
        for i, coro in enumerate(asyncio.as_completed(tasks)):
            result = await coro
            results.append(result)
            status = "✅" if result.get("is_correct") else "❌"
            if "error" in result:
                status = "⚠️"
            print(f"  [{i+1:3d}/{len(sample)}] {status} "
                  f"{result.get('subject',''):6s} {result.get('difficulty',''):4s} "
                  f"正确:{result.get('correct','')} 预测:{result.get('predicted','')} "
                  f"{result.get('elapsed',0):.1f}s")

    # ── Report ──
    correct = [r for r in results if r.get("is_correct")]
    errors = [r for r in results if "error" in r]
    accuracy = len(correct) / len(results) * 100 if results else 0

    print(f"\n{'='*60}")
    print(f"LawBench 评测报告")
    print(f"{'='*60}")
    print(f"模型: {MODEL}")
    print(f"样本数: {len(results)}")
    print(f"正确数: {len(correct)}")
    print(f"错误数: {len(results) - len(correct) - len(errors)}")
    print(f"API错误: {len(errors)}")
    print(f"总体准确率: {accuracy:.1f}%")

    # By subject
    print(f"\n── 按科目 ──")
    by_subject = defaultdict(lambda: {"total": 0, "correct": 0})
    for r in results:
        s = r.get("subject", "未知")
        by_subject[s]["total"] += 1
        if r.get("is_correct"):
            by_subject[s]["correct"] += 1
    for s in sorted(by_subject.keys()):
        d = by_subject[s]
        acc = d["correct"] / d["total"] * 100 if d["total"] else 0
        bar = "█" * int(acc / 5) + "░" * (20 - int(acc / 5))
        print(f"  {s:10s} {bar} {acc:5.1f}% ({d['correct']}/{d['total']})")

    # By difficulty
    print(f"\n── 按难度 ──")
    by_diff = defaultdict(lambda: {"total": 0, "correct": 0})
    for r in results:
        d = r.get("difficulty", "未知")
        by_diff[d]["total"] += 1
        if r.get("is_correct"):
            by_diff[d]["correct"] += 1
    for d in ["基础", "中等", "困难"]:
        if d in by_diff:
            dd = by_diff[d]
            acc = dd["correct"] / dd["total"] * 100 if dd["total"] else 0
            print(f"  {d:6s} {acc:5.1f}% ({dd['correct']}/{dd['total']})")

    # By type
    print(f"\n── 按题型 ──")
    by_type = defaultdict(lambda: {"total": 0, "correct": 0})
    for r in results:
        t = r.get("type", "未知")
        by_type[t]["total"] += 1
        if r.get("is_correct"):
            by_type[t]["correct"] += 1
    for t, d in sorted(by_type.items()):
        acc = d["correct"] / d["total"] * 100 if d["total"] else 0
        print(f"  {t:6s} {acc:5.1f}% ({d['correct']}/{d['total']})")

    # Worst-performing questions
    wrong = [r for r in results if not r.get("is_correct") and "error" not in r]
    if wrong:
        print(f"\n── 错误案例分析（前10条）──")
        for i, w in enumerate(wrong[:10]):
            print(f"  {i+1}. [{w['subject']}|{w['difficulty']}|{w['type']}]")
            print(f"     正确: {w['correct']} | 预测: {w['predicted']}")
            print(f"     模型输出: {w.get('predicted_raw', '')[:120]}")

    # Save report
    report = {
        "model": MODEL,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "sample_size": len(results),
        "accuracy": round(accuracy, 1),
        "by_subject": {s: {"total": d["total"], "correct": d["correct"],
                           "accuracy": round(d["correct"]/d["total"]*100, 1)}
                       for s, d in by_subject.items()},
        "by_difficulty": {d: {"total": dd["total"], "correct": dd["correct"],
                              "accuracy": round(dd["correct"]/dd["total"]*100, 1)}
                          for d, dd in by_diff.items()},
        "by_type": {t: {"total": dd["total"], "correct": dd["correct"],
                        "accuracy": round(dd["correct"]/dd["total"]*100, 1)}
                    for t, dd in by_type.items()},
        "errors": len(errors),
    }
    report_path = Path(__file__).parent / "lawbench_report.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"\n报告已保存至: {report_path}")

    # Hallucination check
    hallucination_indicators = 0
    for r in wrong:
        predicted = r.get("predicted", "")
        # Predicted answer not even a subset of options
        if predicted and not all(c in "ABCD" for c in predicted):
            hallucination_indicators += 1
    if hallucination_indicators:
        print(f"⚠️ 潜在幻觉（预测了不存在的选项）: {hallucination_indicators}/{len(wrong)} 条错误")


if __name__ == "__main__":
    asyncio.run(main())
