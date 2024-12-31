const CACHE_NAME = 'freedom-browser-cache-v2';

self.addEventListener('install', event => {
   event.waitUntil(
       caches.open(CACHE_NAME)
           .then(cache => {
               return cache.addAll(urlsToCache);
           })
   );
});

self.addEventListener('fetch', event => {
   event.respondWith(
       fetch(event.request)
           .then(response => {
               // If online, get fresh content and update cache
               if (response.status === 200) {
                   const responseToCache = response.clone();
                   caches.open(CACHE_NAME)
                       .then(cache => {
                           cache.put(event.request, responseToCache);
                       });
               }
               return response;
           })
           .catch(() => {
               // If offline, get from cache
               return caches.match(event.request);
           })
   );
});

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