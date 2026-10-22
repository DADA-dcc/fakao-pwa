# citation_current 三处修正落库报告

- 日期：2026-10-22
- 基线 HEAD：`75270cc`
- 依据：`audit/outbox/qoder_oldlaw_scan.md` 的「需改明细（citation_current）」
- 脚本：`audit/fix_citation_current.py`
- 备份：`audit/work/backup_questions_pre_citation/`

## 1. 改动明细

| id | 科目 | 字段 | 旧 | 新 | 备注 |
|---:|---|---|---|---|---|
| 5230 | 商经法 | analysis | 其应由《合同法》调整 | 其应由《民法典》合同编调整 | 采纳 qoder 建议 |
| 8232 | 民法 | question | 我国《婚姻法》第二十四条第一款：… | 我国《民法典》第一千零六十一条：… | **驳回 qoder 建议**，见 §2 |
| 8748 | 民法 | question | 我国《合同法》第135条规定：… | 原《合同法》第155条规定：…现由《民法典》第617条承继，准用第582–584条 | 采纳并修正原题条号错误，见 §2 |

## 2. 两处对 qoder 建议的复核

### 8232 — qoder 建议错误，已驳回

qoder 建议 `《婚姻法》24条1款 → 《民法典》第一千零七十条`。**错误**：

- 《民法典》第1070条：「父母和子女有相互继承遗产的权利。」——主体是父母子女。
- 《民法典》第1061条：「夫妻有相互继承遗产的权利。」——主体是夫妻。

原《婚姻法》第24条第1款正是夫妻互继，对应 **1061 条**。若照抄 qoder 建议会把题目改错科目考点。已按 1061 条落库。

### 8748 — 原题条号本身引错，一并修正

《合同法》第135条原文是「出卖人应当履行向买受人交付标的物…的义务」，讲的是交付义务，**不是**质量责任。

题目引述的「交付的标的物不符合质量要求…依照本法第111条要求承担违约责任」实为 **《合同法》第155条**（质量不符合约定，准用第111条）。

处理：题干改为「原《合同法》第155条规定：…该内容现由《民法典》第617条承继，并准用第582条至第584条。」

保留「原」字是刻意的——明确提示这是旧法条文，与全库 `comparison` 类题目的既有写法一致。

> 注：qoder 建议的 617 条方向正确，但它未指出原引 135 条是错的，也未说明 617 条已从「准用第111条」变为「准用第582–584条」。

## 3. 版本号

| 位置 | 旧 | 新 |
|---|---|---|
| `questions/index.json` → `version` | v8 | **v9** |
| `index.html` → `questions_version`（3 处） | v8 | **v9** |
| `sw.js` → `CACHE_NAME` | fakao-v17 | **fakao-v18** |

`sw.js` 缓存名必须同步 bump，否则 `PRECACHE` 中的 `questions/index.json` 会沿用旧缓存，离线用户的 `needReload` 判断失效。

## 4. 回归结果

服务：`python -m http.server 8765 --bind 127.0.0.1`

| # | 测试 | 结果 |
|---:|---|---|
| 1 | `runtime-check.js` | PASS — console 0 / pageerror 0 / requestFailed 0 / badResponse 0 |
| 2 | `full-test.js` | PASS — `errs=[] bad=[]` |
| 3 | `multi-test.js` | PASS — `errs []` |
| 4 | `search-test.js` | PASS — 搜索「押金」命中 1 条并正确跳转，`errs []` |
| 5 | `exam-test.js` | PASS — 10/10 推进，交卷结果面板正常，`errs []` |
| 6 | `exit-test.js` | PASS — 1/9730 → 1/10 → 交卷 → 1/9730 |

题数：**9730**，12 科计数与 `index.json` 全部一致。

### 三题 UI 抽查

脚本：`audit/spotcheck_citation.js`；结果：`audit/outbox/spotcheck_citation.json`

| id | 题型 | 答案 | 题干 | 选项 | 判题 | 高亮 | 新引用 | 旧引用清除 | 截图 |
|---:|---|---|---|---|---|---|---|---|---|
| 5230 | 多选 | A,B | PASS | PASS | PASS | PASS | PASS | — | `spot_citation_5230.png` |
| 8232 | 多选 | AC | PASS | PASS | PASS | PASS | PASS | PASS | `spot_citation_8232.png` |
| 8748 | 单选 | C | PASS | PASS | PASS | PASS | PASS | PASS | `spot_citation_8748.png` |

**3/3 PASS，0 console error。**

## 5. 仍未处理

1. **4494 / 4542 选项 C 的「股东大会」**：分层口径为「选项保留真题原文 + 解析说明」。当前数据无 `footnote` 字段，UI 不显示脚注。补脚注需加数据字段 + UI 渲染，属功能改动，待定。
2. **DNS 未通**：`xs06.com` 当前解析到 `sp.gname.net / 172.65.185.109`（域名商停车页），不是 GitHub Pages。`CNAME` 已在 `89f44be` 删除，Custom domain 配置**不要动**——10-21 的 503 就是这一步做早了导致的。
