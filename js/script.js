/* =========================================================
   CBRND ENVIRONMENT COMMAND CENTER V2
   SCRIPT.JS
   ========================================================= */

/* =========================================================
   APP LINKS
   ========================================================= */

const APP_LINKS = {
    qr: "https://somchandtrust-boo.github.io/CBRND-QR",
    camera: "https://somchandtrust-boo.github.io/hd-smart-camera/",
    sos: "YOUR_SOS_SIREN_URL",
    location: "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html"
};


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let currentLat = 23.0225;
let currentLon = 72.5714;

let map = null;
let userMarker = null;
let weatherChart = null;

let currentBaseLayer = null;

let weatherOverlayCircle = null;
let weatherOverlayCircle2 = null;
let weatherValueMarker = null;
let weatherDirectionLine = null;

let currentWeather = null;
let selectedWeatherMetric = "temperature";

let recognition = null;
let isListening = false;


/* =========================================================
   BASE MAP LAYERS
   ========================================================= */

const baseLayers = {

    street: L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap contributors"
        }
    ),

    topo: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 17,
            attribution:
                "Map data &copy; OpenStreetMap contributors, SRTM | Map style &copy; OpenTopoMap"
        }
    ),

    satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
            maxZoom: 19,
            attribution: "Tiles &copy; Esri"
        }
    )
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

function el(id){
    return document.getElementById(id);
}

function safeText(id, value){
    const element = el(id);

    if(element){
        element.textContent = value;
    }
}


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMap();

    initVoice();

    getUserLocation();

    loadWeather();

    loadEarthquakes();

    setupQuickCommands();

    console.log(
        "CBRND Environment Command Center V2 initialized."
    );
});


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap(){

    const mapElement = el("map");

    if(!mapElement){

        console.error("Map element not found.");

        return;
    }

    map = L.map("map").setView(
        [currentLat, currentLon],
        10
    );

    currentBaseLayer = baseLayers.street;

    currentBaseLayer.addTo(map);

    userMarker = L.marker(
        [currentLat, currentLon]
    )
    .addTo(map)
    .bindPopup(
        "<b>CBRND Monitoring Location</b><br>Ahmedabad"
    )
    .openPopup();

    addMapStyleControl();

    addWeatherMetricControl();

    setTimeout(() => {

        map.invalidateSize();

    }, 300);
}


/* =========================================================
   MAP STYLE CONTROL
   ========================================================= */

function addMapStyleControl(){

    if(!map){
        return;
    }

    const MapStyleControl = L.Control.extend({

        options:{
            position:"topright"
        },

        onAdd:function(){

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

    setTimeout(() => {

        const select =
            el("mapStyleSelect");

        if(select){

            select.addEventListener(
                "change",
                () => {

                    setMapStyle(
                        select.value
                    );

                }
            );
        }

    },100);
}


/* =========================================================
   CHANGE MAP STYLE
   ========================================================= */

function setMapStyle(style){

    if(!map){
        return;
    }

    if(!baseLayers[style]){
        return;
    }

    if(currentBaseLayer){

        map.removeLayer(
            currentBaseLayer
        );
    }

    currentBaseLayer =
        baseLayers[style];

    currentBaseLayer.addTo(map);

    updateWeatherMapOverlay();
}


/* =========================================================
   WEATHER METRIC CONTROL
   ========================================================= */

function addWeatherMetricControl(){

    if(!map){
        return;
    }

    const WeatherMetricControl =
        L.Control.extend({

            options:{
                position:"topright"
            },

            onAdd:function(){

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

    setTimeout(() => {

        const select =
            el("weatherMetricSelect");

        if(select){

            select.addEventListener(
                "change",
                () => {

                    selectedWeatherMetric =
                        select.value;

                    updateWeatherMapOverlay();

                }
            );
        }

    },100);
}


/* =========================================================
   SET WEATHER METRIC
   ========================================================= */

function setWeatherMetric(metric){

    const allowed = [
        "temperature",
        "humidity",
        "pressure",
        "wind",
        "rain"
    ];

    if(!allowed.includes(metric)){
        return;
    }

    selectedWeatherMetric = metric;

    const select =
        el("weatherMetricSelect");

    if(select){
        select.value = metric;
    }

    updateWeatherMapOverlay();

    focusSection("mapCard");
}


/* =========================================================
   WEATHER MAP OVERLAY
   ========================================================= */

function updateWeatherMapOverlay(){

    if(!map || !currentWeather){
        return;
    }

    removeWeatherOverlay();

    let value = "";
    let label = "";
    let unit = "";

    switch(selectedWeatherMetric){

        case "temperature":

            label = "TEMPERATURE";

            value =
                Number(
                    currentWeather.temperature
                ).toFixed(1);

            unit = "°C";

            break;


        case "humidity":

            label = "HUMIDITY";

            value =
                Number(
                    currentWeather.humidity
                ).toFixed(0);

            unit = "%";

            break;


        case "pressure":

            label = "PRESSURE";

            value =
                Number(
                    currentWeather.pressure
                ).toFixed(0);

            unit = "hPa";

            break;


        case "wind":

            label = "WIND";

            value =
                Number(
                    currentWeather.wind
                ).toFixed(1);

            unit = "km/h";

            break;


        case "rain":

            label = "RAIN";

            value =
                Number(
                    currentWeather.rain
                ).toFixed(1);

            unit = "mm";

            break;
    }


    /* Outer monitoring zone */

    weatherOverlayCircle =
        L.circle(
            [currentLat,currentLon],
            {
                radius:25000,
                color:"#00d9ff",
                weight:1,
                opacity:.45,
                fillColor:"#00d9ff",
                fillOpacity:.035
            }
        ).addTo(map);


    /* Inner monitoring zone */

    weatherOverlayCircle2 =
        L.circle(
            [currentLat,currentLon],
            {
                radius:10000,
                color:"#42ddff",
                weight:2,
                opacity:.55,
                fillColor:"#42ddff",
                fillOpacity:.055
            }
        ).addTo(map);


    /* Live value bubble */

    const icon =
        L.divIcon({

            className:
                "weather-overlay-marker",

            html:`
                <div class="
                    weather-value-bubble
                    weather-pulse
                ">
                    <small>${label}</small>
                    <strong>
                        ${value} ${unit}
                    </strong>
                </div>
            `,

            iconSize:[110,60],

            iconAnchor:[55,30]
        });


    weatherValueMarker =
        L.marker(
            [currentLat,currentLon],
            {
                icon:icon,
                interactive:false
            }
        ).addTo(map);


    /* Wind direction */

    if(
        selectedWeatherMetric === "wind" &&
        currentWeather.windDirection !== null
    ){

        drawWindDirection(
            currentWeather.windDirection
        );
    }


    const liveValue =
        el("mapLiveValue");

    if(liveValue){

        liveValue.innerHTML =
            `${label}: <b>${value} ${unit}</b>`;
    }
}


/* =========================================================
   REMOVE WEATHER OVERLAY
   ========================================================= */

function removeWeatherOverlay(){

    if(!map){
        return;
    }

    if(weatherOverlayCircle){

        map.removeLayer(
            weatherOverlayCircle
        );

        weatherOverlayCircle = null;
    }

    if(weatherOverlayCircle2){

        map.removeLayer(
            weatherOverlayCircle2
        );

        weatherOverlayCircle2 = null;
    }

    if(weatherValueMarker){

        map.removeLayer(
            weatherValueMarker
        );

        weatherValueMarker = null;
    }

    if(weatherDirectionLine){

        map.removeLayer(
            weatherDirectionLine
        );

        weatherDirectionLine = null;
    }
}


/* =========================================================
   WIND DIRECTION LINE
   ========================================================= */

function drawWindDirection(direction){

    const distance = 0.12;

    const angle =
        Number(direction) *
        Math.PI / 180;

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
                [currentLat,currentLon],
                [lat2,lon2]
            ],
            {
                color:"#8bffdd",
                weight:4,
                opacity:.8
            }
        ).addTo(map);
}


/* =========================================================
   WEATHER API
   ========================================================= */

async function loadWeather(){

    try{

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
            await fetch(url);


        if(!response.ok){

            throw new Error(
                "Weather API error: " +
                response.status
            );
        }


        const data =
            await response.json();


        if(!data.current){

            throw new Error(
                "Weather data unavailable."
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


        console.log(
            "Weather updated",
            currentWeather
        );

    }

    catch(error){

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
   UPDATE WEATHER CARDS
   ========================================================= */

function updateWeatherCards(){

    if(!currentWeather){
        return;
    }

    safeText(
        "temperature",
        `${Number(currentWeather.temperature).toFixed(1)} °C`
    );

    safeText(
        "humidity",
        `${Number(currentWeather.humidity).toFixed(0)} %`
    );

    safeText(
        "pressure",
        `${Number(currentWeather.pressure).toFixed(0)} hPa`
    );

    safeText(
        "wind",
        `${Number(currentWeather.wind).toFixed(1)} km/h`
    );

    safeText(
        "rain",
        `${Number(currentWeather.rain).toFixed(1)} mm`
    );

    safeText(
        "cloud",
        `${Number(currentWeather.cloud).toFixed(0)} %`
    );
}


/* =========================================================
   WEATHER CHART
   ========================================================= */

function updateWeatherChart(hourly){

    if(!hourly){
        return;
    }

    const canvas =
        el("weatherChart");

    if(!canvas){
        return;
    }

    const labels =
        hourly.time.slice(0,24)
        .map(time => {

            const date =
                new Date(time);

            return date.toLocaleTimeString(
                [],
                {
                    hour:"2-digit",
                    minute:"2-digit"
                }
            );
        });


    const temperatures =
        hourly.temperature_2m
        .slice(0,24);


    if(weatherChart){

        weatherChart.destroy();

        weatherChart = null;
    }


    weatherChart =
        new Chart(
            canvas.getContext("2d"),
            {

                type:"line",

                data:{

                    labels:labels,

                    datasets:[
                        {
                            label:
                                "Temperature °C",

                            data:
                                temperatures,

                            borderWidth:2,

                            pointRadius:2,

                            pointHoverRadius:5,

                            tension:.35,

                            fill:false
                        }
                    ]
                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    interaction:{
                        intersect:false,
                        mode:"index"
                    },

                    plugins:{

                        legend:{
                            labels:{
                                color:"#dffaff"
                            }
                        }
                    },

                    scales:{

                        x:{
                            ticks:{
                                color:"#7095a3",
                                maxTicksLimit:12
                            },

                            grid:{
                                color:
                                    "rgba(100,220,255,.08)"
                            }
                        },

                        y:{
                            ticks:{
                                color:"#7095a3"
                            },

                            grid:{
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
   ALERT CENTER
   ========================================================= */

function updateAlerts(){

    const alertList =
        el("alertList");

    if(!alertList || !currentWeather){
        return;
    }

    const alerts = [];


    if(currentWeather.temperature >= 40){

        alerts.push({
            type:"danger",
            text:
                "🔴 Extreme heat detected: " +
                `${currentWeather.temperature.toFixed(1)} °C`
        });

    }
    else if(currentWeather.temperature >= 35){

        alerts.push({
            type:"warning",
            text:
                "🟠 High temperature warning: " +
                `${currentWeather.temperature.toFixed(1)} °C`
        });
    }


    if(currentWeather.humidity >= 85){

        alerts.push({
            type:"warning",
            text:
                "🟠 High humidity: " +
                `${currentWeather.humidity.toFixed(0)}%`
        });
    }


    if(currentWeather.wind >= 50){

        alerts.push({
            type:"danger",
            text:
                "🔴 High wind speed: " +
                `${currentWeather.wind.toFixed(1)} km/h`
        });
    }


    if(currentWeather.rain >= 10){

        alerts.push({
            type:"warning",
            text:
                "🟠 Heavy precipitation detected: " +
                `${currentWeather.rain.toFixed(1)} mm`
        });
    }


    if(alerts.length === 0){

        alertList.innerHTML = `
            <div class="alert success">
                🟢 Environment conditions normal.
                Continuous monitoring active.
            </div>
        `;

        return;
    }


    alertList.innerHTML =
        alerts.map(alert => `
            <div class="alert ${alert.type}">
                ${alert.text}
            </div>
        `).join("");
}


/* =========================================================
   EARTHQUAKE DATA
   ========================================================= */

async function loadEarthquakes(){

    const quakeList =
        el("quakeList");

    if(!quakeList){
        return;
    }

    quakeList.innerHTML =
        `<div class="loading">
            Loading earthquake data...
        </div>`;


    try{

        const response =
            await fetch(
                "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
            );


        if(!response.ok){

            throw new Error(
                "Earthquake API error"
            );
        }


        const data =
            await response.json();


        const features =
            data.features || [];


        features.sort(
            (a,b) =>
                (b.properties.mag || 0) -
                (a.properties.mag || 0)
        );


        const top =
            features.slice(0,15);


        if(top.length === 0){

            quakeList.innerHTML =
                `<div class="alert success">
                    🟢 No earthquake records available.
                </div>`;

            return;
        }


        quakeList.innerHTML =
            top.map(eq => {

                const mag =
                    Number(
                        eq.properties.mag || 0
                    );

                const place =
                    eq.properties.place ||
                    "Unknown location";

                const time =
                    eq.properties.time
                    ? new Date(
                        eq.properties.time
                    ).toLocaleString()
                    : "Unknown time";


                let level = "";

                if(mag >= 6){
                    level = "danger";
                }
                else if(mag >= 4){
                    level = "warning";
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
                                ${escapeHTML(place)}
                            </div>

                            <div class="quake-time">
                                ${time}
                            </div>

                        </div>

                    </div>
                `;

            }).join("");


    }
    catch(error){

        console.error(
            "Earthquake Error:",
            error
        );

        quakeList.innerHTML =
            `<div class="alert danger">
                🔴 Unable to load earthquake data.
            </div>`;
    }
}


/* =========================================================
   GPS LOCATION
   ========================================================= */

function getUserLocation(){

    if(!navigator.geolocation){

        console.warn(
            "Geolocation is not supported."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        position => {

            currentLat =
                position.coords.latitude;

            currentLon =
                position.coords.longitude;


            console.log(
                "GPS:",
                currentLat,
                currentLon
            );


            if(map){

                map.setView(
                    [currentLat,currentLon],
                    11
                );
            }


            if(userMarker){

                userMarker.setLatLng(
                    [
                        currentLat,
                        currentLon
                    ]
                );

                userMarker
                    .bindPopup(
                        "<b>📍 Current Monitoring Location</b>"
                    );
            }


            loadWeather();

        },

        error => {

            console.warn(
                "GPS unavailable:",
                error.message
            );

            /*
             * Ahmedabad fallback remains active.
             */

            currentLat = 23.0225;
            currentLon = 72.5714;

        },

        {
            enableHighAccuracy:true,
            timeout:10000,
            maximumAge:300000
        }
    );
}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

function initVoice(){

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const micBtn =
        el("micBtn");

    const voiceStatus =
        el("voiceStatus");

    const heardText =
        el("heardText");

    const voiceLanguage =
        el("voiceLanguage");


    if(!SpeechRecognition){

        if(voiceStatus){

            voiceStatus.textContent =
                "Voice recognition is not supported in this browser.";
        }

        if(micBtn){

            micBtn.disabled = true;

            micBtn.style.opacity = ".45";
        }

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.lang =
        voiceLanguage
        ? voiceLanguage.value
        : "hi-IN";


    if(voiceLanguage){

        voiceLanguage.addEventListener(
            "change",
            () => {

                recognition.lang =
                    voiceLanguage.value;
            }
        );
    }


    if(micBtn){

        micBtn.addEventListener(
            "click",
            toggleListening
        );
    }


    recognition.onstart = () => {

        isListening = true;

        if(micBtn){

            micBtn.classList.add(
                "listening"
            );
        }

        if(voiceStatus){

            voiceStatus.textContent =
                "🎙️ Listening...";
        }
    };


    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript
            .trim();


        if(heardText){

            heardText.textContent =
                "You said: " +
                transcript;
        }


        processVoiceCommand(
            transcript
        );
    };


    recognition.onerror = event => {

        console.warn(
            "Voice recognition error:",
            event.error
        );


        if(voiceStatus){

            if(event.error === "not-allowed"){

                voiceStatus.textContent =
                    "Microphone permission denied.";

            }
            else if(event.error === "no-speech"){

                voiceStatus.textContent =
                    "No speech detected.";

            }
            else{

                voiceStatus.textContent =
                    "Voice error: " +
                    event.error;
            }
        }
    };


    recognition.onend = () => {

        isListening = false;

        if(micBtn){

            micBtn.classList.remove(
                "listening"
            );
        }

        if(
            voiceStatus &&
            voiceStatus.textContent ===
            "🎙️ Listening..."
        ){

            voiceStatus.textContent =
                "Voice control ready";
        }
    };
}


/* =========================================================
   TOGGLE LISTENING
   ========================================================= */

function toggleListening(){

    if(!recognition){
        return;
    }


    if(isListening){

        recognition.stop();

        return;
    }


    try{

        recognition.lang =
            el("voiceLanguage")
            ?.value || "hi-IN";

        recognition.start();

    }
    catch(error){

        console.warn(
            "Recognition start error:",
            error
        );
    }
}


/* =========================================================
   VOICE COMMAND ROUTER
   ========================================================= */

function processVoiceCommand(command){

    const text =
        command
        .toLowerCase()
        .trim();


    /* =============================================
       STOP
       ============================================= */

    if(
        text.includes("stop") ||
        text.includes("बंद") ||
        text.includes("रुको") ||
        text.includes("रोक दो")
    ){

        if(recognition && isListening){

            recognition.stop();
        }

        speak(
            "Voice control stopped."
        );

        return;
    }


    /* =============================================
       WEATHER METRICS
       ============================================= */

    if(
        text.includes("temperature") ||
        text.includes("तापमान") ||
        text.includes("temp")
    ){

        setWeatherMetric(
            "temperature"
        );

        speak(
            "Temperature map showing."
        );

        return;
    }


    if(
        text.includes("humidity") ||
        text.includes("नमी")
    ){

        setWeatherMetric(
            "humidity"
        );

        speak(
            "Humidity map showing."
        );

        return;
    }


    if(
        text.includes("pressure") ||
        text.includes("दबाव") ||
        text.includes("वायुदाब")
    ){

        setWeatherMetric(
            "pressure"
        );

        speak(
            "Pressure map showing."
        );

        return;
    }


    if(
        text.includes("wind") ||
        text.includes("हवा") ||
        text.includes("पवन")
    ){

        setWeatherMetric(
            "wind"
        );

        speak(
            "Wind map showing."
        );

        return;
    }


    if(
        text.includes("rain") ||
        text.includes("बारिश") ||
        text.includes("वर्षा")
    ){

        setWeatherMetric(
            "rain"
        );

        speak(
            "Rain map showing."
        );

        return;
    }


    /* =============================================
       GENERIC WEATHER
       ============================================= */

    if(
        text.includes("weather") ||
        text.includes("मौसम") ||
        text.includes("मौसम बताओ")
    ){

        focusSection(
            "weatherCard"
        );

        speakWeather();

        return;
    }


    /* =============================================
       MAP
       ============================================= */

    if(
        text.includes("map") ||
        text.includes("मानचित्र") ||
        text.includes("नक्शा") ||
        text.includes("map kholo") ||
        text.includes("map दिखाओ")
    ){

        focusSection(
            "mapCard"
        );

        speak(
            "Live weather map opened."
        );

        return;
    }


    /* =============================================
       EARTHQUAKE
       ============================================= */

    if(
        text.includes("earthquake") ||
        text.includes("भूकंप") ||
        text.includes("earth quake")
    ){

        focusSection(
            "earthquakeCard"
        );

        loadEarthquakes();

        speak(
            "Live earthquake monitor opened."
        );

        return;
    }


    /* =============================================
       GRAPH
       ============================================= */

    if(
        text.includes("graph") ||
        text.includes("chart") ||
        text.includes("ग्राफ") ||
        text.includes("चार्ट")
    ){

        focusSection(
            "graphCard"
        );

        speak(
            "Environment graph opened."
        );

        return;
    }


    /* =============================================
       ALERT
       ============================================= */

    if(
        text.includes("alert") ||
        text.includes("alerts") ||
        text.includes("अलर्ट") ||
        text.includes("चेतावनी")
    ){

        focusSection(
            "alertCard"
        );

        speak(
            "Alert center opened."
        );

        return;
    }


    /* =============================================
       QR
       ============================================= */

    if(
        text.includes("qr") ||
        text.includes("क्यूआर")
    ){

        openApp("qr");

        speak(
            "QR Generator opening."
        );

        return;
    }


    /* =============================================
       CAMERA
       ============================================= */

    if(
        text.includes("camera") ||
        text.includes("कैमरा")
    ){

        openApp("camera");

        speak(
            "Smart camera opening."
        );

        return;
    }


    /* =============================================
       SOS
       ============================================= */

    if(
        text.includes("sos") ||
        text.includes("siren") ||
        text.includes("सायरन")
    ){

        openApp("sos");

        speak(
            "SOS Siren opening."
        );

        return;
    }


    /* =============================================
       LOCATION
       ============================================= */

    if(
        text.includes("location") ||
        text.includes("लोकेशन") ||
        text.includes("स्थान")
    ){

        openApp("location");

        speak(
            "Live location dashboard opening."
        );

        return;
    }


    /* =============================================
       REFRESH
       ============================================= */

    if(
        text.includes("refresh") ||
        text.includes("update") ||
        text.includes("अपडेट") ||
        text.includes("रीफ्रेश")
    ){

        loadWeather();

        loadEarthquakes();

        speak(
            "Dashboard data updated."
        );

        return;
    }


    /* =============================================
       HOME
       ============================================= */

    if(
        text.includes("home") ||
        text.includes("dashboard") ||
        text.includes("होम") ||
        text.includes("डैशबोर्ड")
    ){

        window.scrollTo({
            top:0,
            behavior:"smooth"
        });

        speak(
            "Dashboard opened."
        );

        return;
    }


    /* =============================================
       UNKNOWN COMMAND
       ============================================= */

    speak(
        "Command not recognized."
    );

    const voiceStatus =
        el("voiceStatus");

    if(voiceStatus){

        voiceStatus.textContent =
            "Command not recognized";
    }
}


/* =========================================================
   VOICE RESPONSE
   ========================================================= */

function speak(text){

    if(!("speechSynthesis" in window)){
        return;
    }

    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    const language =
        el("voiceLanguage")
        ?.value || "hi-IN";


    utterance.lang =
        language;

    utterance.rate = .95;

    utterance.pitch = 1;

    utterance.volume = 1;


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   SPEAK WEATHER
   ========================================================= */

function speakWeather(){

    if(!currentWeather){

        speak(
            "Weather data is loading."
        );

        return;
    }


    const message =
        `Temperature ${Number(currentWeather.temperature).toFixed(1)} degrees Celsius. ` +

        `Humidity ${Number(currentWeather.humidity).toFixed(0)} percent. ` +

        `Pressure ${Number(currentWeather.pressure).toFixed(0)} hectopascal. ` +

        `Wind ${Number(currentWeather.wind).toFixed(1)} kilometers per hour. ` +

        `Rain ${Number(currentWeather.rain).toFixed(1)} millimeters. ` +

        `Cloud cover ${Number(currentWeather.cloud).toFixed(0)} percent.`;


    speak(message);
}


/* =========================================================
   FOCUS SECTION
   ========================================================= */

function focusSection(id){

    const section =
        el(id);

    if(!section){
        return;
    }

    section.scrollIntoView({
        behavior:"smooth",
        block:"center"
    });
}


/* =========================================================
   OPEN EXTERNAL APP
   ========================================================= */

function openApp(app){

    const url =
        APP_LINKS[app];


    if(!url){

        alert(
            "Application link is not configured."
        );

        return;
    }


    if(
        url === "YOUR_SOS_SIREN_URL"
    ){

        alert(
            "SOS Siren URL अभी configure नहीं किया गया है।"
        );

        return;
    }


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   QUICK COMMANDS
   ========================================================= */

function setupQuickCommands(){

    /*
     * HTML में buttons पहले से onclick
     * के साथ connected हैं।
     *
     * यह function future extension के
     * लिए रखा गया है।
     */

    console.log(
        "Quick command system ready."
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value){

    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


/* =========================================================
   AUTO REFRESH
   ========================================================= */

/*
 * Weather:
 * Every 5 minutes
 */

setInterval(
    () => {

        loadWeather();

    },
    5 * 60 * 1000
);


/*
 * Earthquakes:
 * Every 2 minutes
 */

setInterval(
    () => {

        loadEarthquakes();

    },
    2 * 60 * 1000
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openApp =
    openApp;

window.setWeatherMetric =
    setWeatherMetric;

window.loadWeather =
    loadWeather;

window.loadEarthquakes =
    loadEarthquakes;


/* =========================================================
   END
   ========================================================= */

console.log(
    "%c CBRND ENVIRONMENT COMMAND CENTER V2 ",
    "background:#06131f;color:#62eaff;font-size:14px;font-weight:bold;padding:8px;"
);

console.log(
    "Voice • Weather • Map • Earthquake • Alerts • GPS"
);
