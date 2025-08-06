// Service Worker for caching Clerk and OAuth resources
const CACHE_NAME = 'notes-app-auth-v1';
const urlsToCache = [
  // Clerk resources
  'https://clerk.com',
  // OAuth provider domains
  'https://accounts.google.com',
  'https://github.com/login',
  'https://www.linkedin.com/oauth',
  // App resources
  '/',
  '/sso-callback'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache.filter(url => !url.startsWith('http')));
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Cache OAuth and Clerk related requests
  if (event.request.url.includes('clerk.com') || 
      event.request.url.includes('accounts.google.com') ||
      event.request.url.includes('github.com') ||
      event.request.url.includes('linkedin.com')) {
    
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
        }
      )
    );
  }
});

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
    })
  );
});
