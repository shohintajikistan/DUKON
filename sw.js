// SHOHIN MARKET
// Service Worker V2

const CACHE_NAME = "shohin-market-v2";

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

/* ================================
   INSTALL
================================ */

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


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys.map(key => {

            if (key !== CACHE_NAME) {

              return caches.delete(key);

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


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", event => {

  const request = event.request;

  /*
     HTML и JavaScript всегда
     сначала пытаемся получить
     свежими из сети.
  */

  if (
    request.method === "GET" &&
    (
      request.destination === "document" ||
      request.destination === "script"
    )
  ) {

    event.respondWith(

      fetch(request)
        .then(response => {

          if (response && response.ok) {

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, copy);
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
     CSS, изображения, JSON и другие
     файлы работают через кэш.
  */

  event.respondWith(

    caches.match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request);

      })
      .catch(() => {

        return caches.match("./index.html");

      })

  );

});