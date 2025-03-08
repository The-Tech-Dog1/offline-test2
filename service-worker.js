const CACHE_NAME = 'freedom-browser-cache-dynamic15';
const OFFLINE_PAGE = '/offline-test2/offline.html';

// Install event: Cache the offline page initially
self.addEventListener('install', event => {
    console.log('Service Worker installing');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            // Force fetch a fresh copy of the offline page (bypass cache)
            const offlineResponse = await fetch(OFFLINE_PAGE, { 
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache' }
            });
            
            if (offlineResponse.ok) {
                // Remove any existing version before caching the new one
                await cache.delete(OFFLINE_PAGE);
                await cache.put(OFFLINE_PAGE, offlineResponse);
                console.log('Offline page cached successfully');
            }
        })
    );
    self.skipWaiting();
});

// Activate event: Clean up and ensure offline page is fresh
self.addEventListener('activate', event => {
    console.log('Service Worker activating');
    event.waitUntil(
        (async () => {
            // Take control of all clients immediately
            await clients.claim();
            
            // Re-fetch the offline page to ensure it's always fresh
            const cache = await caches.open(CACHE_NAME);
            try {
                const freshOfflinePageResponse = await fetch(OFFLINE_PAGE, { 
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                
                if (freshOfflinePageResponse.ok) {
                    await cache.delete(OFFLINE_PAGE);
                    await cache.put(OFFLINE_PAGE, freshOfflinePageResponse);
                    console.log('Offline page refreshed on activation');
                }
            } catch (error) {
                console.error('Failed to refresh offline page:', error);
            }
        })()
    );
});

// Fetch event: Handle requests with improved offline fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        (async () => {
            // Special handling for navigation requests (page loads)
            if (event.request.mode === 'navigate') {
                try {
                    // Try network first
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    console.log('Navigation request failed, serving offline page');
                    const cache = await caches.open(CACHE_NAME);
                    
                    // Use the offline page we specifically cached
                    const offlineFallback = await cache.match(OFFLINE_PAGE);
                    if (offlineFallback) {
                        return offlineFallback;
                    }
                    
                    // Last resort if offline page isn't cached
                    return new Response('You are offline and the offline page is not available.', {
                        status: 503,
                        headers: { 'Content-Type': 'text/html' }
                    });
                }
            }
            
            // For non-navigation requests
            try {
                // Try network first
                return await fetch(event.request);
            } catch (error) {
                // Fall back to cache for non-navigation requests
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(event.request);
                
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Nothing in cache
                return new Response('Resource unavailable offline', { 
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        })()
    );
});

// Listen for messages from the main page
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'UPDATE_OFFLINE_PAGE') {
        // Force update the offline page when requested
        caches.open(CACHE_NAME).then(async cache => {
            try {
                console.log('Manually updating offline page');
                const freshOfflinePage = await fetch(OFFLINE_PAGE, { 
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                if (freshOfflinePage.ok) {
                    await cache.delete(OFFLINE_PAGE);
                    await cache.put(OFFLINE_PAGE, freshOfflinePage);
                    console.log('Offline page updated successfully');
                }
            } catch (error) {
                console.error('Failed to update offline page:', error);
            }
        });
    }
});