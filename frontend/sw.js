/**
 * Service Worker para Pablo Cabello - Aparejador Premium
 * Caching estratégico para mejor performance
 */

const CACHE_NAME = 'pablo-cabello-v1.2.0';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/events.js',
    '/assets/js/form-handler.js',
    '/assets/js/analytics-tracker.js',
    '/assets/js/performance-optimizer.js',
    '/assets/images/project-placeholder.png'
];

// Install event - cache assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching Files');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing Old Cache');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                // Serve from cache
                return response;
            }
            
            // Fetch from network
            return fetch(event.request).then(fetchResponse => {
                // Don't cache non-successful responses
                if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }
                
                // Clone the response
                const responseToCache = fetchResponse.clone();
                
                // Cache the fetched response
                caches.open(CACHE_NAME).then(cache => {
                    // Only cache GET requests for static assets
                    if (event.request.method === 'GET' && 
                        (event.request.url.includes('/assets/') || 
                         event.request.url.endsWith('.html'))) {
                        cache.put(event.request, responseToCache);
                    }
                });
                
                return fetchResponse;
            }).catch(() => {
                // Network failed, return offline page if available
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(syncContactForm());
    }
});

async function syncContactForm() {
    try {
        // Get pending form submissions from IndexedDB
        const submissions = await getPendingSubmissions();
        
        for (const submission of submissions) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submission.data)
                });
                
                if (response.ok) {
                    // Remove from pending submissions
                    await removePendingSubmission(submission.id);
                    console.log('Form submission synced successfully');
                }
            } catch (error) {
                console.log('Failed to sync form submission:', error);
            }
        }
    } catch (error) {
        console.log('Background sync failed:', error);
    }
}

// Placeholder functions for IndexedDB operations
async function getPendingSubmissions() {
    // Implementation would use IndexedDB to store offline form submissions
    return [];
}

async function removePendingSubmission(id) {
    // Implementation would remove synced submission from IndexedDB
    return true;
}

// Push notification handling
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nueva actualización disponible',
        icon: '/assets/images/icon-192x192.png',
        badge: '/assets/images/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: 'Ver ahora',
                icon: '/assets/images/checkmark.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/assets/images/close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Pablo Cabello - Aparejador', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});