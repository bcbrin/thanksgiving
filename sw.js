/* Thanksgiving 2026: service worker
   Caches every file so the guide works offline after the first visit.
   When you change any file and push it, bump VERSION so phones refresh. */
var VERSION = 'tg2026-v1';

var CORE = [
  './',
  'index.html',
  'css/styles.css',
  'js/data.js',
  'js/app.js',
  'manifest.webmanifest',
  'images/icons/favicon.svg',
  'images/icons/favicon-32.png',
  'images/icons/apple-touch-icon.png',
  'images/icons/icon-192.png',
  'images/icons/icon-512.png',
  'images/icons/icon-maskable-512.png'
];

// Food photos are optional: cached if present, skipped if not added yet.
var PHOTOS = [
  'images/turkey.jpg',
  'images/potatoes.jpg',
  'images/mac-and-cheese.jpg',
  'images/carrots.jpg',
  'images/gravy.jpg'
];

var SCOPE = new URL('./', self.location).href;
var INDEX = new URL('index.html', SCOPE).href;
var PHOTO_URLS = PHOTOS.map(function (p) { return new URL(p, SCOPE).href; });

self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    var cache = await caches.open(VERSION);
    await cache.addAll(CORE.map(function (u) { return new Request(u, { cache: 'reload' }); }));
    await Promise.all(PHOTOS.map(function (u) {
      return fetch(new Request(u, { cache: 'reload' }))
        .then(function (res) { return res.ok ? cache.put(u, res) : null; })
        .catch(function () { return null; });
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    var keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k.indexOf('tg2026-') === 0 && k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  var path = url.origin + url.pathname; // ignore ?query and #fragment

  if (req.mode === 'navigate') {
    if (path === SCOPE || path === INDEX) {
      event.respondWith(appShell(event));
    }
    return; // other pages (e.g. README) go straight to the network
  }
  if (PHOTO_URLS.indexOf(path) > -1) {
    event.respondWith(photo(event));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});

// The page: answer from cache instantly (spotty store Wi-Fi), refresh in the background.
async function appShell(event) {
  var cache = await caches.open(VERSION);
  var cached = await cache.match(SCOPE) || await cache.match(INDEX);
  var network = fetch(event.request, { cache: 'no-cache' }).then(function (res) {
    if (res && res.ok) cache.put(SCOPE, res.clone());
    return res;
  }).catch(function () { return null; });
  if (cached) { event.waitUntil(network); return cached; }
  return (await network) || new Response('<h1>Offline</h1><p>Open the guide once while online so it can save a copy.</p>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// CSS, JS, icons: cached copy first, quietly updated for next time.
async function staleWhileRevalidate(event) {
  var cache = await caches.open(VERSION);
  var cached = await cache.match(event.request, { ignoreSearch: true });
  var network = fetch(event.request, { cache: 'no-cache' }).then(function (res) {
    if (res && res.ok && res.type === 'basic') cache.put(event.request, res.clone());
    return res;
  }).catch(function () { return null; });
  if (cached) { event.waitUntil(network); return cached; }
  var res = await network;
  return res || new Response('', { status: 504, statusText: 'Offline' });
}

// Food photos: cached if available. A photo that isn't there yet gets a tiny
// transparent stand-in so the page shows its gradient instead of an error.
async function photo(event) {
  var cache = await caches.open(VERSION);
  var cached = await cache.match(event.request);
  var network = fetch(event.request, { cache: 'no-cache' }).then(function (res) {
    if (res && res.ok) { cache.put(event.request, res.clone()); return res; }
    return null;
  }).catch(function () { return null; });
  if (cached) { event.waitUntil(network); return cached; }
  return (await network) || new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' } });
}

// Tapping a timer notification brings the guide back to the front.
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil((async function () {
    var all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < all.length; i++) { if ('focus' in all[i]) return all[i].focus(); }
    return self.clients.openWindow('./#cook');
  })());
});
