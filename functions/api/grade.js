/**
 * Cloudflare Pages Function: POST /api/grade
 *
 * 作用：把「主观题（卷四）作答」交给 DeepSeek 按采分点批改，返回结构化 JSON。
 *      Key 只存在 Cloudflare 环境变量，前端不接触密钥。
 *
 * 环境变量（Cloudflare Pages → Settings → Environment variables）：
 *   DEEPSEEK_API_KEY   必填
 *   DEEPSEEK_MODEL     可选，默认 deepseek-chat
 *   AI_RATE_LIMIT_KV   可选，KV 绑定名；未绑定则退化为单实例内存限流
 *
 * 请求体（application/json）：
 * {
 *   "question":  "题干/案情……",            // 必填
 *   "reference": "参考答案/采分点原文……",  // 建议填，用于对照
 *   "answer":    "考生作答正文……",          // 必填
 *   "points":    ["采分点1","采分点2", ...] // 可选，显式采分点；不填则由 AI 归纳
 *   "maxScore":  10                          // 可选，满分，默认 10
 * }
 *
 * 响应（200）：
 * {
 *   "score": 6.5, "maxScore": 10, "level": "及格",
 *   "pointHits": [ { "point": "……", "hit": true, "score": 2, "comment": "……" } ],
 *   "problems": ["失分点……"],
 *   "suggestions": ["改进建议……"],
 *   "lawBasis": ["《民法典》第692条"],
 *   "summary": "一句话总评"
 * }
 * 错误：{ "error": "……" } + 相应状态码
 */

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT =
  "你是国家统一法律职业资格考试（法考）主观题阅卷组老师。请严格按照采分点给考生作答打分，结论克制、客观，只依据现行法律与通说，不臆造法条。";

const MAX_BODY_BYTES = 48 * 1024;
const RATE_LIMIT_PER_MINUTE = 15;
const MAX_TOTAL_CHARS = 12000;
const memoryHits = new Map();

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function getClientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

async function isRateLimited(env, ip) {
  const windowKey = `${ip}:${Math.floor(Date.now() / 60000)}`;
  if (env && env.AI_RATE_LIMIT_KV) {
    try {
      const current = parseInt((await env.AI_RATE_LIMIT_KV.get(windowKey)) || "0", 10);
      if (current >= RATE_LIMIT_PER_MINUTE) return true;
      await env.AI_RATE_LIMIT_KV.put(windowKey, String(current + 1), { expirationTtl: 120 });
      return false;
    } catch (err) {
      return false;
    }
  }
  const now = Date.now();
  const hits = (memoryHits.get(windowKey) || 0) + 1;
  memoryHits.set(windowKey, hits);
  if (memoryHits.size > 5000) {
    for (const key of memoryHits.keys()) {
      const stamp = parseInt(key.split(":")[1], 10);
      if (!stamp || now - stamp * 60000 > 120000) memoryHits.delete(key);
    }
  }
  return hits > RATE_LIMIT_PER_MINUTE;
}

// 构造要求“严格 JSON 输出”的提示
function buildUserPrompt({ question, reference, answer, points, maxScore }) {
  const pointsBlock = Array.isArray(points) && points.length
    ? `\n【参考采分点】\n${points.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
    : "";
  return `请对下面这道法考主观题的考生作答进行批改。

【满分】${maxScore} 分
【题干/案情】
${question}
${reference ? `\n【参考答案/采分点原文】\n${reference}` : ""}
${pointsBlock}

【考生作答】
${answer}

批改要求：
1) 先依据题干与参考答案，自行拆解出 3–6 条采分点（若已给出采分点则直接使用）。
2) 逐条判断考生是否命中，给出该条得分与简短点评。
3) 汇总失分点(problems)与可执行的改进建议(suggestions)。
4) 若涉及具体法条，在 lawBasis 列出（如"《民法典》第692条"），不确定的不要编造。
5) 只输出 JSON，不要输出任何解释性文字或代码块围栏。JSON 结构必须严格如下：
{
  "score": <number, 0 到 ${maxScore}>,
  "maxScore": ${maxScore},
  "level": "<优秀|良好|及格|不及格>",
  "pointHits": [ { "point": "<采分点>", "hit": <true|false>, "score": <number>, "comment": "<点评>" } ],
  "problems": ["<失分点>"],
  "suggestions": ["<改进建议>"],
  "lawBasis": ["<法条>"],
  "summary": "<一句话总评>"
}`;
}

// 从模型返回文本中稳健地提取 JSON（去掉 ```json 围栏 / 前后噪声）
function extractJson(text) {
  if (typeof text !== "string") return null;
  let t = text.trim();
  // 去代码围栏
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(t);
  } catch (e) {
    // 抓第一个 { 到最后一个 }
    const s = t.indexOf("{");
    const eIdx = t.lastIndexOf("}");
    if (s >= 0 && eIdx > s) {
      try {
        return JSON.parse(t.slice(s, eIdx + 1));
      } catch (e2) {
        return null;
      }
    }
    return null;
  }
}

// 规范化 & 兜底，保证前端拿到的字段稳定可用
function normalize(obj, maxScore) {
  if (!obj || typeof obj !== "object") return null;
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  let score = num(obj.score);
  if (score === null) score = 0;
  score = Math.max(0, Math.min(maxScore, score));

  const pointHits = Array.isArray(obj.pointHits)
    ? obj.pointHits.map((p) => ({
        point: String(p?.point || "").slice(0, 500),
        hit: !!p?.hit,
        score: num(p?.score) ?? 0,
        comment: String(p?.comment || "").slice(0, 500)
      }))
    : [];

  return {
    score: Math.round(score * 10) / 10,
    maxScore,
    level: String(obj.level || "").slice(0, 10) || (score >= maxScore * 0.85 ? "优秀" : score >= maxScore * 0.7 ? "良好" : score >= maxScore * 0.6 ? "及格" : "不及格"),
    pointHits,
    problems: Array.isArray(obj.problems) ? obj.problems.map((x) => String(x).slice(0, 300)).slice(0, 10) : [],
    suggestions: Array.isArray(obj.suggestions) ? obj.suggestions.map((x) => String(x).slice(0, 300)).slice(0, 10) : [],
    lawBasis: Array.isArray(obj.lawBasis) ? obj.lawBasis.map((x) => String(x).slice(0, 120)).slice(0, 12) : [],
    summary: String(obj.summary || "").slice(0, 500)
  };
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env || !env.DEEPSEEK_API_KEY) {
    return jsonResponse({ error: "服务端未配置 DEEPSEEK_API_KEY，AI 批改暂不可用。" }, 503);
  }

  const ip = getClientIp(request);
  if (await isRateLimited(env, ip)) {
    return jsonResponse({ error: "请求过于频繁，请稍后再试。" }, 429);
  }

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse({ error: "请求内容过大。" }, 413);
    payload = JSON.parse(raw);
  } catch (e) {
    return jsonResponse({ error: "请求体不是合法 JSON。" }, 400);
  }

  const question = typeof payload?.question === "string" ? payload.question.trim() : "";
  const reference = typeof payload?.reference === "string" ? payload.reference.trim() : "";
  const answer = typeof payload?.answer === "string" ? payload.answer.trim() : "";
  const points = Array.isArray(payload?.points) ? payload.points.filter((x) => typeof x === "string") : [];
  const maxScore = typeof payload?.maxScore === "number" && payload.maxScore > 0 && payload.maxScore <= 100 ? payload.maxScore : 10;

  if (!question) return jsonResponse({ error: "缺少 question 字段。" }, 400);
  if (!answer) return jsonResponse({ error: "作答为空，请先作答再批改。" }, 400);
  if (question.length + reference.length + answer.length + points.join("").length > MAX_TOTAL_CHARS) {
    return jsonResponse({ error: "内容过长。" }, 413);
  }

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
          { role: "user", content: buildUserPrompt({ question, reference, answer, points, maxScore }) }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
        max_tokens: 1500
      })
    });
  } catch (e) {
    return jsonResponse({ error: "上游 AI 服务连接失败。" }, 502);
  }

  if (!upstream.ok) {
    return jsonResponse({ error: `上游 AI 服务返回 ${upstream.status}。` }, 502);
  }

  let data;
  try {
    data = await upstream.json();
  } catch (e) {
    return jsonResponse({ error: "上游返回内容无法解析。" }, 502);
  }

  const content = data?.choices?.[0]?.message?.content;
  const parsed = extractJson(content);
  const result = normalize(parsed, maxScore);
  if (!result) {
    return jsonResponse({ error: "AI 未返回可解析的批改结果，请重试。" }, 502);
  }

  return jsonResponse(result);
}

export async function onRequest(context) {
  if (context.request.method === "POST") return onRequestPost(context);
  return jsonResponse({ error: "Method Not Allowed" }, 405);
}
