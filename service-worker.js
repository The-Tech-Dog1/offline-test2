const CACHE_NAME = 'freedom-browser-cache-v1';

// Use async/await for cleaner and potentially faster execution
self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        
        // Try to get from cache first
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
            // Fetch and cache simultaneously
            const fetchPromise = fetch(event.request);
            const response = await fetchPromise;

            // Only cache valid GET requests
            if (response.ok && event.request.method === 'GET') {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (error) {
            console.error('Fetch failed:', error);
            return new Response('Offline content not available');
        }
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            })
        );
        await clients.claim();
    })());
});