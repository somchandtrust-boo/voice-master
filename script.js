/* =========================================================
   CHOTI ALEXA — CBRND COMMAND CENTER
   FINAL SCRIPT.JS
   Voice + GPS + Map + Alert + Siren + Apps + History
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let map = null;
let userMarker = null;
let accuracyCircle = null;

let recognition = null;
let isListening = false;

let sirenActive = false;
let alertActive = false;

let sirenContext = null;
let sirenOscillator = null;
let sirenGain = null;

let currentPosition = null;


/* =========================================================
   APP LINKS
   ========================================================= */

const APP_LINKS = {

    qr:
        "https://somchandtrust-boo.github.io/cbrnd-qr-generator/",

    camera:
        "https://somchandtrust-boo.github.io/hd-smart-camera/",

    sos:
        "https://somchandtrust-boo.github.io/CBRND-SOS-Siren/",

    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html",

    compass:
        "https://somchandtrust-boo.github.io/cbrnd-compass/",

    ai:
        "https://my-alexa.onrender.com/"
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
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initMap();

    initVoiceRecognition();

    initMobileSystem();

    loadHistory();

    updateMapStatus("READY");

    console.log("Choti Alexa Command Center READY");

});


/* =========================================================
   MAP INITIALIZATION
   ========================================================= */

function initMap() {

    const mapElement = document.getElementById("map");

    if (!mapElement) {
        console.warn("Map element not found");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet not loaded");
        updateMapStatus("MAP ERROR");
        return;
    }

    map = L.map("map", {
        zoomControl: true,
        attributionControl: true
    }).setView(
        [23.0225, 72.5714],
        11
    );


    /* OpenStreetMap */

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);


    /* Default Ahmedabad marker */

    L.marker([
        23.0225,
        72.5714
    ])
    .addTo(map)
    .bindPopup(
        "<b>CBRND Command Center</b><br>Ahmedabad"
    );


    setTimeout(() => {

        map.invalidateSize();

    }, 400);
}


/* =========================================================
   OPEN MAP
   ========================================================= */

function openMap() {

    addHistory(
        "OPEN MAP",
        "Live GPS map opened"
    );

    if (!map) {
        initMap();
    }

    const mapElement = document.getElementById("map");

    if (mapElement) {

        mapElement.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

    if (map) {

        setTimeout(() => {

            map.invalidateSize();

        }, 300);

    }

    updateMapStatus("MAP ACTIVE");

    speak(
        "Live map is open."
    );
}


/* =========================================================
   GPS
   ========================================================= */

function getGPS() {

    addHistory(
        "GPS",
        "Requesting real location..."
    );

    updateMapStatus("LOCATING...");

    if (!navigator.geolocation) {

        showModal(
            "GPS ERROR",
            "Geolocation is not supported by this browser."
        );

        updateMapStatus("GPS NOT SUPPORTED");

        return;
    }


    navigator.geolocation.getCurrentPosition(

        position => {

            currentPosition = position;

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;

            const accuracy =
                position.coords.accuracy;


            showUserLocation(
                lat,
                lon,
                accuracy
            );


            const message =
                "Location found. Latitude " +
                lat.toFixed(6) +
                ", Longitude " +
                lon.toFixed(6);


            addHistory(
                "GPS",
                message
            );


            updateMapStatus("GPS LOCKED");


            showModal(
                "GPS LOCATION",
                `
                <b>Latitude:</b> ${lat.toFixed(6)}<br>
                <b>Longitude:</b> ${lon.toFixed(6)}<br>
                <b>Accuracy:</b> ${Math.round(accuracy)} meters
                `
            );


            speak(
                "Your current location has been found."
            );

        },

        error => {

            let message =
                "Unable to get location.";

            if (error.code === 1) {
                message =
                    "Location permission was denied.";
            }

            if (error.code === 2) {
                message =
                    "Location is unavailable.";
            }

            if (error.code === 3) {
                message =
                    "Location request timed out.";
            }


            addHistory(
                "GPS",
                message
            );


            updateMapStatus(
                "GPS ERROR"
            );


            showModal(
                "GPS",
                message
            );


            speak(message);

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );
}


/* =========================================================
   SHOW USER LOCATION
   ========================================================= */

function showUserLocation(
    lat,
    lon,
    accuracy
) {

    if (!map) {
        initMap();
    }

    if (!map) return;


    if (userMarker) {

        map.removeLayer(
            userMarker
        );

    }


    if (accuracyCircle) {

        map.removeLayer(
            accuracyCircle
        );

    }


    userMarker =
        L.marker(
            [lat, lon]
        )
        .addTo(map)
        .bindPopup(
            `
            <b>YOUR LOCATION</b><br>
            Latitude: ${lat.toFixed(6)}<br>
            Longitude: ${lon.toFixed(6)}<br>
            Accuracy: ${Math.round(accuracy)} m
            `
        );


    accuracyCircle =
        L.circle(
            [lat, lon],
            {
                radius: accuracy,
                color: "#13ddff",
                fillColor: "#13ddff",
                fillOpacity: 0.08,
                weight: 1
            }
        )
        .addTo(map);


    map.setView(
        [lat, lon],
        16,
        {
            animate: true
        }
    );


    userMarker.openPopup();
}


/* =========================================================
   MAP STATUS
   ========================================================= */

function updateMapStatus(
    status
) {

    const element =
        document.getElementById(
            "mapStatus"
        );

    if (element) {
        element.textContent =
            status;
    }
}


/* =========================================================
   ALERT SYSTEM
   ========================================================= */

function activateAlert() {

    const alertElement =
        document.getElementById(
            "alertMode"
        );


    alertActive =
        !alertActive;


    if (alertActive) {

        if (alertElement) {

            alertElement.classList.add(
                "active"
            );

        }


        addHistory(
            "ALERT",
            "Emergency alert activated"
        );


        showModal(
            "EMERGENCY ALERT",
            "Emergency alert mode is now ACTIVE."
        );


        speak(
            "Emergency alert activated."
        );


    } else {

        if (alertElement) {

            alertElement.classList.remove(
                "active"
            );

        }


        addHistory(
            "ALERT",
            "Emergency alert deactivated"
        );


        speak(
            "Emergency alert deactivated."
        );

    }
}


/* =========================================================
   SIREN
   ========================================================= */

function toggleSiren() {

    if (sirenActive) {

        stopSiren();

    } else {

        startSiren();

    }
}


/* =========================================================
   START SIREN
   ========================================================= */

function startSiren() {

    if (sirenActive) return;


    try {

        sirenContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        sirenOscillator =
            sirenContext.createOscillator();


        sirenGain =
            sirenContext.createGain();


        sirenOscillator.type =
            "sawtooth";


        sirenOscillator.frequency.value =
            650;


        sirenGain.gain.value =
            0.08;


        sirenOscillator.connect(
            sirenGain
        );


        sirenGain.connect(
            sirenContext.destination
        );


        sirenOscillator.start();


        sirenActive = true;


        const text =
            document.getElementById(
                "sirenText"
            );


        if (text) {
            text.textContent =
                "Stop siren";
        }


        addHistory(
            "SIREN",
            "Siren started"
        );


        speak(
            "Siren started."
        );


        runSirenSweep();


    } catch (error) {

        console.error(
            "Siren error:",
            error
        );

        showModal(
            "SIREN",
            "Unable to start siren in this browser."
        );

    }
}


/* =========================================================
   SIREN SWEEP
   ========================================================= */

function runSirenSweep() {

    if (
        !sirenActive ||
        !sirenContext ||
        !sirenOscillator
    ) {
        return;
    }


    const now =
        sirenContext.currentTime;


    sirenOscillator.frequency
        .cancelScheduledValues(now);


    sirenOscillator.frequency
        .setValueAtTime(
            500,
            now
        );


    sirenOscillator.frequency
        .linearRampToValueAtTime(
            1000,
            now + 0.65
        );


    sirenOscillator.frequency
        .linearRampToValueAtTime(
            500,
            now + 1.3
        );


    setTimeout(
        runSirenSweep,
        1300
    );
}


/* =========================================================
   STOP SIREN
   ========================================================= */

function stopSiren() {

    sirenActive = false;


    try {

        if (sirenOscillator) {

            sirenOscillator.stop();

            sirenOscillator.disconnect();

        }


        if (sirenGain) {

            sirenGain.disconnect();

        }


        if (sirenContext) {

            sirenContext.close();

        }

    } catch (error) {

        console.warn(
            "Siren stop:",
            error
        );

    }


    sirenOscillator = null;
    sirenGain = null;
    sirenContext = null;


    const text =
        document.getElementById(
            "sirenText"
        );


    if (text) {

        text.textContent =
            "Start siren";

    }


    addHistory(
        "SIREN",
        "Siren stopped"
    );


    speak(
        "Siren stopped."
    );
}


/* =========================================================
   STOP EVERYTHING
   ========================================================= */

function stopEverything() {

    stopSiren();


    alertActive = false;


    const alertElement =
        document.getElementById(
            "alertMode"
        );


    if (alertElement) {

        alertElement.classList.remove(
            "active"
        );

    }


    window.speechSynthesis.cancel();


    if (recognition && isListening) {

        try {

            recognition.stop();

        } catch (e) {}

    }


    addHistory(
        "STOP",
        "All active systems stopped"
    );


    showModal(
        "SYSTEM STOP",
        "All active CBRND systems have been stopped."
    );

}


/* =========================================================
   APP OPEN
   ========================================================= */

function openApp(
    app
) {

    const url =
        APP_LINKS[app];


    if (!url) {

        showModal(
            "APP ERROR",
            "Application link is not configured."
        );

        return;
    }


    addHistory(
        "OPEN APP",
        app.toUpperCase()
    );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );


    speak(
        "Opening " +
        app.replace(
            /-/g,
            " "
        )
    );
}


/* =========================================================
   COMPASS
   ========================================================= */

function openCompass() {

    const url =
        APP_LINKS.compass;


    addHistory(
        "COMPASS",
        "Opening digital compass"
    );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );


    speak(
        "Opening compass."
    );
}


/* =========================================================
   SOCIAL APPS
   ========================================================= */

function openSocial(
    platform
) {

    const url =
        SOCIAL_LINKS[platform];


    if (!url) return;


    addHistory(
        "SOCIAL",
        "Opening " +
        platform
    );


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );


    speak(
        "Opening " +
        platform
    );
}


/* =========================================================
   MOBILE SYSTEM
   ========================================================= */

function initMobileSystem() {

    const input =
        document.getElementById(
            "userMobile"
        );


    const button =
        document.getElementById(
            "saveMobileBtn"
        );


    const status =
        document.getElementById(
            "mobileStatus"
        );


    const saved =
        localStorage.getItem(
            "chotiAlexaMobile"
        );


    if (saved && input) {

        input.value =
            saved;

        if (status) {

            status.textContent =
                "Mobile number saved • Choti Alexa ready";

        }

    }


    if (button) {

        button.addEventListener(
            "click",
            saveMobileNumber
        );

    }
}


/* =========================================================
   SAVE MOBILE
   ========================================================= */

function saveMobileNumber() {

    const input =
        document.getElementById(
            "userMobile"
        );


    const status =
        document.getElementById(
            "mobileStatus"
        );


    if (!input) return;


    const number =
        input.value.trim();


    if (!number) {

        if (status) {

            status.textContent =
                "Please enter your mobile number.";

        }

        return;
    }


    localStorage.setItem(
        "chotiAlexaMobile",
        number
    );


    if (status) {

        status.textContent =
            "Mobile number saved successfully.";

    }


    addHistory(
        "MOBILE",
        "Mobile number saved"
    );


    speak(
        "Your mobile number has been saved."
    );
}


/* =========================================================
   ASSISTANT NAME
   ========================================================= */

function getAssistantName() {

    return "Choti Alexa";

}


/* =========================================================
   VOICE RECOGNITION
   ========================================================= */

function initVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        const status =
            document.getElementById(
                "voiceStatus"
            );


        if (status) {

            status.textContent =
                "Voice recognition is not supported in this browser.";

        }

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        "en-IN";


    recognition.maxAlternatives =
        3;


    recognition.onstart =
        () => {

            isListening = true;


            const mic =
                document.getElementById(
                    "mic"
                );


            const status =
                document.getElementById(
                    "voiceStatus"
                );


            if (mic) {

                mic.classList.add(
                    "listening"
                );

            }


            if (status) {

                status.textContent =
                    "Listening... बोलिए...";

            }

        };


    recognition.onresult =
        event => {

            const result =
                event.results[
                    event.results.length - 1
                ][0].transcript;


            handleVoiceCommand(
                result
            );

        };


    recognition.onerror =
        event => {

            console.warn(
                "Voice error:",
                event.error
            );


            const status =
                document.getElementById(
                    "voiceStatus"
                );


            if (status) {

                if (
                    event.error ===
                    "not-allowed"
                ) {

                    status.textContent =
                        "Microphone permission denied.";

                } else {

                    status.textContent =
                        "Voice error. Try again.";

                }

            }

        };


    recognition.onend =
        () => {

            isListening = false;


            const mic =
                document.getElementById(
                    "mic"
                );


            if (mic) {

                mic.classList.remove(
                    "listening"
                );

            }

        };


    const mic =
        document.getElementById(
            "mic"
        );


    if (mic) {

        mic.addEventListener(
            "click",
            startListening
        );

    }

}


/* =========================================================
   START LISTENING
   ========================================================= */

function startListening() {

    if (!recognition) {

        showModal(
            "VOICE",
            "Speech recognition is not supported. Please use Chrome or Edge."
        );

        return;
    }


    if (isListening) {

        try {

            recognition.stop();

        } catch (e) {}

        return;
    }


    try {

        recognition.lang =
            "en-IN";

        recognition.start();

    } catch (error) {

        console.warn(
            "Recognition start:",
            error
        );

    }
}


/* =========================================================
   VOICE COMMAND ENGINE
   ========================================================= */

function handleVoiceCommand(
    rawCommand
) {

    const command =
        rawCommand
            .toLowerCase()
            .trim();


    const status =
        document.getElementById(
            "voiceStatus"
        );


    if (status) {

        status.textContent =
            "Command: " +
            rawCommand;

    }


    addHistory(
        "VOICE",
        rawCommand
    );


    /* MAP */

    if (
        containsAny(
            command,
            [
                "open map",
                "show map",
                "live map",
                "map kholo",
                "naksha kholo",
                "नक्शा खोलो",
                "मैप खोलो",
                "मानचित्र खोलो"
            ]
        )
    ) {

        openMap();
        return;
    }


    /* GPS */

    if (
        containsAny(
            command,
            [
                "get gps",
                "get location",
                "show location",
                "my location",
                "location batao",
                "location dikhao",
                "meri location",
                "मेरी लोकेशन",
                "लोकेशन बताओ",
                "लोकेशन दिखाओ"
            ]
        )
    ) {

        getGPS();
        return;
    }


    /* ALERT */

    if (
        containsAny(
            command,
            [
                "activate alert",
                "start alert",
                "emergency alert",
                "alert on",
                "alert chalu",
                "alert चालू",
                "अलर्ट चालू करो",
                "emergency"
            ]
        )
    ) {

        activateAlert();
        return;
    }


    /* SIREN START */

    if (
        containsAny(
            command,
            [
                "start siren",
                "siren on",
                "siren start",
                "siren chalu",
                "siren चालू",
                "सायरन चालू करो",
                "सायरन शुरू करो"
            ]
        )
    ) {

        if (!sirenActive) {

            startSiren();

        }

        return;
    }


    /* SIREN STOP */

    if (
        containsAny(
            command,
            [
                "stop siren",
                "siren off",
                "siren band",
                "siren बंद",
                "सायरन बंद करो"
            ]
        )
    ) {

        if (sirenActive) {

            stopSiren();

        }

        return;
    }


    /* STOP EVERYTHING */

    if (
        containsAny(
            command,
            [
                "stop everything",
                "stop all",
                "system stop",
                "sab band",
                "sab kuch band",
                "सब बंद करो",
                "सब कुछ बंद करो",
                "सिस्टम बंद करो"
            ]
        )
    ) {

        stopEverything();
        return;
    }


    /* QR */

    if (
        containsAny(
            command,
            [
                "open qr",
                "qr generator",
                "qr kholo",
                "qr खोलो",
                "क्यूआर खोलो"
            ]
        )
    ) {

        openApp("qr");
        return;
    }


    /* CAMERA */

    if (
        containsAny(
            command,
            [
                "open camera",
                "smart camera",
                "camera kholo",
                "camera खोलो",
                "कैमरा खोलो"
            ]
        )
    ) {

        openApp("camera");
        return;
    }


    /* SOS */

    if (
        containsAny(
            command,
            [
                "open sos",
                "sos siren",
                "sos kholo",
                "sos खोलो",
                "एसओएस खोलो"
            ]
        )
    ) {

        openApp("sos");
        return;
    }


    /* LOCATION TRACKER */

    if (
        containsAny(
            command,
            [
                "location tracker",
                "open tracker",
                "tracker kholo",
                "ट्रैकर खोलो"
            ]
        )
    ) {

        openApp("location");
        return;
    }


    /* COMPASS */

    if (
        containsAny(
            command,
            [
                "open compass",
                "compass kholo",
                "compass खोलो",
                "कम्पास खोलो",
                "दिशासूचक खोलो"
            ]
        )
    ) {

        openCompass();
        return;
    }


    /* AI */

    if (
        containsAny(
            command,
            [
                "open ai",
                "open ai assistant",
                "ai voice assistant",
                "ai kholo",
                "ai खोलो",
                "एआई खोलो"
            ]
        )
    ) {

        openApp("ai");
        return;
    }


    /* INSTAGRAM */

    if (
        containsAny(
            command,
            [
                "open instagram",
                "instagram kholo",
                "instagram खोलो"
            ]
        )
    ) {

        openSocial(
            "instagram"
        );

        return;
    }


    /* FACEBOOK */

    if (
        containsAny(
            command,
            [
                "open facebook",
                "facebook kholo",
                "facebook खोलो"
            ]
        )
    ) {

        openSocial(
            "facebook"
        );

        return;
    }


    /* WHATSAPP */

    if (
        containsAny(
            command,
            [
                "open whatsapp",
                "whatsapp kholo",
                "whatsapp खोलो",
                "व्हाट्सएप खोलो"
            ]
        )
    ) {

        openSocial(
            "whatsapp"
        );

        return;
    }


    /* ASSISTANT NAME */

    if (
        containsAny(
            command,
            [
                "what is your name",
                "what's your name",
                "your name",
                "who are you",
                "tumhara naam",
                "aapka naam",
                "आपका नाम क्या है",
                "तुम्हारा नाम क्या है"
            ]
        )
    ) {

        const answer =
            "My name is Choti Alexa.";

        showVoiceAnswer(
            answer
        );

        speak(
            answer
        );

        return;
    }


    /* MOBILE NUMBER */

    if (
        containsAny(
            command,
            [
                "my mobile number",
                "my phone number",
                "mera mobile number",
                "mera phone number",
                "मेरा मोबाइल नंबर",
                "मेरा फोन नंबर"
            ]
        )
    ) {

        const number =
            localStorage.getItem(
                "chotiAlexaMobile"
            );


        if (number) {

            const answer =
                "Your saved mobile number is " +
                number;

            showVoiceAnswer(
                answer
            );

            speak(
                "Your saved mobile number is " +
                number
            );

        } else {

            const answer =
                "No mobile number is saved yet.";

            showVoiceAnswer(
                answer
            );

            speak(
                answer
            );
        }

        return;
    }


    /* HELLO */

    if (
        containsAny(
            command,
            [
                "hello",
                "hi choti alexa",
                "hello choti alexa",
                "namaste",
                "नमस्ते",
                "हेलो"
            ]
        )
    ) {

        const answer =
            "Hello. Choti Alexa is ready.";

        showVoiceAnswer(
            answer
        );

        speak(
            answer
        );

        return;
    }


    /* UNKNOWN */

    const unknown =
        "I did not understand that command.";


    if (status) {

        status.textContent =
            unknown;

    }


    speak(
        unknown
    );
}


/* =========================================================
   COMMAND MATCHER
   ========================================================= */

function containsAny(
    text,
    words
) {

    return words.some(
        word =>
            text.includes(
                word.toLowerCase()
            )
    );
}


/* =========================================================
   VOICE RESPONSE DISPLAY
   ========================================================= */

function showVoiceAnswer(
    message
) {

    const status =
        document.getElementById(
            "voiceStatus"
        );


    if (status) {

        status.textContent =
            message;

    }


    addHistory(
        "ALEXA",
        message
    );
}


/* =========================================================
   SPEECH OUTPUT
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


    utterance.lang =
        detectSpeechLanguage(
            text
        );


    utterance.rate =
        0.92;


    utterance.pitch =
        1.02;


    utterance.volume =
        1;


    window.speechSynthesis.speak(
        utterance
    );
}


/* =========================================================
   SPEECH LANGUAGE
   ========================================================= */

function detectSpeechLanguage(
    text
) {

    if (
        /[\u0900-\u097F]/.test(
            text
        )
    ) {

        return "hi-IN";

    }


    return "en-IN";
}


/* =========================================================
   HISTORY
   ========================================================= */

function addHistory(
    command,
    result
) {

    const history =
        document.getElementById(
            "history"
        );


    if (!history) return;


    const item =
        document.createElement(
            "div"
        );


    item.className =
        "historyItem";


    const time =
        new Date()
            .toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


    item.innerHTML = `

        <div class="historyTime">
            ${escapeHTML(time)}
        </div>

        <div class="historyCommand">
            ${escapeHTML(command)}
        </div>

        <div class="historyResult">
            ${escapeHTML(result)}
        </div>

    `;


    history.prepend(
        item
    );


    while (
        history.children.length > 50
    ) {

        history.removeChild(
            history.lastChild
        );

    }


    saveHistory();
}


/* =========================================================
   SAVE HISTORY
   ========================================================= */

function saveHistory() {

    const history =
        document.getElementById(
            "history"
        );


    if (!history) return;


    localStorage.setItem(
        "chotiAlexaHistory",
        history.innerHTML
    );
}


/* =========================================================
   LOAD HISTORY
   ========================================================= */

function loadHistory() {

    const history =
        document.getElementById(
            "history"
        );


    if (!history) return;


    const saved =
        localStorage.getItem(
            "chotiAlexaHistory"
        );


    if (saved) {

        history.innerHTML =
            saved;

    }
}


/* =========================================================
   CLEAR HISTORY
   ========================================================= */

function clearHistory() {

    const history =
        document.getElementById(
            "history"
        );


    if (history) {

        history.innerHTML =
            "";

    }


    localStorage.removeItem(
        "chotiAlexaHistory"
    );


    addHistory(
        "HISTORY",
        "Command history cleared"
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
        document.getElementById(
            "modal"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalText =
        document.getElementById(
            "modalText"
        );


    if (!modal) return;


    if (modalTitle) {

        modalTitle.textContent =
            title;

    }


    if (modalText) {

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
        document.getElementById(
            "modal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }
}


/* =========================================================
   MODAL BACKGROUND CLICK
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "modal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


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
   GLOBAL EXPORTS
   HTML onclick="" KE LIYE
   ========================================================= */

window.openMap =
    openMap;

window.getGPS =
    getGPS;

window.activateAlert =
    activateAlert;

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

window.clearHistory =
    clearHistory;

window.closeModal =
    closeModal;


/* =========================================================
   FINAL STATUS
   ========================================================= */

console.log(
    "========================================"
);

console.log(
    "CHOTI ALEXA — CBRND COMMAND CENTER"
);

console.log(
    "VOICE + GPS + MAP + SIREN + APPS READY"
);

console.log(
    "========================================"
);
