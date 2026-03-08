// Custom service worker with push notification support
// This file is used as the injectManifest source for Vite PWA

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Precache all assets injected by Vite PWA
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Skip waiting immediately when a new SW is available
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Network-first for HTML pages
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 0 })],
    networkTimeoutSeconds: 5,
  })
);

// Cache-first for Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new CacheFirst({
    cacheName: 'google-fonts-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// ==== PUSH NOTIFICATIONS ====

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: '📱 Dealzflow', body: event.data.text() };
  }

  const title = data.title || '📱 Dealzflow';
  const options: NotificationOptions = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'dealzflow',
    renotify: true,
    data: { url: data.url || '/dashboard' },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = (event.notification.data as any)?.url || '/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          (client as WindowClient).navigate(urlToOpen);
          return (client as WindowClient).focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});
