// ============================================================
// SHOHIN MARKET
// Service Worker
// ============================================================

const CACHE_NAME = "shohin-market-v1";

const APP_SHELL = [
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


// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", event => {

    event.waitUntil(

        caches
            .open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    APP_SHELL
                );

            })
            .then(() => {

                return self.skipWaiting();

            })

    );

});


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(cacheNames => {

                return Promise.all(

                    cacheNames
                        .filter(
                            cacheName =>
                                cacheName !==
                                CACHE_NAME
                        )
                        .map(
                            cacheName =>
                                caches.delete(
                                    cacheName
                                )
                        )

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", event => {

    const request =
        event.request;


    // Только GET
    if (
        request.method !== "GET"
    ) {
        return;
    }


    event.respondWith(

        caches
            .match(request)
            .then(cachedResponse => {

                // Если есть в кэше —
                // сразу отдаём
                if (cachedResponse) {

                    return cachedResponse;

                }


                // Иначе пробуем сеть
                return fetch(request)

                    .then(networkResponse => {

                        // Кэшируем только
                        // нормальные ответы
                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type === "basic"
                        ) {

                            const responseClone =
                                networkResponse.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                });

                        }


                        return networkResponse;

                    })

                    .catch(() => {

                        // Если интернета нет —
                        // возвращаем главную страницу
                        return caches.match(
                            "./index.html"
                        );

                    });

            })

    );

});