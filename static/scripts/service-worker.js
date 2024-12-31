const CACHE_NAME = 'freedom-browser-dynamic-cache-v1';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        './', // Cache the base page
      ]);
    })
  );
});

// Fetch event to dynamically cache and serve resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Serve cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }
      // Otherwise, fetch from network and cache the result
      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache the fetched resource (if valid response)
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    }).catch(() => {
      // Optional: serve a fallback page or resource when offline and not cached
      return caches.match('./');
    })
  );
});

// Cleanup old caches during activation
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
