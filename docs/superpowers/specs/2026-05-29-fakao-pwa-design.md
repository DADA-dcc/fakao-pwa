# 法考刷题助手 PWA 版 - 设计文档

2026-05-29 | 状态：已批准

## 目标

将现有 Electron 桌面版"法考刷题助手"改造为 PWA 网页版，支持华为手机和 iPad 使用，零成本部署。

## 技术决策

| 决策项 | 选择 |
|--------|------|
| 平台 | PWA（Progressive Web App） |
| 改造策略 | 最小化转换（在现有 index.html 上改） |
| AI 功能 | 用户自带 DeepSeek API Key，浏览器端直连 |
| 题库加载 | 全量 7,058 题 fetch + IndexedDB 缓存 |
| 付费 | 先免费 |
| 托管 | Vercel 静态站点（免费） |
| 域名 | 默认 `*.vercel.app`，可选自定义域名 |

## 架构

```
浏览器 (华为手机 / iPad)
    │
    ├─ fetch() → DeepSeek API（用户自带 Key）
    ├─ fetch() → questions.json（首次 16MB，CDN 缓存）
    ├─ IndexedDB  ← 题库本地缓存
    └─ localStorage ← 错题记录、收藏、设置、API Key

Vercel 静态托管 (免费)
├── index.html       ← 应用主体
├── manifest.json    ← PWA 配置
├── sw.js            ← Service Worker
├── questions.json   ← 题库数据 (16MB)
└── knowledge.json   ← 知识库 (126KB)
```

## 代码改造

### 去掉的内容
- `main.js`（Electron 主进程）
- `preload.js`（IPC 桥接）
- `package.json` 中的 Electron 依赖
- 所有 `window.aiTeacher.*` 调用

### 新增的内容
- DeepSeek API 前端直连（fetch + streaming）
- IndexedDB 封装（题库缓存层）
- PWA 三件套（manifest.json / sw.js / 图标）
- 安装提示 UI（浏览器原生 "添加到桌面" 横幅）

### 保留的内容
- index.html 的全部 CSS 和 90% JS 逻辑
- 题库数据结构不变
- 刷题、错题本、收藏、搜索、筛选、统计等功能不变

## PWA 配置

- manifest.json：name="法考刷题助手"，display=standalone（全屏沉浸）
- Service Worker：预缓存 HTML/CSS/JS + 运行时缓存 questions.json
- 离线能力：已缓存的题目离线可刷，AI 功能需联网

## 部署

- 代码推送 GitHub
- Vercel 连接 GitHub 仓库，自动构建部署
- 每次 git push 自动更新线上版本

## 功能范围

| 功能 | PWA 版 | 说明 |
|------|--------|------|
| 科目筛选 | ✅ | 民法/刑法/行政法/宪法等 |
| 单选/多选/主观题 | ✅ | 含案例分析 |
| 随机出题 | ✅ | |
| 答案解析 | ✅ | 含法条引用 |
| 错题本 | ✅ | localStorage |
| 收藏 | ✅ | localStorage |
| 搜索 | ✅ | 全局搜索题目 |
| 答题统计 | ✅ | |
| AI 辅导 | ✅ | 用户自带 DeepSeek Key |
| 离线刷题 | ✅ | Service Worker 缓存 |

## 非目标（本版不做）

- 用户账号系统
- 云端同步
- 付费/激活码
- 后台管理
- 数据统计后台
