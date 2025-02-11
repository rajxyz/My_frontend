// Load Workbox from the official CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE_NAME = "flipify-cache-v2"; // Updated cache version
const offlineFallbackPage = "/offline.html"; // Ensure this file exists

const CACHE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  offlineFallbackPage
];

// ✅ Install Event - Cache Important Files
self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        CACHE_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => console.warn(`Failed to cache ${asset}:`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

// ✅ Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ✅ Background Sync - Retry Translations When Online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-translation') {
    event.waitUntil(
      fetch('/sync-endpoint', {
        method: 'POST',
        body: JSON.stringify({ message: 'Syncing offline translations' }),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.log("Background Sync Failed:", err))
    );
  }
});

// ✅ Periodic Sync - Auto-Fetch New Translations
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-translations') {
    event.waitUntil(
      fetch('/fetch-new-translations')
        .then(response => response.json())
        .catch(err => console.log("Periodic Sync Failed:", err))
    );
  }
});

// ✅ Push Notifications - Notify Users About Updates
self.addEventListener('push', (event) => {
  const options = {
    body: 'New languages available in Flipify!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png'
  };
  event.waitUntil(
    self.registration.showNotification('Flipify Notification', options)
  );
});

// ✅ Fetch Event - Serve Cached Files & Fallback to Network
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;
        if (preloadResp) return preloadResp;

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp || new Response('Offline page not available', { status: 503 });
      }
    })());
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchRes) => {
          if (!fetchRes || !fetchRes.ok) return fetchRes;
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchRes.clone());
            return fetchRes;
          });
        });
      })
    );
  }
});
