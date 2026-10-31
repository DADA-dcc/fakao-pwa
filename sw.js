/**
 * 法考刷题助手 (fakao-pwa) 升级版 Service Worker (v13)
 * 优化点：
 * 1. 拆分核心外壳 (CORE_SHELL) 与 大体积题库资源 (DATA_ASSETS)，避免 caches.addAll 因单个文件超时导致整个 SW 安装失败
 * 2. 对题库 JSON (./questions/index.json, ./knowledge.json, ./case_library.json) 采用 Stale-While-Revalidate 策略：秒开离线缓存，后台静默更新
 * 3. 对外部 AI 接口 (api.deepseek.com) 与 GitHub Gist 同步接口 (api.github.com) 严格走 Network Only，防止缓存污染
 * 4. 支持客户端发送 SKIP_WAITING 消息实现一键热更新
 */

const CACHE_VERSION = 'fakao-v24';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;

const CORE_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

const OPTIONAL_ASSETS = [
  './cover.html',
  './vendor/three.r128.min.js',
  './vendor/GLTFLoader.js',
  './assets/models/legal.glb',
  './vendor/tailwind-3.4.17.js',
  './questions/index.json',
  './knowledge.json',
  './case_library.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shellCache = await caches.open(SHELL_CACHE);
      // 核心外壳逐个容错缓存，防止单点失败
      await Promise.allSettled(
        CORE_SHELL.map((url) =>
          shellCache.add(url).catch((err) => console.warn('[SW] Core cache skipped:', url, err))
        )
      );

      const dataCache = await caches.open(DATA_CACHE);
      await Promise.allSettled(
        OPTIONAL_ASSETS.map((url) =>
          dataCache.add(url).catch((err) => console.warn('[SW] Optional asset skipped:', url, err))
        )
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== SHELL_CACHE && key !== DATA_CACHE) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 排除 AI 接口与 GitHub Gist 同步 API
  if (
    url.hostname.includes('deepseek.com') ||
    url.hostname.includes('api.github.com')
  ) {
    return;
  }

  // 针对 JSON 题库与知识点数据：Stale-While-Revalidate（优先读缓存秒开，同时后台拉取最新题库更新缓存）
  if (url.pathname.endsWith('.json') && !url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => null);

        return cached || (await networkPromise) || new Response('{}', {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })()
    );
    return;
  }

  // 针对页面导航与静态资源：Cache First + Network Fallback + 后台更新
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        // 后台静默更新 HTML
        if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
          fetch(request)
            .then(async (res) => {
              if (res && res.status === 200) {
                const shellCache = await caches.open(SHELL_CACHE);
                await shellCache.put(request, res.clone());
              }
            })
            .catch(() => {});
        }
        return cached;
      }

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const targetCache = await caches.open(SHELL_CACHE);
          targetCache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        if (request.mode === 'navigate') {
          const fallback = await caches.match('./index.html');
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
