// Deenly Service Worker
// Handles push notifications and caching

// Bump version to invalidate old, potentially stale caches
const CACHE_NAME = 'deenly-v3';

// Resolve base path from SW scope so it works under subpaths
const BASE_PATH = new URL(self.registration.scope).pathname;

const urlsToCache = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}logo.png`,
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and extension requests
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHTMLRequest =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    acceptHeader.includes('text/html');

  if (isHTMLRequest) {
    // Network-first for HTML to avoid serving stale index.html after deploys
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response in background
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
          return response;
        })
        .catch(async (error) => {
          // Offline fallback to cached request, then to cached index.html
          const cached = await caches.match(event.request);
          if (cached) return cached;
          const fallback = await caches.match(`${BASE_PATH}index.html`);
          if (fallback) return fallback;
          console.log('HTML fetch failed:', event.request.url, error);
          return new Response('', { status: 408, statusText: 'Request Timeout' });
        })
    );
    return;
  }

  // For non-HTML same-origin requests: cache-first with network fallback + populate cache
  event.respondWith(
    caches.match(event.request)
      .then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
            return response;
          })
          .catch((error) => {
            console.log('Asset fetch failed:', event.request.url, error);
            return new Response('', { status: 408, statusText: 'Request Timeout' });
          });
      })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(`${BASE_PATH}app`) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow(`${BASE_PATH}app`);
        }
      })
  );
});

// Handle push notification (for future server-side push)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'Time to Read the Quran';
  const options = {
    body: data.body || 'Continue your reading journey today!',
    icon: `${BASE_PATH}logo.png`,
    badge: `${BASE_PATH}logo.png`,
    tag: 'daily-reminder',
    requireInteraction: false,
    data: {
      url: `${BASE_PATH}app`,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle messages from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag } = event.data;

    // Use waitUntil to keep the service worker alive while showing notification
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: `${BASE_PATH}logo.png`,
        badge: `${BASE_PATH}logo.png`,
        tag: tag || 'daily-reminder',
        requireInteraction: false,
        data: {
          url: `${BASE_PATH}app`,
        },
      })
    );
  }
});
