# 网页提取接口 `/api/extract`（Firecrawl）

把公开网页洗成 Markdown，供 AI 解析、摘录、入题库。

## 1. 启用步骤（3 步）

1. 去 https://firecrawl.dev 注册，拿到 `fc-...` 的 API Key（有免费额度）；
2. Cloudflare Pages → 项目 `fakao-pwa` → Settings → Environment variables，添加：
   | 变量 | 必填 | 说明 |
   |---|---|---|
   | `FIRECRAWL_API_KEY` | ✅ | `fc-...` |
   | `FIRECRAWL_ENDPOINT` | 否 | 默认 `https://api.firecrawl.dev/v2/scrape`；自建填 `http://<host>:3002/v2/scrape` |
   | `EXTRACT_MAX_CHARS` | 否 | 返回正文上限，默认 20000 |
   | `EXTRACT_RATE_LIMIT_KV` | 否 | 绑定一个 KV 命名空间可做跨实例精确限流 |
3. 重新部署（Deployments → Retry deployment），使环境变量生效。

## 2. 调用示例

```js
const r = await fetch("/api/extract", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ url: "https://zh.wikipedia.org/wiki/民法典" })
});
const data = await r.json();
// { markdown, title, sourceURL, truncated }
```

## 3. 响应约定

| 状态码 | 含义 |
|---|---|
| 200 | 成功，返回 `{ markdown, title, sourceURL, truncated }` |
| 400 | url 缺失/格式错/内网地址 |
| 403 | 非本站来源（防他人白嫖） |
| 413 | 请求体过大（>4KB） |
| 422 | 页面没提取到正文（登录墙/反爬） |
| 429 | 限流（每 IP 每分钟 10 次） |
| 502 / 504 | 上游失败 / 30 秒超时 |
| 503 | 服务端未配置 `FIRECRAWL_API_KEY` |

## 4. 安全设计

- **防 SSRF**：只允许 http/https，拒绝 `127.0.0.1`、`10/8`、`172.16/12`、`192.168/16`、`169.254/16`、`100.64/10`、组播、`::1`、`fc00::/7`、`fe80::/10`、`localhost`、`*.local`、`*.internal`、`metadata.google.internal`；
- **同源校验**：Origin/Referer 必须与本站同 host；
- **限流**：每 IP 每分钟 10 次（KV 可选，未绑定则进程内兜底）；
- **体积限制**：请求体 4KB、返回正文默认 20K 字符（可截断并标记 `truncated`）；
- **超时**：30 秒 AbortController。

## 5. 已知限制（实测 2026-11-22）

| 站点类型 | 结果 |
|---|---|
| 维基百科 / 政府网 / 厂商文档 | ✅ 效果好（257KB HTML → 83KB Markdown，压缩 3.09:1，标题层级保留） |
| 知网 wap 摘要页 | ❌ 直连 403、云端 SSL 证书错误 → **不要走自动化**，改浏览器手动导入或换源万方/维普/百度学术 |
| 需登录的内容 | ❌ 抓不到；应先由用户导出再上传 |

## 6. 本地测试

```bash
node --check functions/api/extract.js   # 语法
# 行为测试覆盖：405/400/403/413/422/429/502/504/200/截断
```
