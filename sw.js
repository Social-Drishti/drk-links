/* ====================================================================
   Minimal service worker — enables "Add to Home Screen / Install app"
   (Chrome/Android prompt) and basic offline support for the static
   single-page microsite.

   Cache-first for same-origin GETs: serve from cache, fall back to the
   network, and on failure return the cached start page. Bump CACHE to
   "drk-v2" (etc.) whenever the precache list changes to force a refresh.
==================================================================== */
const CACHE = "drk-v2";

const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/variables.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/header.css",
  "./css/cta.css",
  "./css/links.css",
  "./css/app-card.css",
  "./css/clinic-info.css",
  "./css/social.css",
  "./css/footer.css",
  "./css/responsive.css",
  "./assets/drk-favicon.webp",
  "./assets/drk-profile.webp",
  "./assets/og-image.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/apple-touch-icon.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok && url.pathname !== "/") {
          const copy = res.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, copy);
          });
        }
        return res;
      }).catch(function () {
        return caches.match("./index.html");
      });
    })
  );
});