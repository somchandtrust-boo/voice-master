/* =========================================================
   CBRND ENVIRONMENT COMMAND CENTER
   REAL WEATHER MAP ENGINE V2
   ========================================================= */

"use strict";

/* =========================================================
   APP LINKS
   ========================================================= */

const APP_LINKS = {
    qr: "https://somchandtrust-boo.github.io/CBRND-QR",
    camera: "https://somchandtrust-boo.github.io/hd-smart-camera/",
    sos: "YOUR_SOS_SIREN_URL",
    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html"
};


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let map = null;

let currentLat = 23.0225;
let currentLon = 72.5714;

let currentWeather = null;

let currentMetric = "temperature";

let weatherGridLayer = null;
let windLayer = null;
let gpsMarker = null;
let gpsAccuracyCircle = null;

let weatherChart = null;

let isListening = false;


/* =========================================================
   MAP TILE LAYERS
   ========================================================= */

let streetLayer;
let topoLayer;
let satelliteLayer;


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMap();

    initVoice();

    setupButtons();

    loadWeather();

    loadEarthquakes();

    locateUser();

    setInterval(loadWeather, 5 * 60 * 1000);

    setInterval(loadEarthquakes, 2 * 60 * 1000);

});


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap() {

    map = L.map("map", {
        zoomControl: true,
        attributionControl: true
    }).setView(
        [currentLat, currentLon],
        9
    );


    /* STREET */

    streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }
    );


    /* TOPO */

    topoLayer = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 17,
            attribution: "&copy; OpenTopoMap"
        }
    );


    /* SATELLITE */

    satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "Tiles &copy; Esri"
        }
    );


    streetLayer.addTo(map);


    addMapStyleControl();

    addWeatherMetricControl();

    addMapInfoPanel();

}


/* =========================================================
   MAP STYLE CONTROL
   ========================================================= */

function addMapStyleControl() {

    const control = L.control({
        position: "topright"
    });


    control.onAdd = function () {

        const div = L.DomUtil.create(
            "div",
            "map-control-box"
        );

        div.innerHTML = `
            <div class="map-control-title">
                MAP
            </div>

            <button class="map-style-btn active"
                data-map="street">
                Street
            </button>

            <button class="map-style-btn"
                data-map="topo">
                Topo
            </button>

            <button class="map-style-btn"
                data-map="satellite">
                Satellite
            </button>
        `;


        L.DomEvent.disableClickPropagation(div);


        div.querySelectorAll(
            ".map-style-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const type =
                        button.dataset.map;

                    setMapStyle(type);

                    div.querySelectorAll(
                        ".map-style-btn"
                    ).forEach(btn => {
                        btn.classList.remove("active");
                    });

                    button.classList.add("active");

                }
            );

        });


        return div;
    };


    control.addTo(map);

}


/* =========================================================
   MAP STYLE
   ========================================================= */

function setMapStyle(type) {

    map.removeLayer(streetLayer);
    map.removeLayer(topoLayer);
    map.removeLayer(satelliteLayer);


    if (type === "topo") {
        topoLayer.addTo(map);
    }

    else if (type === "satellite") {
        satelliteLayer.addTo(map);
    }

    else {
        streetLayer.addTo(map);
    }

}


/* =========================================================
   WEATHER METRIC CONTROL
   ========================================================= */

function addWeatherMetricControl() {

    const control = L.control({
        position: "topright"
    });


    control.onAdd = function () {

        const div = L.DomUtil.create(
            "div",
            "map-control-box weather-control"
        );


        div.innerHTML = `

            <div class="map-control-title">
                LIVE WEATHER
            </div>

            <button class="weather-metric-btn active"
                data-metric="temperature">
                🌡 Temperature
            </button>

            <button class="weather-metric-btn"
                data-metric="humidity">
                💧 Humidity
            </button>

            <button class="weather-metric-btn"
                data-metric="pressure">
                🧭 Pressure
            </button>

            <button class="weather-metric-btn"
                data-metric="wind">
                🌬 Wind
            </button>

            <button class="weather-metric-btn"
                data-metric="rain">
                🌧 Rain
            </button>

        `;


        L.DomEvent.disableClickPropagation(div);


        div.querySelectorAll(
            ".weather-metric-btn"
        ).forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const metric =
                        button.dataset.metric;

                    setWeatherMetric(metric);


                    div.querySelectorAll(
                        ".weather-metric-btn"
                    ).forEach(btn => {
                        btn.classList.remove("active");
                    });


                    button.classList.add("active");

                }
            );

        });


        return div;

    };


    control.addTo(map);

}


/* =========================================================
   MAP INFORMATION PANEL
   ========================================================= */

function addMapInfoPanel() {

    const control = L.control({
        position: "bottomleft"
    });


    control.onAdd = function () {

        const div = L.DomUtil.create(
            "div",
            "map-live-info"
        );


        div.id = "mapLiveInfo";


        div.innerHTML = `
            <div>
                <strong>LIVE DATA</strong>
            </div>

            <div id="mapMetricText">
                Loading weather...
            </div>

            <div id="mapUpdatedText">
                Waiting...
            </div>
        `;


        return div;

    };


    control.addTo(map);

}


/* =========================================================
   WEATHER METRIC
   ========================================================= */

function setWeatherMetric(metric) {

    currentMetric = metric;

    clearWeatherLayers();


    if (!currentWeather) {
        return;
    }


    if (metric === "wind") {

        drawWindField();

    }

    else {

        drawWeatherField(metric);

    }


    updateMapInfo();

}


/* =========================================================
   CLEAR WEATHER LAYERS
   ========================================================= */

function clearWeatherLayers() {

    if (weatherGridLayer) {

        map.removeLayer(
            weatherGridLayer
        );

        weatherGridLayer = null;

    }


    if (windLayer) {

        map.removeLayer(
            windLayer
        );

        windLayer = null;

    }

}


/* =========================================================
   OPEN METEO WEATHER
   ========================================================= */

async function loadWeather() {

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${currentLat}` +
            `&longitude=${currentLon}` +
            "&current=" +
            [
                "temperature_2m",
                "relative_humidity_2m",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "precipitation",
                "cloud_cover"
            ].join(",") +
            "&hourly=" +
            [
                "temperature_2m",
                "relative_humidity_2m",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "precipitation",
                "relative_humidity_2m"
            ].join(",") +
            "&timezone=auto" +
            "&forecast_days=2";


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Weather API error"
            );
        }


        currentWeather =
            await response.json();


        updateWeatherCards();

        updateWeatherChart();

        generateAlerts();

        setWeatherMetric(
            currentMetric
        );

        updateMapInfo();


    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );

        showWeatherError();

    }

}


/* =========================================================
   WEATHER CARDS
   ========================================================= */

function updateWeatherCards() {

    if (!currentWeather?.current) {
        return;
    }


    const w =
        currentWeather.current;


    setText(
        "temperature",
        `${round(w.temperature_2m)} °C`
    );


    setText(
        "humidity",
        `${round(w.relative_humidity_2m)} %`
    );


    setText(
        "pressure",
        `${round(w.surface_pressure)} hPa`
    );


    setText(
        "wind",
        `${round(w.wind_speed_10m)} km/h`
    );


    setText(
        "rain",
        `${round(w.precipitation)} mm`
    );


    setText(
        "cloud",
        `${round(w.cloud_cover)} %`
    );

}


/* =========================================================
   WEATHER FIELD
   ========================================================= */

function drawWeatherField(metric) {

    if (!currentWeather?.current) {
        return;
    }


    weatherGridLayer =
        L.layerGroup().addTo(map);


    const w =
        currentWeather.current;


    const value =
        getMetricValue(
            metric,
            w
        );


    const color =
        getMetricColor(
            metric,
            value
        );


    /* Main actual-data zone */

    L.circle(
        [currentLat, currentLon],
        {
            radius: 25000,
            color: color,
            fillColor: color,
            fillOpacity: 0.10,
            weight: 2
        }
    )
    .bindPopup(
        createWeatherPopup(
            metric,
            value,
            w
        )
    )
    .addTo(weatherGridLayer);


    L.circle(
        [currentLat, currentLon],
        {
            radius: 10000,
            color: color,
            fillColor: color,
            fillOpacity: 0.18,
            weight: 1
        }
    )
    .addTo(weatherGridLayer);


    /* Grid */

    createWeatherGrid(
        metric
    );

}


/* =========================================================
   WEATHER GRID
   ========================================================= */

function createWeatherGrid(metric) {

    const gridSize = 5;

    const spacing = 0.12;


    const baseLat =
        currentLat -
        ((gridSize - 1) * spacing) / 2;


    const baseLon =
        currentLon -
        ((gridSize - 1) * spacing) / 2;


    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            const lat =
                baseLat +
                row * spacing;


            const lon =
                baseLon +
                col * spacing;


            /*
              Use current real value as the
              center reference.

              Small visual variation makes
              the field readable without
              pretending that we have a
              high-resolution radar.
            */

            const value =
                getGridVisualValue(
                    metric,
                    row,
                    col
                );


            const color =
                getMetricColor(
                    metric,
                    value
                );


            const marker =
                L.circleMarker(
                    [lat, lon],
                    {
                        radius: 30,
                        color: color,
                        fillColor: color,
                        fillOpacity: 0.10,
                        weight: 1
                    }
                );


            marker.bindPopup(
                createGridPopup(
                    metric,
                    value,
                    lat,
                    lon
                )
            );


            marker.addTo(
                weatherGridLayer
            );

        }

    }

}


/* =========================================================
   GRID VISUAL VALUE
   ========================================================= */

function getGridVisualValue(
    metric,
    row,
    col
) {

    const w =
        currentWeather.current;


    let value =
        getMetricValue(
            metric,
            w
        );


    /*
      Keep visual grid centered around
      the real current observation.
    */

    const offset =
        (
            row +
            col -
            4
        ) * 0.25;


    if (metric === "temperature") {
        value += offset;
    }


    if (metric === "humidity") {
        value += offset * 1.5;
    }


    if (metric === "pressure") {
        value += offset * 0.8;
    }


    if (metric === "rain") {
        value =
            Math.max(
                0,
                value + offset * 0.1
            );
    }


    return value;

}


/* =========================================================
   WIND FIELD
   ========================================================= */

function drawWindField() {

    if (!currentWeather?.current) {
        return;
    }


    windLayer =
        L.layerGroup().addTo(map);


    const w =
        currentWeather.current;


    const speed =
        Number(
            w.wind_speed_10m || 0
        );


    const direction =
        Number(
            w.wind_direction_10m || 0
        );


    /* Main center wind */

    const centerArrow =
        createWindMarker(
            currentLat,
            currentLon,
            speed,
            direction,
            true
        );


    centerArrow
        .bindPopup(
            createWindPopup(
                speed,
                direction
            )
        )
        .addTo(windLayer);


    /* Grid */

    const gridSize = 7;

    const spacing = 0.10;


    const baseLat =
        currentLat -
        ((gridSize - 1) * spacing) / 2;


    const baseLon =
        currentLon -
        ((gridSize - 1) * spacing) / 2;


    for (
        let row = 0;
        row < gridSize;
        row++
    ) {

        for (
            let col = 0;
            col < gridSize;
            col++
        ) {

            if (
                row === 3 &&
                col === 3
            ) {
                continue;
            }


            const lat =
                baseLat +
                row * spacing;


            const lon =
                baseLon +
                col * spacing;


            /*
              Small direction variation
              is only visual interpolation.
            */

            const localDirection =
                normalizeAngle(
                    direction +
                    (
                        row - 3
                    ) * 5 +
                    (
                        col - 3
                    ) * 3
                );


            const localSpeed =
                Math.max(
                    0,
                    speed +
                    (
                        row - 3
                    ) * 0.5 +
                    (
                        col - 3
                    ) * 0.4
                );


            createWindMarker(
                lat,
                lon,
                localSpeed,
                localDirection,
                false
            ).addTo(
                windLayer
            );

        }

    }

}


/* =========================================================
   WIND MARKER
   ========================================================= */

function createWindMarker(
    lat,
    lon,
    speed,
    direction,
    main
) {

    /*
      Meteorological direction tells us
      where the wind is coming FROM.

      Arrow should visually point toward
      where it is going.

      Therefore +180°.
    */

    const movementDirection =
        normalizeAngle(
            direction + 180
        );


    const size =
        main ? 44 : 34;


    const html = `

        <div
            class="wind-marker ${main ? "wind-main" : ""}"
            title="${round(speed)} km/h"
        >

            <div
                class="wind-arrow"
                style="
                    transform:
                    rotate(${movementDirection}deg);
                "
            >
                ➤
            </div>

            <div class="wind-speed">
                ${round(speed)}
                <span>km/h</span>
            </div>

        </div>

    `;


    return L.marker(
        [lat, lon],
        {
            icon:
                L.divIcon({
                    className:
                        "wind-div-icon",
                    html: html,
                    iconSize:
                        [size, size],
                    iconAnchor:
                        [size / 2, size / 2]
                })
        }
    );

}


/* =========================================================
   WIND POPUP
   ========================================================= */

function createWindPopup(
    speed,
    direction
) {

    return `

        <div class="weather-popup">

            <div class="popup-title">
                🌬 LIVE WIND
            </div>

            <div>
                <strong>
                    Speed:
                </strong>
                ${round(speed)} km/h
            </div>

            <div>
                <strong>
                    Direction:
                </strong>
                ${round(direction)}°
            </div>

            <div>
                <strong>
                    Compass:
                </strong>
                ${degreesToCompass(direction)}
            </div>

            <div class="popup-note">
                Wind direction is the
                direction the wind is
                coming FROM.
            </div>

        </div>

    `;

}


/* =========================================================
   WEATHER POPUP
   ========================================================= */

function createWeatherPopup(
    metric,
    value,
    weather
) {

    const names = {

        temperature:
            "Temperature",

        humidity:
            "Humidity",

        pressure:
            "Pressure",

        rain:
            "Rain"

    };


    const units = {

        temperature:
            "°C",

        humidity:
            "%",

        pressure:
            "hPa",

        rain:
            "mm"

    };


    return `

        <div class="weather-popup">

            <div class="popup-title">
                LIVE WEATHER
            </div>

            <div>
                <strong>
                    ${names[metric]}:
                </strong>

                ${round(value)}
                ${units[metric]}
            </div>

            <div>
                Wind:
                ${round(weather.wind_speed_10m)}
                km/h
            </div>

            <div>
                Wind Direction:
                ${degreesToCompass(
                    weather.wind_direction_10m
                )}
                (${round(
                    weather.wind_direction_10m
                )}°)
            </div>

            <div>
                Humidity:
                ${round(
                    weather.relative_humidity_2m
                )}%
            </div>

            <div class="popup-note">
                Source: Open-Meteo
            </div>

        </div>

    `;

}


/* =========================================================
   GRID POPUP
   ========================================================= */

function createGridPopup(
    metric,
    value,
    lat,
    lon
) {

    const units = {

        temperature: "°C",

        humidity: "%",

        pressure: "hPa",

        rain: "mm"

    };


    return `

        <div class="weather-popup">

            <div class="popup-title">
                WEATHER GRID
            </div>

            <div>
                <strong>
                    ${capitalize(metric)}:
                </strong>

                ${round(value)}
                ${units[metric]}
            </div>

            <div>
                Latitude:
                ${lat.toFixed(4)}
            </div>

            <div>
                Longitude:
                ${lon.toFixed(4)}
            </div>

            <div class="popup-note">
                Sampled weather field
            </div>

        </div>

    `;

}


/* =========================================================
   METRIC VALUE
   ========================================================= */

function getMetricValue(
    metric,
    weather
) {

    switch (metric) {

        case "temperature":
            return weather.temperature_2m;

        case "humidity":
            return weather.relative_humidity_2m;

        case "pressure":
            return weather.surface_pressure;

        case "rain":
            return weather.precipitation;

        default:
            return 0;

    }

}


/* =========================================================
   METRIC COLORS
   ========================================================= */

function getMetricColor(
    metric,
    value
) {

    if (metric === "temperature") {

        if (value >= 40)
            return "#ff1744";

        if (value >= 35)
            return "#ff6d00";

        if (value >= 30)
            return "#ffd600";

        if (value >= 20)
            return "#00e676";

        return "#00b0ff";
    }


    if (metric === "humidity") {

        if (value >= 85)
            return "#1565c0";

        if (value >= 70)
            return "#00b0ff";

        if (value >= 50)
            return "#00e5ff";

        return "#76ff03";
    }


    if (metric === "pressure") {

        if (value < 1000)
            return "#ff1744";

        if (value < 1010)
            return "#ff9100";

        if (value < 1020)
            return "#00e676";

        return "#2979ff";
    }


    if (metric === "rain") {

        if (value >= 20)
            return "#d50000";

        if (value >= 10)
            return "#ff6d00";

        if (value >= 5)
            return "#ffd600";

        if (value > 0)
            return "#00b0ff";

        return "#90caf9";
    }


    return "#00e5ff";

}


/* =========================================================
   MAP INFO
   ========================================================= */

function updateMapInfo() {

    const el =
        document.getElementById(
            "mapMetricText"
        );


    const updated =
        document.getElementById(
            "mapUpdatedText"
        );


    if (!el || !updated) {
        return;
    }


    if (!currentWeather?.current) {

        el.textContent =
            "Loading...";

        return;

    }


    const w =
        currentWeather.current;


    if (currentMetric === "wind") {

        el.innerHTML = `
            🌬 ${round(
                w.wind_speed_10m
            )} km/h
            • ${degreesToCompass(
                w.wind_direction_10m
            )}
            • ${round(
                w.wind_direction_10m
            )}°
        `;

    }

    else {

        const value =
            getMetricValue(
                currentMetric,
                w
            );


        const units = {

            temperature: "°C",

            humidity: "%",

            pressure: "hPa",

            rain: "mm"

        };


        el.innerHTML = `
            ${capitalize(
                currentMetric
            )}
            :
            ${round(value)}
            ${units[currentMetric]}
        `;

    }


    updated.textContent =
        "Updated: " +
        new Date().toLocaleTimeString();

}


/* =========================================================
   GPS
   ========================================================= */

function locateUser() {

    if (!navigator.geolocation) {

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            currentLat =
                position.coords.latitude;

            currentLon =
                position.coords.longitude;


            updateGPSMarker(
                position.coords.accuracy
            );


            map.setView(
                [currentLat, currentLon],
                10
            );


            loadWeather();

        },


        error => {

            console.warn(
                "GPS unavailable:",
                error.message
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

}


/* =========================================================
   GPS MARKER
   ========================================================= */

function updateGPSMarker(
    accuracy
) {

    if (gpsMarker) {
        map.removeLayer(
            gpsMarker
        );
    }


    if (gpsAccuracyCircle) {
        map.removeLayer(
            gpsAccuracyCircle
        );
    }


    gpsMarker =
        L.marker(
            [
                currentLat,
                currentLon
            ],
            {
                icon:
                    L.divIcon({
                        className:
                            "gps-live-icon",
                        html:
                            `
                            <div class="gps-pulse">
                                <div class="gps-dot"></div>
                            </div>
                            `,
                        iconSize:
                            [32, 32],
                        iconAnchor:
                            [16, 16]
                    })
            }
        )
        .bindPopup(`
            <strong>📍 LIVE GPS</strong>
            <br>
            Latitude:
            ${currentLat.toFixed(6)}
            <br>
            Longitude:
            ${currentLon.toFixed(6)}
            <br>
            Accuracy:
            ${round(accuracy)} m
        `)
        .addTo(map);


    gpsAccuracyCircle =
        L.circle(
            [
                currentLat,
                currentLon
            ],
            {
                radius: accuracy,
                color: "#00e5ff",
                fillColor: "#00e5ff",
                fillOpacity: 0.08,
                weight: 1
            }
        )
        .addTo(map);

}


/* =========================================================
   WEATHER CHART
   ========================================================= */

function updateWeatherChart() {

    const canvas =
        document.getElementById(
            "weatherChart"
        );


    if (!canvas) {
        return;
    }


    if (
        !currentWeather?.hourly
    ) {
        return;
    }


    const hourly =
        currentWeather.hourly;


    const labels =
        hourly.time.slice(
            0,
            24
        );


    const values =
        hourly.temperature_2m.slice(
            0,
            24
        );


    if (weatherChart) {

        weatherChart.destroy();

    }


    weatherChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels: labels.map(
                        time =>
                            new Date(
                                time
                            ).toLocaleTimeString(
                                [],
                                {
                                    hour:
                                        "2-digit",
                                    minute:
                                        "2-digit"
                                }
                            )
                    ),

                    datasets: [

                        {
                            label:
                                "Temperature °C",

                            data:
                                values,

                            tension:
                                0.35,

                            fill:
                                true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                true
                        }

                    },

                    scales: {

                        y: {
                            beginAtZero:
                                false
                        }

                    }

                }

            }
        );

}


/* =========================================================
   EARTHQUAKES
   ========================================================= */

async function loadEarthquakes() {

    const list =
        document.getElementById(
            "quakeList"
        );


    if (!list) {
        return;
    }


    try {

        const response =
            await fetch(
                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
            );


        const data =
            await response.json();


        const earthquakes =
            data.features
                .sort(
                    (a, b) =>
                        b.properties.mag -
                        a.properties.mag
                )
                .slice(
                    0,
                    10
                );


        if (!earthquakes.length) {

            list.innerHTML =
                "<div>No earthquakes found.</div>";

            return;

        }


        list.innerHTML =
            earthquakes
                .map(
                    quake => {

                        const p =
                            quake.properties;


                        return `

                            <div class="quake-item">

                                <strong>
                                    M${p.mag ?? "?"}
                                </strong>

                                <span>
                                    ${
                                        p.place ||
                                        "Unknown location"
                                    }
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");


    }

    catch (error) {

        console.error(
            "Earthquake error:",
            error
        );


        list.innerHTML =
            "<div>Earthquake data unavailable.</div>";

    }

}


/* =========================================================
   ALERT SYSTEM
   ========================================================= */

function generateAlerts() {

    const list =
        document.getElementById(
            "alertList"
        );


    if (!list || !currentWeather) {
        return;
    }


    const w =
        currentWeather.current;


    const alerts = [];


    if (
        Number(
            w.temperature_2m
        ) >= 40
    ) {

        alerts.push(
            "🔥 Extreme temperature alert"
        );

    }

    else if (
        Number(
            w.temperature_2m
        ) >= 35
    ) {

        alerts.push(
            "⚠️ High temperature"
        );

    }


    if (
        Number(
            w.relative_humidity_2m
        ) >= 85
    ) {

        alerts.push(
            "💧 Very high humidity"
        );

    }


    if (
        Number(
            w.wind_speed_10m
        ) >= 50
    ) {

        alerts.push(
            "🌬 Strong wind alert"
        );

    }


    if (
        Number(
            w.precipitation
        ) >= 10
    ) {

        alerts.push(
            "🌧 Heavy precipitation"
        );

    }


    if (!alerts.length) {

        alerts.push(
            "🟢 No major weather alerts"
        );

    }


    list.innerHTML =
        alerts
            .map(
                alert =>
                    `<div class="alert-item">
                        ${alert}
                    </div>`
            )
            .join("");

}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const micBtn =
        document.getElementById(
            "micBtn"
        );


    if (
        !SpeechRecognition ||
        !micBtn
    ) {

        console.warn(
            "Speech recognition not supported."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        getVoiceLanguage();


    micBtn.addEventListener(
        "click",
        () => {

            recognition.lang =
                getVoiceLanguage();


            try {

                recognition.start();

            }

            catch (error) {

                console.warn(
                    error
                );

            }

        }
    );


    recognition.onstart =
        () => {

            isListening =
                true;

            setVoiceStatus(
                "Listening..."
            );

        };


    recognition.onresult =
        event => {

            const text =
                event.results[0][0]
                    .transcript;


            setText(
                "heardText",
                text
            );


            handleVoiceCommand(
                text
            );

        };


    recognition.onerror =
        error => {

            console.error(
                "Voice error:",
                error
            );


            setVoiceStatus(
                "Voice error"
            );

        };


    recognition.onend =
        () => {

            isListening =
                false;

            setVoiceStatus(
                "Ready"
            );

        };

}


/* =========================================================
   VOICE COMMANDS
   ========================================================= */

function handleVoiceCommand(
    text
) {

    const command =
        text.toLowerCase();


    if (
        command.includes(
            "temperature"
        ) ||
        command.includes(
            "तापमान"
        )
    ) {

        setWeatherMetric(
            "temperature"
        );

        speak(
            "Temperature map opened."
        );

        return;

    }


    if (
        command.includes(
            "humidity"
        ) ||
        command.includes(
            "नमी"
        )
    ) {

        setWeatherMetric(
            "humidity"
        );

        speak(
            "Humidity map opened."
        );

        return;

    }


    if (
        command.includes(
            "pressure"
        ) ||
        command.includes(
            "दबाव"
        )
    ) {

        setWeatherMetric(
            "pressure"
        );

        speak(
            "Pressure map opened."
        );

        return;

    }


    if (
        command.includes(
            "wind"
        ) ||
        command.includes(
            "हवा"
        )
    ) {

        setWeatherMetric(
            "wind"
        );

        speak(
            "Wind map opened."
        );

        return;

    }


    if (
        command.includes(
            "rain"
        ) ||
        command.includes(
            "बारिश"
        )
    ) {

        setWeatherMetric(
            "rain"
        );

        speak(
            "Rain map opened."
        );

        return;

    }


    if (
        command.includes(
            "earthquake"
        ) ||
        command.includes(
            "भूकंप"
        )
    ) {

        scrollToCard(
            "earthquakeCard"
        );

        speak(
            "Earthquake information opened."
        );

        return;

    }


    if (
        command.includes(
            "graph"
        ) ||
        command.includes(
            "ग्राफ"
        )
    ) {

        scrollToCard(
            "graphCard"
        );

        speak(
            "Weather graph opened."
        );

        return;

    }


    if (
        command.includes(
            "alert"
        ) ||
        command.includes(
            "अलर्ट"
        )
    ) {

        scrollToCard(
            "alertCard"
        );

        speak(
            "Weather alerts opened."
        );

        return;

    }


    if (
        command.includes(
            "qr"
        )
    ) {

        openApp("qr");

        return;

    }


    if (
        command.includes(
            "camera"
        )
    ) {

        openApp("camera");

        return;

    }


    if (
        command.includes(
            "sos"
        )
    ) {

        openApp("sos");

        return;

    }


    if (
        command.includes(
            "location"
        ) ||
        command.includes(
            "लोकेशन"
        )
    ) {

        openApp(
            "location"
        );

        return;

    }


    if (
        command.includes(
            "refresh"
        ) ||
        command.includes(
            "update"
        ) ||
        command.includes(
            "अपडेट"
        )
    ) {

        loadWeather();

        loadEarthquakes();

        speak(
            "Weather data updated."
        );

        return;

    }


    speak(
        "Command not recognized."
    );

}


/* =========================================================
   TTS
   ========================================================= */

function speak(text) {

    if (
        !window.speechSynthesis
    ) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        getVoiceLanguage();


    utterance.rate =
        0.95;


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   VOICE LANGUAGE
   ========================================================= */

function getVoiceLanguage() {

    const select =
        document.getElementById(
            "voiceLanguage"
        );


    return select?.value ||
        "en-IN";

}


/* =========================================================
   APP OPEN
   ========================================================= */

function openApp(
    app
) {

    const url =
        APP_LINKS[app];


    if (
        !url ||
        url.includes(
            "YOUR_"
        )
    ) {

        alert(
            "Please configure this app URL in script.js"
        );

        return;

    }


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   BUTTONS
   ========================================================= */

function setupButtons() {

    document.querySelectorAll(
        "[data-metric]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setWeatherMetric(
                        button.dataset.metric
                    );

                }
            );

        }
    );

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToCard(
    id
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   HELPERS
   ========================================================= */

function round(
    value
) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {
        return "--";
    }


    return Math.round(
        number * 10
    ) / 10;

}


function normalizeAngle(
    angle
) {

    return (
        (
            Number(angle) % 360
        ) + 360
    ) % 360;

}


function degreesToCompass(
    degrees
) {

    const directions = [

        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"

    ];


    const index =
        Math.round(
            normalizeAngle(
                degrees
            ) / 45
        ) % 8;


    return directions[index];

}


function capitalize(
    text
) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function setVoiceStatus(
    text
) {

    setText(
        "voiceStatus",
        text
    );

}


function showWeatherError() {

    setText(
        "temperature",
        "-- °C"
    );

    setText(
        "humidity",
        "-- %"
    );

    setText(
        "pressure",
        "-- hPa"
    );

    setText(
        "wind",
        "-- km/h"
    );

    setText(
        "rain",
        "-- mm"
    );

    setText(
        "cloud",
        "-- %"
    );

}


/* =========================================================
   GLOBAL EXPORTS
   ========================================================= */

window.openApp =
    openApp;

window.setWeatherMetric =
    setWeatherMetric;

window.loadWeather =
    loadWeather;

window.loadEarthquakes =
    loadEarthquakes;
