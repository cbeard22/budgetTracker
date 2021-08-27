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

self.addEventListener("install", event => {
    event.waitUntil(
        caches
        .open(STATIC_CACHE)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(()=> self.skipWaiting())
        );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", (event) => {
    const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
    event.waitUntil(
        caches
        .keys()
        .then((cacheNames)=> {
            // return array of cache names that are old to delete
            return cacheNames.filter(
                (cacheName) => !currentCaches.includes(cacheName)
            )
        })
.then(cachesToDelete => {
    return Promise.all(
        cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
        })
    );
})
.then(() => self.clients.claim())
    );
});