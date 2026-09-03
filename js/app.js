// SHOHIN MARKET
// Main application

document.addEventListener("DOMContentLoaded", async () => {
    console.log("SHOHIN MARKET запускается...");

    await loadProducts();

    console.log("SHOHIN MARKET готов.");

    if (typeof renderProducts === "function") {
        renderProducts();
    }

    if (typeof updateCartUI === "function") {
        updateCartUI();
    }

    if (typeof renderFavorites === "function") {
        renderFavorites();
    }

    if (typeof renderOrders === "function") {
        renderOrders();
    }
});


// ================================
// Навигация
// ================================

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


// ================================
// Обновление интерфейса
// ================================

function refreshShopUI() {

    if (typeof renderProducts === "function") {
        renderProducts();
    }

    if (typeof renderFavorites === "function") {
        renderFavorites();
    }

    if (typeof renderCart === "function") {
        renderCart();
    }

    if (typeof renderOrders === "function") {
        renderOrders();
    }

    updateCartUI();
}


// ================================
// Счётчик корзины
// ================================

function updateCartUI() {

    const count = typeof getCartCount === "function"
        ? getCartCount()
        : 0;

    document.querySelectorAll("[data-cart-count]").forEach(element => {
        element.textContent = count;
    });

    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? "flex" : "none";
    }
}


// ================================
// Toast
// ================================

function showToast(message) {

    let toast = document.getElementById("shopToast");

    if (!toast) {
        toast = document.createElement("div");

        toast.id = "shopToast";

        toast.style.position = "fixed";
        toast.style.left = "50%";
        toast.style.bottom = "90px";
        toast.style.transform = "translateX(-50%)";
        toast.style.zIndex = "9999";
        toast.style.padding = "12px 18px";
        toast.style.borderRadius = "14px";
        toast.style.background = "#092f24";
        toast.style.color = "#ffffff";
        toast.style.fontSize = "14px";
        toast.style.boxShadow = "0 8px 25px rgba(0,0,0,.2)";
        toast.style.transition = "opacity .2s";

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    clearTimeout(window.__shopToastTimer);

    window.__shopToastTimer = setTimeout(() => {
        toast.style.opacity = "0";
    }, 2200);
}


// ================================
// Добавление товара
// ================================

function addToCart(productId) {

    const success = addProductToCart(productId);

    if (!success) {
        showToast("Не удалось добавить товар");
        return;
    }

    updateCartUI();

    showToast("Товар добавлен в корзину");

    if (typeof renderCart === "function") {
        renderCart();
    }
}


// ================================
// Избранное
// ================================

function toggleFavorite(productId) {

    const isFavorite = toggleProductFavorite(productId);

    if (isFavorite) {
        showToast("Добавлено в избранное");
    } else {
        showToast("Удалено из избранного");
    }

    if (typeof renderFavorites === "function") {
        renderFavorites();
    }

    if (typeof renderProducts === "function") {
        renderProducts();
    }
}


// ================================
// Запуск приложения
// ================================

window.SHOHIN = {
    products: getProducts,
    cart: getCart,
    favorites: getFavorites,
    orders: getOrders,

    addToCart,
    toggleFavorite,

    openPage,
    refreshShopUI,
    updateCartUI,

    getDeliveryLocation,
    setDeliveryLocation
};
