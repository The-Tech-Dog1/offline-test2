const CACHE_NAME = 'freedom-browser-cache-dynamic34';
const OFFLINE_PAGE = '/offline-test2/offline.html';

// Install event: Cache the offline page initially
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        // Force fetch a fresh copy of the offline page
        const offlineResponse = await fetch(OFFLINE_PAGE, { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (offlineResponse.ok) {
          // Remove any existing version and cache the fresh one
          await cache.delete(OFFLINE_PAGE);
          await cache.put(OFFLINE_PAGE, offlineResponse);
          console.log('Offline page cached successfully');
        } else {
          console.error('Offline page fetch returned non-ok response');
        }
      } catch (error) {
        console.error('Failed to fetch offline page during install:', error);
      }
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches and refresh the offline page
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  event.waitUntil(
    (async () => {
      // Clean up outdated caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log(`Deleting outdated cache: ${name}`);
            return caches.delete(name);
          }
        })
      );
      
      await clients.claim();
      
      // Re-fetch the offline page to ensure freshness
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
        } else {
          console.error('Fresh offline page response not ok on activation');
        }
      } catch (error) {
        console.error('Failed to refresh offline page on activation:', error);
      }
    })()
  );
});

// Fetch event: Provide an offline fallback for navigations and non-navigation requests
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      // For navigation requests (page loads)
      if (event.request.mode === 'navigate') {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('Navigation fetch failed, serving offline page');
          const cache = await caches.open(CACHE_NAME);
          const offlineFallback = await cache.match(OFFLINE_PAGE);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response('You are offline and the offline page is not available.', {
            status: 503,
            headers: { 'Content-Type': 'text/html' }
          });
        }
      }
      
      // For non-navigation requests: try network, fall back to cache
      try {
        return await fetch(event.request);
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        return new Response('Resource unavailable offline', { 
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Listen for messages (e.g., manual offline page update request)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'UPDATE_OFFLINE_PAGE') {
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
        } else {
          console.error('Failed to update offline page: response not ok');
        }
      } catch (error) {
        console.error('Failed to update offline page:', error);
      }
    });
  }
});
