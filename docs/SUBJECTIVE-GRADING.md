# 主观题 AI 批改 + 两处工程优化（draft 说明）

> 本文件随 A/B 两项改动一并提交评审。所有改动均为「纯增量」，未删除既有逻辑。

## 一、A. 工程优化（已改 index.html）

### A1. Tailwind 由 CDN 改为本地 vendor
- `index.html` 第 20 行：`https://cdn.tailwindcss.com/3.4.17` → `./vendor/tailwind-3.4.17.js`
- 收益：PWA 彻底离线可用、首屏不受 CDN 抖动影响、少一个外部请求。
- ⚠️ 上线前**务必本地实测首屏样式**：确认 `vendor/tailwind-3.4.17.js` 是「Play CDN 同款」可运行时生成样式的脚本（约 400KB 的就是它）。若发现样式丢失，说明该文件是需构建的库版本，退回 CDN 或改走预构建 CSS。

### A2. AI 生成内容免责提示
- 在「DeepSeek 追问」回复区（`#aiResponseBox`）底部新增一行免责声明：AI 内容仅供参考、非官方答案；标注「AI模拟」的案例为虚构练习素材。

### A3. 关于 `case_library.json`（重要发现）
- 现状：`case_library.json` **当前并未被 `index.html` 引用/渲染**（仅被 `sw.js` 缓存），所以「案例库加 AI模拟 标注」在 UI 上暂无挂载点。
- 数据本身已带 `ai_generated: true` 字段。**若日后启用案例库**，渲染卡片时请加角标：
```js
// 案例卡片内
`${c.ai_generated ? '<span class="case-ai-badge">AI模拟·非真实判例</span>' : ''}`
```
配套样式建议：`font-size:11px;padding:1px 8px;border-radius:999px;background:#fff3d6;color:#8a6d1a;border:1px solid #f0d99b;`

---

## 二、B. 主观题 AI 批改（完整功能）

### 新增文件
| 文件 | 作用 |
| --- | --- |
| `functions/api/grade.js` | Cloudflare Pages Function：`POST /api/grade`，把作答交给 DeepSeek 按采分点批改，返回结构化 JSON（Key 在服务端） |
| `subjective-grading/index.html` | 独立可运行的原型页（作答卡 + 采分点结果 UI），含「看演示结果」按钮，无后端也能预览 UI |

### 已集成进 `index.html`
- 题卡操作区新增按钮 `#gradeSubjectiveBtn`「AI 批改主观作答」（仅主观题显示）
- 解析区上方新增结果面板 `#gradeResultBox`（得分/等级/采分点逐条命中/失分点/建议/法条）
- `renderQuestion` 内按题型显隐按钮并重置面板
- 新增函数 `gradeSubjectiveAnswer()` / `renderGradeResult()` / `fillGradeList()`，并绑定按钮与「收起」

### API 契约：`POST /api/grade`
请求（application/json）：
```json
{
  "question": "题干/案情……",              // 必填
  "reference": "参考答案/采分点原文……",   // 建议填，用于对照
  "answer": "考生作答正文……",              // 必填
  "points": ["采分点1", "采分点2"],        // 可选；不填则由 AI 归纳
  "maxScore": 10                          // 可选，默认 10
}
```
响应（200）：
```json
{
  "score": 7.5, "maxScore": 10, "level": "良好",
  "pointHits": [ { "point": "……", "hit": true, "score": 2, "comment": "……" } ],
  "problems": ["失分点……"],
  "suggestions": ["改进建议……"],
  "lawBasis": ["《民法典》第692条"],
  "summary": "一句话总评"
}
```
错误：`{ "error": "……" }` + 状态码（400/413/429/502/503）。含 IP 限流（15 次/分）、请求体 48KB 上限、总字符 12000 上限。

### Prompt 设计要点（见 `grade.js` 的 `SYSTEM_PROMPT` / `buildUserPrompt`）
- 角色：法考主观题阅卷老师，依据现行法与通说，不臆造法条。
- 要求模型：①先拆 3–6 条采分点；②逐条判定命中+该条得分+点评；③汇总失分点与改进建议；④列出涉及法条；⑤**只输出严格 JSON**（`response_format: json_object`，并做代码围栏剥离与兜底解析）。
- 温度 0.2，max_tokens 1500。

### 部署 / 联调步骤
1. 部署 Pages（推代码或 `npx wrangler pages deploy .`）。
2. Cloudflare Pages → Settings → Environment variables 配置 `DEEPSEEK_API_KEY`（必填）；可选 `DEEPSEEK_MODEL`、`AI_RATE_LIMIT_KV`。
3. 自测：访问 `/subjective-grading/` → 点「看演示结果」看 UI；配置 Key 后点「🪄 AI 批改」走真实接口。
4. 主应用内：切到任一主观题 → 输入作答 → 点「AI 批改主观作答」。

### 校验
- `functions/api/grade.js` 通过 `node --check`。
- `index.html` 全部内联脚本（约 122KB）与原型页脚本均通过 `node --check`，无语法错误。

### 后续可选增强
- 采分点可在题库里显式存 `points` 数组，批改更稳（现在是让 AI 现拆）。
- 批改结果写入 `userProgress[q.id].grade` 用于历史对比/薄弱点统计。
- 主观题支持「对照参考答案自评」双模式（已有作答卡，可直接复用）。
