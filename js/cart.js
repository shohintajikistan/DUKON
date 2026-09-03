// SHOHIN MARKET
// Cart module

import {
    getCart,
    saveCart
} from "./storage.js";

import {
    getProductById
} from "./products.js";


// ========================================
// Получить текущую корзину
// ========================================

function getCurrentCart() {
    return getCart();
}


// ========================================
// Добавить товар
// ========================================

function addProductToCart(productId, quantity = 1) {

    const product =
        getProductById(productId);

    if (!product) {
        console.error(
            "Товар не найден:",
            productId
        );

        return false;
    }

    if (!product.available) {
        console.warn(
            "Товар недоступен:",
            product.name
        );

        return false;
    }

    const cart = getCart();

    const existingItem =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(productId)
        );

    if (existingItem) {

        existingItem.quantity +=
            Number(quantity);

    } else {

        cart.push({
            productId: product.id,
            quantity: Number(quantity)
        });
    }

    saveCart(cart);

    return true;
}


// ========================================
// Изменить количество
// ========================================

function updateCartQuantity(
    productId,
    quantity
) {

    const cart = getCart();

    const item =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(productId)
        );

    if (!item) {
        return false;
    }

    quantity = Number(quantity);

    if (quantity <= 0) {
        return removeProductFromCart(
            productId
        );
    }

    item.quantity = quantity;

    saveCart(cart);

    return true;
}


// ========================================
// Увеличить
// ========================================

function increaseCartQuantity(
    productId
) {

    const cart = getCart();

    const item =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(productId)
        );

    if (!item) {
        return false;
    }

    item.quantity++;

    saveCart(cart);

    return true;
}


// ========================================
// Уменьшить
// ========================================

function decreaseCartQuantity(
    productId
) {

    const cart = getCart();

    const item =
        cart.find(
            item =>
                Number(item.productId) ===
                Number(productId)
        );

    if (!item) {
        return false;
    }

    item.quantity--;

    if (item.quantity <= 0) {

        return removeProductFromCart(
            productId
        );
    }

    saveCart(cart);

    return true;
}


// ========================================
// Удалить товар
// ========================================

function removeProductFromCart(
    productId
) {

    let cart = getCart();

    cart =
        cart.filter(
            item =>
                Number(item.productId) !==
                Number(productId)
        );

    saveCart(cart);

    return true;
}


// ========================================
// Очистить корзину
// ========================================

function clearCart() {
    saveCart([]);
}


// ========================================
// Получить товары корзины
// ========================================

function getCartItems() {

    const cart = getCart();

    return cart
        .map(item => {

            const product =
                getProductById(
                    item.productId
                );

            if (!product) {
                return null;
            }

            return {
                ...product,

                quantity:
                    Number(item.quantity),

                subtotal:
                    product.price *
                    Number(item.quantity)
            };
        })

        .filter(Boolean);
}


// ========================================
// Общая сумма
// ========================================

function getCartTotal() {

    return getCartItems()
        .reduce(
            (total, item) =>
                total + item.subtotal,
            0
        );
}


// ========================================
// Количество товаров
// ========================================

function getCartCount() {

    return getCart()
        .reduce(
            (total, item) =>
                total +
                Number(item.quantity),
            0
        );
}


// ========================================
// Проверить наличие товара
// ========================================

function isProductInCart(productId) {

    return getCart().some(
        item =>
            Number(item.productId) ===
            Number(productId)
    );
}


// ========================================
// Экспорт
// ========================================

export {
    getCurrentCart,

    addProductToCart,

    updateCartQuantity,

    increaseCartQuantity,

    decreaseCartQuantity,

    removeProductFromCart,

    clearCart,

    getCartItems,

    getCartTotal,

    getCartCount,

    isProductInCart
};