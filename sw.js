const CACHE_NAME = 'n64-pwa-v2'; // <-- Cambia v1 por v2 cada vez que actualices el index.html
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Fuerza la actualización inmediata
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
