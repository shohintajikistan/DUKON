// SHOHIN MARKET
// Favorites module

import {
    getFavorites,
    saveFavorites
} from "./storage.js";

import {
    getProductById
} from "./products.js";


// ========================================
// Получить избранное
// ========================================

function getCurrentFavorites() {
    return getFavorites();
}


// ========================================
// Добавить в избранное
// ========================================

function addToFavorites(productId) {

    const product =
        getProductById(productId);

    if (!product) {
        console.error(
            "Товар не найден:",
            productId
        );

        return false;
    }

    const favorites =
        getFavorites();

    const exists =
        favorites.some(
            id =>
                Number(id) ===
                Number(productId)
        );

    if (!exists) {

        favorites.push(
            product.id
        );

        saveFavorites(
            favorites
        );
    }

    return true;
}


// ========================================
// Удалить из избранного
// ========================================

function removeFromFavorites(
    productId
) {

    let favorites =
        getFavorites();

    favorites =
        favorites.filter(
            id =>
                Number(id) !==
                Number(productId)
        );

    saveFavorites(
        favorites
    );

    return true;
}


// ========================================
// Переключить избранное
// ========================================

function toggleProductFavorite(
    productId
) {

    const favorites =
        getFavorites();

    const exists =
        favorites.some(
            id =>
                Number(id) ===
                Number(productId)
        );

    if (exists) {

        removeFromFavorites(
            productId
        );

        return false;
    }

    addToFavorites(
        productId
    );

    return true;
}


// ========================================
// Проверить избранное
// ========================================

function isProductFavorite(
    productId
) {

    return getFavorites().some(
        id =>
            Number(id) ===
            Number(productId)
    );
}


// ========================================
// Получить товары
// ========================================

function getFavoriteProducts() {

    return getFavorites()
        .map(
            id =>
                getProductById(id)
        )
        .filter(Boolean);
}


// ========================================
// Очистить избранное
// ========================================

function clearFavorites() {
    saveFavorites([]);
}


// ========================================
// Количество избранных
// ========================================

function getFavoritesCount() {
    return getFavorites().length;
}


// ========================================
// Экспорт
// ========================================

export {
    getCurrentFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleProductFavorite,
    isProductFavorite,
    getFavoriteProducts,
    clearFavorites,
    getFavoritesCount
};