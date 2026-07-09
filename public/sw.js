// Minimal service worker: satisfies PWA installability requirements without
// caching app data (nutrition data must always come from the network).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally a no-op passthrough; the browser handles the request normally.
});
