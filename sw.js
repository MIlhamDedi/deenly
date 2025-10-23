// Deenly Service Worker
// Handles push notifications and caching

const CACHE_NAME = 'deenly-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
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
          if (client.url.includes('/app') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow('/app');
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
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'daily-reminder',
    requireInteraction: false,
    data: {
      url: '/app',
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

    self.registration.showNotification(title, {
      body: body,
      icon: '/logo.png',
      badge: '/logo.png',
      tag: tag || 'daily-reminder',
      requireInteraction: false,
      data: {
        url: '/app',
      },
    });
  }
});
