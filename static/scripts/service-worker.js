const CACHE_NAME = 'freedom-browser-cache-v4';
const PRE_CACHE = [
  '/', // Ensures the root path is cached
  '/index.html',
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
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets.');
      return cache.addAll(PRE_CACHE).catch(error => {
        console.error('Error caching assets:', error);
      });
    })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        console.log(`Serving cached: ${event.request.url}`);
        return cachedResponse;
      }

      console.log(`Fetching: ${event.request.url}`);
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(error => {
          console.error('Fetch failed, returning offline fallback:', error);
          // Optionally serve a fallback for specific types of content
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
