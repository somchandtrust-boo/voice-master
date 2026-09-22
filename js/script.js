/* =========================================================
   CBRND REAL COMMAND CENTER V2
   FINAL SCRIPT.JS
   =========================================================
   KEEP:
   • REAL COMMANDS
   • Hindi + English Voice Control
   • Assistant Name
   • User Mobile Number
   ========================================================= */

"use strict";


/* =========================================================
   ASSISTANT / USER INFORMATION
   ========================================================= */

const ASSISTANT_NAME = "My Voice Master";

/*
   अपना मोबाइल नंबर यहां डालें.
   Example:
   const USER_MOBILE = "9876543210";
*/

const USER_MOBILE = "YOUR_MOBILE_NUMBER";


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
   VARIABLES
   ========================================================= */

let recognition = null;
let isListening = false;

let map = null;
let userMarker = null;
let accuracyCircle = null;

let currentLat = 23.0225;
let currentLon = 72.5714;

let audioContext = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenTimer = null;
let sirenRunning = false;

let alertActive = false;

let currentWeather = null;


/* =========================================================
   DOM HELPER
   ========================================================= */

function el(id) {

    return document.getElementById(id);

}


function safeText(id, value) {

    const element = el(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initMap();

        initVoice();

        setupButtons();

        getUserLocation();

        loadWeather();

        updateGPSStatus("WAITING");

    }
);


/* =========================================================
   MAP
   ========================================================= */

function initMap() {

    const mapElement = el("map");

    if (!mapElement) {
        return;
    }

    if (typeof L === "undefined") {
        console.warn("Leaflet is not loaded.");
        return;
    }

    if (map) {
        return;
    }

    map = L.map("map").setView(
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
        L.marker(
            [
                currentLat,
                currentLon
            ]
        )
        .addTo(map)
        .bindPopup(
            "CBRND Monitoring Location"
        );


    accuracyCircle =
        L.circle(
            [
                currentLat,
                currentLon
            ],
            {

                radius: 50,

                weight: 1,

                fillOpacity: 0.08

            }
        )
        .addTo(map);

}


/* =========================================================
   MAP COMMAND
   ========================================================= */

function openMap() {

    if (!map) {
        initMap();
    }


    const mapCard =
        el("mapCard");

    if (mapCard) {

        mapCard.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    if (map) {

        map.invalidateSize();

        map.setView(
            [
                currentLat,
                currentLon
            ],
            13
        );

    }


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

    getUserLocation();

}


function getUserLocation() {

    if (!navigator.geolocation) {

        updateGPSStatus(
            "GPS NOT SUPPORTED"
        );

        speak(
            "GPS is not supported by this browser."
        );

        return;

    }


    updateGPSStatus(
        "GETTING LOCATION..."
    );


    navigator.geolocation.getCurrentPosition(

        function (position) {

            currentLat =
                position.coords.latitude;

            currentLon =
                position.coords.longitude;


            updateMapLocation();

            updateGPSStatus(
                "GPS ACTIVE"
            );


            safeText(
                "latitude",
                currentLat.toFixed(6)
            );

            safeText(
                "longitude",
                currentLon.toFixed(6)
            );


            safeText(
                "gpsStatus",
                "GPS ACTIVE"
            );


            addHistory(
                "GPS",
                "Location updated"
            );

        },

        function (error) {

            console.warn(
                "GPS Error:",
                error
            );


            updateGPSStatus(
                "GPS ERROR"
            );

        },

        {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 30000

        }

    );

}


/* =========================================================
   UPDATE MAP LOCATION
   ========================================================= */

function updateMapLocation() {

    if (!map) {
        return;
    }


    const position = [
        currentLat,
        currentLon
    ];


    if (userMarker) {

        userMarker.setLatLng(
            position
        );

    }


    if (accuracyCircle) {

        accuracyCircle.setLatLng(
            position
        );

    }


    map.setView(
        position,
        13
    );

}


/* =========================================================
   GPS STATUS
   ========================================================= */

function updateGPSStatus(status) {

    safeText(
        "gpsStatus",
        status
    );

}


/* =========================================================
   ALERT
   ========================================================= */

function activateAlert() {

    alertActive = true;


    const alertCard =
        el("alertCard");

    if (alertCard) {

        alertCard.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    addHistory(
        "ALERT",
        "Alert activated"
    );


    speak(
        "Alert activated."
    );

}


/* =========================================================
   SIREN
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
   START SIREN
   ========================================================= */

function startSiren() {

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        stopSiren();


        sirenOscillator =
            audioContext.createOscillator();

        sirenGain =
            audioContext.createGain();


        sirenOscillator.type =
            "sawtooth";


        sirenGain.gain.value =
            0.15;


        sirenOscillator.connect(
            sirenGain
        );


        sirenGain.connect(
            audioContext.destination
        );


        sirenOscillator.start();


        sirenRunning = true;


        let high = false;


        sirenTimer =
            setInterval(
                function () {

                    if (!sirenOscillator) {
                        return;
                    }


                    sirenOscillator.frequency.setValueAtTime(

                        high
                            ? 700
                            : 1200,

                        audioContext.currentTime

                    );


                    high = !high;

                },

                500
            );


        safeText(
            "sirenStatus",
            "SIREN ACTIVE"
        );


        addHistory(
            "SIREN",
            "Siren activated"
        );


        speak(
            "Siren activated."
        );

    }

    catch (error) {

        console.error(
            "Siren error:",
            error
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

        sirenTimer = null;

    }


    if (sirenOscillator) {

        try {

            sirenOscillator.stop();

        }
        catch (error) {}

        sirenOscillator.disconnect();

        sirenOscillator = null;

    }


    if (sirenGain) {

        sirenGain.disconnect();

        sirenGain = null;

    }


    sirenRunning = false;


    safeText(
        "sirenStatus",
        "SIREN OFF"
    );

}


/* =========================================================
   STOP EVERYTHING
   ========================================================= */

function stopEverything() {

    stopSiren();

    alertActive = false;

    if (recognition && isListening) {

        try {
            recognition.stop();
        }
        catch (error) {}

    }


    isListening = false;


    safeText(
        "voiceStatus",
        "SYSTEM STOPPED"
    );


    addHistory(
        "STOP",
        "All active functions stopped"
    );


    speak(
        "All active functions stopped."
    );

}


/* =========================================================
   REPORT
   ========================================================= */

function openReport() {

    const reportCard =
        el("reportCard");

    if (reportCard) {

        reportCard.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }


    addHistory(
        "REPORT",
        "Report opened"
    );


    speak(
        "Report section opened."
    );

}


/* =========================================================
   OPEN APP
   ========================================================= */

function openApp(app) {

    const url =
        APP_LINKS[app];


    if (!url) {

        speak(
            "Application link is not configured."
        );

        return;

    }


    if (
        url ===
        "YOUR_SOS_SIREN_URL"
    ) {

        speak(
            "SOS siren link is not configured."
        );

        return;

    }


    window.open(
        url,
        "_blank"
    );


    addHistory(
        app.toUpperCase(),
        "Application opened"
    );

}


/* =========================================================
   COMPASS
   ========================================================= */

function openCompass() {

    const url =
        APP_LINKS.compass;


    if (!url) {

        speak(
            "Compass link is not configured."
        );

        return;

    }


    window.open(
        url,
        "_blank"
    );


    addHistory(
        "COMPASS",
        "Compass opened"
    );


    speak(
        "Compass opened."
    );

}


/* =========================================================
   SOCIAL
   ========================================================= */

function openSocial(service) {

    const url =
        SOCIAL_LINKS[service];


    if (!url) {
        return;
    }


    window.open(
        url,
        "_blank"
    );


    addHistory(
        service.toUpperCase(),
        service + " opened"
    );

}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    command,
    result
) {

    const history =
        el("commandHistory");


    if (!history) {
        return;
    }


    const item =
        document.createElement("div");


    item.className =
        "history-item";


    item.innerHTML =

        `<b>${command}</b>` +
        ` — ${result}`;


    history.prepend(
        item
    );


    while (
        history.children.length >
        20
    ) {

        history.removeChild(
            history.lastChild
        );

    }

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


    if (!SpeechRecognition) {

        safeText(
            "voiceStatus",
            "Voice recognition not supported"
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        "hi-IN";


    recognition.onstart =
        function () {

            isListening = true;


            safeText(
                "voiceStatus",
                "🎤 Listening..."
            );

        };


    recognition.onresult =
        function (event) {

            const text =
                event.results[0][0]
                    .transcript
                    .trim();


            safeText(
                "voiceStatus",
                "You said: " + text
            );


            processCommand(
                text
            );

        };


    recognition.onerror =
        function (event) {

            console.warn(
                "Voice error:",
                event.error
            );


            isListening = false;


            safeText(
                "voiceStatus",
                "Voice error. Try again."
            );

        };


    recognition.onend =
        function () {

            isListening = false;

        };


    if (mic) {

        mic.onclick =
            function () {

                if (!recognition) {
                    return;
                }


                if (isListening) {

                    recognition.stop();

                    return;

                }


                try {

                    recognition.start();

                }

                catch (error) {

                    console.warn(
                        error
                    );

                }

            };

    }

}


/* =========================================================
   VOICE COMMAND PROCESSOR
   ========================================================= */

function processCommand(
    command
) {

    const text =
        String(command)
            .toLowerCase()
            .trim();


    /* -----------------------------------------
       ASSISTANT NAME
       ----------------------------------------- */

    if (

        text.includes("your name") ||

        text.includes("what is your name") ||

        text.includes("who are you") ||

        text.includes("tumhara naam") ||

        text.includes("aapka naam") ||

        text.includes("आपका नाम") ||

        text.includes("तुम्हारा नाम")

    ) {

        const message =
            "My name is " +
            ASSISTANT_NAME;

        speak(
            message
        );


        addHistory(
            "NAME",
            ASSISTANT_NAME
        );


        return;

    }


    /* -----------------------------------------
       MOBILE NUMBER
       ----------------------------------------- */

    if (

        text.includes("my mobile") ||

        text.includes("my phone number") ||

        text.includes("my number") ||

        text.includes("mobile number") ||

        text.includes("mobile no") ||

        text.includes("mera mobile") ||

        text.includes("mera number") ||

        text.includes("mera mobile number") ||

        text.includes("मेरा मोबाइल") ||

        text.includes("मेरा नंबर")

    ) {

        if (
            USER_MOBILE ===
            "YOUR_MOBILE_NUMBER"
        ) {

            speak(
                "Your mobile number has not been configured yet."
            );

        }
        else {

            speak(
                "Your mobile number is " +
                USER_MOBILE
            );

        }


        addHistory(
            "MOBILE",
            USER_MOBILE
        );


        return;

    }


    /* -----------------------------------------
       MAP
       ----------------------------------------- */

    if (

        text.includes("open map") ||

        text.includes("show map") ||

        text.includes("map open") ||

        text.includes("नक्शा खोलो") ||

        text.includes("मैप खोलो") ||

        text.includes("मानचित्र खोलो")

    ) {

        openMap();

        return;

    }


    /* -----------------------------------------
       GPS / LOCATION
       ----------------------------------------- */

    if (

        text.includes("get gps") ||

        text.includes("show gps") ||

        text.includes("my location") ||

        text.includes("show location") ||

        text.includes("location") ||

        text.includes("लोकेशन") ||

        text.includes("स्थान") ||

        text.includes("मेरी लोकेशन")

    ) {

        getGPS();

        speak(
            "Getting your location."
        );

        return;

    }


    /* -----------------------------------------
       SIREN ON
       ----------------------------------------- */

    if (

        text.includes("start siren") ||

        text.includes("turn on siren") ||

        text.includes("siren on") ||

        text.includes("सायरन चालू") ||

        text.includes("सायरन शुरू")

    ) {

        if (!sirenRunning) {
            startSiren();
        }

        return;

    }


    /* -----------------------------------------
       SIREN OFF
       ----------------------------------------- */

    if (

        text.includes("stop siren") ||

        text.includes("turn off siren") ||

        text.includes("siren off") ||

        text.includes("सायरन बंद")

    ) {

        stopSiren();

        speak(
            "Siren stopped."
        );

        return;

    }


    /* -----------------------------------------
       ALERT
       ----------------------------------------- */

    if (

        text.includes("activate alert") ||

        text.includes("start alert") ||

        text.includes("alert") ||

        text.includes("अलर्ट") ||

        text.includes("चेतावनी")

    ) {

        activateAlert();

        return;

    }


    /* -----------------------------------------
       STOP
       ----------------------------------------- */

    if (

        text === "stop" ||

        text.includes("stop everything") ||

        text.includes("सब बंद करो") ||

        text.includes("सब बंद") ||

        text.includes("सिस्टम बंद")

    ) {

        stopEverything();

        return;

    }


    /* -----------------------------------------
       QR
       ----------------------------------------- */

    if (

        text.includes("qr") ||

        text.includes("qr generator") ||

        text.includes("qr खोलो") ||

        text.includes("क्यूआर")

    ) {

        openApp(
            "qr"
        );

        return;

    }


    /* -----------------------------------------
       CAMERA
       ----------------------------------------- */

    if (

        text.includes("smart camera") ||

        text.includes("open camera") ||

        text.includes("camera") ||

        text.includes("कैमरा खोलो") ||

        text.includes("स्मार्ट कैमरा")

    ) {

        openApp(
            "camera"
        );

        return;

    }


    /* -----------------------------------------
       SOS
       ----------------------------------------- */

    if (

        text.includes("sos") ||

        text.includes("sos siren") ||

        text.includes("एसओएस")

    ) {

        openApp(
            "sos"
        );

        return;

    }


    /* -----------------------------------------
       LOCATION TRACKER
       ----------------------------------------- */

    if (

        text.includes("location tracker") ||

        text.includes("tracker") ||

        text.includes("लोकेशन ट्रैकर")

    ) {

        openApp(
            "location"
        );

        return;

    }


    /* -----------------------------------------
       COMPASS
       ----------------------------------------- */

    if (

        text.includes("compass") ||

        text.includes("open compass") ||

        text.includes("कम्पास") ||

        text.includes("कंपास")

    ) {

        openCompass();

        return;

    }


    /* -----------------------------------------
       AI VOICE ASSISTANT
       ----------------------------------------- */

    if (

        text.includes("ai voice assistant") ||

        text.includes("voice assistant") ||

        text.includes("ai assistant") ||

        text.includes("एआई असिस्टेंट")

    ) {

        openApp(
            "ai"
        );

        return;

    }


    /* -----------------------------------------
       INSTAGRAM
       ----------------------------------------- */

    if (
        text.includes("instagram")
    ) {

        openSocial(
            "instagram"
        );

        return;

    }


    /* -----------------------------------------
       FACEBOOK
       ----------------------------------------- */

    if (
        text.includes("facebook")
    ) {

        openSocial(
            "facebook"
        );

        return;

    }


    /* -----------------------------------------
       WHATSAPP
       ----------------------------------------- */

    if (
        text.includes("whatsapp")
    ) {

        openSocial(
            "whatsapp"
        );

        return;

    }


    /* -----------------------------------------
       WEATHER
       ----------------------------------------- */

    if (

        text.includes("weather") ||

        text.includes("temperature") ||

        text.includes("मौसम") ||

        text.includes("तापमान")

    ) {

        speakWeather();

        return;

    }


    /* -----------------------------------------
       UNKNOWN COMMAND
       ----------------------------------------- */

    speak(
        "Command not recognized."
    );


    addHistory(
        "VOICE",
        command
    );

}


/* =========================================================
   TEXT TO SPEECH
   ========================================================= */

function speak(
    message
) {

    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            message
        );


    utterance.lang =
        "en-IN";


    utterance.rate =
        0.95;


    utterance.pitch =
        1;


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   WEATHER
   ========================================================= */

async function loadWeather() {

    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +

            "?latitude=" +
            currentLat +

            "&longitude=" +
            currentLon +

            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "surface_pressure," +
            "wind_speed_10m," +
            "precipitation," +
            "cloud_cover" +

            "&timezone=auto";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {
            throw new Error(
                "Weather request failed"
            );
        }


        const data =
            await response.json();


        if (!data.current) {
            return;
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

        Number(
            currentWeather.temperature
        ).toFixed(1) +
        " °C"

    );


    safeText(
        "humidity",

        Number(
            currentWeather.humidity
        ).toFixed(0) +
        " %"

    );


    safeText(
        "pressure",

        Number(
            currentWeather.pressure
        ).toFixed(0) +
        " hPa"

    );


    safeText(
        "wind",

        Number(
            currentWeather.wind
        ).toFixed(1) +
        " km/h"

    );


    safeText(
        "rain",

        Number(
            currentWeather.rain
        ).toFixed(1) +
        " mm"

    );


    safeText(
        "cloud",

        Number(
            currentWeather.cloud
        ).toFixed(0) +
        " %"

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

        loadWeather();

        return;

    }


    const message =

        "Temperature " +

        Number(
            currentWeather.temperature
        ).toFixed(1) +

        " degrees Celsius. " +

        "Humidity " +

        Number(
            currentWeather.humidity
        ).toFixed(0) +

        " percent. " +

        "Pressure " +

        Number(
            currentWeather.pressure
        ).toFixed(0) +

        " hectopascal. " +

        "Wind " +

        Number(
            currentWeather.wind
        ).toFixed(1) +

        " kilometers per hour.";


    speak(
        message
    );

}


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons() {

    /*
       Existing HTML onclick buttons are kept.
       This function intentionally does not create
       additional buttons or extra features.
    */

}


/* =========================================================
   OPTIONAL GLOBAL ACCESS
   ========================================================= */

window.openMap =
    openMap;

window.getGPS =
    getGPS;

window.activateAlert =
    activateAlert;

window.toggleSiren =
    toggleSiren;

window.openReport =
    openReport;

window.stopEverything =
    stopEverything;

window.openApp =
    openApp;

window.openCompass =
    openCompass;

window.openSocial =
    openSocial;

window.processCommand =
    processCommand;

window.startSiren =
    startSiren;

window.stopSiren =
    stopSiren;
