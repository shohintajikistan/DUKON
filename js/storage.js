// ============================================================
// SHOHIN MARKET
// js/storage.js
// Локальное хранилище приложения
// ============================================================

const STORAGE_KEYS = {
    cart: "shohin_cart",
    favorites: "shohin_favorites",
    orders: "shohin_orders",
    location: "shohin_location"
};


// ------------------------------------------------------------
// Базовые функции
// ------------------------------------------------------------

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("SHOHIN STORAGE SAVE ERROR:", error);
        return false;
    }
}


function loadStorage(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);

        if (value === null) {
            return defaultValue;
        }

        return JSON.parse(value);
    } catch (error) {
        console.error("SHOHIN STORAGE LOAD ERROR:", error);
        return defaultValue;
    }
}


function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error("SHOHIN STORAGE REMOVE ERROR:", error);
        return false;
    }
}


// ------------------------------------------------------------
// Корзина
// ------------------------------------------------------------

function getCart() {
    const cart = loadStorage(STORAGE_KEYS.cart, []);

    return Array.isArray(cart) ? cart : [];
}


function saveCart(cart) {
    if (!Array.isArray(cart)) {
        return false;
    }

    return saveStorage(STORAGE_KEYS.cart, cart);
}


function clearCart() {
    return removeStorage(STORAGE_KEYS.cart);
}


// ------------------------------------------------------------
// Избранное
// ------------------------------------------------------------

function getFavorites() {
    const favorites = loadStorage(STORAGE_KEYS.favorites, []);

    return Array.isArray(favorites) ? favorites : [];
}


function saveFavorites(favorites) {
    if (!Array.isArray(favorites)) {
        return false;
    }

    return saveStorage(STORAGE_KEYS.favorites, favorites);
}


function clearFavorites() {
    return removeStorage(STORAGE_KEYS.favorites);
}


// ------------------------------------------------------------
// Заказы
// ------------------------------------------------------------

function getOrders() {
    const orders = loadStorage(STORAGE_KEYS.orders, []);

    return Array.isArray(orders) ? orders : [];
}


function saveOrders(orders) {
    if (!Array.isArray(orders)) {
        return false;
    }

    return saveStorage(STORAGE_KEYS.orders, orders);
}


function addOrder(order) {
    const orders = getOrders();

    orders.unshift(order);

    return saveOrders(orders);
}


function clearOrders() {
    return removeStorage(STORAGE_KEYS.orders);
}


// ------------------------------------------------------------
// Место доставки
// ------------------------------------------------------------

function getDeliveryLocation() {
    const location = loadStorage(
        STORAGE_KEYS.location,
        null
    );

    if (!location || typeof location !== "object") {
        return null;
    }

    return location;
}


function saveDeliveryLocation(location) {
    if (!location || typeof location !== "object") {
        return false;
    }

    return saveStorage(
        STORAGE_KEYS.location,
        location
    );
}


function clearDeliveryLocation() {
    return removeStorage(STORAGE_KEYS.location);
}


// ------------------------------------------------------------
// Получение всех данных магазина
// ------------------------------------------------------------

function getAllShopData() {
    return {
        cart: getCart(),
        favorites: getFavorites(),
        orders: getOrders(),
        location: getDeliveryLocation()
    };
}


// ------------------------------------------------------------
// Полная очистка данных магазина
// ------------------------------------------------------------

function clearShopData() {
    clearCart();
    clearFavorites();
    clearOrders();
    clearDeliveryLocation();

    return true;
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    STORAGE_KEYS,

    saveStorage,
    loadStorage,
    removeStorage,

    getCart,
    saveCart,
    clearCart,

    getFavorites,
    saveFavorites,
    clearFavorites,

    getOrders,
    saveOrders,
    addOrder,
    clearOrders,

    getDeliveryLocation,
    saveDeliveryLocation,
    clearDeliveryLocation,

    getAllShopData,
    clearShopData
};