// SHOHIN MARKET
// Map module

let selectedLocation = {
    lat: null,
    lng: null,
    address: ""
};


// ========================================
// Установить точку доставки
// ========================================

function setDeliveryLocation(
    lat,
    lng,
    address = ""
) {

    selectedLocation = {
        lat: Number(lat),
        lng: Number(lng),
        address: String(address || "")
    };

    return {
        ...selectedLocation
    };
}


// ========================================
// Получить точку доставки
// ========================================

function getDeliveryLocation() {

    return {
        ...selectedLocation
    };
}


// ========================================
// Установить адрес
// ========================================

function setDeliveryAddress(
    address
) {

    selectedLocation.address =
        String(address || "");

    return selectedLocation.address;
}


// ========================================
// Получить адрес
// ========================================

function getDeliveryAddress() {

    return selectedLocation.address;
}


// ========================================
// Проверить координаты
// ========================================

function hasDeliveryLocation() {

    return (
        Number.isFinite(
            selectedLocation.lat
        ) &&
        Number.isFinite(
            selectedLocation.lng
        )
    );
}


// ========================================
// Очистить точку
// ========================================

function clearDeliveryLocation() {

    selectedLocation = {
        lat: null,
        lng: null,
        address: ""
    };
}


// ========================================
// Данные для заказа
// ========================================

function getLocationForOrder() {

    return {
        lat:
            selectedLocation.lat,

        lng:
            selectedLocation.lng,

        address:
            selectedLocation.address
    };
}


// ========================================
// Экспорт
// ========================================

export {
    setDeliveryLocation,
    getDeliveryLocation,
    setDeliveryAddress,
    getDeliveryAddress,
    hasDeliveryLocation,
    clearDeliveryLocation,
    getLocationForOrder
};