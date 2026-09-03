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
    addProductToCart,
    increaseCartQuantity as cartIncrease,
    decreaseCartQuantity as cartDecrease,
    removeProductFromCart as cartRemove,
    clearCart as cartClear,
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
// APP STATE
// ========================================

let currentCategory = "";
let currentSearch = "";


// ========================================
// START APPLICATION
// ========================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("SHOHIN MARKET запускается...");

    try {

        await loadProducts();

        renderProducts();
        renderFavorites();
        renderCart();
        renderOrders();
        updateCartUI();

        console.log(
            "SHOHIN MARKET готов.",
            "Товаров:",
            getProducts().length
        );

    } catch (error) {

        console.error(
            "Ошибка запуска SHOHIN MARKET:",
            error
        );

        showToast(
            "Ошибка загрузки магазина"
        );
    }
});


// ========================================
// NAVIGATION
// ========================================

function openPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
        });

    const page =
        document.getElementById(pageId);

    if (page) {

        page.classList.add("active");

    } else {

        console.warn(
            "Страница не найдена:",
            pageId
        );

        return;
    }

    if (pageId === "favorites") {
        renderFavorites();
    }

    if (pageId === "cart") {
        renderCart();
    }

    if (pageId === "checkout") {
        updateCheckoutTotal();
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

    let toast =
        document.getElementById("shopToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "shopToast";
        toast.className = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent =
        String(message || "");

    toast.hidden = false;

    clearTimeout(
        window.__shohinToastTimer
    );

    window.__shohinToastTimer =
        setTimeout(() => {

            toast.hidden = true;

        }, 2200);
}


// ========================================
// PRICE
// ========================================

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("ru-RU");
}


// ========================================
// DATE
// ========================================

function formatDate(date) {

    if (!date) {
        return "";
    }

    try {

        return new Date(date)
            .toLocaleDateString(
                "ru-RU",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

    } catch {

        return "";
    }
}


// ========================================
// HTML SECURITY
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ========================================
// PRODUCT CARD
// ========================================

function productCard(product) {

    const favorite =
        isProductFavorite(product.id);

    const available =
        product.available === true;

    return `

        <article class="product-card">

            <div class="product-image">

                ${
                    product.badge
                    ? `
                        <span class="product-badge">
                            ${escapeHTML(product.badge)}
                        </span>
                    `
                    : ""
                }

                <span class="product-emoji">
                    ${product.image || "🛒"}
                </span>

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
                    ${escapeHTML(
                        product.description || ""
                    )}
                </p>

                <div class="product-bottom">

                    <div class="product-price">

                        <strong>
                            ${formatPrice(product.price)} с.
                        </strong>

                        <span>
                            ${escapeHTML(
                                product.unit || ""
                            )}
                        </span>

                    </div>

                    ${
                        available
                        ? `
                            <button
                                class="add-cart-button"
                                type="button"
                                onclick="SHOHIN.addToCart(${product.id})"
                            >
                                +
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                disabled
                            >
                                Нет
                            </button>
                        `
                    }

                </div>

            </div>

        </article>
    `;
}


// ========================================
// RENDER PRODUCTS
// ========================================

function renderProducts() {

    const container =
        document.getElementById("products");

    if (!container) {
        return;
    }

    let products =
        getProducts();

    if (currentCategory) {

        products =
            getProductsByCategory(
                currentCategory
            );
    }

    if (currentSearch) {

        products =
            searchProductsData(
                currentSearch
            );

        if (currentCategory) {

            products =
                products.filter(
                    product =>
                        product.category ===
                        currentCategory
                );
        }
    }

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div>🔎</div>
                <p>Товары не найдены.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        products
            .map(productCard)
            .join("");
}


// ========================================
// SEARCH
// ========================================

function search(query) {

    currentSearch =
        String(query || "")
            .trim();

    renderProducts();

    openPage("home");
}


// ========================================
// CATEGORY
// ========================================

function showCategory(category) {

    currentCategory =
        String(category || "");

    currentSearch = "";

    const input =
        document.getElementById(
            "searchInput"
        );

    if (input) {
        input.value = "";
    }

    renderProducts();

    openPage("home");
}


// ========================================
// SHOW ALL
// ========================================

function showAllProducts() {

    currentCategory = "";
    currentSearch = "";

    const input =
        document.getElementById(
            "searchInput"
        );

    if (input) {
        input.value = "";
    }

    renderProducts();

    openPage("home");
}


// ========================================
// FAVORITES
// ========================================

function toggleFavorite(productId) {

    const result =
        toggleProductFavorite(productId);

    if (result) {

        showToast(
            "Добавлено в избранное"
        );

    } else {

        showToast(
            "Удалено из избранного"
        );
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
                <div>♡</div>
                <p>В избранном пока ничего нет.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        products
            .map(productCard)
            .join("");
}


// ========================================
// ADD TO CART
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


// ========================================
// CART
// ========================================

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
                <div>🛒</div>
                <p>Корзина пуста.</p>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent =
                "0 с.";
        }

        return;
    }

    container.innerHTML =
        items
            .map(item => `

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
                            / ${escapeHTML(item.unit || "")}
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
                        class="cart-remove"
                        type="button"
                        onclick="SHOHIN.removeProductFromCart(${item.id})"
                        aria-label="Удалить"
                    >
                        ✕
                    </button>

                </article>

            `)
            .join("");

    if (totalElement) {

        totalElement.textContent =
            `${formatPrice(
                getCartTotal()
            )} с.`;
    }
}


// ========================================
// CART +
// ========================================

function increaseCartQuantity(productId) {

    const success =
        cartIncrease(productId);

    if (success) {

        renderCart();
        updateCartUI();

    }
}


// ========================================
// CART -
// ========================================

function decreaseCartQuantity(productId) {

    const success =
        cartDecrease(productId);

    if (success) {

        renderCart();
        updateCartUI();

    }
}


// ========================================
// REMOVE FROM CART
// ========================================

function removeProductFromCart(productId) {

    cartRemove(productId);

    renderCart();
    updateCartUI();

    showToast(
        "Товар удалён из корзины"
    );
}


// ========================================
// CLEAR CART
// ========================================

function clearShopCart() {

    cartClear();

    renderCart();
    updateCartUI();

    showToast(
        "Корзина очищена"
    );
}


// ========================================
// CART UI
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


// ========================================
// CHECKOUT
// ========================================

function openCheckout() {

    if (getCartCount() <= 0) {

        showToast(
            "Корзина пуста"
        );

        return;
    }

    updateCheckoutTotal();

    openPage("checkout");
}


function updateCheckoutTotal() {

    const element =
        document.getElementById(
            "checkoutTotal"
        );

    if (!element) {
        return;
    }

    element.textContent =
        `Итого: ${formatPrice(
            getCartTotal()
        )} с.`;
}


// ========================================
// CREATE ORDER
// ========================================

function submitOrder(event) {

    if (event) {
        event.preventDefault();
    }

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

    if (!name) {

        showToast(
            "Введите имя"
        );

        return;
    }

    if (!phone) {

        showToast(
            "Введите телефон"
        );

        return;
    }

    if (!address) {

        showToast(
            "Введите адрес доставки"
        );

        return;
    }

    if (getCartCount() <= 0) {

        showToast(
            "Корзина пуста"
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
            "Не удалось создать заказ"
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

    clearDeliveryLocation();

    renderCart();
    renderOrders();
    updateCartUI();

    showToast(
        `Заказ ${order.id} создан`
    );

    openPage("orders");
}


// ========================================
// ORDERS
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
                <div>📦</div>
                <p>Заказов пока нет.</p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        orders
            .map(order => `

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
                        ${escapeHTML(
                            order.statusText ||
                            "Новый заказ"
                        )}
                    </div>

                    <div class="order-items">

                        ${
                            Array.isArray(order.items)
                            ? order.items.map(item => `

                                <div class="order-item">

                                    <span>
                                        ${escapeHTML(
                                            item.name
                                        )}
                                        × ${item.quantity}
                                    </span>

                                    <strong>
                                        ${formatPrice(
                                            item.subtotal
                                        )} с.
                                    </strong>

                                </div>

                            `).join("")
                            : ""
                        }

                    </div>

                    <div class="order-total">

                        <span>
                            Итого
                        </span>

                        <strong>
                            ${formatPrice(
                                order.total
                            )} с.
                        </strong>

                    </div>

                    ${
                        order.status !== "completed" &&
                        order.status !== "cancelled"
                        ? `
                            <div class="order-actions">

                                <button
                                    type="button"
                                    onclick="SHOHIN.confirmOrderReceived('${escapeHTML(order.id)}')"
                                >
                                    Получен
                                </button>

                                <button
                                    type="button"
                                    onclick="SHOHIN.cancelOrder('${escapeHTML(order.id)}')"
                                >
                                    Отменить
                                </button>

                            </div>
                        `
                        : ""
                    }

                </article>

            `)
            .join("");
}


// ========================================
// ORDER STATUS
// ========================================

function confirmOrderReceivedUI(orderId) {

    const success =
        confirmOrderReceived(orderId);

    if (!success) {

        showToast(
            "Заказ не найден"
        );

        return;
    }

    renderOrders();

    showToast(
        "Заказ отмечен как полученный"
    );
}


function cancelOrderUI(orderId) {

    const success =
        cancelOrder(orderId);

    if (!success) {

        showToast(
            "Заказ не найден"
        );

        return;
    }

    renderOrders();

    showToast(
        "Заказ отменён"
    );
}


// ========================================
// REPEAT LAST ORDER
// ========================================

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
// MAP / DELIVERY ADDRESS
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

    const input =
        document.getElementById(
            "mapAddress"
        );

    const address =
        input?.value.trim();

    if (!address) {

        showToast(
            "Введите адрес"
        );

        return;
    }

    setDeliveryAddress(
        address
    );

    const deliveryInput =
        document.getElementById(
            "deliveryAddress"
        );

    if (deliveryInput) {
        deliveryInput.value =
            address;
    }

    closeDeliveryMap();

    showToast(
        "Адрес выбран"
    );
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
        "WhatsApp будет подключён позже"
    );
}


// ========================================
// REFRESH EVERYTHING
// ========================================

function refreshShopUI() {

    renderProducts();
    renderFavorites();
    renderCart();
    renderOrders();
    updateCartUI();
    updateCheckoutTotal();
}


// ========================================
// GLOBAL SHOHIN API
// ========================================

window.SHOHIN = {

    // Products
    products: getProducts,
    getProductById,

    // Search
    search,
    category: showCategory,
    showCategory,
    showAll: showAllProducts,
    showAllProducts,

    // Cart
    addToCart,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeProductFromCart,
    clearCart: clearShopCart,
    getCartItems,
    getCartTotal,
    getCartCount,

    // Favorites
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isProductFavorite,
    getFavoriteProducts,
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

    // Delivery / Map
    setDeliveryLocation,
    getDeliveryLocation,
    setDeliveryAddress,
    getDeliveryAddress,
    hasDeliveryLocation,
    clearDeliveryLocation,

    // Pages
    openPage,
    openCheckout,

    // UI
    refreshShopUI,
    updateCartUI,
    showToast,

    // Checkout
    submitOrder,
    updateCheckoutTotal,

    // Map
    openDeliveryMap,
    closeDeliveryMap,
    confirmDeliveryLocation,

    // Menu
    toggleSHMenu,

    // Contact
    openWhatsApp
};


// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.renderProducts =
    renderProducts;

window.renderFavorites =
    renderFavorites;

window.renderCart =
    renderCart;

window.renderOrders =
    renderOrders;

window.performSearch =
    () => {

        const input =
            document.getElementById(
                "searchInput"
            );

        search(
            input?.value || ""
        );
    };

window.showCategory =
    showCategory;

window.showAllProducts =
    showAllProducts;

window.openCheckout =
    openCheckout;

window.submitOrder =
    submitOrder;

window.openDeliveryMap =
    openDeliveryMap;

window.closeDeliveryMap =
    closeDeliveryMap;

window.confirmDeliveryLocation =
    confirmDeliveryLocation;

window.toggleSHMenu =
    toggleSHMenu;

window.openWhatsApp =
    openWhatsApp;