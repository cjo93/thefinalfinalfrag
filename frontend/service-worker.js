// Minimal service worker shell
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Basic network-first for API, cache-first for static
});

