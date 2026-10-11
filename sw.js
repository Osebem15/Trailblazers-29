const CACHE_NAME = 'tb29-portal-v11';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './auth.js',
  './manifest.json',
  './favicon-32.jpg',
  './icon-192.jpg',
  './icon-512.jpg',
  './Unilag logo.jfif'
];

// Resilient install listener: caches each asset individually
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) =>
          cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Skipped missing or unresolvable asset: ${asset}`);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Live APIs (Supabase, Google) and third-party scripts go straight to the network.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isCode = req.mode === 'navigate' ||
    ['document', 'script', 'style', 'manifest'].includes(req.destination);

  if (isCode) {
    // Network first: a new deploy shows up right away. The cache is only the offline fallback.
    // (A navigation request cannot be rebuilt with options, so only sub-resources force revalidation.)
    const netReq = req.mode === 'navigate' ? req : new Request(req, { cache: 'no-cache' });
    event.respondWith(
      fetch(netReq)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(async () => {
          const hit = await caches.match(req);
          if (hit) return hit;
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
    );
    return;
  }

  // Images and fonts rarely change: cache first.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

// Web Push: show the announcement even when the app is closed.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || "Trailblazers '29 Portal";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'You have a new announcement.',
      icon: './icon-192.jpg',
      badge: './favicon-32.jpg',
      vibrate: [200, 100, 200],
      // Same tag as the in-app alert, so one announcement never shows twice.
      tag: data.tag || 'tb29-announcement'
    })
  );
});

// Mobile push notification tap action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow(self.registration.scope);
    })
  );
});
