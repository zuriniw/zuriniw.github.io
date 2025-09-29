const CACHE_NAME = 'site-images-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    )
  );
  self.clients.claim();
});

// 图片请求使用 Cache-First，其他资源走网络（保持原有行为）
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const isImage = req.destination === 'image' || /\.(?:png|jpe?g|gif|webp|svg)$/i.test(new URL(req.url).pathname);
  const sameOrigin = new URL(req.url).origin === self.location.origin;

  if (isImage && sameOrigin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const hit = await cache.match(req);
        if (hit) return hit;
        try {
          const resp = await fetch(req, { credentials: 'same-origin' });
          // 仅在 200 且基本有效时缓存
          if (resp && resp.status === 200) cache.put(req, resp.clone());
          return resp;
        } catch (err) {
          // 离线兜底：返回缓存中旧版本（若存在）
          const fallback = await cache.match(req, { ignoreSearch: true });
          if (fallback) return fallback;
          throw err;
        }
      })
    );
  }
});

