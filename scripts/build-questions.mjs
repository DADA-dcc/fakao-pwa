/**
 * 题库构建脚本：把「源题库」编译为线上发布结构
 *
 * 为什么需要它：
 *   线上 structure = 大科目切块（questions/parts/NN-MM.json，每块 200 题）
 *                  + 小科目单文件（questions/科目.json）
 *                  + 索引 questions/index.json
 *   源题库（完整单文件）不入库，只在本地维护，避免公开仓库体积膨胀。
 *
 * 输出规整（P2-28，只改输出、不动源文件、不改题目顺序与 id）：
 *   选择题 answer 统一为「大写、去重、排序」的字母数组："A,C" / "ca" / ["c","A","A"] → ["A","C"]。
 *
 * 用法：
 *   node scripts/build-questions.mjs                    # 默认源目录 ./source/questions
 *   SOURCE_DIR=/path/to/src node scripts/build-questions.mjs
 */

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = process.env.SOURCE_DIR || path.join(ROOT, "source", "questions");
const OUT = path.join(ROOT, "questions");
const PARTS = path.join(OUT, "parts");

/** 科目顺序与块前缀：前缀必须稳定，否则老用户缓存的分块对不上 */
const SUBJECTS = [
  { name: "民法", prefix: "00", chunked: true },
  { name: "刑法", prefix: "01", chunked: true },
  { name: "行政法", prefix: "02", chunked: true },
  { name: "刑诉法", prefix: "03", chunked: true },
  { name: "民诉法", prefix: "04", chunked: true },
  { name: "知识产权法", prefix: "05", chunked: false },
  { name: "商经法", prefix: "06", chunked: true },
  { name: "宪法", prefix: "07", chunked: false },
  { name: "国际法", prefix: "08", chunked: false },
  { name: "法理学", prefix: "09", chunked: false },
  { name: "法制史", prefix: "10", chunked: false },
  { name: "司法制度与职业道德", prefix: "11", chunked: false },
];

const CHUNK_SIZE = 200;
// 版本号默认由「题库内容哈希」生成：内容不变 → 版本不变（不会白白让用户重下 23MB），
// 内容一变 → 版本必变（缓存键随之更换）。这样可以根除「手写 v12 覆盖线上 v13」的回退事故。
// 确需人工指定时用 QUESTIONS_VERSION=v14 覆盖。
const explicitVersion = process.env.QUESTIONS_VERSION || null;
const contentHash = createHash("sha1");

const mb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

/**
 * P2-28：把选择题 answer 规整为大写字母数组（去重 + 排序）。
 * - 字符串：取 /[A-Fa-f]/g 的全部匹配；数组：逐项同样提取（兼容 ["A,C"] 这类混写）。
 * - 主观题（题型含「主观」或没有选项）的 answer 是文字参考答案，原样保留，避免被抽成字母。
 * - 提取不到任何 A–F 字母时原样保留，交给 validate-questions 报「答案无效」，不在构建时吞掉问题。
 * 返回浅拷贝（answer 保持原字段位置），不修改读入的源对象。
 */
function normalizeAnswerField(q) {
  if (!q || typeof q !== "object" || !Object.prototype.hasOwnProperty.call(q, "answer")) return q;
  const type = String(q.type ?? "");
  const opts = q.options;
  const hasOptions = Array.isArray(opts)
    ? opts.length > 0
    : !!(opts && typeof opts === "object" && Object.keys(opts).length > 0);
  if (type.includes("主观") || !hasOptions) return q;

  const raw = q.answer;
  let letters;
  if (typeof raw === "string") {
    letters = raw.match(/[A-Fa-f]/g) || [];
  } else if (Array.isArray(raw)) {
    letters = raw.flatMap((a) => String(a ?? "").match(/[A-Fa-f]/g) || []);
  } else {
    return q;
  }
  const answer = [...new Set(letters.map((c) => c.toUpperCase()))].sort();
  if (!answer.length) return q;
  return { ...q, answer };
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`缺少源题库目录：${SRC}`);

  await rm(PARTS, { recursive: true, force: true });
  await mkdir(PARTS, { recursive: true });

  const index = { version: null, total: 0, subjects: {} };

  for (const { name, prefix, chunked } of SUBJECTS) {
    const file = path.join(SRC, `${name}.json`);
    if (!existsSync(file)) throw new Error(`缺少科目文件：${file}`);
    const list = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(list) || list.length === 0) throw new Error(`${name} 为空或格式错误`);

    index.total += list.length;

    if (chunked) {
      const parts = [];
      for (let i = 0, c = 0; i < list.length; i += CHUNK_SIZE, c++) {
        // P2-28：写盘前规整答案格式（逐题浅拷贝，顺序与 id 不变）
        const slice = list.slice(i, i + CHUNK_SIZE).map(normalizeAnswerField);
        const rel = `parts/${prefix}-${String(c).padStart(2, "0")}.json`;
        const body = JSON.stringify(slice);
        await writeFile(path.join(OUT, rel), body, "utf8");
        contentHash.update(`${name}/${rel}\n`);
        contentHash.update(body);
        parts.push(rel);
      }
      const bytes = list.reduce((s, q) => s + Buffer.byteLength(JSON.stringify(normalizeAnswerField(q)), "utf8"), 0);
      index.subjects[name] = {
        count: list.length,
        size_mb: mb(bytes),
        parts,
        chunks: parts.length,
      };
    } else {
      // 与线上保持一致：小科目单文件使用 1 空格缩进，便于 diff 与人工核对
      // P2-28：小科目同样在写盘前规整答案格式
      const body = JSON.stringify(list.map(normalizeAnswerField), null, 1) + "\n";
      await writeFile(path.join(OUT, `${name}.json`), body, "utf8");
      contentHash.update(`${name}/${name}.json\n`);
      contentHash.update(body);
      index.subjects[name] = {
        file: `${name}.json`,
        count: list.length,
        size_mb: mb(Buffer.byteLength(body, "utf8")),
      };
    }
    console.log(`  ${name.padEnd(18, " ")} ${String(list.length).padStart(5)} 题  ${chunked ? `分 ${index.subjects[name].chunks} 块` : "单文件"}`);
  }

  const version = explicitVersion || `v${contentHash.digest("hex").slice(0, 8)}`;
  index.version = version;

  // 防回退：现有 index.json 若为 vN 形式，且新版本号小于旧版本号，直接拒绝
  try {
    const prevRaw = await readFile(path.join(OUT, "index.json"), "utf8");
    const prev = JSON.parse(prevRaw);
    const pv = String(prev.version || "");
    const mPrev = pv.match(/^v(\d+)$/);
    const mNew = version.match(/^v(\d+)$/);
    if (mPrev && mNew && Number(mNew[1]) < Number(mPrev[1])) {
      throw new Error(
        `版本回退被拒绝：现有 ${pv}，本次 ${version}。如确需回退，请显式设置 QUESTIONS_VERSION=${version} 并说明原因。`
      );
    }
  } catch (e) {
    if (!String(e.message).includes("版本回退被拒绝")) {
      // 无既有 index.json / 解析失败，视为首次构建，放行
    } else {
      throw e;
    }
  }

  await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 1) + "\n", "utf8");
  console.log(`\n索引已生成：version=${version} total=${index.total}`);
}

main().catch((err) => {
  console.error("构建失败：", err.message);
  process.exit(1);
});