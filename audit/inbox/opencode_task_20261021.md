# 给 opencode 的工作单

> ⚠️ **2026-10-22 作废：xs06.com 切换取消，域名相关改动以 main 的 `f6c9e8b` 为准。**
>
> 本文档第 10–35 行（O1 域名切换）与第 55–59 行（元信息表）中的 `xs06.com`
> 全部不再适用。仓库已改回 `https://xs06.de5.net/`。
> 原因：`xs06.com` 的 DNS 仍托管在 gname 停放页（`sp.gname.net` → `172.65.185.109`），
> 未指向 GitHub Pages，此时配置自定义域会导致全站 503（已发生两次）。
>
> 域名切换的唯一前置条件是**域名持有人**在 gname 后台改 A/CNAME 记录，
> agent 做不到。DNS 未确认前，不得创建 `CNAME` 文件、不得设置 Pages 自定义域。
>
> 其余部分（题库无关的部署常识、事故记录）仍可参考。

- 日期：2026-10-21
- 仓库：`C:\Users\Krilenxs\Desktop\fakao-pwa`
- 当前 HEAD：`89f44be`
- **你负责域名与部署，不碰题库数据**

---

## O1 · 域名切换（等用户改 DNS，**现在不要开自定义域**）

### 先做

用户在 gname 改 DNS，改完后确认：

```bash
nslookup xs06.com 8.8.8.8
# 必须返回 185.199.108.153 / .109.153 / .110.153 / .111.153 中的全部四个
nslookup www.xs06.com 8.8.8.8
# 必须 CNAME 到 dada-dcc.github.io
```

**DNS 未确认前，绝对不要碰 Pages 的 Custom domain 设置。** 上次 503 就是顺序颠倒造成的。

### DNS 确认后，按此顺序

1. 新建 `CNAME` 文件，内容一行：`xs06.com`
2. commit + push（先 `git pull --ff-only`，Claude 也可能在推）
3. `gh api -X PUT repos/DADA-dcc/fakao-pwa/pages -f cname=xs06.com`
4. 等构建：`gh run list --limit 3` / `gh api repos/DADA-dcc/fakao-pwa/pages` 看 `status`
5. 证书签发后：`gh api -X PUT repos/DADA-dcc/fakao-pwa/pages -F https_enforced=true`
6. 验证：
   - `curl -I https://xs06.com/` → 200
   - `curl -I https://xs06.de5.net/` → 301 到 `https://xs06.com/`
   - `gh api repos/DADA-dcc/fakao-pwa/pages` → `status: built`、`cname: xs06.com`、`https_enforced: true`

### 失败就回滚

```
gh api -X PUT repos/DADA-dcc/fakao-pwa/pages -f cname=null
git rm CNAME && git commit -m "revert: 暂时移除 CNAME" && git push
```

---

## O2 · 域名相关的代码改动

**Claude 做题库与前端修复，你做 URL / 元信息。文件不重叠，但 push 前必须 `git pull --ff-only`。**

### 现在就可以做的（不影响线上）

| 项 | 要求 |
|---|---|
| `manifest.json` | `start_url` / `scope` **保持 `.`**，不要改绝对 URL |
| `index.html` `<head>` | 若无 `canonical`，加 `<link rel="canonical" href="https://xs06.com/">` |
| `index.html` `og:url` / `og:image` | 绝对 URL 一律 `https://xs06.com/...`，**不写 `dada-dcc.github.io`** |
| `README.md` | 已是 `xs06.com`，**不要改回旧域名** |
| `sitemap.xml` | 若不存在，建一份，所有 `<loc>` 用 `https://xs06.com/...` |
| `robots.txt` | 若不存在，建一份，`Sitemap: https://xs06.com/sitemap.xml` |

### 等 Claude 通知后再做

| 项 | 要求 |
|---|---|
| `sw.js` `CACHE_NAME` | Claude 改数据时会 bump `v14 → v15`。**你改完上面任何静态文件，再 bump 一次 `v15 → v16`**，并在 PR 说明里写原因 |

**规则：谁改静态资源谁 bump，一次改动一次 bump，不要合并。** 换域名的老用户 SW 缓存会因 origin 变化自然失效，这是固有限制，不需要额外处理。

---

## O3 · 部署后通知

写 `audit/outbox/opencode_domain_done.md`：

```
- 时间：
- DNS 确认结果：（nslookup 输出）
- CNAME 提交：
- Pages status：
- 证书状态 / https_enforced：
- 新旧域名跳转验证：
- SW 缓存版本：
- 需要 Claude 或 Qoder 跟进的事项：
```

同时用 `SendMessage` 或直接告知用户，让 Qoder 开始 Q4。

---

## 边界

- **不碰** `questions/*.json`（Claude 唯一所有者）
- **不碰** `audit/task3-rulings.md`
- 不 `push --force`
- 不改 `CLAUDE.md` / 全局配置
- 域名故障优先回滚保可用，不要在线调试

## 已知教训（别重复）

2026-10-21 15:28 你先把 Custom domain 设成 `xs06.com`，但 DNS 还停在 Gname 停放页，导致 `github.io` 立刻 301 到一个 503 的域名，全站不可用约 10 分钟。**顺序必须是 DNS → CNAME 文件 → Pages 设置。**
