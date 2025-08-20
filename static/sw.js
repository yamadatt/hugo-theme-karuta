// Service Worker for caching strategy - Optimized for bundled JS
// Version: 3.0.0 - Network First for HTML documents
const CACHE_VERSION = 'v3.0.0';
const CACHE_NAME = `karuta-${CACHE_VERSION}`;
const STATIC_CACHE = `karuta-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `karuta-dynamic-${CACHE_VERSION}`;

// Files to cache immediately (updated for optimized bundles)
const STATIC_FILES = [
  '/',
  '/css/main.css',
  '/css/chroma.css',
  '/css/critical.css',
  '/js/dist/critical.min.js',
  '/js/dist/main.min.js',
  '/js/dist/lazy.min.js',
  '/img/default-cover.svg',
  '/posts/',
  '/tags/',
  '/archives/',
  '/about/'
];

// High priority resources for preloading
const CRITICAL_RESOURCES = [
  '/css/critical.css',
  '/js/dist/critical.min.js'
];

// Install event - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('Caching static files');
      return cache.addAll(STATIC_FILES);
    }).catch(err => {
      console.log('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network First for HTML, Cache First for assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = event.request.url;
  const isHTMLDocument = event.request.destination === 'document' || 
                         event.request.headers.get('accept')?.includes('text/html') ||
                         url.endsWith('/') ||
                         url.includes('/posts/') ||
                         url.includes('/tags/') ||
                         url.includes('/categories/');
  
  // Network First strategy for HTML documents
  if (isHTMLDocument) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cache the fresh response
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
            console.log('Updated HTML cache:', url);
          });
          
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          console.log('Network failed, serving HTML from cache:', url);
          return caches.match(event.request).then(response => {
            return response || caches.match('/');
          });
        })
    );
    return;
  }

  // Cache First strategy for static assets
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('Serving asset from cache:', url);
        
        // Background update for important assets
        if (url.includes('/css/') || url.includes('/js/')) {
          fetch(event.request).then(freshResponse => {
            if (freshResponse && freshResponse.status === 200) {
              const cacheName = url.includes('/js/dist/') ? STATIC_CACHE : DYNAMIC_CACHE;
              caches.open(cacheName).then(cache => {
                cache.put(event.request, freshResponse.clone());
                console.log('Background update for:', url);
              });
            }
          }).catch(() => {
            // Silent fail for background update
          });
        }
        
        return response;
      }

      // Not in cache, fetch from network
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest).then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response and cache it
        const responseToCache = response.clone();
        let cacheName = DYNAMIC_CACHE;
        
        // Cache static assets with longer TTL
        if (url.includes('/css/') || url.includes('/js/dist/') || url.includes('/img/')) {
          cacheName = STATIC_CACHE;
        }
        
        // Special handling for critical resources
        if (CRITICAL_RESOURCES.some(resource => url.includes(resource))) {
          cacheName = STATIC_CACHE;
          // Notify clients about critical resource caching
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'CRITICAL_RESOURCE_CACHED',
                url: url
              });
            });
          });
        }

        caches.open(cacheName).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline fallback for documents
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Background sync for failed requests
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync
      console.log('Background sync triggered')
    );
  }
});

// Push notification handling
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/img/default-cover.svg',
      badge: '/img/default-cover.svg',
      tag: 'karuta-notification'
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});