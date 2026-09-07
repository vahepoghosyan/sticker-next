const CACHE_NAME = "sticker-shell-v1";
const APP_SHELL = [
    "/",
    "/manifest.webmanifest",
    "/favicon.svg",
    "/icon-maskable.svg",
    "/icon-monochrome.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith("/api/")) return;

    // App shell (HTML navigations): network-first so you always get the
    // latest build when online, falling back to the cached shell offline.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                    return response;
                })
                .catch(async () => (await caches.match(request)) || (await caches.match("/")))
        );
        return;
    }

    // Hashed build assets: immutable, safe to cache-first.
    if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image")) {
        event.respondWith(
            caches.match(request).then(
                (cached) =>
                    cached ||
                    fetch(request).then((response) => {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                        return response;
                    })
            )
        );
    }
});
