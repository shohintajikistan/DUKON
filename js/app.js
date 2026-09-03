// SHOHIN MARKET
// Main application controller

import {
    loadProducts,
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProductsData
} from "./products.js";

import {
    getCart,
    getFavorites,
    getOrders
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
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ========================================

let currentCategory = "";
let currentSearch = "";


// ========================================
// ЗАПУСК
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("SHOHIN MARKET запускается...");

    await loadProducts();

    renderProducts();
    renderFavorites();
    renderCart();
    renderOrders();

    updateCartUI();

    console.log(
        "SHOHIN MARKET готов. Товаров:",
        getProducts().length
    );
});


// ========================================
// НАВИГАЦИЯ
// ========================================

function openPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    if (pageId === "favorites") {
        renderFavorites();
    }

    if (pageId === "cart") {
        renderCart();
    }

    if (pageId === "orders") {
        renderOrders();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// TOAST
// ========================================

function showToast(message) {

    const toast =
        document.getElementById("shopToast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(window.__shohinToastTimer);

    window.__shohinToastTimer =
        setTimeout(() => {
            toast.hidden = true;
        }, 2200);
}


// ========================================
// КАРТОЧКА ТОВАРА
// ========================================

function productCard(product) {

    const favorite =
        isProductFavorite(product.id);

    const unavailable =
        product.available !== true;

    return `
        <article class="product-card">

            <div class="product-image">

                <span>
                    ${product.image || "🛒"}
                </span>

                ${
                    product.badge
                    ? `<small class="product-badge">
                            ${escapeHTML(product.badge)}
                       </small>`
                    : ""
                }

            </div>

            <button
                class="favorite-button"
                type="button"
                onclick="SHOHIN.toggleFavorite(${product.id})"
                aria-label="Избранное"
            >
                ${favorite ? "♥" : "♡"}
            </button>

            <div class="product-info">

                <h3>
                    ${escapeHTML(product.name)}
                </h3>

                <p>
                    ${escapeHTML(product.description || "")}
                </p>

                <div class="product-bottom">

                    <div class="product-price">

                        <strong>
                            ${formatPrice(product.price)} с.
                        </strong>

                        <span>
                            ${escapeHTML(product.unit)}
                        </span>

                    </div>

                    ${
                        unavailable
                        ? `
                            <button
                                type="button"
                                disabled
                            >
                                Нет
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                onclick="SHOHIN.addToCart(${product.id})"
                            >
                                +
                            </button>
                        `
                    }

                </div>

            </div>

        </article>
    `;
}


// ========================================
// ТОВАРЫ
// ========================================

function renderProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    let list = getProducts();

    if (currentCategory) {
        list =
            getProductsByCategory(
                currentCategory
            );
    }

    if (currentSearch) {
        list =
            searchProductsData(
                currentSearch
            );

        if (currentCategory) {
            list =
                list.filter(
                    product =>
                        product.category ===
                        currentCategory
                );
        }
    }

    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                Товары не найдены.
            </div>
        `;

        return;
    }

    container.innerHTML =
        list.map(productCard).join("");
}


// ========================================
// КАТЕГОРИЯ
// ========================================

function showCategory(category) {

    currentCategory = category;
    currentSearch = "";

    const search =
        document.getElementById(
            "searchInput"
        );

    if (search) {
        search.value = "";
    }

    renderProducts();

    openPage("home");
}


// ========================================
// ВСЕ ТОВАРЫ
// ========================================

function showAllProducts() {

    currentCategory = "";
    currentSearch = "";

    const search =
        document.getElementById(
            "searchInput"
        );

    if (search) {
        search.value = "";
    }

    renderProducts();

    openPage("home");
}


// ========================================
// ПОИСК
// ========================================

function search(query) {

    currentSearch =
        String(query || "").trim();

    renderProducts();

    openPage("home");
}


// ========================================
// ИЗБРАННОЕ
// ========================================

function toggleFavorite(productId) {

    const favorite =
        toggleProductFavorite(productId);

    if (favorite) {
        showToast("Добавлено в избранное");
    } else {
        showToast("Удалено из избранного");
    }

    renderProducts();
    renderFavorites();
}


function renderFavorites() {

    const container =
        document.getElementById(
            "favoritesList"
        );

    if (!container) {
        return;
    }

    const products =
        getFavoriteProducts();

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                В избранном пока ничего нет.
            </div>
        `;

        return;
    }

    container.innerHTML =
        products.map(productCard).join("");
}


// ========================================
// КОРЗИНА
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
    renderCart();

    showToast(
        "Товар добавлен в корзину"
    );
}


function renderCart() {

    const container =
        document.getElementById(
            "cartList"
        );

    const totalElement =
        document.getElementById(
            "cartTotal"
        );

    if (!container) {
        return;
    }

    const items =
        getCartItems();

    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                Корзина пуста.
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "0 с.";
        }

        return;
    }

    container.innerHTML =
        items.map(item => `

            <article class="cart-item">

                <div class="cart-item-image">
                    ${item.image || "🛒"}
                </div>

                <div class="cart-item-info">

                    <h3>
                        ${escapeHTML(item.name)}
                    </h3>

                    <span>
                        ${formatPrice(item.price)} с.
                        / ${escapeHTML(item.unit)}
                    </span>

                    <strong>
                        ${formatPrice(item.subtotal)} с.
                    </strong>

                </div>

                <div class="cart-quantity">

                    <button
                        type="button"
                        onclick="SHOHIN.decreaseCartQuantity(${item.id})"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        type="button"
                        onclick="SHOHIN.increaseCartQuantity(${item.id})"
                    >
                        +
                    </button>

                </div>

                <button
                    type="button"
                    onclick="SHOHIN.removeProductFromCart(${item.id})"
                >
                    ✕
                </button>

            </article>

        `).join("");

    if (totalElement) {
        totalElement.textContent =
            `${formatPrice(getCartTotal())} с.`;
    }
}


function increaseCartQuantity(productId) {

    if (
        increaseCartQuantityInternal(
            productId
        )
    ) {
        renderCart();
        updateCartUI();
    }
}


function decreaseCartQuantity(productId) {

    if (
        decreaseCartQuantityInternal(
            productId
        )
    ) {
        renderCart();
        updateCartUI();
    }
}


function increaseCartQuantityInternal(productId) {
    return increaseCartQuantity(productId);
}

function decreaseCartQuantityInternal(productId) {
    return decreaseCartQuantity(productId);
}


function removeFromCart(productId) {

    removeProductFromCart(productId);

    renderCart();
    updateCartUI();

    showToast(
        "Товар удалён из корзины"
    );
}


function clearShopCart() {

    clearCart();

    renderCart();
    updateCartUI();

    showToast(
        "Корзина очищена"
    );
}


// ========================================
// CHECKOUT
// ========================================

function openCheckout() {

    if (getCartCount() === 0) {

        showToast(
            "Корзина пуста"
        );

        return;
    }

    const total =
        document.getElementById(
            "checkoutTotal"
        );

    if (total) {

        total.textContent =
            `Итого: ${formatPrice(getCartTotal())} с.`;
    }

    openPage("checkout");
}


// ========================================
// ЗАКАЗ
// ========================================

function submitOrder(event) {

    event.preventDefault();

    const name =
        document.getElementById(
            "customerName"
        )?.value.trim();

    const phone =
        document.getElementById(
            "customerPhone"
        )?.value.trim();

    const address =
        document.getElementById(
            "deliveryAddress"
        )?.value.trim();

    const comment =
        document.getElementById(
            "orderComment"
        )?.value.trim();

    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value || "cash";

    if (!name || !phone || !address) {

        showToast(
            "Заполните данные доставки"
        );

        return;
    }

    const location =
        getDeliveryLocation();

    const order =
        createOrder({

            name,
            phone,
            address,
            comment,
            payment,

            lat: location.lat,
            lng: location.lng

        });

    if (!order) {

        showToast(
            "Корзина пуста"
        );

        return;
    }

    const form =
        document.getElementById(
            "checkoutForm"
        );

    if (form) {
        form.reset();
    }

    renderOrders();
    renderCart();
    updateCartUI();

    showToast(
        `Заказ ${order.id} создан`
    );

    openPage("orders");
}


// ========================================
// ЗАКАЗЫ
// ========================================

function renderOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );

    if (!container) {
        return;
    }

    const orders =
        getCurrentOrders();

    if (!orders.length) {

        container.innerHTML = `
            <div class="empty-state">
                Заказов пока нет.
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders.map(order => `

            <article class="order-card">

                <div class="order-header">

                    <strong>
                        ${escapeHTML(order.id)}
                    </strong>

                    <span>
                        ${formatDate(order.date)}
                    </span>

                </div>

                <div class="order-status">
                    ${escapeHTML(order.statusText || "Заказ")}
                </div>

                <div class="order-items">

                    ${
                        order.items
                        .map(item => `
                            <div>
                                <span>
                                    ${escapeHTML(item.name)}
                                    × ${item.quantity}
                                </span>

                                <strong>
                                    ${formatPrice(item.subtotal)} с.
                                </strong>
                            </div>
                        `)
                        .join("")
                    }

                </div>

                <div class="order-total">

                    <span>
                        Итого
                    </span>

                    <strong>
                        ${formatPrice(order.total)} с.
                    </strong>

                </div>

                ${
                    order.status !== "completed" &&
                    order.status !== "cancelled"
                    ? `
                        <button
                            type="button"
                            onclick="SHOHIN.confirmOrderReceived('${order.id}')"
                        >
                            Подтвердить получение
                        </button>
                    `
                    : ""
                }

            </article>

        `).join("");
}


function confirmOrderReceivedUI(orderId) {

    confirmOrderReceived(orderId);

    renderOrders();

    showToast(
        "Заказ отмечен как полученный"
    );
}


function cancelOrderUI(orderId) {

    cancelOrder(orderId);

    renderOrders();

    showToast(
        "Заказ отменён"
    );
}


function repeatLastOrderUI() {

    const success =
        repeatLastOrder();

    if (!success) {

        showToast(
            "Нет заказа для повтора"
        );

        return;
    }

    renderCart();
    updateCartUI();

    showToast(
        "Последний заказ добавлен в корзину"
    );

    openPage("cart");
}


// ========================================
// КАРТА / АДРЕС
// ========================================

function openDeliveryMap() {

    const modal =
        document.getElementById(
            "mapModal"
        );

    if (modal) {
        modal.hidden = false;
    }
}


function closeDeliveryMap() {

    const modal =
        document.getElementById(
            "mapModal"
        );

    if (modal) {
        modal.hidden = true;
    }
}


function confirmDeliveryLocation() {

    const address =
        document.getElementById(
            "mapAddress"
        )?.value.trim();

    if (!address) {

        showToast(
            "Введите адрес"
        );

        return;
    }

    setDeliveryAddress(address);

    const addressField =
        document.getElementById(
            "deliveryAddress"
        );

    if (addressField) {
        addressField.value = address;
    }

    closeDeliveryMap();

    showToast(
        "Адрес выбран"
    );
}


// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("ru-RU");
}


function formatDate(date) {

    if (!date) {
        return "";
    }

    try {

        return new Date(date)
            .toLocaleDateString(
                "ru-RU"
            );

    } catch {

        return "";
    }
}


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// ОБНОВЛЕНИЕ UI
// ========================================

function updateCartUI() {

    const count =
        getCartCount();

    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(element => {

            element.textContent =
                count;
        });

    const cartCount =
        document.getElementById(
            "cartCount"
        );

    if (cartCount) {

        cartCount.textContent =
            count;

        cartCount.style.display =
            count > 0
                ? "flex"
                : "none";
    }
}


function refreshShopUI() {

    renderProducts();
    renderFavorites();
    renderCart();
    renderOrders();
    updateCartUI();
}


// ========================================
// SH MENU
// ========================================

function toggleSHMenu() {

    const menu =
        document.getElementById(
            "shMenu"
        );

    if (!menu) {
        return;
    }

    menu.hidden =
        !menu.hidden;
}


// ========================================
// WHATSAPP
// ========================================

function openWhatsApp() {

    showToast(
        "WhatsApp будет подключён после добавления номера магазина"
    );
}


// ========================================
// ГЛОБАЛЬНЫЙ API SHOHIN
// ========================================

window.SHOHIN = {

    // Products
    products: getProducts,
    getProductById,

    // Search
    search,
    showCategory,
    showAllProducts,

    // Cart
    cart: getCart,
    addToCart,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeProductFromCart:
        removeFromCart,
    clearCart:
        clearShopCart,
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
    confirmOrderReceived:
        confirmOrderReceivedUI,
    cancelOrder:
        cancelOrderUI,
    repeatLastOrder:
        repeatLastOrderUI,

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
    showToast,
    openCheckout,
    submitOrder,
    openDeliveryMap,
    closeDeliveryMap,
    confirmDeliveryLocation,
    toggleSHMenu,
    openWhatsApp
};


// ========================================
// GLOBAL FUNCTIONS FOR HTML
// ========================================

window.renderProducts = renderProducts;
window.renderFavorites = renderFavorites;
window.renderCart = renderCart;
window.renderOrders = renderOrders;

window.performSearch = () => {

    const input =
        document.getElementById(
            "searchInput"
        );

    search(
        input?.value || ""
    );
};

window.showCategory = showCategory;
window.showAllProducts = showAllProducts;
window.openCheckout = openCheckout;
window.submitOrder = submitOrder;
window.openDeliveryMap = openDeliveryMap;
window.closeDeliveryMap = closeDeliveryMap;
window.confirmDeliveryLocation =
    confirmDeliveryLocation;
window.toggleSHMenu = toggleSHMenu;
window.openWhatsApp = openWhatsApp;