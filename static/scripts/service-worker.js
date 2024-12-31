const CACHE_NAME = 'freedom-browser-cache-v5';
const PRE_CACHE = [
  '/', // Root
  '/index.html', // Main HTML file
  '/static/styles/index.css',
  '/static/scripts/jquery-3.7.1.min.js',
  '/static/scripts/global.js',
  '/static/scripts/index.js',
  '/static/fonts/Schoolbell.woff2',
  '/static/images/newlogo.webp',
  '/static/images/setting.min.svg',
  '/static/images/more.min.svg',
  '/static/images/savedgames.min.svg',
  '/static/images/privacy.min.svg',
  '/static/images/about.min.svg',
  '/static/images/browser.min.svg',
  '/static/images/whitegameico.min.svg',
  '/static/images/mine.min.svg',
  '/static/images/trust.min.svg',
  '/static/images/joindiscord.min.svg',
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching assets...');
      return cache.addAll(PRE_CACHE).catch(error => {
        console.error('[Service Worker] Error caching assets:', error);
      });
    })
  );
  self.skipWaiting(); // Activate immediately after installation
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
  self.clients.claim(); // Take control of all clients immediately
});

self.addEventListener('fetch', event => {
  console.log(`[Service Worker] Fetching: ${event.request.url}`);
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log(`[Service Worker] Serving cached: ${event.request.url}`);
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then(networkResponse => {
          if (
            !networkResponse ||
            !networkResponse.ok ||
            event.request.method !== 'GET'
          ) {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(error => {
          console.error('[Service Worker] Fetch failed, serving offline fallback...', error);

          // Serve index.html for document requests when offline
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
