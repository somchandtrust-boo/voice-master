/* =========================================================
   CBRND REAL COMMAND CENTER V2
   FINAL SCRIPT.JS
   =========================================================
   Features:
   • Voice Control
   • Hindi + English Commands
   • GPS
   • Live Map
   • Weather
   • Earthquake Monitor
   • Siren
   • Alert
   • QR Generator
   • Smart Camera
   • SOS Siren
   • Location Tracker
   • CUSTOM COMPASS LINK
   • AI Voice Assistant
   • Instagram
   • Facebook
   • WhatsApp
   • Command History
   • TTS
   • Report / CSV
   ========================================================= */


/* =========================================================
   APP LINKS
   ========================================================= */

const APP_LINKS = {

    qr:
        "https://somchandtrust-boo.github.io/CBRND-QR",

    camera:
        "https://somchandtrust-boo.github.io/hd-smart-camera/",

    sos:
        "YOUR_SOS_SIREN_URL",

    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html",

    /*
       =====================================================
       PUT YOUR OWN COMPASS LINK HERE
       Example:

       compass:
           "https://somchandtrust-boo.github.io/CBRND-COMPASS/",

       =====================================================
    */

    compass:
        "https://somchandtrust-boo.github.io/My-Compass/",

    ai:
        "https://aivoice.wecon.group/"

};


/* =========================================================
   SOCIAL LINKS
   ========================================================= */

const SOCIAL_LINKS = {

    instagram:
        "https://www.instagram.com/",

    facebook:
        "https://www.facebook.com/",

    whatsapp:
        "https://web.whatsapp.com/"

};


/* =========================================================
   DEFAULT LOCATION
   ========================================================= */

let currentLat = 23.0225;
let currentLon = 72.5714;


/* =========================================================
   MAP VARIABLES
   ========================================================= */

let map = null;

let userMarker = null;

let accuracyCircle = null;

let currentBaseLayer = null;

let weatherOverlayCircle = null;

let weatherOverlayCircle2 = null;

let weatherValueMarker = null;

let weatherDirectionLine = null;


/* =========================================================
   WEATHER VARIABLES
   ========================================================= */

let currentWeather = null;

let selectedWeatherMetric =
    "temperature";

let weatherChart = null;


/* =========================================================
   VOICE VARIABLES
   ========================================================= */

let recognition = null;

let isListening = false;


/* =========================================================
   SIREN VARIABLES
   ========================================================= */

let audioContext = null;

let sirenOscillator = null;

let sirenGain = null;

let sirenTimer = null;

let sirenRunning = false;


/* =========================================================
   ALERT
   ========================================================= */

let alertActive = false;


/* =========================================================
   REPORT
   ========================================================= */

let lastReport = null;


/* =========================================================
   DOM HELPER
   ========================================================= */

function el(id) {

    return document.getElementById(id);

}


/* =========================================================
   SAFE TEXT
   ========================================================= */

function safeText(id, value) {

    const element = el(id);

    if (element) {

        element.textContent = value;

    }

}


/* =========================================================
   SAFE HTML
   ========================================================= */

function safeHTML(id, value) {

    const element = el(id);

    if (element) {

        element.innerHTML = value;

    }

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupChotiAlexaIdentity();

        console.log(
            "Choti Alexa Command Center starting..."
        );


        initMap();

        initVoice();

        setupButtons();

        renderHistory();

        getUserLocation();

        loadWeather();

        loadEarthquakes();

        updateGPSStatus(
            "WAITING"
        );

        updateRadiation();

        updateAirQuality();

        startAutoRefresh();


        console.log(
            "CBRND Command Center V2 READY"
        );

    }
);


/* =========================================================
   MAP BASE LAYERS
   ========================================================= */

const baseLayers = {

    street:

        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"

            }
        ),


    topo:

        L.tileLayer(
            "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
            {

                maxZoom: 17,

                attribution:
                    "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap"

            }
        ),


    satellite:

        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {

                maxZoom: 19,

                attribution:
                    "Tiles &copy; Esri"

            }
        )

};


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap() {

    const mapElement =
        el("map");


    if (!mapElement) {

        console.warn(
            "Map element not found."
        );

        return;

    }


    if (
        typeof L ===
        "undefined"
    ) {

        console.error(
            "Leaflet library not loaded."
        );

        return;

    }


    map =
        L.map(
            "map",
            {

                zoomControl:
                    true,

                attributionControl:
                    true

            }
        )
        .setView(

            [
                currentLat,
                currentLon
            ],

            10

        );


    currentBaseLayer =
        baseLayers.street;


    currentBaseLayer.addTo(
        map
    );


    userMarker =
        L.marker(

            [
                currentLat,
                currentLon
            ]

        )
        .addTo(map)
        .bindPopup(
            "<b>CBRND Monitoring Location</b><br>Ahmedabad"
        );


    addMapStyleControl();

    addWeatherMetricControl();


    setTimeout(
        function () {

            if (map) {

                map.invalidateSize();

            }

        },

        500
    );

}


/* =========================================================
   OPEN MAP
   ========================================================= */

function openMap() {

    if (!map) {

        initMap();

    }


    const mapCard =
        el("mapCard");


    if (mapCard) {

        mapCard.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });

    }


    setTimeout(
        function () {

            if (map) {

                map.invalidateSize();


                map.setView(

                    [
                        currentLat,
                        currentLon
                    ],

                    11

                );

            }

        },

        500
    );


    addHistory(
        "MAP",
        "Live map opened"
    );


    speak(
        "Live map opened."
    );

}


/* =========================================================
   MAP STYLE CONTROL
   ========================================================= */

function addMapStyleControl() {

    if (!map) {

        return;

    }


    const MapStyleControl =
        L.Control.extend({

            options: {

                position:
                    "topright"

            },


            onAdd:
                function () {

                    const container =
                        L.DomUtil.create(
                            "div",
                            "map-control-box"
                        );


                    container.innerHTML = `

                        <div class="map-control-title">
                            🗺️ MAP STYLE
                        </div>

                        <select id="mapStyleSelect">

                            <option value="street">
                                Street Map
                            </option>

                            <option value="topo">
                                Topographic
                            </option>

                            <option value="satellite">
                                Satellite
                            </option>

                        </select>

                    `;


                    L.DomEvent.disableClickPropagation(
                        container
                    );


                    return container;

                }

        });


    map.addControl(
        new MapStyleControl()
    );


    setTimeout(
        function () {

            const select =
                el("mapStyleSelect");


            if (select) {

                select.addEventListener(
                    "change",
                    function () {

                        setMapStyle(
                            select.value
                        );

                    }
                );

            }

        },

        200
    );

}


/* =========================================================
   SET MAP STYLE
   ========================================================= */

function setMapStyle(style) {

    if (!map) {

        return;

    }


    if (!baseLayers[style]) {

        return;

    }


    if (currentBaseLayer) {

        try {

            map.removeLayer(
                currentBaseLayer
            );

        }

        catch (error) {

            console.warn(
                error
            );

        }

    }


    currentBaseLayer =
        baseLayers[style];


    currentBaseLayer.addTo(
        map
    );


    updateWeatherMapOverlay();

}


/* =========================================================
   WEATHER METRIC CONTROL
   ========================================================= */

function addWeatherMetricControl() {

    if (!map) {

        return;

    }


    const WeatherMetricControl =
        L.Control.extend({

            options: {

                position:
                    "bottomright"

            },


            onAdd:
                function () {

                    const container =
                        L.DomUtil.create(
                            "div",
                            "map-control-box"
                        );


                    container.innerHTML = `

                        <div class="map-control-title">
                            🌡️ WEATHER LAYER
                        </div>

                        <select id="weatherMetricSelect">

                            <option value="temperature">
                                Temperature
                            </option>

                            <option value="humidity">
                                Humidity
                            </option>

                            <option value="pressure">
                                Pressure
                            </option>

                            <option value="wind">
                                Wind
                            </option>

                            <option value="rain">
                                Rain
                            </option>

                        </select>

                        <div
                            class="map-live-value"
                            id="mapLiveValue"
                        >
                            Loading...
                        </div>

                    `;


                    L.DomEvent.disableClickPropagation(
                        container
                    );


                    return container;

                }

        });


    map.addControl(
        new WeatherMetricControl()
    );


    setTimeout(
        function () {

            const select =
                el("weatherMetricSelect");


            if (select) {

                select.addEventListener(
                    "change",
                    function () {

                        selectedWeatherMetric =
                            select.value;


                        updateWeatherMapOverlay();

                    }
                );

            }

        },

        200
    );

}


/* =========================================================
   WEATHER METRIC
   ========================================================= */

function setWeatherMetric(metric) {

    const allowed = [

        "temperature",
        "humidity",
        "pressure",
        "wind",
        "rain"

    ];


    if (
        !allowed.includes(metric)
    ) {

        return;

    }


    selectedWeatherMetric =
        metric;


    const select =
        el("weatherMetricSelect");


    if (select) {

        select.value =
            metric;

    }


    updateWeatherMapOverlay();


    focusSection(
        "mapCard"
    );


    addHistory(
        "WEATHER LAYER",
        metric.toUpperCase()
    );

}


/* =========================================================
   WEATHER MAP OVERLAY
   ========================================================= */

function updateWeatherMapOverlay() {

    if (
        !map ||
        !currentWeather
    ) {

        return;

    }


    removeWeatherOverlay();


    let label = "";

    let value = "";

    let unit = "";


    switch (
        selectedWeatherMetric
    ) {

        case "temperature":

            label =
                "TEMPERATURE";

            value =
                Number(
                    currentWeather.temperature
                ).toFixed(1);

            unit =
                "°C";

            break;


        case "humidity":

            label =
                "HUMIDITY";

            value =
                Number(
                    currentWeather.humidity
                ).toFixed(0);

            unit =
                "%";

            break;


        case "pressure":

            label =
                "PRESSURE";

            value =
                Number(
                    currentWeather.pressure
                ).toFixed(0);

            unit =
                "hPa";

            break;


        case "wind":

            label =
                "WIND";

            value =
                Number(
                    currentWeather.wind
                ).toFixed(1);

            unit =
                "km/h";

            break;


        case "rain":

            label =
                "RAIN";

            value =
                Number(
                    currentWeather.rain
                ).toFixed(1);

            unit =
                "mm";

            break;

    }


    weatherOverlayCircle =
        L.circle(

            [
                currentLat,
                currentLon
            ],

            {

                radius:
                    25000,

                color:
                    "#00d9ff",

                weight:
                    1,

                opacity:
                    0.45,

                fillColor:
                    "#00d9ff",

                fillOpacity:
                    0.035

            }

        ).addTo(map);


    weatherOverlayCircle2 =
        L.circle(

            [
                currentLat,
                currentLon
            ],

            {

                radius:
                    10000,

                color:
                    "#42ddff",

                weight:
                    2,

                opacity:
                    0.55,

                fillColor:
                    "#42ddff",

                fillOpacity:
                    0.055

            }

        ).addTo(map);


    const icon =
        L.divIcon({

            className:
                "weather-overlay-marker",

            html: `

                <div class="weather-value-bubble weather-pulse">

                    <small>
                        ${label}
                    </small>

                    <strong>
                        ${value} ${unit}
                    </strong>

                </div>

            `,

            iconSize:
                [
                    120,
                    65
                ],

            iconAnchor:
                [
                    60,
                    32
                ]

        });


    weatherValueMarker =
        L.marker(

            [
                currentLat,
                currentLon
            ],

            {

                icon:
                    icon,

                interactive:
                    false

            }

        ).addTo(map);


    if (

        selectedWeatherMetric ===
        "wind"

        &&

        currentWeather.windDirection !==
        null

    ) {

        drawWindDirection(
            currentWeather.windDirection
        );

    }


    const liveValue =
        el("mapLiveValue");


    if (liveValue) {

        liveValue.innerHTML =
            `${label}: <b>${value} ${unit}</b>`;

    }

}


/* =========================================================
   REMOVE WEATHER OVERLAY
   ========================================================= */

function removeWeatherOverlay() {

    if (!map) {

        return;

    }


    const layers = [

        weatherOverlayCircle,
        weatherOverlayCircle2,
        weatherValueMarker,
        weatherDirectionLine

    ];


    layers.forEach(
        function (layer) {

            if (layer) {

                try {

                    map.removeLayer(
                        layer
                    );

                }

                catch (error) {

                    console.warn(
                        error
                    );

                }

            }

        }
    );


    weatherOverlayCircle =
        null;

    weatherOverlayCircle2 =
        null;

    weatherValueMarker =
        null;

    weatherDirectionLine =
        null;

}


/* =========================================================
   WIND DIRECTION
   ========================================================= */

function drawWindDirection(
    direction
) {

    if (!map) {

        return;

    }


    const distance =
        0.12;


    const angle =
        Number(direction) *
        Math.PI /
        180;


    const lat2 =
        currentLat +
        Math.cos(angle) *
        distance;


    const lon2 =
        currentLon +
        Math.sin(angle) *
        distance;


    weatherDirectionLine =
        L.polyline(

            [

                [
                    currentLat,
                    currentLon
                ],

                [
                    lat2,
                    lon2
                ]

            ],

            {

                color:
                    "#8bffdd",

                weight:
                    4,

                opacity:
                    0.8

            }

        ).addTo(map);

}


/* =========================================================
   LOAD WEATHER
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

                "precipitation",

                "cloud_cover"

            ].join(",") +

            "&timezone=auto" +

            "&forecast_days=2";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Weather API error " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data.current) {

            throw new Error(
                "Weather data unavailable"
            );

        }


        const c =
            data.current;


        currentWeather = {

            temperature:
                c.temperature_2m,

            humidity:
                c.relative_humidity_2m,

            pressure:
                c.surface_pressure,

            wind:
                c.wind_speed_10m,

            windDirection:
                c.wind_direction_10m,

            rain:
                c.precipitation,

            cloud:
                c.cloud_cover

        };


        updateWeatherCards();

        updateWeatherMapOverlay();

        updateWeatherChart(
            data.hourly
        );

        updateAlerts();

        updateEnvironmentMetrics();

    }

    catch (error) {

        console.error(
            "Weather Error:",
            error
        );


        safeText(
            "temperature",
            "-- °C"
        );

        safeText(
            "humidity",
            "-- %"
        );

        safeText(
            "pressure",
            "-- hPa"
        );

        safeText(
            "wind",
            "-- km/h"
        );

        safeText(
            "rain",
            "-- mm"
        );

        safeText(
            "cloud",
            "-- %"
        );

    }

}


/* =========================================================
   WEATHER CARDS
   ========================================================= */

function updateWeatherCards() {

    if (!currentWeather) {

        return;

    }


    safeText(

        "temperature",

        `${Number(
            currentWeather.temperature
        ).toFixed(1)} °C`

    );


    safeText(

        "humidity",

        `${Number(
            currentWeather.humidity
        ).toFixed(0)} %`

    );


    safeText(

        "pressure",

        `${Number(
            currentWeather.pressure
        ).toFixed(0)} hPa`

    );


    safeText(

        "wind",

        `${Number(
            currentWeather.wind
        ).toFixed(1)} km/h`

    );


    safeText(

        "rain",

        `${Number(
            currentWeather.rain
        ).toFixed(1)} mm`

    );


    safeText(

        "cloud",

        `${Number(
            currentWeather.cloud
        ).toFixed(0)} %`

    );

}


/* =========================================================
   WEATHER CHART
   ========================================================= */

function updateWeatherChart(
    hourly
) {

    if (!hourly) {

        return;

    }


    const canvas =
        el("weatherChart");


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js not loaded."
        );

        return;

    }


    const times =
        hourly.time ||
        [];


    const temps =
        hourly.temperature_2m ||
        [];


    const labels =
        times
            .slice(
                0,
                24
            )
            .map(
                function (time) {

                    const date =
                        new Date(time);


                    return date.toLocaleTimeString(
                        [],
                        {

                            hour:
                                "2-digit",

                            minute:
                                "2-digit"

                        }
                    );

                }
            );


    const temperatures =
        temps.slice(
            0,
            24
        );


    if (weatherChart) {

        weatherChart.destroy();

        weatherChart =
            null;

    }


    weatherChart =
        new Chart(

            canvas.getContext(
                "2d"
            ),

            {

                type:
                    "line",


                data: {

                    labels:
                        labels,

                    datasets: [

                        {

                            label:
                                "Temperature °C",

                            data:
                                temperatures,

                            borderWidth:
                                2,

                            pointRadius:
                                2,

                            pointHoverRadius:
                                5,

                            tension:
                                0.35,

                            fill:
                                false

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },


                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#dffaff"

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#7095a3",

                                maxTicksLimit:
                                    12

                            },

                            grid: {

                                color:
                                    "rgba(100,220,255,.08)"

                            }

                        },


                        y: {

                            ticks: {

                                color:
                                    "#7095a3"

                            },

                            grid: {

                                color:
                                    "rgba(100,220,255,.08)"

                            }

                        }

                    }

                }

            }

        );

}


/* =========================================================
   WEATHER VOICE
   ========================================================= */

function speakWeather() {

    if (!currentWeather) {

        speak(
            "Weather data is still loading."
        );

        return;

    }


    const message =

        `Temperature ${Number(
            currentWeather.temperature
        ).toFixed(1)} degrees Celsius. ` +

        `Humidity ${Number(
            currentWeather.humidity
        ).toFixed(0)} percent. ` +

        `Pressure ${Number(
            currentWeather.pressure
        ).toFixed(0)} hectopascal. ` +

        `Wind ${Number(
            currentWeather.wind
        ).toFixed(1)} kilometers per hour. ` +

        `Rain ${Number(
            currentWeather.rain
        ).toFixed(1)} millimeters. ` +

        `Cloud cover ${Number(
            currentWeather.cloud
        ).toFixed(0)} percent.`;


    speak(
        message
    );

}


/* =========================================================
   ALERT
   ========================================================= */

function updateAlerts() {

    const alertList =
        el("alertList");


    if (
        !alertList ||
        !currentWeather
    ) {

        return;

    }


    const alerts = [];


    if (
        currentWeather.temperature >=
        40
    ) {

        alerts.push({

            type:
                "danger",

            text:
                `🔴 Extreme heat detected: ${Number(
                    currentWeather.temperature
                ).toFixed(1)} °C`

        });

    }

    else if (
        currentWeather.temperature >=
        35
    ) {

        alerts.push({

            type:
                "warning",

            text:
                `🟠 High temperature warning: ${Number(
                    currentWeather.temperature
                ).toFixed(1)} °C`

        });

    }


    if (
        currentWeather.humidity >=
        85
    ) {

        alerts.push({

            type:
                "warning",

            text:
                `🟠 High humidity: ${Number(
                    currentWeather.humidity
                ).toFixed(0)}%`

        });

    }


    if (
        currentWeather.wind >=
        50
    ) {

        alerts.push({

            type:
                "danger",

            text:
                `🔴 High wind speed: ${Number(
                    currentWeather.wind
                ).toFixed(1)} km/h`

        });

    }


    if (
        currentWeather.rain >=
        10
    ) {

        alerts.push({

            type:
                "warning",

            text:
                `🟠 Heavy precipitation: ${Number(
                    currentWeather.rain
                ).toFixed(1)} mm`

        });

    }


    if (
        alerts.length ===
        0
    ) {

        alertList.innerHTML = `

            <div class="alert success">

                🟢 Environment conditions normal.

                <br>

                Continuous monitoring active.

            </div>

        `;


        return;

    }


    alertList.innerHTML =

        alerts
            .map(
                function (alert) {

                    return `

                        <div class="alert ${alert.type}">

                            ${alert.text}

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   ACTIVATE ALERT
   ========================================================= */

function activateAlert() {

    alertActive =
        true;


    const alertCard =
        el("alertCard");


    if (alertCard) {

        alertCard.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });

    }


    addHistory(
        "ALERT",
        "Alert center activated"
    );


    speak(
        "Alert center activated."
    );


    updateAlerts();

}


/* =========================================================
   EARTHQUAKE
   ========================================================= */

async function loadEarthquakes() {

    const quakeList =
        el("quakeList");


    if (!quakeList) {

        return;

    }


    quakeList.innerHTML = `

        <div class="loading">

            Loading earthquake data...

        </div>

    `;


    try {

        const response =
            await fetch(

                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

            );


        if (!response.ok) {

            throw new Error(
                "Earthquake API error"
            );

        }


        const data =
            await response.json();


        let features =
            data.features ||
            [];


        features.sort(
            function (a, b) {

                return (

                    (b.properties.mag || 0)

                    -

                    (a.properties.mag || 0)

                );

            }
        );


        const top =
            features.slice(
                0,
                15
            );


        if (
            top.length ===
            0
        ) {

            quakeList.innerHTML = `

                <div class="alert success">

                    🟢 No earthquake records available.

                </div>

            `;

            return;

        }


        quakeList.innerHTML =

            top
                .map(
                    function (eq) {

                        const mag =
                            Number(
                                eq.properties.mag ||
                                0
                            );


                        const place =
                            eq.properties.place ||
                            "Unknown location";


                        const time =
                            eq.properties.time

                                ?

                                new Date(
                                    eq.properties.time
                                ).toLocaleString()

                                :

                                "Unknown time";


                        let level =
                            "";


                        if (
                            mag >=
                            6
                        ) {

                            level =
                                "danger";

                        }

                        else if (
                            mag >=
                            4
                        ) {

                            level =
                                "warning";

                        }


                        return `

                            <div class="quake-item">

                                <div class="
                                    quake-mag
                                    ${level}
                                ">

                                    M ${mag.toFixed(1)}

                                </div>


                                <div class="quake-info">

                                    <div class="quake-place">

                                        ${escapeHTML(
                                            place
                                        )}

                                    </div>


                                    <div class="quake-time">

                                        ${escapeHTML(
                                            time
                                        )}

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }

    catch (error) {

        console.error(
            "Earthquake Error:",
            error
        );


        quakeList.innerHTML = `

            <div class="alert danger">

                🔴 Unable to load earthquake data.

            </div>

        `;

    }

}


/* =========================================================
   GPS
   ========================================================= */

function getUserLocation() {

    if (
        !navigator.geolocation
    ) {

        updateGPSStatus(
            "NOT SUPPORTED"
        );

        return;

    }


    updateGPSStatus(
        "LOCATING..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            currentLat =
                position.coords.latitude;


            currentLon =
                position.coords.longitude;


            updateGPSStatus(
                "ACTIVE"
            );


            updateGPSMarker(
                position.coords.accuracy
            );


            if (map) {

                map.setView(

                    [
                        currentLat,
                        currentLon
                    ],

                    13

                );

            }


            loadWeather();


            addHistory(
                "GPS",
                `${currentLat.toFixed(6)}, ${currentLon.toFixed(6)}`
            );

        },


        function (error) {

            console.warn(
                "GPS unavailable:",
                error.message
            );


            updateGPSStatus(
                "FALLBACK"
            );


            currentLat =
                23.0225;


            currentLon =
                72.5714;


            if (map) {

                map.setView(

                    [
                        currentLat,
                        currentLon
                    ],

                    10

                );

            }

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                300000

        }

    );

}


/* =========================================================
   GPS BUTTON
   ========================================================= */

function getGPS() {

    if (
        !navigator.geolocation
    ) {

        speak(
            "GPS is not supported in this browser."
        );

        return;

    }


    updateGPSStatus(
        "LOCATING..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            currentLat =
                position.coords.latitude;


            currentLon =
                position.coords.longitude;


            updateGPSStatus(
                "ACTIVE"
            );


            updateGPSMarker(
                position.coords.accuracy
            );


            if (map) {

                map.setView(

                    [
                        currentLat,
                        currentLon
                    ],

                    15

                );

                map.invalidateSize();

            }


            loadWeather();


            addHistory(
                "GPS",
                "Current location found"
            );


            speak(
                "Your current location has been found."
            );

        },


        function (error) {

            updateGPSStatus(
                "ERROR"
            );


            speak(
                "Unable to get your GPS location."
            );


            console.warn(
                error
            );

        },


        {

            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                0

        }

    );

}


/* =========================================================
   GPS MARKER
   ========================================================= */

function updateGPSMarker(
    accuracy
) {

    if (!map) {

        return;

    }


    if (userMarker) {

        userMarker.setLatLng(

            [
                currentLat,
                currentLon
            ]

        );

    }

    else {

        userMarker =
            L.marker(

                [
                    currentLat,
                    currentLon
                ]

            )
            .addTo(map);

    }


    userMarker.bindPopup(`

        <b>📍 Current GPS Location</b>

        <br>

        Latitude:
        ${currentLat.toFixed(6)}

        <br>

        Longitude:
        ${currentLon.toFixed(6)}

    `);


    if (accuracy) {

        if (accuracyCircle) {

            map.removeLayer(
                accuracyCircle
            );

        }


        accuracyCircle =
            L.circle(

                [
                    currentLat,
                    currentLon
                ],

                {

                    radius:
                        accuracy,

                    color:
                        "#00d9ff",

                    fillColor:
                        "#00d9ff",

                    fillOpacity:
                        0.08,

                    weight:
                        1

                }

            ).addTo(map);

    }


    updateWeatherMapOverlay();

}


/* =========================================================
   GPS STATUS
   ========================================================= */

function updateGPSStatus(
    status
) {

    const gpsState =
        el("gpsState");


    if (!gpsState) {

        return;

    }


    gpsState.textContent =
        status;

}


/* =========================================================
   RADIATION
   ========================================================= */

function updateRadiation() {

    const radiation =
        el("radiation");


    if (!radiation) {

        return;

    }


    radiation.textContent =
        "N/A";

}


/* =========================================================
   AIR QUALITY
   ========================================================= */

function updateAirQuality() {

    const airQuality =
        el("airQuality");


    if (!airQuality) {

        return;

    }


    airQuality.textContent =
        "N/A";

}


/* =========================================================
   ENVIRONMENT METRICS
   ========================================================= */

function updateEnvironmentMetrics() {

    updateRadiation();

    updateAirQuality();

}


/* =========================================================
   VOICE INITIALIZATION
   ========================================================= */

function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const micBtn =
        el("mic");


    const voiceStatus =
        el("voiceStatus");


    const heardText =
        el("heardText");


    const voiceLanguage =
        el("voiceLanguage");


    if (!SpeechRecognition) {

        if (voiceStatus) {

            voiceStatus.textContent =
                "Voice recognition not supported.";

        }


        if (micBtn) {

            micBtn.disabled =
                true;

            micBtn.style.opacity =
                "0.45";

        }


        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        3;


    recognition.lang =
        voiceLanguage && voiceLanguage.value
            ? voiceLanguage.value
            : "hi-IN";


    if (voiceLanguage) {

        voiceLanguage.addEventListener(
            "change",
            function () {

                recognition.lang =
                    voiceLanguage.value;

            }
        );

    }


    if (micBtn) {

        micBtn.addEventListener(
            "click",
            toggleListening
        );

    }


    recognition.onstart =
        function () {

            isListening =
                true;


            if (micBtn) {

                micBtn.classList.add(
                    "listening"
                );

            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "🎙️ Listening...";

            }

        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results
                    [0]
                    [0]
                    .transcript
                    .trim();


            if (heardText) {

                heardText.textContent =
                    "You said: " +
                    transcript;

            }


            addHistory(
                "VOICE",
                transcript
            );


            processVoiceCommand(
                transcript
            );

        };


    recognition.onerror =
        function (event) {

            console.warn(
                "Voice error:",
                event.error
            );


            if (voiceStatus) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    voiceStatus.textContent =
                        "Microphone permission denied.";

                }

                else if (
                    event.error ===
                    "no-speech"
                ) {

                    voiceStatus.textContent =
                        "No speech detected.";

                }

                else {

                    voiceStatus.textContent =
                        "Voice error: " +
                        event.error;

                }

            }

        };


    recognition.onend =
        function () {

            isListening =
                false;


            if (micBtn) {

                micBtn.classList.remove(
                    "listening"
                );

            }


            if (

                voiceStatus &&

                voiceStatus.textContent ===
                "🎙️ Listening..."

            ) {

                voiceStatus.textContent =
                    "Voice control ready";

            }

        };

}


/* =========================================================
   TOGGLE LISTENING
   ========================================================= */

function toggleListening() {

    if (!recognition) {

        speak(
            "Voice recognition is not available."
        );

        return;

    }


    if (isListening) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                error
            );

        }

        return;

    }


    try {

        if (isListening) return;

        const language =
            el("voiceLanguage");


        recognition.lang =
            language && language.value
                ? language.value
                : "hi-IN";


        recognition.start();

    }

    catch (error) {

        console.warn(
            "Recognition start:",
            error
        );

    }

}


/* =========================================================
   VOICE COMMAND PROCESSOR
   ========================================================= */


/* =========================================================
   CHOTI ALEXA — IDENTITY + MOBILE
   ========================================================= */

const CHOTI_ALEXA_NAME = "Choti Alexa";

function getSavedMobile(){
    return localStorage.getItem("CHOTI_ALEXA_MOBILE") || "";
}

function setSavedMobile(value){
    const cleaned = String(value || "").replace(/[^\d+()\-\s]/g,"").trim();
    localStorage.setItem("CHOTI_ALEXA_MOBILE", cleaned);
    return cleaned;
}

function speakChotiAlexa(text){
    if (typeof speak === "function") {
        speak(text);
    }
}

function updateChotiAlexaMobileUI(){
    const input = document.getElementById("userMobile");
    const status = document.getElementById("mobileStatus");

    const number = getSavedMobile();

    if (input && number) {
        input.value = number;
    }

    if (status) {
        status.textContent = number
            ? "Mobile number saved. Ask: “Mera mobile number batao”"
            : "Say: “What is your name?” or “Mera mobile number batao”";
    }
}

function setupChotiAlexaIdentity(){
    const saveButton = document.getElementById("saveMobileBtn");
    const input = document.getElementById("userMobile");

    updateChotiAlexaMobileUI();

    if (saveButton && !saveButton.dataset.bound) {
        saveButton.dataset.bound = "true";

        saveButton.addEventListener("click", function(){
            const number = setSavedMobile(input ? input.value : "");

            const status = document.getElementById("mobileStatus");

            if (!number) {
                if (status) status.textContent = "Please enter your mobile number.";
                speakChotiAlexa("Please enter your mobile number.");
                return;
            }

            if (status) {
                status.textContent = "Mobile number saved successfully.";
            }

            if (typeof addHistory === "function") {
                addHistory("PROFILE", "Mobile number saved");
            }

            speakChotiAlexa("Your mobile number has been saved.");
        });
    }
}

function handleChotiAlexaCommand(command){
    const text = String(command || "")
        .toLowerCase()
        .replace(/[.,!?;:]/g," ")
        .replace(/\s+/g," ")
        .trim();

    const nameAsk =
        text.includes("what is your name") ||
        text.includes("what's your name") ||
        text.includes("your name") ||
        text.includes("who are you") ||
        text.includes("aapka naam") ||
        text.includes("aapka naam kya hai") ||
        text.includes("tumhara naam") ||
        text.includes("तुम्हारा नाम") ||
        text.includes("आपका नाम");

    if (nameAsk) {
        speakChotiAlexa("My name is Choti Alexa.");
        const status = document.getElementById("mobileStatus");
        if (status) status.textContent = "Assistant: Choti Alexa";
        return true;
    }

    const mobileAsk =
        text.includes("my mobile number") ||
        text.includes("my phone number") ||
        text.includes("mobile number") ||
        text.includes("phone number") ||
        text.includes("mera mobile") ||
        text.includes("mera number") ||
        text.includes("mera phone") ||
        text.includes("मेरा मोबाइल") ||
        text.includes("मेरा नंबर") ||
        text.includes("मोबाइल नंबर");

    if (mobileAsk) {
        const number = getSavedMobile();

        if (!number) {
            speakChotiAlexa("Your mobile number is not saved yet.");
            const status = document.getElementById("mobileStatus");
            if (status) status.textContent = "Mobile number not saved.";
        } else {
            speakChotiAlexa(
                "Your mobile number is " +
                number.split("").join(" ")
            );
            const status = document.getElementById("mobileStatus");
            if (status) status.textContent = "Mobile number requested.";
        }

        return true;
    }

    return false;
}

function processVoiceCommand(
    command
) {

    const text =
        String(command)
            .toLowerCase()
            .trim();


    console.log(
        "Voice Command:",
        text
    );

    if (handleChotiAlexaCommand(command)) {
        return;
    }


    /* =====================================================
       STOP EVERYTHING
       ===================================================== */

    if (

        text ===
        "stop"

        ||

        text.includes(
            "stop everything"
        )

        ||

        text.includes(
            "सब बंद करो"
        )

        ||

        text.includes(
            "सब कुछ बंद करो"
        )

        ||

        text.includes(
            "सब बंद"
        )

        ||

        text.includes(
            "रुको"
        )

        ||

        text.includes(
            "रोक दो"
        )

    ) {

        stopEverything();

        return;

    }


    /* =====================================================
       STOP SIREN
       ===================================================== */

    if (

        text.includes(
            "stop siren"
        )

        ||

        text.includes(
            "siren stop"
        )

        ||

        text.includes(
            "सायरन बंद"
        )

        ||

        text.includes(
            "सायरन बंद करो"
        )

        ||

        text.includes(
            "सायरन ऑफ"
        )

    ) {

        stopSiren();

        return;

    }


    /* =====================================================
       START SIREN
       ===================================================== */

    if (

        text.includes(
            "start siren"
        )

        ||

        text.includes(
            "siren start"
        )

        ||

        text.includes(
            "स्टार्ट सायरन"
        )

        ||

        text.includes(
            "सायरन स्टार्ट"
        )

        ||

        text.includes(
            "सायरन चालू"
        )

        ||

        text.includes(
            "सायरन चालु"
        )

        ||

        text.includes(
            "सायरन ऑन"
        )

        ||

        text.includes(
            "सायरन खोलो"
        )

        ||

        text.includes(
            "सायरन बजाओ"
        )

    ) {

        startSiren();

        return;

    }


    /* =====================================================
       ALERT
       ===================================================== */

    if (

        text.includes(
            "open alert"
        )

        ||

        text.includes(
            "alert"
        )

        ||

        text.includes(
            "alerts"
        )

        ||

        text.includes(
            "अलर्ट"
        )

        ||

        text.includes(
            "अलर्ट खोलो"
        )

        ||

        text.includes(
            "अलर्ट चालू करो"
        )

        ||

        text.includes(
            "चेतावनी"
        )

    ) {

        activateAlert();

        return;

    }


    /* =====================================================
       GPS
       ===================================================== */

    if (

        text.includes(
            "open gps"
        )

        ||

        text.includes(
            "gps kholo"
        )

        ||

        text.includes(
            "gps चालू"
        )

        ||

        text.includes(
            "gps चालू करो"
        )

        ||

        text.includes(
            "मेरी लोकेशन"
        )

        ||

        text.includes(
            "मेरी location"
        )

        ||

        text.includes(
            "location batao"
        )

    ) {

        getGPS();

        return;

    }


    /* =====================================================
       WEATHER
       ===================================================== */

    if (

        text.includes(
            "weather"
        )

        ||

        text.includes(
            "मौसम"
        )

        ||

        text.includes(
            "मौसम बताओ"
        )

        ||

        text.includes(
            "weather batao"
        )

    ) {

        focusSection(
            "weatherCard"
        );


        speakWeather();


        return;

    }


    /* =====================================================
       TEMPERATURE
       ===================================================== */

    if (

        text.includes(
            "temperature"
        )

        ||

        text.includes(
            "temp"
        )

        ||

        text.includes(
            "तापमान"
        )

        ||

        text.includes(
            "गर्मी"
        )

    ) {

        setWeatherMetric(
            "temperature"
        );


        speak(
            "Temperature map showing."
        );


        return;

    }


    /* =====================================================
       HUMIDITY
       ===================================================== */

    if (

        text.includes(
            "humidity"
        )

        ||

        text.includes(
            "नमी"
        )

        ||

        text.includes(
            "आर्द्रता"
        )

    ) {

        setWeatherMetric(
            "humidity"
        );


        speak(
            "Humidity map showing."
        );


        return;

    }


    /* =====================================================
       PRESSURE
       ===================================================== */

    if (

        text.includes(
            "pressure"
        )

        ||

        text.includes(
            "दबाव"
        )

        ||

        text.includes(
            "वायुदाब"
        )

    ) {

        setWeatherMetric(
            "pressure"
        );


        speak(
            "Pressure map showing."
        );


        return;

    }


    /* =====================================================
       WIND
       ===================================================== */

    if (

        text.includes(
            "wind"
        )

        ||

        text.includes(
            "हवा"
        )

        ||

        text.includes(
            "पवन"
        )

    ) {

        setWeatherMetric(
            "wind"
        );


        speak(
            "Wind map showing."
        );


        return;

    }


    /* =====================================================
       RAIN
       ===================================================== */

    if (

        text.includes(
            "rain"
        )

        ||

        text.includes(
            "बारिश"
        )

        ||

        text.includes(
            "वर्षा"
        )

        ||

        text.includes(
            "पानी"
        )

    ) {

        setWeatherMetric(
            "rain"
        );


        speak(
            "Rain map showing."
        );


        return;

    }


    /* =====================================================
       MAP
       ===================================================== */

    if (

        text.includes(
            "open map"
        )

        ||

        text.includes(
            "map kholo"
        )

        ||

        text.includes(
            "map दिखाओ"
        )

        ||

        text.includes(
            "मैप खोलो"
        )

        ||

        text.includes(
            "मानचित्र"
        )

        ||

        text.includes(
            "नक्शा"
        )

        ||

        text ===
        "map"

    ) {

        openMap();

        return;

    }


    /* =====================================================
       EARTHQUAKE
       ===================================================== */

    if (

        text.includes(
            "earthquake"
        )

        ||

        text.includes(
            "earth quake"
        )

        ||

        text.includes(
            "भूकंप"
        )

    ) {

        focusSection(
            "earthquakeCard"
        );


        loadEarthquakes();


        speak(
            "Live earthquake monitor opened."
        );


        return;

    }


    /* =====================================================
       GRAPH
       ===================================================== */

    if (

        text.includes(
            "graph"
        )

        ||

        text.includes(
            "chart"
        )

        ||

        text.includes(
            "ग्राफ"
        )

        ||

        text.includes(
            "चार्ट"
        )

    ) {

        focusSection(
            "graphCard"
        );


        speak(
            "Environment graph opened."
        );


        return;

    }


    /* =====================================================
       QR
       ===================================================== */

    if (

        text.includes(
            "qr"
        )

        ||

        text.includes(
            "qr generator"
        )

        ||

        text.includes(
            "क्यूआर"
        )

        ||

        text.includes(
            "क्यू आर"
        )

        ||

        text.includes(
            "क्यूआर खोलो"
        )

    ) {

        openApp(
            "qr"
        );

        return;

    }


    /* =====================================================
       CAMERA
       ===================================================== */

    if (

        text.includes(
            "camera"
        )

        ||

        text.includes(
            "smart camera"
        )

        ||

        text.includes(
            "कैमरा"
        )

        ||

        text.includes(
            "कैमरा खोलो"
        )

    ) {

        openApp(
            "camera"
        );

        return;

    }


    /* =====================================================
       SOS
       ===================================================== */

    if (

        text.includes(
            "sos"
        )

        ||

        text.includes(
            "sos siren"
        )

        ||

        text.includes(
            "एसओएस"
        )

        ||

        text.includes(
            "एस ओ एस"
        )

        ||

        text.includes(
            "sos खोलो"
        )

    ) {

        openApp(
            "sos"
        );

        return;

    }


    /* =====================================================
       LOCATION TRACKER
       ===================================================== */

    if (

        text.includes(
            "location tracker"
        )

        ||

        text.includes(
            "live location"
        )

        ||

        text.includes(
            "लोकेशन ट्रैकर"
        )

        ||

        text.includes(
            "लोकेशन ट्रैकर खोलो"
        )

        ||

        text.includes(
            "लाइव लोकेशन"
        )

    ) {

        openApp(
            "location"
        );

        return;

    }


    /* =====================================================
       COMPASS
       ===================================================== */

    if (

        text.includes(
            "compass"
        )

        ||

        text.includes(
            "open compass"
        )

        ||

        text.includes(
            "compass kholo"
        )

        ||

        text.includes(
            "कंपास"
        )

        ||

        text.includes(
            "कम्पास"
        )

        ||

        text.includes(
            "कंपास खोलो"
        )

        ||

        text.includes(
            "कम्पास खोलो"
        )

    ) {

        openCompass();

        return;

    }


    /* =====================================================
       AI VOICE ASSISTANT
       ===================================================== */

    if (

        text.includes(
            "ai voice assistant"
        )

        ||

        text.includes(
            "voice assistant"
        )

        ||

        text.includes(
            "ai assistant"
        )

        ||

        text.includes(
            "वॉइस असिस्टेंट"
        )

        ||

        text.includes(
            "एआई असिस्टेंट"
        )

        ||

        text.includes(
            "ai खोलो"
        )

    ) {

        openApp(
            "ai"
        );

        return;

    }


    /* =====================================================
       INSTAGRAM
       ===================================================== */

    if (

        text.includes(
            "instagram"
        )

        ||

        text.includes(
            "इंस्टाग्राम"
        )

        ||

        text.includes(
            "इंस्टाग्राम खोलो"
        )

    ) {

        openSocial(
            "instagram"
        );

        return;

    }


    /* =====================================================
       FACEBOOK
       ===================================================== */

    if (

        text.includes(
            "facebook"
        )

        ||

        text.includes(
            "फेसबुक"
        )

        ||

        text.includes(
            "फेसबुक खोलो"
        )

    ) {

        openSocial(
            "facebook"
        );

        return;

    }


    /* =====================================================
       WHATSAPP
       ===================================================== */

    if (

        text.includes(
            "whatsapp"
        )

        ||

        text.includes(
            "व्हाट्सएप"
        )

        ||

        text.includes(
            "व्हाट्सएप्प"
        )

        ||

        text.includes(
            "व्हाट्सएप खोलो"
        )

    ) {

        openSocial(
            "whatsapp"
        );

        return;

    }


    /* =====================================================
       REFRESH
       ===================================================== */

    if (

        text.includes(
            "refresh"
        )

        ||

        text.includes(
            "update"
        )

        ||

        text.includes(
            "अपडेट"
        )

        ||

        text.includes(
            "रीफ्रेश"
        )

        ||

        text.includes(
            "फिर से लोड"
        )

    ) {

        loadWeather();

        loadEarthquakes();


        speak(
            "Dashboard data updated."
        );


        return;

    }


    /* =====================================================
       STATUS
       ===================================================== */

    if (

        text.includes(
            "status"
        )

        ||

        text.includes(
            "स्टेटस"
        )

        ||

        text.includes(
            "स्थिति"
        )

    ) {

        const gpsElement =
            el("gpsState");


        const gps =
            gpsElement

                ?

                gpsElement.textContent

                :

                "UNKNOWN";


        speak(

            `Dashboard status. GPS is ${gps}. ` +

            `Siren is ${
                sirenRunning
                    ?
                    "running"
                    :
                    "stopped"
            }.`

        );


        return;

    }


    /* =====================================================
       HOME
       ===================================================== */

    if (

        text.includes(
            "home"
        )

        ||

        text.includes(
            "dashboard"
        )

        ||

        text.includes(
            "होम"
        )

        ||

        text.includes(
            "डैशबोर्ड"
        )

    ) {

        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

        });


        speak(
            "Dashboard opened."
        );


        return;

    }


    /* =====================================================
       UNKNOWN COMMAND
       ===================================================== */

    speak(
        "Command not recognized."
    );


    const voiceStatus =
        el("voiceStatus");


    if (voiceStatus) {

        voiceStatus.textContent =
            "Command not recognized";

    }

}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(
    text
) {

    if (
        !(
            "speechSynthesis"
            in
            window
        )
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    const voiceLanguage =
        el("voiceLanguage");


    const language =
        voiceLanguage

            ?

            voiceLanguage.value

            :

            "hi-IN";


    utterance.lang =
        language;


    utterance.rate =
        0.95;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   START SIREN
   ========================================================= */

function startSiren() {

    if (sirenRunning) {

        return;

    }


    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {

            alert(
                "Web Audio is not supported."
            );

            return;

        }


        if (!audioContext) {

            audioContext =
                new AudioContext();

        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        sirenOscillator =
            audioContext.createOscillator();


        sirenGain =
            audioContext.createGain();


        sirenOscillator.type =
            "sawtooth";


        sirenGain.gain.value =
            0.0001;


        sirenOscillator.connect(
            sirenGain
        );


        sirenGain.connect(
            audioContext.destination
        );


        sirenOscillator.start();


        sirenRunning =
            true;


        let high =
            false;


        sirenTimer =
            setInterval(
                function () {

                    if (
                        !sirenOscillator ||
                        !sirenGain
                    ) {

                        return;

                    }


                    high =
                        !high;


                    const frequency =
                        high
                            ?
                            900
                            :
                            500;


                    const now =
                        audioContext.currentTime;


                    sirenOscillator
                        .frequency
                        .setTargetAtTime(

                            frequency,

                            now,

                            0.04

                        );


                    sirenGain
                        .gain
                        .setTargetAtTime(

                            0.16,

                            now,

                            0.03

                        );

                },

                450

            );


        updateSirenUI(
            true
        );


        addHistory(
            "SIREN",
            "Siren started"
        );


        speak(
            "Siren started."
        );

    }

    catch (error) {

        console.error(
            "Siren error:",
            error
        );


        alert(
            "Siren could not start. Please click the Siren button once and try again."
        );

    }

}


/* =========================================================
   STOP SIREN
   ========================================================= */

function stopSiren() {

    if (sirenTimer) {

        clearInterval(
            sirenTimer
        );

        sirenTimer =
            null;

    }


    if (sirenOscillator) {

        try {

            sirenOscillator.stop();

        }

        catch (error) {

            console.warn(
                error
            );

        }


        sirenOscillator.disconnect();

        sirenOscillator =
            null;

    }


    if (sirenGain) {

        try {

            sirenGain.disconnect();

        }

        catch (error) {

            console.warn(
                error
            );

        }


        sirenGain =
            null;

    }


    sirenRunning =
        false;


    updateSirenUI(
        false
    );


    addHistory(
        "SIREN",
        "Siren stopped"
    );


    speak(
        "Siren stopped."
    );

}


/* =========================================================
   TOGGLE SIREN
   ========================================================= */

function toggleSiren() {

    if (sirenRunning) {

        stopSiren();

    }

    else {

        startSiren();

    }

}


/* =========================================================
   SIREN UI
   ========================================================= */

function updateSirenUI(
    running
) {

    const sirenButton =
        el("sirenBtn");


    if (sirenButton) {

        sirenButton.classList.toggle(
            "active",
            running
        );


        const text =
            sirenButton.querySelector(
                ".controlText"
            );


        if (text) {

            text.textContent =
                running

                    ?

                    "STOP SIREN"

                    :

                    "SIREN";

        }

    }


    const sirenState =
        el("sirenState");


    if (sirenState) {

        sirenState.textContent =
            running

                ?

                "ACTIVE"

                :

                "STANDBY";

    }

}


/* =========================================================
   STOP EVERYTHING
   ========================================================= */

function stopEverything() {

    stopSiren();


    alertActive =
        false;


    if (
        window.speechSynthesis
    ) {

        window.speechSynthesis.cancel();

    }


    if (
        recognition &&
        isListening
    ) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                error
            );

        }

    }


    addHistory(
        "SYSTEM",
        "All active functions stopped"
    );


    const voiceStatus =
        el("voiceStatus");


    if (voiceStatus) {

        voiceStatus.textContent =
            "System stopped";

    }


    speak(
        "All active functions stopped."
    );

}


/* =========================================================
   OPEN APP
   ========================================================= */

function openApp(
    app
) {

    const url =
        APP_LINKS[app];


    if (!url) {

        showModal(
            "APP LINK",
            "Application link is not configured."
        );


        return;

    }


    if (
        url.includes(
            "YOUR_"
        )
    ) {

        let title =
            "APP LINK";


        let message =
            "Application URL अभी configure नहीं किया गया है.";


        if (
            app ===
            "sos"
        ) {

            title =
                "SOS SIREN LINK";

            message =
                "SOS Siren URL अभी configure नहीं किया गया है.";

        }


        else if (
            app ===
            "ai"
        ) {

            title =
                "AI ASSISTANT LINK";

            message =
                "AI Voice Assistant URL अभी configure नहीं किया गया है.";

        }


        else if (
            app ===
            "compass"
        ) {

            title =
                "COMPASS LINK";

            message =
                "Compass URL अभी configure नहीं किया गया है.";

        }


        showModal(
            title,
            message
        );


        return;

    }


    addHistory(
        app.toUpperCase(),
        "Application opened"
    );


    const popup =
        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );


    if (!popup) {

        window.location.href =
            url;

        return;

    }


    const messages = {

        qr:
            "QR Generator is opening.",

        camera:
            "Smart Camera is opening.",

        sos:
            "SOS Siren is opening.",

        location:
            "Location Tracker is opening.",

        compass:
            "Compass is opening.",

        ai:
            "AI Voice Assistant is opening."

    };


    speak(
        messages[app] ||
        "Application is opening."
    );

}


/* =========================================================
   CUSTOM COMPASS
   ========================================================= */

function openCompass() {

    /*
       IMPORTANT:
       Compass now uses your own APP_LINKS.compass URL.
    */

    const url =
        APP_LINKS.compass;


    if (
        !url ||
        url.includes(
            "YOUR_COMPASS_URL"
        )
    ) {

        showModal(

            "COMPASS LINK",

            `

                Compass URL अभी configure नहीं किया गया है.

                <br><br>

                script.js में

                <br>

                <b>
                    APP_LINKS.compass
                </b>

                <br><br>

                में अपना Compass URL डालें.

            `

        );


        return;

    }


    addHistory(
        "COMPASS",
        "Custom Compass opened"
    );


    const popup =
        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );


    if (!popup) {

        window.location.href =
            url;

        return;

    }


    speak(
        "Your Compass is opening."
    );

}


/* =========================================================
   SOCIAL
   ========================================================= */

function openSocial(
    social
) {

    const url =
        SOCIAL_LINKS[social];


    if (!url) {

        return;

    }


    addHistory(
        social.toUpperCase(),
        "Social app opened"
    );


    const popup =
        window.open(

            url,

            "_blank",

            "noopener,noreferrer"

        );


    if (!popup) {

        window.location.href =
            url;

        return;

    }


    const messages = {

        instagram:
            "Instagram is opening.",

        facebook:
            "Facebook is opening.",

        whatsapp:
            "WhatsApp is opening."

    };


    speak(
        messages[social] ||
        "Application is opening."
    );

}


/* =========================================================
   SETUP BUTTONS
   ========================================================= */

function setupButtons() {

    const buttons = [

        [
            "mapBtn",
            openMap
        ],

        [
            "gpsBtn",
            getGPS
        ],

        [
            "alertBtn",
            activateAlert
        ],

        [
            "sirenBtn",
            toggleSiren
        ],

        [
            "stopBtn",
            stopEverything
        ],

        [
            "qrBtn",
            function () {

                openApp(
                    "qr"
                );

            }
        ],

        [
            "cameraBtn",
            function () {

                openApp(
                    "camera"
                );

            }
        ],

        [
            "sosBtn",
            function () {

                openApp(
                    "sos"
                );

            }
        ],

        [
            "locationBtn",
            function () {

                openApp(
                    "location"
                );

            }
        ],

        [
            "compassBtn",
            openCompass
        ],

        [
            "aiBtn",
            function () {

                openApp(
                    "ai"
                );

            }
        ],

        [
            "instagramBtn",
            function () {

                openSocial(
                    "instagram"
                );

            }
        ],

        [
            "facebookBtn",
            function () {

                openSocial(
                    "facebook"
                );

            }
        ],

        [
            "whatsappBtn",
            function () {

                openSocial(
                    "whatsapp"
                );

            }
        ]

    ];


    buttons.forEach(
        function (item) {

            const button =
                el(item[0]);


            if (
                button &&
                !button.dataset.bound &&
                !button.hasAttribute("onclick")
            ) {

                button.addEventListener(
                    "click",
                    item[1]
                );


                button.dataset.bound =
                    "true";

            }

        }
    );

}


/* =========================================================
   FOCUS SECTION
   ========================================================= */

function focusSection(
    id
) {

    const section =
        el(id);


    if (!section) {

        return;

    }


    section.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    setTimeout(
        function () {

            if (
                id ===
                "mapCard"
            ) {

                if (map) {

                    map.invalidateSize();

                }

            }

        },

        500
    );

}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    type,
    text
) {

    const historyKey =
        "CBRND_COMMAND_HISTORY";


    let history = [];


    try {

        history =
            JSON.parse(

                localStorage.getItem(
                    historyKey
                )

            ) || [];

    }

    catch (error) {

        history = [];

    }


    history.unshift({

        type:
            type,

        text:
            text,

        time:
            new Date().toLocaleString()

    });


    history =
        history.slice(
            0,
            50
        );


    try {

        localStorage.setItem(

            historyKey,

            JSON.stringify(
                history
            )

        );

    }

    catch (error) {

        console.warn(
            "History save error:",
            error
        );

    }


    renderHistory();

}


/* =========================================================
   RENDER HISTORY
   ========================================================= */

function renderHistory() {

    const historyContainer =
        el("commandHistory");


    if (!historyContainer) {

        return;

    }


    let history = [];


    try {

        history =
            JSON.parse(

                localStorage.getItem(
                    "CBRND_COMMAND_HISTORY"
                )

            ) || [];

    }

    catch (error) {

        history = [];

    }


    if (
        history.length ===
        0
    ) {

        historyContainer.innerHTML = `

            <div class="history-empty">

                No commands yet.

            </div>

        `;

        return;

    }


    historyContainer.innerHTML =

        history
            .slice(
                0,
                20
            )
            .map(
                function (item) {

                    return `

                        <div class="history-item">

                            <div class="history-type">

                                ${escapeHTML(
                                    item.type
                                )}

                            </div>


                            <div class="history-text">

                                ${escapeHTML(
                                    item.text
                                )}

                            </div>


                            <div class="history-time">

                                ${escapeHTML(
                                    item.time
                                )}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    try {

        localStorage.removeItem(
            "CBRND_COMMAND_HISTORY"
        );

    }

    catch (error) {

        console.warn(
            error
        );

    }


    renderHistory();


    speak(
        "Command history cleared."
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(
    title,
    text
) {

    const modal =
        el("modal");


    const modalTitle =
        el("modalTitle");


    const modalText =
        el("modalText");


    if (!modal) {

        alert(
            text
        );

        return;

    }


    if (modalTitle) {

        modalTitle.textContent =
            title;

    }


    if (modalText) {

        /*
           innerHTML intentionally used
           because modal messages contain
           line breaks / HTML.
        */

        modalText.innerHTML =
            text;

    }


    modal.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const modal =
        el("modal");


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (

            event.code ===
            "Space"

            &&

            document.activeElement.tagName !==
            "INPUT"

            &&

            document.activeElement.tagName !==
            "TEXTAREA"

            &&

            document.activeElement.tagName !==
            "SELECT"

        ) {

            event.preventDefault();

            toggleListening();

        }


        if (
            event.key ===
            "Escape"
        ) {

            stopEverything();

        }

    }
);


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            el("modal");


        if (

            modal &&

            event.target ===
            modal

        ) {

            closeModal();

        }

    }
);


/* =========================================================
   AUTO REFRESH
   ========================================================= */

function startAutoRefresh() {

    /*
       Weather:
       every 5 minutes
    */

    setInterval(
        function () {

            loadWeather();

        },

        5 * 60 * 1000
    );


    /*
       Earthquakes:
       every 2 minutes
    */

    setInterval(
        function () {

            loadEarthquakes();

        },

        2 * 60 * 1000
    );

}


/* =========================================================
   REPORT DATA
   ========================================================= */

function generateReportData() {

    const now =
        new Date();


    lastReport = {

        date:
            now.toLocaleString(),

        latitude:
            currentLat,

        longitude:
            currentLon,

        temperature:
            currentWeather
                ?

                currentWeather.temperature

                :

                null,

        humidity:
            currentWeather
                ?

                currentWeather.humidity

                :

                null,

        pressure:
            currentWeather
                ?

                currentWeather.pressure

                :

                null,

        wind:
            currentWeather
                ?

                currentWeather.wind

                :

                null,

        rain:
            currentWeather
                ?

                currentWeather.rain

                :

                null,

        cloud:
            currentWeather
                ?

                currentWeather.cloud

                :

                null

    };


    return lastReport;

}


/* =========================================================
   OPEN REPORT
   ========================================================= */

function openReport() {

    const report =
        generateReportData();


    const text = `

        CBRND ENVIRONMENT REPORT

        Date:
        ${report.date}

        GPS:
        ${report.latitude},
        ${report.longitude}

        Temperature:
        ${report.temperature ?? "N/A"} °C

        Humidity:
        ${report.humidity ?? "N/A"} %

        Pressure:
        ${report.pressure ?? "N/A"} hPa

        Wind:
        ${report.wind ?? "N/A"} km/h

        Rain:
        ${report.rain ?? "N/A"} mm

        Cloud:
        ${report.cloud ?? "N/A"} %

    `;


    showModal(

        "ENVIRONMENT REPORT",

        text.replace(
            /\n/g,
            "<br>"
        )

    );


    addHistory(
        "REPORT",
        "Environment report opened"
    );


    speak(
        "Environment report opened."
    );

}


/* =========================================================
   DOWNLOAD REPORT
   ========================================================= */

function downloadReport() {

    const report =
        generateReportData();


    const csv =

        "CBRND ENVIRONMENT REPORT\n\n" +

        "Date,Latitude,Longitude,Temperature °C,Humidity %,Pressure hPa,Wind km/h,Rain mm,Cloud %\n" +

        [

            report.date,

            report.latitude,

            report.longitude,

            report.temperature,

            report.humidity,

            report.pressure,

            report.wind,

            report.rain,

            report.cloud

        ]

        .map(
            function (value) {

                return `"${String(
                    value ?? ""
                ).replace(
                    /"/g,
                    '""'
                )}"`;

            }
        )

        .join(",");


    const blob =
        new Blob(

            [csv],

            {

                type:
                    "text/csv;charset=utf-8"

            }

        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "CBRND-Environment-Report.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    addHistory(
        "REPORT",
        "CSV report downloaded"
    );


    speak(
        "Report downloaded."
    );

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openMap =
    openMap;

window.getGPS =
    getGPS;

window.startSiren =
    startSiren;

window.stopSiren =
    stopSiren;

window.toggleSiren =
    toggleSiren;

window.activateAlert =
    activateAlert;

window.stopEverything =
    stopEverything;

window.openApp =
    openApp;

window.openCompass =
    openCompass;

window.openSocial =
    openSocial;

window.setWeatherMetric =
    setWeatherMetric;

window.loadWeather =
    loadWeather;

window.loadEarthquakes =
    loadEarthquakes;

window.toggleListening =
    toggleListening;

window.processVoiceCommand =
    processVoiceCommand;

window.speak =
    speak;

window.speakWeather =
    speakWeather;

window.clearHistory =
    clearHistory;

window.showModal =
    showModal;

window.closeModal =
    closeModal;

window.openReport =
    openReport;

window.downloadReport =
    downloadReport;


/* =========================================================
   FINAL STATUS
   ========================================================= */

console.log(
    "%c CBRND REAL COMMAND CENTER V2 ",
    "background:#06131f;color:#62eaff;font-size:16px;font-weight:bold;padding:10px;"
);

console.log(
    "Voice • GPS • Map • Weather • Siren • Alert • Apps • Compass • Social"
);

console.log(
    "Custom Compass Link:",
    APP_LINKS.compass
);


/* =========================================================
   END
   ========================================================= */

/* =========================================================
   CHOTI ALEXA FINAL SAFETY
   ========================================================= */

window.CHOTI_ALEXA_NAME = "Choti Alexa";

window.addEventListener("load", function(){
    try {
        setupChotiAlexaIdentity();
    } catch(error) {
        console.warn("Choti Alexa identity setup:", error);
    }

    const mic = document.getElementById("mic");
    if (mic) {
        mic.setAttribute("aria-label", "Choti Alexa voice command");
        mic.title = "Choti Alexa — Voice Command";
    }
});
