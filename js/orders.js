// ============================================================
// SHOHIN MARKET
// js/orders.js
// Работа с заказами
// ============================================================

import {
    getOrders,
    saveOrders,
    addOrder
} from "./storage.js";


// ------------------------------------------------------------
// Статусы заказа
// ------------------------------------------------------------

const ORDER_STATUS = {
    NEW: "new",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    ON_DELIVERY: "on_delivery",
    DELIVERED: "delivered",
    CANCELLED: "cancelled"
};


// ------------------------------------------------------------
// Названия статусов
// ------------------------------------------------------------

const ORDER_STATUS_LABELS = {
    new: "Новый",
    confirmed: "Подтверждён",
    preparing: "Собирается",
    on_delivery: "В доставке",
    delivered: "Доставлен",
    cancelled: "Отменён"
};


// ------------------------------------------------------------
// Получить все заказы
// ------------------------------------------------------------

function getAllOrders() {
    return getOrders();
}


// ------------------------------------------------------------
// Найти заказ по ID
// ------------------------------------------------------------

function getOrderById(orderId) {

    const orders = getOrders();

    return orders.find(
        order =>
            String(order.id) === String(orderId)
    ) || null;
}


// ------------------------------------------------------------
// Создать уникальный ID заказа
// ------------------------------------------------------------

function generateOrderId() {

    const now = new Date();

    const datePart =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");

    const timePart =
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0");

    const randomPart =
        Math.floor(100 + Math.random() * 900);

    return `SH-${datePart}-${timePart}-${randomPart}`;
}


// ------------------------------------------------------------
// Создать заказ
// ------------------------------------------------------------

function createOrder({
    customer,
    items,
    subtotal,
    deliveryPrice = 0,
    total,
    paymentMethod,
    location,
    comment = ""
}) {

    if (!customer || typeof customer !== "object") {
        throw new Error("Не указаны данные клиента");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Корзина пуста");
    }

    const order = {

        id: generateOrderId(),

        createdAt: new Date().toISOString(),

        status: ORDER_STATUS.NEW,

        customer: {
            name: String(customer.name || "").trim(),
            phone: String(customer.phone || "").trim()
        },

        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 1),
            unit: item.unit || "шт.",
            image: item.image || "",
            subtotal: Number(item.subtotal || 0)
        })),

        subtotal: Number(subtotal || 0),

        deliveryPrice: Number(deliveryPrice || 0),

        total: Number(total || 0),

        paymentMethod:
            paymentMethod === "card"
                ? "card"
                : "cash",

        location: location
            ? {
                address: String(location.address || ""),
                lat: Number(location.lat || 0),
                lng: Number(location.lng || 0)
            }
            : null,

        comment: String(comment || "").trim()
    };


    const success = addOrder(order);

    if (!success) {
        throw new Error("Не удалось сохранить заказ");
    }

    return order;
}


// ------------------------------------------------------------
// Обновить статус заказа
// ------------------------------------------------------------

function updateOrderStatus(orderId, status) {

    if (!Object.values(ORDER_STATUS).includes(status)) {
        throw new Error("Недопустимый статус заказа");
    }

    const orders = getOrders();

    const order = orders.find(
        item =>
            String(item.id) === String(orderId)
    );

    if (!order) {
        throw new Error("Заказ не найден");
    }

    order.status = status;

    order.updatedAt =
        new Date().toISOString();

    saveOrders(orders);

    return order;
}


// ------------------------------------------------------------
// Отменить заказ
// ------------------------------------------------------------

function cancelOrder(orderId) {

    return updateOrderStatus(
        orderId,
        ORDER_STATUS.CANCELLED
    );
}


// ------------------------------------------------------------
// Повторить заказ
// ------------------------------------------------------------

function getRepeatOrderItems(orderId) {

    const order = getOrderById(orderId);

    if (!order) {
        return [];
    }

    if (!Array.isArray(order.items)) {
        return [];
    }

    return order.items.map(item => ({
        id: item.id,
        quantity: item.quantity
    }));
}


// ------------------------------------------------------------
// Последний заказ
// ------------------------------------------------------------

function getLastOrder() {

    const orders = getOrders();

    return orders.length > 0
        ? orders[0]
        : null;
}


// ------------------------------------------------------------
// Количество заказов
// ------------------------------------------------------------

function getOrdersCount() {
    return getOrders().length;
}


// ------------------------------------------------------------
// Название статуса
// ------------------------------------------------------------

function getOrderStatusLabel(status) {

    return ORDER_STATUS_LABELS[status]
        || "Неизвестный статус";
}


// ------------------------------------------------------------
// Форматирование даты заказа
// ------------------------------------------------------------

function formatOrderDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(date);
}


// ------------------------------------------------------------
// Форматирование способа оплаты
// ------------------------------------------------------------

function getPaymentMethodLabel(method) {

    if (method === "card") {
        return "Банковская карта";
    }

    return "Наличными при получении";
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    ORDER_STATUS,
    ORDER_STATUS_LABELS,

    getAllOrders,
    getOrderById,

    generateOrderId,
    createOrder,

    updateOrderStatus,
    cancelOrder,

    getRepeatOrderItems,

    getLastOrder,
    getOrdersCount,

    getOrderStatusLabel,
    formatOrderDate,
    getPaymentMethodLabel
};