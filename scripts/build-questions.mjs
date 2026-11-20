/**
 * 题库构建脚本：把「源题库」编译为线上发布结构
 *
 * 为什么需要它：
 *   线上 structure = 大科目切块（questions/parts/NN-MM.json，每块 200 题）
 *                  + 小科目单文件（questions/科目.json）
 *                  + 索引 questions/index.json
 *   源题库（完整单文件）不入库，只在本地维护，避免公开仓库体积膨胀。
 *
 * 用法：
 *   node scripts/build-questions.mjs                    # 默认源目录 ./source/questions
 *   SOURCE_DIR=/path/to/src node scripts/build-questions.mjs
 */

import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
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
const version = process.env.QUESTIONS_VERSION || "v12";

const mb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;

async function main() {
  if (!existsSync(SRC)) throw new Error(`缺少源题库目录：${SRC}`);

  await rm(PARTS, { recursive: true, force: true });
  await mkdir(PARTS, { recursive: true });

  const index = { version, total: 0, subjects: {} };

  for (const { name, prefix, chunked } of SUBJECTS) {
    const file = path.join(SRC, `${name}.json`);
    if (!existsSync(file)) throw new Error(`缺少科目文件：${file}`);
    const list = JSON.parse(await readFile(file, "utf8"));
    if (!Array.isArray(list) || list.length === 0) throw new Error(`${name} 为空或格式错误`);

    index.total += list.length;

    if (chunked) {
      const parts = [];
      for (let i = 0, c = 0; i < list.length; i += CHUNK_SIZE, c++) {
        const slice = list.slice(i, i + CHUNK_SIZE);
        const rel = `parts/${prefix}-${String(c).padStart(2, "0")}.json`;
        const body = JSON.stringify(slice);
        await writeFile(path.join(OUT, rel), body, "utf8");
        parts.push(rel);
      }
      const bytes = list.reduce((s, q) => s + Buffer.byteLength(JSON.stringify(q), "utf8"), 0);
      index.subjects[name] = {
        count: list.length,
        size_mb: mb(bytes),
        parts,
        chunks: parts.length,
      };
    } else {
      // 与线上保持一致：小科目单文件使用 1 空格缩进，便于 diff 与人工核对
      const body = JSON.stringify(list, null, 1) + "\n";
      await writeFile(path.join(OUT, `${name}.json`), body, "utf8");
      index.subjects[name] = {
        file: `${name}.json`,
        count: list.length,
        size_mb: mb(Buffer.byteLength(body, "utf8")),
      };
    }
    console.log(`  ${name.padEnd(18, " ")} ${String(list.length).padStart(5)} 题  ${chunked ? `分 ${index.subjects[name].chunks} 块` : "单文件"}`);
  }

  await writeFile(path.join(OUT, "index.json"), JSON.stringify(index, null, 1) + "\n", "utf8");
  console.log(`\n索引已生成：version=${version} total=${index.total}`);
}

main().catch((err) => {
  console.error("构建失败：", err.message);
  process.exit(1);
});