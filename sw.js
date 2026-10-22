const CACHE_NAME = 'tb29-portal-v26';
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

// How long a page or script may sit waiting on the network before we serve the cached copy instead.
// On weak LTE a fetch can hang for a minute; with a cached copy that wait is pointless.
const NET_WAIT_MS = 6000;

function offlinePage() {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline</title></head>' +
    '<body style="font-family:sans-serif;text-align:center;padding:40px;background:#0f172a;color:#fff;">' +
    '<h2>Connection weak</h2><p>The portal could not be reached. Check your network and try again.</p>' +
    '<button onclick="location.reload()" style="padding:10px 20px;background:#1d9bf0;color:#fff;border:0;' +
    'border-radius:6px;font-weight:bold;">Retry</button></body></html>';
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// Network first, cache as the safety net. This function ALWAYS resolves to a real Response, because
// respondWith(undefined) or Response.error() is exactly what makes Safari show "couldn't connect to the server".
async function networkFirst(event, isNav) {
  const req = event.request;
  const findCached = async () => {
    let hit = await caches.match(req);
    if (!hit && isNav) hit = (await caches.match('./index.html')) || (await caches.match('./'));
    return hit ? cleanRedirect(hit) : null;
  };

  // A navigation request cannot be rebuilt with options, so only sub-resources force revalidation.
  const netReq = isNav ? req : new Request(req, { cache: 'no-cache' });
  const network = fetch(netReq).then((res) => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
    }
    return res;
  });

  try {
    const timer = new Promise((resolve) => setTimeout(() => resolve(null), NET_WAIT_MS));
    const quick = await Promise.race([network, timer]);
    if (quick) return quick;                       // network answered in time

    const hit = await findCached();                // network is slow: use the cache if we have one
    if (hit) {
      event.waitUntil(network.catch(() => {}));    // let the slow fetch finish and refresh the cache
      return hit;
    }
    return await network;                          // nothing cached: keep waiting for the network
  } catch (err) {
    const hit = await findCached();                // network failed outright
    if (hit) return hit;
    return isNav ? offlinePage() : new Response('', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // Live APIs (Supabase, Google) and third-party scripts go straight to the network.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNav = req.mode === 'navigate';
  const isCode = isNav || ['document', 'script', 'style', 'manifest'].includes(req.destination);

  if (isCode) {
    event.respondWith(networkFirst(event, isNav));
    return;
  }

  // Images and fonts rarely change: cache first, and never let a failed fetch reject the response.
  event.respondWith(
    caches.match(req)
      .then((hit) => hit || fetch(req))
      .catch(() => new Response('', { status: 504, statusText: 'Offline' }))
  );
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
