const CACHE_NAME = 'sudoku-v5';
const urlsToCache = [
  'sudoku.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// Helper to strip query parameters from a URL for cache matching
function stripQuery(url) {
  return url.split('?')[0];
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = stripQuery(event.request.url);
  
  // Only intercept requests for our cached files
  if (urlsToCache.some(url => requestUrl.endsWith(url))) {
    event.respondWith(
      caches.match(requestUrl)
        .then(response => {
          // If found in cache, return it (even if offline!)
          if (response) {
            return response;
          }
          // Otherwise, try the network
          return fetch(event.request);
        })
    );
  } else {
    // For everything else, go to network (but don't break)
    event.respondWith(fetch(event.request).catch(() => {
      return new Response('Offline', { status: 503 });
    }));
  }
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
