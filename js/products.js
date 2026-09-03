// SHOHIN MARKET
// Products module

let products = [];


// ========================================
// Загрузка товаров
// ========================================

async function loadProducts() {

    try {

        const response =
            await fetch("../data/products.json");

        if (!response.ok) {
            throw new Error(
                "Не удалось загрузить products.json"
            );
        }

        products =
            await response.json();

        console.log(
            "SHOHIN MARKET: товары загружены",
            products
        );

        return products;

    } catch (error) {

        console.error(
            "Ошибка загрузки товаров:",
            error
        );

        products = [];

        return [];
    }
}


// ========================================
// Получить все товары
// ========================================

function getProducts() {
    return products;
}


// ========================================
// Получить товар по ID
// ========================================

function getProductById(id) {

    return products.find(
        product =>
            Number(product.id) === Number(id)
    );
}


// ========================================
// Получить товары категории
// ========================================

function getProductsByCategory(category) {

    return products.filter(
        product =>
            product.category === category
    );
}


// ========================================
// Поиск товаров
// ========================================

function searchProductsData(query) {

    const text =
        String(query || "")
            .trim()
            .toLowerCase();

    if (!text) {
        return products;
    }

    return products.filter(product => {

        const name =
            String(product.name || "")
                .toLowerCase();

        const category =
            String(product.category || "")
                .toLowerCase();

        const description =
            String(product.description || "")
                .toLowerCase();

        return (
            name.includes(text) ||
            category.includes(text) ||
            description.includes(text)
        );
    });
}


// ========================================
// Только доступные товары
// ========================================

function getAvailableProducts() {

    return products.filter(
        product =>
            product.available === true
    );
}


// ========================================
// Получить категории
// ========================================

function getCategories() {

    return [
        ...new Set(
            products.map(
                product => product.category
            )
        )
    ];
}


// ========================================
// Экспорт модуля
// ========================================

export {
    loadProducts,
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProductsData,
    getAvailableProducts,
    getCategories
};