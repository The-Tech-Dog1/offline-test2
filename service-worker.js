const CACHE_NAME = 'freedom-browser-cache-v1';

// Pre-cache the offline fallback page during installation.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(['/offline-test2/offline.html']))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        
        // Try to get the request from the cache first.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        try {
            // Attempt to fetch the resource from the network.
            const response = await fetch(event.request);
            
            // Cache valid GET responses.
            if (response.ok && event.request.method === 'GET') {
                cache.put(event.request, response.clone());
            }
            return response;
        } catch (error) {
            console.error('Fetch failed:', error);
            // If the request is a navigation (i.e., for a page), return the offline fallback.
            if (event.request.mode === 'navigate') {
                const offlineResponse = await cache.match('/offline-test2/offline.html');
                return offlineResponse || new Response('Offline content not available');
            }
            // For non-navigation requests, return a simple offline response.
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
