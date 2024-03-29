const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

const FILES_TO_CACHE = [
    "./index.html",
    "./index.js",
    "./styles.css",
    "./indexedDB.js",
    "./manifest.json",
    "./icons/icon-192x192.png",
    "./icons/icon-512x512.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then(cache => cache.add("/api/transaction"))
    );
    event.waitUntil(
        caches.open(RUNTIME_CACHE)
            .then(cache => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );
    self.skipWaiting();
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                // return array of cache names that are old to delete
                return Promise.all(
                    keyList.map(key => {
                        if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
                            return caches.delete(key);
                        }
                    })
                );
            })
    );
    self.clients.claim();
});

self.addEventListener("fetch", function (event) {

    // handle runtime GET requests for data from /api routes
    if (event.request.url.includes('/api/')) {
        // make network request and fallback to cache if network request fails (offline)
        event.respondWith(
            caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(() => { return cache.match(event.request) })
            })
                .catch(err => console.log(err))
        );
        return;
    }
    // use cache first for all other requests for performance
    event.respondWith(
        caches.open(STATIC_CACHE).then(cache => {

            return cache.match(event.request).then(response => {
                return response || fetch(event.request);
            });
        })
    );
});

