const CACHE_NAME = 'app-cache-v1';

// Assets to cache initially
const INITIAL_ASSETS = [
  '/',
  '/app/immutable/',  // SvelteKit immutable assets directory
  '/app/paths/',      // SvelteKit paths manifest
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache initial assets
      await cache.addAll(INITIAL_ASSETS);
      // Activate immediately
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all pages immediately
      await clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only cache same-origin requests
  if (url.origin !== self.location.origin) return;

  // Don't cache POST requests or browser-sync
  if (event.request.method !== 'GET' || url.pathname.includes('browser-sync')) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Try to get from cache first
      const cachedResponse = await cache.match(event.request);
      
      // Start fetch in background
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Cache the new response if we get a valid one
          if (networkResponse && networkResponse.ok && networkResponse.type === 'basic') {
            const clonedResponse = networkResponse.clone();
            cache.put(event.request, clonedResponse);
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          // Return cached response if fetch fails
          return cachedResponse;
        });

      // Return cached response immediately if we have it
      return cachedResponse || fetchPromise;
    })()
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});