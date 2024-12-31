const CACHE_NAME = 'freedom-browser-dynamic-cache-v3';

// Resources to pre-cache
const PRE_CACHE = ['/index.html']; // Explicit path instead of './'

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const resource of PRE_CACHE) {
        try {
          console.log(`Caching: ${resource}`);
          await cache.add(resource);
        } catch (error) {
          console.error(`Failed to cache ${resource}:`, error);
        }
      }
    })
  );
});

// Fetch event to dynamically cache and serve resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional: Serve a fallback page or resource
          return caches.match('/index.html');
        });
    })
  );
});

// Cleanup old caches during activation
self.addEventListener('activate', event => {
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
