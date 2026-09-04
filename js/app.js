// SHOHIN MARKET
// Main Application Controller

import {
    loadProducts,
    getProducts,
    getProductsByCategory,
    searchProductsData,
    getProductById
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
    toggleProductFavorite,
    isProductFavorite,
    getFavoriteProducts
} from "./favorites.js";

import {
    getCurrentOrders,
    createOrder,
    confirmOrderReceived,
    repeatLastOrder as repeatLastOrderModule
} from "./orders.js";

import {
    setDeliveryLocation,
    getDeliveryLocation,
    setDeliveryAddress
} from "./map.js";


/* =========================================================
   STATE
========================================================= */

let currentPage = "home";
let currentCategory = null;
let currentSearch = "";


/* =========================================================
   DOM
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("SHOHIN MARKET: запуск приложения");

    await loadProducts();

    renderProducts();
    renderFavorites();
    renderCart();
    renderOrders();

    updateCartUI();

    setupSearch();

    console.log(
        "SHOHIN MARKET: приложение готово"
    );

});


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(page) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(section => {
        section.classList.remove("active");
    });

    const target =
        $(page);

    if (target) {
        target.classList.add("active");
        currentPage = page;
    }

    updateBottomNavigation();

    closeSHMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (page === "favorites") {
        renderFavorites();
    }

    if (page === "cart") {
        renderCart();
    }

    if (page === "orders") {
        renderOrders();
    }

    if (page === "checkout") {
        updateCheckoutTotal();
    }


    try {

        window.dispatchEvent(
            new CustomEvent(
                "shohin-page-change",
                {
                    detail: {
                        page
                    }
                }
            )
        );

    } catch (error) {}

}


/* =========================================================
   BOTTOM NAV
========================================================= */

function updateBottomNavigation() {

    const buttons =
        document.querySelectorAll(
            ".bottom .nav-btn"
        );

    buttons.forEach(button => {

        button.classList.remove("active");

    });


    const mapping = {

        home: 0,
        favorites: 1,
        cart: 2,
        orders: 3

    };


    if (
        Object.prototype.hasOwnProperty.call(
            mapping,
            currentPage
        )
    ) {

        const index =
            mapping[currentPage];

        if (buttons[index]) {
            buttons[index].classList.add(
                "active"
            );
        }

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        $("toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        String(message || "");

    toast.classList.add("show");

    clearTimeout(
        window.__shohinToastTimer
    );

    window.__shohinToastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2600);

}


/* =========================================================
   PRICE
========================================================= */

function formatPrice(price) {

    const number =
        Number(price) || 0;

    return number.toLocaleString(
        "ru-RU"
    ) + " сомони";

}


/* =========================================================
   DATE
========================================================= */

function formatDate(date) {

    if (!date) {
        return "";
    }

    const d =
        new Date(date);

    if (
        Number.isNaN(
            d.getTime()
        )
    ) {
        return "";
    }

    return d.toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function renderProductImage(product) {

    const image =
        String(
            product?.image || ""
        );

    if (!image) {
        return "🛒";
    }


    /*
       Наш products.json сейчас хранит emoji.
       Поэтому emoji показываем как текст.
       Если позже image станет URL,
       автоматически используем <img>.
    */

    const isURL =
        image.startsWith("http://") ||
        image.startsWith("https://") ||
        image.startsWith("./") ||
        image.startsWith("../") ||
        image.startsWith("assets/") ||
        image.startsWith("/");


    if (isURL) {

        return `
            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name)}"
                loading="lazy"
                onerror="this.style.display='none';this.parentElement.classList.add('image-error')"
            >
        `;

    }


    return `
        <span class="product-emoji">
            ${escapeHTML(image)}
        </span>
    `;

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function productCard(product) {

    const favorite =
        isProductFavorite(
            product.id
        );

    const available =
        product.available !== false;


    return `

        <article
            class="product product-card"
            data-product-id="${product.id}"
        >

            <div class="product-image">

                ${
                    product.badge
                        ? `
                            <span class="badge">
                                ${escapeHTML(product.badge)}
                            </span>
                          `
                        : ""
                }

                <button
                    class="favorite favorite-button ${
                        favorite ? "active" : ""
                    }"
                    type="button"
                    onclick="toggleFavorite(${product.id})"
                    aria-label="Добавить в избранное"
                >
                    ${favorite ? "♥" : "♡"}
                </button>


                <div class="product-visual">

                    ${renderProductImage(product)}

                </div>

            </div>


            <div class="product-info">

                <div class="product-name">
                    ${escapeHTML(product.name)}
                </div>

                <div class="product-meta">
                    ${escapeHTML(product.unit || "")}
                </div>


                <div class="product-bottom">

                    <div class="price">

                        ${formatPrice(product.price)}

                    </div>


                    ${
                        available
                        ?
                        `
                            <button
                                class="add-btn"
                                type="button"
                                onclick="addToCart(${product.id})"
                                aria-label="Добавить в корзину"
                            >
                                +
                            </button>
                        `
                        :
                        `
                            <span
                                class="product-unavailable"
                            >
                                Нет
                            </span>
                        `
                    }

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts(
    list = null
) {

    const container =
        $("products");

    if (!container) {
        return;
    }


    let items;


    if (Array.isArray(list)) {

        items = list;

    } else if (currentSearch) {

        items =
            searchProductsData(
                currentSearch
            );

    } else if (currentCategory) {

        items =
            getProductsByCategory(
                currentCategory
            );

    } else {

        items =
            getProducts();

    }


    if (!items.length) {

        container.innerHTML = "";

        const noResults =
            $("noResults");

        if (noResults) {
            noResults.classList.add(
                "show"
            );
        }

        return;

    }


    const noResults =
        $("noResults");

    if (noResults) {
        noResults.classList.remove(
            "show"
        );
    }


    container.innerHTML =
        items
            .map(productCard)
            .join("");

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        $("searchInput") ||
        $("search");


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        event => {

            performSearch(
                event.target.value
            );

        }
    );

}


function performSearch(
    value = null
) {

    const input =
        $("searchInput") ||
        $("search");


    if (
        value === null &&
        input
    ) {

        value =
            input.value;

    }


    currentSearch =
        String(value || "")
            .trim()
            .toLowerCase();


    currentCategory =
        null;


    const clearButton =
        $("clearSearch");

    if (clearButton) {

        clearButton.style.display =
            currentSearch
                ? "block"
                : "";

    }


    renderProducts();

}


/* =========================================================
   CATEGORY
========================================================= */

function showCategory(
    category
) {

    currentCategory =
        String(category || "");

    currentSearch =
        "";


    const input =
        $("searchInput") ||
        $("search");

    if (input) {
        input.value = "";
    }


    const clearButton =
        $("clearSearch");

    if (clearButton) {
        clearButton.style.display = "";
    }


    openPage("home");

    renderProducts();

}


function showAllProducts() {

    currentCategory =
        null;

    currentSearch =
        "";


    const input =
        $("searchInput") ||
        $("search");

    if (input) {
        input.value = "";
    }


    renderProducts();

}


/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(
    productId
) {

    const result =
        toggleProductFavorite(
            productId
        );


    renderProducts();

    renderFavorites();


    showToast(
        result
            ? "Добавлено в избранное ♥"
            : "Удалено из избранного"
    );

}


function renderFavorites() {

    const container =
        $("favoritesProducts");

    const empty =
        $("emptyFavorites");


    if (!container) {
        return;
    }


    const products =
        getFavoriteProducts();


    if (!products.length) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        return;

    }


    if (empty) {
        empty.style.display =
            "none";
    }


    container.innerHTML =
        products
            .map(productCard)
            .join("");

}


/* =========================================================
   CART
========================================================= */

function addToCart(
    productId
) {

    const result =
        addProductToCart(
            productId,
            1
        );


    if (!result) {

        showToast(
            "Не удалось добавить товар"
        );

        return;

    }


    renderCart();
    updateCartUI();


    const product =
        getProductById(
            productId
        );


    showToast(
        product
            ? `${product.name} добавлен в корзину`
            : "Товар добавлен в корзину"
    );

}


function increaseCartQuantity(
    productId
) {

    cartIncrease(
        productId
    );

    renderCart();
    updateCartUI();

}


function decreaseCartQuantity(
    productId
) {

    cartDecrease(
        productId
    );

    renderCart();
    updateCartUI();

}


function removeProductFromCart(
    productId
) {

    cartRemove(
        productId
    );

    renderCart();
    updateCartUI();

    showToast(
        "Товар удалён из корзины"
    );

}


function clearShopCart() {

    cartClear();

    renderCart();
    updateCartUI();

    showToast(
        "Корзина очищена"
    );

}


/* =========================================================
   RENDER CART
========================================================= */

function renderCart() {

    const container =
        $("cartItems");

    const empty =
        $("emptyCart");

    const summary =
        $("cartSummary");


    if (!container) {
        return;
    }


    const items =
        getCartItems();


    if (!items.length) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        if (summary) {
            summary.style.display =
                "none";
        }

        return;

    }


    if (empty) {
        empty.style.display =
            "none";
    }

    if (summary) {
        summary.style.display =
            "block";
    }


    container.innerHTML =
        items
            .map(item => `

                <div
                    class="cart-item"
                    data-product-id="${item.id}"
                >

                    <div class="cart-img">

                        ${renderProductImage(item)}

                    </div>


                    <div class="cart-content">

                        <div class="cart-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="cart-price">
                            ${formatPrice(item.price)}
                        </div>


                        <div class="qty">

                            <button
                                type="button"
                                onclick="decreaseCartQuantity(${item.id})"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                type="button"
                                onclick="increaseCartQuantity(${item.id})"
                            >
                                +
                            </button>

                        </div>

                    </div>


                    <button
                        class="delete"
                        type="button"
                        onclick="removeProductFromCart(${item.id})"
                        aria-label="Удалить"
                    >
                        ×
                    </button>

                </div>

            `)
            .join("");


    const subtotal =
        getCartTotal();


    const subtotalElement =
        $("subtotal");

    if (subtotalElement) {

        subtotalElement.textContent =
            formatPrice(subtotal);

    }


    const delivery =
        $("delivery");

    if (delivery) {

        delivery.textContent =
            "Бесплатно";

    }


    const total =
        $("total");

    if (total) {

        total.textContent =
            formatPrice(subtotal);

    }

}


/* =========================================================
   CART UI
========================================================= */

function updateCartUI() {

    const count =
        getCartCount();


    const elements = [

        $("cartCount"),
        $("headerCartCount")

    ];


    elements.forEach(element => {

        if (!element) {
            return;
        }


        element.textContent =
            count;


        element.style.display =
            count > 0
                ? "flex"
                : "none";

    });

}


/* =========================================================
   CHECKOUT
========================================================= */

function openCheckout() {

    if (getCartCount() <= 0) {

        showToast(
            "Сначала добавьте товары в корзину"
        );

        return;

    }


    openPage(
        "checkout"
    );


    updateCheckoutTotal();

}


function updateCheckoutTotal() {

    const total =
        getCartTotal();


    const subtotal =
        $("checkoutSubtotal");

    if (subtotal) {

        subtotal.textContent =
            formatPrice(total);

    }


    const checkoutTotal =
        $("checkoutTotal");

    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatPrice(total);

    }

}


/* =========================================================
   SUBMIT ORDER
========================================================= */

function submitOrder(
    event
) {

    if (event) {

        event.preventDefault();

    }


    const name =
        $("customerName")
            ?.value
            .trim() || "";


    const phone =
        $("customerPhone")
            ?.value
            .trim() || "";


    const address =
        (
            $("address") ||
            $("deliveryAddress")
        )
            ?.value
            .trim() || "";


    const comment =
        (
            $("comment") ||
            $("orderComment")
        )
            ?.value
            .trim() || "";


    const payment =
        $("payment")
            ?.value || "cash";


    if (!name) {

        showToast(
            "Введите имя"
        );

        $("customerName")?.focus();

        return false;

    }


    if (!phone) {

        showToast(
            "Введите номер телефона"
        );

        $("customerPhone")?.focus();

        return false;

    }


    if (!address) {

        showToast(
            "Укажите адрес доставки"
        );

        (
            $("address") ||
            $("deliveryAddress")
        )?.focus();

        return false;

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

            lat:
                location.lat,

            lng:
                location.lng

        });


    if (!order) {

        showToast(
            "Корзина пуста"
        );

        return false;

    }


    renderCart();
    updateCartUI();
    renderOrders();


    showToast(
        "Заказ успешно оформлен ✓"
    );


    setTimeout(
        () => {

            openPage(
                "orders"
            );

        },
        500
    );


    return true;

}


/* =========================================================
   ORDERS
========================================================= */

function renderOrders() {

    const container =
        $("ordersList");

    const empty =
        $("emptyOrders");


    if (!container) {
        return;
    }


    const orders =
        getCurrentOrders();


    if (!orders.length) {

        container.innerHTML = "";

        if (empty) {
            empty.style.display =
                "block";
        }

        return;

    }


    if (empty) {
        empty.style.display =
            "none";
    }


    container.innerHTML =
        orders
            .map(orderCard)
            .join("");

}


function getOrderStatusData(
    order
) {

    const status =
        String(
            order.status || "new"
        );


    if (
        status === "completed"
    ) {

        return {
            text: "Доставлен",
            step: 4
        };

    }


    if (
        status === "delivering"
    ) {

        return {
            text: "Доставляется",
            step: 3
        };

    }


    if (
        status === "courier"
    ) {

        return {
            text: "Курьер получил",
            step: 2
        };

    }


    if (
        status === "cancelled"
    ) {

        return {
            text: "Отменён",
            step: 0
        };

    }


    return {
        text:
            order.statusText ||
            "Собирается",
        step: 1
    };

}


function orderCard(
    order
) {

    const status =
        getOrderStatusData(
            order
        );


    const steps = [

        "Заказ принят",
        "Собирается",
        "Курьер",
        "Доставка",
        "Получен"

    ];


    return `

        <article class="order-card">

            <div class="order-head">

                <div>

                    <div class="order-number">
                        ${escapeHTML(order.id)}
                    </div>

                    <div
                        style="
                            font-size:11px;
                            color:var(--muted);
                            margin-top:4px;
                        "
                    >
                        ${formatDate(order.date)}
                    </div>

                </div>


                <div class="status">
                    ${escapeHTML(status.text)}
                </div>

            </div>


            <div class="progress">

                ${steps
                    .map(
                        (step, index) => `
                            <div
                                class="step ${
                                    index <
                                    status.step
                                        ? "done"
                                        : ""
                                }"
                            >

                                <div class="step-dot">
                                    ${
                                        index <
                                        status.step
                                            ? "✓"
                                            : ""
                                    }
                                </div>

                                <span>
                                    ${escapeHTML(step)}
                                </span>

                            </div>
                        `
                    )
                    .join("")
                }

            </div>


            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-top:16px;
                "
            >

                <strong>
                    ${formatPrice(order.total)}
                </strong>


                ${
                    order.status !== "completed" &&
                    order.status !== "cancelled"
                    ?
                    `
                        <button
                            class="confirm-btn"
                            type="button"
                            onclick="confirmReceived('${escapeHTML(order.id)}')"
                        >
                            Получил ✓
                        </button>
                    `
                    :
                    ""
                }

            </div>

        </article>

    `;

}


function confirmReceived(
    orderId
) {

    const result =
        confirmOrderReceived(
            orderId
        );


    if (result) {

        renderOrders();

        showToast(
            "Заказ отмечен как полученный ✓"
        );

    }

}


/* =========================================================
   REPEAT ORDER
========================================================= */

function repeatLastOrder() {

    const result =
        repeatLastOrderModule();


    if (!result) {

        showToast(
            "У вас ещё нет заказов"
        );

        return;

    }


    renderCart();
    updateCartUI();

    closeSHMenu();

    showToast(
        "Товары прошлого заказа добавлены"
    );


    setTimeout(
        () => {

            openPage(
                "cart"
            );

        },
        400
    );

}


/* =========================================================
   MAP
   ВАЖНО:
   Здесь НЕТ автоматического navigator.geolocation
   при запуске приложения.
========================================================= */

function openDeliveryMap() {

    const modal =
        $("mapModal");

    if (!modal) {
        return;
    }

    modal.classList.add(
        "show"
    );

}


function closeDeliveryMap() {

    const modal =
        $("mapModal");

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "show"
    );

}


function confirmDeliveryLocation() {

    const addressInput =
        $("address") ||
        $("deliveryAddress");


    const mapAddress =
        $("mapAddress");


    const address =
        mapAddress?.value.trim() ||
        "Точка доставки выбрана на карте";


    setDeliveryAddress(
        address
    );


    if (addressInput) {

        addressInput.value =
            address;

    }


    closeDeliveryMap();


    showToast(
        "Точка доставки сохранена 📍"
    );

}


/* =========================================================
   SH MENU
========================================================= */

function toggleSHMenu() {

    const menu =
        $("shMenu");

    const button =
        $("shButton");


    if (!menu) {
        return;
    }


    const opened =
        menu.classList.toggle(
            "open"
        );


    if (button) {

        button.classList.toggle(
            "open",
            opened
        );

    }

}


function closeSHMenu() {

    const menu =
        $("shMenu");

    const button =
        $("shButton");


    if (menu) {

        menu.classList.remove(
            "open"
        );

    }


    if (button) {

        button.classList.remove(
            "open"
        );

    }

}


/* =========================================================
   WHATSAPP
   Номер специально НЕ указан.
========================================================= */

function openWhatsApp() {

    showToast(
        "WhatsApp будет подключён после добавления официального номера магазина"
    );

}


/* =========================================================
   REFRESH
========================================================= */

function refreshApp() {

    renderProducts();
    renderFavorites();
    renderCart();
    renderOrders();
    updateCartUI();

}


/* =========================================================
   GLOBAL API
========================================================= */

window.SHOHIN = {

    openPage,

    showToast,

    formatPrice,

    search:
        performSearch,

    category:
        showCategory,

    showCategory,

    showAll:
        showAllProducts,

    showAllProducts,

    addToCart,

    increaseCartQuantity,

    decreaseCartQuantity,

    removeProductFromCart,

    clearCart:
        clearShopCart,

    toggleFavorite,

    renderProducts,

    renderFavorites,

    renderCart,

    renderOrders,

    updateCartUI,

    openCheckout,

    submitOrder,

    confirmReceived,

    repeatLastOrder,

    openDeliveryMap,

    closeDeliveryMap,

    confirmDeliveryLocation,

    toggleSHMenu,

    openWhatsApp,

    refresh:

        refreshApp,

    getDeliveryLocation

};


/* =========================================================
   GLOBAL COMPATIBILITY FUNCTIONS
========================================================= */

window.renderProducts =
    renderProducts;

window.renderFavorites =
    renderFavorites;

window.renderCart =
    renderCart;

window.renderOrders =
    renderOrders;

window.updateCartUI =
    updateCartUI;

window.performSearch =
    performSearch;

window.searchProducts =
    performSearch;

window.showCategory =
    showCategory;

window.filterCategory =
    showCategory;

window.showAllProducts =
    showAllProducts;

window.addToCart =
    addToCart;

window.toggleFavorite =
    toggleFavorite;

window.increaseCartQuantity =
    increaseCartQuantity;

window.decreaseCartQuantity =
    decreaseCartQuantity;

window.removeProductFromCart =
    removeProductFromCart;

window.clearShopCart =
    clearShopCart;

window.openCheckout =
    openCheckout;

window.submitOrder =
    submitOrder;

window.confirmReceived =
    confirmReceived;

window.repeatLastOrder =
    repeatLastOrder;

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

window.refreshApp =
    refreshApp;


/* =========================================================
   CLOSE MODAL WHEN CLICKING BACKDROP
========================================================= */

document.addEventListener(
    "click",
    event => {

        const modal =
            $("mapModal");

        if (
            modal &&
            event.target === modal
        ) {

            closeDeliveryMap();

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeDeliveryMap();
            closeSHMenu();

        }

    }
);