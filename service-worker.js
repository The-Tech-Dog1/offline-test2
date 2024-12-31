const CACHE_NAME = 'freedom-browser-cache-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.allSettled(
                    urlsToCache.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`Failed to cache ${url}:`, err);
                            return null;
                        })
                    )
                );
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            })
                            .catch(console.error);
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        return new Response('Offline content not available');
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
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