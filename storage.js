// SHOHIN MARKET
// LocalStorage module

const STORAGE_KEYS = {
    cart: "sh_cart",
    favorites: "sh_favorites",
    orders: "sh_orders"
};


// ================================
// Универсальные функции
// ================================

function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Ошибка сохранения:", error);
        return false;
    }
}


function loadStorage(key, defaultValue = []) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return defaultValue;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        return defaultValue;
    }
}


// ================================
// Корзина
// ================================

function getCart() {
    return loadStorage(STORAGE_KEYS.cart, []);
}


function saveCart(cart) {
    return saveStorage(STORAGE_KEYS.cart, cart);
}


// ================================
// Избранное
// ================================

function getFavorites() {
    return loadStorage(STORAGE_KEYS.favorites, []);
}


function saveFavorites(favorites) {
    return saveStorage(STORAGE_KEYS.favorites, favorites);
}


// ================================
// Заказы
// ================================

function getOrders() {
    return loadStorage(STORAGE_KEYS.orders, []);
}


function saveOrders(orders) {
    return saveStorage(STORAGE_KEYS.orders, orders);
}


// ================================
// Очистка данных
// ================================

function clearShopData() {
    localStorage.removeItem(STORAGE_KEYS.cart);
    localStorage.removeItem(STORAGE_KEYS.favorites);
    localStorage.removeItem(STORAGE_KEYS.orders);
}


// ================================
// Экспорт данных
// ================================

function getAllShopData() {
    return {
        cart: getCart(),
        favorites: getFavorites(),
        orders: getOrders()
    };
}