const CACHE_NAME = 'freedom-browser-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/static/styles/index.css',
    '/static/scripts/jquery-3.7.1.min.js',
    '/static/scripts/global.js',
    '/static/scripts/index.js',
    '/static/fonts/Schoolbell.woff2',
    '/static/images/newlogo.webp',
    '/static/images/setting.min.svg',
    '/static/images/more.min.svg',
    '/static/images/savedgames.min.svg',
    '/static/images/privacy.min.svg',
    '/static/images/about.min.svg',
    '/static/images/browser.min.svg',
    '/static/images/whitegameico.min.svg',
    '/static/images/mine.min.svg',
    '/static/images/trust.min.svg',
    '/static/images/joindiscord.min.svg'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return cached version
                }
                
                // Clone the request because it can only be used once
                return fetch(event.request.clone())
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response because it can only be used once
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // Return a custom offline page if you have one
                // return caches.match('/offline.html');
            })
    );
});