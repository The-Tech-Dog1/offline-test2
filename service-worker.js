const CACHE_NAME = 'freedom-browser-cache-dynamic'; // Static name, no need to increment
const OFFLINE_PAGE = '/offline-test2/offline.html';

// Install event: Cache the offline page initially
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            // Delete old offline page before adding the new one
            await cache.delete(OFFLINE_PAGE);
            return cache.add(new Request(OFFLINE_PAGE, { cache: 'reload' }));
        })
    );
    self.skipWaiting(); // Take control immediately
});

// Activate event: Clean up old caches
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
            await clients.claim(); // Take control of all clients immediately
        })()
    );
});

// Fetch event: Handle requests with network-first, then cache fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);

            try {
                // Try fetching from the network
                const response = await fetch(event.request);

                // Cache successful GET requests
                if (response.ok && event.request.method === 'GET') {
                    cache.put(event.request, response.clone());
                }

                return response;
            } catch (error) {
                console.error('Fetch failed:', error);

                // Try to serve from cache
                const cachedResponse = await cache.match(event.request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                // For navigation requests, fall back to offline page
                if (event.request.mode === 'navigate') {
                    const offlinePage = await cache.match(OFFLINE_PAGE);
                    return offlinePage || new Response('Offline content not available', { status: 503 });
                }

                // For other requests, indicate offline status
                return new Response('You are offline', { status: 503 });
            }
        })()
    );
});