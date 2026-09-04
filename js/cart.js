// ============================================================
// SHOHIN MARKET
// js/cart.js
// Работа с корзиной
// ============================================================

import {
    getCart,
    saveCart,
    clearCart
} from "./storage.js";

import {
    getProductById,
    getProductPrice,
    isProductAvailable
} from "./products.js";


// ------------------------------------------------------------
// Получить корзину
// ------------------------------------------------------------

function getCartItems() {
    return getCart();
}


// ------------------------------------------------------------
// Добавить товар в корзину
// ------------------------------------------------------------

async function addToCart(productId, quantity = 1) {

    const product = await getProductById(productId);

    if (!product) {
        throw new Error("Товар не найден");
    }

    if (!isProductAvailable(product)) {
        throw new Error("Этот товар сейчас недоступен");
    }

    quantity = Number(quantity);

    if (!Number.isFinite(quantity) || quantity < 1) {
        quantity = 1;
    }

    quantity = Math.floor(quantity);

    const cart = getCart();

    const existingItem = cart.find(
        item => String(item.id) === String(product.id)
    );

    if (existingItem) {

        existingItem.quantity += quantity;

    } else {

        cart.push({
            id: product.id,
            quantity: quantity
        });
    }

    saveCart(cart);

    return cart;
}


// ------------------------------------------------------------
// Установить количество товара
// ------------------------------------------------------------

async function setCartQuantity(productId, quantity) {

    const product = await getProductById(productId);

    if (!product) {
        throw new Error("Товар не найден");
    }

    quantity = Number(quantity);

    if (!Number.isFinite(quantity)) {
        quantity = 1;
    }

    quantity = Math.floor(quantity);

    const cart = getCart();

    const item = cart.find(
        cartItem => String(cartItem.id) === String(productId)
    );

    if (!item) {
        return cart;
    }

    if (quantity <= 0) {

        const updatedCart = cart.filter(
            cartItem =>
                String(cartItem.id) !== String(productId)
        );

        saveCart(updatedCart);

        return updatedCart;
    }

    item.quantity = quantity;

    saveCart(cart);

    return cart;
}


// ------------------------------------------------------------
// Увеличить количество
// ------------------------------------------------------------

async function increaseCartItem(productId) {

    const cart = getCart();

    const item = cart.find(
        cartItem => String(cartItem.id) === String(productId)
    );

    if (!item) {
        return addToCart(productId, 1);
    }

    return setCartQuantity(
        productId,
        item.quantity + 1
    );
}


// ------------------------------------------------------------
// Уменьшить количество
// ------------------------------------------------------------

async function decreaseCartItem(productId) {

    const cart = getCart();

    const item = cart.find(
        cartItem => String(cartItem.id) === String(productId)
    );

    if (!item) {
        return cart;
    }

    return setCartQuantity(
        productId,
        item.quantity - 1
    );
}


// ------------------------------------------------------------
// Удалить товар
// ------------------------------------------------------------

function removeFromCart(productId) {

    const cart = getCart();

    const updatedCart = cart.filter(
        item =>
            String(item.id) !== String(productId)
    );

    saveCart(updatedCart);

    return updatedCart;
}


// ------------------------------------------------------------
// Очистить корзину
// ------------------------------------------------------------

function emptyCart() {
    clearCart();

    return [];
}


// ------------------------------------------------------------
// Количество единиц товара в корзине
// ------------------------------------------------------------

function getCartCount() {

    const cart = getCart();

    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );
}


// ------------------------------------------------------------
// Получить полную корзину вместе с данными товаров
// ------------------------------------------------------------

async function getDetailedCart() {

    const cart = getCart();

    const detailedItems = [];

    for (const item of cart) {

        const product = await getProductById(item.id);

        if (!product) {
            continue;
        }

        const quantity = Math.max(
            1,
            Number(item.quantity || 1)
        );

        const price = getProductPrice(product);

        detailedItems.push({
            id: product.id,
            name: product.name,
            description: product.description || "",
            category: product.category || "",
            image: product.image || "",
            unit: product.unit || "шт.",
            price: price,
            quantity: quantity,
            available: isProductAvailable(product),
            subtotal: price * quantity
        });
    }

    return detailedItems;
}


// ------------------------------------------------------------
// Сумма товаров
// ------------------------------------------------------------

async function getCartSubtotal() {

    const items = await getDetailedCart();

    return items.reduce(
        (total, item) =>
            total + item.subtotal,
        0
    );
}


// ------------------------------------------------------------
// Проверка пустая ли корзина
// ------------------------------------------------------------

function isCartEmpty() {
    return getCart().length === 0;
}


// ------------------------------------------------------------
// Синхронизация корзины
// Удаляет товары, которых больше нет в каталоге
// ------------------------------------------------------------

async function syncCart() {

    const cart = getCart();

    const validItems = [];

    for (const item of cart) {

        const product = await getProductById(item.id);

        if (!product) {
            continue;
        }

        if (!isProductAvailable(product)) {
            validItems.push({
                ...item,
                quantity: Number(item.quantity || 1)
            });

            continue;
        }

        validItems.push({
            ...item,
            quantity: Math.max(
                1,
                Number(item.quantity || 1)
            )
        });
    }

    saveCart(validItems);

    return validItems;
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    getCartItems,
    addToCart,
    setCartQuantity,
    increaseCartItem,
    decreaseCartItem,
    removeFromCart,
    emptyCart,
    getCartCount,
    getDetailedCart,
    getCartSubtotal,
    isCartEmpty,
    syncCart
};