/* =========================================================
   CBRND ENVIRONMENT COMMAND CENTER
   REAL WEATHER MAP ENGINE V3
   MAP ONLY UPGRADE
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

let searchMarker = null;

let weatherChart = null;

let isListening = false;


/* =========================================================
   MAP STATE
   ========================================================= */

let streetLayer;
let topoLayer;
let satelliteLayer;

let mapWeatherCache = null;

let mapGridLoading = false;

let mapRefreshTimer = null;

let mapMoveTimer = null;

let mapSearchControl = null;


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

    setInterval(
        loadWeather,
        5 * 60 * 1000
    );

    setInterval(
        loadEarthquakes,
        2 * 60 * 1000
    );

    /*
     * Map grid refresh every 5 minutes.
     */
    mapRefreshTimer = setInterval(
        loadMapWeatherGrid,
        5 * 60 * 1000
    );

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


    /* =====================================================
       STREET
       ===================================================== */

    streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }
    );


    /* =====================================================
       TOPO
       ===================================================== */

    topoLayer = L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 17,
            attribution: "&copy; OpenTopoMap"
        }
    );


    /* =====================================================
       SATELLITE
       ===================================================== */

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

    addMapSearchControl();

    addFindLocationControl();

    addMapLegend();

    addMapInfoPanel();


    /*
     * When map moves, reload actual weather samples
     * for the visible map area.
     */

    map.on(
        "moveend",
        () => {

            clearTimeout(
                mapMoveTimer
            );

            mapMoveTimer =
                setTimeout(
                    () => {

                        loadMapWeatherGrid();

                    },
                    900
                );

        }
    );


    map.on(
        "zoomend",
        () => {

            clearTimeout(
                mapMoveTimer
            );

            mapMoveTimer =
                setTimeout(
                    () => {

                        loadMapWeatherGrid();

                    },
                    500
                );

        }
    );

}


/* =========================================================
   MAP STYLE CONTROL
   ========================================================= */

function addMapStyleControl() {

    const control =
        L.control({
            position: "topright"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-control-box"
                );


            div.innerHTML = `

                <div class="map-control-title">
                    MAP STYLE
                </div>

                <button
                    class="map-style-btn active"
                    data-map="street">
                    🗺 Street
                </button>

                <button
                    class="map-style-btn"
                    data-map="topo">
                    ⛰ Topo
                </button>

                <button
                    class="map-style-btn"
                    data-map="satellite">
                    🛰 Satellite
                </button>

            `;


            L.DomEvent.disableClickPropagation(
                div
            );


            div.querySelectorAll(
                ".map-style-btn"
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const type =
                                button.dataset.map;

                            setMapStyle(
                                type
                            );


                            div.querySelectorAll(
                                ".map-style-btn"
                            ).forEach(
                                btn => {

                                    btn.classList.remove(
                                        "active"
                                    );

                                }
                            );


                            button.classList.add(
                                "active"
                            );

                        }
                    );

                }
            );


            return div;

        };


    control.addTo(map);

}


/* =========================================================
   MAP STYLE
   ========================================================= */

function setMapStyle(type) {

    if (
        streetLayer &&
        map.hasLayer(streetLayer)
    ) {
        map.removeLayer(
            streetLayer
        );
    }


    if (
        topoLayer &&
        map.hasLayer(topoLayer)
    ) {
        map.removeLayer(
            topoLayer
        );
    }


    if (
        satelliteLayer &&
        map.hasLayer(satelliteLayer)
    ) {
        map.removeLayer(
            satelliteLayer
        );
    }


    if (type === "topo") {

        topoLayer.addTo(
            map
        );

    }

    else if (
        type === "satellite"
    ) {

        satelliteLayer.addTo(
            map
        );

    }

    else {

        streetLayer.addTo(
            map
        );

    }

}


/* =========================================================
   WEATHER METRIC CONTROL
   ========================================================= */

function addWeatherMetricControl() {

    const control =
        L.control({
            position: "topright"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-control-box weather-control"
                );


            div.innerHTML = `

                <div class="map-control-title">
                    LIVE WEATHER
                </div>

                <button
                    class="weather-metric-btn active"
                    data-metric="temperature">
                    🌡 Temperature
                </button>

                <button
                    class="weather-metric-btn"
                    data-metric="humidity">
                    💧 Humidity
                </button>

                <button
                    class="weather-metric-btn"
                    data-metric="pressure">
                    🧭 Pressure
                </button>

                <button
                    class="weather-metric-btn"
                    data-metric="wind">
                    🌬 Wind
                </button>

                <button
                    class="weather-metric-btn"
                    data-metric="rain">
                    🌧 Rain
                </button>

                <button
                    class="weather-metric-btn"
                    data-metric="cloud">
                    ☁️ Cloud
                </button>

            `;


            L.DomEvent.disableClickPropagation(
                div
            );


            div.querySelectorAll(
                ".weather-metric-btn"
            ).forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const metric =
                                button.dataset.metric;


                            setWeatherMetric(
                                metric
                            );


                            div.querySelectorAll(
                                ".weather-metric-btn"
                            ).forEach(
                                btn => {

                                    btn.classList.remove(
                                        "active"
                                    );

                                }
                            );


                            button.classList.add(
                                "active"
                            );

                        }
                    );

                }
            );


            return div;

        };


    control.addTo(map);

}


/* =========================================================
   MAP SEARCH CONTROL
   ========================================================= */

function addMapSearchControl() {

    const control =
        L.control({
            position: "topleft"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-search-control"
                );


            div.innerHTML = `

                <div class="map-search-row">

                    <input
                        id="mapSearchInput"
                        type="text"
                        placeholder="Search city / place..."
                        autocomplete="off"
                    >

                    <button
                        id="mapSearchBtn"
                        title="Search">
                        🔎
                    </button>

                </div>

                <div
                    id="mapSearchStatus"
                    class="map-search-status">
                    Ready
                </div>

                <div
                    id="mapSearchResults"
                    class="map-search-results">
                </div>

            `;


            L.DomEvent.disableClickPropagation(
                div
            );


            const input =
                div.querySelector(
                    "#mapSearchInput"
                );


            const button =
                div.querySelector(
                    "#mapSearchBtn"
                );


            button.addEventListener(
                "click",
                () => {

                    searchMapLocation();

                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        searchMapLocation();

                    }

                }
            );


            return div;

        };


    control.addTo(map);

    mapSearchControl =
        control;

}


/* =========================================================
   SEARCH LOCATION
   ========================================================= */

async function searchMapLocation() {

    const input =
        document.getElementById(
            "mapSearchInput"
        );


    const status =
        document.getElementById(
            "mapSearchStatus"
        );


    const resultsBox =
        document.getElementById(
            "mapSearchResults"
        );


    if (
        !input ||
        !status
    ) {
        return;
    }


    const query =
        input.value.trim();


    if (!query) {

        status.textContent =
            "Enter a city or place";

        return;

    }


    status.textContent =
        "Searching...";


    if (resultsBox) {
        resultsBox.innerHTML = "";
    }


    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            "?format=jsonv2" +
            "&limit=5" +
            "&addressdetails=1" +
            "&q=" +
            encodeURIComponent(
                query
            );


        const response =
            await fetch(
                url,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                "Search service unavailable"
            );

        }


        const results =
            await response.json();


        if (
            !results.length
        ) {

            status.textContent =
                "No location found";

            return;

        }


        status.textContent =
            `${results.length} result(s)`;


        if (resultsBox) {

            resultsBox.innerHTML =
                results
                    .map(
                        (item, index) => `

                            <button
                                class="map-search-result"
                                data-index="${index}">

                                <strong>
                                    ${
                                        item.display_name
                                    }
                                </strong>

                            </button>

                        `
                    )
                    .join("");


            resultsBox
                .querySelectorAll(
                    ".map-search-result"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                const item =
                                    results[
                                        Number(
                                            button.dataset.index
                                        )
                                    ];

                                selectSearchLocation(
                                    item
                                );

                            }
                        );

                    }
                );

        }

        else {

            selectSearchLocation(
                results[0]
            );

        }


    }

    catch (error) {

        console.error(
            "Map search error:",
            error
        );


        status.textContent =
            "Search failed";

    }

}


/* =========================================================
   SELECT SEARCH LOCATION
   ========================================================= */

function selectSearchLocation(
    item
) {

    const lat =
        Number(
            item.lat
        );


    const lon =
        Number(
            item.lon
        );


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {
        return;
    }


    currentLat =
        lat;

    currentLon =
        lon;


    if (searchMarker) {

        map.removeLayer(
            searchMarker
        );

    }


    searchMarker =
        L.marker(
            [
                lat,
                lon
            ]
        )
        .bindPopup(`
            <div class="weather-popup">

                <div class="popup-title">
                    🔎 SEARCH LOCATION
                </div>

                <div>
                    ${
                        item.display_name
                    }
                </div>

                <div>
                    Latitude:
                    ${lat.toFixed(5)}
                </div>

                <div>
                    Longitude:
                    ${lon.toFixed(5)}
                </div>

            </div>
        `)
        .addTo(map);


    searchMarker.openPopup();


    map.setView(
        [
            lat,
            lon
        ],
        10,
        {
            animate: true
        }
    );


    const resultsBox =
        document.getElementById(
            "mapSearchResults"
        );


    if (resultsBox) {
        resultsBox.innerHTML = "";
    }


    const status =
        document.getElementById(
            "mapSearchStatus"
        );


    if (status) {

        status.textContent =
            "Location selected";

    }


    /*
     * Load actual weather for searched location.
     */

    loadWeather();

    loadMapWeatherGrid();

}


/* =========================================================
   FIND MY LOCATION CONTROL
   ========================================================= */

function addFindLocationControl() {

    const control =
        L.control({
            position: "topleft"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-location-control"
                );


            div.innerHTML = `

                <button
                    id="findMyLocationBtn"
                    title="Find my location">
                    📍 Find My Location
                </button>

            `;


            L.DomEvent.disableClickPropagation(
                div
            );


            div.querySelector(
                "#findMyLocationBtn"
            ).addEventListener(
                "click",
                () => {

                    locateUser(
                        true
                    );

                }
            );


            return div;

        };


    control.addTo(map);

}


/* =========================================================
   MAP LEGEND
   ========================================================= */

function addMapLegend() {

    const control =
        L.control({
            position: "bottomright"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-weather-legend"
                );


            div.id =
                "mapWeatherLegend";


            updateMapLegendElement(
                div
            );


            return div;

        };


    control.addTo(map);

}


/* =========================================================
   UPDATE LEGEND
   ========================================================= */

function updateMapLegendElement(
    div
) {

    if (!div) {

        div =
            document.getElementById(
                "mapWeatherLegend"
            );

    }


    if (!div) {
        return;
    }


    const legends = {

        temperature: `
            <b>🌡 Temperature</b>
            <div class="legend-gradient temp-gradient"></div>
            <div class="legend-labels">
                <span>Cold</span>
                <span>Hot</span>
            </div>
        `,

        humidity: `
            <b>💧 Humidity</b>
            <div class="legend-gradient humidity-gradient"></div>
            <div class="legend-labels">
                <span>Dry</span>
                <span>Humid</span>
            </div>
        `,

        pressure: `
            <b>🧭 Pressure</b>
            <div class="legend-gradient pressure-gradient"></div>
            <div class="legend-labels">
                <span>Low</span>
                <span>High</span>
            </div>
        `,

        rain: `
            <b>🌧 Rain</b>
            <div class="legend-gradient rain-gradient"></div>
            <div class="legend-labels">
                <span>Low</span>
                <span>Heavy</span>
            </div>
        `,

        cloud: `
            <b>☁️ Cloud Cover</b>
            <div class="legend-gradient cloud-gradient"></div>
            <div class="legend-labels">
                <span>Clear</span>
                <span>Cloudy</span>
            </div>
        `,

        wind: `
            <b>🌬 Wind</b>
            <div class="legend-wind">
                ➤ Actual direction
            </div>
            <div class="legend-labels">
                <span>Slow</span>
                <span>Fast</span>
            </div>
        `

    };


    div.innerHTML =
        legends[
            currentMetric
        ] ||
        legends.temperature;

}


/* =========================================================
   MAP INFORMATION PANEL
   ========================================================= */

function addMapInfoPanel() {

    const control =
        L.control({
            position: "bottomleft"
        });


    control.onAdd =
        function () {

            const div =
                L.DomUtil.create(
                    "div",
                    "map-live-info"
                );


            div.id =
                "mapLiveInfo";


            div.innerHTML = `

                <div>
                    <strong>
                        LIVE DATA
                    </strong>
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

function setWeatherMetric(
    metric
) {

    currentMetric =
        metric;


    clearWeatherLayers();


    updateMapLegendElement();


    if (!currentWeather) {
        return;
    }


    /*
     * Wind uses actual wind-grid data.
     */

    if (
        metric === "wind"
    ) {

        drawWindField();

    }

    else {

        /*
         * Draw cached actual grid if available.
         * Otherwise fetch it.
         */

        if (
            mapWeatherCache
        ) {

            drawWeatherField(
                metric,
                mapWeatherCache
            );

        }

        else {

            loadMapWeatherGrid();

        }

    }


    updateMapInfo();

}


/* =========================================================
   CLEAR WEATHER LAYERS
   ========================================================= */

function clearWeatherLayers() {

    if (
        weatherGridLayer
    ) {

        map.removeLayer(
            weatherGridLayer
        );

        weatherGridLayer =
            null;

    }


    if (
        windLayer
    ) {

        map.removeLayer(
            windLayer
        );

        windLayer =
            null;

    }

}


/* =========================================================
   OPEN METEO CURRENT WEATHER
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
            await fetch(
                url
            );


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
   MAP WEATHER GRID
   =========================================================
   Actual Open-Meteo values are requested for every
   visible grid point.

   No artificial value interpolation.
   ========================================================= */

async function loadMapWeatherGrid() {

    if (
        !map ||
        mapGridLoading
    ) {
        return;
    }


    mapGridLoading =
        true;


    updateMapLoadingStatus(
        true
    );


    try {

        const bounds =
            map.getBounds();


        const north =
            bounds.getNorth();


        const south =
            bounds.getSouth();


        const east =
            bounds.getEast();


        const west =
            bounds.getWest();


        /*
         * Keep the grid practical for the API.
         */

        const gridSize =
            map.getZoom() <= 5
                ? 6
                : map.getZoom() <= 8
                    ? 7
                    : 8;


        const points = [];


        for (
            let row = 0;
            row < gridSize;
            row++
        ) {

            const lat =
                south +
                (
                    (north - south) *
                    row /
                    (gridSize - 1)
                );


            for (
                let col = 0;
                col < gridSize;
                col++
            ) {

                const lon =
                    west +
                    (
                        (east - west) *
                        col /
                        (gridSize - 1)
                    );


                /*
                 * Avoid extreme polar coordinates.
                 */

                if (
                    lat < -85 ||
                    lat > 85
                ) {
                    continue;
                }


                points.push({
                    lat,
                    lon
                });

            }

        }


        if (!points.length) {
            return;
        }


        const latitudes =
            points
                .map(
                    p =>
                        p.lat.toFixed(4)
                )
                .join(",");


        const longitudes =
            points
                .map(
                    p =>
                        p.lon.toFixed(4)
                )
                .join(",");


        /*
         * Open-Meteo supports multiple coordinates
         * in a single request.
         */

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${latitudes}` +
            `&longitude=${longitudes}` +
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
            "&timezone=auto";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Map weather grid API error"
            );

        }


        const data =
            await response.json();


        /*
         * Multiple coordinate requests return
         * an array of weather objects.
         */

        let weatherPoints;


        if (
            Array.isArray(data)
        ) {

            weatherPoints =
                data;

        }

        else {

            weatherPoints =
                [data];

        }


        mapWeatherCache =
            weatherPoints.map(
                (weather, index) => {

                    return {

                        lat:
                            Number(
                                weather.latitude ??
                                points[index]?.lat
                            ),

                        lon:
                            Number(
                                weather.longitude ??
                                points[index]?.lon
                            ),

                        current:
                            weather.current ||
                            {}

                    };

                }
            );


        /*
         * Redraw current metric using actual values.
         */

        clearWeatherLayers();


        if (
            currentMetric === "wind"
        ) {

            drawWindField(
                mapWeatherCache
            );

        }

        else {

            drawWeatherField(
                currentMetric,
                mapWeatherCache
            );

        }


        updateMapInfo();


    }

    catch (error) {

        console.error(
            "Map grid error:",
            error
        );


        /*
         * Keep existing map functional even if
         * grid service temporarily fails.
         */

        if (
            currentWeather?.current
        ) {

            clearWeatherLayers();


            if (
                currentMetric === "wind"
            ) {

                drawWindField();

            }

            else {

                drawWeatherField(
                    currentMetric,
                    null
                );

            }

        }

    }

    finally {

        mapGridLoading =
            false;


        updateMapLoadingStatus(
            false
        );

    }

}


/* =========================================================
   MAP LOADING STATUS
   ========================================================= */

function updateMapLoadingStatus(
    loading
) {

    const status =
        document.getElementById(
            "mapSearchStatus"
        );


    if (!status) {
        return;
    }


    if (loading) {

        status.textContent =
            "Updating weather map...";

    }

    else if (
        !status.textContent ||
        status.textContent ===
            "Updating weather map..."
    ) {

        status.textContent =
            "Live map ready";

    }

}


/* =========================================================
   WEATHER CARDS
   ========================================================= */

function updateWeatherCards() {

    if (
        !currentWeather?.current
    ) {
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

function drawWeatherField(
    metric,
    points
) {

    if (
        !currentWeather?.current
    ) {
        return;
    }


    weatherGridLayer =
        L.layerGroup().addTo(
            map
        );


    /*
     * If actual map points are available,
     * use them.
     */

    if (
        Array.isArray(points) &&
        points.length
    ) {

        points.forEach(
            point => {

                const weather =
                    point.current ||
                    {};


                const value =
                    getMetricValue(
                        metric,
                        weather
                    );


                if (
                    !Number.isFinite(
                        Number(value)
                    )
                ) {
                    return;
                }


                const color =
                    getMetricColor(
                        metric,
                        Number(value)
                    );


                /*
                 * Determine approximate cell radius
                 * from current map dimensions.
                 */

                const radius =
                    getWeatherCellRadius();


                const circle =
                    L.circle(
                        [
                            point.lat,
                            point.lon
                        ],
                        {
                            radius:
                                radius,

                            color:
                                color,

                            fillColor:
                                color,

                            fillOpacity:
                                0.17,

                            opacity:
                                0.35,

                            weight:
                                1
                        }
                    );


                circle.bindPopup(
                    createGridWeatherPopup(
                        metric,
                        value,
                        point.lat,
                        point.lon,
                        weather
                    )
                );


                circle.addTo(
                    weatherGridLayer
                );

            }
        );


        /*
         * Add center current weather marker.
         */

        addCurrentWeatherMarker(
            metric
        );


        return;

    }


    /*
     * Fallback to actual current point only.
     * No fake values are generated.
     */

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


    L.circle(
        [
            currentLat,
            currentLon
        ],
        {
            radius: 25000,
            color: color,
            fillColor: color,
            fillOpacity: 0.15,
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
    .addTo(
        weatherGridLayer
    );

}


/* =========================================================
   WEATHER CELL RADIUS
   ========================================================= */

function getWeatherCellRadius() {

    if (!map) {
        return 25000;
    }


    const bounds =
        map.getBounds();


    const latSpan =
        Math.abs(
            bounds.getNorth() -
            bounds.getSouth()
        );


    const lonSpan =
        Math.abs(
            bounds.getEast() -
            bounds.getWest()
        );


    const span =
        Math.max(
            latSpan,
            lonSpan
        );


    /*
     * Convert visible degree span into
     * a sensible weather-cell radius.
     */

    const radius =
        span *
        111000 /
        14;


    return Math.max(
        1500,
        Math.min(
            80000,
            radius
        )
    );

}


/* =========================================================
   CURRENT WEATHER MARKER
   ========================================================= */

function addCurrentWeatherMarker(
    metric
) {

    if (
        !map ||
        !currentWeather?.current
    ) {
        return;
    }


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


    L.circleMarker(
        [
            currentLat,
            currentLon
        ],
        {
            radius: 8,
            color: "#ffffff",
            weight: 2,
            fillColor: color,
            fillOpacity: 1
        }
    )
    .bindPopup(
        createWeatherPopup(
            metric,
            value,
            w
        )
    )
    .addTo(
        weatherGridLayer
    );

}


/* =========================================================
   WEATHER GRID POPUP
   ========================================================= */

function createGridWeatherPopup(
    metric,
    value,
    lat,
    lon,
    weather
) {

    const units = {

        temperature: "°C",
        humidity: "%",
        pressure: "hPa",
        rain: "mm",
        cloud: "%"

    };


    const names = {

        temperature:
            "Temperature",

        humidity:
            "Humidity",

        pressure:
            "Pressure",

        rain:
            "Rain",

        cloud:
            "Cloud Cover"

    };


    return `

        <div class="weather-popup">

            <div class="popup-title">
                LIVE WEATHER GRID
            </div>

            <div>
                <strong>
                    ${names[metric] || metric}:
                </strong>

                ${round(value)}
                ${units[metric] || ""}
            </div>

            <hr>

            <div>
                🌡 Temperature:
                ${round(weather.temperature_2m)}
                °C
            </div>

            <div>
                💧 Humidity:
                ${round(weather.relative_humidity_2m)}
                %
            </div>

            <div>
                🧭 Pressure:
                ${round(weather.surface_pressure)}
                hPa
            </div>

            <div>
                🌬 Wind:
                ${round(weather.wind_speed_10m)}
                km/h
            </div>

            <div>
                🧭 Direction:
                ${degreesToCompass(
                    weather.wind_direction_10m
                )}
                ${
                    round(
                        weather.wind_direction_10m
                    )
                }°
            </div>

            <div>
                🌧 Rain:
                ${round(weather.precipitation)}
                mm
            </div>

            <div>
                ☁️ Cloud:
                ${round(weather.cloud_cover)}
                %
            </div>

            <div class="popup-note">
                Open-Meteo live weather-model sample
                <br>
                ${lat.toFixed(4)},
                ${lon.toFixed(4)}
            </div>

        </div>

    `;

}


/* =========================================================
   WIND FIELD
   ========================================================= */

function drawWindField(
    points
) {

    if (
        !currentWeather?.current
    ) {
        return;
    }


    windLayer =
        L.layerGroup().addTo(
            map
        );


    /*
     * Actual grid wind data.
     */

    if (
        Array.isArray(points) &&
        points.length
    ) {

        points.forEach(
            point => {

                const w =
                    point.current ||
                    {};


                const speed =
                    Number(
                        w.wind_speed_10m
                    );


                const direction =
                    Number(
                        w.wind_direction_10m
                    );


                if (
                    !Number.isFinite(speed) ||
                    !Number.isFinite(direction)
                ) {
                    return;
                }


                const marker =
                    createWindMarker(
                        point.lat,
                        point.lon,
                        speed,
                        direction,
                        false
                    );


                marker.bindPopup(
                    createWindPopup(
                        speed,
                        direction
                    )
                );


                marker.addTo(
                    windLayer
                );

            }
        );


        return;

    }


    /*
     * Fallback actual center wind.
     */

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


    createWindMarker(
        currentLat,
        currentLon,
        speed,
        direction,
        true
    )
    .bindPopup(
        createWindPopup(
            speed,
            direction
        )
    )
    .addTo(
        windLayer
    );

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
     * Meteorological direction tells us
     * where wind comes FROM.
     *
     * Arrow visually points toward
     * where wind is moving.
     */

    const movementDirection =
        normalizeAngle(
            direction + 180
        );


    const size =
        main
            ? 44
            : 34;


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
        [
            lat,
            lon
        ],
        {
            icon:
                L.divIcon({
                    className:
                        "wind-div-icon",

                    html:
                        html,

                    iconSize:
                        [size, size],

                    iconAnchor:
                        [
                            size / 2,
                            size / 2
                        ]
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
                Arrow shows approximate
                movement direction.
                <br>
                Source: Open-Meteo
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
            "Rain",

        cloud:
            "Cloud Cover"

    };


    const units = {

        temperature:
            "°C",

        humidity:
            "%",

        pressure:
            "hPa",

        rain:
            "mm",

        cloud:
            "%"

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
                ${round(
                    weather.wind_speed_10m
                )}
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

            <div>
                Cloud:
                ${round(
                    weather.cloud_cover
                )}%
            </div>

            <div class="popup-note">
                Source: Open-Meteo
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

    if (!weather) {
        return null;
    }


    switch (metric) {

        case "temperature":
            return weather.temperature_2m;

        case "humidity":
            return weather.relative_humidity_2m;

        case "pressure":
            return weather.surface_pressure;

        case "rain":
            return weather.precipitation;

        case "cloud":
            return weather.cloud_cover;

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

    value =
        Number(value);


    if (
        !Number.isFinite(value)
    ) {
        return "#00e5ff";
    }


    if (
        metric === "temperature"
    ) {

        if (value >= 40)
            return "#ff1744";

        if (value >= 35)
            return "#ff6d00";

        if (value >= 30)
            return "#ffd600";

        if (value >= 20)
            return "#00e676";

        if (value >= 10)
            return "#00b0ff";

        return "#2962ff";

    }


    if (
        metric === "humidity"
    ) {

        if (value >= 85)
            return "#1565c0";

        if (value >= 70)
            return "#00b0ff";

        if (value >= 50)
            return "#00e5ff";

        return "#76ff03";

    }


    if (
        metric === "pressure"
    ) {

        if (value < 1000)
            return "#ff1744";

        if (value < 1010)
            return "#ff9100";

        if (value < 1020)
            return "#00e676";

        return "#2979ff";

    }


    if (
        metric === "rain"
    ) {

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


    if (
        metric === "cloud"
    ) {

        if (value >= 90)
            return "#455a64";

        if (value >= 70)
            return "#607d8b";

        if (value >= 50)
            return "#90a4ae";

        if (value >= 25)
            return "#cfd8dc";

        return "#e3f2fd";

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


    if (
        !el ||
        !updated
    ) {
        return;
    }


    if (
        !currentWeather?.current
    ) {

        el.textContent =
            "Loading...";

        return;

    }


    const w =
        currentWeather.current;


    if (
        currentMetric === "wind"
    ) {

        el.innerHTML = `

            🌬
            ${round(
                w.wind_speed_10m
            )}
            km/h

            •
            ${degreesToCompass(
                w.wind_direction_10m
            )}

            •
            ${round(
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

            temperature:
                "°C",

            humidity:
                "%",

            pressure:
                "hPa",

            rain:
                "mm",

            cloud:
                "%"

        };


        el.innerHTML = `

            ${metricDisplayName(
                currentMetric
            )}

            :

            ${round(value)}

            ${units[currentMetric] || ""}

        `;

    }


    updated.textContent =
        "Updated: " +
        new Date()
            .toLocaleTimeString();

}


/* =========================================================
   GPS
   ========================================================= */

function locateUser(
    centerMap = false
) {

    if (
        !navigator.geolocation
    ) {

        console.warn(
            "Geolocation not supported."
        );

        return;

    }


    const status =
        document.getElementById(
            "mapSearchStatus"
        );


    if (status) {

        status.textContent =
            "Getting GPS location...";

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


            if (
                centerMap
            ) {

                map.setView(
                    [
                        currentLat,
                        currentLon
                    ],
                    11,
                    {
                        animate: true
                    }
                );

            }


            loadWeather();

            loadMapWeatherGrid();


            if (status) {

                status.textContent =
                    "GPS location found";

            }

        },


        error => {

            console.warn(
                "GPS unavailable:",
                error.message
            );


            if (status) {

                status.textContent =
                    "GPS unavailable";

            }

        },


        {
            enableHighAccuracy:
                true,

            timeout:
                10000,

            maximumAge:
                300000

        }

    );

}


/* =========================================================
   GPS MARKER
   ========================================================= */

function updateGPSMarker(
    accuracy
) {

    if (
        gpsMarker
    ) {

        map.removeLayer(
            gpsMarker
        );

    }


    if (
        gpsAccuracyCircle
    ) {

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

            <strong>
                📍 LIVE GPS
            </strong>

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
                radius:
                    accuracy,

                color:
                    "#00e5ff",

                fillColor:
                    "#00e5ff",

                fillOpacity:
                    0.08,

                weight:
                    1
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


    if (
        weatherChart
    ) {

        weatherChart.destroy();

    }


    weatherChart =
        new Chart(
            canvas,
            {
                type:
                    "line",

                data: {

                    labels:
                        labels.map(
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

                    responsive:
                        true,

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


        if (
            !earthquakes.length
        ) {

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


    if (
        !list ||
        !currentWeather
    ) {
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


    if (
        !alerts.length
    ) {

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


    /*
     * Map-only cloud command.
     */

    if (
        command.includes(
            "cloud"
        ) ||
        command.includes(
            "बादल"
        )
    ) {

        setWeatherMetric(
            "cloud"
        );

        speak(
            "Cloud cover map opened."
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

        openApp(
            "qr"
        );

        return;

    }


    if (
        command.includes(
            "camera"
        )
    ) {

        openApp(
            "camera"
        );

        return;

    }


    if (
        command.includes(
            "sos"
        )
    ) {

        openApp(
            "sos"
        );

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

        loadMapWeatherGrid();

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

function speak(
    text
) {

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
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.scrollIntoView({
        behavior:
            "smooth",

        block:
            "center"
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


/* =========================================================
   ANGLE
   ========================================================= */

function normalizeAngle(
    angle
) {

    return (
        (
            Number(angle) %
            360
        ) +
        360
    ) % 360;

}


/* =========================================================
   COMPASS
   ========================================================= */

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
            ) /
            45
        ) %
        8;


    return directions[index];

}


/* =========================================================
   METRIC NAME
   ========================================================= */

function metricDisplayName(
    metric
) {

    const names = {

        temperature:
            "Temperature",

        humidity:
            "Humidity",

        pressure:
            "Pressure",

        wind:
            "Wind",

        rain:
            "Rain",

        cloud:
            "Cloud Cover"

    };


    return (
        names[metric] ||
        capitalize(metric)
    );

}


/* =========================================================
   CAPITALIZE
   ========================================================= */

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


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   VOICE STATUS
   ========================================================= */

function setVoiceStatus(
    text
) {

    setText(
        "voiceStatus",
        text
    );

}


/* =========================================================
   WEATHER ERROR
   ========================================================= */

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

window.locateUser =
    locateUser;

window.searchMapLocation =
    searchMapLocation;
