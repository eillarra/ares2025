/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope & typeof globalThis & { skipWaiting: () => void };

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
clientsClaim();

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Network-first strategy for API calls
registerRoute(
  ({ url }) => url.origin === 'https://evan.ugent.be' && !url.pathname.includes('/user/'),
  new NetworkFirst({
    cacheName: 'evan-api-cache',
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 7 * 60 * 60 * 24, // 1 week
        maxEntries: 50,
        purgeOnQuotaError: true,
      }),
    ],
    networkTimeoutSeconds: 3,
  }),
);

// Add runtime caching for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new NetworkFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  }),
);

// Non-SSR fallbacks to index.html
// Production SSR fallbacks to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML), {
      denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/],
    }),
  );
}
