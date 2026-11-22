/**
 * Cloudflare Pages Function: POST /api/extract
 *
 * 作用：把一个公开网页「洗」成干净 Markdown，供 AI 解析/摘录使用。
 *      走 Firecrawl（https://firecrawl.dev），API Key 只放在 Cloudflare 环境变量里。
 *
 * 环境变量（Cloudflare Pages → Settings → Environment variables）：
 *   FIRECRAWL_API_KEY   必填，Firecrawl 平台的 key（fc-...）
 *   FIRECRAWL_ENDPOINT  可选，默认 https://api.firecrawl.dev/v2/scrape
 *                        自建 Firecrawl（firecrawl-local serve）时填 http://<host>:3002/v2/scrape
 *   EXTRACT_MAX_CHARS   可选，返回正文最大字符数，默认 20000
 *
 * 请求体：{ url: string }
 * 响应：  { markdown: string, title?: string, sourceURL: string, truncated: boolean }
 *         或 { error: string }
 *
 * 安全限制：
 *   1. 只允许 http/https；
 *   2. 拒绝内网/回环/保留地址（防 SSRF）；
 *   3. 同源校验 + 按 IP 限流；
 *   4. 请求体与返回正文都有上限。
 */

const DEFAULT_ENDPOINT = "https://api.firecrawl.dev/v2/scrape";
const MAX_BODY_BYTES = 4 * 1024;
const RATE_LIMIT_PER_MINUTE = 10;
const DEFAULT_MAX_CHARS = 20000;
const FETCH_TIMEOUT_MS = 30000;

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
  const windowKey = `${ip}:${Math.floor(Date.now() / 60000)}`;

  if (env && env.EXTRACT_RATE_LIMIT_KV) {
    try {
      const current = parseInt((await env.EXTRACT_RATE_LIMIT_KV.get(windowKey)) || "0", 10);
      if (current >= RATE_LIMIT_PER_MINUTE) return true;
      await env.EXTRACT_RATE_LIMIT_KV.put(windowKey, String(current + 1), { expirationTtl: 120 });
      return false;
    } catch (err) {
      return false;
    }
  }

  const hits = (memoryHits.get(windowKey) || 0) + 1;
  memoryHits.set(windowKey, hits);
  if (memoryHits.size > 5000) memoryHits.clear();
  return hits > RATE_LIMIT_PER_MINUTE;
}

// 阻止 SSRF：内网、回环、链路本地、保留网段与常见内网主机名
function isBlockedHost(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (["localhost", "localhost.localdomain", "metadata", "metadata.google.internal"].includes(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;

  // IPv4
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a >= 224) return true;
    return false;
  }

  // IPv6 简化判断
  if (host.includes(":")) {
    if (host === "::1" || host === "::") return true;
    if (host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return true;
  }
  return false;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!isAllowedOrigin(request)) {
    return jsonResponse({ error: "不允许的来源" }, 403);
  }

  const ip = getClientIp(request);
  if (await isRateLimited(env, ip)) {
    return jsonResponse({ error: "请求过于频繁，请稍后再试" }, 429);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: "请求体过大" }, 413);
  }

  let url;
  try {
    url = JSON.parse(raw || "{}").url;
  } catch (e) {
    return jsonResponse({ error: "请求体不是合法 JSON" }, 400);
  }

  if (typeof url !== "string" || !url.trim()) {
    return jsonResponse({ error: "缺少 url 参数" }, 400);
  }

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch (e) {
    return jsonResponse({ error: "url 格式不合法" }, 400);
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return jsonResponse({ error: "只支持 http/https 链接" }, 400);
  }
  if (isBlockedHost(parsed.hostname)) {
    return jsonResponse({ error: "不允许抓取内网地址" }, 400);
  }

  if (!env || !env.FIRECRAWL_API_KEY) {
    return jsonResponse({ error: "服务端未配置 FIRECRAWL_API_KEY，网页提取暂不可用。" }, 503);
  }

  const endpoint = env.FIRECRAWL_ENDPOINT || DEFAULT_ENDPOINT;
  const maxChars = parseInt(env.EXTRACT_MAX_CHARS || String(DEFAULT_MAX_CHARS), 10) || DEFAULT_MAX_CHARS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({
        url: parsed.href,
        formats: ["markdown"],
        onlyMainContent: true
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return jsonResponse(
        { error: `提取失败（上游 ${res.status}）`, detail: detail.slice(0, 300) },
        res.status === 429 ? 429 : 502
      );
    }

    const payload = await res.json();
    const data = payload.data || payload;
    const markdown = (data.markdown || "").trim();

    if (!markdown) {
      return jsonResponse({ error: "该页面没有提取到正文（可能需要登录或有反爬）" }, 422);
    }

    const truncated = markdown.length > maxChars;

    return jsonResponse({
      markdown: truncated ? markdown.slice(0, maxChars) : markdown,
      title: data.metadata?.title || "",
      sourceURL: data.metadata?.sourceURL || parsed.href,
      truncated
    });
  } catch (err) {
    const aborted = err && err.name === "AbortError";
    return jsonResponse({ error: aborted ? "提取超时（30 秒）" : "提取异常" }, aborted ? 504 : 502);
  } finally {
    clearTimeout(timer);
  }
}

export function onRequestGet() {
  return jsonResponse({ error: "请用 POST 提交 { url }" }, 405);
}
