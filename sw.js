/**
 * 法考智练 (fakao-pwa) Service Worker
 * 缓存策略：
 * - 核心外壳 CORE_SHELL：install 时逐个容错预缓存；导航/HTML 命中缓存后后台静默更新。
 * - 题库 JSON：questions/index.json 走 Stale-While-Revalidate（有缓存立即返回；后台 3s 超时重验证，
 *   成功写缓存，版本变化时向页面广播 QUESTION_INDEX_UPDATED；无缓存且失败/超时返回 504）；
 *   其余 .json 走 Cache First + 24h 新鲜期，过期 Stale-While-Revalidate。
 *   分块 URL 由页面附加 ?v=<version>，题库版本变化即换缓存键，无需升 SW 版本。
 * - 题库离线补齐：页面在 Wi-Fi/桌面下发 PREFETCH_QUESTIONS（携带 ?v= 键）分批缓存。
 * - 外部接口（api.deepseek.com 自备 Key 回退、api.github.com Gist 同步）不走缓存。
 * - 客户端发 SKIP_WAITING 实现一键热更新。
 * 升级约定：改动 sw.js 时仍按惯例升 CACHE_VERSION；index.html 的变化由 install/activate 时的
 * 内容哈希兜底（外壳缓存键追加 -<hash8>，P2-4），忘升版本也会强制缓存新 HTML。
 * activate 会清理非当前 SHELL/DATA/META 的旧缓存。
 */

// v44：P2-1 清理旧版本题库缓存（?v= 不等于当前版本的条目），避免每个题库版本残留 ~23MB。
// v45：P2-9 开屏 3D 本机仅首次 + 释放 WebGL；P2-10 Hero rAF 按可见性启停；P2-13 主观题不计入正确率；P2-15 记忆学习位置。
// v46：P2-5 manifest 快捷方式 ?go= 启动跳转；P2-14 复习间隔改为连续答对次数（streak）驱动。
// v47：P2-8 错题列表分页 + 事件委托；P2-3 index.json 改 Stale-While-Revalidate（3s 超时）+ 版本更新广播；
//      P2-4 install/activate 计算 index.html 内容哈希，HTML 变化时外壳缓存键追加 -<hash8>。
// v48：P2-17 快捷键冲突（排除按钮/链接/可编辑、忽略 repeat、弹窗仅 Esc、开屏期间屏蔽）；
//      P2-22 倒计时改为动态「下一次 9 月第三个周六 09:00」；P2-26 DeepSeek 直连 20s 超时 + 按钮防重复。
// v50：P2-28 移除「不定项」题型筛选项（题库 0 题），题型筛选非法值初始化时回落「全部题型」。
// v51：P2-18 Gist 同步补传错因标签、拉取改「较新优先」合并；P2-19 备份恢复逐字段类型清洗。
// v52：P2-30 无障碍语义（弹窗 dialog + 标题关联、模式按钮 aria-pressed、输入框 aria-label、选项 radio/checkbox）。
// v53：P2-20 错题本提示「未加载科目」中的错题数，并提供按钮按需加载（省流量默认行为不变）。
const CACHE_VERSION = 'fakao-v56';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;   // 兜底外壳键：无元数据记录时使用
const DATA_CACHE = `${CACHE_VERSION}-data`;
const JSON_REVALIDATE_MS = 24 * 60 * 60 * 1000;
const INDEX_TIMEOUT_MS = 3000;        // P2-3：index.json 重验证超时；activate 拉 HTML 也用它，避免久阻塞 fetch 事件
const HTML_PROBE_TIMEOUT_MS = 8000;   // P2-4：install 阶段拉 HTML 的超时（install 不阻塞页面）

// P2-4：外壳缓存键元数据，存独立缓存（activate 清理时保留）。
// pending = install 算出的键（新 SW 等待期间不影响旧 SW）；active = activate 后生效、fetch 使用的键。
const META_CACHE = 'fakao-meta';
const META_PENDING = './__fk_meta__/shell-pending';
const META_ACTIVE = './__fk_meta__/shell-active';
let activeShellCacheName = null;   // 内存缓存；SW 被回收重启后从 META_ACTIVE 恢复

// 同步字符串哈希：FNV-1a 32 位 → 8 位十六进制（不依赖 crypto.subtle）
function hashString8(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// 带超时的 no-store 请求：无论成功/失败/超时都在 finally 清理定时器；超时会 abort 底层请求
async function fetchWithTimeout(input, ms) {
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  let timer = null;
  try {
    return await Promise.race([
      fetch(input, ctrl ? { cache: 'no-store', signal: ctrl.signal } : { cache: 'no-store' }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          if (ctrl) { try { ctrl.abort(); } catch (e) {} }
          reject(new Error('timeout'));
        }, ms);
      })
    ]);
  } finally {
    if (timer !== null) clearTimeout(timer);
  }
}

async function readMeta(key) {
  try {
    const cache = await caches.open(META_CACHE);
    const res = await cache.match(key);
    return res ? await res.json() : null;
  } catch (e) {
    return null;
  }
}

async function writeMeta(key, obj) {
  try {
    const cache = await caches.open(META_CACHE);
    await cache.put(key, new Response(JSON.stringify(obj), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) {}
}

// P2-4：绕过 HTTP 缓存拉取最新 index.html 并算哈希；失败/超时返回 null
async function fetchFreshHtml(ms) {
  try {
    const res = await fetchWithTimeout('./index.html', ms);
    if (!res || res.status !== 200) return null;
    const text = await res.text();
    const type = res.headers.get('Content-Type') || 'text/html; charset=utf-8';
    return { text, type, hash: hashString8(text) };
  } catch (e) {
    return null;
  }
}

// 每次新建 HTML 响应：body 可重复写入多个键，且避开 redirected 响应不能用于导航的问题
function makeHtmlResponse(fresh) {
  return new Response(fresh.text, { status: 200, headers: { 'Content-Type': fresh.type } });
}

// 决定外壳预缓存版本：HTML 哈希与上次不同 → CACHE_VERSION-<hash8>；相同或拉取失败 → 保持原键
function resolveShellVersion(prev, fresh) {
  const prevVersion = prev && prev.base === CACHE_VERSION && prev.version ? prev.version : CACHE_VERSION;
  if (!fresh) return prevVersion;
  if (prev && prev.hash === fresh.hash) return prevVersion;
  return `${CACHE_VERSION}-${fresh.hash}`;
}

async function getShellCacheName() {
  if (activeShellCacheName) return activeShellCacheName;
  const meta = await readMeta(META_ACTIVE);
  activeShellCacheName = meta && meta.base === CACHE_VERSION && meta.version
    ? `${meta.version}-shell`
    : SHELL_CACHE;
  return activeShellCacheName;
}

async function broadcastToClients(msg) {
  try {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    list.forEach((c) => { try { c.postMessage(msg); } catch (e) {} });
  } catch (e) {}
}

async function readIndexVersion(res) {
  try {
    const data = await res.json();
    return data && data.version != null ? String(data.version) : '';
  } catch (e) {
    return '';
  }
}

// P2-3：后台重验证 index.json。200 → 写缓存；与旧缓存版本不同 → 广播 QUESTION_INDEX_UPDATED。
// 返回网络响应（任意状态）；失败/超时返回 null。
async function revalidateQuestionIndex(request, cachedProbe) {
  let res = null;
  try {
    res = await fetchWithTimeout(request, INDEX_TIMEOUT_MS);
  } catch (e) {
    return null;
  }
  if (!res || res.status !== 200) return res || null;
  try {
    const forCache = res.clone();
    const forRead = cachedProbe ? res.clone() : null;
    const cache = await caches.open(DATA_CACHE);
    await cache.put(request, forCache);
    if (forRead) {
      const [oldVersion, newVersion] = await Promise.all([readIndexVersion(cachedProbe), readIndexVersion(forRead)]);
      // 只在版本确实变化时广播：页面此刻可能还没解析完旧 index.json，同版本广播会误报
      if (newVersion && newVersion !== oldVersion) {
        await broadcastToClients({ type: 'QUESTION_INDEX_UPDATED', version: newVersion });
      }
    }
  } catch (e) {}
  return res;
}

const CORE_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  // 首屏样式：缺任何一个都会白屏/错版，必须随 install 预缓存
  './assets/app.bundle.css',
  // P2-24：8 段内联脚本已外置为独立文件（去 script-src unsafe-inline），必须预缓存
  './assets/inline-1.4b59655a.js',
  './assets/inline-2.abd17655.js',
  './assets/inline-3.00db6ccc.js',
  './assets/inline-4.56a9715e.js',
  './assets/inline-5.f33b3e21.js',
  './assets/inline-6.d729338c.js',
  './assets/inline-7.f33721a9.js',
  './assets/inline-8.a316be4e.js',
  // 题库解析 Worker：缺了它离线时题目加载会失败
  './workers/questions-worker.js'
];

const OPTIONAL_ASSETS = [
  './cover.html',
  // 注意：不再预缓存 ./questions/index.json 与 ./case_library.json。
  // 它们首次访问时会被页面的 fetch 处理器按 JSON 策略缓存；若这里也 add 一次，
  // 首访就会重复下载一遍（P1-13 记录的"首访重复下载"即由此产生）。
  // 体积较大、仅 3D 开屏用到，失败不影响刷题
  './vendor/three.r128.min.js',
  './vendor/GLTFLoader.js',
  './assets/models/legal.glb'
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
      // P2-4：拉最新 HTML 算哈希，决定本次外壳预缓存键（与上次不同则追加 -<hash8>）
      const prev = (await readMeta(META_PENDING)) || (await readMeta(META_ACTIVE));
      const fresh = await fetchFreshHtml(HTML_PROBE_TIMEOUT_MS);
      const shellVersion = resolveShellVersion(prev, fresh);
      const shellCache = await caches.open(`${shellVersion}-shell`);
      // 核心外壳逐个容错缓存，防止单点失败；HTML 直接写入刚拉到的 no-store 版本，确保是新内容
      await Promise.allSettled(
        CORE_SHELL.map((url) => {
          const job = fresh && (url === './' || url === './index.html')
            ? shellCache.put(url, makeHtmlResponse(fresh))
            : shellCache.add(url);
          return job.catch((err) => console.warn('[SW] Core cache skipped:', url, err));
        })
      );
      await writeMeta(META_PENDING, {
        base: CACHE_VERSION,
        version: shellVersion,
        hash: fresh ? fresh.hash : ((prev && prev.base === CACHE_VERSION && prev.hash) || '')
      });

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
      let meta = await readMeta(META_PENDING);
      if (!meta || meta.base !== CACHE_VERSION || !meta.version) {
        meta = { base: CACHE_VERSION, version: CACHE_VERSION, hash: '' };
      }
      // P2-4：等待期间 HTML 可能又发布过 → 再校验一次；变了就换新键：复制旧外壳 + 写入新 HTML。
      // 失败/超时保持 install 时的键。
      const fresh = await fetchFreshHtml(INDEX_TIMEOUT_MS);
      if (fresh && fresh.hash !== meta.hash) {
        const nextVersion = `${CACHE_VERSION}-${fresh.hash}`;
        try {
          const to = await caches.open(`${nextVersion}-shell`);
          if (nextVersion !== meta.version) {
            const from = await caches.open(`${meta.version}-shell`);
            const reqs = await from.keys();
            await Promise.all(reqs.map(async (req) => {
              const r = await from.match(req);
              if (r) await to.put(req, r);
            }));
          }
          await to.put('./index.html', makeHtmlResponse(fresh));
          await to.put('./', makeHtmlResponse(fresh));
          meta = { base: CACHE_VERSION, version: nextVersion, hash: fresh.hash };
        } catch (err) {
          console.warn('[SW] HTML re-precache skipped:', err);
        }
      }
      await writeMeta(META_ACTIVE, meta);
      activeShellCacheName = `${meta.version}-shell`;

      const keep = new Set([activeShellCacheName, DATA_CACHE, META_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => (keep.has(key) ? null : caches.delete(key))));
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
  // P2-1：页面拿到新题库版本后通知清理旧版本分片，避免历史 ?v= 缓存无限堆积
  if (data.type === 'PRUNE_QUESTION_CACHE' && typeof data.version === 'string' && data.version) {
    event.waitUntil((async () => {
      try {
        const cache = await caches.open(DATA_CACHE);
        const reqs = await cache.keys();
        let removed = 0;
        for (const req of reqs) {
          const u = new URL(req.url);
          if (u.pathname.indexOf('/questions/') === -1) continue;
          const v = u.searchParams.get('v');
          if (v && v !== data.version) {
            await cache.delete(req);
            removed++;
          }
        }
        if (removed) console.info('[SW] pruned stale question cache entries:', removed);
      } catch (e) {}
    })());
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

  // P2-3：questions/index.json 改为 Stale-While-Revalidate：
  // 有缓存立即返回，后台 3s 超时重验证并写缓存，版本变化时广播 QUESTION_INDEX_UPDATED；
  // 无缓存时等网络，失败/超时返回 504。分块 URL 仍由页面附加 ?v=<version>，版本变即换缓存键。
  if (url.pathname.endsWith('/questions/index.json')) {
    // 在交给页面之前先 clone 一份供版本比对（Response body 只能读一次）
    const entryP = caches.open(DATA_CACHE)
      .then((cache) => cache.match(request))
      .then((cached) => ({ cached: cached || null, probe: cached ? cached.clone() : null }))
      .catch(() => ({ cached: null, probe: null }));
    const netP = entryP
      .then((entry) => revalidateQuestionIndex(request, entry.probe))
      .catch(() => null);
    event.respondWith(
      (async () => {
        const entry = await entryP;
        if (entry.cached) return entry.cached;
        const net = await netP;
        return net || new Response('{}', {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        });
      })()
    );
    event.waitUntil(netP);
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
                const shellCache = await caches.open(await getShellCacheName());
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
          const targetCache = await caches.open(await getShellCacheName());
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
