# 法考刷题助手 PWA 改造 - 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Electron 桌面版法考刷题助手改造为 PWA 网页版，支持手机/平板浏览器使用并添加到桌面。

**Architecture:** 单文件 HTML 应用 + PWA manifest + Service Worker 离线缓存。题库通过 IndexedDB 本地缓存，AI 功能通过用户自带 DeepSeek Key 浏览器端直连 API。

**Tech Stack:** Vanilla HTML/CSS/JS, IndexedDB, Service Worker API, DeepSeek API (fetch + SSE streaming)

---

### Task 1: 创建 PWA 配置文件

**Files:**
- Create: `C:\Users\熊帅\falvkaoshi-bot\manifest.json`
- Create: `C:\Users\熊帅\falvkaoshi-bot\sw.js`

- [ ] **Step 1: 创建 manifest.json**

```json
{
  "name": "法考刷题助手",
  "short_name": "法考刷题",
  "description": "法考备考刷题练习助手，支持民法、刑法、行政法等多科目",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f0f4f8",
  "theme_color": "#1a3a6b",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 2: 创建 sw.js（Service Worker）**

```javascript
const CACHE_NAME = 'fakao-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/questions.json',
  '/knowledge.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || fetched;
    })
  );
});
```

- [ ] **Step 3: 注册 Service Worker**

在 `index.html` 的 `</body>` 前、主 `<script>` 标签的开始位置添加 SW 注册代码。

找到 `(async function() {`（约第1384行），在它之前插入：

```javascript
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
</script>
```

- [ ] **Step 4: 添加 manifest link**

在 `index.html` 的 `<head>` 中添加：

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#1a3a6b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="法考刷题助手">
<link rel="apple-touch-icon" href="icon-192.png">
```

- [ ] **Step 5: 提交**

```bash
git add manifest.json sw.js index.html
git commit -m "feat: add PWA manifest and service worker"
```

---

### Task 2: 替换 Electron IPC 调用

**Files:**
- Modify: `C:\Users\熊帅\falvkaoshi-bot\index.html`

关键：将 `window.aiTeacher.*` 调用替换为浏览器原生 API。共 4 处改动。

- [ ] **Step 1: 替换 getApiKey 和 saveApiKey**

第一个改点：`hasApiKey` 函数（约2128行）和 API Key 管理（约2135-2161行）

找到：
```javascript
async function hasApiKey() {
    try {
      const key = await window.aiTeacher.getApiKey();
      return !!key;
    } catch { return false; }
  }

  $aiSettingsBtn.addEventListener('click', async () => {
    const key = await window.aiTeacher.getApiKey();
    $apiKeyInput.value = key;
    $apiKeyStatus.className = 'modal-status';
    $apiKeyModal.classList.add('show');
  });
```

替换为：
```javascript
function hasApiKey() {
    return !!localStorage.getItem('fakao_apikey');
  }

  $aiSettingsBtn.addEventListener('click', () => {
    const key = localStorage.getItem('fakao_apikey') || '';
    $apiKeyInput.value = key;
    $apiKeyStatus.className = 'modal-status';
    $apiKeyModal.classList.add('show');
  });
```

找到：
```javascript
document.getElementById('apiKeySave').addEventListener('click', async () => {
    const key = $apiKeyInput.value.trim();
    if (!key) {
      $apiKeyStatus.className = 'modal-status show err';
      $apiKeyStatus.textContent = '请输入有效的 API Key';
      return;
    }
    await window.aiTeacher.saveApiKey(key);
    $apiKeyStatus.className = 'modal-status show ok';
    $apiKeyStatus.textContent = 'API Key 已保存';
    setTimeout(() => $apiKeyModal.classList.remove('show'), 800);
  });
```

替换为：
```javascript
document.getElementById('apiKeySave').addEventListener('click', () => {
    const key = $apiKeyInput.value.trim();
    if (!key) {
      $apiKeyStatus.className = 'modal-status show err';
      $apiKeyStatus.textContent = '请输入有效的 API Key';
      return;
    }
    localStorage.setItem('fakao_apikey', key);
    $apiKeyStatus.className = 'modal-status show ok';
    $apiKeyStatus.textContent = 'API Key 已保存';
    setTimeout(() => $apiKeyModal.classList.remove('show'), 800);
  });
```

- [ ] **Step 2: 替换 chatStream 为 DeepSeek API 直连**

找到 `sendToAI` 函数（约2194行）中的：
```javascript
      await window.aiTeacher.chatStream(messages, function(chunk) {
        var last = chatHistory[chatHistory.length - 1];
        last.content += chunk;
        updateLastBubble(last.content);
      });
```

替换为：
```javascript
      const apiKey = localStorage.getItem('fakao_apikey');
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'API 请求失败 (' + response.status + ')');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              const last = chatHistory[chatHistory.length - 1];
              last.content += delta;
              updateLastBubble(last.content);
            }
          } catch {}
        }
      }
```

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: replace Electron IPC with browser-native DeepSeek API calls"
```

---

### Task 3: 添加 IndexedDB 题库缓存

**Files:**
- Modify: `C:\Users\熊帅\falvkaoshi-bot\index.html`

- [ ] **Step 1: 在脚本开头添加 IndexedDB 工具函数**

在 `(async function() {` 之后、`let questions = [];` 之前插入：

```javascript
  // ── IndexedDB 题库缓存 ──
  const DB_NAME = 'fakao_cache';
  const DB_VERSION = 1;

  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('questions')) {
          req.result.createObjectStore('questions', { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function loadQuestionsFromCache() {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('questions', 'readonly');
      const store = tx.objectStore('questions');
      const getAll = store.getAll();
      getAll.onsuccess = () => {
        db.close();
        resolve(getAll.result.length > 0 ? getAll.result : null);
      };
      getAll.onerror = () => { db.close(); resolve(null); };
    });
  }

  async function saveQuestionsToCache(questions) {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('questions', 'readwrite');
      const store = tx.objectStore('questions');
      for (const q of questions) { store.put(q); }
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); resolve(); };
    });
  }
```

- [ ] **Step 2: 修改题库加载逻辑，优先从 IndexedDB 读取**

找到（约1386行）：
```javascript
  let questions = [];
  try {
    const res = await fetch('questions.json');
    questions = await res.json();
  } catch {
    document.getElementById('questionCard').innerHTML =
      '<div class="empty-state">⚠ 题库加载失败，请确认 questions.json 文件存在</div>';
    return;
  }
```

替换为：
```javascript
  let questions = [];
  try {
    // 优先从 IndexedDB 缓存读取
    const cached = await loadQuestionsFromCache();
    if (cached) {
      questions = cached;
      console.log('题库从缓存加载：' + questions.length + ' 题');
    } else {
      const res = await fetch('questions.json');
      questions = await res.json();
      // 后台写入缓存
      saveQuestionsToCache(questions).catch(() => {});
    }
  } catch {
    document.getElementById('questionCard').innerHTML =
      '<div class="empty-state">⚠ 题库加载失败，请检查网络连接</div>';
    return;
  }
```

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: add IndexedDB question cache for fast subsequent loads"
```

---

### Task 4: 移动端适配

**Files:**
- Modify: `C:\Users\熊帅\falvkaoshi-bot\index.html`

- [ ] **Step 1: 添加 viewport 和移动端 CSS 修复**

确认 `<meta name="viewport">` 标签存在且正确（第5行已有，无需改）。

在 CSS 区域（`</style>` 之前）添加移动端响应式样式：

```css
  /* ── Mobile responsive ── */
  @media (max-width: 600px) {
    .app { padding: 16px 12px 32px; }
    .header { padding: 20px 0 16px; }
    .header h1 { font-size: 22px; }
    .filter-bar { gap: 6px; }
    .filter-btn { padding: 6px 14px; font-size: 13px; }
    .card { padding: 20px 16px; }
    .question-text { font-size: 15px; line-height: 1.7; }
    .option { padding: 12px 14px; font-size: 14px; }
    .stats-row { gap: 16px; font-size: 13px; }
    .actions { gap: 10px; flex-wrap: wrap; }
    .btn { padding: 8px 20px; font-size: 14px; }
    .wrong-panel { padding: 16px 20px; }
  }
```

- [ ] **Step 2: 提交**

```bash
git add index.html
git commit -m "feat: add mobile responsive styles"
```

---

### Task 5: 初始化 Git 仓库并部署到 Vercel

**验证项:**
- 确认 `C:\Users\熊帅\falvkaoshi-bot` 已是 git 仓库
- 配置 `.gitignore` 排除 node_modules 和 Electron 残留

- [ ] **Step 1: 创建 .gitignore**

```gitignore
node_modules/
.bin/
*.log
.page-*.yml
console-*.log
.vite/
.DS_Store
```

- [ ] **Step 2: 初始提交**

```bash
git add -A
git commit -m "feat: PWA 版法考刷题助手 - 初始版本"
```

- [ ] **Step 3: 推送到 GitHub**

```bash
gh repo create fakao-pwa --public --source=. --push
```

- [ ] **Step 4: 部署到 Vercel**

在浏览器打开 https://vercel.com/new ，导入刚刚创建的 GitHub 仓库，使用默认配置即可。

或者用 CLI：
```bash
npx vercel --prod
```

- [ ] **Step 5: 在手机和 iPad 上测试**

用手机浏览器打开 Vercel 分配的域名（如 `fakao-pwa.vercel.app`），确认：
- 页面加载正常
- 题库显示正确
- AI 功能（设置 Key 后可对话）
- 添加到主屏幕后能以全屏模式打开
- 离线缓存生效（飞行模式下打开已缓存的页面）

---

### Task 6: 最终验证

- [ ] **Step 1: 在项目目录启动本地服务器测试**

```bash
npx serve .
```

打开 http://localhost:3000 验证所有功能。

- [ ] **Step 2: Lighthouse PWA 审计**

在 Chrome DevTools → Lighthouse → 勾选 PWA，运行审计。确保 PWA 评分 90+。

- [ ] **Step 3: 提交最终调整**

```bash
git add -A && git commit -m "chore: final adjustments and cleanup"
git push
```
