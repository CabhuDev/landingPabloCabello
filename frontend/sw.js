/**
 * Service Worker para Pablo Cabello - v1.4.0 - Cache Invalidation Fix
 *
 * ESTRATEGIA DE CACHÉ CORREGIDA:
 * - HTML: NUNCA se cachea como asset estático, solo Network-First con fallback
 * - ASSETS (CSS, JS, Imágenes): Cache-First. Prioriza la velocidad de carga.
 * - Invalidación agresiva: limpia completamente cachés antiguas al actualizar
 */

const CACHE_NAME = 'pablo-cabello-v1.4.0';
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
// Se cachean los assets estáticos y se fuerza la activación del nuevo SW.
self.addEventListener('install', event => {
    console.log(`[SW ${CACHE_NAME}] Instalando y limpiando cachés...`);

    // FORZAR limpieza de TODAS las cachés antes de instalar
    event.waitUntil(
        Promise.all([
            // Primero eliminar TODAS las cachés existentes
            caches.keys().then(cacheNames => {
                console.log(`[SW ${CACHE_NAME}] Eliminando cachés existentes:`, cacheNames);
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`[SW ${CACHE_NAME}] Eliminando caché: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }),
            // Luego cachear nuevos assets
            caches.open(CACHE_NAME).then(cache => {
                console.log(`[SW ${CACHE_NAME}] Cacheando assets estáticos.`);
                return cache.addAll(STATIC_ASSETS);
            })
        ]).then(() => {
            // Forza al nuevo Service Worker a activarse inmediatamente
            console.log(`[SW ${CACHE_NAME}] Instalación completa. Saltando espera.`);
            return self.skipWaiting();
        })
    );
});

// --- 2. Evento de Activación ---
// Limpieza agresiva y control inmediato
self.addEventListener('activate', event => {
    console.log(`[SW ${CACHE_NAME}] Activando y tomando control...`);
    event.waitUntil(
        Promise.all([
            // Limpiar TODAS las cachés (incluso la actual por si acaso)
            caches.keys().then(cacheNames => {
                console.log(`[SW ${CACHE_NAME}] Limpiando TODAS las cachés:`, cacheNames);
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`[SW ${CACHE_NAME}] Forzando eliminación: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }),
            // Recrear solo la caché nueva con assets
            caches.open(CACHE_NAME).then(cache => {
                console.log(`[SW ${CACHE_NAME}] Recreando caché con assets.`);
                return cache.addAll(STATIC_ASSETS);
            })
        ]).then(() => {
            // Toma control inmediato y fuerza reload de clientes
            console.log(`[SW ${CACHE_NAME}] Activado. Recargando clientes...`);
            return self.clients.claim().then(() => {
                // Recargar todas las pestañas abiertas
                return self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        if (client.url && client.navigate) {
                            client.navigate(client.url);
                        }
                    });
                });
            });
        })
    );
});

// --- 3. Evento Fetch: El núcleo de la solución ---
// Decide cómo responder a las peticiones: Network-First para HTML, Cache-First para assets.
self.addEventListener('fetch', event => {
    // Ignorar peticiones que no son GET (ej. POST a la API) y de otros orígenes.
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // ESTRATEGIA 1: Network-First ESTRICTO para HTML (navegación y requests directos)
    const isHTMLRequest = event.request.mode === 'navigate' ||
                         event.request.destination === 'document' ||
                         event.request.url.endsWith('/') ||
                         event.request.url.includes('index.html') ||
                         event.request.headers.get('accept')?.includes('text/html');

    if (isHTMLRequest) {
        console.log(`[SW ${CACHE_NAME}] HTML Request detected:`, event.request.url);
        event.respondWith(
            fetch(event.request, { cache: 'no-cache' })
                .then(response => {
                    console.log(`[SW ${CACHE_NAME}] Fresh HTML from network:`, event.request.url);
                    // NO cachear HTML - solo devolverlo
                    return response;
                })
                .catch(() => {
                    // Solo si la red falla completamente, buscar en caché
                    console.log(`[SW ${CACHE_NAME}] Network failed. Trying cache for:`, event.request.url);
                    return caches.match(event.request).then(cached => {
                        if (cached) {
                            console.log(`[SW ${CACHE_NAME}] Serving cached fallback`);
                            return cached;
                        }
                        // Si no hay caché, devolver página de error básica
                        return new Response('<h1>Sin conexión</h1><p>No se puede cargar la página</p>', {
                            headers: { 'Content-Type': 'text/html' }
                        });
                    });
                })
        );
        return;
    }

    // ESTRATEGIA 2: Cache-First para assets estáticos (CSS, JS, imágenes)
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Si el asset está en caché, lo servimos desde ahí. Es lo más rápido.
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Si no está en caché, lo buscamos en la red.
                return fetch(event.request).then(networkResponse => {
                    // Y lo guardamos en caché para la próxima vez.
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return networkResponse;
                });
            })
    );
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
        self.skipWaiting();
    }

    // Mensaje para forzar limpieza completa
    if (event.data && event.data.type === 'CLEAR_ALL_CACHES') {
        console.log(`[SW ${CACHE_NAME}] Forzando limpieza completa de cachés...`);
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`[SW ${CACHE_NAME}] Eliminando: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log(`[SW ${CACHE_NAME}] Todas las cachés eliminadas`);
                // Recargar cliente
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({ type: 'CACHES_CLEARED' });
                    });
                });
            })
        );
    }
});