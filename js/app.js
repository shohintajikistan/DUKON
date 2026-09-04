// ============================================================
// SHOHIN MARKET
// js/app.js
// Главный контроллер приложения
// ============================================================

import {
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    formatPrice,
    isProductAvailable
} from "./products.js";

import {
    getCartItems,
    addToCart,
    increaseCartItem,
    decreaseCartItem,
    removeFromCart,
    getCartCount,
    getDetailedCart,
    getCartSubtotal,
    isCartEmpty,
    emptyCart
} from "./cart.js";

import {
    isFavorite,
    toggleFavorite,
    getFavoritesCount,
    getFavoriteProducts,
    syncFavorites
} from "./favorites.js";

import {
    createOrder,
    getAllOrders,
    getOrderById,
    getOrderStatusLabel,
    getPaymentMethodLabel,
    formatOrderDate
} from "./orders.js";

import {
    getSelectedLocation,
    setLocationAddress,
    clearSelectedLocation,
    getLocationDisplayText,
    initDeliveryMap,
    coordinatesToMapPosition
} from "./map.js";


// ============================================================
// СОСТОЯНИЕ ПРИЛОЖЕНИЯ
// ============================================================

const state = {
    currentPage: "home",
    currentCategory: "all",
    currentSearch: "",
    currentProduct: null,
    deliveryPrice: 0,
    products: [],
    mapInitialized: false
};


// ============================================================
// DOM
// ============================================================

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

document.addEventListener("DOMContentLoaded", initApp);


async function initApp() {

    try {

        showLoader();

        bindEvents();

        await loadCatalog();

        await syncFavorites();

        updateBadges();

        renderCategories();

        renderProducts();

        renderFavorites();

        renderCart();

        renderOrders();

        restoreCheckoutData();

        hideLoader();

        showPage("home");

    } catch (error) {

        console.error(
            "SHOHIN MARKET INIT ERROR:",
            error
        );

        hideLoader();

        showToast(
            "Не удалось загрузить магазин",
            "error"
        );
    }
}


// ============================================================
// ЗАГРУЗКА КАТАЛОГА
// ============================================================

async function loadCatalog() {

    state.products =
        await getProducts();

    return state.products;
}


// ============================================================
// СОБЫТИЯ
// ============================================================

function bindEvents() {

    // --------------------------------------------------------
    // Header
    // --------------------------------------------------------

    $("#menuButton")?.addEventListener(
        "click",
        openMenu
    );

    $("#favoritesButton")?.addEventListener(
        "click",
        () => showPage("favorites")
    );

    $("#cartButton")?.addEventListener(
        "click",
        () => showPage("cart")
    );


    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    $("#search")?.addEventListener(
        "input",
        handleSearch
    );

    $("#clearSearch")?.addEventListener(
        "click",
        clearSearch
    );


    // --------------------------------------------------------
    // Bottom navigation
    // --------------------------------------------------------

    $$("[data-nav]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.nav;

                if (page === "menu") {
                    openMenu();
                    return;
                }

                showPage(page);
            }
        );
    });


    $("#bottomCartButton")?.addEventListener(
        "click",
        () => showPage("cart")
    );


    // --------------------------------------------------------
    // Menu
    // --------------------------------------------------------

    $$(".menu-card").forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const page =
                    card.dataset.menuPage;

                closeMenu();

                if (page) {
                    showPage(page);
                }
            }
        );
    });


    $("#closeMenuButton")?.addEventListener(
        "click",
        closeMenu
    );


    $("#menuModal")?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("#menuModal")
            ) {
                closeMenu();
            }
        }
    );


    // --------------------------------------------------------
    // Cart
    // --------------------------------------------------------

    $("#checkoutButton")?.addEventListener(
        "click",
        openCheckout
    );


    // --------------------------------------------------------
    // Checkout
    // --------------------------------------------------------

    $("#openMapButton")?.addEventListener(
        "click",
        openMap
    );

    $("#placeOrderButton")?.addEventListener(
        "click",
        placeOrder
    );


    // --------------------------------------------------------
    // Map
    // --------------------------------------------------------

    $("#confirmMapButton")?.addEventListener(
        "click",
        confirmMap
    );

    $("#closeMapButton")?.addEventListener(
        "click",
        closeMap
    );


    $("#mapModal")?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("#mapModal")
            ) {
                closeMap();
            }
        }
    );


    // --------------------------------------------------------
    // Product modal
    // --------------------------------------------------------

    $("#closeProductModal")?.addEventListener(
        "click",
        closeProductModal
    );

    $("#productModal")?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("#productModal")
            ) {
                closeProductModal();
            }
        }
    );


    // --------------------------------------------------------
    // Success modal
    // --------------------------------------------------------

    $("#successHomeButton")?.addEventListener(
        "click",
        () => {

            closeSuccessModal();

            showPage("home");
        }
    );


    $("#successOrdersButton")?.addEventListener(
        "click",
        () => {

            closeSuccessModal();

            showPage("orders");
        }
    );


    $("#closeSuccessModal")?.addEventListener(
        "click",
        closeSuccessModal
    );


    // --------------------------------------------------------
    // Contact actions
    // --------------------------------------------------------

    $("#contactShare")?.addEventListener(
        "click",
        shareShop
    );


    // --------------------------------------------------------
    // Checkout fields
    // --------------------------------------------------------

    $("#customerName")?.addEventListener(
        "input",
        saveCheckoutDraft
    );

    $("#customerPhone")?.addEventListener(
        "input",
        saveCheckoutDraft
    );

    $("#address")?.addEventListener(
        "input",
        saveCheckoutDraft
    );

    $("#comment")?.addEventListener(
        "input",
        saveCheckoutDraft
    );
}


// ============================================================
// СТРАНИЦЫ
// ============================================================

function showPage(page) {

    const pages = {
        home: $("#homePage"),
        favorites: $("#favoritesPage"),
        cart: $("#cartPage"),
        checkout: $("#checkoutPage"),
        orders: $("#ordersPage"),
        contacts: $("#contactsPage"),
        about: $("#aboutPage"),
        policy: $("#policyPage")
    };


    Object.values(pages).forEach(
        pageElement => {

            if (pageElement) {
                pageElement.classList.remove(
                    "active"
                );
            }
        }
    );


    const target =
        pages[page] || pages.home;


    target?.classList.add("active");


    state.currentPage =
        page in pages
            ? page
            : "home";


    updateNavigation();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (state.currentPage === "favorites") {
        renderFavorites();
    }

    if (state.currentPage === "cart") {
        renderCart();
    }

    if (state.currentPage === "orders") {
        renderOrders();
    }

    if (state.currentPage === "checkout") {
        renderCheckoutTotal();
    }
}


// ============================================================
// НИЖНЯЯ НАВИГАЦИЯ
// ============================================================

function updateNavigation() {

    $$("[data-nav]").forEach(button => {

        const page =
            button.dataset.nav;

        button.classList.toggle(
            "active",
            page === state.currentPage
        );
    });
}


// ============================================================
// КАТЕГОРИИ
// ============================================================

function renderCategories() {

    const container =
        $("#categoriesContainer");

    if (!container) {
        return;
    }


    const categories = [];

    state.products.forEach(product => {

        if (
            product.category &&
            !categories.includes(
                product.category
            )
        ) {
            categories.push(
                product.category
            );
        }
    });


    let html = `
        <button
            class="category-chip active"
            data-category="all"
        >
            Все
        </button>
    `;


    categories.forEach(category => {

        html += `
            <button
                class="category-chip"
                data-category="${escapeHTML(category)}"
            >
                ${escapeHTML(category)}
            </button>
        `;
    });


    container.innerHTML = html;


    container
        .querySelectorAll(
            "[data-category]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.currentCategory =
                        button.dataset.category;

                    state.currentSearch = "";

                    if ($("#search")) {
                        $("#search").value = "";
                    }

                    container
                        .querySelectorAll(
                            "[data-category]"
                        )
                        .forEach(item =>
                            item.classList.remove(
                                "active"
                            )
                        );

                    button.classList.add(
                        "active"
                    );

                    renderProducts();
                }
            );
        });
}


// ============================================================
// ТОВАРЫ
// ============================================================

function renderProducts() {

    const container =
        $("#productsContainer");

    if (!container) {
        return;
    }


    let products =
        [...state.products];


    // --------------------------------------------------------
    // Категория
    // --------------------------------------------------------

    if (
        state.currentCategory !== "all"
    ) {

        products =
            products.filter(
                product =>
                    product.category ===
                    state.currentCategory
            );
    }


    // --------------------------------------------------------
    // Поиск
    // --------------------------------------------------------

    if (state.currentSearch) {

        const query =
            state.currentSearch
                .toLowerCase()
                .trim();

        products =
            products.filter(product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();

                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();

                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();

                return (
                    name.includes(query) ||
                    description.includes(query) ||
                    category.includes(query)
                );
            });
    }


    // --------------------------------------------------------
    // Пустой результат
    // --------------------------------------------------------

    if (products.length === 0) {

        container.innerHTML = "";

        $("#searchEmpty")
            ?.classList.add("active");

        return;
    }


    $("#searchEmpty")
        ?.classList.remove("active");


    container.innerHTML =
        products
            .map(renderProductCard)
            .join("");


    bindProductEvents();
}


// ============================================================
// КАРТОЧКА ТОВАРА
// ============================================================

function renderProductCard(product) {

    const favorite =
        isFavorite(product.id);

    const available =
        isProductAvailable(product);


    const image =
        product.image ||
        "./assets/products/placeholder.svg";


    return `
        <article
            class="product-card ${
                available
                    ? ""
                    : "is-unavailable"
            }"
            data-product-id="${escapeHTML(
                String(product.id)
            )}"
        >

            <button
                class="product-favorite ${
                    favorite
                        ? "active"
                        : ""
                }"
                data-action="favorite"
                aria-label="Избранное"
            >
                ${favorite ? "♥" : "♡"}
            </button>


            <button
                class="product-image-button"
                data-action="details"
                aria-label="Подробнее"
            >
                <img
                    class="product-image"
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(
                        product.name || "Товар"
                    )}"
                    loading="lazy"
                    onerror="this.src='./assets/products/placeholder.svg'"
                >
            </button>


            <div class="product-info">

                <div class="product-category">
                    ${escapeHTML(
                        product.category || ""
                    )}
                </div>

                <h3 class="product-name">
                    ${escapeHTML(
                        product.name || "Товар"
                    )}
                </h3>

                <div class="product-bottom">

                    <strong class="product-price">
                        ${formatPrice(
                            product.price
                        )}
                    </strong>

                    <span class="product-unit">
                        ${escapeHTML(
                            product.unit || "шт."
                        )}
                    </span>

                </div>


                ${
                    available
                        ? `
                            <button
                                class="add-cart-button"
                                data-action="add"
                            >
                                В корзину
                            </button>
                        `
                        : `
                            <button
                                class="add-cart-button disabled"
                                disabled
                            >
                                Нет в наличии
                            </button>
                        `
                }

            </div>

        </article>
    `;
}


// ============================================================
// СОБЫТИЯ ТОВАРОВ
// ============================================================

function bindProductEvents() {

    $$(".product-card").forEach(card => {

        const productId =
            card.dataset.productId;


        card.addEventListener(
            "click",
            event => {

                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );

                if (!actionButton) {
                    return;
                }


                const action =
                    actionButton.dataset.action;


                if (action === "favorite") {

                    event.preventDefault();
                    event.stopPropagation();

                    handleFavorite(
                        productId
                    );

                    return;
                }


                if (action === "add") {

                    event.preventDefault();
                    event.stopPropagation();

                    handleAddToCart(
                        productId
                    );

                    return;
                }


                if (action === "details") {

                    event.preventDefault();

                    openProductModal(
                        productId
                    );
                }
            }
        );


        card.addEventListener(
            "click",
            event => {

                if (
                    event.target.closest(
                        "[data-action]"
                    )
                ) {
                    return;
                }

                openProductModal(
                    productId
                );
            }
        );
    });
}


// ============================================================
// ДОБАВИТЬ В КОРЗИНУ
// ============================================================

async function handleAddToCart(
    productId
) {

    try {

        await addToCart(
            productId,
            1
        );

        updateBadges();

        showToast(
            "Товар добавлен в корзину",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Не удалось добавить товар",
            "error"
        );
    }
}


// ============================================================
// ИЗБРАННОЕ
// ============================================================

function handleFavorite(productId) {

    try {

        const result =
            toggleFavorite(productId);

        updateBadges();

        renderProducts();

        renderFavorites();


        showToast(
            result.favorite
                ? "Добавлено в избранное"
                : "Удалено из избранного",
            result.favorite
                ? "success"
                : "info"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Не удалось изменить избранное",
            "error"
        );
    }
}


// ============================================================
// ИЗБРАННЫЕ ТОВАРЫ
// ============================================================

async function renderFavorites() {

    const container =
        $("#favoritesContainer");

    const empty =
        $("#favoritesEmpty");

    if (!container) {
        return;
    }


    const products =
        await getFavoriteProducts();


    if (products.length === 0) {

        container.innerHTML = "";

        empty?.classList.add(
            "active"
        );

        return;
    }


    empty?.classList.remove(
        "active"
    );


    container.innerHTML =
        products
            .map(renderProductCard)
            .join("");


    bindProductEvents();
}


// ============================================================
// КОРЗИНА
// ============================================================

async function renderCart() {

    const container =
        $("#cartContainer");

    const empty =
        $("#cartEmpty");

    const summary =
        $("#cartSummary");


    if (!container) {
        return;
    }


    const items =
        await getDetailedCart();


    if (items.length === 0) {

        container.innerHTML = "";

        empty?.classList.add(
            "active"
        );

        summary?.classList.remove(
            "active"
        );

        updateBadges();

        return;
    }


    empty?.classList.remove(
        "active"
    );

    summary?.classList.add(
        "active"
    );


    container.innerHTML =
        items
            .map(renderCartItem)
            .join("");


    bindCartEvents();

    await updateCartSummary();

    updateBadges();
}


// ============================================================
// ЭЛЕМЕНТ КОРЗИНЫ
// ============================================================

function renderCartItem(item) {

    const image =
        item.image ||
        "./assets/products/placeholder.svg";


    return `
        <article
            class="cart-item"
            data-cart-id="${escapeHTML(
                String(item.id)
            )}"
        >

            <img
                class="cart-item-image"
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    item.name
                )}"
                onerror="this.src='./assets/products/placeholder.svg'"
            >


            <div class="cart-item-info">

                <h3>
                    ${escapeHTML(
                        item.name
                    )}
                </h3>

                <div class="cart-item-price">
                    ${formatPrice(
                        item.price
                    )}
                </div>


                <div class="cart-item-controls">

                    <button
                        class="quantity-button"
                        data-cart-action="decrease"
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        class="quantity-button"
                        data-cart-action="increase"
                    >
                        +
                    </button>

                </div>

            </div>


            <div class="cart-item-right">

                <strong class="cart-item-total">
                    ${formatPrice(
                        item.subtotal
                    )}
                </strong>

                <button
                    class="cart-remove"
                    data-cart-action="remove"
                    aria-label="Удалить"
                >
                    ×
                </button>

            </div>

        </article>
    `;
}


// ============================================================
// СОБЫТИЯ КОРЗИНЫ
// ============================================================

function bindCartEvents() {

    $$(".cart-item").forEach(item => {

        const productId =
            item.dataset.cartId;


        item
            .querySelectorAll(
                "[data-cart-action]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.cartAction;


                        try {

                            if (
                                action ===
                                "increase"
                            ) {

                                await increaseCartItem(
                                    productId
                                );
                            }


                            if (
                                action ===
                                "decrease"
                            ) {

                                await decreaseCartItem(
                                    productId
                                );
                            }


                            if (
                                action ===
                                "remove"
                            ) {

                                removeFromCart(
                                    productId
                                );

                                showToast(
                                    "Товар удалён",
                                    "info"
                                );
                            }


                            await renderCart();

                        } catch (error) {

                            console.error(error);

                            showToast(
                                error.message ||
                                "Ошибка корзины",
                                "error"
                            );
                        }
                    }
                );
            }
        );
    });
}


// ============================================================
// ИТОГ КОРЗИНЫ
// ============================================================

async function updateCartSummary() {

    const subtotal =
        await getCartSubtotal();


    const delivery =
        calculateDeliveryPrice(
            subtotal
        );


    const total =
        subtotal + delivery;


    if ($("#cartSubtotal")) {

        $("#cartSubtotal").textContent =
            formatPrice(subtotal);
    }


    if ($("#deliveryPrice")) {

        $("#deliveryPrice").textContent =
            delivery > 0
                ? formatPrice(delivery)
                : "Бесплатно";
    }


    if ($("#cartTotal")) {

        $("#cartTotal").textContent =
            formatPrice(total);
    }


    state.deliveryPrice =
        delivery;
}


// ============================================================
// ДОСТАВКА
// ============================================================

function calculateDeliveryPrice(
    subtotal
) {

    const freeDeliveryFrom = 200;

    const standardDelivery = 15;


    if (subtotal <= 0) {
        return 0;
    }


    if (
        subtotal >=
        freeDeliveryFrom
    ) {
        return 0;
    }


    return standardDelivery;
}


// ============================================================
// CHECKOUT
// ============================================================

async function openCheckout() {

    if (isCartEmpty()) {

        showToast(
            "Корзина пуста",
            "warning"
        );

        return;
    }


    showPage("checkout");

    renderCheckoutTotal();

    updateCheckoutLocation();
}


// ============================================================
// ИТОГ CHECKOUT
// ============================================================

async function renderCheckoutTotal() {

    const subtotal =
        await getCartSubtotal();


    const delivery =
        calculateDeliveryPrice(
            subtotal
        );


    const total =
        subtotal + delivery;


    if ($("#checkoutTotal")) {

        $("#checkoutTotal").textContent =
            formatPrice(total);
    }


    state.deliveryPrice =
        delivery;
}


// ============================================================
// ВОССТАНОВИТЬ CHECKOUT
// ============================================================

function restoreCheckoutData() {

    const savedName =
        localStorage.getItem(
            "shohin_checkout_name"
        );

    const savedPhone =
        localStorage.getItem(
            "shohin_checkout_phone"
        );

    const savedAddress =
        localStorage.getItem(
            "shohin_checkout_address"
        );

    const savedComment =
        localStorage.getItem(
            "shohin_checkout_comment"
        );


    if ($("#customerName")) {
        $("#customerName").value =
            savedName || "";
    }

    if ($("#customerPhone")) {
        $("#customerPhone").value =
            savedPhone || "";
    }

    if ($("#address")) {
        $("#address").value =
            savedAddress || "";
    }

    if ($("#comment")) {
        $("#comment").value =
            savedComment || "";
    }


    updateCheckoutLocation();
}


// ============================================================
// СОХРАНЕНИЕ CHECKOUT
// ============================================================

function saveCheckoutDraft() {

    if ($("#customerName")) {

        localStorage.setItem(
            "shohin_checkout_name",
            $("#customerName").value
        );
    }


    if ($("#customerPhone")) {

        localStorage.setItem(
            "shohin_checkout_phone",
            $("#customerPhone").value
        );
    }


    if ($("#address")) {

        localStorage.setItem(
            "shohin_checkout_address",
            $("#address").value
        );
    }


    if ($("#comment")) {

        localStorage.setItem(
            "shohin_checkout_comment",
            $("#comment").value
        );
    }
}


// ============================================================
// МЕСТО ДОСТАВКИ
// ============================================================

function updateCheckoutLocation() {

    const location =
        getSelectedLocation();


    if (!location) {

        if ($("#selectedLocationText")) {

            $("#selectedLocationText").textContent =
                "Место доставки не выбрано";
        }

        return;
    }


    if ($("#selectedLocationText")) {

        $("#selectedLocationText").textContent =
            getLocationDisplayText(
                location
            );
    }


    if ($("#address") &&
        location.address) {

        $("#address").value =
            location.address;
    }
}


// ============================================================
// КАРТА
// ============================================================

function openMap() {

    const modal =
        $("#mapModal");

    if (!modal) {
        return;
    }


    modal.classList.add(
        "active"
    );


    const map =
        $("#deliveryMap");

    const pin =
        $("#mapPin");


    if (!state.mapInitialized) {

        initDeliveryMap(
            map,
            pin,
            location => {

                if ($("#selectedLocationText")) {

                    $("#selectedLocationText").textContent =
                        getLocationDisplayText(
                            location
                        );
                }

            }
        );

        state.mapInitialized =
            true;
    }


    updateMapPin();

    updateMapAddress();
}


function updateMapPin() {

    const location =
        getSelectedLocation();

    const pin =
        $("#mapPin");

    const map =
        $("#deliveryMap");


    if (
        !location ||
        !pin ||
        !map
    ) {
        return;
    }


    const position =
        coordinatesToMapPosition(
            location.lat,
            location.lng
        );


    pin.style.left =
        `${position.x}%`;

    pin.style.top =
        `${position.y}%`;

    pin.classList.add(
        "map-pin-visible"
    );
}


function updateMapAddress() {

    const location =
        getSelectedLocation();


    if ($("#mapAddress")) {

        $("#mapAddress").value =
            location?.address || "";
    }
}


// ============================================================
// ПОДТВЕРДИТЬ КАРТУ
// ============================================================

function confirmMap() {

    const address =
        $("#mapAddress")
            ?.value
            .trim() || "";


    const location =
        getSelectedLocation();


    if (!location) {

        showToast(
            "Выберите место на карте",
            "warning"
        );

        return;
    }


    setLocationAddress(
        address
    );


    if ($("#address")) {

        $("#address").value =
            address;
    }


    updateCheckoutLocation();

    saveCheckoutDraft();

    closeMap();


    showToast(
        "Место доставки сохранено",
        "success"
    );
}


// ============================================================
// ЗАКРЫТЬ КАРТУ
// ============================================================

function closeMap() {

    $("#mapModal")
        ?.classList.remove(
            "active"
        );
}


// ============================================================
// РАЗМЕЩЕНИЕ ЗАКАЗА
// ============================================================

async function placeOrder() {

    const name =
        $("#customerName")
            ?.value
            .trim() || "";


    const phone =
        $("#customerPhone")
            ?.value
            .trim() || "";


    const address =
        $("#address")
            ?.value
            .trim() || "";


    const comment =
        $("#comment")
            ?.value
            .trim() || "";


    const payment =
        document.querySelector(
            'input[name="payment"]:checked'
        )?.value || "cash";


    // --------------------------------------------------------
    // Проверка имени
    // --------------------------------------------------------

    if (name.length < 2) {

        showToast(
            "Введите имя",
            "warning"
        );

        $("#customerName")
            ?.focus();

        return;
    }


    // --------------------------------------------------------
    // Проверка телефона
    // --------------------------------------------------------

    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if (
        phoneDigits.length < 9
    ) {

        showToast(
            "Введите корректный номер телефона",
            "warning"
        );

        $("#customerPhone")
            ?.focus();

        return;
    }


    // --------------------------------------------------------
    // Проверка адреса
    // --------------------------------------------------------

    if (address.length < 3) {

        showToast(
            "Укажите адрес доставки",
            "warning"
        );

        $("#address")
            ?.focus();

        return;
    }


    // --------------------------------------------------------
    // Проверка точки карты
    // --------------------------------------------------------

    const location =
        getSelectedLocation();


    if (!location) {

        showToast(
            "Выберите точку доставки на карте",
            "warning"
        );

        openMap();

        return;
    }


    try {

        const items =
            await getDetailedCart();


        if (items.length === 0) {

            showToast(
                "Корзина пуста",
                "warning"
            );

            return;
        }


        const subtotal =
            await getCartSubtotal();


        const deliveryPrice =
            calculateDeliveryPrice(
                subtotal
            );


        const total =
            subtotal +
            deliveryPrice;


        const order =
            createOrder({

                customer: {
                    name,
                    phone
                },

                items,

                subtotal,

                deliveryPrice,

                total,

                paymentMethod:
                    payment,

                location: {
                    ...location,
                    address
                },

                comment
            });


        // ----------------------------------------------------
        // Очистка корзины
        // ----------------------------------------------------

        emptyCart();


        // ----------------------------------------------------
        // Обновление интерфейса
        // ----------------------------------------------------

        updateBadges();

        renderCart();

        renderOrders();


        // ----------------------------------------------------
        // Очистка checkout
        // ----------------------------------------------------

        clearCheckoutDraft();


        // ----------------------------------------------------
        // Успешный заказ
        // ----------------------------------------------------

        showOrderSuccess(
            order.id
        );

    } catch (error) {

        console.error(
            "ORDER ERROR:",
            error
        );

        showToast(
            error.message ||
            "Не удалось оформить заказ",
            "error"
        );
    }
}


// ============================================================
// ОЧИСТИТЬ CHECKOUT DRAFT
// ============================================================

function clearCheckoutDraft() {

    localStorage.removeItem(
        "shohin_checkout_name"
    );

    localStorage.removeItem(
        "shohin_checkout_phone"
    );

    localStorage.removeItem(
        "shohin_checkout_address"
    );

    localStorage.removeItem(
        "shohin_checkout_comment"
    );
}


// ============================================================
// ЗАКАЗЫ
// ============================================================

function renderOrders() {

    const container =
        $("#ordersContainer");

    const empty =
        $("#ordersEmpty");


    if (!container) {
        return;
    }


    const orders =
        getAllOrders();


    if (orders.length === 0) {

        container.innerHTML = "";

        empty?.classList.add(
            "active"
        );

        return;
    }


    empty?.classList.remove(
        "active"
    );


    container.innerHTML =
        orders
            .map(renderOrder)
            .join("");


    bindOrderEvents();
}


// ============================================================
// КАРТОЧКА ЗАКАЗА
// ============================================================

function renderOrder(order) {

    const statusClass =
        `status-${String(
            order.status || "new"
        ).replace(
            "_",
            "-"
        )}`;


    const itemsCount =
        Array.isArray(order.items)
            ? order.items.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.quantity || 0
                    ),
                0
            )
            : 0;


    return `
        <article
            class="order-card"
            data-order-id="${escapeHTML(
                String(order.id)
            )}"
        >

            <div class="order-header">

                <div>
                    <strong>
                        Заказ ${escapeHTML(
                            String(order.id)
                        )}
                    </strong>

                    <span class="order-date">
                        ${formatOrderDate(
                            order.createdAt
                        )}
                    </span>
                </div>


                <span
                    class="order-status ${statusClass}"
                >
                    ${escapeHTML(
                        getOrderStatusLabel(
                            order.status
                        )
                    )}
                </span>

            </div>


            <div class="order-info">

                <div>
                    Товаров:
                    <strong>
                        ${itemsCount}
                    </strong>
                </div>

                <div>
                    Оплата:
                    <strong>
                        ${escapeHTML(
                            getPaymentMethodLabel(
                                order.paymentMethod
                            )
                        )}
                    </strong>
                </div>

                <div>
                    Сумма:
                    <strong>
                        ${formatPrice(
                            order.total
                        )}
                    </strong>
                </div>

            </div>


            <div class="order-actions">

                <button
                    class="secondary-button"
                    data-order-action="details"
                >
                    Подробнее
                </button>

                <button
                    class="primary-button"
                    data-order-action="repeat"
                >
                    Повторить
                </button>

            </div>

        </article>
    `;
}


// ============================================================
// СОБЫТИЯ ЗАКАЗОВ
// ============================================================

function bindOrderEvents() {

    $$(".order-card").forEach(card => {

        const orderId =
            card.dataset.orderId;


        card
            .querySelectorAll(
                "[data-order-action]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset.orderAction;


                        if (
                            action ===
                            "details"
                        ) {

                            openOrderDetails(
                                orderId
                            );
                        }


                        if (
                            action ===
                            "repeat"
                        ) {

                            repeatOrder(
                                orderId
                            );
                        }
                    }
                );
            }
        );
    });
}


// ============================================================
// ПОДРОБНОСТИ ЗАКАЗА
// ============================================================

function openOrderDetails(orderId) {

    const order =
        getOrderById(orderId);


    if (!order) {

        showToast(
            "Заказ не найден",
            "error"
        );

        return;
    }


    let itemsHTML = "";


    if (
        Array.isArray(
            order.items
        )
    ) {

        itemsHTML =
            order.items
                .map(item => `
                    <div class="order-detail-item">

                        <span>
                            ${escapeHTML(
                                item.name
                            )}
                            ×
                            ${item.quantity}
                        </span>

                        <strong>
                            ${formatPrice(
                                item.subtotal
                            )}
                        </strong>

                    </div>
                `)
                .join("");
    }


    const content = `
        <div class="order-details">

            <h3>
                Заказ ${escapeHTML(
                    String(order.id)
                )}
            </h3>

            <p>
                ${formatOrderDate(
                    order.createdAt
                )}
            </p>


            <div class="order-details-list">
                ${itemsHTML}
            </div>


            <div class="order-detail-total">
                <span>Товары</span>
                <strong>
                    ${formatPrice(
                        order.subtotal
                    )}
                </strong>
            </div>


            <div class="order-detail-total">
                <span>Доставка</span>
                <strong>
                    ${
                        order.deliveryPrice > 0
                            ? formatPrice(
                                order.deliveryPrice
                            )
                            : "Бесплатно"
                    }
                </strong>
            </div>


            <div class="order-detail-total grand">
                <span>Итого</span>
                <strong>
                    ${formatPrice(
                        order.total
                    )}
                </strong>
            </div>


            <div class="order-detail-customer">

                <strong>
                    Получатель
                </strong>

                <p>
                    ${escapeHTML(
                        order.customer?.name ||
                        ""
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        order.customer?.phone ||
                        ""
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        order.location?.address ||
                        ""
                    )}
                </p>

            </div>

        </div>
    `;


    openSimpleModal(
        "Детали заказа",
        content
    );
}


// ============================================================
// ПОВТОР ЗАКАЗА
// ============================================================

async function repeatOrder(orderId) {

    const order =
        getOrderById(orderId);


    if (!order) {

        showToast(
            "Заказ не найден",
            "error"
        );

        return;
    }


    if (
        !Array.isArray(
            order.items
        )
    ) {
        return;
    }


    let added = 0;


    for (const item of order.items) {

        try {

            await addToCart(
                item.id,
                item.quantity
            );

            added++;

        } catch (error) {

            console.warn(
                "Repeat order item error:",
                error
            );
        }
    }


    updateBadges();

    await renderCart();


    if (added > 0) {

        showToast(
            "Товары добавлены в корзину",
            "success"
        );

        showPage("cart");

    } else {

        showToast(
            "Товары из заказа недоступны",
            "warning"
        );
    }
}


// ============================================================
// PRODUCT MODAL
// ============================================================

async function openProductModal(
    productId
) {

    const product =
        await getProductById(
            productId
        );


    if (!product) {
        return;
    }


    state.currentProduct =
        product;


    const modal =
        $("#productModal");

    const content =
        $("#productModalContent");


    if (!modal || !content) {
        return;
    }


    const favorite =
        isFavorite(
            product.id
        );


    const available =
        isProductAvailable(
            product
        );


    const image =
        product.image ||
        "./assets/products/placeholder.svg";


    content.innerHTML = `

        <div class="product-modal-image-wrap">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    product.name
                )}"
                class="product-modal-image"
                onerror="this.src='./assets/products/placeholder.svg'"
            >

        </div>


        <div class="product-modal-category">
            ${escapeHTML(
                product.category || ""
            )}
        </div>


        <h2>
            ${escapeHTML(
                product.name
            )}
        </h2>


        <p class="product-modal-description">
            ${escapeHTML(
                product.description || ""
            )}
        </p>


        <div class="product-modal-price">
            ${formatPrice(
                product.price
            )}

            <span>
                / ${escapeHTML(
                    product.unit || "шт."
                )}
            </span>
        </div>


        <div class="product-modal-actions">

            <button
                class="secondary-button"
                id="modalFavoriteButton"
            >
                ${favorite
                    ? "♥ В избранном"
                    : "♡ В избранное"
                }
            </button>


            ${
                available
                    ? `
                        <button
                            class="primary-button"
                            id="modalAddCartButton"
                        >
                            Добавить в корзину
                        </button>
                    `
                    : `
                        <button
                            class="primary-button disabled"
                            disabled
                        >
                            Нет в наличии
                        </button>
                    `
            }

        </div>
    `;


    $("#modalFavoriteButton")
        ?.addEventListener(
            "click",
            () => {

                handleFavorite(
                    product.id
                );

                openProductModal(
                    product.id
                );
            }
        );


    $("#modalAddCartButton")
        ?.addEventListener(
            "click",
            async () => {

                await handleAddToCart(
                    product.id
                );

                closeProductModal();
            }
        );


    modal.classList.add(
        "active"
    );
}


// ============================================================
// ЗАКРЫТЬ PRODUCT MODAL
// ============================================================

function closeProductModal() {

    $("#productModal")
        ?.classList.remove(
            "active"
        );

    state.currentProduct =
        null;
}


// ============================================================
// MENU
// ============================================================

function openMenu() {

    $("#menuModal")
        ?.classList.add(
            "active"
        );
}


function closeMenu() {

    $("#menuModal")
        ?.classList.remove(
            "active"
        );
}


// ============================================================
// SUCCESS
// ============================================================

function showOrderSuccess(
    orderId
) {

    if ($("#successOrderId")) {

        $("#successOrderId").textContent =
            orderId;
    }


    $("#orderSuccessModal")
        ?.classList.add(
            "active"
        );
}


function closeSuccessModal() {

    $("#orderSuccessModal")
        ?.classList.remove(
            "active"
        );
}


// ============================================================
// BADGES
// ============================================================

function updateBadges() {

    const cartCount =
        getCartCount();


    const favoritesCount =
        getFavoritesCount();


    setBadge(
        "#cartBadge",
        cartCount
    );

    setBadge(
        "#bottomCartBadge",
        cartCount
    );

    setBadge(
        "#favoritesBadge",
        favoritesCount
    );
}


function setBadge(
    selector,
    count
) {

    const badge =
        $(selector);


    if (!badge) {
        return;
    }


    badge.textContent =
        String(count);


    badge.classList.toggle(
        "visible",
        count > 0
    );
}


// ============================================================
// SEARCH
// ============================================================

function handleSearch(event) {

    state.currentSearch =
        event.target.value;


    if (
        state.currentSearch.trim()
    ) {

        state.currentCategory =
            "all";


        $$(".category-chip")
            .forEach(button =>
                button.classList.toggle(
                    "active",
                    button.dataset.category ===
                    "all"
                )
            );
    }


    renderProducts();
}


function clearSearch() {

    state.currentSearch =
        "";


    if ($("#search")) {
        $("#search").value = "";
    }


    renderProducts();
}


// ============================================================
// SHARE
// ============================================================

async function shareShop() {

    const shareData = {
        title: "SHOHIN MARKET",
        text: "Онлайн-магазин SHOHIN MARKET"
    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

            return;
        }


        await navigator.clipboard.writeText(
            window.location.href
        );


        showToast(
            "Ссылка скопирована",
            "success"
        );

    } catch (error) {

        console.warn(
            "Share cancelled:",
            error
        );
    }
}


// ============================================================
// SIMPLE MODAL
// ============================================================

function openSimpleModal(
    title,
    content
) {

    const modal =
        $("#productModal");

    const container =
        $("#productModalContent");


    if (!modal || !container) {
        return;
    }


    container.innerHTML = `
        <div class="simple-modal-content">

            <h2>
                ${escapeHTML(title)}
            </h2>

            ${content}

        </div>
    `;


    modal.classList.add(
        "active"
    );
}


// ============================================================
// TOAST
// ============================================================

let toastTimer = null;


function showToast(
    message,
    type = "info"
) {

    const toast =
        $("#toast");

    const icon =
        $("#toastIcon");

    const text =
        $("#toastMessage");


    if (!toast) {
        return;
    }


    if (text) {
        text.textContent =
            message;
    }


    if (icon) {

        const icons = {
            success: "✓",
            error: "!",
            warning: "⚠",
            info: "i"
        };


        icon.textContent =
            icons[type] || "i";
    }


    toast.className =
        `toast ${type} active`;


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "active"
                );

            },
            3000
        );
}


// ============================================================
// LOADER
// ============================================================

function showLoader() {

    $("#appLoader")
        ?.classList.add(
            "active"
        );
}


function hideLoader() {

    $("#appLoader")
        ?.classList.remove(
            "active"
        );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// SERVICE WORKER
// ============================================================

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .then(
                    registration => {

                        console.log(
                            "SHOHIN MARKET SW:",
                            registration.scope
                        );
                    }
                )
                .catch(
                    error => {

                        console.warn(
                            "Service Worker error:",
                            error
                        );
                    }
                );
        }
    );
}