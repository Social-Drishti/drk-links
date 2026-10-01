/* ====================================================================
   Dr. Rajneesh Kant - All-in-One Link & Events Hub
   Service Worker for Progressive Web App (PWA) Offline Support
==================================================================== */
const CACHE_NAME = "drk-hub-v7";

const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
  "./assets/favicon.png"
];

// Install: precache the core application shell
// Uses per-URL adds (not cache.addAll) so a single bad URL cannot silently
// abort the entire precache - each failure is logged instead.
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        PRECACHE_URLS.map(function (url) {
          return cache.add(new Request(url, { cache: "reload" })).catch(function (err) {
            console.warn("[SW] Precache failed for", url, err);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Activate: clean up outdated caches and take control immediately
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.filter(function (name) {
          return name !== CACHE_NAME;
        }).map(function (name) {
          console.info("[SW] Deleting old cache:", name);
          return caches.delete(name);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// Fetch: respond with cached asset or fetch from network with cache update
self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // For HTML navigation requests, use network-first with cache fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(req, resClone);
          });
        }
        return networkResponse;
      }).catch(function () {
        return caches.match("./index.html").then(function (cached) {
          return cached || caches.match("./");
        });
      })
    );
    return;
  }

  // Same-origin assets: Cache-first with network fallback and dynamic caching
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(req, resClone);
            });
          }
          return networkResponse;
        }).catch(function () {
          // If navigation/page asset fails offline
          if (req.headers.get("accept") && req.headers.get("accept").includes("text/html")) {
            return caches.match("./index.html");
          }
        });
      })
    );
    return;
  }

  // Google Fonts caching (Josefin Sans stylesheets & WOFF2 webfonts) for offline PWA support
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.match(req).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (networkResponse) {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.type === "opaque")) {
            const resClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(req, resClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Other cross-origin requests (e.g. images): Network with cache fallback
  event.respondWith(
    fetch(req).catch(function () {
      return caches.match(req);
    })
  );
});
