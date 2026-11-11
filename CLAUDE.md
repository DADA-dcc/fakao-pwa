# 法考答题机器人
这是一个面向法考备考者的答题练习助手

## 技术栈
- 前端：HTML + CSS + JavaScript（单文件，无需框架）
- 无需后端，所有数据存在本地 JSON 文件中

## 功能要求
- 题库支持：民法、刑法、行政法、宪法等科目
- 题型：单选题、多选题
- 功能：随机出题、显示解析、记录错题、按科目筛选
- 界面：中文，简洁清晰，适合长时间刷题

## 当前进度（2026-11-01）

- `main` @ `48b6f04` 已与 origin 同步。线上官方地址：**https://xs06.de5.net/**（已启用自定义域名；旧 github.io 地址现 301 跳转到新域，旧 github.io 安装的 PWA 需卸载后从新域重装）。SW 缓存 `fakao-v34`（本轮未改版本号）。
- **唯一入口（2026-11-11 用户确认）**：`https://xs06.de5.net/`。`linux.xs06.de5.net` 是独立静态副本，已由用户在服务器侧自行同步至 `d18f57d`（含 `preview/`、`subjective-grading/`），后续弃用，不再作为入口、审计对象或部署目标；`dada-dcc.github.io/fakao-pwa/` 仅保留 301 跳转。文档链接、PWA 安装、线上验证一律使用主域。
- 现状功能：单文件 SPA；开屏为**内联 3D 天平+法槌**（Three.js r128 + `vendor/GLTFLoader.js`，模型 `assets/models/legal.glb`）+ 酒红金渐变，倒计时目标 2028-09-16；左下角有**动态版本角标**（优先读线上 `sw.js` 的 `CACHE_VERSION`，离线时回退本地缓存，用于确认是否已更新到最新）。
- v12 UI 精修：Hero 改为深色法务封面（`#071426` + 金色 `#f3c969` 强调、蓝图网格、巨型「法」字、金色倒计时环、金色胶囊 CTA + 题库 meta）；统计改为无间隙 bento 条（每格顶部 2px 分色、tabular 数字、移动端图标降级）；科目 chip 改 999px 胶囊 + 边缘渐隐；题卡改 18px 纸张卡（navy→blue→gold 顶规、等宽 `Q` 序号、题干 17–19px、方形选项徽章）；底栏改 80% 玻璃 + 20px 模糊 + 顶部答题进度发丝线，移动端 5 项横排、触控高度 ≥40px；Hero 副标题窄屏显式两行，360 筛选三控件同排。
- v11 UI 精修：知识点中心改为 605 条考点分页 + 科目筛选 + 搜索 + 折叠展开 + 随手笔记跳转；答题卡 120 题/页并支持题号跳转；SW 更新提示改为底栏上方固定卡片；桌面 Hero 增加 685 天倒计时环；主题切换改为圆形 View Transition 揭示；背诵/模拟模式启用专注布局；移动端顶栏、统计、底栏、Toast 密度统一。
- SEO：`robots.txt` / `sitemap.xml` / `index.html` `<head>`（canonical、og、twitter）均已统一为 `https://xs06.de5.net/`；全仓库已无已废弃的旧域名引用。
- v13 UI 精修（`48b6f04`，新增 `<style id="ui-v13">` 精修层，纯 CSS 增量，未动 JS 与 SW）：
  - **解析面板改「判决书」**：`#explanationBox` 16px 圆角 + 纸张渐变 + 顶部 navy→blue→gold 3px 规则线；首行升级为**判定横幅**（`回答正确` 走 emerald、`回答错误` 走 rose，靠 `:has(#resultVerdictBadge[class*="emerald"])` 自动换色，左侧 3px 竖条 + 圆角 + 底色）；正确答案 chip 放大到 1.05rem/最小宽 2.2em；`.exp-kicker` 11px/800/`.06em` 蓝色小标；解析正文左侧 2px 蓝发丝线 + 13px/1.95 行高；法条 chip 金色书签内阴影，`:empty` 自动隐藏。
  - **操作行胶囊化**：`确认提交答案` 改 999px 深蓝渐变主 CTA（hover 提亮），`查看/折叠解析`、`移出错题本`、`AI 深度追问` 统一胶囊；窄屏 `white-space:nowrap` 防按钮文案折行，360 极窄下隐藏 `移出错题本` 避免挤压主 CTA。
  - **随手笔记**：输入框 12px 圆角 + 1.85 行高，聚焦时金色描边 + 3px 金环；模板按钮胶囊化；保存状态等宽数字。
  - **错题本**：计数徽章玫红描边；错题卡 12px 圆角 + 玫红调边框；**修复既有 bug**——`去重做` 按钮原本只有 `text-white` 没有背景（白字白底不可见），v13 补 navy 渐变底；导出 CSV 胶囊化。
  - **答题卡**：`.sheet-overview` 改为无间隙统计条（`flex:0 0 auto` 关键修复窄屏被弹窗 flex 压缩裁掉 20px），四格各带顶部 2px 分色（对绿/错玫/未答蓝/完成金）+ 等宽大数字；题号格 9px 圆角、最小高 36px、等宽数字；分页按钮与跳页输入框胶囊化。
  - **知识点中心**：`.modal-tabs` 改分段控件（`m-tab` 均分 + 选中态 navy 渐变、羊皮纸主题转棕金渐变）；`.k-card` 13px 圆角 + 左侧 3px 蓝→navy 竖脊（羊皮纸转棕），`flex:0 0 auto` 修复卡片被 `.k-list` flex 压缩导致正文被 `-webkit-line-clamp:3` 拦腰截断；搜索框胶囊化。
  - **窄屏适配**：`@media(max-width:640px)` 解析/答题卡/分页/标签/知识卡全套降密度；`@media(max-width:360px)` 隐藏跳页输入与「移出错题本」，跳至未做按钮只留图标。
  - 三主题（浅色/深色/羊皮纸）均已截图核对；功能 smoke 覆盖科目筛选、收藏、背诵模式、主题循环、答题卡翻页、知识点搜索，控制台无报错。
- 最近提交：
  - `48b6f04` style(ui): v13 精修层 — 解析判决书面板/答题卡统计条/知识点卡脊/操作按钮胶囊
  - `42af946` docs: 同步当前进度至 v12
  - `01ca621` fix(ui): 版本角标优先读取当前 sw.js，避免旧缓存误报
  - `587b413` feat(ui): v12 视觉精修（深色法务 Hero / 数据 bento / 纸张题卡 / 玻璃底栏）
  - `0dea20f` fix(ui): 专注模式计时器保留重置按钮并图标化
  - `e488620` feat(ui): v11 全量精修（知识点检索/答题卡分页/更新卡/移动端密度/主题揭示/倒计时/专注模式）
  - `3827559` feat(ui): 顶部新增流动液态七彩玻璃流体（SW v33→v34）
  - `93fe801` feat(ui): 主流程图标线性化（科目筛选/题卡操作/掌握状态/笔记与错题标题/CSV 导出）+ Hero 窄屏收缩（SW v32→v33）
  - `51447f7` feat(ui): 统计卡图标线性化分色 + 题眼高亮/单选即判改状态药丸开关（SW v31→v32）
  - `150553a` fix(pages): 新增 404 兜底跳转首页，兼容误带 /fakao-pwa/ 旧路径
  - `c271311` feat(ui): 顶栏/底栏图标统一为线性描边 SVG + 错题卡片玫红渐变分色强化（SW v30→v31）
  - `49ac92f` feat(ui): 解析/背题「正确答案」渐变 chip 强调（作答中性 chip）+ 难度筛选下拉带 ★ 星级（SW v29→v30）
  - `a8dc06c` feat(ui): 答题卡图例圆点改同款渐变 + 选项判定态右上角 ✓(对)/✕(错)/!(漏选) 角标（SW v28→v29）
  - `57a2684` feat(ui): 第四轮精修（题卡头部标签圆角化/难度★星级、错题本与收藏空状态插画、答题卡已答对绿✓/错红✕ 渐变配色；空状态隐藏残留标签，SW v27→v28）
  - `0ad9b47` feat(ui): 第三轮精修（Hero 渐变字/kicker 徽章、统计图标徽章、答题卡·知识点·同步弹窗统一风格，SW v26→v27）
  - `a591053` feat(ui): 精致质感升级（统计分色卡/蓝靛 CTA/磨砂底栏/选项徽章/错题条/顶栏品牌渐变线）+ 深色与羊皮纸主题精修（SW v25→v26）
  - `668de7b` chore(docs): 移除已废弃历史归档与两份作废简报（git 历史仍可追溯）
  - `5507fee` chore(seo): 域名/SEO 元数据统一为 xs06.de5.net
  - `b812b0d` feat(ui): 左下角动态版本角标（v25）
  - `1d42f7f` / `fb8e3c2` docs: 历史文档旧域名清理
  - `06c5809` / `d05863b` / `c1a76f3` feat(splash): 3D 封面 + 开屏内联 3D + 层级修复（SW v24→v25）
- `audit/` 残留已处置（2026-10-23）：工具脚本 4 个 + `HANDOFF_GEMINI.md` + `verify_reply_20261019.md` + `outbox/archive_nonfakao.json` + `rescue/{fix_stems.py,applied_stem_fixes.json,minfa_03.json}` 已提交；`qc_report.json`、`rescue/_mf_*`、`rescue/民法.before.json` 为可重生成产物，已写入 `.gitignore`。工作区无未跟踪文件。
- 待用户裁定（未改动）：`rescue/minfa_03.json` 与 `audit/inbox/minfa_03_output.json` 内容不同，前者部分解析疑似未落库（如 202/227）；`rescue/民法.before.json` 等于 `a14496c` 版题库，可作回滚点。
- 固定约束：`archive/do-not-merge-20261021` @ `84aa112` 不合并、不 cherry-pick（其历史自定义域名 CNAME 已作废）；版本号（questions_version / sw CACHE_NAME）只由用户修改；一 agent 一 worktree，禁用 `git add -A`，提交前核对 `git diff --cached --name-only`。
- 分工（2026-10-22 约定）：题库 `questions/*.json`、`index.html` body/style/script、`sw.js`、`audit/` 归 Claude Code；`index.html` head meta、`robots.txt`、`sitemap.xml`、Pages 设置、仓库 About/Homepage 归另一 agent（opencode）。
- claude-mem 凭据只能由用户在终端执行 `/login`（2026-10-22 22:29 已执行过），agent 无法代做。
- `fakao-v23` 升级：修复 `sw.js` 缓存克隆与幽灵引用、拆分 `manifest.json` 图标声明、修复 `preload.js`/`main.js` 流式异常与 IPC 泄漏、补齐 `index.html` 12 科目映射与计时器清理。
