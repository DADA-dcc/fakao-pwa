/**
 * 法考刷题助手 (fakao-pwa) 升级版 Service Worker (v34)
 * 优化点：
 * 1. 拆分核心外壳 (CORE_SHELL) 与 大体积题库资源 (DATA_ASSETS)，避免 caches.addAll 因单个文件超时导致整个 SW 安装失败
 * 2. 安装时预缓存 12 个分科题库（分批、跳过已缓存项），保证添加到主屏幕后离线也能刷全部科目
 * 3. 对题库 JSON 采用 Cache First + 24 小时新鲜期：新鲜期内直接返回缓存，不发后台请求，
 *    避免每次冷启动在移动网络下重新拉取约 20MB 题库；过期后仍按 Stale-While-Revalidate 更新
 * 4. 对外部 AI 接口 (api.deepseek.com) 与 GitHub Gist 同步接口 (api.github.com) 严格走 Network Only
 * 5. 支持客户端发送 SKIP_WAITING 消息实现一键热更新
 * 6. 2026-11-14：index.html 增加题干 pre-line 换行保留与【共享案情】折叠卡片。
 *    仅变更本文件内容即可让浏览器触发 updatefound 并弹出更新提示；
 *    CACHE_VERSION 故意保持不变，activate 不会删除同名缓存，
 *    QUESTION_ASSETS 经 ensureCached 跳过已缓存项，避免重复下载约 20MB 题库。
 *    install 会重新 add CORE_SHELL，因此新的 index.html 仍会被写入外壳缓存。
 */

const CACHE_VERSION = 'fakao-v34';
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
  './vendor/three.r128.min.js',
  './vendor/GLTFLoader.js',
  './assets/models/legal.glb',
  './vendor/tailwind-3.4.17.js',
  './questions/index.json',
  './knowledge.json',
  './case_library.json'
];

// 分科题库：离线刷题的关键数据（合计约 20MB），安装时分批预缓存
const QUESTION_ASSETS = [
  './questions/民法.json',
  './questions/刑法.json',
  './questions/行政法.json',
  './questions/民诉法.json',
  './questions/刑诉法.json',
  './questions/商经法.json',
  './questions/宪法.json',
  './questions/知识产权法.json',
  './questions/国际法.json',
  './questions/法理学.json',
  './questions/法制史.json',
  './questions/司法制度与职业道德.json'
];

// 只缓存缺失项：SW 自身更新时不会重复下载已有的 20MB 题库
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
      // 大体积题库每批 2 个，避免移动端并发下载拖慢首次安装或被系统中断
      for (let i = 0; i < QUESTION_ASSETS.length; i += 2) {
        await Promise.all(
          QUESTION_ASSETS.slice(i, i + 2).map((url) => ensureCached(dataCache, url))
        );
      }
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
