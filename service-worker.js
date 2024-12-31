const CACHE_NAME = 'freedom-browser-cache-v1';

// Add all your /offline-test2/static files here
const urlsToCache = [
    '/',
    '/index.html',
    '/offline-test2/static/manifest.json',
    '/offline-test2/static/styles/index.css',
    '/offline-test2/static/scripts/jquery-3.7.1.min.js',
    '/offline-test2/static/scripts/global.js',
    '/offline-test2/static/scripts/index.js',
    '/offline-test2/static/fonts/Schoolbell.woff2',
    '/offline-test2/static/images/newlogo.webp',
    '/offline-test2/static/images/setting.min.svg',
    '/offline-test2/static/images/more.min.svg',
    '/offline-test2/static/images/savedgames.min.svg',
    '/offline-test2/static/images/privacy.min.svg',
    '/offline-test2/static/images/about.min.svg',
    '/offline-test2/static/images/browser.min.svg',
    '/offline-test2/static/images/whitegameico.min.svg',
    '/offline-test2/static/images/mine.min.svg',
    '/offline-test2/static/images/trust.min.svg',
    '/offline-test2/static/images/joindiscord.min.svg'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});