/**
 * 题库发布瘦身脚本（P2-27）：删除前端不用的冗余字段，原地写回 questions/，并重算 index.json 的 version。
 *
 * 删除规则（逐题，幂等，可重复执行）：
 *   1) q.reference：case_number 为空或为「无」，且 summary 匹配「暂无匹配 / 无匹配 / 无」→ 整个删除
 *   2) q.analysis_ai._meta：存在（真值）即删除；analysis_ai 其余子字段不动
 *   3) q.options_text：存在即删除
 *   其余字段（含 answer 的格式）、字段顺序、题目顺序一律不变。
 *
 * 格式约定（与 build-questions.mjs 一致）：
 *   questions/parts/*.json      紧凑 JSON：JSON.stringify(arr)
 *   questions/*.json（非 index） 1 空格缩进：JSON.stringify(arr, null, 1) + "\n"
 *   questions/index.json        1 空格缩进：JSON.stringify(index, null, 1) + "\n"，只改 version
 *
 * version：仿 build-questions.mjs —— 按 index.json 中科目与分块的登记顺序，
 *   对每个文件依次 update(`${科目}/${相对路径}\n`) 与 update(写出后的 body)，取 SHA1 前 8 位 → "v" + hash8。
 *
 * 安全措施：
 *   - 先读完、校验完全部文件，任何一个文件不满足「重新序列化 === 原文」（如 CRLF、BOM、手改过格式）
 *     就整体中止，一个文件都不写；
 *   - 逐题断言：除上述三个字段外，所有字段的值与字段顺序都与原来一致；
 *   - 只写内容有变化的文件，先写临时文件再改名；index.json 最后写。
 *
 * 用法：
 *   node scripts/prune-questions.mjs             # 执行并写回
 *   node scripts/prune-questions.mjs --dry-run   # 只统计，不写任何文件
 */

import { readFile, writeFile, readdir, rename, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QDIR = path.join(ROOT, "questions");
const PARTS_DIR = path.join(QDIR, "parts");
const INDEX_PATH = path.join(QDIR, "index.json");
const DRY_RUN = process.argv.includes("--dry-run");

const NO_MATCH_RE = /\u6682\u65e0\u5339\u914d|\u65e0\u5339\u914d|^\u65e0$/; // 暂无匹配 | 无匹配 | ^无$
const PRUNED_TOP_KEYS = new Set(["reference", "options_text"]);

const serializeCompact = (arr) => JSON.stringify(arr);
const serializeIndent1 = (arr) => JSON.stringify(arr, null, 1) + "\n";
const toMB = (bytes) => (bytes / 1024 / 1024).toFixed(2);
const isPlainObj = (v) => Object.prototype.toString.call(v) === "[object Object]";
const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join("/");

class AbortRun extends Error {}

/** 读取文件并校验「重新序列化 === 原文」，返回 { raw, data } */
async function readCanonical(absPath, serialize) {
  const buf = await readFile(absPath);
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    throw new AbortRun(`${rel(absPath)} 带 UTF-8 BOM，与构建产物格式不符`);
  }
  const raw = buf.toString("utf8");
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    throw new AbortRun(`${rel(absPath)} JSON 解析失败：${err.message}`);
  }
  if (serialize(data) !== raw) {
    const hint = raw.includes("\r\n") ? "（含 CRLF 换行，可能被 git autocrlf 转换过）" : "";
    throw new AbortRun(`${rel(absPath)} 重新序列化后与原文不一致${hint}，为避免误改格式已中止`);
  }
  return { raw, data };
}

/** 对一道题执行删除，返回本题删除的字段标记 */
function pruneQuestion(q) {
  const hit = { reference: false, meta: false, optionsText: false };
  if (!isPlainObj(q)) return hit;

  if (Object.prototype.hasOwnProperty.call(q, "reference")) {
    const ref = q.reference;
    if (ref && typeof ref === "object") {
      const caseNo = String(ref.case_number ?? "");
      const summary = String(ref.summary ?? "");
      if ((caseNo === "" || caseNo === "\u65e0") && NO_MATCH_RE.test(summary)) {
        delete q.reference;
        hit.reference = true;
      }
    }
  }
  if (q.analysis_ai && typeof q.analysis_ai === "object" && q.analysis_ai._meta) {
    delete q.analysis_ai._meta;
    hit.meta = true;
  }
  if (Object.prototype.hasOwnProperty.call(q, "options_text")) {
    delete q.options_text;
    hit.optionsText = true;
  }
  return hit;
}

/** 断言：除被删的三个字段外，题目内容与字段顺序完全不变 */
function assertOnlyPruned(before, after, where) {
  if (!isPlainObj(before)) {
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new AbortRun(`${where} 非对象题目被改动`);
    return;
  }
  const keysBefore = Object.keys(before).filter((k) => !(PRUNED_TOP_KEYS.has(k) && !(k in after)));
  const keysAfter = Object.keys(after);
  if (keysBefore.join("\u0000") !== keysAfter.join("\u0000")) {
    throw new AbortRun(`${where} 字段顺序发生变化`);
  }
  for (const k of keysAfter) {
    if (k === "analysis_ai" && isPlainObj(before.analysis_ai) && isPlainObj(after.analysis_ai)) {
      const { _meta: _ignored, ...restBefore } = before.analysis_ai;
      const expected = "_meta" in after.analysis_ai ? before.analysis_ai : restBefore;
      if (JSON.stringify(expected) !== JSON.stringify(after.analysis_ai)) {
        throw new AbortRun(`${where} analysis_ai 除 _meta 外被改动`);
      }
      continue;
    }
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) {
      throw new AbortRun(`${where} 字段 ${k} 被改动`);
    }
  }
}

async function listJson(dir, exclude = new Set()) {
  if (!existsSync(dir)) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json") && !exclude.has(e.name))
    .map((e) => path.join(dir, e.name))
    .sort();
}

/** 先写临时文件再改名，避免中途中断留下半截 JSON */
async function writeAtomic(absPath, body) {
  const tmp = `${absPath}.prune-tmp-${process.pid}`;
  await writeFile(tmp, body, "utf8");
  try {
    await rename(tmp, absPath);
  } catch (err) {
    await unlink(tmp).catch(() => {});
    throw err;
  }
}

async function main() {
  if (!existsSync(INDEX_PATH)) throw new AbortRun(`缺少 ${rel(INDEX_PATH)}`);
  const serializeIndex = (o) => JSON.stringify(o, null, 1) + "\n";
  const { data: index } = await readCanonical(INDEX_PATH, serializeIndex);
  if (!isPlainObj(index) || !isPlainObj(index.subjects)) throw new AbortRun("index.json 缺少 subjects");

  // 1) 待处理文件：parts/*.json（紧凑）+ questions/*.json（排除 index.json，1 空格缩进）
  const partFiles = await listJson(PARTS_DIR);
  const singleFiles = await listJson(QDIR, new Set(["index.json"]));
  const jobs = new Map(); // absPath -> job
  for (const f of partFiles) jobs.set(path.normalize(f), { abs: f, serialize: serializeCompact });
  for (const f of singleFiles) jobs.set(path.normalize(f), { abs: f, serialize: serializeIndent1 });

  // 2) 哈希顺序：严格按 index.json 的科目与分块登记顺序（与 build-questions.mjs 相同）
  const hashOrder = [];
  for (const [name, meta] of Object.entries(index.subjects)) {
    const entries = Array.isArray(meta.parts) ? meta.parts : (meta.file ? [meta.file] : []);
    if (!entries.length) throw new AbortRun(`index.json 中科目「${name}」没有 parts / file`);
    for (const entry of entries) {
      const abs = path.normalize(path.join(QDIR, entry));
      if (!jobs.has(abs)) throw new AbortRun(`index.json 登记的 ${entry} 不存在或不在扫描范围内`);
      hashOrder.push({ label: `${name}/${entry}\n`, abs });
    }
  }
  const registered = new Set(hashOrder.map((h) => h.abs));
  const unregistered = [...jobs.keys()].filter((k) => !registered.has(k));

  // 3) 预检 + 计算（此阶段不写任何文件）
  const stats = { files: 0, changedFiles: 0, questions: 0, reference: 0, meta: 0, optionsText: 0, bytesBefore: 0, bytesAfter: 0 };
  const oldHash = createHash("sha1");
  const newHash = createHash("sha1");
  for (const job of jobs.values()) {
    const { raw, data } = await readCanonical(job.abs, job.serialize);
    if (!Array.isArray(data)) throw new AbortRun(`${rel(job.abs)} 顶层不是题目数组`);
    const original = JSON.parse(raw); // 用于逐题断言的未改动副本
    data.forEach((q, i) => {
      const hit = pruneQuestion(q);
      stats.questions++;
      if (hit.reference) stats.reference++;
      if (hit.meta) stats.meta++;
      if (hit.optionsText) stats.optionsText++;
      assertOnlyPruned(original[i], q, `${rel(job.abs)} 第 ${i + 1} 题`);
    });
    job.raw = raw;
    job.body = job.serialize(data);
    job.changed = job.body !== raw;
    stats.files++;
    if (job.changed) stats.changedFiles++;
    stats.bytesBefore += Buffer.byteLength(raw, "utf8");
    stats.bytesAfter += Buffer.byteLength(job.body, "utf8");
  }
  for (const { label, abs } of hashOrder) {
    const job = jobs.get(abs);
    oldHash.update(label);
    oldHash.update(job.raw);
    newHash.update(label);
    newHash.update(job.body);
  }
  const oldVersion = String(index.version ?? "");
  const contentVersionBefore = `v${oldHash.digest("hex").slice(0, 8)}`;
  const newVersion = `v${newHash.digest("hex").slice(0, 8)}`;

  // 4) 写回：只写有变化的题目文件；index.json 最后写，只改 version
  const versionChanged = newVersion !== oldVersion;
  if (!DRY_RUN) {
    for (const job of jobs.values()) {
      if (job.changed) await writeAtomic(job.abs, job.body);
    }
    if (versionChanged) {
      index.version = newVersion; // 原位赋值，键顺序不变
      await writeAtomic(INDEX_PATH, serializeIndex(index));
    }
  }

  // 5) 统计
  const saved = stats.bytesBefore - stats.bytesAfter;
  const pct = stats.bytesBefore ? ((saved / stats.bytesBefore) * 100).toFixed(2) : "0.00";
  console.log(`题库瘦身${DRY_RUN ? "（--dry-run，未写入任何文件）" : ""}`);
  console.log(`  扫描文件:        ${stats.files} 个（parts ${partFiles.length} + 单文件 ${singleFiles.length}），内容有变化 ${stats.changedFiles} 个`);
  console.log(`  处理题数:        ${stats.questions}`);
  console.log(`  删除 reference:  ${stats.reference} 处`);
  console.log(`  删除 _meta:      ${stats.meta} 处`);
  console.log(`  删除 options_text: ${stats.optionsText} 处`);
  console.log(`  题目文件总字节:  ${stats.bytesBefore} → ${stats.bytesAfter}（${toMB(stats.bytesBefore)} MB → ${toMB(stats.bytesAfter)} MB，减少 ${toMB(saved)} MB / ${pct}%）`);
  console.log(`  index.json version: ${oldVersion || "(无)"} → ${newVersion}${versionChanged ? "" : "（未变化）"}${DRY_RUN && versionChanged ? "（dry-run 未写入）" : ""}`);
  if (contentVersionBefore !== oldVersion) {
    console.log(`  注意：改动前文件内容哈希为 ${contentVersionBefore}，与原 version ${oldVersion || "(无)"} 不一致（可能曾手动指定 QUESTIONS_VERSION）`);
  }
  if (/^v\d+$/.test(newVersion)) {
    console.log("  注意：新 version 恰好全是数字，build-questions.mjs 的防回退比较会把它当作 vN 处理");
  }
  if (unregistered.length) {
    console.log(`  注意：以下文件未在 index.json 登记，已瘦身但不计入 version 哈希：${unregistered.map(rel).join("、")}`);
  }
}

main().catch((err) => {
  console.error(err instanceof AbortRun ? `已中止（未写入任何文件）：${err.message}` : `执行失败：${err.stack || err.message}`);
  process.exitCode = 1;
});
