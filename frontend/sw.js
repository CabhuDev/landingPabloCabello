/**
 * Service Worker para Pablo Cabello - v1.3.0 - Estrategia Híbrida
 *
 * ESTRATEGIA DE CACHÉ:
 * - HTML (Navegación): Network-First. Prioriza el contenido fresco del servidor.
 *   Si hay conexión, el usuario ve siempre lo último. Si está offline, ve la última versión guardada.
 *   Esto soluciona el problema de la caché "atrapada".
 * - ASSETS (CSS, JS, Imágenes): Cache-First. Prioriza la velocidad de carga.
 *   Sirve desde la caché para máxima performance y recurre a la red si no lo encuentra.
 */

const CACHE_NAME = 'pablo-cabello-v1.3.0';
const STATIC_ASSETS = [
    // Se cachea la página principal para el modo offline
    '/',
    '/index.html',
    // Assets estáticos
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
    console.log(`[SW ${CACHE_NAME}] Instalando...`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`[SW ${CACHE_NAME}] Cacheando assets estáticos.`);
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Forza al nuevo Service Worker a activarse en cuanto termina la instalación.
                console.log(`[SW ${CACHE_NAME}] Instalación completa. Saltando espera.`);
                return self.skipWaiting();
            })
    );
});

// --- 2. Evento de Activación ---
// Se eliminan las cachés antiguas y el nuevo SW toma control inmediato de la página.
self.addEventListener('activate', event => {
    console.log(`[SW ${CACHE_NAME}] Activando...`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si el nombre de la caché no es el actual, se elimina.
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[SW ${CACHE_NAME}] Eliminando caché antigua: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Toma control de todos los clientes (pestañas) abiertos.
            console.log(`[SW ${CACHE_NAME}] Activado y controlando clientes.`);
            return self.clients.claim();
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

    // ESTRATEGIA 1: Network-First para peticiones de navegación (HTML)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Si la petición a la red funciona, cacheamos la nueva versión y la devolvemos.
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Si la red falla, devolvemos el fallback desde la caché (modo offline).
                    console.log(`[SW ${CACHE_NAME}] Red falló. Sirviendo ${event.request.url} desde caché.`);
                    return caches.match(event.request);
                })
        );
        return; // Importante: termina la ejecución aquí para peticiones de navegación.
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
self.addEventListener('sync', event => {
    if (event.tag === 'contact-form-sync') {
        // Aquí iría la lógica para sincronizar formularios en segundo plano.
    }
});

self.addEventListener('push', event => {
    // Aquí iría la lógica para manejar notificaciones push.
});

self.addEventListener('notificationclick', event => {
    // Aquí iría la lógica para clics en notificaciones.
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});