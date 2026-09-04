const CACHE_NAME = "shohin-market-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",

  // CSS
  "./css/style.css",
  "./css/components.css",

  // JavaScript
  "./js/app.js",
  "./js/products.js",
  "./js/cart.js",
  "./js/favorites.js",
  "./js/orders.js",
  "./js/map.js",
  "./js/storage.js",

  // Data
  "./data/products.json",

  // Logo
  "./assets/logo.svg"
];

/* ================================
   INSTALL
================================ */

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          "SHOHIN MARKET: Service Worker install error:",
          error
        );
      })
  );
});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }

            return null;
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Только GET
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {

        // Если есть в кеше — сразу возвращаем
        if (cachedResponse) {
          return cachedResponse;
        }

        // Если нет — пробуем интернет
        return fetch(request)
          .then((networkResponse) => {

            // Проверяем нормальный ответ
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                })
                .catch((error) => {
                  console.warn(
                    "SHOHIN MARKET: Cache error:",
                    error
                  );
                });
            }

            return networkResponse;
          })
          .catch(() => {

            // Если пользователь офлайн
            // и запрашивает страницу
            if (request.mode === "navigate") {
              return caches.match("./index.html");
            }

            // Для остальных файлов
            return new Response(
              "",
              {
                status: 503,
                statusText: "Offline"
              }
            );
          });
      })
  );
});


/* ================================
   MESSAGE
================================ */

self.addEventListener("message", (event) => {

  if (!event.data) {
    return;
  }

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

});