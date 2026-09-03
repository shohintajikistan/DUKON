// SHOHIN MARKET
// Orders module

import {
    getOrders,
    saveOrders
} from "./storage.js";

import {
    getCartItems,
    getCartTotal,
    clearCart,
    addProductToCart
} from "./cart.js";


// ========================================
// Получить все заказы
// ========================================

function getCurrentOrders() {
    return getOrders();
}


// ========================================
// Создать заказ
// ========================================

function createOrder(orderData = {}) {

    const cartItems =
        getCartItems();

    if (!cartItems.length) {
        return null;
    }

    const order = {

        id: generateOrderId(),

        date:
            new Date().toISOString(),

        status: "new",

        statusText:
            "Новый заказ",

        customer: {

            name:
                orderData.name || "",

            phone:
                orderData.phone || ""
        },

        delivery: {

            address:
                orderData.address || "",

            comment:
                orderData.comment || ""
        },

        location: {

            lat:
                orderData.lat ?? null,

            lng:
                orderData.lng ?? null
        },

        payment:
            orderData.payment || "cash",

        items:
            cartItems.map(item => ({

                productId:
                    item.id,

                name:
                    item.name,

                price:
                    item.price,

                unit:
                    item.unit,

                quantity:
                    item.quantity,

                subtotal:
                    item.subtotal
            })),

        total:
            getCartTotal()
    };

    const orders =
        getOrders();

    orders.unshift(order);

    saveOrders(orders);

    clearCart();

    return order;
}


// ========================================
// Номер заказа
// ========================================

function generateOrderId() {

    const time =
        Date.now().toString();

    return "SH-" +
        time.slice(-8);
}


// ========================================
// Найти заказ
// ========================================

function getOrderById(orderId) {

    return getOrders().find(
        order =>
            String(order.id) ===
            String(orderId)
    );
}


// ========================================
// Изменить статус
// ========================================

function updateOrderStatus(
    orderId,
    status,
    statusText = ""
) {

    const orders =
        getOrders();

    const order =
        orders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) {
        return false;
    }

    order.status =
        status;

    if (statusText) {

        order.statusText =
            statusText;
    }

    order.updatedAt =
        new Date().toISOString();

    saveOrders(orders);

    return true;
}


// ========================================
// Последний заказ
// ========================================

function getLastOrder() {

    const orders =
        getOrders();

    return orders.length
        ? orders[0]
        : null;
}


// ========================================
// Подтвердить получение
// ========================================

function confirmOrderReceived(
    orderId
) {

    return updateOrderStatus(
        orderId,
        "completed",
        "Получен"
    );
}


// ========================================
// Отменить заказ
// ========================================

function cancelOrder(
    orderId
) {

    return updateOrderStatus(
        orderId,
        "cancelled",
        "Отменён"
    );
}


// ========================================
// Повторить последний заказ
// ========================================

function repeatLastOrder() {

    const order =
        getLastOrder();

    if (
        !order ||
        !order.items
    ) {
        return false;
    }

    clearCart();

    order.items.forEach(item => {

        addProductToCart(
            item.productId,
            item.quantity
        );

    });

    return true;
}


// ========================================
// Экспорт
// ========================================

export {
    getCurrentOrders,
    createOrder,
    getOrderById,
    updateOrderStatus,
    getLastOrder,
    confirmOrderReceived,
    cancelOrder,
    repeatLastOrder
};