const CACHE_NAME = 'freedom-browser-cache-v4';
const OFFLINE_PAGE = '/offline-test2/offline.html'; // Make sure this path is correct

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Force the browser to fetch a fresh copy of offline.html
            return cache.add(new Request(OFFLINE_PAGE, { cache: 'reload' }));
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            
            try {
                // Try fetching the request from the network
                const response = await fetch(event.request);
                
                // If it's a successful GET request, cache it
                if (response.ok && event.request.method === 'GET') {
                    cache.put(event.request, response.clone());
                }
                
                return response;
            } catch (error) {
                console.error('Fetch failed:', error);
                
                // If offline, return the offline page for navigation requests
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
