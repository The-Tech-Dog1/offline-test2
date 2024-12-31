const CACHE_NAME = 'freedom-browser-cache-v1';
const URLS_TO_CACHE = [
  '/', // The main HTML file
  '/static/styles/index.css', // CSS file
  '/static/scripts/jquery-3.7.1.min.js', // jQuery
  '/static/scripts/global.js', // JS file
  '/static/scripts/index.js', // JS file
  '/static/fonts/Schoolbell.woff2', // Font
  '/static/images/newlogo.webp', // Logo
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

// Install the service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch resources from the cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return the cached resource or fetch it from the network
        return response || fetch(event.request);
      })
  );
});

// Update the service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
