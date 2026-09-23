/* =========================================================
   CHOTI ALEXA — CBRND COMMAND CENTER
   FINAL SCRIPT.JS
   HTML + CSS COMPATIBLE VERSION
   ========================================================= */

"use strict";


/* =========================================================
   APP LINKS — OLD LINKS KEPT EXACTLY SAME
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

    compass:
        "https://somchandtrust-boo.github.io/My-Compass/",

    ai:
        "https://aivoice.wecon.group/"

};


/* =========================================================
   SOCIAL LINKS — OLD LINKS SAME
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
   MAP
   ========================================================= */

let map = null;
let userMarker = null;
let accuracyCircle = null;


/* =========================================================
   WEATHER
   ========================================================= */

let currentWeather = null;


/* =========================================================
   VOICE
   ========================================================= */

let recognition = null;
let isListening = false;


/* =========================================================
   SIREN
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
   DOM HELPER
   ========================================================= */

function el(id) {
    return document.getElementById(id);
}


/* =========================================================
   HISTORY
   ========================================================= */

const HISTORY_KEY = "CBRND_COMMAND_HISTORY";


function addHistory(type, message) {

    let history = [];

    try {
        history =
            JSON.parse(
                localStorage.getItem(HISTORY_KEY)
            ) || [];
    }

    catch (error) {
        history = [];
    }


    history.unshift({

        type: type,

        text: message,

        time:
            new Date().toLocaleString()

    });


    history =
        history.slice(0, 50);


    try {

        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
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

    const container =
        el("history");

    if (!container) {
        return;
    }


    let history = [];

    try {

        history =
            JSON.parse(
                localStorage.getItem(HISTORY_KEY)
            ) || [];

    }

    catch (error) {

        history = [];

    }


    if (!history.length) {

        container.innerHTML = `
            <div class="history-empty">
                No commands yet.
            </div>
        `;

        return;
    }


    container.innerHTML =

        history
            .slice(0, 20)
            .map(function(item) {

                return `
                    <div class="history-item">

                        <div class="history-type">
                            ${escapeHTML(item.type)}
                        </div>

                        <div class="history-text">
                            ${escapeHTML(item.text)}
                        </div>

                        <div class="history-time">
                            ${escapeHTML(item.time)}
                        </div>

                    </div>
                `;

            })
            .join("");

}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    try {

        localStorage.removeItem(
            HISTORY_KEY
        );

    }

    catch (error) {

        console.warn(error);

    }


    renderHistory();

    speak(
        "Command history cleared."
    );

}


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap() {

    const mapElement =
        el("map");


    if (!mapElement) {
        return;
    }


    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet is not loaded."
        );

        return;

    }


    if (map) {
        return;
    }


    map =
        L.map("map", {
            zoomControl: true
        })
        .setView(
            [
                currentLat,
                currentLon
            ],
            11
        );


    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    userMarker =
        L.marker([
            currentLat,
            currentLon
        ])
        .addTo(map)
        .bindPopup(
            "<b>CBRND Location</b><br>Ahmedabad"
        );


    setTimeout(function() {

        if (map) {
            map.invalidateSize();
        }

    }, 500);

}


/* =========================================================
   OPEN MAP
   ========================================================= */

function openMap() {

    if (!map) {
        initMap();
    }


    const mapElement =
        el("map");


    if (mapElement) {

        mapElement.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    setTimeout(function() {

        if (!map) {
            return;
        }


        map.invalidateSize();


        map.setView(
            [
                currentLat,
                currentLon
            ],
            13
        );

    }, 500);


    addHistory(
        "MAP",
        "Live map opened"
    );


    speak(
        "Live map opened."
    );

}


/* =========================================================
   GPS
   ========================================================= */

function getGPS() {

    if (
        !navigator.geolocation
    ) {

        showModal(
            "GPS",
            "GPS is not supported in this browser."
        );

        speak(
            "GPS is not supported in this browser."
        );

        return;
    }


    safeMapStatus(
        "LOCATING..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            currentLat =
                position.coords.latitude;


            currentLon =
                position.coords.longitude;


            safeMapStatus(
                "GPS ACTIVE"
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


            addHistory(
                "GPS",
                `${currentLat.toFixed(6)}, ${currentLon.toFixed(6)}`
            );


            showModal(
                "CURRENT GPS LOCATION",
                `
                    Latitude:
                    ${currentLat.toFixed(6)}

                    <br><br>

                    Longitude:
                    ${currentLon.toFixed(6)}

                    <br><br>

                    Accuracy:
                    ${Math.round(position.coords.accuracy)} meters
                `
            );


            speak(
                "Your current location has been found."
            );

        },


        function(error) {

            console.warn(
                "GPS error:",
                error
            );


            safeMapStatus(
                "GPS ERROR"
            );


            showModal(
                "GPS ERROR",
                "Unable to get your current GPS location."
            );


            speak(
                "Unable to get your GPS location."
            );

        },


        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0

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

        userMarker.setLatLng([
            currentLat,
            currentLon
        ]);

    }

    else {

        userMarker =
            L.marker([
                currentLat,
                currentLon
            ])
            .addTo(map);

    }


    userMarker.bindPopup(`

        <b>📍 Current GPS Location</b>

        <br><br>

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
                    radius: accuracy,
                    color: "#00d9ff",
                    fillColor: "#00d9ff",
                    fillOpacity: 0.08,
                    weight: 1
                }
            )
            .addTo(map);

    }

}


/* =========================================================
   INITIAL GPS
   ========================================================= */

function getInitialLocation() {

    if (
        !navigator.geolocation
    ) {

        safeMapStatus(
            "GPS FALLBACK"
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            currentLat =
                position.coords.latitude;

            currentLon =
                position.coords.longitude;


            safeMapStatus(
                "GPS ACTIVE"
            );


            updateGPSMarker(
                position.coords.accuracy
            );

        },

        function() {

            safeMapStatus(
                "READY"
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
   MAP STATUS
   ========================================================= */

function safeMapStatus(text) {

    const status =
        el("mapStatus");

    if (status) {
        status.textContent = text;
    }

}


/* =========================================================
   ALERT
   ========================================================= */

function activateAlert() {

    alertActive =
        !alertActive;


    const alertMode =
        el("alertMode");


    if (alertMode) {

        alertMode.classList.toggle(
            "active",
            alertActive
        );

    }


    addHistory(
        "ALERT",
        alertActive
            ? "Emergency alert activated"
            : "Emergency alert deactivated"
    );


    speak(
        alertActive
            ? "Emergency alert activated."
            : "Emergency alert deactivated."
    );

}


/* =========================================================
   SIREN START
   ========================================================= */

function startSiren() {

    if (sirenRunning) {
        return;
    }


    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {

        showModal(
            "SIREN",
            "Web Audio is not supported in this browser."
        );

        return;
    }


    try {

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
            setInterval(function() {

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
                        ? 900
                        : 500;


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

            }, 450);


        updateSirenUI(true);


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


        showModal(
            "SIREN ERROR",
            "Siren could not start. Please try again."
        );

    }

}


/* =========================================================
   STOP SIREN
   ========================================================= */

function stopSiren(
    silent = false
) {

    if (!sirenRunning && !sirenOscillator) {
        updateSirenUI(false);
        return;
    }


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

        catch (error) {}

        try {

            sirenOscillator.disconnect();

        }

        catch (error) {}

        sirenOscillator =
            null;

    }


    if (sirenGain) {

        try {

            sirenGain.disconnect();

        }

        catch (error) {}

        sirenGain =
            null;

    }


    sirenRunning =
        false;


    updateSirenUI(false);


    if (!silent) {

        addHistory(
            "SIREN",
            "Siren stopped"
        );


        speak(
            "Siren stopped."
        );

    }

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

    const button =
        document.querySelector(
            '[onclick="toggleSiren()"]'
        );


    if (button) {

        const small =
            button.querySelector("small");


        if (small) {

            small.textContent =
                running
                    ? "Stop siren"
                    : "Start siren";

        }

    }

}


/* =========================================================
   STOP EVERYTHING
   ========================================================= */

function stopEverything() {

    stopSiren(true);


    alertActive =
        false;


    const alertMode =
        el("alertMode");


    if (alertMode) {

        alertMode.classList.remove(
            "active"
        );

    }


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

        catch (error) {}

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
   WEATHER
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
            "&timezone=auto";


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Weather request failed"
            );
        }


        const data =
            await response.json();


        if (!data.current) {
            throw new Error(
                "Weather unavailable"
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


    }

    catch (error) {

        console.warn(
            "Weather error:",
            error
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
   SAFE TEXT
   ========================================================= */

function safeText(
    id,
    value
) {

    const element =
        el(id);


    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   WEATHER SPEECH
   ========================================================= */

function speakWeather() {

    if (!currentWeather) {

        speak(
            "Weather data is still loading."
        );

        loadWeather();

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
   OPEN EXTERNAL APP
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
        url.startsWith("YOUR_")
    ) {

        showModal(

            "APP LINK",

            app === "sos"
                ? "SOS Siren URL अभी configure नहीं किया गया है."
                : "Application URL अभी configure नहीं किया गया है."

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

        ai:
            "AI Voice Assistant is opening.",

        compass:
            "Compass is opening."

    };


    speak(
        messages[app] ||
        "Application is opening."
    );

}


/* =========================================================
   COMPASS
   ========================================================= */

function openCompass() {

    openApp(
        "compass"
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
        messages[social]
    );

}


/* =========================================================
   VOICE INITIALIZATION
   ========================================================= */

function initVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const mic =
        el("mic");


    const status =
        el("voiceStatus");


    if (!SpeechRecognition) {

        if (status) {

            status.textContent =
                "Voice recognition not supported.";

        }


        if (mic) {

            mic.disabled =
                true;

            mic.style.opacity =
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


    /*
       Hindi + English recognition
    */

    recognition.lang =
        "en-IN";


    if (mic) {

        mic.addEventListener(
            "click",
            toggleListening
        );

    }


    recognition.onstart =
        function() {

            isListening =
                true;


            if (mic) {

                mic.classList.add(
                    "listening"
                );

            }


            if (status) {

                status.textContent =
                    "🎙️ Listening...";

            }

        };


    recognition.onresult =
        function(event) {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();


            addHistory(
                "VOICE",
                transcript
            );


            processVoiceCommand(
                transcript
            );

        };


    recognition.onerror =
        function(event) {

            console.warn(
                "Voice error:",
                event.error
            );


            if (!status) {
                return;
            }


            if (
                event.error ===
                "not-allowed"
            ) {

                status.textContent =
                    "Microphone permission denied.";

            }

            else if (
                event.error ===
                "no-speech"
            ) {

                status.textContent =
                    "No speech detected.";

            }

            else {

                status.textContent =
                    "Voice error: " +
                    event.error;

            }

        };


    recognition.onend =
        function() {

            isListening =
                false;


            if (mic) {

                mic.classList.remove(
                    "listening"
                );

            }


            if (
                status &&
                status.textContent ===
                "🎙️ Listening..."
            ) {

                status.textContent =
                    "Click microphone to speak";

            }

        };

}


/* =========================================================
   VOICE TOGGLE
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

        catch (error) {}

        return;

    }


    try {

        recognition.lang =
            "en-IN";


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

function processVoiceCommand(
    command
) {

    const text =
        String(command || "")
            .toLowerCase()
            .trim();


    console.log(
        "Voice Command:",
        text
    );


    /*
       NAME
    */

    if (

        text.includes("what is your name") ||
        text.includes("what's your name") ||
        text.includes("your name") ||
        text.includes("who are you") ||
        text.includes("aapka naam") ||
        text.includes("tumhara naam") ||
        text.includes("आपका नाम") ||
        text.includes("तुम्हारा नाम")

    ) {

        speak(
            "My name is Choti Alexa."
        );

        return;

    }


    /*
       MOBILE NUMBER
    */

    if (

        text.includes("my mobile number") ||
        text.includes("my phone number") ||
        text.includes("mobile number") ||
        text.includes("phone number") ||
        text.includes("mera mobile") ||
        text.includes("mera number") ||
        text.includes("mera phone") ||
        text.includes("मेरा मोबाइल") ||
        text.includes("मेरा नंबर") ||
        text.includes("मोबाइल नंबर")

    ) {

        const number =
            localStorage.getItem(
                "CHOTI_ALEXA_MOBILE"
            );


        if (!number) {

            speak(
                "Your mobile number is not saved yet."
            );

        }

        else {

            speak(
                "Your mobile number is " +
                number
                    .split("")
                    .join(" ")
            );

        }

        return;

    }


    /*
       STOP EVERYTHING
    */

    if (

        text === "stop" ||
        text.includes("stop everything") ||
        text.includes("stop all") ||
        text.includes("सब बंद करो") ||
        text.includes("सब कुछ बंद करो") ||
        text.includes("सब बंद") ||
        text.includes("रोक दो") ||
        text.includes("रुको")

    ) {

        stopEverything();

        return;

    }


    /*
       STOP SIREN
    */

    if (

        text.includes("stop siren") ||
        text.includes("siren stop") ||
        text.includes("सायरन बंद") ||
        text.includes("सायरन बंद करो") ||
        text.includes("सायरन ऑफ")

    ) {

        stopSiren();

        return;

    }


    /*
       START SIREN
    */

    if (

        text.includes("start siren") ||
        text.includes("siren start") ||
        text.includes("सायरन चालू") ||
        text.includes("सायरन चालु") ||
        text.includes("सायरन ऑन") ||
        text.includes("सायरन खोलो") ||
        text.includes("सायरन बजाओ")

    ) {

        startSiren();

        return;

    }


    /*
       ALERT
    */

    if (

        text.includes("alert") ||
        text.includes("अलर्ट") ||
        text.includes("चेतावनी")

    ) {

        activateAlert();

        return;

    }


    /*
       GPS
    */

    if (

        text.includes("open gps") ||
        text.includes("gps kholo") ||
        text.includes("gps") ||
        text.includes("मेरी लोकेशन") ||
        text.includes("meri location") ||
        text.includes("location batao")

    ) {

        getGPS();

        return;

    }


    /*
       WEATHER
    */

    if (

        text.includes("weather") ||
        text.includes("मौसम") ||
        text.includes("मौसम बताओ") ||
        text.includes("weather batao")

    ) {

        speakWeather();

        return;

    }


    /*
       TEMPERATURE
    */

    if (

        text.includes("temperature") ||
        text.includes("temp") ||
        text.includes("तापमान") ||
        text.includes("गर्मी")

    ) {

        if (currentWeather) {

            speak(
                `Current temperature is ${Number(
                    currentWeather.temperature
                ).toFixed(1)} degrees Celsius.`
            );

        }

        else {

            speakWeather();

        }

        return;

    }


    /*
       HUMIDITY
    */

    if (

        text.includes("humidity") ||
        text.includes("नमी") ||
        text.includes("आर्द्रता")

    ) {

        if (currentWeather) {

            speak(
                `Current humidity is ${Number(
                    currentWeather.humidity
                ).toFixed(0)} percent.`
            );

        }

        return;

    }


    /*
       WIND
    */

    if (

        text.includes("wind") ||
        text.includes("हवा") ||
        text.includes("पवन")

    ) {

        if (currentWeather) {

            speak(
                `Current wind speed is ${Number(
                    currentWeather.wind
                ).toFixed(1)} kilometers per hour.`
            );

        }

        return;

    }


    /*
       RAIN
    */

    if (

        text.includes("rain") ||
        text.includes("बारिश") ||
        text.includes("वर्षा")

    ) {

        if (currentWeather) {

            speak(
                `Current rain is ${Number(
                    currentWeather.rain
                ).toFixed(1)} millimeters.`
            );

        }

        return;

    }


    /*
       MAP
    */

    if (

        text === "map" ||
        text.includes("open map") ||
        text.includes("map kholo") ||
        text.includes("मैप खोलो") ||
        text.includes("नक्शा") ||
        text.includes("मानचित्र")

    ) {

        openMap();

        return;

    }


    /*
       QR
    */

    if (

        text.includes("qr") ||
        text.includes("qr generator") ||
        text.includes("क्यूआर") ||
        text.includes("क्यू आर")

    ) {

        openApp("qr");

        return;

    }


    /*
       CAMERA
    */

    if (

        text.includes("camera") ||
        text.includes("smart camera") ||
        text.includes("कैमरा")

    ) {

        openApp("camera");

        return;

    }


    /*
       SOS
    */

    if (

        text.includes("sos") ||
        text.includes("sos siren") ||
        text.includes("एसओएस") ||
        text.includes("एस ओ एस")

    ) {

        openApp("sos");

        return;

    }


    /*
       LOCATION TRACKER
    */

    if (

        text.includes("location tracker") ||
        text.includes("live location tracker") ||
        text.includes("लोकेशन ट्रैकर") ||
        text.includes("लाइव लोकेशन")

    ) {

        openApp("location");

        return;

    }


    /*
       COMPASS
    */

    if (

        text.includes("compass") ||
        text.includes("compass kholo") ||
        text.includes("कंपास") ||
        text.includes("कम्पास")

    ) {

        openCompass();

        return;

    }


    /*
       AI ASSISTANT
    */

    if (

        text.includes("ai voice assistant") ||
        text.includes("voice assistant") ||
        text.includes("ai assistant") ||
        text.includes("वॉइस असिस्टेंट") ||
        text.includes("एआई असिस्टेंट")

    ) {

        openApp("ai");

        return;

    }


    /*
       INSTAGRAM
    */

    if (

        text.includes("instagram") ||
        text.includes("इंस्टाग्राम")

    ) {

        openSocial("instagram");

        return;

    }


    /*
       FACEBOOK
    */

    if (

        text.includes("facebook") ||
        text.includes("फेसबुक")

    ) {

        openSocial("facebook");

        return;

    }


    /*
       WHATSAPP
    */

    if (

        text.includes("whatsapp") ||
        text.includes("व्हाट्सएप") ||
        text.includes("व्हाट्सएप्प")

    ) {

        openSocial("whatsapp");

        return;

    }


    /*
       HOME
    */

    if (

        text.includes("home") ||
        text.includes("dashboard") ||
        text.includes("होम") ||
        text.includes("डैशबोर्ड")

    ) {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        speak(
            "Dashboard opened."
        );

        return;

    }


    /*
       UNKNOWN
    */

    speak(
        "Command not recognized."
    );


    const status =
        el("voiceStatus");


    if (status) {

        status.textContent =
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
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    /*
       Devanagari = Hindi
       Otherwise English
    */

    const isHindi =
        /[\u0900-\u097F]/.test(
            String(text)
        );


    utterance.lang =
        isHindi
            ? "hi-IN"
            : "en-IN";


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
   MOBILE SYSTEM
   ========================================================= */

function setupMobileSystem() {

    const input =
        el("userMobile");


    const button =
        el("saveMobileBtn");


    const status =
        el("mobileStatus");


    const saved =
        localStorage.getItem(
            "CHOTI_ALEXA_MOBILE"
        );


    if (input && saved) {

        input.value =
            saved;

    }


    if (saved && status) {

        status.textContent =
            "Mobile number saved. Ask: “Mera mobile number batao”";

    }


    if (
        button &&
        !button.dataset.bound
    ) {

        button.dataset.bound =
            "true";


        button.addEventListener(
            "click",
            function() {

                if (!input) {
                    return;
                }


                const value =
                    input.value
                        .trim();


                if (!value) {

                    if (status) {

                        status.textContent =
                            "Please enter your mobile number.";

                    }

                    speak(
                        "Please enter your mobile number."
                    );

                    return;

                }


                localStorage.setItem(
                    "CHOTI_ALEXA_MOBILE",
                    value
                );


                if (status) {

                    status.textContent =
                        "Mobile number saved successfully.";

                }


                addHistory(
                    "PROFILE",
                    "Mobile number saved"
                );


                speak(
                    "Your mobile number has been saved."
                );

            }
        );

    }

}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(
    title,
    message
) {

    const modal =
        el("modal");


    const modalTitle =
        el("modalTitle");


    const modalText =
        el("modalText");


    if (!modal) {

        alert(
            String(message)
                .replace(/<br>/g, "\n")
        );

        return;

    }


    if (modalTitle) {

        modalTitle.textContent =
            title;

    }


    if (modalText) {

        modalText.innerHTML =
            message;

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
   KEYBOARD
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const target =
            document.activeElement;


        const typing =
            target &&
            (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT"
            );


        if (
            event.code === "Space" &&
            !typing
        ) {

            event.preventDefault();

            toggleListening();

        }


        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   MODAL OUTSIDE CLICK
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            el("modal");


        if (
            modal &&
            event.target === modal
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   AUTO WEATHER
   ========================================================= */

function startAutoRefresh() {

    setInterval(
        function() {

            loadWeather();

        },
        5 * 60 * 1000
    );

}


/* =========================================================
   START SYSTEM
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Choti Alexa starting..."
        );


        initMap();


        initVoice();


        setupMobileSystem();


        renderHistory();


        getInitialLocation();


        loadWeather();


        startAutoRefresh();


        safeMapStatus(
            "READY"
        );


        console.log(
            "Choti Alexa Command Center READY"
        );

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openMap =
    openMap;

window.getGPS =
    getGPS;

window.activateAlert =
    activateAlert;

window.startSiren =
    startSiren;

window.stopSiren =
    stopSiren;

window.toggleSiren =
    toggleSiren;

window.stopEverything =
    stopEverything;

window.openApp =
    openApp;

window.openCompass =
    openCompass;

window.openSocial =
    openSocial;

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


/* =========================================================
   FINAL
   ========================================================= */

console.log(
    "%c CHOTI ALEXA ",
    "background:#06131f;color:#62eaff;font-size:18px;font-weight:bold;padding:10px;"
);

console.log(
    "CBRND Command Center — READY"
);

console.log(
    "Old APP LINKS preserved:",
    APP_LINKS
);
