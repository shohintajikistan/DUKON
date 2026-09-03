// SHOHIN MARKET
// Products module

let products = [];

// Загрузка товаров из data/products.json
async function loadProducts() {
    try {
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("Не удалось загрузить товары");
        }

        products = await response.json();

        console.log("SHOHIN MARKET: товары загружены", products);

        return products;
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);

        products = [];

        return [];
    }
}

// Получить все товары
function getProducts() {
    return products;
}

// Найти товар по ID
function getProductById(id) {
    return products.find(product => product.id === Number(id));
}

// Получить товары определённой категории
function getProductsByCategory(category) {
    return products.filter(product => product.category === category);
}

// Поиск товаров
function searchProductsData(query) {
    const text = String(query || "").trim().toLowerCase();

    if (!text) {
        return products;
    }

    return products.filter(product =>
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text) ||
        product.description.toLowerCase().includes(text)
    );
}

// Только доступные товары
function getAvailableProducts() {
    return products.filter(product => product.available === true);
}

// Получить список категорий
function getCategories() {
    return [...new Set(products.map(product => product.category))];
}