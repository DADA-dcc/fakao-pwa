const CACHE_NAME = 'fakao-v17';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './questions/index.json',
  './knowledge.json',
  './case_library.json',
  './icon-192.png',
  './icon-512.png',
  // 120BPM 动态封面启动页及其本地化依赖（离线也能播放）
  './cover.html',
  './vendor/tailwind-3.4.17.js',
  './vendor/three.r128.min.js'
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

  // HTML: network-first so users always get latest code
  if (event.request.destination === 'document') {
    event.respondWith(
      // no-cache：在线时强制向服务器校验，保证每次打开都是最新版本（离线自动回退缓存）
      fetch(event.request, { cache: 'no-cache' })
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets: cache-first, update cache in background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {});
      return cached || fetchPromise;
    })
  );
});
