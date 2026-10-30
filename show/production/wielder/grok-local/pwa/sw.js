/*
 * grok-local service worker — app shell only.
 *
 * Caches the static app (HTML/JS/manifest/icons) so the installed
 * app opens instantly and mode B works offline. API calls and the
 * rendezvous fetch are NEVER cached: they are cross-origin requests
 * to a seat whose address changes, and a cached endpoint answer
 * would be a lie about a seat that may already be dead.
 */
const CACHE = "grok-local-shell-v1";
const SHELL = [
  "./", "./index.html", "./api.js", "./app.js",
  "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k !== CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // seat/HF: network
  event.respondWith(
    caches.match(event.request).then((hit) => hit ||
      fetch(event.request)));
});
