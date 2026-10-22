# 给 Qoder 的工作单

> ⚠️ **2026-10-22 部分作废：xs06.com 切换已取消。**
>
> 第 96–103 行的域名验收步骤不再适用 —— 站点当前地址是
> `https://dada-dcc.github.io/fakao-pwa/`，没有自定义域名。
> 文中「CACHE_NAME 会 bump 到 v15」也已过时，当前为 `fakao-v20`。
> 题库审校相关部分（Q1/Q2/Q3）仍然有效且已完成。

- 日期：2026-10-21
- 仓库：`C:\Users\Krilenxs\Desktop\fakao-pwa`
- 你的权限：只读 `questions/*.json`、`index.html`、`sw.js`；只写 `audit/outbox/qoder_*`、`audit/qoder_*.js`
- **绝不写** `questions/*.json`；**绝不写** `index.html` / `sw.js`
- 落库由 Claude 统一执行

---

## Q1 · 出「股东大会」dry-run patch（最高优先）

**输入**：`audit/outbox/qoder_shareholders_scan.json`（75 处逐处明细）+ `audit/task3-rulings.md` 第三节

**已确认口径（四条硬规则，Claude 已签字）**
1. **引号内一律不改** —— 法条、司法解释原文
2. **证券语境不改** —— 题干含「根据证券法律制度」「上市公司」且依据《证券法》/《上市公司重大资产重组管理办法》
3. **层内分开判** —— 同一题，选项真题原文 keep+footnote，解析自写 replace
4. **有限公司写「股东大会」是笔误** —— 4556 必改

**已采纳你的三条修正**
- 8286 从「必改」改为 keep+footnote（证券语境）
- 4494 / 4542 分层：选项 keep+footnote，解析 replace
- 4452 / 4499 / 4524 引文 keep，不动

**产出**：`audit/outbox/qoder_shareholders_patch.json`

格式（**每个字段完整 before / after 全文，不要 diff**）：

```json
[
  {
    "id": 4406,
    "file": "questions/商经法.json",
    "field": "analysis",
    "action": "replace",
    "before": "……即使召开股东大会，股东何某……",
    "after": "……即使召开股东会，股东何某……",
    "occurrences": 1,
    "confidence": "高",
    "reason": "自写解析，非引文，依《公司法》第111条"
  }
]
```

要求：
- `before` 必须是当前文件的**精确原文**，能直接 `str.replace` 命中且只命中该处（或给 `occurrence_index`）
- `after` 只改「股东大会」→「股东会」，**不得改动其他任何字符**
- 9381 是 `rewrite`，整句改写，`before`/`after` 给完整句子
- 每题一个 entry，同一字段多处合并成一个 entry 但 `occurrences` 写实际数
- 附一份 `audit/outbox/qoder_shareholders_patch.md` 人读版：表格列出 id / 字段 / 次数 / before→after 的**前后各 30 字上下文**

**自检**：
```bash
node audit/qoder_verify_patch.js   # 你写这个：读 patch.json，逐条校验 before 在文件中命中次数 == occurrences
```

---

## Q2 · 独立复现旧法引用清单

Claude 用负向前瞻重扫得到 **34 处 / 31 题**（`(?<!劳动)(?<!原)《(合同法|物权法|侵权责任法|继承法|婚姻法|担保法)》`）。

请独立复现，不要看我的结果，直接跑你的正则，产 `audit/outbox/qoder_oldlaw_scan.json`：
- 逐处：id / 科目 / 字段（question/options/analysis）/ 上下文 / 分类
- 分类四选一：
  - `citation_current` —— 当作现行法引用（**问题**）
  - `comparison` —— 「原《X法》…现由《民法典》第Y条承继」新旧对比（正确）
  - `historical_scene` —— 题干是历史案件事实或法理研究对象（正确）
  - `other_law` —— 《劳动合同法》等未废止法律（误报）

**已知结论**（供你对照，不要直接抄）：
- 需改题干：9377、240、8509、9472、9499、4901
- 其余多为正确承继或历史场景

**产出**：`audit/outbox/qoder_oldlaw_scan.md` 表格 + 一句「与 Claude 的 34 处 / 31 题是否一致」

---

## Q3 · 落库后回归验证

**前置**：等 Claude 提交数据改动（会通知你 commit hash）

**做**：
1. `python -m http.server 8765 --bind 127.0.0.1` 起服务
2. 跑 `audit/work/` 下全部测试：`runtime-check.js`、`full-test.js`、`multi-test.js`、`search-test.js`、`exam-test.js`、`exit-test.js`
3. **额外加一项**：题目总数仍为 9730，12 科各自 count 与 `questions/index.json` 一致
4. **额外加一项**：抽查 15 道被改过的题，确认题干/解析渲染正常、答案判定正确

**产出**：`audit/outbox/qoder_regression.md`，表格列每项测试 pass/fail + 截图路径

---

## Q4 · 域名切换后的 PWA 验证（等 opencode 完成）

**前置**：等 opencode 通知 `xs06.com` DNS 已生效且 Pages 证书签发

**做**：
1. 访问 `https://xs06.com/`，确认 200
2. 确认 `https://xs06.com/manifest.json` 的 `start_url` / `scope` 仍是 `.`
3. 确认 `https://xs06.com/sw.js` 的 `CACHE_NAME` 是新的（Claude 会 bump 到 v15）
4. 用 Playwright：首次访问 → 装 PWA → 离线刷新 → 确认能打开
5. 确认 `https://dada-dcc.github.io/fakao-pwa/` 301 到 `https://xs06.com/`

**产出**：`audit/outbox/qoder_domain_verify.md`

---

## 完成标记

每完成一项，写 `audit/outbox/qoder_done.md`，追加一行：
```
- [Q1] 2026-10-21 完成 → audit/outbox/qoder_shareholders_patch.json
```

## 不要做的事

- 不改 `questions/*.json`
- 不改 `index.html` / `sw.js` / `README.md` / `CNAME`
- 不 commit、不 push
- 不碰 `audit/task3-rulings.md`（Claude 维护）
