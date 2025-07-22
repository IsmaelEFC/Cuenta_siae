// Configuración del Service Worker
const CACHE_NAME = 'cuenta-siae-v1.0.1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/storage.js',
  './js/pwa.js',
  './funcionarios.json',
  './manifest.json',
  './assets/icons/icon-72x72.png',
  './assets/icons/icon-96x96.png',
  './assets/icons/icon-128x128.png',
  './assets/icons/icon-144x144.png',
  './assets/icons/icon-152x152.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-384x384.png',
  './assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap'
];

// Evento de instalación
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  
  // Realiza la instalación del service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Almacenando en caché los recursos de la aplicación');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Evento de activación
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activado');
  
  // Eliminar cachés antiguos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Tomar el control de los clientes inmediatamente
  return self.clients.claim();
});

// Estrategia de caché: Cache First, con actualización en segundo plano
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes de navegación a menos que sea una solicitud de navegación
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Para otras solicitudes, usar la estrategia de caché primero
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devuelve la respuesta en caché si existe
        if (response) {
          // Actualizar la caché en segundo plano
          caches.open(CACHE_NAME).then((cache) => {
            fetch(event.request).then((response) => {
              if (response && response.status === 200) {
                cache.put(event.request, response);
              }
            });
          });
          return response;
        }
        
        // Si no está en caché, haz la petición a la red
        return fetch(event.request)
          .then((response) => {
            // Si la respuesta es válida, la guardamos en caché
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clonamos la respuesta para guardarla en caché
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Si falla la red y no hay respuesta en caché, devolvemos una respuesta personalizada
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
      })
  );
});

// Manejo de mensajes del cliente (para actualizaciones)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[Service Worker] Sincronización en segundo plano');
    // Aquí podrías implementar la lógica de sincronización
  }
});
