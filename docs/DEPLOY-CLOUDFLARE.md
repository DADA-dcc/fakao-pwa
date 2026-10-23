# 部署到 Cloudflare Pages

## 一、为什么不能直接把仓库根目录当输出目录

仓库根目录混着 `audit/`（内部审计脚本）、`docs/`（设计文档）、`.playwright-mcp/`（调试快照）、
`package.json` / `main.js` / `preload.js`（Electron 桌面壳）。这些一旦作为静态站点发布，
任何人都能直接下载。

所以用 `scripts/build.mjs` 只挑该发布的文件复制到 `dist/`：

```bash
node scripts/build.mjs
```

产物 22 MB 左右，包含：`index.html`、`sw.js`、`manifest.json`、图标、`questions/`（13 个分科题库）、
`knowledge.json`、`case_library.json`、`vendor/`、`preview/`、`_headers`。

## 二、部署步骤

### 方式 A：Dashboard 连接 Git（推荐）

1. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选 `DADA-dcc/fakao-pwa` 仓库
3. 构建设置：
   - **Framework preset**: None
   - **Build command**: `node scripts/build.mjs`
   - **Build output directory**: `dist`
4. **Save and Deploy**

之后每次 push 到 `main` 自动部署。

### 方式 B：本地命令行

```bash
node scripts/build.mjs
npx wrangler pages deploy dist --project-name fakao-pwa
```

## 三、配置 AI 代理（可选但强烈建议）

前端已改为优先请求同源 `/api/ai`，密钥存在 Cloudflare 环境变量里，用户不需要自备 Key。

在 **Pages 项目 → Settings → Environment variables** 添加：

| 变量名 | 必填 | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek 平台申请的 key |
| `DEEPSEEK_MODEL` | 否 | 默认 `deepseek-chat` |

添加后需要 **重新部署** 才生效。

### 限流（可选）

默认每 IP 每分钟 20 次，未绑定 KV 时用单实例内存计数（多实例下不精确）。
要精确限流就建一个 KV：

```bash
npx wrangler kv namespace create AI_RATE_LIMIT_KV
```

把返回的 `id` 填进 `wrangler.toml` 的 `[[kv_namespaces]]` 段并取消注释。

### 回退行为

- 代理可用 → 用服务端密钥
- 代理不可用（本地预览、静态托管无 Functions）→ 若用户自己配了 DeepSeek Key 就浏览器直连
- 两者都没有 → 显示本地结构化考点拆解，不会白屏

## 四、已修复的问题

`index.html` 原先有两处硬编码域名判断，只认 `github.io` 和 `localhost`：

| 位置 | 原逻辑 | 问题 | 现逻辑 |
| --- | --- | --- | --- |
| `tryLoadExternalRepoData()` | `hostname.includes("github.io") \|\| localhost \|\| 127.0.0.1` | 部署到 `*.pages.dev` 或自定义域名后，9730 题完整题库不加载，只剩 41 道内置题 | `protocol` 是 http/https 即启用 |
| Service Worker 注册 | 同上 | PWA 离线、安装到主屏幕、热更新全部失效 | `protocol` 是 http/https 即启用 |

## 五、国内访问提醒

`*.pages.dev` 在国内连通性不稳定，绑自定义域名也一样。这是线路问题不是配置问题。
如果面向国内考生正式运营，需要单独评估（备案 + 国内 CDN），或先实测延迟再决定。
