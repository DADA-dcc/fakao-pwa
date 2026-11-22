/**
 * Cloudflare Pages Function: POST /api/structure
 *
 * 作用：把「网页正文（Markdown）」转成法考题目结构化 JSON（法条/要件/口诀三段式）。
 *      与 /api/extract 配合：先抓网页，再结构化。
 *
 * 环境变量：
 *   DEEPSEEK_API_KEY   必填
 *   DEEPSEEK_MODEL     可选，默认 deepseek-chat
 *
 * 请求体：
 *   {
 *     markdown: string,          // 必填，网页正文（<=30000 字）
 *     subject: string,           // 必填，科目（民法/刑法/...）
 *     type?: "单选"|"多选",       // 默认单选
 *     year?: number,             // 可选，真题年份
 *     difficulty?: "基础"|"进阶"|"挑战",
 *     sourceURL?: string         // 可选，记录来源
 *   }
 * 响应：{ question: {...} } 或 { error }
 */

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const MAX_BODY_BYTES = 300 * 1024;
const MAX_MARKDOWN_CHARS = 30000;
const RATE_LIMIT_PER_MINUTE = 10;
const FETCH_TIMEOUT_MS = 60000;

const memoryHits = new Map();

const SYSTEM_PROMPT = `你是国家统一法律职业资格考试（法考）命题专家，负责把法条、案例、讲义类材料改写成一道可练习的客观题，并给出三段式解析。

严格遵守：
1. 只输出一个 JSON 对象，不要任何解释文字、不要 Markdown 代码块围栏。
2. 题干必须是一个有明确考点的情境题（当事人+行为+问"下列哪一说法正确"），不要直接抄原文段落。
3. 选项 A-D 互斥且只有一个正确；错误项要对应常见误区。
4. 解析必须指出法条依据（写具体条文号，如《民法典》第577条）。
5. 不得虚构不存在的法条；材料不足时，宁可保守引用材料中出现的法条。`;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

function isAllowedOrigin(request) {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch (e) {
    return false;
  }
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function isRateLimited(env, ip) {
  const key = `${ip}:${Math.floor(Date.now() / 60000)}`;
  if (env && env.STRUCTURE_RATE_LIMIT_KV) {
    try {
      const cur = parseInt((await env.STRUCTURE_RATE_LIMIT_KV.get(key)) || "0", 10);
      if (cur >= RATE_LIMIT_PER_MINUTE) return true;
      await env.STRUCTURE_RATE_LIMIT_KV.put(key, String(cur + 1), { expirationTtl: 120 });
      return false;
    } catch (e) {
      return false;
    }
  }
  const hits = (memoryHits.get(key) || 0) + 1;
  memoryHits.set(key, hits);
  if (memoryHits.size > 5000) memoryHits.clear();
  return hits > RATE_LIMIT_PER_MINUTE;
}

function buildUserPrompt(payload) {
  const { markdown, subject, type, year, difficulty, sourceURL } = payload;
  return `请根据下面材料，出一道【${subject}】科目的【${type}】题${year ? `（真题年份参考：${year}）` : ""}，难度【${difficulty}】。

输出 JSON 结构（严格按此字段）：
{
  "question": "题干（情境化，100-200字）",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "answer": "A",
  "analysis": "完整解析：先结论，再讲法条与理由，150-300字",
  "analysis_ai": {
    "point": "本题考点（一句话）",
    "trap": "命题陷阱（一句话）",
    "law": "《XX法》第X条"
  }
}
${sourceURL ? `\n材料来源：${sourceURL}` : ""}

=== 材料开始 ===
${markdown}
=== 材料结束 ===`;
}

function validate(q, payload) {
  const problems = [];
  if (!q || typeof q !== "object") return ["输出不是对象"];
  if (typeof q.question !== "string" || q.question.trim().length < 20) problems.push("题干过短或缺失");
  const opts = q.options;
  if (!opts || typeof opts !== "object") problems.push("缺少 options");
  else {
    const keys = Object.keys(opts);
    if (keys.length < 2) problems.push("选项少于 2 个");
    for (const k of keys) {
      if (typeof opts[k] !== "string" || !opts[k].trim()) problems.push(`选项 ${k} 为空`);
    }
    if (!keys.includes(q.answer)) problems.push("answer 不在选项键中");
    if (payload.type === "单选" && keys.length !== 4) problems.push("单选题应为 4 个选项");
  }
  if (typeof q.analysis !== "string" || q.analysis.trim().length < 30) problems.push("解析过短");
  const ai = q.analysis_ai || {};
  if (!ai.point) problems.push("缺少 analysis_ai.point");
  if (!ai.law) problems.push("缺少 analysis_ai.law");
  return problems;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) return jsonResponse({ error: "不允许的来源" }, 403);

  const ip = getClientIp(request);
  if (await isRateLimited(env, ip)) return jsonResponse({ error: "请求过于频繁，请稍后再试" }, 429);

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "请求体过大" }, 413);
    payload = JSON.parse(raw || "{}");
  } catch (e) {
    return jsonResponse({ error: "请求体不是合法 JSON" }, 400);
  }

  const markdown = typeof payload.markdown === "string" ? payload.markdown.trim() : "";
  const subject = typeof payload.subject === "string" ? payload.subject.trim() : "";
  if (!markdown) return jsonResponse({ error: "缺少 markdown（网页正文）" }, 400);
  if (!subject) return jsonResponse({ error: "缺少 subject（科目）" }, 400);
  if (markdown.length > MAX_MARKDOWN_CHARS) {
    return jsonResponse({ error: `正文过长（上限 ${MAX_MARKDOWN_CHARS} 字），请裁剪后重试` }, 413);
  }

  payload.type = payload.type === "多选" ? "多选" : "单选";
  payload.difficulty = ["基础", "进阶", "挑战"].includes(payload.difficulty) ? payload.difficulty : "基础";

  if (!env || !env.DEEPSEEK_API_KEY) {
    return jsonResponse({ error: "服务端未配置 DEEPSEEK_API_KEY，结构化暂不可用。" }, 503);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  let upstream;
  try {
    upstream = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(payload) }
        ],
        temperature: 0.4,
        max_tokens: 1600,
        response_format: { type: "json_object" }
      }),
      signal: ctrl.signal
    });
  } catch (err) {
    return jsonResponse({ error: err?.name === "AbortError" ? "结构化超时（60 秒）" : "上游 AI 连接失败" }, 502);
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok) return jsonResponse({ error: `上游 AI 返回 ${upstream.status}` }, 502);

  let data;
  try {
    data = await upstream.json();
  } catch (e) {
    return jsonResponse({ error: "上游返回无法解析" }, 502);
  }

  const content = data?.choices?.[0]?.message?.content || "";
  let q;
  try {
    q = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  } catch (e) {
    return jsonResponse({ error: "AI 输出不是合法 JSON，请重试", raw: content.slice(0, 500) }, 422);
  }

  const problems = validate(q, payload);
  if (problems.length) {
    return jsonResponse({ error: "AI 输出未通过校验：" + problems.join("；"), raw: q }, 422);
  }

  const item = {
    subject,
    type: payload.type,
    ...(Number.isInteger(payload.year) ? { year: payload.year } : {}),
    question: q.question.trim(),
    options: q.options,
    answer: q.answer,
    analysis: q.analysis.trim(),
    difficulty: payload.difficulty,
    analysis_ai: {
      point: q.analysis_ai.point,
      trap: q.analysis_ai.trap || "",
      law: q.analysis_ai.law,
      _meta: {
        provider: "deepseek-structure",
        at: new Date().toISOString(),
        sourceURL: payload.sourceURL || "",
        model: env.DEEPSEEK_MODEL || "deepseek-chat"
      }
    }
  };

  return jsonResponse({ question: item });
}

export function onRequestGet() {
  return jsonResponse({ error: "请用 POST 提交 { markdown, subject }" }, 405);
}
