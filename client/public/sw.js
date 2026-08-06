// No service worker functionality needed.
// This file prevents 404 errors from legacy or rogue SW requests.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => clients.claim());
self.addEventListener('fetch', () => {});
