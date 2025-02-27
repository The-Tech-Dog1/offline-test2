const CACHE_NAME = 'freedom-browser-cache-v5';
const OFFLINE_PAGE = '/offline-test2/offline.html'; // Ensure the path is correct

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.add(new Request(OFFLINE_PAGE + '?v=' + Date.now(), { cache: 'reload' }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            
            try {
                const response = await fetch(event.request);
                
                if (response.ok && event.request.method === 'GET') {
                    cache.put(event.request, response.clone());
                }
                
                return response;
            } catch (error) {
                console.error('Fetch failed:', error);
                
                if (event.request.mode === 'navigate') {
                    const cachedOfflinePage = await cache.match(OFFLINE_PAGE);
                    return cachedOfflinePage || new Response('Offline content not available', { status: 503 });
                }
                
                return new Response('You are offline', { status: 503 });
            }
        })()
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(OFFLINE_PAGE); // Ensure old version is deleted
            await cache.add(new Request(OFFLINE_PAGE, { cache: 'reload' })); // Fetch fresh version
            
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );

            await clients.claim();
        })()
    );
});
