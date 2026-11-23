/**
 * 题库完整性校验脚本
 *
 * 用法：
 *   node scripts/validate-questions.mjs
 *
 * 校验范围：questions/index.json 中登记的全部分片（大科目 parts/NN-MM.json + 小科目单文件）
 * 检查项：
 *   1) 必有字段：题号、科目、题型、题干（非空）、解析（非空）、答案
 *   2) 选择题（单选/多选/不定项）：有 options、选项 ≥ 2、答案含有效字母、答案字母都在选项内
 *      + 答案个数与题型一致（P2-28，type = "answer-count"）：单选 === 1；多选/不定项 ≥ 2；主观题跳过
 *   3) 同一科目内题号不重复
 *   4) AI 解析（ai3 / analysis_ai）存在时四个子字段不得全空
 * 退出码：0 = 无错误；1 = 存在错误
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUESTIONS_DIR = path.join(ROOT, "questions");
const INDEX_PATH = path.join(QUESTIONS_DIR, "index.json");

const CHOICE_TYPES = ["单选", "多选", "不定项"];

/** 读取并解析 JSON，失败时抛出带文件名的错误 */
async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

/** 字段存在（允许 0/空串，用于“必有字段”判定） */
function hasField(obj, key) {
  return obj[key] !== undefined && obj[key] !== null;
}

function isBlank(value) {
  return !String(value ?? "").trim();
}

/** 把答案统一成选项字母数组："A,C,D" / "ACD" / ["A","C"] -> ["A","C","D"] */
function normalizeAnswerLetters(answer) {
  const raw = Array.isArray(answer) ? answer.join("") : String(answer ?? "");
  return raw.toUpperCase().replace(/[^A-F]/g, "").split("").filter(Boolean);
}

/** 选项统一成 [key, text] 列表，支持对象 {A:...} 与数组 [{id,text}] */
function normalizeOptions(options) {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map((item, i) => {
      if (typeof item === "string") {
        const m = item.trim().match(/^([A-F])[.、．:：\s]+(.*)$/i);
        if (m) return [m[1].toUpperCase(), m[2]];
        return [String.fromCharCode(65 + i), item];
      }
      return [
        String(item.id || item.key || item.label || String.fromCharCode(65 + i)).toUpperCase(),
        String(item.text ?? item.content ?? item.label ?? "")
      ];
    });
  }
  if (typeof options === "object") {
    return Object.entries(options).map(([k, v]) => [String(k).toUpperCase(), String(v ?? "")]);
  }
  return [];
}

/** 取 AI 解析对象：兼容 ai3 与实际数据中的 analysis_ai */
function getAiAnalysis(q) {
  const ai = q.ai3 || q.analysis_ai;
  return ai && typeof ai === "object" ? ai : null;
}

/** 四个子字段：考点拆解 / 易错陷阱 / 法条依据 / 备注 */
function getAiParts(ai) {
  return [
    ai["考点拆解"] ?? ai.point,
    ai["易错陷阱"] ?? ai.trap,
    ai["法条依据"] ?? ai.law,
    ai["备注"] ?? ai.remark ?? ai.note ?? ai.memo
  ];
}

async function main() {
  const index = await readJson(INDEX_PATH);
  const subjects = index.subjects && typeof index.subjects === "object" ? index.subjects : {};

  if (!Object.keys(subjects).length) {
    console.error("questions/index.json 中没有 subjects，无法校验。");
    process.exitCode = 1;
    return;
  }

  const errors = [];
  const subjectCounts = new Map();
  const seenIds = new Map(); // id -> { subject, path }（全局唯一：前端 getQById 用全局 Map 按 String(id) 查找）
  let total = 0;
  let fileCount = 0;

  const addError = (type, file, qid, message) => {
    errors.push({ type, file, qid, message });
  };

  for (const [subjectName, meta] of Object.entries(subjects)) {
    const entries = Array.isArray(meta.parts)
      ? meta.parts
      : (meta.file ? [meta.file] : []);

    if (!entries.length) {
      addError("索引缺少文件", "questions/index.json", "-", `科目「${subjectName}」没有 parts 或 file`);
      continue;
    }

    for (const entry of entries) {
      const relPath = path.posix.join("questions", entry);
      const absPath = path.join(QUESTIONS_DIR, entry);
      fileCount++;

      let list;
      try {
        list = await readJson(absPath);
      } catch (err) {
        addError("文件读取失败", relPath, "-", err.message);
        continue;
      }

      if (!Array.isArray(list)) {
        addError("文件不是数组", relPath, "-", "顶层结构必须是题目数组");
        continue;
      }

      for (const q of list) {
        total++;
        const qid = q && (q.id ?? q.qid ?? q.no ?? q.number);
        const qidText = qid === undefined || qid === null ? "(无题号)" : String(qid);
        subjectCounts.set(subjectName, (subjectCounts.get(subjectName) || 0) + 1);

        // 1) 必有字段
        if (!hasField(q, "id") && !hasField(q, "qid") && !hasField(q, "no") && !hasField(q, "number")) {
          addError("缺少字段:题号", relPath, qidText, "缺少题号字段");
        }
        // P2-21：题号必须是正整数 —— 前端缺 id 会兜底成 Q_<合并后位置>，随加载顺序漂移，导致进度错位
        if (qid !== undefined && qid !== null) {
          const idNum = Number(qid);
          if (!Number.isInteger(idNum) || idNum <= 0) {
            addError("题号非法", relPath, qidText, `题号必须是正整数，实际为 "${qid}"`);
          }
        }
        if (!hasField(q, "subject") || isBlank(q.subject)) {
          addError("缺少字段:科目", relPath, qidText, "缺少科目或为空");
        }
        if (!hasField(q, "type") || isBlank(q.type)) {
          addError("缺少字段:题型", relPath, qidText, "缺少题型或为空");
        }

        const title = q.question ?? q.title ?? q.stem;
        if (!hasField(q, "question") && !hasField(q, "title") && !hasField(q, "stem")) {
          addError("缺少字段:题干", relPath, qidText, "缺少题干字段");
        } else if (isBlank(title)) {
          addError("题干为空", relPath, qidText, "题干为空字符串");
        }

        const analysis = q.analysis ?? q.explanation;
        if (!hasField(q, "analysis") && !hasField(q, "explanation")) {
          addError("缺少字段:解析", relPath, qidText, "缺少解析字段");
        } else if (isBlank(analysis)) {
          addError("解析为空", relPath, qidText, "解析为空字符串");
        }

        if (!hasField(q, "answer") && !hasField(q, "correctAnswer")) {
          addError("缺少字段:答案", relPath, qidText, "缺少答案字段");
        }

        // 2) 选择题：选项数量与答案指向
        const type = String(q.type ?? "");
        const isChoice = CHOICE_TYPES.some((t) => type.includes(t));
        if (isChoice) {
          if (!hasField(q, "options")) {
            addError("缺少字段:选项", relPath, qidText, "选择题缺少 options");
          } else {
            const options = normalizeOptions(q.options);
            if (options.length < 2) {
              addError("选项数量不足", relPath, qidText, `选择题仅 ${options.length} 个选项，要求 ≥ 2`);
            }
            const optionKeys = new Set(options.map(([key]) => key));
            const answerLetters = normalizeAnswerLetters(q.answer ?? q.correctAnswer);
            if (!answerLetters.length) {
              addError("答案无效", relPath, qidText, "选择题答案为空或不含选项字母");
            } else {
              const invalid = answerLetters.filter((letter) => !optionKeys.has(letter));
              if (invalid.length) {
                addError(
                  "答案指向不存在的选项",
                  relPath,
                  qidText,
                  `答案包含不存在的选项：${[...new Set(invalid)].join("、")}（现有 ${[...optionKeys].join("")}）`
                );
              }

              // P2-28：答案个数与题型一致（按去重后的字母计；主观题不在 CHOICE_TYPES，不会进到这里）
              const answerCount = new Set(answerLetters).size;
              const answerText = [...new Set(answerLetters)].join("");
              if (type.includes("多选") || type.includes("不定项")) {
                if (answerCount < 2) {
                  addError("answer-count", relPath, qidText, `「${type}」答案应 ≥ 2 个选项，实际 ${answerCount} 个（${answerText}）`);
                }
              } else if (type.includes("单选")) {
                if (answerCount !== 1) {
                  addError("answer-count", relPath, qidText, `「单选」答案应恰好 1 个选项，实际 ${answerCount} 个（${answerText}）`);
                }
              }
            }
          }
        }

        // 3) 题号全局唯一（前端 getQById 用 String(id) 建全局 Map，跨科目重复会导致跳题/进度错位）
        if (qid !== undefined && qid !== null) {
          const idKey = String(qid);
          const prev = seenIds.get(idKey);
          if (prev) {
            addError("题号重复", relPath, qidText, `题号 ${idKey} 与「${prev.subject}」的 ${prev.path} 重复；id 必须全局唯一`);
          } else {
            seenIds.set(idKey, { subject: subjectName, path: relPath });
          }
        }

        // 4) AI 解析：若存在，四个子字段不得全空
        const ai = getAiAnalysis(q);
        if (ai) {
          const parts = getAiParts(ai);
          if (parts.every((part) => isBlank(part))) {
            addError("AI解析全空", relPath, qidText, "ai3/analysis_ai 的考点拆解、易错陷阱、法条依据、备注全部为空");
          }
        }
      }
    }
  }

  const grouped = new Map();
  for (const err of errors) grouped.set(err.type, (grouped.get(err.type) || 0) + 1);

  console.log("题库完整性校验");
  console.log(`索引版本: ${index.version ?? "(未声明)"}  索引声明总题数: ${index.total ?? "(未声明)"}`);
  console.log(`实际扫描文件: ${fileCount} 个`);
  console.log(`实际题目总数: ${total}`);
  console.log("");
  console.log("各科目题数:");
  for (const [subject, count] of subjectCounts) console.log(`  ${subject}: ${count}`);
  console.log("");
  console.log(`错误总数: ${errors.length}`);
  if (grouped.size) {
    console.log("错误按类型分组:");
    for (const [type, count] of [...grouped.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`);
    }
  }
  console.log("");
  if (errors.length) {
    console.log("前 20 条错误明细:");
    errors.slice(0, 20).forEach((err, i) => {
      console.log(`  ${i + 1}. [${err.file}] 题号 ${err.qid} — ${err.type}：${err.message}`);
    });
  } else {
    console.log("未发现错误。");
  }

  process.exitCode = errors.length ? 1 : 0;
}

main().catch((err) => {
  console.error("校验脚本执行失败：", err.message);
  process.exitCode = 1;
});
