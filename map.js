// SHOHIN MARKET
// Map module

let selectedLocation = {
    lat: null,
    lng: null,
    address: ""
};


// Установить точку доставки
function setDeliveryLocation(lat, lng, address = "") {
    selectedLocation = {
        lat: Number(lat),
        lng: Number(lng),
        address: String(address || "")
    };

    return selectedLocation;
}


// Получить выбранную точку
function getDeliveryLocation() {
    return {
        ...selectedLocation
    };
}


// Установить адрес
function setDeliveryAddress(address) {
    selectedLocation.address = String(address || "");

    return selectedLocation.address;
}


// Получить адрес
function getDeliveryAddress() {
    return selectedLocation.address;
}


// Проверить, выбрана ли точка
function hasDeliveryLocation() {
    return (
        Number.isFinite(selectedLocation.lat) &&
        Number.isFinite(selectedLocation.lng)
    );
}


// Очистить выбранную точку
function clearDeliveryLocation() {
    selectedLocation = {
        lat: null,
        lng: null,
        address: ""
    };
}


// Подготовить данные для заказа
function getLocationForOrder() {
    return {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        address: selectedLocation.address
    };
}