// ============================================================
// SHOHIN MARKET
// js/favorites.js
// Работа с избранными товарами
// ============================================================

import {
    getFavorites,
    saveFavorites,
    clearFavorites
} from "./storage.js";

import {
    getProductById
} from "./products.js";


// ------------------------------------------------------------
// Получить ID избранных товаров
// ------------------------------------------------------------

function getFavoriteIds() {
    return getFavorites();
}


// ------------------------------------------------------------
// Проверить, находится ли товар в избранном
// ------------------------------------------------------------

function isFavorite(productId) {

    const favorites = getFavorites();

    return favorites.some(
        id => String(id) === String(productId)
    );
}


// ------------------------------------------------------------
// Добавить товар в избранное
// ------------------------------------------------------------

function addToFavorites(productId) {

    const favorites = getFavorites();

    const exists = favorites.some(
        id => String(id) === String(productId)
    );

    if (!exists) {
        favorites.push(productId);
        saveFavorites(favorites);
    }

    return favorites;
}


// ------------------------------------------------------------
// Удалить товар из избранного
// ------------------------------------------------------------

function removeFromFavorites(productId) {

    const favorites = getFavorites();

    const updatedFavorites = favorites.filter(
        id => String(id) !== String(productId)
    );

    saveFavorites(updatedFavorites);

    return updatedFavorites;
}


// ------------------------------------------------------------
// Переключить избранное
// ------------------------------------------------------------

function toggleFavorite(productId) {

    if (isFavorite(productId)) {

        return {
            favorite: false,
            ids: removeFromFavorites(productId)
        };

    }

    return {
        favorite: true,
        ids: addToFavorites(productId)
    };
}


// ------------------------------------------------------------
// Количество избранных товаров
// ------------------------------------------------------------

function getFavoritesCount() {
    return getFavorites().length;
}


// ------------------------------------------------------------
// Получить полные данные избранных товаров
// ------------------------------------------------------------

async function getFavoriteProducts() {

    const ids = getFavorites();

    const products = [];

    for (const id of ids) {

        const product = await getProductById(id);

        if (product) {
            products.push(product);
        }
    }

    return products;
}


// ------------------------------------------------------------
// Удалить несуществующие товары из избранного
// ------------------------------------------------------------

async function syncFavorites() {

    const ids = getFavorites();

    const validIds = [];

    for (const id of ids) {

        const product = await getProductById(id);

        if (product) {
            validIds.push(product.id);
        }
    }

    saveFavorites(validIds);

    return validIds;
}


// ------------------------------------------------------------
// Очистить избранное
// ------------------------------------------------------------

function emptyFavorites() {
    clearFavorites();

    return [];
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    getFavoriteIds,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    getFavoritesCount,
    getFavoriteProducts,
    syncFavorites,
    emptyFavorites
};