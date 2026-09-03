// SHOHIN MARKET
// Products module

let products = [];


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    try {

        const response =
            await fetch("data/products.json", {
                cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "products.json должен содержать массив"
            );
        }

        products = data;

        console.log(
            "SHOHIN MARKET: товары загружены",
            products.length
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
// GET ALL PRODUCTS
// ========================================

function getProducts() {

    return products;
}


// ========================================
// GET PRODUCT BY ID
// ========================================

function getProductById(id) {

    return products.find(
        product =>
            Number(product.id) ===
            Number(id)
    );
}


// ========================================
// GET PRODUCTS BY CATEGORY
// ========================================

function getProductsByCategory(category) {

    return products.filter(
        product =>
            String(product.category || "")
                .toLowerCase() ===
            String(category || "")
                .toLowerCase()
    );
}


// ========================================
// SEARCH PRODUCTS
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

        const unit =
            String(product.unit || "")
                .toLowerCase();

        return (
            name.includes(text) ||
            category.includes(text) ||
            description.includes(text) ||
            unit.includes(text)
        );
    });
}


// ========================================
// AVAILABLE PRODUCTS
// ========================================

function getAvailableProducts() {

    return products.filter(
        product =>
            product.available === true
    );
}


// ========================================
// CATEGORIES
// ========================================

function getCategories() {

    return [
        ...new Set(
            products
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        )
    ];
}


// ========================================
// PRODUCT COUNT
// ========================================

function getProductsCount() {

    return products.length;
}


// ========================================
// CATEGORY COUNT
// ========================================

function getCategoryCount(category) {

    return getProductsByCategory(
        category
    ).length;
}


// ========================================
// EXPORT
// ========================================

export {
    loadProducts,
    getProducts,
    getProductById,
    getProductsByCategory,
    searchProductsData,
    getAvailableProducts,
    getCategories,
    getProductsCount,
    getCategoryCount
};