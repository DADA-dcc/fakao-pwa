/**
 * index.html 内联脚本语法校验（P2-29）
 *
 * 用法：
 *   node scripts/check-inline-scripts.mjs            # 默认校验仓库根目录 index.html
 *   node scripts/check-inline-scripts.mjs other.html # 也可指定其他 HTML
 *
 * 做法：
 *   1. 从 HTML 中抽取所有内联 <script> 块（跳过带 src= 的外链脚本；跳过 HTML 注释里的 <script>）；
 *   2. 逐块写入 os.tmpdir() 下的临时目录，用当前 node 执行 `node --check` 做语法校验：
 *      - 经典脚本写成 .cjs（非严格模式，与浏览器经典脚本一致）
 *      - type="module" 写成 .mjs
 *      - application/json、application/ld+json、importmap、speculationrules 用 JSON.parse 校验
 *      - 其他非 JS 类型（如 text/template）跳过并列出
 *   3. 临时文件前面补空行，使报错行号与 HTML 中的行号一致。
 *
 * 退出码：0 = 全部通过；1 = 存在失败（或一个内联脚本都没找到）
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.resolve(ROOT, process.argv[2] || "index.html");
const label = path.relative(ROOT, target) || target;

const JS_TYPES = new Set([
  "",
  "text/javascript",
  "application/javascript",
  "application/x-javascript",
  "text/ecmascript",
  "application/ecmascript",
  "module"
]);
const JSON_TYPES = new Set(["application/json", "application/ld+json", "importmap", "speculationrules"]);

/** 读取属性值（前面必须是空白，避免 data-src 被当成 src） */
function attr(attrs, name) {
  const m = attrs.match(new RegExp("(?:^|\\s)" + name + "\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))", "i"));
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
}

function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

/** 顺序扫描：注释整段吞掉；<script> 整段吞掉（脚本内容里的 "<!--" 不会被当成注释） */
function extractScripts(html) {
  const blocks = [];
  const re = /<!--[\s\S]*?-->|<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith("<!--")) continue;
    const attrs = m[1] || "";
    const code = m[2];
    const contentIndex = m.index + m[0].indexOf(">") + 1;
    blocks.push({
      attrs,
      code,
      line: lineAt(html, contentIndex),
      id: attr(attrs, "id"),
      src: attr(attrs, "src"),
      type: (attr(attrs, "type") || "").trim().toLowerCase()
    });
  }
  return blocks;
}

function main() {
  let html;
  try {
    html = readFileSync(target, "utf8");
  } catch (err) {
    console.error(`无法读取 ${label}：${err.message}`);
    return 1;
  }

  const all = extractScripts(html);
  const inline = all.filter((b) => b.src === null);
  const skipped = [];
  const failures = [];
  let checked = 0;

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "fk-inline-scripts-"));
  try {
    inline.forEach((b, i) => {
      const no = i + 1;
      const where = `#${no}（${label} 第 ${b.line} 行起${b.id ? `，id="${b.id}"` : ""}）`;

      if (!b.code.trim()) {
        skipped.push(`${where}：空脚本`);
        return;
      }

      if (JSON_TYPES.has(b.type)) {
        checked++;
        try {
          JSON.parse(b.code);
        } catch (err) {
          failures.push(`${where} [${b.type}] JSON 解析失败：${err.message}`);
        }
        return;
      }

      if (!JS_TYPES.has(b.type)) {
        skipped.push(`${where}：type="${b.type}" 非 JS，跳过`);
        return;
      }

      checked++;
      const ext = b.type === "module" ? ".mjs" : ".cjs";
      const file = path.join(tmpDir, `inline-${String(no).padStart(2, "0")}${ext}`);
      // 补齐前导空行：node 报错的行号 = HTML 中的行号
      writeFileSync(file, "\n".repeat(b.line - 1) + b.code, "utf8");

      const res = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
      if (res.error) {
        failures.push(`${where} 无法启动 node --check：${res.error.message}`);
      } else if (res.status !== 0) {
        const detail = String(res.stderr || res.stdout || "").split(file).join(`${label}#${no}`).trim();
        failures.push(`${where} 语法错误：\n${detail}`);
      }
    });
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  console.log(`内联脚本校验：${label}`);
  console.log(`发现 <script> ${all.length} 个，其中内联 ${inline.length} 个，实际校验 ${checked} 个`);
  if (skipped.length) {
    console.log("跳过：");
    for (const s of skipped) console.log(`  - ${s}`);
  }

  if (!inline.length) {
    // P2-24：index.html 的内联脚本已外置为 assets/inline-*.js，此时转为校验这些外置文件的语法。
    let externals = [];
    try {
      const html = readFileSync(target, "utf8");
      externals = [...html.matchAll(/<script[^>]*\bsrc="([^"]*inline-[^"]*\.js)"/g)].map((m) => m[1]);
    } catch (e) {
      externals = [];
    }
    if (!externals.length) {
      console.error("未找到任何内联 <script>，也没有找到 assets/inline-*.js 外置引用，抽取逻辑可能已失效。");
      return 1;
    }
    let externalsFail = 0;
    for (const rel of externals) {
      const abs = path.resolve(path.dirname(target), rel);
      const res = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" });
      if (res.error || res.status !== 0) {
        externalsFail++;
        console.error(`✗ ${rel} 语法错误：\n${String(res.stderr || res.stdout || res.error || "").trim()}`);
      }
    }
    if (externalsFail) return 1;
    console.log(`✓ 已无内联 <script>（P2-24 已外置），${externals.length} 个外置脚本语法全部通过`);
    return 0;
  }
  if (failures.length) {
    console.error(`\n失败 ${failures.length} 个：`);
    for (const f of failures) console.error(`\n✗ ${f}`);
    return 1;
  }
  console.log(`✓ ${checked} 个内联脚本块全部通过`);
  return 0;
}

process.exitCode = main();
