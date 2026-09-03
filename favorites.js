// SHOHIN MARKET
// Favorites module

// Получить список избранного
function getCurrentFavorites() {
    return getFavorites();
}


// Добавить товар в избранное
function addToFavorites(productId) {
    const product = getProductById(productId);

    if (!product) {
        console.error("Товар не найден:", productId);
        return false;
    }

    const favorites = getFavorites();

    if (!favorites.includes(product.id)) {
        favorites.push(product.id);
        saveFavorites(favorites);
    }

    return true;
}


// Удалить товар из избранного
function removeFromFavorites(productId) {
    let favorites = getFavorites();

    favorites = favorites.filter(
        id => Number(id) !== Number(productId)
    );

    saveFavorites(favorites);

    return true;
}


// Переключить избранное
function toggleProductFavorite(productId) {
    const favorites = getFavorites();

    const exists = favorites.some(
        id => Number(id) === Number(productId)
    );

    if (exists) {
        removeFromFavorites(productId);
        return false;
    }

    addToFavorites(productId);
    return true;
}


// Проверить, находится ли товар в избранном
function isProductFavorite(productId) {
    return getFavorites().some(
        id => Number(id) === Number(productId)
    );
}


// Получить товары из избранного
function getFavoriteProducts() {
    return getFavorites()
        .map(id => getProductById(id))
        .filter(Boolean);
}


// Очистить избранное
function clearFavorites() {
    saveFavorites([]);
}


// Количество избранных товаров
function getFavoritesCount() {
    return getFavorites().length;
}