// ============================================================
// SHOHIN MARKET
// js/products.js
// Работа с каталогом товаров
// ============================================================

const PRODUCTS_FILE = "./data/products.json";

let productsCache = null;


// ------------------------------------------------------------
// Загрузка товаров
// ------------------------------------------------------------

async function loadProducts() {
    if (productsCache !== null) {
        return productsCache;
    }

    try {
        const response = await fetch(PRODUCTS_FILE, {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Ошибка загрузки товаров: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("products.json должен содержать массив товаров");
        }

        productsCache = data;

        return productsCache;

    } catch (error) {
        console.error("SHOHIN PRODUCTS ERROR:", error);
        throw error;
    }
}


// ------------------------------------------------------------
// Получить все товары
// ------------------------------------------------------------

async function getProducts() {
    return await loadProducts();
}


// ------------------------------------------------------------
// Найти товар по ID
// ------------------------------------------------------------

async function getProductById(id) {
    const products = await loadProducts();

    return products.find(
        product => String(product.id) === String(id)
    ) || null;
}


// ------------------------------------------------------------
// Получить товары по категории
// ------------------------------------------------------------

async function getProductsByCategory(category) {
    const products = await loadProducts();

    if (!category || category === "all") {
        return products;
    }

    return products.filter(
        product => product.category === category
    );
}


// ------------------------------------------------------------
// Поиск товаров
// ------------------------------------------------------------

async function searchProducts(query) {
    const products = await loadProducts();

    const text = String(query || "")
        .trim()
        .toLowerCase();

    if (!text) {
        return products;
    }

    return products.filter(product => {

        const name = String(product.name || "")
            .toLowerCase();

        const description = String(product.description || "")
            .toLowerCase();

        const category = String(product.category || "")
            .toLowerCase();

        const tags = Array.isArray(product.tags)
            ? product.tags.join(" ").toLowerCase()
            : String(product.tags || "").toLowerCase();

        return (
            name.includes(text) ||
            description.includes(text) ||
            category.includes(text) ||
            tags.includes(text)
        );
    });
}


// ------------------------------------------------------------
// Получить список категорий
// ------------------------------------------------------------

async function getCategories() {
    const products = await loadProducts();

    const categories = [];

    products.forEach(product => {

        const category = product.category;

        if (
            category &&
            !categories.includes(category)
        ) {
            categories.push(category);
        }
    });

    return categories;
}


// ------------------------------------------------------------
// Проверка доступности товара
// ------------------------------------------------------------

function isProductAvailable(product) {
    if (!product) {
        return false;
    }

    if (product.available === false) {
        return false;
    }

    if (
        typeof product.stock === "number" &&
        product.stock <= 0
    ) {
        return false;
    }

    return true;
}


// ------------------------------------------------------------
// Форматирование цены
// ------------------------------------------------------------

function formatPrice(price) {
    const number = Number(price);

    if (!Number.isFinite(number)) {
        return "0 сомони";
    }

    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0
    }).format(number) + " сомони";
}


// ------------------------------------------------------------
// Получить цену числом
// ------------------------------------------------------------

function getProductPrice(product) {
    const price = Number(product?.price);

    if (!Number.isFinite(price)) {
        return 0;
    }

    return price;
}


// ------------------------------------------------------------
// Очистить кэш каталога
// ------------------------------------------------------------

function clearProductsCache() {
    productsCache = null;
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    loadProducts,
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProducts,
    getCategories,
    isProductAvailable,
    formatPrice,
    getProductPrice,
    clearProductsCache
};