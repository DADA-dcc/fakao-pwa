/**
 * 内联脚本内容哈希重算（P2-24 配套）
 *
 * 改过 assets/inline-N.js 内容后必须运行本脚本：把文件名里的 <hash8> 更新为当前内容哈希，
 * 并同步更新 index.html 与 sw.js 的引用。否则 _headers 的 immutable 会让 CDN 一直返回旧内容。
 *
 * 用法：node scripts/rehash-inline.mjs
 */
import { readFileSync, writeFileSync, renameSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = path.join(ROOT, "assets");
const idxPath = path.join(ROOT, "index.html");
const swPath = path.join(ROOT, "sw.js");
let idx = readFileSync(idxPath, "utf8");
let sw = readFileSync(swPath, "utf8");

const files = readdirSync(ASSETS).filter((f) => /^inline-\d+\.[0-9a-f]{8}\.js$/.test(f));
let changed = 0;
for (const f of files) {
  const n = f.match(/^inline-(\d+)\.([0-9a-f]{8})\.js$/)[1];
  const buf = readFileSync(path.join(ASSETS, f));
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 8);
  const target = `inline-${n}.${hash}.js`;
  if (target !== f) {
    renameSync(path.join(ASSETS, f), path.join(ASSETS, target));
    idx = idx.split(f).join(target);
    sw = sw.split(f).join(target);
    console.log(`  ${f} -> ${target}`);
    changed++;
  }
}
writeFileSync(idxPath, idx, "utf8");
writeFileSync(swPath, sw, "utf8");
console.log(changed ? `✓ 重命名 ${changed} 个内联脚本并更新引用` : "✓ 内联脚本哈希均为最新，无需改动");
