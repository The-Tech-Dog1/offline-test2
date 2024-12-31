const CACHE_NAME = 'freedom-browser-cache-v5';
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
  if (event.request.mode === 'navigate') {
    // Handle navigation requests (e.g., refreshing the page)
    event.respondWith(
      caches.match('/index.html').then(cachedResponse => {
        return cachedResponse || fetch(event.request).catch(() => {
          console.error('Failed to fetch navigation request, and no cache found.');
        });
      })
    );
  } else {
    // Handle other requests
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request).then(networkResponse => {
          // Cache the new network response
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(error => {
          console.error(`Fetch failed for ${event.request.url}:`, error);
        });
      })
    );
  }
});
