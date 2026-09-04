// ============================================================
// SHOHIN MARKET
// js/map.js
// Ручной выбор точки доставки
//
// ВАЖНО:
// - GPS не используется
// - navigator.geolocation не используется
// - приложение не запрашивает разрешение на местоположение
// - пользователь сам выбирает точку на визуальной карте
// ============================================================

import {
    getDeliveryLocation,
    saveDeliveryLocation,
    clearDeliveryLocation
} from "./storage.js";


// ------------------------------------------------------------
// Настройки карты
// ------------------------------------------------------------

const MAP_CONFIG = {
    defaultLat: 38.5598,
    defaultLng: 68.7870,

    // Условные границы рабочей области карты
    minLat: 38.45,
    maxLat: 38.67,

    minLng: 68.65,
    maxLng: 68.90
};


// ------------------------------------------------------------
// Текущая выбранная точка
// ------------------------------------------------------------

let selectedLocation = null;


// ------------------------------------------------------------
// Ограничить число заданным диапазоном
// ------------------------------------------------------------

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );
}


// ------------------------------------------------------------
// Округление координат
// ------------------------------------------------------------

function roundCoordinate(value) {

    return Number(
        Number(value).toFixed(6)
    );
}


// ------------------------------------------------------------
// Нормализация точки
// ------------------------------------------------------------

function normalizeLocation(location) {

    if (!location || typeof location !== "object") {
        return null;
    }

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return null;
    }

    return {
        lat: roundCoordinate(lat),
        lng: roundCoordinate(lng),
        address: String(
            location.address || ""
        ).trim()
    };
}


// ------------------------------------------------------------
// Получить сохранённую точку
// ------------------------------------------------------------

function getSelectedLocation() {

    if (selectedLocation) {
        return selectedLocation;
    }

    const saved =
        getDeliveryLocation();

    if (saved) {
        selectedLocation =
            normalizeLocation(saved);
    }

    return selectedLocation;
}


// ------------------------------------------------------------
// Установить точку
// ------------------------------------------------------------

function setSelectedLocation(
    lat,
    lng,
    address = ""
) {

    lat = Number(lat);
    lng = Number(lng);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return null;
    }

    const location = {

        lat: roundCoordinate(
            clamp(
                lat,
                MAP_CONFIG.minLat,
                MAP_CONFIG.maxLat
            )
        ),

        lng: roundCoordinate(
            clamp(
                lng,
                MAP_CONFIG.minLng,
                MAP_CONFIG.maxLng
            )
        ),

        address: String(
            address || ""
        ).trim()
    };

    selectedLocation = location;

    saveDeliveryLocation(location);

    return location;
}


// ------------------------------------------------------------
// Изменить адрес
// ------------------------------------------------------------

function setLocationAddress(address) {

    const current =
        getSelectedLocation();

    if (!current) {
        return null;
    }

    current.address =
        String(address || "").trim();

    selectedLocation = current;

    saveDeliveryLocation(current);

    return current;
}


// ------------------------------------------------------------
// Очистить выбранную точку
// ------------------------------------------------------------

function clearSelectedLocation() {

    selectedLocation = null;

    clearDeliveryLocation();

    return true;
}


// ------------------------------------------------------------
// Получить точку по позиции внутри карты
//
// x и y — проценты от 0 до 100.
// ------------------------------------------------------------

function mapPositionToCoordinates(
    xPercent,
    yPercent
) {

    const x = clamp(
        Number(xPercent),
        0,
        100
    );

    const y = clamp(
        Number(yPercent),
        0,
        100
    );

    const lng =
        MAP_CONFIG.minLng +
        (
            x / 100
        ) *
        (
            MAP_CONFIG.maxLng -
            MAP_CONFIG.minLng
        );

    // Визуальная координата Y идёт сверху вниз,
    // поэтому широта рассчитывается наоборот.

    const lat =
        MAP_CONFIG.maxLat -
        (
            y / 100
        ) *
        (
            MAP_CONFIG.maxLat -
            MAP_CONFIG.minLat
        );

    return {
        lat: roundCoordinate(lat),
        lng: roundCoordinate(lng)
    };
}


// ------------------------------------------------------------
// Координаты → позиция внутри карты
// ------------------------------------------------------------

function coordinatesToMapPosition(
    lat,
    lng
) {

    lat = Number(lat);
    lng = Number(lng);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return {
            x: 50,
            y: 50
        };
    }

    const x =
        (
            (
                lng -
                MAP_CONFIG.minLng
            ) /
            (
                MAP_CONFIG.maxLng -
                MAP_CONFIG.minLng
            )
        ) *
        100;

    const y =
        (
            (
                MAP_CONFIG.maxLat -
                lat
            ) /
            (
                MAP_CONFIG.maxLat -
                MAP_CONFIG.minLat
            )
        ) *
        100;

    return {
        x: clamp(x, 0, 100),
        y: clamp(y, 0, 100)
    };
}


// ------------------------------------------------------------
// Получить положение сохранённого pin
// ------------------------------------------------------------

function getPinPosition() {

    const location =
        getSelectedLocation();

    if (!location) {
        return {
            x: 50,
            y: 50
        };
    }

    return coordinatesToMapPosition(
        location.lat,
        location.lng
    );
}


// ------------------------------------------------------------
// Обработка нажатия на визуальную карту
// ------------------------------------------------------------

function selectMapPosition(
    xPercent,
    yPercent,
    address = ""
) {

    const coordinates =
        mapPositionToCoordinates(
            xPercent,
            yPercent
        );

    return setSelectedLocation(
        coordinates.lat,
        coordinates.lng,
        address
    );
}


// ------------------------------------------------------------
// Получить текст координат
// ------------------------------------------------------------

function formatCoordinates(location) {

    if (!location) {
        return "";
    }

    return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
}


// ------------------------------------------------------------
// Получить отображаемый адрес
// ------------------------------------------------------------

function getLocationDisplayText(
    location = getSelectedLocation()
) {

    if (!location) {
        return "Место доставки не выбрано";
    }

    if (location.address) {
        return location.address;
    }

    return `Точка доставки: ${formatCoordinates(location)}`;
}


// ------------------------------------------------------------
// Инициализация визуальной карты
// ------------------------------------------------------------

function initDeliveryMap(
    mapElement,
    pinElement,
    onChange = null
) {

    if (!mapElement) {
        return;
    }

    const existing =
        getSelectedLocation();

    if (existing && pinElement) {

        const position =
            coordinatesToMapPosition(
                existing.lat,
                existing.lng
            );

        pinElement.style.left =
            `${position.x}%`;

        pinElement.style.top =
            `${position.y}%`;

        pinElement.classList.add(
            "map-pin-visible"
        );
    }


    // --------------------------------------------------------
    // Нажатие / касание карты
    // --------------------------------------------------------

    const handleMapSelection = event => {

        const rect =
            mapElement.getBoundingClientRect();

        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {
            return;
        }

        let clientX;
        let clientY;

        if (
            event.touches &&
            event.touches.length > 0
        ) {

            clientX =
                event.touches[0].clientX;

            clientY =
                event.touches[0].clientY;

        } else {

            clientX =
                event.clientX;

            clientY =
                event.clientY;
        }

        const x =
            (
                (
                    clientX -
                    rect.left
                ) /
                rect.width
            ) *
            100;

        const y =
            (
                (
                    clientY -
                    rect.top
                ) /
                rect.height
            ) *
            100;


        const location =
            selectMapPosition(
                x,
                y
            );


        if (!location) {
            return;
        }


        // Обновляем pin

        if (pinElement) {

            const position =
                coordinatesToMapPosition(
                    location.lat,
                    location.lng
                );

            pinElement.style.left =
                `${position.x}%`;

            pinElement.style.top =
                `${position.y}%`;

            pinElement.classList.add(
                "map-pin-visible"
            );

            pinElement.classList.remove(
                "map-pin-pulse"
            );

            // Перезапуск CSS-анимации

            void pinElement.offsetWidth;

            pinElement.classList.add(
                "map-pin-pulse"
            );
        }


        if (typeof onChange === "function") {
            onChange(location);
        }
    };


    mapElement.addEventListener(
        "click",
        handleMapSelection
    );


    mapElement.addEventListener(
        "touchend",
        event => {

            // Не обрабатываем жесты прокрутки
            if (
                event.changedTouches &&
                event.changedTouches.length === 1
            ) {
                handleMapSelection(event);
            }
        },
        {
            passive: true
        }
    );
}


// ------------------------------------------------------------
// Экспорт
// ------------------------------------------------------------

export {
    MAP_CONFIG,

    getSelectedLocation,
    setSelectedLocation,
    setLocationAddress,
    clearSelectedLocation,

    mapPositionToCoordinates,
    coordinatesToMapPosition,
    getPinPosition,

    selectMapPosition,

    formatCoordinates,
    getLocationDisplayText,

    initDeliveryMap
};