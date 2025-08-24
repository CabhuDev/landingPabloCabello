/**
 * Service Worker para Pablo Cabello - v2.0.0 - Smart Cache Strategy
 *
 * ESTRATEGIA DE CACHÉ INTELIGENTE:
 * - HTML: Network-First (siempre fresco)
 * - CSS/JS: Stale-While-Revalidate (rápido + actualizado)
 * - Imágenes: Cache-First con TTL
 * - Versionado automático para actualizaciones sin problemas
 */

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `pablo-cabello-v${CACHE_VERSION}`;

// TTL para diferentes tipos de recursos (en milisegundos)
const CACHE_TTL = {
    images: 7 * 24 * 60 * 60 * 1000,    // 7 días
    styles: 24 * 60 * 60 * 1000,        // 1 día  
    scripts: 24 * 60 * 60 * 1000,       // 1 día
    html: 60 * 60 * 1000                // 1 hora
};
const STATIC_ASSETS = [
    // NUNCA cachear HTML como asset estático - solo assets reales
    '/assets/css/style.css',
    '/assets/js/events.js',
    '/assets/js/form-handler.js',
    '/assets/js/analytics-tracker.js',
    '/assets/js/performance-optimizer.js',
    '/assets/images/project-placeholder.png'
];

// --- 1. Evento de Instalación ---
self.addEventListener('install', event => {
    console.log(`[SW ${CACHE_NAME}] Instalando...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log(`[SW ${CACHE_NAME}] Cacheando assets estáticos.`);
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            console.log(`[SW ${CACHE_NAME}] Instalación completa.`);
            // NO saltamos la espera para evitar recargas automáticas
        })
    );
});

// --- 2. Evento de Activación (con notificación de actualización) ---

// --- UTILIDADES DE CACHE ---
function isExpired(response, ttl) {
    if (!response) return true;
    
    const cachedAt = response.headers.get('sw-cached-at');
    if (!cachedAt) return true;
    
    const age = Date.now() - parseInt(cachedAt);
    return age > ttl;
}

function addTimestampToResponse(response) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('sw-cached-at', Date.now().toString());
    
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

function getResourceType(url) {
    if (url.includes('.css')) return 'styles';
    if (url.includes('.js')) return 'scripts';
    if (url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i)) return 'images';
    return 'html';
}

// --- 3. Evento Fetch: Estrategia inteligente ---
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    const resourceType = getResourceType(event.request.url);
    const isHTMLRequest = event.request.mode === 'navigate' ||
                         event.request.destination === 'document' ||
                         event.request.url.endsWith('/') ||
                         resourceType === 'html';

    if (isHTMLRequest) {
        // ESTRATEGIA 1: Network-First para HTML (siempre fresco)
        event.respondWith(
            fetch(event.request, { cache: 'no-cache' })
                .then(response => {
                    console.log(`[SW ${CACHE_NAME}] Fresh HTML from network`);
                    return response;
                })
                .catch(() => {
                    console.log(`[SW ${CACHE_NAME}] Network failed, trying cache`);
                    return caches.match(event.request).then(cached => {
                        if (cached && !isExpired(cached, CACHE_TTL.html)) {
                            return cached;
                        }
                        return new Response('<h1>Sin conexión</h1><p>No se puede cargar la página</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
                })
        );
    } else if (resourceType === 'images') {
        // ESTRATEGIA 2: Cache-First con TTL para imágenes
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse && !isExpired(cachedResponse, CACHE_TTL.images)) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then(networkResponse => {
                    const responseWithTimestamp = addTimestampToResponse(networkResponse.clone());
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseWithTimestamp);
                    });
                    return networkResponse;
                });
            })
        );
    } else {
        // ESTRATEGIA 3: Stale-While-Revalidate para CSS/JS
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    const responseWithTimestamp = addTimestampToResponse(networkResponse.clone());
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseWithTimestamp);
                    });
                    return networkResponse;
                }).catch(() => cachedResponse);

                // Si hay cache y no ha expirado, servirlo inmediatamente
                if (cachedResponse && !isExpired(cachedResponse, CACHE_TTL[resourceType])) {
                    // Actualizar en segundo plano
                    fetchPromise.catch(() => {});
                    return cachedResponse;
                }
                
                // Si no hay cache válido, esperar la red
                return fetchPromise;
            })
        );
    }
});

// --- OTROS EVENTOS (Sync, Push, etc.) ---
// Se mantienen igual que en tu versión anterior.
self.addEventListener('sync', () => {
    // Aquí iría la lógica para sincronizar formularios en segundo plano.
});

self.addEventListener('push', () => {
    // Aquí iría la lógica para manejar notificaciones push.
});

self.addEventListener('notificationclick', () => {
    // Aquí iría la lógica para clics en notificaciones.
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log(`[SW ${CACHE_NAME}] Saltando espera por petición del cliente`);
        self.skipWaiting();
    }
});

// Notificar a los clientes cuando el SW se activa
self.addEventListener('activate', event => {
    console.log(`[SW ${CACHE_NAME}] Activando...`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            console.log(`[SW ${CACHE_NAME}] Limpiando cachés antiguas:`, cacheNames);
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[SW ${CACHE_NAME}] Eliminando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log(`[SW ${CACHE_NAME}] Activado correctamente.`);
            // Notificar a todos los clientes que el SW se ha actualizado
            return self.clients.claim().then(() => {
                console.log(`[SW ${CACHE_NAME}] Claiming clients...`);
                return self.clients.matchAll({ includeUncontrolled: true });
            }).then(clients => {
                console.log(`[SW ${CACHE_NAME}] Found ${clients.length} clients to notify`);
                const notificationPromises = clients.map(client => {
                    console.log(`[SW ${CACHE_NAME}] Notifying client: ${client.id}`);
                    try {
                        client.postMessage({ type: 'SW_UPDATED' });
                    } catch (error) {
                        console.error(`[SW ${CACHE_NAME}] Failed to notify client:`, error);
                    }
                });
                
                // Dar tiempo extra para que los mensajes se envíen
                return new Promise(resolve => {
                    setTimeout(resolve, 100);
                });
            });
        })
    );
});