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
 * 请求体：{ prompt: string, followup?: string }（单题解析）
 *         或 { messages: [{ role, content }, ...] }（多轮答疑，role ∈ system/user/assistant）
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

// 同源校验：阻止第三方站点把这个接口当免费 LLM 代理调用
function isAllowedOrigin(request) {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  if (!origin) return true; // 无 Origin/Referer 的直连请求仍受 IP 限流约束
  try {
    const selfHost = new URL(request.url).host;
    return new URL(origin).host === selfHost;
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

  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "非法来源。" }, 403);
  }
  const ip = getClientIp(request);
  if (await isRateLimited(env, ip)) {
    return jsonResponse({ error: "请求过于频繁，请稍后再试。" }, 429);
  }

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
      return jsonResponse({ error: "请求内容过大。" }, 413);
    }
    payload = JSON.parse(raw);
  } catch (err) {
    return jsonResponse({ error: "请求体不是合法 JSON。" }, 400);
  }

  const prompt = typeof payload?.prompt === "string" ? payload.prompt.trim() : "";
  const followup = typeof payload?.followup === "string" ? payload.followup.trim() : "";

  // 多轮答疑：只接受 user/assistant，禁止客户端注入 system 角色（防提示词劫持/当免费通用代理）
  let messages;
  if (Array.isArray(payload?.messages) && payload.messages.length) {
    const allowedRoles = new Set(["user", "assistant"]);
    const cleaned = [];
    let totalChars = 0;
    // 取最近 24 条（滑动窗口），而不是最早的 24 条，否则长对话必然 413
    for (const m of payload.messages.slice(-24)) {
      if (!m || typeof m !== "object") continue;
      const content = typeof m.content === "string" ? m.content : "";
      if (!content.trim()) continue;
      totalChars += content.length;
      cleaned.push({ role: allowedRoles.has(m.role) ? m.role : "user", content });
    }
    if (!cleaned.length) {
      return jsonResponse({ error: "messages 中没有有效内容。" }, 400);
    }
    if (totalChars > MAX_PROMPT_CHARS) {
      return jsonResponse({ error: "对话内容过长。" }, 413);
    }
    messages = [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned];
  } else {
    if (!prompt) {
      return jsonResponse({ error: "缺少 prompt 字段。" }, 400);
    }
    if (prompt.length + followup.length > MAX_PROMPT_CHARS) {
      return jsonResponse({ error: "题目内容过长。" }, 413);
    }
    messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(prompt, followup) }
    ];
  }

  let upstream;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 50000);
  try {
    upstream = await fetch(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL || "deepseek-chat",
        messages,
        temperature: 0.3,
        max_tokens: 900
      }),
      signal: ctrl.signal
    });
  } catch (err) {
    return jsonResponse({ error: "上游 AI 服务连接失败。" }, 502);
  } finally {
    clearTimeout(timer);
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
