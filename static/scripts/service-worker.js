const CACHE_NAME = 'freedom-browser-cache-v1';

// Add all your static files here
const urlsToCache = [
    '/',
    'index.html',
    'static/manifest.json',
    'static/styles/index.css',
    'static/scripts/jquery-3.7.1.min.js',
    'static/scripts/global.js',
    'static/scripts/index.js',
    'static/fonts/Schoolbell.woff2',
    'static/images/newlogo.webp',
    'static/images/setting.min.svg',
    'static/images/more.min.svg',
    'static/images/savedgames.min.svg',
    'static/images/privacy.min.svg',
    'static/images/about.min.svg',
    'static/images/browser.min.svg',
    'static/images/whitegameico.min.svg',
    'static/images/mine.min.svg',
    'static/images/trust.min.svg',
    'static/images/joindiscord.min.svg'
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