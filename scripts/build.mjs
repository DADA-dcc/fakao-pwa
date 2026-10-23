/**
 * 构建脚本：把「需要公开发布的文件」复制到 dist/
 *
 * 为什么需要它：
 *   仓库根目录混着 audit/（内部审计脚本）、docs/（设计文档）、
 *   .playwright-mcp/（调试快照）等不该公开的东西。
 *   直接把根目录当 Cloudflare Pages 输出目录，这些全会变成公开可下载的文件。
 *
 * 用法：
 *   node scripts/build.mjs
 *   然后 Cloudflare Pages 构建命令填 `node scripts/build.mjs`，输出目录填 `dist`
 */

import { cp, mkdir, rm, readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

// 需要发布到站点的顶层条目
const INCLUDE = [
  "index.html",
  "cover.html",
  "manifest.json",
  "sw.js",
  "icon-192.png",
  "icon-512.png",
  "robots.txt",
  "sitemap.xml",
  "knowledge.json",
  "case_library.json",
  "questions",
  "vendor",
  "preview",
  "_headers"
];

// 可选：存在才复制，缺失不报错
const OPTIONAL = ["fakao-enhance.js", "morph-loop.html", "showreel.html"];

async function copyEntry(name, required) {
  const src = path.join(ROOT, name);
  if (!existsSync(src)) {
    if (required) throw new Error(`缺少必需文件：${name}`);
    return { name, skipped: true };
  }
  const dest = path.join(DIST, name);
  await cp(src, dest, { recursive: true });
  return { name, skipped: false };
}

async function dirSize(dir) {
  let total = 0;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) total += await dirSize(full);
    else total += (await stat(full)).size;
  }
  return total;
}

async function main() {
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  const copied = [];
  const skipped = [];

  for (const name of INCLUDE) {
    const r = await copyEntry(name, true);
    if (r.skipped) skipped.push(name);
    else copied.push(name);
  }
  for (const name of OPTIONAL) {
    const r = await copyEntry(name, false);
    if (r.skipped) skipped.push(name);
    else copied.push(name);
  }

  const bytes = await dirSize(DIST);
  console.log(`构建完成：dist/ 共 ${copied.length} 个顶层条目，${(bytes / 1024 / 1024).toFixed(1)} MB`);
  if (skipped.length) console.log(`跳过（不存在）：${skipped.join(", ")}`);
  console.log(`已发布：${copied.join(", ")}`);
}

main().catch((err) => {
  console.error("构建失败：", err.message);
  process.exit(1);
});
