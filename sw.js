// SHOHIN MARKET
// Service Worker V3
// Без геолокации и без автоматического запроса GPS

const CACHE_NAME = "shohin-market-v3";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",

  "./css/style.css",
  "./css/components.css",

  "./js/app.js",
  "./js/products.js",
  "./js/cart.js",
  "./js/favorites.js",
  "./js/orders.js",
  "./js/map.js",
  "./js/storage.js",

  "./data/products.json"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })
      .then(() => {

        return self.skipWaiting();

      })

  );

});


/* =========================================
   ACTIVATE
   Удаляем старые версии кэша
========================================= */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(cacheNames => {

        return Promise.all(

          cacheNames.map(cacheName => {

            if (cacheName !== CACHE_NAME) {

              return caches.delete(cacheName);

            }

            return Promise.resolve();

          })

        );

      })
      .then(() => {

        return self.clients.claim();

      })

  );

});


/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", event => {

  const request = event.request;


  /*
     Работаем только с GET.
  */

  if (request.method !== "GET") {

    return;

  }


  /*
     HTML-документы:
     сначала сеть,
     если сети нет — кэш.
  */

  if (request.destination === "document") {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response && response.ok) {

            const responseCopy =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  request,
                  responseCopy
                );

              });

          }

          return response;

        })

        .catch(() => {

          return caches.match(request)
            .then(cached => {

              return cached ||
                caches.match("./index.html");

            });

        })

    );

    return;

  }


  /*
     JavaScript:
     сначала получаем свежий файл из сети.
     Если сети нет — используем кэш.
  */

  if (request.destination === "script") {

    event.respondWith(

      fetch(request)

        .then(response => {

          if (response && response.ok) {

            const responseCopy =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  request,
                  responseCopy
                );

              });

          }

          return response;

        })

        .catch(() => {

          return caches.match(request);

        })

    );

    return;

  }


  /*
     CSS, изображения, JSON
     и остальные ресурсы:
     сначала кэш.
     Если файла нет — сеть.
  */

  event.respondWith(

    caches.match(request)

      .then(cachedResponse => {

        if (cachedResponse) {

          return cachedResponse;

        }

        return fetch(request);

      })

      .catch(() => {

        return new Response(
          "",
          {
            status: 503,
            statusText: "Offline"
          }
        );

      })

  );

});