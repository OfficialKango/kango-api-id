const CACHE_NAME = 'matrix-api-documentation-cache-v20250620'; // Use current date for versioning
const urlsToCache = [
    '/', // Root landing page (index.html)
    '/index.html', // Explicitly caching the root index.html
    '/docs/index.html', // Your main documentation page
    '/ai.html',
    '/downloader.html',
    '/images.html',
    '/search.html',
    '/tempmail.html',
    '/tools.html',
    '/media/support.html', // Your support page
    '/css/tailwind.min.css',
    '/js/particles.min.js',
    '/images/adiza.jpg',
    '/images/queenzy.jpg',
    '/media/Beyonce.mp3',
    // External CDN CSS (used in docs/index.html)
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    // External CDN CSS (used in root index.html) - Note the different version
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css',
    // External CDN Font
    'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;700&display=swap',
    // PWA Icons (from the images/icons folder)
    '/images/icons/icon-72x72.png',
    '/images/icons/icon-96x96.png',
    '/images/icons/icon-128x128.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-152x152.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-384x384.png',
    '/images/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(urlsToCache);
        })
        .catch(error => {
            console.error('[Service Worker] Cache.addAll failed:', error);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }) // ignoreSearch helps with caching URLs with query params
        .then(response => {
            if (response) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return response;
            }
            console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request)
                .then(networkResponse => {
                    // Only cache successful responses for GET requests
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && event.request.method === 'GET') {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return networkResponse;
                })
                .catch(error => {
                    console.error('[Service Worker] Fetch failed:', error);
                    // You could serve an offline page here if needed
                    // For example: return caches.match('/offline.html');
                });
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating new service worker...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Ensure the service worker takes control of clients immediately
    return self.clients.claim();
});
