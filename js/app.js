// SHOHIN MARKET
// Main application

import { loadProducts, getProducts, getProductById } from "./products.js";

import {
    getCart,
    saveCart
} from "./storage.js";

import {
    addProductToCart,
    updateCartQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeProductFromCart,
    clearCart,
    getCartItems,
    getCartTotal,
    getCartCount
} from "./cart.js";

import {
    addToFavorites,
    removeFromFavorites,
    toggleProductFavorite,
    isProductFavorite,
    getFavoriteProducts,
    getFavoritesCount
} from "./favorites.js";

import {
    getCurrentOrders,
    createOrder,
    getOrderById,
    updateOrderStatus,
    getLastOrder,
    confirmOrderReceived,
    cancelOrder,
    repeatLastOrder
} from "./orders.js";

import {
    setDeliveryLocation,
    getDeliveryLocation,
    setDeliveryAddress,
    getDeliveryAddress,
    hasDeliveryLocation,
    clearDeliveryLocation
} from "./map.js";


// ========================================
// Запуск SHOHIN MARKET
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("SHOHIN MARKET запускается...");

    await loadProducts();

    console.log(
        "Товары загружены:",
        getProducts().length
    );

    updateCartUI();

    console.log("SHOHIN MARKET готов.");
});


// ========================================
// Навигация
// ========================================

function openPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// Обновление интерфейса
// ========================================

function refreshShopUI() {

    updateCartUI();

    if (typeof window.renderProducts === "function") {
        window.renderProducts();
    }

    if (typeof window.renderFavorites === "function") {
        window.renderFavorites();
    }

    if (typeof window.renderCart === "function") {
        window.renderCart();
    }

    if (typeof window.renderOrders === "function") {
        window.renderOrders();
    }
}


// ========================================
// Счётчик корзины
// ========================================

function updateCartUI() {

    const count = getCartCount();

    document.querySelectorAll("[data-cart-count]").forEach(element => {
        element.textContent = count;
    });

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {

        cartCount.textContent = count;

        cartCount.style.display =
            count > 0 ? "flex" : "none";
    }
}


// ========================================
// Toast
// ========================================

function showToast(message) {

    let toast =
        document.getElementById("shopToast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "shopToast";

        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.bottom = "90px";
        toast.style.transform =
            "translateX(-50%)";

        toast.style.zIndex = "9999";

        toast.style.padding =
            "12px 18px";

        toast.style.borderRadius =
            "14px";

        toast.style.background =
            "#092f24";

        toast.style.color =
            "#ffffff";

        toast.style.fontSize =
            "14px";

        toast.style.boxShadow =
            "0 8px 25px rgba(0,0,0,.2)";

        toast.style.transition =
            "opacity .2s";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.style.opacity = "1";

    clearTimeout(
        window.__shopToastTimer
    );

    window.__shopToastTimer =
        setTimeout(() => {

            toast.style.opacity = "0";

        }, 2200);
}


// ========================================
// Корзина
// ========================================

function addToCart(productId) {

    const success =
        addProductToCart(productId);

    if (!success) {

        showToast(
            "Не удалось добавить товар"
        );

        return;
    }

    updateCartUI();

    showToast(
        "Товар добавлен в корзину"
    );

    refreshShopUI();
}


// ========================================
// Избранное
// ========================================

function toggleFavorite(productId) {

    const isFavorite =
        toggleProductFavorite(productId);

    if (isFavorite) {

        showToast(
            "Добавлено в избранное"
        );

    } else {

        showToast(
            "Удалено из избранного"
        );
    }

    refreshShopUI();
}


// ========================================
// Глобальный объект SHOHIN
// ========================================

window.SHOHIN = {

    // Products
    products: getProducts,
    getProductById,

    // Cart
    cart: getCart,
    addToCart,
    updateCartQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeProductFromCart,
    clearCart,
    getCartItems,
    getCartTotal,
    getCartCount,

    // Favorites
    favorites: getFavoriteProducts,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isProductFavorite,
    getFavoritesCount,

    // Orders
    orders: getCurrentOrders,
    createOrder,
    getOrderById,
    updateOrderStatus,
    getLastOrder,
    confirmOrderReceived,
    cancelOrder,
    repeatLastOrder,

    // Map
    setDeliveryLocation,
    getDeliveryLocation,
    setDeliveryAddress,
    getDeliveryAddress,
    hasDeliveryLocation,
    clearDeliveryLocation,

    // UI
    openPage,
    refreshShopUI,
    updateCartUI,
    showToast
};