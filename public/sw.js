/**
 * WatchSnap Service Worker
 * Strategy:
 *  - App shell (pages, CSS, JS) → Network-first, fall back to cache
 *  - Static assets (icons, fonts) → Cache-first
 *  - API routes (/api/*) → Network-only (never cache scan results)
 */

const CACHE_NAME    = "watchsnap-v1";
const STATIC_CACHE  = "watchsnap-static-v1";

/* ── Assets to pre-cache on install ── */
const PRECACHE_URLS = [
  "/",
  "/scan",
  "/history",
  "/offline",
];

/* ── Install: pre-cache shell ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => { /* ignore individual failures */ })
    ).then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // API routes → network only (never serve stale AI results)
  if (url.pathname.startsWith("/api/")) return;

  // Static assets (icons, fonts, _next/static) → cache-first
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/")
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Pages → network-first, fall back to cache, then /offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match("/offline") || new Response(
            "<h1>You are offline</h1><p>Please reconnect to use WatchSnap.</p>",
            { headers: { "Content-Type": "text/html" } }
          )
        )
      )
  );
});

/* ── Push notifications (future use) ── */
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "WatchSnap", {
    body: data.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-72.png",
    tag: "watchsnap",
  });
});
