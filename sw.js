const CACHE_NAME = 'tb29-portal-v21';
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
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined))))
      .then(() => self.clients.claim())
  );
});

// Safari refuses to show a page when the service worker answers with a response that went through a
// redirect. Rebuild such a response so the offline fallback always works.
async function cleanRedirect(res) {
  if (!res || !res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

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
          if (hit) return cleanRedirect(hit);
          if (req.mode === 'navigate') return cleanRedirect(await caches.match('./index.html'));
          return Response.error();
        })
    );
    return;
  }

  // Images and fonts rarely change: cache first.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

// Same tag recipe as noticeTag() in app.js: a push and an in-app alert for the same announcement
// then replace each other instead of showing twice.
function noticeTag(title) {
  return 'tb29-' + String(title || 'notice').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
}

// Web Push: show the announcement even when the app is closed.
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || "Trailblazers '29 Portal";
  const body = data.body || data.content || 'You have a new announcement.';

  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      icon: './icon-192.jpg',
      badge: './favicon-32.jpg',
      vibrate: [200, 100, 200],
      tag: noticeTag(title),
      data: { view: 'noticesView' }
    });
    // If the portal is open, let it add its in-app toast and pull in the new card.
    const open = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    open.forEach((c) => c.postMessage({
      type: 'tb-push',
      notice: { title, body, id: data.id, date: data.date, category: data.category }
    }));
  })());
});

// Tapping a notification opens the portal on the Notices page.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const view = (event.notification.data && event.notification.data.view) || 'noticesView';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList.find((c) => c.focused) || clientList[0];
        client.postMessage({ type: 'tb-open', view });
        return client.focus();
      }
      return clients.openWindow(self.registration.scope + '?open=' + view);
    })
  );
});
