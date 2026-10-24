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

## 当前进度（2026-10-23 00:09 交接）

- `main` @ `9ee128a` 已与 origin 同步。线上 https://dada-dcc.github.io/fakao-pwa/ 实测 9730 题，SW 缓存只剩 `fakao-v22-shell` / `fakao-v22-data`。
- 最近三个提交：
  - `8174747` 背题模式升级、移动端手势、IndexedDB 双写守护
  - `c01e810` 修复题库加载丢失（index.json 嵌套字典递归）+ 长解析折叠，SW v13→v22
  - `9ee128a` 修复「立即更新」竞态（等 `controllerchange` 再 reload）
- `audit/` 残留已处置（2026-10-23）：工具脚本 4 个 + `HANDOFF_GEMINI.md` + `verify_reply_20261019.md` + `outbox/archive_nonfakao.json` + `rescue/{fix_stems.py,applied_stem_fixes.json,minfa_03.json}` 已提交；`qc_report.json`、`rescue/_mf_*`、`rescue/民法.before.json` 为可重生成产物，已写入 `.gitignore`。工作区无未跟踪文件。
- 待用户裁定（未改动）：`rescue/minfa_03.json` 与 `audit/inbox/minfa_03_output.json` 内容不同，前者部分解析疑似未落库（如 202/227）；`rescue/民法.before.json` 等于 `a14496c` 版题库，可作回滚点。
- 固定约束：xs06.com 方案已废弃；`archive/do-not-merge-20261021` @ `84aa112` 不合并、不 cherry-pick（含 CNAME=xs06.com）；版本号（questions_version / sw CACHE_NAME）只由用户修改；一 agent 一 worktree，禁用 `git add -A`，提交前核对 `git diff --cached --name-only`。
- 分工（2026-10-22 约定）：题库 `questions/*.json`、`index.html` body/style/script、`sw.js`、`audit/` 归 Claude Code；`index.html` head meta、`robots.txt`、`sitemap.xml`、Pages 设置、仓库 About/Homepage 归另一 agent（opencode）。
- claude-mem 凭据只能由用户在终端执行 `/login`（2026-10-22 22:29 已执行过），agent 无法代做。
- `fakao-v23` 升级：修复 `sw.js` 缓存克隆与幽灵引用、拆分 `manifest.json` 图标声明、修复 `preload.js`/`main.js` 流式异常与 IPC 泄漏、补齐 `index.html` 12 科目映射与计时器清理。
