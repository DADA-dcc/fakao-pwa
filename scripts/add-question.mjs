#!/usr/bin/env node
/**
 * 把一条（或一批）题目追加进「源题库」。
 *
 * 用法：
 *   node scripts/add-question.mjs new-question.json
 *   node scripts/add-question.mjs batch.json --dry-run
 *   QUESTSRC=/tmp/src node scripts/add-question.mjs q.json     # 指定源目录（测试用）
 *
 * 之后执行：node scripts/build-questions.mjs
 *
 * 安全：
 *   - 逐条校验必填字段/选项/答案；
 *   - 追加前自动备份为 <科目>.json.bak-<时间戳>；
 *   - 自动分配该科目下一个可用 id；
 *   - --dry-run 只校验不写入。
 */

import { readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.QUESTSRC || path.join(ROOT, "source", "questions");

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");

if (!file) {
  console.error("用法: node scripts/add-question.mjs <题目JSON文件> [--dry-run]");
  process.exit(1);
}

function validate(q, index = 0) {
  const p = [];
  const tag = `第${index + 1}条`;
  if (!q || typeof q !== "object") return [`${tag}: 不是对象`];
  if (!q.subject) p.push(`${tag}: 缺 subject`);
  if (!["单选", "多选"].includes(q.type)) p.push(`${tag}: type 必须是 单选/多选`);
  if (typeof q.question !== "string" || q.question.trim().length < 10) p.push(`${tag}: 题干过短`);
  if (!q.options || typeof q.options !== "object") p.push(`${tag}: 缺 options`);
  else {
    const keys = Object.keys(q.options);
    if (keys.length < 2) p.push(`${tag}: 选项少于2个`);
    if (!keys.includes(q.answer)) p.push(`${tag}: answer 不在选项键中`);
    if (q.type === "单选" && keys.length !== 4) p.push(`${tag}: 单选题必须有4个选项`);
    for (const k of keys) if (!String(q.options[k] || "").trim()) p.push(`${tag}: 选项 ${k} 为空`);
  }
  if (typeof q.analysis !== "string" || q.analysis.trim().length < 20) p.push(`${tag}: 解析过短`);
  if (!q.analysis_ai || !q.analysis_ai.point) p.push(`${tag}: 缺 analysis_ai.point`);
  if (!q.analysis_ai || !q.analysis_ai.law) p.push(`${tag}: 缺 analysis_ai.law`);
  return p;
}

async function main() {
  if (!existsSync(SRC)) {
    console.error(`源题库目录不存在: ${SRC}`);
    process.exit(1);
  }

  let items;
  try {
    items = JSON.parse(await readFile(path.resolve(file), "utf8"));
  } catch (e) {
    console.error(`读取/解析失败: ${e.message}`);
    process.exit(1);
  }
  if (!Array.isArray(items)) items = [items];

  const allProblems = [];
  items.forEach((q, i) => allProblems.push(...validate(q, i)));
  if (allProblems.length) {
    console.error("❌ 校验未通过：");
    allProblems.forEach((p) => console.error("   - " + p));
    process.exit(2);
  }

  // 按科目分组
  const groups = new Map();
  for (const q of items) {
    const s = q.subject.trim();
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s).push(q);
  }

  const existingSubjects = (await readdir(SRC))
    .filter((f) => f.endsWith(".json") && f !== "index.source.json")
    .map((f) => f.replace(/\.json$/, ""));

  const summary = [];
  for (const [subject, list] of groups) {
    if (!existingSubjects.includes(subject)) {
      console.error(`❌ 未知科目「${subject}」，可用：${existingSubjects.join(" / ")}`);
      process.exit(3);
    }
    const target = path.join(SRC, `${subject}.json`);
    const bank = JSON.parse(await readFile(target, "utf8"));
    let maxId = 0;
    for (const q of bank) if (Number.isInteger(q.id) && q.id > maxId) maxId = q.id;

    const appended = list.map((q, i) => ({
      id: maxId + i + 1,
      subject: q.subject,
      type: q.type,
      ...(q.year ? { year: q.year } : {}),
      question: q.question.trim(),
      options: q.options,
      answer: q.answer,
      analysis: q.analysis.trim(),
      difficulty: q.difficulty || "基础",
      analysis_ai: q.analysis_ai
    }));

    summary.push({ subject, file: target, count: appended.length, ids: appended.map((a) => a.id), before: bank.length });

    if (dryRun) continue;

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await copyFile(target, `${target}.bak-${stamp}`);
    bank.push(...appended);
    await writeFile(target, JSON.stringify(bank, null, 1), "utf8");
  }

  console.log(dryRun ? "🧪 DRY RUN（未写入）" : "✅ 已写入源题库");
  for (const s of summary) {
    console.log(`   ${s.subject}: +${s.count} 条（id ${s.ids[0]}…${s.ids[s.ids.length - 1]}），原 ${s.before} 条`);
  }
  if (!dryRun) console.log("\n下一步：node scripts/build-questions.mjs");
}

main().catch((e) => {
  console.error("执行失败:", e);
  process.exit(1);
});
