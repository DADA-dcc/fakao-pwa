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

## 当前进度（2026-10-31 交接）

- `main` @ `0ad9b47` 已与 origin 同步。线上官方地址：**https://xs06.de5.net/**（已启用自定义域名；旧 github.io 地址现 301 跳转到新域，旧 github.io 安装的 PWA 需卸载后从新域重装）。SW 缓存 `fakao-v27`。
- 现状功能：单文件 SPA；开屏为**内联 3D 天平+法槌**（Three.js r128 + `vendor/GLTFLoader.js`，模型 `assets/models/legal.glb`）+ 酒红金渐变，倒计时目标 2028-09-16；左下角有**动态版本角标**（读 sw `CACHE_VERSION`，用于确认是否已更新到最新）。
- SEO：`robots.txt` / `sitemap.xml` / `index.html` `<head>`（canonical、og、twitter）均已统一为 `https://xs06.de5.net/`；全仓库已无已废弃的旧域名引用。
- 最近提交：
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
