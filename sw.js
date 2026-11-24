/* ═══════════════════════════════════════════════
   Service Worker — لوحة الشرف
═══════════════════════════════════════════════ */
const CACHE = 'honor-board-v5';

const PRECACHE = [
  './index.html',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap'
];

/* ─── Install: pre-cache shell ─── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(['./index.html']))
      .catch(() => {})     // non-fatal if offline on first install
  );
  self.skipWaiting();
});

/* ─── Activate: clean up old caches ─── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ─── Fetch: cache-first for shell, network-first for fonts ─── */
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Never cache AI generation requests
  if (url.includes('pollinations.ai')) return;

  // For navigation (HTML) or same-origin: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        if (resp && resp.ok && event.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(event.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match('./index.html')); // offline fallback
    })
  );
});
