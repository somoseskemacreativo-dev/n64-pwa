const CACHE_NAME = 'n64-pwa-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// 1. INSTALACIÓN: Guarda la carcasa de la PWA y fuerza la activación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. ACTIVACIÓN: Elimina cualquier caché viejo (v1, v2) de los teléfonos y toma el control
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
    }).then(() => self.clients.claim())
  );
});

// 3. INTERCEPTOR DE RED OPTIMIZADO PARA BAJA LATENCIA
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // No interceptar tráfico externo (PeerJS, Metered TURN/STUN, ni binarios WASM de EmulatorJS)
  // Esto garantiza 0ms de sobrecarga en el Service Worker durante la partida online
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Estrategia "Network-First" para archivos propios:
  // Siempre intenta bajar la versión más reciente de GitHub; si no hay señal, usa la caché.
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(req);
      })
  );
});
