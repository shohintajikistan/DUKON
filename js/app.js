import { products } from "./products.js";
import {
    getCart,
    saveCart,
    getFavorites,
    saveFavorites,
    getOrders,
    saveOrders
} from "./storage.js";


/* =========================================
   SHOHIN MARKET
   MAIN APPLICATION
========================================= */

const app = document.getElementById("app");


/* =========================================
   APPLICATION STATE
========================================= */

const state = {
    page: "home",

    products: products,

    cart: getCart(),

    favorites: getFavorites(),

    orders: getOrders(),

    category: "all",

    search: ""
};


/* =========================================
   APP START
========================================= */

function init() {

    renderApp();

    registerServiceWorker();

}


/* =========================================
   MAIN APP RENDER
========================================= */

function renderApp() {

    app.innerHTML = `

        <div class="app">

            ${renderHeader()}

            <main id="pages">

                ${renderHome()}

            </main>

            ${renderBottomNavigation()}

            ${renderSHMenu()}

        </div>

    `;

    bindEvents();

}


/* =========================================
   HEADER
========================================= */

function renderHeader() {

    return `

        <header class="header">

            <div class="header-row">

                <div class="brand">

                    <div class="logo">
                        SH
                    </div>

                    <div>

                        <div class="brand-name">
                            SHOHIN MARKET
                        </div>

                        <div class="brand-sub">
                            ПРОДУКТЫ • ДОМ • ДОСТАВКА
                        </div>

                    </div>

                </div>


                <div class="header-icons">

                    <button
                        class="icon-btn"
                        data-action="favorites"
                        aria-label="Избранное"
                    >
                        ♡
                    </button>


                    <button
                        class="icon-btn"
                        data-action="cart"
                        aria-label="Корзина"
                    >
                        🛒
                    </button>

                </div>

            </div>


            <div class="search-wrap">

                <span class="search-icon">
                    ⌕
                </span>

                <input
                    id="search"
                    class="search"
                    type="search"
                    placeholder="Найти продукты..."
                    autocomplete="off"
                >

                <button
                    id="clearSearch"
                    class="clear-search"
                    type="button"
                >
                    ×
                </button>

            </div>

        </header>

    `;

}


/* =========================================
   HOME
========================================= */

function renderHome() {

    return `

        <section
            id="home"
            class="page active"
        >


            <div class="hero">

                <div class="hero-small">
                    SHOHIN MARKET
                </div>


                <h1>
                    Свежие продукты
                    <br>
                    рядом с вами.
                </h1>


                <p>
                    Выбирайте продукты, оформляйте
                    заказ и получайте доставку
                    прямо к двери.
                </p>


                <button
                    class="hero-button"
                    data-action="products"
                >
                    Смотреть товары →
                </button>

            </div>


            <div class="section-head">

                <h2>
                    Категории
                </h2>

                <button
                    class="see-all"
                    data-action="all-products"
                >
                    Все товары
                </button>

            </div>


            <div class="categories">

                ${renderCategories()}

            </div>


            <div
                class="section-head"
                id="productsTitle"
            >

                <h2>
                    Популярные товары
                </h2>

                <button
                    class="see-all"
                    data-action="all-products"
                >
                    Все
                </button>

            </div>


            <div
                id="products"
                class="products"
            >

                ${renderProducts()}

            </div>


            <div
                id="noResults"
                class="no-results"
            >

                <div style="font-size:45px">
                    🔎
                </div>

                <h3>
                    Ничего не найдено
                </h3>

                <p>
                    Попробуйте другое название товара.
                </p>

            </div>

        </section>

    `;

}


/* =========================================
   CATEGORIES
========================================= */

function renderCategories() {

    const categories = [

        ["Овощи", "🥦"],

        ["Фрукты", "🍎"],

        ["Молочное", "🥛"],

        ["Мясо", "🥩"],

        ["Напитки", "🧃"],

        ["Бакалея", "🍚"]

    ];


    return categories.map(
        ([name, icon]) => `

            <button
                class="category"
                data-category="${name}"
            >

                <div class="category-icon">
                    ${icon}
                </div>

                <div class="category-name">
                    ${name}
                </div>

            </button>

        `
    ).join("");

}


/* =========================================
   PRODUCTS
========================================= */

function getVisibleProducts() {

    let result = [...state.products];


    if (state.category !== "all") {

        result = result.filter(
            product =>
                product.category === state.category
        );

    }


    if (state.search) {

        const query =
            state.search.toLowerCase();

        result = result.filter(product =>

            product.name
                .toLowerCase()
                .includes(query)

            ||

            product.category
                .toLowerCase()
                .includes(query)

        );

    }


    return result;

}


function renderProducts() {

    const list =
        getVisibleProducts();


    if (!list.length) {

        return "";

    }


    return list.map(
        product => {

            const favorite =
                state.favorites.includes(product.id);


            return `

                <article
                    class="product"
                    data-product-id="${product.id}"
                >

                    ${
                        product.badge
                        ?
                        `
                        <div class="badge">
                            ${product.badge}
                        </div>
                        `
                        :
                        ""
                    }


                    <button
                        class="favorite ${
                            favorite ? "active" : ""
                        }"
                        data-favorite="${product.id}"
                    >
                        ${
                            favorite
                            ? "♥"
                            : "♡"
                        }
                    </button>


                    <div class="product-image">

                        ${
                            product.image
                            ?
                            `
                            <img
                                src="${product.image}"
                                alt="${product.name}"
                                loading="lazy"
                            >
                            `
                            :
                            product.emoji || "🛒"
                        }

                    </div>


                    <div class="product-info">

                        <div class="product-name">
                            ${product.name}
                        </div>


                        <div class="product-meta">
                            ${product.meta}
                        </div>


                        <div class="product-bottom">

                            <div class="price">

                                ${product.price}

                                <span class="currency">
                                    сомони
                                </span>

                            </div>


                            <button
                                class="add-btn"
                                data-add-cart="${product.id}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }
    ).join("");

}


/* =========================================
   BOTTOM NAVIGATION
========================================= */

function renderBottomNavigation() {

    return `

        <nav class="bottom">

            <button
                class="nav-btn active"
                data-page="home"
            >

                <div class="nav-icon">
                    ⌂
                </div>

                Главная

            </button>


            <button
                class="nav-btn"
                data-page="favorites"
            >

                <div class="nav-icon">
                    ♡
                </div>

                Товары

            </button>


            <button
                id="shButton"
                class="sh-btn"
                type="button"
            >
                SH
            </button>


            <button
                class="nav-btn"
                data-page="cart"
            >

                <div class="nav-icon">
                    🛒
                </div>

                Корзина

            </button>


            <button
                class="nav-btn"
                data-page="orders"
            >

                <div class="nav-icon">
                    📦
                </div>

                Заказы

            </button>

        </nav>

    `;

}


/* =========================================
   SH MENU
========================================= */

function renderSHMenu() {

    return `

        <div
            id="shMenu"
            class="sh-menu"
        >

            <div
                style="
                    color:var(--lime);
                    font-size:11px;
                    font-weight:900;
                    margin:2px 4px 12px;
                    letter-spacing:1px;
                "
            >
                SHOHIN MENU
            </div>


            <div class="menu-grid">

                <button
                    class="menu-item"
                    data-page="home"
                >
                    <div class="menu-item-icon">
                        ⌂
                    </div>
                    Главная
                </button>


                <button
                    class="menu-item"
                    data-action="all-products"
                >
                    <div class="menu-item-icon">
                        ▦
                    </div>
                    Категории
                </button>


                <button
                    class="menu-item"
                    data-page="favorites"
                >
                    <div class="menu-item-icon">
                        ♡
                    </div>
                    Товары ❤️
                </button>


                <button
                    class="menu-item"
                    data-page="cart"
                >
                    <div class="menu-item-icon">
                        🛒
                    </div>
                    Корзина
                </button>


                <button
                    class="menu-item"
                    data-page="orders"
                >
                    <div class="menu-item-icon">
                        📦
                    </div>
                    Заказы
                </button>


                <button
                    class="menu-item"
                    data-action="contacts"
                >
                    <div class="menu-item-icon">
                        💬
                    </div>
                    WhatsApp
                </button>


                <button
                    class="menu-item"
                    data-action="share"
                >
                    <div class="menu-item-icon">
                        ↗
                    </div>
                    Поделиться
                </button>


                <button
                    class="menu-item"
                    data-action="about"
                >
                    <div class="menu-item-icon">
                        ℹ
                    </div>
                    О магазине
                </button>


                <button
                    class="menu-item"
                    data-action="policy"
                >
                    <div class="menu-item-icon">
                        📜
                    </div>
                    Политика
                </button>


                <button
                    class="menu-item"
                    data-action="repeat"
                >
                    <div class="menu-item-icon">
                        ↻
                    </div>
                    Повторить заказ
                </button>


                <button
                    class="menu-item"
                    data-action="help"
                >
                    <div class="menu-item-icon">
                        ?
                    </div>
                    Помощь
                </button>


                <button
                    class="menu-item"
                    data-action="rate"
                >
                    <div class="menu-item-icon">
                        ★
                    </div>
                    Оценить
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   EVENTS
========================================= */

function bindEvents() {

    document.addEventListener(
        "click",
        handleClick
    );


    const search =
        document.getElementById("search");


    if (search) {

        search.addEventListener(
            "input",
            handleSearch
        );

    }

}


/* =========================================
   CLICK HANDLER
========================================= */

function handleClick(event) {

    const pageButton =
        event.target.closest("[data-page]");


    if (pageButton) {

        openPage(
            pageButton.dataset.page
        );

        return;

    }


    const category =
        event.target.closest("[data-category]");


    if (category) {

        state.category =
            category.dataset.category;

        state.search = "";

        const search =
            document.getElementById("search");

        if (search) {
            search.value = "";
        }

        refreshProducts();

        return;

    }


    const add =
        event.target.closest("[data-add-cart]");


    if (add) {

        addToCart(
            Number(add.dataset.addCart)
        );

        return;

    }


    const favorite =
        event.target.closest("[data-favorite]");


    if (favorite) {

        toggleFavorite(
            Number(favorite.dataset.favorite)
        );

        return;

    }


    const action =
        event.target.closest("[data-action]");


    if (action) {

        handleAction(
            action.dataset.action
        );

        return;

    }


    if (
        event.target.closest("#shButton")
    ) {

        toggleSH();

    }

}


/* =========================================
   SEARCH
========================================= */

function handleSearch(event) {

    state.search =
        event.target.value
            .trim()
            .toLowerCase();


    const clear =
        document.getElementById("clearSearch");


    if (clear) {

        clear.style.display =
            state.search
            ? "block"
            : "none";

    }


    refreshProducts();

}


/* =========================================
   REFRESH PRODUCTS
========================================= */

function refreshProducts() {

    const container =
        document.getElementById("products");

    const noResults =
        document.getElementById("noResults");


    if (!container) return;


    const html =
        renderProducts();


    container.innerHTML =
        html;


    const visible =
        getVisibleProducts();


    if (noResults) {

        noResults.classList.toggle(
            "show",
            visible.length === 0
        );

    }


    const title =
        document
            .getElementById("productsTitle")
            ?.querySelector("h2");


    if (title) {

        title.textContent =
            state.search
            ? "Результаты поиска"
            : state.category === "all"
                ? "Популярные товары"
                : state.category;

    }

}


/* =========================================
   CART
========================================= */

function addToCart(id) {

    const existing =
        state.cart.find(
            item => item.id === id
        );


    if (existing) {

        existing.qty++;

    } else {

        state.cart.push({
            id,
            qty: 1
        });

    }


    saveCart(state.cart);

    showToast(
        "Товар добавлен в корзину 🛒"
    );

}


/* =========================================
   FAVORITES
========================================= */

function toggleFavorite(id) {

    if (
        state.favorites.includes(id)
    ) {

        state.favorites =
            state.favorites.filter(
                item => item !== id
            );

        showToast(
            "Удалено из избранного"
        );

    } else {

        state.favorites.push(id);

        showToast(
            "Добавлено в избранное ❤️"
        );

    }


    saveFavorites(
        state.favorites
    );


    refreshProducts();

}


/* =========================================
   PAGE
========================================= */

function openPage(page) {

    closeSH();


    if (page === "home") {

        state.page = "home";

        renderApp();

        return;

    }


    showToast(
        "Раздел «" +
        page +
        "» подключим следующим модулем"
    );

}


/* =========================================
   SH MENU
========================================= */

function toggleSH() {

    const menu =
        document.getElementById("shMenu");

    const button =
        document.getElementById("shButton");


    if (!menu || !button) return;


    const open =
        menu.classList.toggle("open");


    button.classList.toggle(
        "open",
        open
    );

}


function closeSH() {

    const menu =
        document.getElementById("shMenu");

    const button =
        document.getElementById("shButton");


    if (menu) {
        menu.classList.remove("open");
    }


    if (button) {
        button.classList.remove("open");
    }

}


/* =========================================
   ACTIONS
========================================= */

function handleAction(action) {

    switch (action) {

        case "products":

        case "all-products":

            state.category = "all";
            state.search = "";

            refreshProducts();

            document
                .getElementById("productsTitle")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

            break;


        case "favorites":

            openPage("favorites");

            break;


        case "cart":

            openPage("cart");

            break;


        case "share":

            shareApp();

            break;


        case "contacts":

            showToast(
                "WhatsApp подключим следующим модулем"
            );

            break;


        case "about":

            showToast(
                "Раздел «О магазине» подключим следующим модулем"
            );

            break;


        case "policy":

            showToast(
                "Политика подключим следующим модулем"
            );

            break;


        case "repeat":

            showToast(
                "Повтор заказа подключим следующим модулем"
            );

            break;


        case "help":

            showToast(
                "Помощь подключим следующим модулем"
            );

            break;


        case "rate":

            showToast(
                "Оценка магазина появится позже"
            );

            break;

    }

}


/* =========================================
   SHARE
========================================= */

async function shareApp() {

    const data = {

        title: "SHOHIN MARKET",

        text:
            "SHOHIN MARKET — онлайн-магазин продуктов.",

        url:
            window.location.href

    };


    if (navigator.share) {

        try {

            await navigator.share(data);

        } catch (error) {}

    } else {

        showToast(
            "Поделиться пока недоступно"
        );

    }

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(message) {

    let toast =
        document.getElementById("toast");


    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        document.body.appendChild(toast);

    }


    toast.textContent =
        message;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2200);

}


/* =========================================
   SERVICE WORKER
========================================= */

function registerServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register("./sw.js")
                    .catch(
                        error =>
                            console.log(
                                "SW error:",
                                error
                            )
                    );

            }
        );

    }

}


/* =========================================
   START
========================================= */

init();