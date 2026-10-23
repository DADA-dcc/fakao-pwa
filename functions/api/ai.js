/**
 * Cloudflare Pages Function: POST /api/ai
 *
 * 作用：把 DeepSeek 请求从浏览器搬到边缘函数，API Key 只存在 Cloudflare 环境变量里，
 *      前端不再接触密钥，普通用户也不需要自己申请 Key。
 *
 * 环境变量（Cloudflare Pages → Settings → Environment variables）：
 *   DEEPSEEK_API_KEY   必填，DeepSeek 平台申请的 key
 *   DEEPSEEK_MODEL     可选，默认 deepseek-chat
 *   AI_RATE_LIMIT_KV   可选，KV 命名空间绑定名（未绑定则退化为单实例内存限流）
 *
 * 请求体：{ prompt: string, followup?: string }
 * 响应：  { content: string } 或 { error: string }
 */

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";

const SYSTEM_PROMPT =
  "你是一位资深的国家统一法律职业资格考试（法考）辅导名师，擅长提炼题眼、拆解请求权基础与犯罪构成要件。";

// 单次请求体上限，防止有人拿这个接口当免费通用 API 刷
const MAX_BODY_BYTES = 32 * 1024;
// 每 IP 每分钟请求数上限
const RATE_LIMIT_PER_MINUTE = 20;
// prompt 长度上限
const MAX_PROMPT_CHARS = 8000;

// KV 未绑定时使用的进程内兜底计数（best-effort，多实例下不精确）
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
      // KV 异常时不阻断正常用户
      return false;
    }
  }

  // 内存兜底
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

function buildUserPrompt(prompt, followup) {
  if (followup) {
    return `${prompt}\n考生追问：${followup}\n请用简明扼要的法考应试语言解答考生的追问。`;
  }
  return `${prompt}\n请从【命题陷阱】【请求权基础/构成要件】【同类题秒杀口诀】三个维度进行精炼拆解。`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env || !env.DEEPSEEK_API_KEY) {
    return jsonResponse(
      { error: "服务端未配置 DEEPSEEK_API_KEY，AI 解析暂不可用。" },
      503
    );
  }

  const ip = getClientIp(request);
  if (await isRateLimited(env, ip)) {
    return jsonResponse({ error: "请求过于频繁，请稍后再试。" }, 429);
  }

  let payload;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return jsonResponse({ error: "请求内容过大。" }, 413);
    }
    payload = JSON.parse(raw);
  } catch (err) {
    return jsonResponse({ error: "请求体不是合法 JSON。" }, 400);
  }

  const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
  const followup = typeof payload?.followup === "string" ? payload.followup.trim() : "";

  if (!prompt) {
    return jsonResponse({ error: "缺少 prompt 字段。" }, 400);
  }
  if (prompt.length + followup.length > MAX_PROMPT_CHARS) {
    return jsonResponse({ error: "题目内容过长。" }, 413);
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
          { role: "user", content: buildUserPrompt(prompt, followup) }
        ],
        temperature: 0.3
      })
    });
  } catch (err) {
    return jsonResponse({ error: "上游 AI 服务连接失败。" }, 502);
  }

  if (!upstream.ok) {
    // 不把上游错误细节透给前端，避免泄露账户信息
    return jsonResponse({ error: `上游 AI 服务返回 ${upstream.status}。` }, 502);
  }

  let data;
  try {
    data = await upstream.json();
  } catch (err) {
    return jsonResponse({ error: "上游返回内容无法解析。" }, 502);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    return jsonResponse({ error: "上游未返回有效解析内容。" }, 502);
  }

  return jsonResponse({ content });
}

// 只允许 POST，其余方法明确拒绝
export async function onRequest(context) {
  if (context.request.method === "POST") {
    return onRequestPost(context);
  }
  return jsonResponse({ error: "Method Not Allowed" }, 405);
}
