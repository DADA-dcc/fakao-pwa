/**
 * 法考刷题助手 (fakao-pwa) Service Worker
 * 缓存策略：
 * - 核心外壳 CORE_SHELL：install 时逐个容错预缓存；导航/HTML 命中缓存后后台静默更新。
 * - 题库 JSON：questions/index.json 走 Network First（5s 超时回落缓存）；
 *   其余 .json 走 Cache First + 24h 新鲜期，过期 Stale-While-Revalidate。
 *   分块 URL 由页面附加 ?v=<version>，题库版本变化即换缓存键，无需升 SW 版本。
 * - 题库离线补齐：页面在 Wi-Fi/桌面下发 PREFETCH_QUESTIONS（携带 ?v= 键）分批缓存。
 * - 外部接口（api.deepseek.com 自备 Key 回退、api.github.com Gist 同步）不走缓存。
 * - 客户端发 SKIP_WAITING 实现一键热更新。
 * 升级约定：改动 index.html/数据时升 CACHE_VERSION，让浏览器触发 updatefound；
 * activate 会清理非当前 SHELL/DATA 的旧缓存。
 */

// v39：主应用 AI 改走同源 /api/*、题库勘误（index v13）、预缓存键与实际请求对齐。
// 外壳与数据缓存一并升版：activate 清掉旧缓存，题库按新的 ?v=v13 键重新下载一次。
const CACHE_VERSION = 'fakao-v39';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const DATA_CACHE = `${CACHE_VERSION}-data`;
const JSON_REVALIDATE_MS = 24 * 60 * 60 * 1000;

const CORE_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

const OPTIONAL_ASSETS = [
  './cover.html',
  './questions/index.json',
  './case_library.json'
];

// 只缓存缺失项：SW 自身更新时不会重复下载已有的题库
async function ensureCached(cache, url) {
  try {
    if (await cache.match(url)) return;
    await cache.add(url);
  } catch (err) {
    console.warn('[SW] Asset cache skipped:', url, err);
  }
}

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
      // 小体积资源并发缓存
      await Promise.all(OPTIONAL_ASSETS.map((url) => ensureCached(dataCache, url)));
      // 题库改为按需缓存：由页面在 Wi-Fi 下主动发 PREFETCH_QUESTIONS 触发
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
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  // 页面在 Wi-Fi / 桌面环境请求后台补齐其余题库（分批，避免并发过高）
  if (data.type === 'PREFETCH_QUESTIONS' && Array.isArray(data.files)) {
    event.waitUntil((async () => {
      const cache = await caches.open(DATA_CACHE);
      const files = data.files.filter((f) => typeof f === 'string' && f.indexOf('./questions/') === 0);
      for (let i = 0; i < files.length; i += 3) {
        await Promise.all(files.slice(i, i + 3).map((f) => ensureCached(cache, f).catch(() => null)));
      }
    })());
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 排除外部 AI 回退接口与 GitHub Gist 同步 API（同源 /api/* 为 POST，本就不拦截）
  if (
    url.hostname.includes('deepseek.com') ||
    url.hostname.includes('api.github.com')
  ) {
    return;
  }

  // questions/index.json 是题库清单：Network First（5s 超时回落缓存），
  // 保证题库版本变化能被尽快感知；分块 URL 由页面附加 ?v=<version>，版本变即换缓存键。
  if (url.pathname.endsWith('/questions/index.json')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(request);
        try {
          const net = await Promise.race([
            fetch(request, { cache: 'no-store' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]);
          if (net && net.status === 200) cache.put(request, net.clone());
          return net;
        } catch (err) {
          return cached || new Response('{}', {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // 针对 JSON 题库与知识点数据：Cache First（24h 新鲜期）+ 过期 Stale-While-Revalidate
  if (url.pathname.endsWith('.json') && !url.pathname.endsWith('manifest.json')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        const cached = await cache.match(request);
        if (cached) {
          const dateStr = cached.headers.get('date');
          const ageMs = dateStr ? Date.now() - Date.parse(dateStr) : NaN;
          if (Number.isFinite(ageMs) && ageMs >= 0 && ageMs < JSON_REVALIDATE_MS) {
            return cached;
          }
        }
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
