/* =========================================================
   CBRND ENVIRONMENT COMMAND CENTER
   MAP V5
   PART 1 — BASIC FOUNDATION
   ========================================================= */

"use strict";


/* =========================================================
   1. APP LINKS
   ========================================================= */

const APP_LINKS = {

    qr:
        "https://somchandtrust-boo.github.io/CBRND-QR",

    camera:
        "https://somchandtrust-boo.github.io/hd-smart-camera/",

    sos:
        "YOUR_SOS_SIREN_URL",

    location:
        "https://somchandtrust-boo.github.io/CBRND-Location-Tracker/admin.html"
};


/* =========================================================
   2. MAIN APPLICATION VARIABLES
   ========================================================= */

let map = null;

let currentLat = 23.0225;
let currentLon = 72.5714;

let currentWeather = null;

let currentMetric = "temperature";

let gpsMarker = null;
let gpsAccuracyCircle = null;

let searchMarker = null;

let weatherChart = null;

let isListening = false;


/* =========================================================
   3. WEATHER MAP VARIABLES
   ========================================================= */

let weatherGridLayer = null;

let windLayer = null;

let mapWeatherCache = [];

let mapGridLoading = false;

let mapGridRequestId = 0;

let mapRefreshTimer = null;

let mapMoveTimer = null;


/* =========================================================
   4. BASE MAP LAYERS
   ========================================================= */

let streetLayer = null;

let topoLayer = null;

let satelliteLayer = null;


/* =========================================================
   5. MAP SEARCH
   ========================================================= */

let mapSearchControl = null;


/* =========================================================
   6. MAP V5 CANVAS VARIABLES
   ========================================================= */

let mapWeatherCanvas = null;

let mapWeatherCtx = null;

let mapWindCanvas = null;

let mapWindCtx = null;


/* =========================================================
   7. MAP V5 ANIMATION
   ========================================================= */

let mapAnimationFrame = null;

let mapAnimationRunning = false;

let windParticles = [];


/* =========================================================
   8. MAP V5 RADAR
   ========================================================= */

let radarLayer = null;

let radarFrames = [];

let radarFrameIndex = 0;

let radarTimer = null;


/* =========================================================
   9. MAP V5 SETTINGS
   ========================================================= */

const MAP_V5 = {

    weatherOpacity: 0.50,

    windOpacity: 0.85,

    radarOpacity: 0.65,

    radarFrameSpeed: 900,

    particleCount:
        window.innerWidth < 700
            ? 80
            : 220

};


/* =========================================================
   10. APPLICATION START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "CBRND Environment Command Center V5"
        );

        console.log(
            "PART 1 INITIALIZED"
        );

        initMap();

    }
);


/* =========================================================
   11. INITIALIZE MAP
   ========================================================= */

function initMap() {

    console.log(
        "Initializing Leaflet map..."
    );


    /* -----------------------------------------
       CREATE MAP
       ----------------------------------------- */

    map = L.map(
        "map",
        {

            center: [
                currentLat,
                currentLon
            ],

            zoom: 9,

            minZoom: 3,

            maxZoom: 19,

            zoomControl: true,

            preferCanvas: true

        }
    );


    /* -----------------------------------------
       OPEN STREET MAP
       ----------------------------------------- */

    streetLayer = L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            maxZoom: 19,

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    );


    /* -----------------------------------------
       ADD DEFAULT MAP
       ----------------------------------------- */

    streetLayer.addTo(map);


    console.log(
        "Leaflet map ready."
    );


    /* -----------------------------------------
       MAP V5 FOUNDATION
       ----------------------------------------- */

    createMapV5Canvas();

    createMapV5Status();

    setupMapV5Events();

}


/* =========================================================
   12. CREATE WEATHER CANVAS
   ========================================================= */

function createMapV5Canvas() {

    if (!map) {

        console.warn(
            "Map is not initialized."
        );

        return;

    }


    const container =
        map.getContainer();


    /* -----------------------------------------
       WEATHER CANVAS
       ----------------------------------------- */

    if (!mapWeatherCanvas) {

        mapWeatherCanvas =
            document.createElement(
                "canvas"
            );

        mapWeatherCanvas.id =
            "cbrndWeatherCanvas";

        mapWeatherCanvas.style.position =
            "absolute";

        mapWeatherCanvas.style.left =
            "0px";

        mapWeatherCanvas.style.top =
            "0px";

        mapWeatherCanvas.style.width =
            "100%";

        mapWeatherCanvas.style.height =
            "100%";

        mapWeatherCanvas.style.pointerEvents =
            "none";

        mapWeatherCanvas.style.zIndex =
            "350";


        container.appendChild(
            mapWeatherCanvas
        );


        mapWeatherCtx =
            mapWeatherCanvas.getContext(
                "2d"
            );

    }


    /* -----------------------------------------
       WIND CANVAS
       ----------------------------------------- */

    if (!mapWindCanvas) {

        mapWindCanvas =
            document.createElement(
                "canvas"
            );

        mapWindCanvas.id =
            "cbrndWindCanvas";

        mapWindCanvas.style.position =
            "absolute";

        mapWindCanvas.style.left =
            "0px";

        mapWindCanvas.style.top =
            "0px";

        mapWindCanvas.style.width =
            "100%";

        mapWindCanvas.style.height =
            "100%";

        mapWindCanvas.style.pointerEvents =
            "none";

        mapWindCanvas.style.zIndex =
            "360";


        container.appendChild(
            mapWindCanvas
        );


        mapWindCtx =
            mapWindCanvas.getContext(
                "2d"
            );

    }


    resizeMapV5Canvas();


    console.log(
        "Map V5 canvas created."
    );

}


/* =========================================================
   13. RESIZE CANVAS
   ========================================================= */

function resizeMapV5Canvas() {

    if (!map) return;


    const size =
        map.getSize();


    const scale =
        window.innerWidth < 700
            ? 0.35
            : 0.50;


    const width =
        Math.max(
            1,
            Math.floor(
                size.x * scale
            )
        );


    const height =
        Math.max(
            1,
            Math.floor(
                size.y * scale
            )
        );


    if (mapWeatherCanvas) {

        mapWeatherCanvas.width =
            width;

        mapWeatherCanvas.height =
            height;

        mapWeatherCanvas.style.width =
            size.x + "px";

        mapWeatherCanvas.style.height =
            size.y + "px";

    }


    if (mapWindCanvas) {

        mapWindCanvas.width =
            width;

        mapWindCanvas.height =
            height;

        mapWindCanvas.style.width =
            size.x + "px";

        mapWindCanvas.style.height =
            size.y + "px";

    }

}


/* =========================================================
   14. MAP STATUS
   ========================================================= */

function createMapV5Status() {

    if (!map) return;


    const container =
        map.getContainer();


    if (
        document.getElementById(
            "cbrndMapV5Status"
        )
    ) {

        return;

    }


    const status =
        document.createElement(
            "div"
        );


    status.id =
        "cbrndMapV5Status";


    status.innerHTML =
        "CBRND MAP V5 • READY";


    status.style.position =
        "absolute";


    status.style.top =
        "12px";


    status.style.left =
        "50%";


    status.style.transform =
        "translateX(-50%)";


    status.style.zIndex =
        "999";


    status.style.padding =
        "7px 14px";


    status.style.borderRadius =
        "50px";


    status.style.background =
        "rgba(5,15,30,0.80)";


    status.style.border =
        "1px solid rgba(0,220,255,0.5)";


    status.style.color =
        "#ffffff";


    status.style.fontSize =
        "11px";


    status.style.fontWeight =
        "700";


    status.style.letterSpacing =
        "0.6px";


    status.style.pointerEvents =
        "none";


    container.appendChild(
        status
    );

}


/* =========================================================
   15. UPDATE MAP STATUS
   ========================================================= */

function setMapV5Status(text) {

    const status =
        document.getElementById(
            "cbrndMapV5Status"
        );


    if (status) {

        status.textContent =
            text;

    }

}


/* =========================================================
   16. MAP EVENTS
   ========================================================= */

function setupMapV5Events() {

    if (!map) return;


    map.on(
        "resize",
        () => {

            resizeMapV5Canvas();

        }
    );


    map.on(
        "zoomend",
        () => {

            resizeMapV5Canvas();

        }
    );


    map.on(
        "moveend",
        () => {

            resizeMapV5Canvas();

        }
    );


    window.addEventListener(
        "resize",
        () => {

            resizeMapV5Canvas();

        }
    );


    console.log(
        "Map V5 events connected."
    );

}


/* =========================================================
   17. TEST MESSAGE
   ========================================================= */

console.log(
    "========================================"
);

console.log(
    "CBRND MAP V5"
);

console.log(
    "PART 1 — BASIC FOUNDATION READY"
);

console.log(
    "========================================"
);
/* =========================================================
   CBRND MAP V5 — PART 2
   BASE MAP + V5 CONTROLS
   Add at END of script.js
   ========================================================= */

(function(){
"use strict";

function cbrndMapV5Controls(){
    if(typeof map==="undefined" || !map){
        setTimeout(cbrndMapV5Controls,500);
        return;
    }

    if(document.getElementById("cbrndMapV5Controls")) return;

    const box=document.createElement("div");
    box.id="cbrndMapV5Controls";
    box.innerHTML=`
        <div class="cbrnd-v5-title">CBRND WEATHER</div>
        <button data-metric="temperature" class="active">🌡️ Temperature</button>
        <button data-metric="humidity">💧 Humidity</button>
        <button data-metric="pressure">🧭 Pressure</button>
        <button data-metric="wind">💨 Wind</button>
        <button data-metric="rain">🌧️ Rain</button>
        <button data-metric="cloud">☁️ Cloud</button>
        <button id="cbrndV5Radar">📡 Radar</button>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndMapV5Controls{
            position:absolute;
            top:12px;
            left:12px;
            z-index:1000;
            width:170px;
            padding:10px;
            border:1px solid rgba(0,255,255,.35);
            border-radius:16px;
            background:rgba(5,15,28,.88);
            backdrop-filter:blur(12px);
            box-shadow:0 0 25px rgba(0,255,255,.18);
        }
        #cbrndMapV5Controls .cbrnd-v5-title{
            color:#00ffff;
            font-size:11px;
            font-weight:800;
            letter-spacing:1.5px;
            margin-bottom:8px;
            text-align:center;
        }
        #cbrndMapV5Controls button{
            width:100%;
            margin:3px 0;
            padding:8px 7px;
            border:1px solid rgba(255,255,255,.12);
            border-radius:10px;
            background:rgba(255,255,255,.06);
            color:#fff;
            font-size:12px;
            text-align:left;
            cursor:pointer;
            transition:.2s;
        }
        #cbrndMapV5Controls button:hover{
            background:rgba(0,255,255,.14);
            border-color:rgba(0,255,255,.5);
            transform:translateX(2px);
        }
        #cbrndMapV5Controls button.active{
            background:rgba(0,255,255,.18);
            border-color:#00ffff;
            box-shadow:0 0 12px rgba(0,255,255,.18);
            color:#00ffff;
        }
        #cbrndV5Radar.active{
            background:rgba(255,80,80,.18);
            border-color:#ff6666;
            color:#ff8888;
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(box);

    box.querySelectorAll("[data-metric]").forEach(btn=>{
        btn.addEventListener("click",()=>{
            box.querySelectorAll("[data-metric]").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");

            const metric=btn.dataset.metric;
            window.CBRND_MAP_V5_METRIC=metric;

            if(typeof setWeatherMetric==="function"){
                setWeatherMetric(metric);
            }

            console.log("CBRND MAP V5 METRIC:",metric);
        });
    });

    const radarBtn=document.getElementById("cbrndV5Radar");

    radarBtn.addEventListener("click",()=>{
        radarBtn.classList.toggle("active");

        if(typeof window.CBRND_MAP_V5_RADAR_TOGGLE==="function"){
            window.CBRND_MAP_V5_RADAR_TOGGLE(radarBtn.classList.contains("active"));
        }

        console.log(
            "CBRND RADAR:",
            radarBtn.classList.contains("active") ? "ON" : "OFF"
        );
    });

    console.log("CBRND MAP V5 PART 2 READY");
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(cbrndMapV5Controls,300);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 3
   OPEN-METEO LIVE WEATHER GRID
   Add at END of script.js
   ========================================================= */

(function(){
"use strict";

const V5_GRID={
    points:[],
    timer:null,
    loading:false,
    requestId:0
};

function v5GridSize(){
    if(typeof map==="undefined"||!map)return 5;
    const z=map.getZoom();
    if(z<=6)return 5;
    if(z<=8)return 6;
    if(z<=10)return 7;
    return 8;
}

function v5VisiblePoints(){
    const bounds=map.getBounds();
    const n=v5GridSize();
    const north=bounds.getNorth();
    const south=bounds.getSouth();
    const east=bounds.getEast();
    const west=bounds.getWest();
    const points=[];

    for(let y=0;y<n;y++){
        const lat=south+(north-south)*(y/(n-1));

        for(let x=0;x<n;x++){
            const lon=west+(east-west)*(x/(n-1));
            points.push({
                lat:Number(lat.toFixed(4)),
                lon:Number(lon.toFixed(4))
            });
        }
    }

    return points;
}

async function loadV5WeatherGrid(){
    if(V5_GRID.loading)return;
    if(typeof map==="undefined"||!map)return;

    V5_GRID.loading=true;
    const request=++V5_GRID.requestId;

    try{
        const points=v5VisiblePoints();

        const latitudes=points.map(p=>p.lat).join(",");
        const longitudes=points.map(p=>p.lon).join(",");

        const url=
            "https://api.open-meteo.com/v1/forecast"+
            "?latitude="+encodeURIComponent(latitudes)+
            "&longitude="+encodeURIComponent(longitudes)+
            "&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover"+
            "&timezone=auto";

        const response=await fetch(url,{cache:"no-store"});

        if(!response.ok){
            throw new Error("Open-Meteo HTTP "+response.status);
        }

        const data=await response.json();

        if(request!==V5_GRID.requestId)return;

        const rows=Array.isArray(data)?data:[data];

        V5_GRID.points=rows.map((item,i)=>({
            lat:points[i].lat,
            lon:points[i].lon,
            temperature:item.current?.temperature_2m??null,
            humidity:item.current?.relative_humidity_2m??null,
            pressure:item.current?.surface_pressure??null,
            wind:item.current?.wind_speed_10m??null,
            direction:item.current?.wind_direction_10m??0,
            rain:item.current?.precipitation??0,
            cloud:item.current?.cloud_cover??null
        }));

        window.CBRND_MAP_V5_DATA=V5_GRID.points;

        console.log(
            "CBRND MAP V5 GRID:",
            V5_GRID.points.length,
            "live points"
        );

        if(typeof window.CBRND_MAP_V5_RENDER==="function"){
            window.CBRND_MAP_V5_RENDER(V5_GRID.points);
        }

        if(typeof updateMapInfo==="function"){
            updateMapInfo();
        }

    }catch(error){
        console.error("CBRND MAP V5 WEATHER ERROR:",error);
    }finally{
        V5_GRID.loading=false;
    }
}

function startV5Grid(){
    loadV5WeatherGrid();

    if(V5_GRID.timer){
        clearInterval(V5_GRID.timer);
    }

    V5_GRID.timer=setInterval(
        loadV5WeatherGrid,
        5*60*1000
    );

    map.on("moveend",()=>{
        clearTimeout(V5_GRID.moveTimer);

        V5_GRID.moveTimer=setTimeout(
            loadV5WeatherGrid,
            700
        );
    });

    map.on("zoomend",()=>{
        clearTimeout(V5_GRID.zoomTimer);

        V5_GRID.zoomTimer=setTimeout(
            loadV5WeatherGrid,
            500
        );
    });
}

document.addEventListener("DOMContentLoaded",()=>{
    const wait=setInterval(()=>{
        if(typeof map!=="undefined"&&map){
            clearInterval(wait);
            startV5Grid();
            console.log("CBRND MAP V5 PART 3 READY");
        }
    },500);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 4
   SMOOTH CONTINUOUS WEATHER FIELD
   ========================================================= */

(function(){
"use strict";

const V5_FIELD={
    canvas:null,
    ctx:null,
    ready:false
};

function v5FieldInit(){
    if(V5_FIELD.ready)return;
    if(typeof map==="undefined"||!map){
        setTimeout(v5FieldInit,500);
        return;
    }

    const canvas=document.createElement("canvas");
    canvas.id="cbrndV5WeatherField";

    canvas.style.position="absolute";
    canvas.style.left="0";
    canvas.style.top="0";
    canvas.style.width="100%";
    canvas.style.height="100%";
    canvas.style.zIndex="350";
    canvas.style.pointerEvents="none";

    map.getContainer().appendChild(canvas);

    V5_FIELD.canvas=canvas;
    V5_FIELD.ctx=canvas.getContext("2d");
    V5_FIELD.ready=true;

    v5FieldResize();

    map.on("resize move zoom",v5FieldResize);

    console.log("CBRND MAP V5 FIELD READY");
}

function v5FieldResize(){
    if(!V5_FIELD.canvas)return;

    const size=map.getSize();
    const dpr=Math.min(window.devicePixelRatio||1,2);

    V5_FIELD.canvas.width=size.x*dpr;
    V5_FIELD.canvas.height=size.y*dpr;

    V5_FIELD.canvas.style.width=size.x+"px";
    V5_FIELD.canvas.style.height=size.y+"px";

    V5_FIELD.ctx.setTransform(dpr,0,0,dpr,0,0);

    if(window.CBRND_MAP_V5_DATA){
        v5RenderField(window.CBRND_MAP_V5_DATA);
    }
}

function v5MetricValue(p){
    const metric=window.CBRND_MAP_V5_METRIC||"temperature";

    if(metric==="humidity")return p.humidity;
    if(metric==="pressure")return p.pressure;
    if(metric==="wind")return p.wind;
    if(metric==="rain")return p.rain;
    if(metric==="cloud")return p.cloud;

    return p.temperature;
}

function v5Color(value,min,max){
    if(value===null||value===undefined||!isFinite(value)){
        return "rgba(0,0,0,0)";
    }

    let t=(value-min)/(max-min||1);
    t=Math.max(0,Math.min(1,t));

    const stops=[
        [0,70,0,255],
        [0,180,255,220],
        [0,255,100,220],
        [255,255,0,220],
        [255,150,0,225],
        [255,40,40,230],
        [180,0,255,220]
    ];

    const pos=t*(stops.length-1);
    const i=Math.min(Math.floor(pos),stops.length-2);
    const f=pos-i;

    const a=stops[i];
    const b=stops[i+1];

    const r=Math.round(a[0]+(b[0]-a[0])*f);
    const g=Math.round(a[1]+(b[1]-a[1])*f);
    const bl=Math.round(a[2]+(b[2]-a[2])*f);
    const al=(a[3]+(b[3]-a[3])*f)/255;

    return `rgba(${r},${g},${bl},${al})`;
}

function v5RenderField(points){
    if(!V5_FIELD.ready||!points||!points.length)return;

    const ctx=V5_FIELD.ctx;
    const size=map.getSize();

    ctx.clearRect(0,0,size.x,size.y);

    const valid=points
        .map(v5MetricValue)
        .filter(v=>v!==null&&isFinite(v));

    if(!valid.length)return;

    let min=Math.min(...valid);
    let max=Math.max(...valid);

    if(min===max){
        min-=1;
        max+=1;
    }

    const cells=[];

    points.forEach(p=>{
        const value=v5MetricValue(p);

        if(value===null||!isFinite(value))return;

        const pos=map.latLngToContainerPoint([p.lat,p.lon]);

        cells.push({
            x:pos.x,
            y:pos.y,
            value:value
        });
    });

    if(!cells.length)return;

    const radius=Math.max(
        90,
        Math.min(
            180,
            size.x/v5GridColumns(points)*1.15
        )
    );

    cells.forEach(cell=>{
        const gradient=ctx.createRadialGradient(
            cell.x,
            cell.y,
            0,
            cell.x,
            cell.y,
            radius
        );

        const color=v5Color(
            cell.value,
            min,
            max
        );

        gradient.addColorStop(0,color);
        gradient.addColorStop(.45,color.replace(/,\d+\)$/,",.65)"));
        gradient.addColorStop(1,"rgba(0,0,0,0)");

        ctx.fillStyle=gradient;
        ctx.beginPath();
        ctx.arc(
            cell.x,
            cell.y,
            radius,
            0,
            Math.PI*2
        );
        ctx.fill();
    });

    ctx.globalCompositeOperation="lighter";

    cells.forEach(cell=>{
        const glow=ctx.createRadialGradient(
            cell.x,
            cell.y,
            0,
            cell.x,
            cell.y,
            radius*.55
        );

        glow.addColorStop(
            0,
            v5Color(cell.value,min,max)
        );

        glow.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle=glow;

        ctx.beginPath();
        ctx.arc(
            cell.x,
            cell.y,
            radius*.55,
            0,
            Math.PI*2
        );
        ctx.fill();
    });

    ctx.globalCompositeOperation="source-over";
}

function v5GridColumns(points){
    const lats=[...new Set(points.map(p=>p.lat))];
    return Math.max(2,lats.length);
}

window.CBRND_MAP_V5_RENDER=function(points){
    v5RenderField(points);
};

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(v5FieldInit,700);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 5
   ANIMATED WIND PARTICLES
   ========================================================= */

(function(){
"use strict";

const V5_WIND={
    canvas:null,
    ctx:null,
    particles:[],
    ready:false,
    frame:null,
    lastTime:0
};

function v5WindInit(){
    if(V5_WIND.ready)return;
    if(typeof map==="undefined"||!map){
        setTimeout(v5WindInit,500);
        return;
    }

    const canvas=document.createElement("canvas");
    canvas.id="cbrndV5WindParticles";

    canvas.style.position="absolute";
    canvas.style.left="0";
    canvas.style.top="0";
    canvas.style.width="100%";
    canvas.style.height="100%";
    canvas.style.zIndex="360";
    canvas.style.pointerEvents="none";

    map.getContainer().appendChild(canvas);

    V5_WIND.canvas=canvas;
    V5_WIND.ctx=canvas.getContext("2d");
    V5_WIND.ready=true;

    v5WindResize();
    v5CreateParticles();
    map.on("resize",v5WindResize);
    map.on("move zoom",v5WindReset);

    v5WindAnimate();

    console.log("CBRND MAP V5 PART 5 READY");
}

function v5WindResize(){
    if(!V5_WIND.canvas)return;

    const size=map.getSize();
    const dpr=Math.min(window.devicePixelRatio||1,2);

    V5_WIND.canvas.width=size.x*dpr;
    V5_WIND.canvas.height=size.y*dpr;
    V5_WIND.canvas.style.width=size.x+"px";
    V5_WIND.canvas.style.height=size.y+"px";

    V5_WIND.ctx.setTransform(dpr,0,0,dpr,0,0);
    v5CreateParticles();
}

function v5WindReset(){
    if(!V5_WIND.ready)return;
    v5CreateParticles();
}

function v5CreateParticles(){
    if(!V5_WIND.ready)return;

    const size=map.getSize();
    const count=Math.min(
        500,
        Math.max(180,Math.floor(size.x*size.y/9000))
    );

    V5_WIND.particles=[];

    for(let i=0;i<count;i++){
        V5_WIND.particles.push({
            x:Math.random()*size.x,
            y:Math.random()*size.y,
            age:Math.random()*100,
            maxAge:70+Math.random()*100,
            speed:.6+Math.random()*1.8,
            size:.7+Math.random()*1.4
        });
    }
}

function v5GetWind(){
    const data=window.CBRND_MAP_V5_DATA;

    if(!data||!data.length){
        return {
            speed:10,
            direction:0
        };
    }

    let totalSpeed=0;
    let totalDirection=0;
    let count=0;

    data.forEach(p=>{
        if(isFinite(p.wind)){
            totalSpeed+=p.wind;
            totalDirection+=isFinite(p.direction)?p.direction:0;
            count++;
        }
    });

    if(!count){
        return {
            speed:10,
            direction:0
        };
    }

    return {
        speed:totalSpeed/count,
        direction:totalDirection/count
    };
}

function v5WindAnimate(time){
    if(!V5_WIND.ready)return;

    const ctx=V5_WIND.ctx;
    const size=map.getSize();

    if(!V5_WIND.lastTime){
        V5_WIND.lastTime=time||0;
    }

    const delta=Math.min(
        40,
        ((time||0)-V5_WIND.lastTime)
    );

    V5_WIND.lastTime=time||0;

    ctx.clearRect(0,0,size.x,size.y);

    const wind=v5GetWind();

    const direction=(wind.direction*Math.PI)/180;

    const speed=Math.max(
        .5,
        Math.min(5,wind.speed/8)
    );

    ctx.lineWidth=1.4;
    ctx.lineCap="round";

    V5_WIND.particles.forEach(p=>{
        const oldX=p.x;
        const oldY=p.y;

        p.x+=Math.sin(direction)*speed*p.speed*delta*.08;
        p.y-=Math.cos(direction)*speed*p.speed*delta*.08;

        p.age+=delta*.06;

        if(
            p.x<-30||
            p.x>size.x+30||
            p.y<-30||
            p.y>size.y+30||
            p.age>p.maxAge
        ){
            p.x=Math.random()*size.x;
            p.y=Math.random()*size.y;
            p.age=0;
            p.maxAge=70+Math.random()*100;
        }

        const alpha=Math.max(
            0,
            Math.min(
                .85,
                1-p.age/p.maxAge
            )
        );

        ctx.strokeStyle=`rgba(220,255,255,${alpha})`;

        ctx.beginPath();
        ctx.moveTo(oldX,oldY);
        ctx.lineTo(p.x,p.y);
        ctx.stroke();

        ctx.fillStyle=`rgba(255,255,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            p.size,
            0,
            Math.PI*2
        );
        ctx.fill();
    });

    V5_WIND.frame=requestAnimationFrame(v5WindAnimate);
}

window.CBRND_MAP_V5_WIND_TOGGLE=function(enabled){
    if(V5_WIND.canvas){
        V5_WIND.canvas.style.display=
            enabled?"block":"none";
    }
};

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(v5WindInit,1000);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 6
   RAINVIEWER RADAR ANIMATION
   ========================================================= */

(function(){
"use strict";

const V5_RADAR={
    layer:null,
    frames:[],
    index:0,
    timer:null,
    playing:false,
    host:"",
    path:""
};

/* Make radar object available to PART 24 */
window.CBRND_MAP_V5_RADAR=V5_RADAR;


/* =========================================================
   LOAD RADAR DATA
   ========================================================= */

async function v5LoadRadar(){

    try{

        const response=await fetch(
            "https://api.rainviewer.com/public/weather-maps.json",
            {
                cache:"no-store"
            }
        );

        if(!response.ok){
            throw new Error(
                "Radar HTTP "+response.status
            );
        }

        const data=await response.json();

        if(
            !data.radar ||
            !Array.isArray(data.radar.past)
        ){
            throw new Error(
                "Radar data unavailable"
            );
        }

        V5_RADAR.host=data.host || "";

        V5_RADAR.frames=
            data.radar.past || [];

        console.log(
            "CBRND RADAR FRAMES:",
            V5_RADAR.frames.length
        );

        /*
         * If radar was already requested,
         * show first/current frame.
         */

        if(
            V5_RADAR.playing &&
            V5_RADAR.frames.length
        ){

            v5RadarShowFrame(
                V5_RADAR.index
            );

        }

    }catch(error){

        console.error(
            "CBRND RADAR ERROR:",
            error
        );

    }
}


/* =========================================================
   RADAR TILE URL
   ========================================================= */

function v5RadarUrl(frame){

    return (
        V5_RADAR.host+
        frame.path+
        "/256/{z}/{x}/{y}/2/1_1.png"
    );

}


/* =========================================================
   SHOW RADAR FRAME
   ========================================================= */

function v5RadarShowFrame(index){

    if(
        !V5_RADAR.frames.length
    ){
        return;
    }

    index=(
        Number(index)+
        V5_RADAR.frames.length
    )%V5_RADAR.frames.length;

    V5_RADAR.index=index;

    const frame=
        V5_RADAR.frames[index];

    if(
        !frame ||
        !frame.path
    ){
        return;
    }

    if(V5_RADAR.layer){

        try{
            map.removeLayer(
                V5_RADAR.layer
            );
        }catch(e){}

    }

    V5_RADAR.layer=
        L.tileLayer(
            v5RadarUrl(frame),
            {
                opacity:.58,
                zIndex:450,
                tileSize:256,
                maxZoom:7,

                attribution:
                    'Weather data by <a href="https://www.rainviewer.com/" target="_blank">RainViewer</a>'
            }
        );

    V5_RADAR.layer.addTo(map);

}


/* =========================================================
   PLAY RADAR
   ========================================================= */

function v5RadarPlay(){

    if(V5_RADAR.playing){
        return;
    }

    V5_RADAR.playing=true;

    /*
     * Load data if not available.
     */

    if(
        !V5_RADAR.frames.length
    ){

        v5LoadRadar();

    }else{

        v5RadarShowFrame(
            V5_RADAR.index
        );

    }

    clearInterval(
        V5_RADAR.timer
    );

    V5_RADAR.timer=
        setInterval(()=>{

            if(
                !V5_RADAR.playing ||
                !V5_RADAR.frames.length
            ){
                return;
            }

            v5RadarShowFrame(
                V5_RADAR.index+1
            );

        },800);

    console.log(
        "CBRND RADAR: ON"
    );

}


/* =========================================================
   STOP RADAR
   ========================================================= */

function v5RadarStop(){

    V5_RADAR.playing=false;

    clearInterval(
        V5_RADAR.timer
    );

    V5_RADAR.timer=null;

    if(V5_RADAR.layer){

        try{

            map.removeLayer(
                V5_RADAR.layer
            );

        }catch(e){}

        V5_RADAR.layer=null;
    }

    console.log(
        "CBRND RADAR: OFF"
    );

}


/* =========================================================
   PUBLIC RADAR TOGGLE
   ========================================================= */

window.CBRND_MAP_V5_RADAR_TOGGLE=
function(enabled){

    if(enabled){

        v5RadarPlay();

    }else{

        v5RadarStop();

    }

};


/* =========================================================
   PUBLIC RADAR STATUS
   ========================================================= */

window.CBRND_MAP_V5_RADAR_STATUS=
function(){

    return{

        active:
            V5_RADAR.playing,

        frame:
            V5_RADAR.index,

        total:
            V5_RADAR.frames.length,

        loaded:
            V5_RADAR.frames.length>0,

        host:
            V5_RADAR.host

    };

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    ()=>{

        const wait=
            setInterval(()=>{

                if(
                    typeof map!=="undefined" &&
                    map
                ){

                    clearInterval(wait);

                    v5LoadRadar();

                    console.log(
                        "CBRND MAP V5 PART 6 READY — RADAR READY"
                    );

                }

            },500);

    }
);

})();
/* =========================================================
   CBRND MAP V5 — PART 7
   LAYER MANAGER
   ========================================================= */

(function(){
"use strict";

const V5_LAYERS={
    weather:true,
    wind:true,
    radar:false
};

function v5ApplyLayers(){
    const weatherCanvas=document.getElementById("cbrndV5WeatherField");
    const windCanvas=document.getElementById("cbrndV5WindParticles");

    if(weatherCanvas){
        weatherCanvas.style.display=
            V5_LAYERS.weather?"block":"none";
    }

    if(windCanvas){
        windCanvas.style.display=
            V5_LAYERS.wind?"block":"none";
    }

    if(V5_LAYERS.radar){
        if(typeof window.CBRND_MAP_V5_RADAR_TOGGLE==="function"){
            window.CBRND_MAP_V5_RADAR_TOGGLE(true);
        }
    }else{
        if(typeof window.CBRND_MAP_V5_RADAR_TOGGLE==="function"){
            window.CBRND_MAP_V5_RADAR_TOGGLE(false);
        }
    }
}

function v5SetWeather(enabled){
    V5_LAYERS.weather=enabled;
    v5ApplyLayers();
}

function v5SetWind(enabled){
    V5_LAYERS.wind=enabled;
    v5ApplyLayers();
}

function v5SetRadar(enabled){
    V5_LAYERS.radar=enabled;
    v5ApplyLayers();
}

window.CBRND_MAP_V5_LAYERS={
    setWeather:v5SetWeather,
    setWind:v5SetWind,
    setRadar:v5SetRadar,
    getState:()=>({...V5_LAYERS})
};

if(typeof window.CBRND_MAP_V5_RADAR_TOGGLE==="function"){
    const oldRadarToggle=
        window.CBRND_MAP_V5_RADAR_TOGGLE;

    window.CBRND_MAP_V5_RADAR_TOGGLE=function(enabled){
        V5_LAYERS.radar=enabled;
        oldRadarToggle(enabled);
    };
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
        v5ApplyLayers();
        console.log(
            "CBRND MAP V5 PART 7 READY"
        );
    },1500);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 8
   PROFESSIONAL LAYER CONTROLS
   ========================================================= */

(function(){
"use strict";

function v5AdvancedControls(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5Advanced"))return;

    const panel=document.createElement("div");
    panel.id="cbrndV5Advanced";
    panel.innerHTML=`
        <div class="v5-advanced-title">⚙ MAP CONTROL</div>
        <label>Weather opacity <span id="v5WeatherValue">70%</span></label>
        <input id="v5WeatherOpacity" type="range" min="0" max="100" value="70">
        <label>Wind opacity <span id="v5WindValue">85%</span></label>
        <input id="v5WindOpacity" type="range" min="0" max="100" value="85">
        <label>Radar opacity <span id="v5RadarValue">58%</span></label>
        <input id="v5RadarOpacity" type="range" min="0" max="100" value="58">
        <label>Wind speed <span id="v5SpeedValue">1.0x</span></label>
        <input id="v5WindSpeed" type="range" min="20" max="200" value="100">
        <button id="v5ResetControls">↻ RESET</button>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndV5Advanced{
            position:absolute;
            right:12px;
            bottom:45px;
            z-index:1000;
            width:205px;
            padding:12px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:16px;
            background:rgba(5,15,28,.9);
            backdrop-filter:blur(12px);
            box-shadow:0 0 25px rgba(0,255,255,.16);
            color:#fff;
            font-family:Arial,sans-serif;
        }
        #cbrndV5Advanced .v5-advanced-title{
            color:#00ffff;
            text-align:center;
            font-size:11px;
            font-weight:800;
            letter-spacing:1.5px;
            margin-bottom:10px;
        }
        #cbrndV5Advanced label{
            display:flex;
            justify-content:space-between;
            margin:8px 0 3px;
            font-size:10px;
            color:#d9ffff;
        }
        #cbrndV5Advanced label span{
            color:#00ffff;
        }
        #cbrndV5Advanced input[type="range"]{
            width:100%;
            accent-color:#00ffff;
            cursor:pointer;
        }
        #v5ResetControls{
            width:100%;
            margin-top:8px;
            padding:7px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:9px;
            background:rgba(0,255,255,.08);
            color:#00ffff;
            cursor:pointer;
            font-size:10px;
            font-weight:700;
        }
        #v5ResetControls:hover{
            background:rgba(0,255,255,.18);
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(panel);

    const weather=document.getElementById("v5WeatherOpacity");
    const wind=document.getElementById("v5WindOpacity");
    const radar=document.getElementById("v5RadarOpacity");
    const speed=document.getElementById("v5WindSpeed");

    weather.addEventListener("input",()=>{
        const value=Number(weather.value);
        document.getElementById("v5WeatherValue").textContent=value+"%";

        const canvas=document.getElementById("cbrndV5WeatherField");

        if(canvas){
            canvas.style.opacity=value/100;
        }
    });

    wind.addEventListener("input",()=>{
        const value=Number(wind.value);
        document.getElementById("v5WindValue").textContent=value+"%";

        const canvas=document.getElementById("cbrndV5WindParticles");

        if(canvas){
            canvas.style.opacity=value/100;
        }
    });

    radar.addEventListener("input",()=>{
        const value=Number(radar.value);
        document.getElementById("v5RadarValue").textContent=value+"%";

        if(typeof V5_RADAR!=="undefined"&&V5_RADAR.layer){
            V5_RADAR.layer.setOpacity(value/100);
        }
    });

    speed.addEventListener("input",()=>{
        const value=Number(speed.value);
        const multiplier=value/100;

        document.getElementById("v5SpeedValue").textContent=
            multiplier.toFixed(1)+"x";

        window.CBRND_MAP_V5_WIND_SPEED=multiplier;
    });

    document.getElementById("v5ResetControls").addEventListener("click",()=>{
        weather.value=70;
        wind.value=85;
        radar.value=58;
        speed.value=100;

        weather.dispatchEvent(new Event("input"));
        wind.dispatchEvent(new Event("input"));
        radar.dispatchEvent(new Event("input"));
        speed.dispatchEvent(new Event("input"));
    });

    console.log("CBRND MAP V5 PART 8 READY");
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(v5AdvancedControls,1800);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 9
   REAL WIND SPEED + DIRECTION FLOW
   ========================================================= */

(function(){
"use strict";

function v5RealWind(){
    const canvas=document.getElementById("cbrndV5WindParticles");
    if(!canvas)return;
    if(typeof map==="undefined"||!map)return;

    const ctx=canvas.getContext("2d");
    const particles=window.CBRND_V5_WIND_PARTICLES;

    if(!particles)return;

    const data=window.CBRND_MAP_V5_DATA;

    let speed=10;
    let direction=0;

    if(data&&data.length){
        let speedTotal=0;
        let directionX=0;
        let directionY=0;
        let count=0;

        data.forEach(p=>{
            if(!isFinite(p.wind))return;

            const d=(Number(p.direction)||0)*Math.PI/180;

            speedTotal+=Number(p.wind);
            directionX+=Math.sin(d);
            directionY+=Math.cos(d);
            count++;
        });

        if(count){
            speed=speedTotal/count;

            direction=
                Math.atan2(
                    directionX/count,
                    directionY/count
                );
        }
    }

    const multiplier=
        Number(window.CBRND_MAP_V5_WIND_SPEED)||1;

    const flowSpeed=
        Math.max(
            .25,
            Math.min(
                7,
                speed/10
            )
        )*multiplier;

    const size=map.getSize();

    particles.forEach(p=>{
        const oldX=p.x;
        const oldY=p.y;

        p.x+=Math.sin(direction)*flowSpeed;
        p.y-=Math.cos(direction)*flowSpeed;

        p.life++;

        if(
            p.x<-40||
            p.x>size.x+40||
            p.y<-40||
            p.y>size.y+40||
            p.life>p.maxLife
        ){
            p.x=Math.random()*size.x;
            p.y=Math.random()*size.y;
            p.life=0;
            p.maxLife=80+Math.random()*100;
        }

        const alpha=
            Math.max(
                0,
                1-p.life/p.maxLife
            );

        ctx.strokeStyle=
            `rgba(220,255,255,${alpha*.75})`;

        ctx.lineWidth=1.2;

        ctx.beginPath();
        ctx.moveTo(oldX,oldY);
        ctx.lineTo(p.x,p.y);
        ctx.stroke();

        ctx.fillStyle=
            `rgba(255,255,255,${alpha})`;

        ctx.beginPath();
        ctx.arc(
            p.x,
            p.y,
            1.3,
            0,
            Math.PI*2
        );
        ctx.fill();
    });

    window.requestAnimationFrame(v5RealWind);
}

function v5CreateRealParticles(){
    const canvas=document.getElementById("cbrndV5WindParticles");
    if(!canvas||typeof map==="undefined"||!map)return;

    const size=map.getSize();
    const count=Math.min(
        550,
        Math.max(
            220,
            Math.floor(size.x*size.y/7500)
        )
    );

    const particles=[];

    for(let i=0;i<count;i++){
        particles.push({
            x:Math.random()*size.x,
            y:Math.random()*size.y,
            life:Math.random()*100,
            maxLife:80+Math.random()*100
        });
    }

    window.CBRND_V5_WIND_PARTICLES=particles;
}

function v5StartRealWind(){
    const canvas=document.getElementById("cbrndV5WindParticles");

    if(!canvas){
        setTimeout(v5StartRealWind,1000);
        return;
    }

    v5CreateRealParticles();

    if(window.CBRND_V5_WIND_FRAME){
        cancelAnimationFrame(
            window.CBRND_V5_WIND_FRAME
        );
    }

    const oldRequest=window.requestAnimationFrame;

    function loop(){
        v5RealWind();
    }

    window.CBRND_V5_WIND_FRAME=
        requestAnimationFrame(loop);

    console.log(
        "CBRND REAL WIND FLOW ACTIVE"
    );
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(v5StartRealWind,2500);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 10
   LIVE STATUS + WEATHER LEGEND
   ========================================================= */

(function(){
"use strict";

function v5StatusPanel(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5Status"))return;

    const panel=document.createElement("div");
    panel.id="cbrndV5Status";
    panel.innerHTML=`
        <div class="v5-status-head">
            <span class="v5-live-dot"></span>
            CBRND LIVE MAP
        </div>
        <div class="v5-status-row">
            <span>DATA</span>
            <b id="v5DataStatus">CONNECTING</b>
        </div>
        <div class="v5-status-row">
            <span>POINTS</span>
            <b id="v5PointStatus">0</b>
        </div>
        <div class="v5-status-row">
            <span>WIND</span>
            <b id="v5WindStatus">--</b>
        </div>
        <div class="v5-status-row">
            <span>RADAR</span>
            <b id="v5RadarStatus">OFF</b>
        </div>
        <div class="v5-status-time" id="v5UpdateStatus">
            Waiting for data...
        </div>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndV5Status{
            position:absolute;
            left:12px;
            bottom:45px;
            z-index:1000;
            width:185px;
            padding:11px;
            border:1px solid rgba(0,255,255,.28);
            border-radius:15px;
            background:rgba(4,13,25,.88);
            backdrop-filter:blur(12px);
            box-shadow:0 0 20px rgba(0,255,255,.12);
            color:#fff;
            font-family:Arial,sans-serif;
        }
        .v5-status-head{
            color:#00ffff;
            font-size:11px;
            font-weight:800;
            letter-spacing:1px;
            margin-bottom:8px;
        }
        .v5-live-dot{
            display:inline-block;
            width:7px;
            height:7px;
            margin-right:5px;
            border-radius:50%;
            background:#00ff88;
            box-shadow:0 0 9px #00ff88;
            animation:v5Pulse 1.2s infinite;
        }
        .v5-status-row{
            display:flex;
            justify-content:space-between;
            padding:4px 0;
            font-size:9px;
            border-bottom:1px solid rgba(255,255,255,.06);
        }
        .v5-status-row span{
            color:#9eb3c7;
        }
        .v5-status-row b{
            color:#00ffff;
        }
        .v5-status-time{
            margin-top:7px;
            color:#8499ad;
            font-size:8px;
            text-align:center;
        }
        @keyframes v5Pulse{
            50%{opacity:.35;transform:scale(.7)}
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(panel);

    console.log("CBRND MAP V5 STATUS READY");
}

function v5Legend(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5Legend"))return;

    const legend=document.createElement("div");
    legend.id="cbrndV5Legend";
    legend.innerHTML=`
        <div class="v5-legend-title">
            WEATHER INTENSITY
        </div>
        <div class="v5-gradient"></div>
        <div class="v5-gradient-labels">
            <span>LOW</span>
            <span>HIGH</span>
        </div>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndV5Legend{
            position:absolute;
            right:12px;
            top:12px;
            z-index:999;
            width:190px;
            padding:10px;
            border:1px solid rgba(0,255,255,.25);
            border-radius:14px;
            background:rgba(4,13,25,.84);
            backdrop-filter:blur(10px);
            color:#fff;
            pointer-events:none;
        }
        .v5-legend-title{
            font-size:9px;
            color:#00ffff;
            font-weight:800;
            letter-spacing:1px;
            text-align:center;
            margin-bottom:7px;
        }
        .v5-gradient{
            height:10px;
            border-radius:8px;
            background:linear-gradient(
                90deg,
                #0046ff,
                #00bfff,
                #00ff64,
                #ffff00,
                #ff9600,
                #ff2828,
                #b400ff
            );
        }
        .v5-gradient-labels{
            display:flex;
            justify-content:space-between;
            margin-top:4px;
            color:#9eb3c7;
            font-size:7px;
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(legend);

    console.log("CBRND MAP V5 LEGEND READY");
}

function v5UpdateStatus(){
    const data=window.CBRND_MAP_V5_DATA||[];

    const point=document.getElementById("v5PointStatus");
    const dataStatus=document.getElementById("v5DataStatus");
    const windStatus=document.getElementById("v5WindStatus");
    const radarStatus=document.getElementById("v5RadarStatus");
    const update=document.getElementById("v5UpdateStatus");

    if(point){
        point.textContent=data.length;
    }

    if(data.length){
        if(dataStatus){
            dataStatus.textContent="LIVE";
            dataStatus.style.color="#00ff88";
        }

        let total=0;
        let count=0;

        data.forEach(p=>{
            if(isFinite(p.wind)){
                total+=Number(p.wind);
                count++;
            }
        });

        if(windStatus&&count){
            windStatus.textContent=
                (total/count).toFixed(1)+" km/h";
        }

        if(update){
            update.textContent=
                "Updated "+new Date().toLocaleTimeString();
        }
    }

    if(radarStatus){
        const radar=
            typeof V5_RADAR!=="undefined"&&
            V5_RADAR.playing;

        radarStatus.textContent=
            radar?"ON":"OFF";

        radarStatus.style.color=
            radar?"#ff7777":"#9eb3c7";
    }
}

const oldRender=window.CBRND_MAP_V5_RENDER;

window.CBRND_MAP_V5_RENDER=function(points){
    if(typeof oldRender==="function"){
        oldRender(points);
    }

    setTimeout(v5UpdateStatus,50);
};

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
        v5StatusPanel();
        v5Legend();
        v5UpdateStatus();

        setInterval(
            v5UpdateStatus,
            2000
        );

        console.log(
            "CBRND MAP V5 PART 10 READY"
        );
    },2200);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 11
   MAP STYLE SWITCHER
   ========================================================= */

(function(){
"use strict";

function v5MapStyles(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5MapStyles"))return;

    const styleBox=document.createElement("div");
    styleBox.id="cbrndV5MapStyles";
    styleBox.innerHTML=`
        <div class="v5-style-title">🗺 MAP STYLE</div>
        <button data-style="street" class="active">🌐 Street</button>
        <button data-style="satellite">🛰 Satellite</button>
        <button data-style="topo">⛰ Topographic</button>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndV5MapStyles{
            position:absolute;
            top:180px;
            left:12px;
            z-index:1000;
            width:170px;
            padding:10px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:15px;
            background:rgba(4,13,25,.9);
            backdrop-filter:blur(12px);
            box-shadow:0 0 22px rgba(0,255,255,.15);
        }
        .v5-style-title{
            color:#00ffff;
            text-align:center;
            font-size:10px;
            font-weight:800;
            letter-spacing:1px;
            margin-bottom:7px;
        }
        #cbrndV5MapStyles button{
            width:100%;
            padding:7px;
            margin:3px 0;
            border:1px solid rgba(255,255,255,.1);
            border-radius:9px;
            background:rgba(255,255,255,.05);
            color:#fff;
            font-size:11px;
            cursor:pointer;
            text-align:left;
        }
        #cbrndV5MapStyles button:hover{
            background:rgba(0,255,255,.12);
        }
        #cbrndV5MapStyles button.active{
            color:#00ffff;
            border-color:#00ffff;
            background:rgba(0,255,255,.15);
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(styleBox);

    const layers={
        street:typeof streetLayer!=="undefined"?streetLayer:null,
        satellite:typeof satelliteLayer!=="undefined"?satelliteLayer:null,
        topo:typeof topoLayer!=="undefined"?topoLayer:null
    };

    styleBox.querySelectorAll("button").forEach(button=>{
        button.addEventListener("click",()=>{
            const selected=button.dataset.style;

            Object.values(layers).forEach(layer=>{
                if(layer&&map.hasLayer(layer)){
                    map.removeLayer(layer);
                }
            });

            const selectedLayer=layers[selected];

            if(selectedLayer){
                selectedLayer.addTo(map);
            }

            styleBox.querySelectorAll("button").forEach(b=>{
                b.classList.remove("active");
            });

            button.classList.add("active");

            console.log(
                "CBRND MAP STYLE:",
                selected
            );
        });
    });

    console.log("CBRND MAP V5 PART 11 READY");
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(v5MapStyles,2800);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 12
   GPS + SEARCH CONTROL
   ========================================================= */

(function(){
"use strict";

function v5LocationControls(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5Location"))return;

    const box=document.createElement("div");
    box.id="cbrndV5Location";
    box.innerHTML=`
        <div class="v5-location-title">📍 LOCATION</div>
        <div class="v5-search-row">
            <input id="v5MapSearch" type="text" placeholder="Search location...">
            <button id="v5SearchBtn">🔎</button>
        </div>
        <button id="v5GPSBtn">📍 FIND MY LOCATION</button>
        <div id="v5LocationStatus">Ready</div>
    `;

    const style=document.createElement("style");
    style.textContent=`
        #cbrndV5Location{
            position:absolute;
            top:12px;
            left:195px;
            z-index:1000;
            width:245px;
            padding:10px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:15px;
            background:rgba(4,13,25,.9);
            backdrop-filter:blur(12px);
            box-shadow:0 0 22px rgba(0,255,255,.14);
        }
        .v5-location-title{
            color:#00ffff;
            text-align:center;
            font-size:10px;
            font-weight:800;
            letter-spacing:1px;
            margin-bottom:7px;
        }
        .v5-search-row{
            display:flex;
            gap:5px;
        }
        #v5MapSearch{
            flex:1;
            min-width:0;
            padding:8px;
            border:1px solid rgba(255,255,255,.12);
            border-radius:9px;
            outline:none;
            background:rgba(255,255,255,.06);
            color:#fff;
            font-size:11px;
        }
        #v5MapSearch::placeholder{
            color:#8fa5b8;
        }
        #v5SearchBtn{
            width:38px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:9px;
            background:rgba(0,255,255,.1);
            color:#00ffff;
            cursor:pointer;
        }
        #v5GPSBtn{
            width:100%;
            margin-top:6px;
            padding:8px;
            border:1px solid rgba(0,255,255,.3);
            border-radius:9px;
            background:rgba(0,255,255,.08);
            color:#00ffff;
            font-size:10px;
            font-weight:700;
            cursor:pointer;
        }
        #v5GPSBtn:hover,
        #v5SearchBtn:hover{
            background:rgba(0,255,255,.2);
        }
        #v5LocationStatus{
            margin-top:6px;
            color:#8499ad;
            font-size:8px;
            text-align:center;
        }
    `;

    document.head.appendChild(style);
    map.getContainer().appendChild(box);

    const searchInput=document.getElementById("v5MapSearch");
    const searchBtn=document.getElementById("v5SearchBtn");
    const gpsBtn=document.getElementById("v5GPSBtn");
    const status=document.getElementById("v5LocationStatus");

    let marker=null;

    async function searchLocation(){
        const query=searchInput.value.trim();

        if(!query)return;

        status.textContent="Searching...";

        try{
            const url=
                "https://nominatim.openstreetmap.org/search"+
                "?format=json"+
                "&limit=1"+
                "&q="+encodeURIComponent(query);

            const response=await fetch(url,{
                headers:{
                    "Accept":"application/json"
                }
            });

            if(!response.ok){
                throw new Error("Search HTTP "+response.status);
            }

            const results=await response.json();

            if(!results.length){
                status.textContent="Location not found";
                return;
            }

            const result=results[0];
            const lat=Number(result.lat);
            const lon=Number(result.lon);

            map.setView([lat,lon],11,{animate:true});

            if(marker){
                map.removeLayer(marker);
            }

            marker=L.marker([lat,lon])
                .addTo(map)
                .bindPopup(
                    "<b>"+escapeV5Html(result.display_name)+"</b>"
                )
                .openPopup();

            status.textContent=
                lat.toFixed(4)+" , "+lon.toFixed(4);

            window.CBRND_MAP_V5_SEARCH_LOCATION={
                lat,
                lon,
                name:result.display_name
            };

            if(typeof loadV5WeatherGrid==="function"){
                setTimeout(
                    loadV5WeatherGrid,
                    800
                );
            }

        }catch(error){
            console.error(
                "CBRND V5 SEARCH ERROR:",
                error
            );

            status.textContent="Search failed";
        }
    }

    function findGPS(){
        if(!navigator.geolocation){
            status.textContent="GPS unavailable";
            return;
        }

        status.textContent="Getting GPS...";

        navigator.geolocation.getCurrentPosition(
            position=>{
                const lat=position.coords.latitude;
                const lon=position.coords.longitude;

                map.setView(
                    [lat,lon],
                    12,
                    {animate:true}
                );

                if(marker){
                    map.removeLayer(marker);
                }

                marker=L.circleMarker(
                    [lat,lon],
                    {
                        radius:9,
                        color:"#00ffff",
                        weight:3,
                        fillColor:"#00ffff",
                        fillOpacity:.35
                    }
                )
                .addTo(map)
                .bindPopup(
                    "<b>📍 Current Location</b><br>"+
                    lat.toFixed(5)+
                    " , "+
                    lon.toFixed(5)
                )
                .openPopup();

                status.textContent=
                    "GPS: "+
                    lat.toFixed(4)+
                    " , "+
                    lon.toFixed(4);

                window.CBRND_MAP_V5_GPS={
                    lat,
                    lon,
                    accuracy:position.coords.accuracy
                };

                if(typeof loadV5WeatherGrid==="function"){
                    setTimeout(
                        loadV5WeatherGrid,
                        800
                    );
                }
            },
            error=>{
                console.error(
                    "CBRND V5 GPS ERROR:",
                    error
                );

                if(error.code===1){
                    status.textContent=
                        "GPS permission denied";
                }else{
                    status.textContent=
                        "GPS unavailable";
                }
            },
            {
                enableHighAccuracy:true,
                timeout:10000,
                maximumAge:30000
            }
        );
    }

    searchBtn.addEventListener(
        "click",
        searchLocation
    );

    searchInput.addEventListener(
        "keydown",
        event=>{
            if(event.key==="Enter"){
                searchLocation();
            }
        }
    );

    gpsBtn.addEventListener(
        "click",
        findGPS
    );

    console.log(
        "CBRND MAP V5 PART 12 READY"
    );
}

function escapeV5Html(value){
    return String(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(
        v5LocationControls,
        3200
    );
});

})();
/* =========================================================
   CBRND MAP V5 — PART 13
   LIVE VALUES + DYNAMIC LEGEND
   ========================================================= */

(function(){
"use strict";

const V5_LABELS={
    temperature:{unit:"°C",name:"TEMPERATURE"},
    humidity:{unit:"%",name:"HUMIDITY"},
    pressure:{unit:"hPa",name:"PRESSURE"},
    wind:{unit:"km/h",name:"WIND SPEED"},
    rain:{unit:"mm",name:"RAINFALL"},
    cloud:{unit:"%",name:"CLOUD COVER"}
};

function v5ValueLabels(){
    if(typeof map==="undefined"||!map)return;
    if(document.getElementById("cbrndV5Values"))return;

    const layer=L.layerGroup().addTo(map);
    window.CBRND_MAP_V5_VALUE_LAYER=layer;

    window.CBRND_MAP_V5_VALUE_RENDER=function(points){
        layer.clearLayers();

        if(!points||!points.length)return;

        const metric=
            window.CBRND_MAP_V5_METRIC||
            "temperature";

        const info=
            V5_LABELS[metric]||
            V5_LABELS.temperature;

        points.forEach(p=>{
            let value=null;

            if(metric==="humidity")value=p.humidity;
            else if(metric==="pressure")value=p.pressure;
            else if(metric==="wind")value=p.wind;
            else if(metric==="rain")value=p.rain;
            else if(metric==="cloud")value=p.cloud;
            else value=p.temperature;

            if(value===null||!isFinite(value))return;

            let display;

            if(metric==="temperature"){
                display=Number(value).toFixed(1);
            }else if(metric==="pressure"){
                display=Math.round(value);
            }else if(metric==="rain"){
                display=Number(value).toFixed(1);
            }else{
                display=Math.round(value);
            }

            const icon=L.divIcon({
                className:"cbrnd-v5-value-label",
                html:`
                    <div class="v5-value-box">
                        <span>${display}</span>
                        <small>${info.unit}</small>
                    </div>
                `,
                iconSize:[60,25],
                iconAnchor:[30,12]
            });

            L.marker(
                [p.lat,p.lon],
                {
                    icon,
                    interactive:false,
                    keyboard:false,
                    zIndexOffset:500
                }
            ).addTo(layer);
        });
    };

    const style=document.createElement("style");

    style.textContent=`
        .cbrnd-v5-value-label{
            background:transparent;
            border:0;
        }

        .v5-value-box{
            min-width:48px;
            padding:4px 6px;
            border:1px solid rgba(255,255,255,.28);
            border-radius:8px;
            background:rgba(5,15,28,.72);
            box-shadow:0 0 8px rgba(0,255,255,.12);
            color:#fff;
            text-align:center;
            font-family:Arial,sans-serif;
            font-size:10px;
            font-weight:800;
            white-space:nowrap;
            backdrop-filter:blur(4px);
        }

        .v5-value-box small{
            color:#00ffff;
            font-size:7px;
            margin-left:1px;
        }
    `;

    document.head.appendChild(style);

    console.log(
        "CBRND MAP V5 VALUES READY"
    );
}

function v5DynamicLegend(){
    const legend=
        document.getElementById(
            "cbrndV5Legend"
        );

    if(!legend)return;

    const title=
        legend.querySelector(
            ".v5-legend-title"
        );

    const labels=
        legend.querySelector(
            ".v5-gradient-labels"
        );

    const metric=
        window.CBRND_MAP_V5_METRIC||
        "temperature";

    const info=
        V5_LABELS[metric]||
        V5_LABELS.temperature;

    if(title){
        title.textContent=
            info.name+" • "+info.unit;
    }

    const data=
        window.CBRND_MAP_V5_DATA||[];

    const values=data
        .map(p=>{
            if(metric==="humidity")return p.humidity;
            if(metric==="pressure")return p.pressure;
            if(metric==="wind")return p.wind;
            if(metric==="rain")return p.rain;
            if(metric==="cloud")return p.cloud;
            return p.temperature;
        })
        .filter(v=>isFinite(v));

    if(labels&&values.length){
        const min=Math.min(...values);
        const max=Math.max(...values);

        labels.innerHTML=`
            <span>${min.toFixed(1)} ${info.unit}</span>
            <span>${max.toFixed(1)} ${info.unit}</span>
        `;
    }
}

const oldRender=
    window.CBRND_MAP_V5_RENDER;

window.CBRND_MAP_V5_RENDER=function(points){
    if(typeof oldRender==="function"){
        oldRender(points);
    }

    if(typeof window.CBRND_MAP_V5_VALUE_RENDER==="function"){
        window.CBRND_MAP_V5_VALUE_RENDER(points);
    }

    setTimeout(
        v5DynamicLegend,
        50
    );
};

const oldMetric=
    window.CBRND_MAP_V5_METRIC;

document.addEventListener("DOMContentLoaded",()=>{
    setTimeout(()=>{
        v5ValueLabels();
        v5DynamicLegend();

        setInterval(
            v5DynamicLegend,
            2000
        );

        console.log(
            "CBRND MAP V5 PART 13 READY"
        );
    },3500);
});

})();
/* =========================================================
   CBRND MAP V5 — PART 14
   PERFORMANCE + SMOOTH RENDERING
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 14: map not ready");
    return;
}

/* ---------------------------------------------------------
   1. MOVEMENT SMOOTHING
   --------------------------------------------------------- */

const movingLayers = [
    document.getElementById("cbrndV5WeatherField"),
    document.getElementById("cbrndV5WindParticles")
];

function setMapMoving(state){
    movingLayers.forEach(el=>{
        if(!el) return;
        el.style.transition = "opacity .18s ease";
        el.style.opacity = state ? "0.35" : "1";
    });

    const valueLayer = window.CBRND_MAP_V5_VALUE_LAYER;
    if(valueLayer){
        const container = valueLayer.getPane ?
            valueLayer.getPane() : null;

        if(container){
            container.style.transition = "opacity .18s ease";
            container.style.opacity = state ? "0.25" : "1";
        }
    }
}

map.on("movestart",()=>{
    setMapMoving(true);
});

map.on("zoomstart",()=>{
    setMapMoving(true);
});

map.on("moveend",()=>{
    setMapMoving(false);

    requestAnimationFrame(()=>{
        if(window.CBRND_MAP_V5_DATA &&
           typeof window.CBRND_MAP_V5_RENDER==="function"){
            window.CBRND_MAP_V5_RENDER(
                window.CBRND_MAP_V5_DATA
            );
        }
    });
});

map.on("zoomend",()=>{
    setMapMoving(false);

    requestAnimationFrame(()=>{
        if(window.CBRND_MAP_V5_DATA &&
           typeof window.CBRND_MAP_V5_RENDER==="function"){
            window.CBRND_MAP_V5_RENDER(
                window.CBRND_MAP_V5_DATA
            );
        }
    });
});


/* ---------------------------------------------------------
   2. SMART WEATHER VALUE LABELS
   --------------------------------------------------------- */

const valueLayer = window.CBRND_MAP_V5_VALUE_LAYER;

if(valueLayer){

    window.CBRND_MAP_V5_VALUE_RENDER = function(points){

        valueLayer.clearLayers();

        if(!points || !points.length) return;

        const zoom = map.getZoom();

        /* Hide labels when zoomed too far out */
        if(zoom < 7) return;

        let step = 3;

        if(zoom >= 10){
            step = 1;
        }else if(zoom >= 8){
            step = 2;
        }

        const metric =
            window.CBRND_MAP_V5_METRIC || "temperature";

        const labels = {
            temperature:["temperature","°C"],
            humidity:["humidity","%"],
            pressure:["pressure","hPa"],
            wind:["wind","km/h"],
            rain:["rain","mm"],
            cloud:["cloud","%"]
        };

        const info =
            labels[metric] || labels.temperature;

        points.forEach((p,index)=>{

            if(index % step !== 0) return;

            let value = Number(p[info[0]]);

            if(!Number.isFinite(value)) return;

            value = Math.round(value * 10) / 10;

            const icon = L.divIcon({
                className:"cbrnd-v5-value-label",
                html:
                    `<div>
                        <b>${value}</b>
                        <small>${info[1]}</small>
                    </div>`,
                iconSize:[68,28],
                iconAnchor:[34,14]
            });

            L.marker(
                [p.lat,p.lon],
                {
                    icon:icon,
                    interactive:false,
                    keyboard:false
                }
            ).addTo(valueLayer);

        });
    };
}


/* ---------------------------------------------------------
   3. LABEL STYLE
   --------------------------------------------------------- */

if(!document.getElementById("cbrndV5Part14Style")){

    const style=document.createElement("style");

    style.id="cbrndV5Part14Style";

    style.textContent=`
    .cbrnd-v5-value-label{
        background:transparent !important;
        border:0 !important;
    }

    .cbrnd-v5-value-label div{
        min-width:58px;
        padding:5px 7px;
        text-align:center;
        border-radius:999px;
        color:#fff;
        font-family:Arial,sans-serif;
        font-size:11px;
        line-height:1;
        background:rgba(5,12,25,.78);
        border:1px solid rgba(0,220,255,.65);
        box-shadow:
            0 0 8px rgba(0,220,255,.35),
            inset 0 0 8px rgba(0,220,255,.08);
        backdrop-filter:blur(5px);
        white-space:nowrap;
    }

    .cbrnd-v5-value-label b{
        font-size:12px;
    }

    .cbrnd-v5-value-label small{
        font-size:8px;
        opacity:.75;
        margin-left:2px;
    }

    #cbrndV5WeatherField,
    #cbrndV5WindParticles{
        pointer-events:none !important;
    }
    `;

    document.head.appendChild(style);
}


/* ---------------------------------------------------------
   4. RENDER SCHEDULER
   --------------------------------------------------------- */

let renderQueued=false;

window.CBRND_MAP_V5_SCHEDULE_RENDER=function(){

    if(renderQueued) return;

    renderQueued=true;

    requestAnimationFrame(()=>{

        renderQueued=false;

        const data=window.CBRND_MAP_V5_DATA;

        if(
            data &&
            data.length &&
            typeof window.CBRND_MAP_V5_RENDER==="function"
        ){
            window.CBRND_MAP_V5_RENDER(data);
        }

    });
};


/* ---------------------------------------------------------
   5. MAP RESIZE HANDLER
   --------------------------------------------------------- */

let resizeTimer=null;

window.addEventListener("resize",()=>{

    clearTimeout(resizeTimer);

    resizeTimer=setTimeout(()=>{

        if(map){
            map.invalidateSize({
                animate:false
            });
        }

        if(window.CBRND_MAP_V5_SCHEDULE_RENDER){
            window.CBRND_MAP_V5_SCHEDULE_RENDER();
        }

    },180);

});


/* ---------------------------------------------------------
   6. PREVENT DOUBLE CLICK SELECTION
   --------------------------------------------------------- */

document.addEventListener("dragstart",e=>{
    if(
        e.target.closest("#map") &&
        !e.target.closest("input")
    ){
        e.preventDefault();
    }
});


/* ---------------------------------------------------------
   7. PERFORMANCE STATUS
   --------------------------------------------------------- */

window.CBRND_MAP_V5_PERFORMANCE={
    optimized:true,
    smartLabels:true,
    smoothMovement:true,
    scheduledRender:true
};

console.log(
    "CBRND MAP V5 PART 14 READY — PERFORMANCE OPTIMIZED"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 15
   LIVE GRID AUTO REFRESH + SEARCH/GPS FIX
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 15: map not ready");
    return;
}

/* ---------------------------------------------------------
   1. GLOBAL GRID LOADER
   --------------------------------------------------------- */

function getGridLoader(){

    if(typeof window.CBRND_MAP_V5_LOAD_GRID==="function"){
        return window.CBRND_MAP_V5_LOAD_GRID;
    }

    return null;
}


/* ---------------------------------------------------------
   2. FALLBACK WEATHER GRID LOADER
   --------------------------------------------------------- */

let loading=false;
let requestId=0;

async function refreshGrid(){

    const loader=getGridLoader();

    /* Use original PART 3 loader when available */
    if(loader){
        try{
            await loader();
            return;
        }catch(err){
            console.warn("Original grid loader failed:",err);
        }
    }

    if(loading) return;

    loading=true;

    const id=++requestId;

    try{

        const center=map.getCenter();
        const bounds=map.getBounds();

        const south=bounds.getSouth();
        const north=bounds.getNorth();
        const west=bounds.getWest();
        const east=bounds.getEast();

        const zoom=map.getZoom();

        let rows=5;

        if(zoom>=8) rows=6;
        if(zoom>=10) rows=7;
        if(zoom>=12) rows=8;

        const cols=rows;

        const points=[];

        for(let r=0;r<rows;r++){

            const lat=
                south+
                (north-south)*
                (r/(rows-1));

            for(let c=0;c<cols;c++){

                const lon=
                    west+
                    (east-west)*
                    (c/(cols-1));

                points.push({
                    lat:lat,
                    lon:lon
                });

            }
        }

        const lats=points
            .map(p=>p.lat.toFixed(4))
            .join(",");

        const lons=points
            .map(p=>p.lon.toFixed(4))
            .join(",");

        const url=
            "https://api.open-meteo.com/v1/forecast"+
            "?latitude="+encodeURIComponent(lats)+
            "&longitude="+encodeURIComponent(lons)+
            "&current="+
            "temperature_2m,"+
            "relative_humidity_2m,"+
            "surface_pressure,"+
            "wind_speed_10m,"+
            "wind_direction_10m,"+
            "precipitation,"+
            "cloud_cover"+
            "&timezone=auto";

        const response=await fetch(url,{
            cache:"no-store"
        });

        if(!response.ok){
            throw new Error(
                "Open-Meteo HTTP "+response.status
            );
        }

        const data=await response.json();

        if(id!==requestId) return;

        const list=Array.isArray(data)
            ? data
            : [data];

        const result=[];

        list.forEach((item,index)=>{

            const current=item.current || {};
            const source=points[index];

            if(!source) return;

            result.push({
                lat:source.lat,
                lon:source.lon,

                temperature:
                    Number(current.temperature_2m ?? 0),

                humidity:
                    Number(current.relative_humidity_2m ?? 0),

                pressure:
                    Number(current.surface_pressure ?? 0),

                wind:
                    Number(current.wind_speed_10m ?? 0),

                direction:
                    Number(current.wind_direction_10m ?? 0),

                rain:
                    Number(current.precipitation ?? 0),

                cloud:
                    Number(current.cloud_cover ?? 0)
            });

        });

        window.CBRND_MAP_V5_DATA=result;

        if(typeof window.CBRND_MAP_V5_RENDER==="function"){
            window.CBRND_MAP_V5_RENDER(result);
        }

        console.log(
            "CBRND MAP V5 GRID UPDATED:",
            result.length,
            "points"
        );

    }catch(error){

        console.error(
            "CBRND MAP V5 GRID ERROR:",
            error
        );

    }finally{

        loading=false;

    }
}


/* ---------------------------------------------------------
   3. EXPOSE GLOBAL LOADER
   --------------------------------------------------------- */

window.CBRND_MAP_V5_LOAD_GRID=refreshGrid;


/* ---------------------------------------------------------
   4. SEARCH / GPS LOCATION CHANGE HOOK
   --------------------------------------------------------- */

function refreshAfterLocationChange(){

    setTimeout(()=>{

        if(
            typeof window.CBRND_MAP_V5_LOAD_GRID==="function"
        ){
            window.CBRND_MAP_V5_LOAD_GRID();
        }

    },350);

}


/* ---------------------------------------------------------
   5. WATCH SEARCH LOCATION
   --------------------------------------------------------- */

let lastSearchLat=null;
let lastSearchLon=null;

setInterval(()=>{

    const location=
        window.CBRND_MAP_V5_SEARCH_LOCATION;

    if(!location) return;

    if(
        location.lat!==lastSearchLat ||
        location.lon!==lastSearchLon
    ){

        lastSearchLat=location.lat;
        lastSearchLon=location.lon;

        map.setView(
            [location.lat,location.lon],
            Math.max(map.getZoom(),9),
            {animate:true}
        );

        refreshAfterLocationChange();

    }

},700);


/* ---------------------------------------------------------
   6. WATCH GPS LOCATION
   --------------------------------------------------------- */

let lastGpsLat=null;
let lastGpsLon=null;

setInterval(()=>{

    const gps=
        window.CBRND_MAP_V5_GPS;

    if(!gps) return;

    if(
        gps.lat!==lastGpsLat ||
        gps.lon!==lastGpsLon
    ){

        lastGpsLat=gps.lat;
        lastGpsLon=gps.lon;

        map.setView(
            [gps.lat,gps.lon],
            Math.max(map.getZoom(),9),
            {animate:true}
        );

        refreshAfterLocationChange();

    }

},700);


/* ---------------------------------------------------------
   7. MAP MOVE / ZOOM REFRESH
   --------------------------------------------------------- */

let moveTimer=null;

function scheduleGridRefresh(){

    clearTimeout(moveTimer);

    moveTimer=setTimeout(()=>{

        if(
            typeof window.CBRND_MAP_V5_LOAD_GRID==="function"
        ){
            window.CBRND_MAP_V5_LOAD_GRID();
        }

    },900);
}

map.on("moveend",scheduleGridRefresh);
map.on("zoomend",scheduleGridRefresh);


/* ---------------------------------------------------------
   8. AUTOMATIC 5-MINUTE UPDATE
   --------------------------------------------------------- */

setInterval(()=>{

    if(
        typeof window.CBRND_MAP_V5_LOAD_GRID==="function"
    ){
        window.CBRND_MAP_V5_LOAD_GRID();
    }

},5*60*1000);


/* ---------------------------------------------------------
   9. INITIAL GRID
   --------------------------------------------------------- */

setTimeout(()=>{

    window.CBRND_MAP_V5_LOAD_GRID();

},1200);


/* ---------------------------------------------------------
   10. STATUS
   --------------------------------------------------------- */

window.CBRND_MAP_V5_GRID_STATUS={
    active:true,
    autoRefresh:"5 minutes",
    searchRefresh:true,
    gpsRefresh:true,
    moveRefresh:true
};

console.log(
    "CBRND MAP V5 PART 15 READY — LIVE GRID AUTO REFRESH ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 16
   LIVE RADAR + WEATHER MODE SYNC
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 16: map not ready");
    return;
}

/* ---------------------------------------------------------
   RADAR STATE
   --------------------------------------------------------- */

let radarActive=false;

window.CBRND_MAP_V5_RADAR_ACTIVE=false;


/* ---------------------------------------------------------
   RADAR TOGGLE
   --------------------------------------------------------- */

window.CBRND_MAP_V5_SET_RADAR=function(state){

    radarActive=!!state;

    window.CBRND_MAP_V5_RADAR_ACTIVE=radarActive;

    if(typeof window.CBRND_MAP_V5_RADAR_TOGGLE==="function"){

        const current=
            window.CBRND_MAP_V5_RADAR_TOGGLE;

        try{
            current(radarActive);
        }catch(error){
            console.warn("Radar toggle error:",error);
        }

    }

    updateRadarButton();
};


/* ---------------------------------------------------------
   RADAR BUTTON
   --------------------------------------------------------- */

function updateRadarButton(){

    const buttons=
        document.querySelectorAll(
            '[data-map-mode="radar"],#v5RadarBtn'
        );

    buttons.forEach(btn=>{

        btn.classList.toggle(
            "active",
            radarActive
        );

        btn.setAttribute(
            "aria-pressed",
            radarActive ? "true" : "false"
        );

        if(btn.dataset.mapMode==="radar" ||
           btn.id==="v5RadarBtn"){

            btn.innerHTML=
                radarActive
                ? "🌧️ Radar ON"
                : "🌧️ Radar";
        }

    });

}


/* ---------------------------------------------------------
   FIND EXISTING RADAR BUTTON
   --------------------------------------------------------- */

setTimeout(()=>{

    const buttons=
        document.querySelectorAll("button");

    buttons.forEach(btn=>{

        const text=
            (btn.innerText || "").toLowerCase();

        if(
            text.includes("radar") &&
            !btn.dataset.v5RadarBound
        ){

            btn.dataset.v5RadarBound="1";

            btn.addEventListener("click",()=>{

                radarActive=!radarActive;

                window.CBRND_MAP_V5_SET_RADAR(
                    radarActive
                );

            });

        }

    });

},500);


/* ---------------------------------------------------------
   WEATHER MODE SYNC
   --------------------------------------------------------- */

const validMetrics=[
    "temperature",
    "humidity",
    "pressure",
    "wind",
    "rain",
    "cloud"
];

window.CBRND_MAP_V5_SET_METRIC=function(metric){

    if(!validMetrics.includes(metric)){
        metric="temperature";
    }

    window.CBRND_MAP_V5_METRIC=metric;

    /* Existing V4 system */
    if(typeof window.setWeatherMetric==="function"){

        try{
            window.setWeatherMetric(metric);
        }catch(error){
            console.warn(
                "Existing weather metric error:",
                error
            );
        }

    }

    /* V5 render */
    if(
        window.CBRND_MAP_V5_DATA &&
        typeof window.CBRND_MAP_V5_RENDER==="function"
    ){

        requestAnimationFrame(()=>{

            window.CBRND_MAP_V5_RENDER(
                window.CBRND_MAP_V5_DATA
            );

        });

    }

    updateMetricButtons();

};


/* ---------------------------------------------------------
   METRIC BUTTONS
   --------------------------------------------------------- */

function updateMetricButtons(){

    document
        .querySelectorAll(
            "[data-map-metric]"
        )
        .forEach(btn=>{

            btn.classList.toggle(
                "active",
                btn.dataset.mapMetric ===
                window.CBRND_MAP_V5_METRIC
            );

        });

}


/* ---------------------------------------------------------
   CONNECT PART 2 BUTTONS
   --------------------------------------------------------- */

setTimeout(()=>{

    document
        .querySelectorAll("button")
        .forEach(btn=>{

            if(btn.dataset.v5MetricBound)
                return;

            const text=
                (btn.innerText || "")
                .trim()
                .toLowerCase();

            let metric=null;

            if(text.includes("temperature"))
                metric="temperature";

            else if(text.includes("humidity"))
                metric="humidity";

            else if(text.includes("pressure"))
                metric="pressure";

            else if(text==="wind" ||
                    text.includes("wind "))
                metric="wind";

            else if(text.includes("rain"))
                metric="rain";

            else if(text.includes("cloud"))
                metric="cloud";

            if(!metric) return;

            btn.dataset.v5MetricBound="1";
            btn.dataset.mapMetric=metric;

            btn.addEventListener(
                "click",
                ()=>window.CBRND_MAP_V5_SET_METRIC(metric)
            );

        });

    updateMetricButtons();
    updateRadarButton();

},700);


/* ---------------------------------------------------------
   RADAR VISUAL STATE
   --------------------------------------------------------- */

if(!document.getElementById("cbrndV5Part16Style")){

    const style=document.createElement("style");

    style.id="cbrndV5Part16Style";

    style.textContent=`

    [data-map-metric].active,
    [data-map-mode="radar"].active,
    #v5RadarBtn.active{
        box-shadow:
            0 0 12px rgba(0,220,255,.75),
            inset 0 0 12px rgba(0,220,255,.18);

        border-color:rgba(0,220,255,.9)!important;

        transform:translateY(-1px);
    }

    `;

    document.head.appendChild(style);
}


/* ---------------------------------------------------------
   PUBLIC STATUS
   --------------------------------------------------------- */

window.CBRND_MAP_V5_MODE_STATUS=function(){

    return {
        metric:
            window.CBRND_MAP_V5_METRIC ||
            "temperature",

        radar:
            window.CBRND_MAP_V5_RADAR_ACTIVE,

        points:
            Array.isArray(window.CBRND_MAP_V5_DATA)
            ? window.CBRND_MAP_V5_DATA.length
            : 0
    };

};


/* ---------------------------------------------------------
   READY
   --------------------------------------------------------- */

console.log(
    "CBRND MAP V5 PART 16 READY — RADAR + WEATHER SYNC ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 17
   ANIMATED RAIN + RADAR PULSE
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 17: map not ready");
    return;
}

/* ---------------------------------------------------------
   RAIN CANVAS
   --------------------------------------------------------- */

let rainCanvas=null;
let rainCtx=null;
let rainDrops=[];
let rainAnimation=null;
let rainRunning=false;

function createRainCanvas(){

    if(rainCanvas) return;

    rainCanvas=document.createElement("canvas");
    rainCanvas.id="cbrndV5RainParticles";

    rainCanvas.style.position="absolute";
    rainCanvas.style.left="0";
    rainCanvas.style.top="0";
    rainCanvas.style.width="100%";
    rainCanvas.style.height="100%";
    rainCanvas.style.pointerEvents="none";
    rainCanvas.style.zIndex="370";
    rainCanvas.style.opacity=".72";

    map.getContainer().appendChild(rainCanvas);

    rainCtx=rainCanvas.getContext("2d");

    resizeRainCanvas();
}

function resizeRainCanvas(){

    if(!rainCanvas) return;

    const box=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio || 1,
        2
    );

    rainCanvas.width=box.x*dpr;
    rainCanvas.height=box.y*dpr;

    rainCanvas.style.width=box.x+"px";
    rainCanvas.style.height=box.y+"px";

    rainCtx.setTransform(
        dpr,0,0,dpr,0,0
    );
}


/* ---------------------------------------------------------
   CREATE RAIN DROPS
   --------------------------------------------------------- */

function createRainDrops(){

    const size=map.getSize();

    const count=
        Math.min(
            420,
            Math.max(
                120,
                Math.floor(
                    size.x*size.y/8500
                )
            )
        );

    rainDrops=[];

    for(let i=0;i<count;i++){

        rainDrops.push({
            x:Math.random()*size.x,
            y:Math.random()*size.y,
            length:8+Math.random()*18,
            speed:8+Math.random()*13,
            opacity:.18+Math.random()*.55,
            width:.7+Math.random()*1.2,
            drift:-1.5+Math.random()*3
        });

    }
}


/* ---------------------------------------------------------
   RAIN ANIMATION
   --------------------------------------------------------- */

function animateRain(){

    if(!rainRunning) return;

    const size=map.getSize();

    rainCtx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    rainCtx.lineCap="round";

    rainDrops.forEach(drop=>{

        drop.y+=drop.speed;
        drop.x+=drop.drift;

        if(drop.y>size.y+30){

            drop.y=-30;
            drop.x=Math.random()*size.x;

        }

        if(drop.x<0)
            drop.x=size.x;

        if(drop.x>size.x)
            drop.x=0;

        rainCtx.beginPath();

        rainCtx.moveTo(
            drop.x,
            drop.y
        );

        rainCtx.lineTo(
            drop.x+drop.drift,
            drop.y+drop.length
        );

        rainCtx.lineWidth=drop.width;
        rainCtx.strokeStyle=
            "rgba(120,205,255,"+
            drop.opacity+
            ")";

        rainCtx.stroke();

    });

    rainAnimation=
        requestAnimationFrame(animateRain);
}


/* ---------------------------------------------------------
   START / STOP RAIN
   --------------------------------------------------------- */

function startRain(){

    createRainCanvas();

    if(rainRunning) return;

    rainRunning=true;

    createRainDrops();

    rainAnimation=
        requestAnimationFrame(animateRain);
}

function stopRain(){

    rainRunning=false;

    if(rainAnimation){

        cancelAnimationFrame(
            rainAnimation
        );

        rainAnimation=null;
    }

    if(rainCtx && rainCanvas){

        const size=map.getSize();

        rainCtx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* ---------------------------------------------------------
   RADAR PULSE
   --------------------------------------------------------- */

let radarPulse=null;
let radarPulseRunning=false;

function createRadarPulse(){

    if(radarPulse) return;

    radarPulse=document.createElement("div");

    radarPulse.id=
        "cbrndV5RadarPulse";

    radarPulse.style.position="absolute";
    radarPulse.style.left="50%";
    radarPulse.style.top="50%";
    radarPulse.style.width="80px";
    radarPulse.style.height="80px";
    radarPulse.style.marginLeft="-40px";
    radarPulse.style.marginTop="-40px";
    radarPulse.style.border=
        "2px solid rgba(0,255,180,.75)";
    radarPulse.style.borderRadius="50%";
    radarPulse.style.pointerEvents="none";
    radarPulse.style.zIndex="460";
    radarPulse.style.boxShadow=
        "0 0 15px rgba(0,255,180,.45)";

    map.getContainer().appendChild(
        radarPulse
    );

    const style=document.createElement("style");

    style.id=
        "cbrndV5RadarPulseStyle";

    style.textContent=`

    #cbrndV5RadarPulse{
        animation:
            cbrndRadarPulse
            2.2s ease-out
            infinite;
    }

    @keyframes cbrndRadarPulse{

        0%{
            transform:scale(.45);
            opacity:.85;
        }

        70%{
            transform:scale(2.8);
            opacity:.12;
        }

        100%{
            transform:scale(3.4);
            opacity:0;
        }
    }

    `;

    document.head.appendChild(style);
}

function startRadarPulse(){

    createRadarPulse();

    if(radarPulse)
        radarPulse.style.display="block";

    radarPulseRunning=true;
}

function stopRadarPulse(){

    radarPulseRunning=false;

    if(radarPulse)
        radarPulse.style.display="none";
}


/* ---------------------------------------------------------
   MAP MODE SYNC
   --------------------------------------------------------- */

function syncRainMode(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="rain"){
        startRain();
    }else{
        stopRain();
    }

    if(
        window.CBRND_MAP_V5_RADAR_ACTIVE
    ){
        startRadarPulse();
    }else{
        stopRadarPulse();
    }
}


/* ---------------------------------------------------------
   WATCH WEATHER MODE
   --------------------------------------------------------- */

let lastMetric=null;
let lastRadar=null;

setInterval(()=>{

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    const radar=
        !!window.CBRND_MAP_V5_RADAR_ACTIVE;

    if(
        metric!==lastMetric ||
        radar!==lastRadar
    ){

        lastMetric=metric;
        lastRadar=radar;

        syncRainMode();
    }

},250);


/* ---------------------------------------------------------
   RESIZE
   --------------------------------------------------------- */

map.on("resize",()=>{

    resizeRainCanvas();

    if(rainRunning)
        createRainDrops();

});


/* ---------------------------------------------------------
   CLEANUP WHEN MAP IS REMOVED
   --------------------------------------------------------- */

window.CBRND_MAP_V5_RAIN={
    start:startRain,
    stop:stopRain,
    active:()=>rainRunning
};

window.CBRND_MAP_V5_RADAR_PULSE={
    start:startRadarPulse,
    stop:stopRadarPulse,
    active:()=>radarPulseRunning
};


/* ---------------------------------------------------------
   INITIALIZE
   --------------------------------------------------------- */

setTimeout(()=>{

    syncRainMode();

},1200);


console.log(
    "CBRND MAP V5 PART 17 READY — RAIN + RADAR EFFECT ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 18
   REAL WEATHER INTENSITY ENGINE
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 18: map not ready");
    return;
}

/* ---------------------------------------------------------
   WEATHER INTENSITY STATE
   --------------------------------------------------------- */

window.CBRND_MAP_V5_INTENSITY={
    wind:1,
    rain:1,
    cloud:0
};


/* ---------------------------------------------------------
   CALCULATE LIVE INTENSITY
   --------------------------------------------------------- */

function calculateIntensity(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length)
        return;

    let windTotal=0;
    let rainTotal=0;
    let cloudTotal=0;
    let count=0;

    data.forEach(p=>{

        const wind=Number(p.wind)||0;
        const rain=Number(p.rain)||0;
        const cloud=Number(p.cloud)||0;

        windTotal+=wind;
        rainTotal+=rain;
        cloudTotal+=cloud;

        count++;

    });

    if(!count) return;

    const avgWind=
        windTotal/count;

    const avgRain=
        rainTotal/count;

    const avgCloud=
        cloudTotal/count;


    /* -----------------------------------------------------
       WIND
       ----------------------------------------------------- */

    const windIntensity=
        Math.max(
            .35,
            Math.min(
                3,
                .55+(avgWind/15)
            )
        );


    /* -----------------------------------------------------
       RAIN
       ----------------------------------------------------- */

    const rainIntensity=
        Math.max(
            .35,
            Math.min(
                4,
                .7+(avgRain*1.8)
            )
        );


    /* -----------------------------------------------------
       CLOUD
       ----------------------------------------------------- */

    const cloudIntensity=
        Math.max(
            0,
            Math.min(
                1,
                avgCloud/100
            )
        );


    window.CBRND_MAP_V5_INTENSITY={
        wind:windIntensity,
        rain:rainIntensity,
        cloud:cloudIntensity
    };

}


/* ---------------------------------------------------------
   APPLY WIND INTENSITY
   --------------------------------------------------------- */

function applyWindIntensity(){

    const intensity=
        window.CBRND_MAP_V5_INTENSITY.wind;

    /*
      PART 9 already reads this variable
      on every animation frame.
    */

    window.CBRND_MAP_V5_WIND_SPEED=
        Math.max(
            .25,
            intensity
        );


    /* Keep existing user speed multiplier */
    if(
        typeof window.CBRND_MAP_V5_USER_WIND_SPEED!=="number"
    ){
        window.CBRND_MAP_V5_USER_WIND_SPEED=1;
    }

}


/* ---------------------------------------------------------
   APPLY RAIN INTENSITY
   --------------------------------------------------------- */

function applyRainIntensity(){

    const canvas=
        document.getElementById(
            "cbrndV5RainParticles"
        );

    if(!canvas) return;

    const intensity=
        window.CBRND_MAP_V5_INTENSITY.rain;

    canvas.dataset.intensity=
        intensity.toFixed(2);

    canvas.style.opacity=
        Math.min(
            .95,
            .35+(intensity*.16)
        );
}


/* ---------------------------------------------------------
   UPDATE RAIN DROP SPEED
   --------------------------------------------------------- */

function updateRainDrops(){

    if(
        typeof rainDrops==="undefined" ||
        !Array.isArray(rainDrops)
    ){
        return;
    }

    const intensity=
        window.CBRND_MAP_V5_INTENSITY.rain;

    rainDrops.forEach(drop=>{

        if(!drop) return;

        drop.speed=
            (8+Math.random()*13)*
            intensity;

    });

}


/* ---------------------------------------------------------
   INTENSITY STATUS
   --------------------------------------------------------- */

function updateIntensityStatus(){

    const box=
        document.getElementById(
            "cbrndV5LiveStatus"
        );

    if(!box) return;

    const i=
        window.CBRND_MAP_V5_INTENSITY;

    const text=
        "WIND ×"+i.wind.toFixed(1)+
        " • RAIN ×"+i.rain.toFixed(1);

    let el=
        document.getElementById(
            "cbrndV5IntensityStatus"
        );

    if(!el){

        el=document.createElement("div");

        el.id=
            "cbrndV5IntensityStatus";

        el.style.marginTop="3px";
        el.style.fontSize="9px";
        el.style.opacity=".75";

        box.appendChild(el);
    }

    el.textContent=text;

}


/* ---------------------------------------------------------
   MASTER UPDATE
   --------------------------------------------------------- */

function updateIntensity(){

    calculateIntensity();

    applyWindIntensity();

    applyRainIntensity();

    updateRainDrops();

    updateIntensityStatus();

}


/* ---------------------------------------------------------
   WATCH LIVE DATA
   --------------------------------------------------------- */

let lastDataLength=0;
let lastDataSignature="";

setInterval(()=>{

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length)
        return;

    const signature=
        data.length+
        ":"+
        Math.round(
            Number(data[0]?.wind||0)*10
        )+
        ":"+
        Math.round(
            Number(data[0]?.rain||0)*10
        );

    if(
        signature!==lastDataSignature ||
        data.length!==lastDataLength
    ){

        lastDataSignature=signature;
        lastDataLength=data.length;

        updateIntensity();
    }

},1500);


/* ---------------------------------------------------------
   INITIAL UPDATE
   --------------------------------------------------------- */

setTimeout(()=>{
    updateIntensity();
},2000);


/* ---------------------------------------------------------
   PUBLIC API
   --------------------------------------------------------- */

window.CBRND_MAP_V5_UPDATE_INTENSITY=
    updateIntensity;


/* ---------------------------------------------------------
   DEBUG / STATUS
   --------------------------------------------------------- */

window.CBRND_MAP_V5_GET_INTENSITY=function(){

    return {
        wind:
            Number(
                window.CBRND_MAP_V5_INTENSITY.wind
            ).toFixed(2),

        rain:
            Number(
                window.CBRND_MAP_V5_INTENSITY.rain
            ).toFixed(2),

        cloud:
            Number(
                window.CBRND_MAP_V5_INTENSITY.cloud
            ).toFixed(2)
    };

};


console.log(
    "CBRND MAP V5 PART 18 READY — REAL INTENSITY ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 19
   USER WIND SPEED + REAL WIND SYNC
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 19: map not ready");
    return;
}

/* ---------------------------------------------------------
   USER SPEED
   --------------------------------------------------------- */

if(typeof window.CBRND_MAP_V5_USER_WIND_SPEED!=="number"){
    window.CBRND_MAP_V5_USER_WIND_SPEED=1;
}


/* ---------------------------------------------------------
   GET REAL WEATHER INTENSITY
   --------------------------------------------------------- */

function getRealWindIntensity(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length){
        return 1;
    }

    let total=0;
    let count=0;

    data.forEach(p=>{

        const speed=Number(p.wind);

        if(Number.isFinite(speed)){

            total+=speed;
            count++;

        }

    });

    if(!count) return 1;

    const avg=total/count;

    /*
      Normal weather:
      0–10 km/h  → slow
      10–30       → medium
      30+         → strong
    */

    return Math.max(
        .35,
        Math.min(
            3,
            .55+(avg/15)
        )
    );
}


/* ---------------------------------------------------------
   FINAL SPEED
   --------------------------------------------------------- */

function updateFinalWindSpeed(){

    const userSpeed=
        Number(
            window.CBRND_MAP_V5_USER_WIND_SPEED
        ) || 1;

    const realIntensity=
        getRealWindIntensity();

    const finalSpeed=
        Math.max(
            .15,
            Math.min(
                6,
                userSpeed*realIntensity
            )
        );

    window.CBRND_MAP_V5_WIND_SPEED=
        finalSpeed;

    window.CBRND_MAP_V5_FINAL_WIND_SPEED=
        finalSpeed;

    updateWindDisplay(
        userSpeed,
        realIntensity,
        finalSpeed
    );
}


/* ---------------------------------------------------------
   WIND CONTROL DISPLAY
   --------------------------------------------------------- */

function updateWindDisplay(
    user,
    real,
    finalSpeed
){

    const panel=
        document.getElementById(
            "cbrndV5LayerControls"
        );

    if(!panel) return;

    let display=
        document.getElementById(
            "cbrndV5WindSpeedInfo"
        );

    if(!display){

        display=
            document.createElement("div");

        display.id=
            "cbrndV5WindSpeedInfo";

        display.style.marginTop="5px";
        display.style.fontSize="9px";
        display.style.lineHeight="1.4";
        display.style.opacity=".75";

        panel.appendChild(display);
    }

    display.innerHTML=
        "USER ×"+user.toFixed(1)+
        " • LIVE ×"+real.toFixed(1)+
        " • FINAL ×"+finalSpeed.toFixed(1);
}


/* ---------------------------------------------------------
   CONNECT EXISTING WIND SLIDER
   --------------------------------------------------------- */

function connectWindSlider(){

    const sliders=
        document.querySelectorAll(
            'input[type="range"]'
        );

    sliders.forEach(slider=>{

        if(slider.dataset.v5WindBound)
            return;

        /*
          Identify the PART 8 wind slider
          by nearby text / value.
        */

        const parent=
            slider.parentElement;

        const text=
            parent
            ? parent.innerText.toLowerCase()
            : "";

        const id=
            (slider.id || "").toLowerCase();

        const name=
            (slider.name || "").toLowerCase();

        const isWind=
            text.includes("wind") ||
            id.includes("wind") ||
            name.includes("wind");

        if(!isWind) return;

        slider.dataset.v5WindBound="1";

        const initial=
            Number(slider.value);

        if(Number.isFinite(initial) &&
           initial>0){

            window.CBRND_MAP_V5_USER_WIND_SPEED=
                initial;
        }

        slider.addEventListener(
            "input",
            ()=>{

                const value=
                    Number(slider.value);

                if(!Number.isFinite(value))
                    return;

                window.CBRND_MAP_V5_USER_WIND_SPEED=
                    value;

                updateFinalWindSpeed();

            }
        );

        slider.addEventListener(
            "change",
            ()=>{

                updateFinalWindSpeed();

            }
        );

    });

}


/* ---------------------------------------------------------
   FALLBACK LISTENER
   --------------------------------------------------------- */

setTimeout(
    connectWindSlider,
    700
);

setTimeout(
    connectWindSlider,
    1800
);


/* ---------------------------------------------------------
   CONTINUOUS LIVE SYNC
   --------------------------------------------------------- */

let lastWind="";

setInterval(()=>{

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length)
        return;

    const signature=
        data
        .slice(0,10)
        .map(p=>
            Math.round(
                Number(p.wind||0)*10
            )
        )
        .join(",");

    if(signature!==lastWind){

        lastWind=signature;

        updateFinalWindSpeed();
    }

},1500);


/* ---------------------------------------------------------
   INITIAL
   --------------------------------------------------------- */

setTimeout(()=>{

    updateFinalWindSpeed();

},2200);


/* ---------------------------------------------------------
   PUBLIC CONTROL
   --------------------------------------------------------- */

window.CBRND_MAP_V5_SET_WIND_SPEED=
    function(value){

        value=Number(value);

        if(!Number.isFinite(value))
            return;

        window.CBRND_MAP_V5_USER_WIND_SPEED=
            Math.max(
                .1,
                Math.min(3,value)
            );

        updateFinalWindSpeed();

    };


window.CBRND_MAP_V5_WIND_STATUS=
    function(){

        return {

            userSpeed:
                window.CBRND_MAP_V5_USER_WIND_SPEED,

            finalSpeed:
                window.CBRND_MAP_V5_FINAL_WIND_SPEED || 1,

            liveIntensity:
                getRealWindIntensity()

        };

    };


console.log(
    "CBRND MAP V5 PART 19 READY — WIND SPEED SYNC ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 20
   PROFESSIONAL WEATHER COLOR ENGINE
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 20: map not ready");
    return;
}

/* ---------------------------------------------------------
   COLOR SCALE
   --------------------------------------------------------- */

const SCALES={

    temperature:[
        {v:-10,c:"#08306b"},
        {v:0,c:"#2171b5"},
        {v:10,c:"#41b6c4"},
        {v:20,c:"#7fcdbb"},
        {v:30,c:"#fed976"},
        {v:40,c:"#fd8d3c"},
        {v:50,c:"#e31a1c"}
    ],

    humidity:[
        {v:0,c:"#f7fbff"},
        {v:20,c:"#c6dbef"},
        {v:40,c:"#6baed6"},
        {v:60,c:"#3182bd"},
        {v:80,c:"#08519c"},
        {v:100,c:"#54278f"}
    ],

    pressure:[
        {v:970,c:"#313695"},
        {v:990,c:"#4575b4"},
        {v:1010,c:"#74add1"},
        {v:1020,c:"#fee090"},
        {v:1030,c:"#f46d43"},
        {v:1050,c:"#a50026"}
    ],

    wind:[
        {v:0,c:"#08306b"},
        {v:10,c:"#2171b5"},
        {v:20,c:"#41b6c4"},
        {v:30,c:"#a1d76a"},
        {v:40,c:"#fdae61"},
        {v:60,c:"#f46d43"},
        {v:80,c:"#a50026"}
    ],

    rain:[
        {v:0,c:"#f7fbff"},
        {v:1,c:"#c6dbef"},
        {v:2.5,c:"#6baed6"},
        {v:5,c:"#3182bd"},
        {v:10,c:"#08519c"},
        {v:20,c:"#54278f"},
        {v:50,c:"#7a0177"}
    ],

    cloud:[
        {v:0,c:"#ffffff"},
        {v:20,c:"#d9f0ff"},
        {v:40,c:"#a6bddb"},
        {v:60,c:"#7b8fa8"},
        {v:80,c:"#52677d"},
        {v:100,c:"#202b38"}
    ]
};


/* ---------------------------------------------------------
   HEX → RGB
   --------------------------------------------------------- */

function hexToRgb(hex){

    hex=hex.replace("#","");

    return {
        r:parseInt(hex.substring(0,2),16),
        g:parseInt(hex.substring(2,4),16),
        b:parseInt(hex.substring(4,6),16)
    };
}


/* ---------------------------------------------------------
   RGB → HEX
   --------------------------------------------------------- */

function rgbToHex(r,g,b){

    return "#"+
        [r,g,b]
        .map(x=>
            Math.round(x)
            .toString(16)
            .padStart(2,"0")
        )
        .join("");
}


/* ---------------------------------------------------------
   INTERPOLATE COLOR
   --------------------------------------------------------- */

function interpolateColor(c1,c2,t){

    const a=hexToRgb(c1);
    const b=hexToRgb(c2);

    return rgbToHex(
        a.r+(b.r-a.r)*t,
        a.g+(b.g-a.g)*t,
        a.b+(b.b-a.b)*t
    );
}


/* ---------------------------------------------------------
   GET WEATHER COLOR
   --------------------------------------------------------- */

function getWeatherColor(metric,value){

    const scale=
        SCALES[metric] ||
        SCALES.temperature;

    value=Number(value);

    if(!Number.isFinite(value))
        return "#2171b5";

    if(value<=scale[0].v)
        return scale[0].c;

    if(value>=scale[scale.length-1].v)
        return scale[scale.length-1].c;

    for(let i=0;i<scale.length-1;i++){

        const a=scale[i];
        const b=scale[i+1];

        if(
            value>=a.v &&
            value<=b.v
        ){

            const t=
                (value-a.v)/
                (b.v-a.v);

            return interpolateColor(
                a.c,
                b.c,
                t
            );
        }
    }

    return scale[0].c;
}


/* ---------------------------------------------------------
   PUBLIC COLOR API
   --------------------------------------------------------- */

window.CBRND_MAP_V5_COLOR=
    getWeatherColor;

window.CBRND_MAP_V5_COLOR_SCALES=
    SCALES;


/* ---------------------------------------------------------
   UPDATE WEATHER FIELD COLORS
   --------------------------------------------------------- */

const oldRender=
    window.CBRND_MAP_V5_RENDER;

if(typeof oldRender==="function"){

    window.CBRND_MAP_V5_RENDER=function(points){

        /*
         * Keep existing V5 rendering.
         * Color engine becomes available globally
         * for field / overlays / future radar layers.
         */

        oldRender(points);

    };

}


/* ---------------------------------------------------------
   LEGEND CONFIG
   --------------------------------------------------------- */

const UNITS={
    temperature:"°C",
    humidity:"%",
    pressure:"hPa",
    wind:"km/h",
    rain:"mm",
    cloud:"%"
};

function updateProfessionalLegend(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    const scale=
        SCALES[metric];

    if(!scale) return;

    const legend=
        document.getElementById(
            "cbrndV5WeatherLegend"
        );

    if(!legend) return;

    const unit=
        UNITS[metric] || "";

    legend.innerHTML=
        `
        <div class="v5-pro-legend-title">
            ${metric.toUpperCase()}
        </div>

        <div class="v5-pro-legend-bar">
            ${
                scale.map(
                    x=>
                    `<span style="
                        background:${x.c};
                        flex:1;
                    "></span>`
                ).join("")
            }
        </div>

        <div class="v5-pro-legend-values">
            <span>${scale[0].v}${unit}</span>
            <span>${scale[scale.length-1].v}${unit}</span>
        </div>
        `;

}


/* ---------------------------------------------------------
   LEGEND STYLE
   --------------------------------------------------------- */

if(!document.getElementById("cbrndV5Part20Style")){

    const style=document.createElement("style");

    style.id="cbrndV5Part20Style";

    style.textContent=`

    .v5-pro-legend-title{
        font-size:10px;
        font-weight:700;
        letter-spacing:1px;
        margin-bottom:5px;
    }

    .v5-pro-legend-bar{
        display:flex;
        width:180px;
        height:9px;
        overflow:hidden;
        border-radius:999px;
        box-shadow:
            0 0 8px rgba(0,200,255,.35);
    }

    .v5-pro-legend-bar span:first-child{
        border-radius:999px 0 0 999px;
    }

    .v5-pro-legend-bar span:last-child{
        border-radius:0 999px 999px 0;
    }

    .v5-pro-legend-values{
        display:flex;
        justify-content:space-between;
        margin-top:4px;
        font-size:8px;
        opacity:.75;
    }

    `;

    document.head.appendChild(style);
}


/* ---------------------------------------------------------
   WATCH METRIC
   --------------------------------------------------------- */

let lastMetric=null;

setInterval(()=>{

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric!==lastMetric){

        lastMetric=metric;

        updateProfessionalLegend();

    }

},250);


/* ---------------------------------------------------------
   INITIALIZE
   --------------------------------------------------------- */

setTimeout(()=>{

    updateProfessionalLegend();

},1000);


/* ---------------------------------------------------------
   STATUS
   --------------------------------------------------------- */

console.log(
    "CBRND MAP V5 PART 20 READY — PROFESSIONAL COLOR ENGINE ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 21
   WIND STREAMLINES + DIRECTION FLOW
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 21: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let particles=[];
let animation=null;
let running=false;
let lastTime=0;


/* ---------------------------------------------------------
   CANVAS
   --------------------------------------------------------- */

function createCanvas(){

    if(canvas) return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5WindStreamlines";

    canvas.style.position="absolute";
    canvas.style.left="0";
    canvas.style.top="0";
    canvas.style.width="100%";
    canvas.style.height="100%";
    canvas.style.pointerEvents="none";
    canvas.style.zIndex="365";

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resizeCanvas();
}


/* ---------------------------------------------------------
   RESIZE
   --------------------------------------------------------- */

function resizeCanvas(){

    if(!canvas) return;

    const size=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );

    createParticles();
}


/* ---------------------------------------------------------
   WIND DATA
   --------------------------------------------------------- */

function getWindData(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length)
        return null;

    let totalSpeed=0;
    let sin=0;
    let cos=0;
    let count=0;

    data.forEach(p=>{

        const speed=Number(p.wind);
        const direction=Number(p.direction);

        if(
            !Number.isFinite(speed) ||
            !Number.isFinite(direction)
        ){
            return;
        }

        totalSpeed+=speed;

        /*
         * Meteorological direction:
         * 0 = North
         * 90 = East
         */

        const rad=
            direction*Math.PI/180;

        sin+=Math.sin(rad);
        cos+=Math.cos(rad);

        count++;

    });

    if(!count) return null;

    let direction=
        Math.atan2(sin/count,cos/count)
        *180/Math.PI;

    if(direction<0)
        direction+=360;

    return {
        speed:totalSpeed/count,
        direction:direction
    };
}


/* ---------------------------------------------------------
   PARTICLES
   --------------------------------------------------------- */

function createParticles(){

    if(!canvas) return;

    const size=map.getSize();

    const count=Math.min(
        180,
        Math.max(
            70,
            Math.floor(
                size.x*size.y/15000
            )
        )
    );

    particles=[];

    for(let i=0;i<count;i++){

        particles.push({
            x:Math.random()*size.x,
            y:Math.random()*size.y,
            life:Math.random(),
            maxLife:.35+
                Math.random()*.8
        });

    }
}


/* ---------------------------------------------------------
   ANIMATION
   --------------------------------------------------------- */

function animate(time){

    if(!running) return;

    if(!lastTime)
        lastTime=time;

    const delta=
        Math.min(
            32,
            time-lastTime
        );

    lastTime=time;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    const wind=getWindData();

    if(!wind){

        animation=
            requestAnimationFrame(animate);

        return;
    }


    /* -----------------------------------------------------
       SPEED
       ----------------------------------------------------- */

    const userSpeed=
        Number(
            window.CBRND_MAP_V5_USER_WIND_SPEED
        ) || 1;

    const liveSpeed=
        Math.max(
            .2,
            wind.speed
        );

    const finalSpeed=
        Math.min(
            6,
            .18+
            (liveSpeed/30)*
            userSpeed
        );


    /* -----------------------------------------------------
       DIRECTION
       ----------------------------------------------------- */

    const rad=
        wind.direction*
        Math.PI/180;

    /*
     * Screen coordinates:
     * East  = +X
     * South = +Y
     */

    const dx=
        Math.sin(rad);

    const dy=
        -Math.cos(rad);


    /* -----------------------------------------------------
       DRAW STREAMLINES
       ----------------------------------------------------- */

    particles.forEach(p=>{

        const oldX=p.x;
        const oldY=p.y;

        const movement=
            finalSpeed*
            delta;

        p.x+=dx*movement;
        p.y+=dy*movement;

        p.life+=delta/1000;

        if(
            p.x<-50 ||
            p.x>size.x+50 ||
            p.y<-50 ||
            p.y>size.y+50 ||
            p.life>p.maxLife
        ){

            p.x=Math.random()*size.x;
            p.y=Math.random()*size.y;

            p.life=0;

            p.maxLife=
                .35+
                Math.random()*.8;
        }


        const alpha=
            Math.max(
                0,
                Math.min(
                    .85,
                    1-(p.life/p.maxLife)
                )
            );


        ctx.beginPath();

        ctx.moveTo(
            oldX,
            oldY
        );

        ctx.lineTo(
            p.x-dx*8,
            p.y-dy*8
        );

        ctx.lineWidth=
            .7+
            Math.min(
                1.3,
                liveSpeed/25
            );

        ctx.strokeStyle=
            "rgba(100,220,255,"+
            alpha+
            ")";

        ctx.stroke();


        /* -------------------------------------------------
           SMALL DIRECTION HEAD
           ------------------------------------------------- */

        if(p.life>.12){

            const hx=
                p.x-dx*5;

            const hy=
                p.y-dy*5;

            const sideX=
                -dy*3;

            const sideY=
                dx*3;

            ctx.beginPath();

            ctx.moveTo(
                p.x,
                p.y
            );

            ctx.lineTo(
                hx-sideX,
                hy-sideY
            );

            ctx.moveTo(
                p.x,
                p.y
            );

            ctx.lineTo(
                hx+sideX,
                hy+sideY
            );

            ctx.lineWidth=.8;

            ctx.strokeStyle=
                "rgba(160,240,255,"+
                (alpha*.8)+
                ")";

            ctx.stroke();
        }

    });

    animation=
        requestAnimationFrame(animate);
}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

function start(){

    createCanvas();

    if(running) return;

    running=true;
    lastTime=0;

    animation=
        requestAnimationFrame(animate);
}


/* ---------------------------------------------------------
   STOP
   --------------------------------------------------------- */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx && canvas){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* ---------------------------------------------------------
   ONLY SHOW IN WIND MODE
   --------------------------------------------------------- */

let lastMetric=null;

function syncMode(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="wind"){

        start();

    }else{

        stop();

    }

    lastMetric=metric;
}


/* ---------------------------------------------------------
   MODE WATCHER
   --------------------------------------------------------- */

setInterval(()=>{

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric!==lastMetric){
        syncMode();
    }

},300);


/* ---------------------------------------------------------
   MAP RESIZE
   --------------------------------------------------------- */

map.on("resize",()=>{

    if(canvas)
        resizeCanvas();

});


/* ---------------------------------------------------------
   PUBLIC API
   --------------------------------------------------------- */

window.CBRND_MAP_V5_WIND_STREAMLINES={
    start:start,
    stop:stop,
    active:()=>running,
    getWind:getWindData
};


/* ---------------------------------------------------------
   INITIAL
   --------------------------------------------------------- */

setTimeout(()=>{

    syncMode();

},1500);


console.log(
    "CBRND MAP V5 PART 21 READY — WIND STREAMLINES ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 22
   LIVE COMPASS + WIND DIRECTION
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 22: map not ready");
    return;
}

/* ---------------------------------------------------------
   COMPASS
   --------------------------------------------------------- */

let compass=null;
let arrow=null;
let degreeText=null;
let speedText=null;

function createCompass(){

    if(compass) return;

    compass=document.createElement("div");

    compass.id="cbrndV5Compass";

    compass.innerHTML=`
        <div class="v5-compass-ring">
            <span class="v5-n">N</span>
            <span class="v5-e">E</span>
            <span class="v5-s">S</span>
            <span class="v5-w">W</span>
            <div class="v5-compass-center"></div>
            <div class="v5-compass-arrow"></div>
        </div>
        <div class="v5-compass-info">
            <b id="cbrndV5WindDegree">000°</b>
            <span id="cbrndV5WindSpeed">0 km/h</span>
        </div>
    `;

    map.getContainer().appendChild(compass);

    arrow=
        compass.querySelector(
            ".v5-compass-arrow"
        );

    degreeText=
        document.getElementById(
            "cbrndV5WindDegree"
        );

    speedText=
        document.getElementById(
            "cbrndV5WindSpeed"
        );
}


/* ---------------------------------------------------------
   WIND DATA
   --------------------------------------------------------- */

function getWind(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(!Array.isArray(data) || !data.length)
        return null;

    let speedTotal=0;
    let sinTotal=0;
    let cosTotal=0;
    let count=0;

    data.forEach(p=>{

        const speed=Number(p.wind);
        const direction=Number(p.direction);

        if(
            !Number.isFinite(speed) ||
            !Number.isFinite(direction)
        ) return;

        const rad=
            direction*Math.PI/180;

        speedTotal+=speed;
        sinTotal+=Math.sin(rad);
        cosTotal+=Math.cos(rad);

        count++;

    });

    if(!count) return null;

    let direction=
        Math.atan2(
            sinTotal/count,
            cosTotal/count
        )*180/Math.PI;

    if(direction<0)
        direction+=360;

    return {
        speed:speedTotal/count,
        direction:direction
    };
}


/* ---------------------------------------------------------
   COMPASS UPDATE
   --------------------------------------------------------- */

function updateCompass(){

    createCompass();

    const wind=getWind();

    if(!wind){

        degreeText.textContent="---°";
        speedText.textContent="No data";

        return;
    }

    const direction=
        Math.round(wind.direction);

    const speed=
        Math.round(wind.speed*10)/10;

    degreeText.textContent=
        String(direction).padStart(3,"0")+"°";

    speedText.textContent=
        speed+" km/h";

    /*
     * Arrow points toward wind direction.
     */

    arrow.style.transform=
        "translate(-50%,-50%) rotate("+
        direction+
        "deg)";
}


/* ---------------------------------------------------------
   STYLE
   --------------------------------------------------------- */

if(!document.getElementById("cbrndV5Part22Style")){

    const style=document.createElement("style");

    style.id="cbrndV5Part22Style";

    style.textContent=`

    #cbrndV5Compass{
        position:absolute;
        right:18px;
        bottom:82px;
        z-index:480;
        width:108px;
        padding:9px;
        border-radius:18px;
        background:
            rgba(3,10,22,.82);
        border:
            1px solid rgba(0,220,255,.45);
        box-shadow:
            0 0 18px rgba(0,210,255,.22),
            inset 0 0 18px rgba(0,210,255,.06);
        backdrop-filter:blur(8px);
        color:#fff;
        font-family:Arial,sans-serif;
        pointer-events:none;
    }

    .v5-compass-ring{
        position:relative;
        width:76px;
        height:76px;
        margin:auto;
        border:
            1px solid rgba(120,220,255,.45);
        border-radius:50%;
        box-shadow:
            inset 0 0 12px rgba(0,220,255,.12),
            0 0 10px rgba(0,220,255,.12);
    }

    .v5-compass-ring span{
        position:absolute;
        font-size:9px;
        font-weight:700;
        opacity:.8;
    }

    .v5-n{
        top:5px;
        left:50%;
        transform:translateX(-50%);
    }

    .v5-e{
        right:6px;
        top:50%;
        transform:translateY(-50%);
    }

    .v5-s{
        bottom:5px;
        left:50%;
        transform:translateX(-50%);
    }

    .v5-w{
        left:6px;
        top:50%;
        transform:translateY(-50%);
    }

    .v5-compass-center{
        position:absolute;
        left:50%;
        top:50%;
        width:6px;
        height:6px;
        transform:translate(-50%,-50%);
        border-radius:50%;
        background:#fff;
        box-shadow:0 0 8px rgba(255,255,255,.8);
    }

    .v5-compass-arrow{
        position:absolute;
        left:50%;
        top:50%;
        width:3px;
        height:27px;
        transform-origin:50% 75%;
        transform:
            translate(-50%,-50%)
            rotate(0deg);
        border-radius:5px;
        background:
            linear-gradient(
                to top,
                rgba(80,210,255,.35),
                #fff
            );
        box-shadow:
            0 0 8px rgba(80,220,255,.7);
    }

    .v5-compass-arrow::before{
        content:"";
        position:absolute;
        top:-5px;
        left:50%;
        transform:translateX(-50%);
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:9px solid #fff;
    }

    .v5-compass-info{
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-top:7px;
        font-size:8px;
    }

    .v5-compass-info b{
        font-size:10px;
    }

    .v5-compass-info span{
        opacity:.7;
    }

    @media(max-width:700px){

        #cbrndV5Compass{
            right:8px;
            bottom:65px;
            transform:scale(.88);
            transform-origin:bottom right;
        }

    }

    `;

    document.head.appendChild(style);
}


/* ---------------------------------------------------------
   UPDATE LOOP
   --------------------------------------------------------- */

let lastSignature="";

setInterval(()=>{

    const wind=getWind();

    if(!wind) return;

    const signature=
        Math.round(wind.direction)+
        ":"+
        Math.round(wind.speed*10);

    if(signature!==lastSignature){

        lastSignature=signature;

        updateCompass();
    }

},1000);


/* ---------------------------------------------------------
   INITIAL
   --------------------------------------------------------- */

setTimeout(()=>{
    updateCompass();
},1500);


/* ---------------------------------------------------------
   PUBLIC API
   --------------------------------------------------------- */

window.CBRND_MAP_V5_COMPASS={
    update:updateCompass,

    getWind:getWind,

    show:function(){
        createCompass();
        compass.style.display="block";
    },

    hide:function(){
        if(compass)
            compass.style.display="none";
    }
};


/* ---------------------------------------------------------
   READY
   --------------------------------------------------------- */

console.log(
    "CBRND MAP V5 PART 22 READY — LIVE COMPASS ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 23
   WEATHER HOTSPOT + HEATMAP ENGINE
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("CBRND MAP V5 PART 23: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let animation=null;
let running=false;


/* ---------------------------------------------------------
   CANVAS
   --------------------------------------------------------- */

function createCanvas(){

    if(canvas) return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5HotspotLayer";

    canvas.style.position="absolute";
    canvas.style.left="0";
    canvas.style.top="0";
    canvas.style.width="100%";
    canvas.style.height="100%";
    canvas.style.pointerEvents="none";
    canvas.style.zIndex="355";
    canvas.style.opacity=".48";

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resize();
}


/* ---------------------------------------------------------
   RESIZE
   --------------------------------------------------------- */

function resize(){

    if(!canvas) return;

    const size=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio || 1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );
}


/* ---------------------------------------------------------
   VALUE KEY
   --------------------------------------------------------- */

function getKey(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    const keys={
        temperature:"temperature",
        humidity:"humidity",
        pressure:"pressure",
        wind:"wind",
        rain:"rain",
        cloud:"cloud"
    };

    return keys[metric] || "temperature";
}


/* ---------------------------------------------------------
   NORMALIZE VALUE
   --------------------------------------------------------- */

function normalize(value,points,key){

    const values=
        points
        .map(p=>Number(p[key]))
        .filter(Number.isFinite);

    if(!values.length)
        return .5;

    let min=Math.min(...values);
    let max=Math.max(...values);

    if(max===min)
        return .5;

    return Math.max(
        0,
        Math.min(
            1,
            (value-min)/(max-min)
        )
    );
}


/* ---------------------------------------------------------
   DRAW HOTSPOTS
   --------------------------------------------------------- */

function draw(){

    if(!running) return;

    const points=
        window.CBRND_MAP_V5_DATA;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    if(
        !Array.isArray(points) ||
        !points.length
    ){

        animation=
            requestAnimationFrame(draw);

        return;
    }

    const key=getKey();

    points.forEach(point=>{

        const value=
            Number(point[key]);

        if(!Number.isFinite(value))
            return;

        const screen=
            map.latLngToContainerPoint([
                point.lat,
                point.lon
            ]);

        const n=
            normalize(
                value,
                points,
                key
            );

        /*
         * Only emphasize stronger areas.
         * This prevents the whole map becoming bright.
         */

        const intensity=
            Math.max(
                0,
                (n-.35)/.65
            );

        if(intensity<=0)
            return;

        const radius=
            35+
            intensity*65;

        const gradient=
            ctx.createRadialGradient(
                screen.x,
                screen.y,
                0,
                screen.x,
                screen.y,
                radius
            );

        gradient.addColorStop(
            0,
            "rgba(255,80,30,"+
            (intensity*.30)+
            ")"
        );

        gradient.addColorStop(
            .35,
            "rgba(255,170,30,"+
            (intensity*.18)+
            ")"
        );

        gradient.addColorStop(
            1,
            "rgba(255,0,0,0)"
        );

        ctx.fillStyle=gradient;

        ctx.beginPath();

        ctx.arc(
            screen.x,
            screen.y,
            radius,
            0,
            Math.PI*2
        );

        ctx.fill();

    });

    animation=
        requestAnimationFrame(draw);
}


/* ---------------------------------------------------------
   START
   --------------------------------------------------------- */

function start(){

    createCanvas();

    if(running) return;

    running=true;

    animation=
        requestAnimationFrame(draw);
}


/* ---------------------------------------------------------
   STOP
   --------------------------------------------------------- */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx && canvas){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* ---------------------------------------------------------
   ONLY ACTIVE WEATHER MODES
   --------------------------------------------------------- */

let lastMetric=null;

function sync(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(
        metric==="temperature" ||
        metric==="humidity" ||
        metric==="pressure" ||
        metric==="wind" ||
        metric==="rain" ||
        metric==="cloud"
    ){

        start();

    }else{

        stop();

    }

    lastMetric=metric;
}


/* ---------------------------------------------------------
   METRIC WATCHER
   --------------------------------------------------------- */

setInterval(()=>{

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric!==lastMetric){

        sync();

    }

},500);


/* ---------------------------------------------------------
   MAP MOVEMENT
   --------------------------------------------------------- */

map.on("moveend",()=>{

    if(running){
        resize();
    }

});

map.on("zoomend",()=>{

    if(running){
        resize();
    }

});

map.on("resize",resize);


/* ---------------------------------------------------------
   PUBLIC API
   --------------------------------------------------------- */

window.CBRND_MAP_V5_HOTSPOT={

    start:start,

    stop:stop,

    active:()=>running,

    redraw:function(){

        if(running)
            draw();

    }

};


/* ---------------------------------------------------------
   INITIALIZE
   --------------------------------------------------------- */

setTimeout(()=>{

    sync();

},1800);


console.log(
    "CBRND MAP V5 PART 23 READY — HOTSPOT ENGINE ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 24
   LIVE RADAR TIMELINE CONTROL
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map) return;

let panel=null;
let slider=null;
let frameText=null;
let playBtn=null;
let speedSelect=null;
let timer=null;
let playing=false;
let speed=800;


/* =========================================================
   CREATE PANEL
   ========================================================= */

function createPanel(){

    if(panel) return;

    panel=document.createElement("div");

    panel.id="cbrndV5RadarTimeline";

    panel.innerHTML=`
        <div class="cbrndV5RadarHead">
            <span>📡 RADAR TIMELINE</span>
            <span id="cbrndV5RadarFrame">-- / --</span>
        </div>

        <div class="cbrndV5RadarControls">

            <button id="cbrndV5RadarPrev"
                    title="Previous radar frame">
                ⏮
            </button>

            <button id="cbrndV5RadarPlay"
                    title="Play radar">
                ▶
            </button>

            <button id="cbrndV5RadarNext"
                    title="Next radar frame">
                ⏭
            </button>

            <select id="cbrndV5RadarSpeed">
                <option value="1200">Slow</option>
                <option value="800" selected>Normal</option>
                <option value="500">Fast</option>
                <option value="250">Ultra</option>
            </select>

        </div>

        <input
            id="cbrndV5RadarSlider"
            type="range"
            min="0"
            max="0"
            value="0"
            step="1"
        >
    `;

    Object.assign(panel.style,{
        position:"absolute",
        left:"50%",
        bottom:"18px",
        transform:"translateX(-50%)",
        width:"min(620px,calc(100% - 40px))",
        padding:"12px 14px",
        borderRadius:"18px",
        background:"rgba(5,12,24,.88)",
        border:"1px solid rgba(80,200,255,.35)",
        boxShadow:"0 0 25px rgba(0,180,255,.18)",
        backdropFilter:"blur(12px)",
        zIndex:"700",
        color:"#fff",
        fontFamily:"Arial,sans-serif",
        pointerEvents:"auto"
    });

    map.getContainer().appendChild(panel);

    slider=
        document.getElementById(
            "cbrndV5RadarSlider"
        );

    frameText=
        document.getElementById(
            "cbrndV5RadarFrame"
        );

    playBtn=
        document.getElementById(
            "cbrndV5RadarPlay"
        );

    speedSelect=
        document.getElementById(
            "cbrndV5RadarSpeed"
        );

    addStyles();

    bindEvents();

    updateUI();
}


/* =========================================================
   STYLES
   ========================================================= */

function addStyles(){

    if(document.getElementById(
        "cbrndV5RadarTimelineCSS"
    )) return;

    const style=document.createElement("style");

    style.id="cbrndV5RadarTimelineCSS";

    style.textContent=`

        #cbrndV5RadarTimeline{
            box-sizing:border-box;
        }

        .cbrndV5RadarHead{
            display:flex;
            justify-content:space-between;
            align-items:center;
            font-size:11px;
            letter-spacing:1px;
            margin-bottom:9px;
            opacity:.95;
        }

        .cbrndV5RadarControls{
            display:flex;
            gap:7px;
            align-items:center;
        }

        .cbrndV5RadarControls button{
            width:38px;
            height:32px;
            border-radius:10px;
            border:1px solid rgba(100,210,255,.35);
            background:rgba(20,50,75,.65);
            color:#fff;
            cursor:pointer;
            font-size:15px;
            transition:.2s;
        }

        .cbrndV5RadarControls button:hover{
            transform:translateY(-1px);
            background:rgba(30,90,120,.85);
            box-shadow:0 0 12px rgba(0,200,255,.3);
        }

        #cbrndV5RadarSpeed{
            margin-left:auto;
            height:32px;
            border-radius:9px;
            padding:0 8px;
            background:#102238;
            color:#fff;
            border:1px solid rgba(100,210,255,.3);
        }

        #cbrndV5RadarSlider{
            width:100%;
            margin-top:9px;
            cursor:pointer;
            accent-color:#28c8ff;
        }

        @media(max-width:600px){

            #cbrndV5RadarTimeline{
                bottom:10px !important;
                width:calc(100% - 20px) !important;
            }

        }
    `;

    document.head.appendChild(style);
}


/* =========================================================
   GET RADAR OBJECT
   ========================================================= */

function getRadar(){

    return window.CBRND_MAP_V5_RADAR || null;
}


/* =========================================================
   UPDATE UI
   ========================================================= */

function updateUI(){

    const radar=getRadar();

    if(
        !radar ||
        !Array.isArray(radar.frames)
    ){

        frameText.textContent="RADAR OFF";

        slider.max=0;
        slider.value=0;

        return;
    }

    const total=radar.frames.length;

    const index=
        Number.isFinite(radar.index)
        ? radar.index
        : 0;

    slider.max=Math.max(0,total-1);

    slider.value=Math.min(
        index,
        Math.max(0,total-1)
    );

    frameText.textContent=
        `${index+1} / ${total}`;
}


/* =========================================================
   SHOW SPECIFIC FRAME
   ========================================================= */

function showFrame(index){

    const radar=getRadar();

    if(
        !radar ||
        !Array.isArray(radar.frames) ||
        !radar.frames.length
    ) return;

    const total=radar.frames.length;

    index=
        Math.max(
            0,
            Math.min(
                total-1,
                Number(index)
            )
        );

    radar.index=index;

    const frame=
        radar.frames[index];

    if(
        !frame ||
        !frame.path
    ) return;

    if(radar.layer){

        try{
            map.removeLayer(
                radar.layer
            );
        }catch(e){}

    }

    radar.layer=
        L.tileLayer(
            radar.host+
            frame.path+
            "/256/{z}/{x}/{y}/2/1_1.png",
            {
                opacity:.58,
                maxZoom:7,
                zIndex:450,
                attribution:
                    'Weather data by <a href="https://www.rainviewer.com/" target="_blank">RainViewer</a>'
            }
        ).addTo(map);

    updateUI();
}


/* =========================================================
   PLAY
   ========================================================= */

function play(){

    const radar=getRadar();

    if(
        !radar ||
        !Array.isArray(radar.frames) ||
        !radar.frames.length
    ) return;

    playing=true;

    if(playBtn)
        playBtn.textContent="⏸";

    clearInterval(timer);

    timer=setInterval(()=>{

        const total=radar.frames.length;

        let next=
            Number(radar.index || 0)+1;

        if(next>=total)
            next=0;

        showFrame(next);

    },speed);
}


/* =========================================================
   PAUSE
   ========================================================= */

function pause(){

    playing=false;

    clearInterval(timer);

    timer=null;

    if(playBtn)
        playBtn.textContent="▶";
}


/* =========================================================
   TOGGLE
   ========================================================= */

function togglePlay(){

    if(playing)
        pause();
    else
        play();

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents(){

    playBtn.addEventListener(
        "click",
        togglePlay
    );

    document
        .getElementById(
            "cbrndV5RadarPrev"
        )
        .addEventListener(
            "click",
            ()=>{

                const radar=getRadar();

                if(!radar) return;

                let index=
                    Number(radar.index || 0)-1;

                if(index<0)
                    index=
                        radar.frames.length-1;

                showFrame(index);

            }
        );

    document
        .getElementById(
            "cbrndV5RadarNext"
        )
        .addEventListener(
            "click",
            ()=>{

                const radar=getRadar();

                if(!radar) return;

                let index=
                    Number(radar.index || 0)+1;

                if(
                    index>=
                    radar.frames.length
                )
                    index=0;

                showFrame(index);

            }
        );

    slider.addEventListener(
        "input",
        ()=>{

            pause();

            showFrame(
                Number(slider.value)
            );

        }
    );

    speedSelect.addEventListener(
        "change",
        ()=>{

            speed=
                Number(
                    speedSelect.value
                ) || 800;

            if(playing)
                play();

        }
    );
}


/* =========================================================
   WATCH RADAR
   ========================================================= */

let lastFrameCount=0;

setInterval(()=>{

    const radar=getRadar();

    if(!radar) return;

    const count=
        Array.isArray(radar.frames)
        ? radar.frames.length
        : 0;

    if(count!==lastFrameCount){

        lastFrameCount=count;

        updateUI();
    }

},1000);


/* =========================================================
   RADAR STATE SYNC
   ========================================================= */

setInterval(()=>{

    const active=
        window.CBRND_MAP_V5_RADAR_ACTIVE;

    if(
        active===false &&
        panel
    ){

        panel.style.display="none";

        pause();

    }else if(
        active!==false &&
        panel
    ){

        panel.style.display="block";

    }

},500);


/* =========================================================
   INIT
   ========================================================= */

setTimeout(()=>{

    createPanel();

},2200);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_RADAR_TIMELINE={

    play:play,

    pause:pause,

    next:function(){

        const radar=getRadar();

        if(!radar) return;

        showFrame(
            Number(radar.index||0)+1
        );

    },

    previous:function(){

        const radar=getRadar();

        if(!radar) return;

        showFrame(
            Number(radar.index||0)-1
        );

    },

    showFrame:showFrame,

    setSpeed:function(ms){

        speed=
            Math.max(
                100,
                Number(ms)||800
            );

        if(playing)
            play();

    },

    state:function(){

        const radar=getRadar();

        return {
            playing:playing,
            speed:speed,
            frame:
                radar
                ? radar.index
                : 0,
            total:
                radar &&
                Array.isArray(radar.frames)
                ? radar.frames.length
                : 0
        };

    }

};

console.log(
    "CBRND MAP V5 PART 24 READY — RADAR TIMELINE ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 25
   REAL WIND FLOW FIELD
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("PART 25: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let particles=[];
let animation=null;
let running=false;
let lastTime=0;


/* =========================================================
   CANVAS
   ========================================================= */

function createCanvas(){

    if(canvas)return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5WindFlowField";

    Object.assign(canvas.style,{
        position:"absolute",
        left:"0",
        top:"0",
        width:"100%",
        height:"100%",
        pointerEvents:"none",
        zIndex:"368",
        opacity:".78"
    });

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resize();
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

    if(!canvas)return;

    const size=map.getSize();
    const dpr=Math.min(
        window.devicePixelRatio||1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );

    createParticles();
}


/* =========================================================
   WIND DATA
   ========================================================= */

function getWind(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(
        !Array.isArray(data) ||
        !data.length
    ){
        return {
            speed:10,
            direction:0
        };
    }

    let speedSum=0;
    let sinSum=0;
    let cosSum=0;
    let count=0;

    data.forEach(p=>{

        const s=Number(p.wind);
        const d=Number(p.direction);

        if(
            !Number.isFinite(s) ||
            !Number.isFinite(d)
        )return;

        speedSum+=s;

        const rad=d*Math.PI/180;

        sinSum+=Math.sin(rad);
        cosSum+=Math.cos(rad);

        count++;

    });

    if(!count){

        return {
            speed:10,
            direction:0
        };

    }

    let direction=
        Math.atan2(
            sinSum/count,
            cosSum/count
        )*180/Math.PI;

    if(direction<0)
        direction+=360;

    return {
        speed:speedSum/count,
        direction:direction
    };
}


/* =========================================================
   PARTICLES
   ========================================================= */

function createParticles(){

    if(!canvas)return;

    const size=map.getSize();

    const count=
        Math.max(
            90,
            Math.min(
                260,
                Math.round(
                    size.x*size.y/9000
                )
            )
        );

    particles=[];

    for(let i=0;i<count;i++){

        particles.push({

            x:Math.random()*size.x,

            y:Math.random()*size.y,

            life:
                Math.random(),

            maxLife:
                .5+
                Math.random()*.9,

            length:
                12+
                Math.random()*28,

            width:
                .7+
                Math.random()*1.5

        });

    }
}


/* =========================================================
   RESET PARTICLE
   ========================================================= */

function resetParticle(p){

    const size=map.getSize();

    p.x=Math.random()*size.x;
    p.y=Math.random()*size.y;

    p.life=0;

    p.maxLife=
        .5+
        Math.random()*.9;

    p.length=
        12+
        Math.random()*28;
}


/* =========================================================
   ANIMATION
   ========================================================= */

function animate(time){

    if(!running)return;

    if(!lastTime)
        lastTime=time;

    const dt=
        Math.min(
            40,
            time-lastTime
        );

    lastTime=time;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    const wind=getWind();

    const userSpeed=
        Number(
            window.CBRND_MAP_V5_WIND_SPEED
        )||1;

    /*
     * Wind direction:
     * 0° = North
     * 90° = East
     * 180° = South
     * 270° = West
     */

    const rad=
        wind.direction*Math.PI/180;

    const dx=
        Math.sin(rad);

    const dy=
        -Math.cos(rad);

    const velocity=
        Math.max(
            .15,
            Math.min(
                7,
                wind.speed/8*
                userSpeed
            )
        );

    particles.forEach(p=>{

        const oldX=p.x;
        const oldY=p.y;

        const distance=
            velocity*
            dt/16;

        p.x+=dx*distance;
        p.y+=dy*distance;

        p.life+=dt/1000;

        if(
            p.x<-60 ||
            p.x>size.x+60 ||
            p.y<-60 ||
            p.y>size.y+60 ||
            p.life>p.maxLife
        ){

            resetParticle(p);

            return;
        }

        const alpha=
            Math.max(
                0,
                Math.min(
                    1,
                    Math.sin(
                        (p.life/p.maxLife)*
                        Math.PI
                    )
                )
            );

        ctx.beginPath();

        ctx.moveTo(
            oldX,
            oldY
        );

        ctx.lineTo(
            oldX-dx*p.length,
            oldY-dy*p.length
        );

        ctx.lineWidth=p.width;

        ctx.lineCap="round";

        ctx.strokeStyle=
            "rgba(120,220,255,"+
            (alpha*.65)+
            ")";

        ctx.stroke();

        /*
         * Small moving arrow head
         */

        const hx=
            oldX-dx*p.length;

        const hy=
            oldY-dy*p.length;

        const sideX=-dy;
        const sideY=dx;

        const arrow=4;

        ctx.beginPath();

        ctx.moveTo(
            hx,
            hy
        );

        ctx.lineTo(
            hx+dx*arrow+
            sideX*arrow*.6,
            hy+dy*arrow+
            sideY*arrow*.6
        );

        ctx.lineTo(
            hx+dx*arrow-
            sideX*arrow*.6,
            hy+dy*arrow-
            sideY*arrow*.6
        );

        ctx.closePath();

        ctx.fillStyle=
            "rgba(160,235,255,"+
            (alpha*.55)+
            ")";

        ctx.fill();

    });

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   START
   ========================================================= */

function start(){

    createCanvas();

    if(running)return;

    running=true;
    lastTime=0;

    createParticles();

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   STOP
   ========================================================= */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* =========================================================
   MODE SYNC
   ========================================================= */

function sync(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="wind"){

        start();

    }else{

        stop();

    }

}


/* =========================================================
   WATCH WEATHER MODE
   ========================================================= */

setInterval(
    sync,
    700
);


/* =========================================================
   MAP EVENTS
   ========================================================= */

map.on(
    "resize",
    resize
);

map.on(
    "moveend",
    resize
);

map.on(
    "zoomend",
    resize
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_WIND_FLOW={

    start:start,

    stop:stop,

    active:function(){
        return running;
    },

    getWind:getWind

};


/* =========================================================
   INITIAL START
   ========================================================= */

setTimeout(
    sync,
    2500
);

console.log(
    "CBRND MAP V5 PART 25 READY — REAL WIND FLOW ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 26
   ADVANCED RAIN / PRECIPITATION FIELD
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("PART 26: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let particles=[];
let animation=null;
let running=false;
let lastTime=0;


/* =========================================================
   CANVAS
   ========================================================= */

function createCanvas(){

    if(canvas)return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5RainField";

    Object.assign(canvas.style,{
        position:"absolute",
        left:"0",
        top:"0",
        width:"100%",
        height:"100%",
        pointerEvents:"none",
        zIndex:"372",
        opacity:".72"
    });

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resize();
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

    if(!canvas)return;

    const size=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio||1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );

    createParticles();
}


/* =========================================================
   GET RAIN INTENSITY
   ========================================================= */

function getRain(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(
        !Array.isArray(data) ||
        !data.length
    ){

        return 0;
    }

    let total=0;
    let count=0;

    data.forEach(p=>{

        const rain=
            Number(p.rain);

        if(!Number.isFinite(rain))
            return;

        total+=Math.max(0,rain);
        count++;

    });

    return count
        ? total/count
        : 0;
}


/* =========================================================
   RAIN INTENSITY LEVEL
   ========================================================= */

function getIntensity(){

    const rain=getRain();

    return Math.max(
        .15,
        Math.min(
            5,
            .5+rain*2
        )
    );
}


/* =========================================================
   CREATE RAIN PARTICLES
   ========================================================= */

function createParticles(){

    if(!canvas)return;

    const size=map.getSize();

    const intensity=
        getIntensity();

    const count=
        Math.max(
            80,
            Math.min(
                420,
                Math.round(
                    120*intensity
                )
            )
        );

    particles=[];

    for(let i=0;i<count;i++){

        particles.push({
            x:Math.random()*size.x,
            y:Math.random()*size.y,
            length:
                8+
                Math.random()*18,
            speed:
                180+
                Math.random()*260,
            life:
                Math.random()
        });

    }
}


/* =========================================================
   RESET DROP
   ========================================================= */

function resetDrop(p){

    const size=map.getSize();

    p.x=Math.random()*size.x;

    p.y=-20;

    p.length=
        8+
        Math.random()*18;

    p.speed=
        180+
        Math.random()*260;

    p.life=0;
}


/* =========================================================
   DRAW RAIN FIELD
   ========================================================= */

function drawField(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(
        !Array.isArray(data) ||
        !data.length
    ){
        return;
    }

    const size=map.getSize();

    data.forEach(p=>{

        const rain=
            Number(p.rain);

        if(!Number.isFinite(rain))
            return;

        if(rain<=0)
            return;

        const pos=
            map.latLngToContainerPoint([
                p.lat,
                p.lon
            ]);

        const radius=
            30+
            Math.min(
                70,
                rain*18
            );

        const alpha=
            Math.min(
                .22,
                .04+
                rain*.025
            );

        const gradient=
            ctx.createRadialGradient(
                pos.x,
                pos.y,
                0,
                pos.x,
                pos.y,
                radius
            );

        gradient.addColorStop(
            0,
            "rgba(30,130,255,"+
            alpha+
            ")"
        );

        gradient.addColorStop(
            .45,
            "rgba(0,210,255,"+
            (alpha*.55)+
            ")"
        );

        gradient.addColorStop(
            1,
            "rgba(0,100,255,0)"
        );

        ctx.fillStyle=gradient;

        ctx.beginPath();

        ctx.arc(
            pos.x,
            pos.y,
            radius,
            0,
            Math.PI*2
        );

        ctx.fill();

    });
}


/* =========================================================
   ANIMATE
   ========================================================= */

function animate(time){

    if(!running)return;

    if(!lastTime)
        lastTime=time;

    const dt=
        Math.min(
            40,
            time-lastTime
        );

    lastTime=time;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    /* Smooth precipitation field */

    drawField();

    /* Animated rain */

    const intensity=
        getIntensity();

    particles.forEach(p=>{

        p.y+=
            p.speed*
            intensity*
            dt/1000;

        p.x+=
            p.speed*
            .10*
            dt/1000;

        p.life+=dt/1000;

        if(
            p.y>size.y+30 ||
            p.x>size.x+30
        ){
            resetDrop(p);
        }

        const alpha=
            Math.min(
                .75,
                .25+
                intensity*.08
            );

        ctx.beginPath();

        ctx.moveTo(
            p.x,
            p.y
        );

        ctx.lineTo(
            p.x-4,
            p.y+p.length
        );

        ctx.lineWidth=1;

        ctx.strokeStyle=
            "rgba(120,210,255,"+
            alpha+
            ")";

        ctx.stroke();

    });

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   START
   ========================================================= */

function start(){

    createCanvas();

    if(running)return;

    running=true;

    lastTime=0;

    createParticles();

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   STOP
   ========================================================= */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* =========================================================
   MODE SYNC
   ========================================================= */

function sync(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="rain"){

        start();

    }else{

        stop();

    }

}


/* =========================================================
   WATCH MODE + DATA
   ========================================================= */

setInterval(
    sync,
    700
);


/* =========================================================
   MAP EVENTS
   ========================================================= */

map.on(
    "resize",
    resize
);

map.on(
    "moveend",
    resize
);

map.on(
    "zoomend",
    resize
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_RAIN_FIELD={

    start:start,

    stop:stop,

    active:function(){
        return running;
    },

    getRain:getRain,

    getIntensity:getIntensity

};


/* =========================================================
   INITIALIZE
   ========================================================= */

setTimeout(
    sync,
    2600
);

console.log(
    "CBRND MAP V5 PART 26 READY — ADVANCED RAIN FIELD ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 27
   LIVE CLOUD COVERAGE ANIMATION
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("PART 27: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let clouds=[];
let animation=null;
let running=false;
let lastTime=0;


/* =========================================================
   CANVAS
   ========================================================= */

function createCanvas(){

    if(canvas)return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5CloudField";

    Object.assign(canvas.style,{
        position:"absolute",
        left:"0",
        top:"0",
        width:"100%",
        height:"100%",
        pointerEvents:"none",
        zIndex:"356",
        opacity:".42"
    });

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resize();
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

    if(!canvas)return;

    const size=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio||1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );

    createClouds();
}


/* =========================================================
   GET CLOUD COVER
   ========================================================= */

function getCloud(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(
        !Array.isArray(data) ||
        !data.length
    ){
        return 0;
    }

    let total=0;
    let count=0;

    data.forEach(p=>{

        const value=
            Number(p.cloud);

        if(!Number.isFinite(value))
            return;

        total+=Math.max(
            0,
            Math.min(100,value)
        );

        count++;

    });

    return count
        ? total/count
        : 0;
}


/* =========================================================
   CREATE CLOUD PARTICLES
   ========================================================= */

function createClouds(){

    if(!canvas)return;

    const size=map.getSize();

    const cloud=getCloud();

    const count=Math.max(
        18,
        Math.min(
            90,
            Math.round(
                18+
                cloud*.55
            )
        )
    );

    clouds=[];

    for(let i=0;i<count;i++){

        clouds.push({

            x:
                Math.random()*
                size.x,

            y:
                Math.random()*
                size.y,

            radius:
                35+
                Math.random()*75,

            speed:
                4+
                Math.random()*12,

            opacity:
                .08+
                Math.random()*.12

        });

    }
}


/* =========================================================
   DRAW CLOUD
   ========================================================= */

function drawCloud(c){

    const g=
        ctx.createRadialGradient(
            c.x,
            c.y,
            0,
            c.x,
            c.y,
            c.radius
        );

    g.addColorStop(
        0,
        "rgba(235,245,255,"+
        c.opacity+
        ")"
    );

    g.addColorStop(
        .55,
        "rgba(180,205,225,"+
        (c.opacity*.55)+
        ")"
    );

    g.addColorStop(
        1,
        "rgba(100,130,160,0)"
    );

    ctx.fillStyle=g;

    ctx.beginPath();

    ctx.arc(
        c.x,
        c.y,
        c.radius,
        0,
        Math.PI*2
    );

    ctx.fill();
}


/* =========================================================
   ANIMATION
   ========================================================= */

function animate(time){

    if(!running)return;

    if(!lastTime)
        lastTime=time;

    const dt=
        Math.min(
            50,
            time-lastTime
        );

    lastTime=time;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    const cloud=
        getCloud();

    const movement=
        .004+
        cloud*.00004;

    clouds.forEach(c=>{

        c.x+=
            c.speed*
            movement*
            dt;

        if(c.x-c.radius>size.x){

            c.x=
                -c.radius;

            c.y=
                Math.random()*
                size.y;

        }

        /*
         * Cloud opacity follows
         * actual cloud coverage.
         */

        const coverage=
            Math.max(
                .15,
                cloud/100
            );

        c.opacity=
            (.07+
            Math.random()*.10)*
            coverage;

        drawCloud(c);

    });

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   START
   ========================================================= */

function start(){

    createCanvas();

    if(running)return;

    running=true;

    lastTime=0;

    createClouds();

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   STOP
   ========================================================= */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* =========================================================
   MODE SYNC
   ========================================================= */

function sync(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="cloud"){

        start();

    }else{

        stop();

    }

}


/* =========================================================
   WATCH MODE
   ========================================================= */

setInterval(
    sync,
    800
);


/* =========================================================
   MAP EVENTS
   ========================================================= */

map.on(
    "resize",
    resize
);

map.on(
    "moveend",
    resize
);

map.on(
    "zoomend",
    resize
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_CLOUD_FIELD={

    start:start,

    stop:stop,

    active:function(){
        return running;
    },

    getCloud:getCloud

};


/* =========================================================
   INITIALIZE
   ========================================================= */

setTimeout(
    sync,
    2800
);

console.log(
    "CBRND MAP V5 PART 27 READY — CLOUD FIELD ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 28
   ADVANCED TEMPERATURE HEATMAP
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("PART 28: map not ready");
    return;
}

let canvas=null;
let ctx=null;
let animation=null;
let running=false;
let pulse=0;


/* =========================================================
   CANVAS
   ========================================================= */

function createCanvas(){

    if(canvas)return;

    canvas=document.createElement("canvas");

    canvas.id="cbrndV5TemperatureHeatmap";

    Object.assign(canvas.style,{
        position:"absolute",
        left:"0",
        top:"0",
        width:"100%",
        height:"100%",
        pointerEvents:"none",
        zIndex:"357",
        opacity:".62"
    });

    map.getContainer().appendChild(canvas);

    ctx=canvas.getContext("2d");

    resize();
}


/* =========================================================
   RESIZE
   ========================================================= */

function resize(){

    if(!canvas)return;

    const size=map.getSize();

    const dpr=Math.min(
        window.devicePixelRatio||1,
        2
    );

    canvas.width=size.x*dpr;
    canvas.height=size.y*dpr;

    canvas.style.width=size.x+"px";
    canvas.style.height=size.y+"px";

    ctx.setTransform(
        dpr,0,0,dpr,0,0
    );
}


/* =========================================================
   TEMPERATURE DATA
   ========================================================= */

function getTemperatureData(){

    const data=
        window.CBRND_MAP_V5_DATA;

    if(
        !Array.isArray(data) ||
        !data.length
    ){
        return [];
    }

    return data.filter(p=>
        Number.isFinite(
            Number(p.temperature)
        )
    );
}


/* =========================================================
   COLOR
   ========================================================= */

function temperatureColor(t){

    if(t<=0){
        return "40,110,255";
    }

    if(t<=10){
        return "0,210,255";
    }

    if(t<=20){
        return "40,220,150";
    }

    if(t<=30){
        return "255,225,40";
    }

    if(t<=40){
        return "255,120,20";
    }

    return "255,40,40";
}


/* =========================================================
   DRAW TEMPERATURE FIELD
   ========================================================= */

function drawField(){

    const points=
        getTemperatureData();

    if(!points.length)
        return;

    const values=
        points.map(p=>
            Number(p.temperature)
        );

    const min=
        Math.min(...values);

    const max=
        Math.max(...values);

    points.forEach(p=>{

        const temperature=
            Number(p.temperature);

        const pos=
            map.latLngToContainerPoint([
                p.lat,
                p.lon
            ]);

        const range=
            Math.max(
                1,
                max-min
            );

        const normalized=
            (temperature-min)/
            range;

        const radius=
            35+
            normalized*75;

        const rgb=
            temperatureColor(
                temperature
            );

        const gradient=
            ctx.createRadialGradient(
                pos.x,
                pos.y,
                0,
                pos.x,
                pos.y,
                radius
            );

        gradient.addColorStop(
            0,
            "rgba("+rgb+",.30)"
        );

        gradient.addColorStop(
            .35,
            "rgba("+rgb+",.18)"
        );

        gradient.addColorStop(
            .70,
            "rgba("+rgb+",.07)"
        );

        gradient.addColorStop(
            1,
            "rgba("+rgb+",0)"
        );

        ctx.fillStyle=gradient;

        ctx.beginPath();

        ctx.arc(
            pos.x,
            pos.y,
            radius,
            0,
            Math.PI*2
        );

        ctx.fill();

    });
}


/* =========================================================
   EXTREME TEMPERATURE ZONES
   ========================================================= */

function drawExtremes(){

    const points=
        getTemperatureData();

    if(!points.length)
        return;

    let hottest=points[0];
    let coldest=points[0];

    points.forEach(p=>{

        const t=
            Number(p.temperature);

        if(
            t>
            Number(hottest.temperature)
        ){
            hottest=p;
        }

        if(
            t<
            Number(coldest.temperature)
        ){
            coldest=p;
        }

    });

    drawExtremePoint(
        hottest,
        true
    );

    drawExtremePoint(
        coldest,
        false
    );
}


/* =========================================================
   EXTREME POINT
   ========================================================= */

function drawExtremePoint(
    point,
    hot
){

    const pos=
        map.latLngToContainerPoint([
            point.lat,
            point.lon
        ]);

    const pulseSize=
        14+
        Math.sin(pulse)*4;

    ctx.beginPath();

    ctx.arc(
        pos.x,
        pos.y,
        pulseSize,
        0,
        Math.PI*2
    );

    ctx.strokeStyle=
        hot
        ? "rgba(255,70,30,.75)"
        : "rgba(40,160,255,.75)";

    ctx.lineWidth=2;

    ctx.stroke();

    ctx.beginPath();

    ctx.arc(
        pos.x,
        pos.y,
        4,
        0,
        Math.PI*2
    );

    ctx.fillStyle=
        hot
        ? "rgba(255,80,30,.95)"
        : "rgba(50,170,255,.95)";

    ctx.fill();

    /*
     * Small temperature label
     */

    const value=
        Number(
            point.temperature
        ).toFixed(1);

    ctx.font=
        "bold 11px Arial";

    ctx.textAlign="center";

    ctx.fillStyle=
        "rgba(255,255,255,.92)";

    ctx.fillText(
        (hot?"🔥 ":"❄️ ")+
        value+
        "°C",
        pos.x,
        pos.y-20
    );
}


/* =========================================================
   ANIMATION
   ========================================================= */

function animate(){

    if(!running)
        return;

    const size=map.getSize();

    ctx.clearRect(
        0,
        0,
        size.x,
        size.y
    );

    pulse+=.045;

    drawField();

    drawExtremes();

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   START
   ========================================================= */

function start(){

    createCanvas();

    if(running)
        return;

    running=true;

    pulse=0;

    animation=
        requestAnimationFrame(
            animate
        );
}


/* =========================================================
   STOP
   ========================================================= */

function stop(){

    running=false;

    if(animation){

        cancelAnimationFrame(
            animation
        );

        animation=null;
    }

    if(ctx){

        const size=map.getSize();

        ctx.clearRect(
            0,
            0,
            size.x,
            size.y
        );
    }
}


/* =========================================================
   MODE SYNC
   ========================================================= */

function sync(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    if(metric==="temperature"){

        start();

    }else{

        stop();

    }

}


/* =========================================================
   WATCH MODE
   ========================================================= */

setInterval(
    sync,
    800
);


/* =========================================================
   MAP EVENTS
   ========================================================= */

map.on(
    "resize",
    resize
);

map.on(
    "moveend",
    resize
);

map.on(
    "zoomend",
    resize
);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_TEMPERATURE_HEATMAP={

    start:start,

    stop:stop,

    active:function(){
        return running;
    },

    getData:getTemperatureData

};


/* =========================================================
   INITIALIZE
   ========================================================= */

setTimeout(
    sync,
    3000
);

console.log(
    "CBRND MAP V5 PART 28 READY — TEMPERATURE HEATMAP ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 29
   FINAL LIVE MAP PERFORMANCE ENGINE
   ========================================================= */

(function(){
"use strict";

if(typeof map==="undefined" || !map){
    console.warn("PART 29: map not ready");
    return;
}

const PERF={
    enabled:true,
    moving:false,
    lastRender:0,
    renderDelay:120,
    mobile:
        /Android|iPhone|iPad|iPod/i
        .test(navigator.userAgent)
};


/* =========================================================
   MAP MOVEMENT OPTIMIZATION
   ========================================================= */

map.on("movestart",()=>{

    PERF.moving=true;

    const container=
        map.getContainer();

    container.classList.add(
        "cbrnd-map-moving"
    );

});


map.on("zoomstart",()=>{

    PERF.moving=true;

});


map.on("moveend",()=>{

    PERF.moving=false;

    requestRender();

});


map.on("zoomend",()=>{

    PERF.moving=false;

    requestRender();

});


/* =========================================================
   CSS PERFORMANCE
   ========================================================= */

function addPerformanceCSS(){

    if(
        document.getElementById(
            "cbrndV5PerformanceCSS"
        )
    )return;

    const style=
        document.createElement("style");

    style.id=
        "cbrndV5PerformanceCSS";

    style.textContent=`

        #map.cbrnd-map-moving
        #cbrndV5WeatherField,
        #map.cbrnd-map-moving
        #cbrndV5WindParticles,
        #map.cbrnd-map-moving
        #cbrndV5WindFlowField,
        #map.cbrnd-map-moving
        #cbrndV5RainField,
        #map.cbrnd-map-moving
        #cbrndV5CloudField,
        #map.cbrnd-map-moving
        #cbrndV5TemperatureHeatmap,
        #map.cbrnd-map-moving
        #cbrndV5HotspotLayer{
            opacity:.18 !important;
        }

        #cbrndV5WindParticles,
        #cbrndV5WindFlowField,
        #cbrndV5RainField,
        #cbrndV5CloudField,
        #cbrndV5TemperatureHeatmap,
        #cbrndV5HotspotLayer{
            will-change:transform,opacity;
        }

    `;

    document.head.appendChild(style);
}


/* =========================================================
   REQUEST RENDER
   ========================================================= */

let renderTimer=null;

function requestRender(){

    clearTimeout(renderTimer);

    renderTimer=
        setTimeout(()=>{

            const now=
                performance.now();

            if(
                now-
                PERF.lastRender
                <
                PERF.renderDelay
            ){
                return;
            }

            PERF.lastRender=now;

            if(
                typeof window
                .CBRND_MAP_V5_SCHEDULE_RENDER
                ==="function"
            ){

                window
                .CBRND_MAP_V5_SCHEDULE_RENDER();

            }

        },PERF.renderDelay);

}


/* =========================================================
   SMART LAYER CONTROL
   ========================================================= */

function setOpacity(id,value){

    const el=
        document.getElementById(id);

    if(el)
        el.style.opacity=
            String(value);

}


/* =========================================================
   ACTIVE MODE OPTIMIZATION
   ========================================================= */

function optimizeLayers(){

    const metric=
        window.CBRND_MAP_V5_METRIC ||
        "temperature";

    const radar=
        window.CBRND_MAP_V5_RADAR_ACTIVE;

    /*
     * Base visibility
     */

    setOpacity(
        "cbrndV5WeatherField",
        .70
    );

    setOpacity(
        "cbrndV5HotspotLayer",
        .48
    );

    setOpacity(
        "cbrndV5WindParticles",
        .75
    );

    setOpacity(
        "cbrndV5WindFlowField",
        .78
    );

    setOpacity(
        "cbrndV5RainField",
        .72
    );

    setOpacity(
        "cbrndV5CloudField",
        .42
    );

    setOpacity(
        "cbrndV5TemperatureHeatmap",
        .62
    );


    /*
     * Wind mode
     */

    if(metric==="wind"){

        setOpacity(
            "cbrndV5WindParticles",
            .85
        );

        setOpacity(
            "cbrndV5WindFlowField",
            .90
        );

        setOpacity(
            "cbrndV5HotspotLayer",
            .30
        );

    }


    /*
     * Rain mode
     */

    if(metric==="rain"){

        setOpacity(
            "cbrndV5RainField",
            .85
        );

        setOpacity(
            "cbrndV5HotspotLayer",
            .35
        );

    }


    /*
     * Cloud mode
     */

    if(metric==="cloud"){

        setOpacity(
            "cbrndV5CloudField",
            .70
        );

        setOpacity(
            "cbrndV5HotspotLayer",
            .30
        );

    }


    /*
     * Temperature mode
     */

    if(metric==="temperature"){

        setOpacity(
            "cbrndV5TemperatureHeatmap",
            .72
        );

        setOpacity(
            "cbrndV5HotspotLayer",
            .40
        );

    }


    /*
     * Radar mode
     */

    if(radar){

        const radarLayer=
            document.querySelector(
                ".leaflet-tile-pane"
            );

        if(radarLayer){
            radarLayer.style.willChange=
                "opacity";
        }

    }

}


/* =========================================================
   MOBILE OPTIMIZATION
   ========================================================= */

function mobileOptimization(){

    if(!PERF.mobile)
        return;

    /*
     * Reduce visual workload on phones.
     */

    const wind=
        document.getElementById(
            "cbrndV5WindParticles"
        );

    const flow=
        document.getElementById(
            "cbrndV5WindFlowField"
        );

    const rain=
        document.getElementById(
            "cbrndV5RainField"
        );

    if(wind)
        wind.style.opacity=".60";

    if(flow)
        flow.style.opacity=".62";

    if(rain)
        rain.style.opacity=".55";

}


/* =========================================================
   SMART ZOOM
   ========================================================= */

function zoomOptimization(){

    const zoom=
        map.getZoom();

    /*
     * At low zoom, reduce heavy overlays.
     */

    if(zoom<6){

        setOpacity(
            "cbrndV5HotspotLayer",
            .25
        );

        setOpacity(
            "cbrndV5TemperatureHeatmap",
            .40
        );

    }

    /*
     * At high zoom, restore detail.
     */

    if(zoom>=9){

        const metric=
            window.CBRND_MAP_V5_METRIC;

        if(metric==="temperature"){

            setOpacity(
                "cbrndV5TemperatureHeatmap",
                .72
            );

        }

        if(metric==="rain"){

            setOpacity(
                "cbrndV5RainField",
                .85
            );

        }

    }

}


/* =========================================================
   PERFORMANCE MONITOR
   ========================================================= */

let fpsFrames=0;
let fpsTime=performance.now();
let currentFPS=60;

function fpsMonitor(){

    fpsFrames++;

    const now=
        performance.now();

    if(now-fpsTime>=1000){

        currentFPS=
            fpsFrames;

        fpsFrames=0;
        fpsTime=now;

        window
        .CBRND_MAP_V5_FPS=
            currentFPS;

    }

    requestAnimationFrame(
        fpsMonitor
    );
}


/* =========================================================
   AUTO PERFORMANCE MODE
   ========================================================= */

function autoPerformance(){

    if(currentFPS<30){

        setOpacity(
            "cbrndV5WindFlowField",
            .45
        );

        setOpacity(
            "cbrndV5HotspotLayer",
            .25
        );

    }

    if(currentFPS>=45){

        optimizeLayers();

    }

}


/* =========================================================
   WATCH SYSTEM
   ========================================================= */

setInterval(()=>{

    optimizeLayers();

    zoomOptimization();

    mobileOptimization();

    autoPerformance();

},2000);


/* =========================================================
   PUBLIC API
   ========================================================= */

window.CBRND_MAP_V5_PERFORMANCE_ENGINE={

    enabled:true,

    mobile:PERF.mobile,

    moving:()=>PERF.moving,

    fps:()=>currentFPS,

    optimize:optimizeLayers,

    requestRender:requestRender,

    state:function(){

        return{

            enabled:PERF.enabled,

            mobile:PERF.mobile,

            moving:PERF.moving,

            fps:currentFPS,

            metric:
                window.CBRND_MAP_V5_METRIC,

            radar:
                window.CBRND_MAP_V5_RADAR_ACTIVE

        };

    }

};


/* =========================================================
   INITIALIZE
   ========================================================= */

addPerformanceCSS();

setTimeout(()=>{

    optimizeLayers();

    zoomOptimization();

    mobileOptimization();

},3500);

requestAnimationFrame(
    fpsMonitor
);

console.log(
    "CBRND MAP V5 PART 29 READY — PERFORMANCE ENGINE ACTIVE"
);

})();
/* =========================================================
   CBRND MAP V5 — PART 30
   FINAL MASTER MAP CONTROLLER
   ========================================================= */

(function(){
"use strict";

const MASTER = {

    ready: true,

    metric:
        window.CBRND_MAP_V5_METRIC ||
        "temperature",

    lastSync: 0

};


/* =========================================================
   GET CURRENT METRIC
   ========================================================= */

function getMetric(){

    return (
        window.CBRND_MAP_V5_METRIC ||
        "temperature"
    );

}


/* =========================================================
   SAFE CALL
   ========================================================= */

function callAPI(apiName,method){

    try{

        const api=
            window[apiName];

        if(
            api &&
            typeof api[method]==="function"
        ){

            api[method]();

        }

    }catch(error){

        console.warn(
            "CBRND MASTER:",
            apiName,
            method,
            error
        );

    }

}


/* =========================================================
   MASTER LAYER SYNC
   ========================================================= */

function syncLayers(){

    const metric=getMetric();

    MASTER.metric=metric;


    /*
     * -----------------------------------------------
     * TEMPERATURE
     * -----------------------------------------------
     */

    if(metric==="temperature"){

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "hide"
        );

    }


    /*
     * -----------------------------------------------
     * HUMIDITY
     * -----------------------------------------------
     */

    if(metric==="humidity"){

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "hide"
        );

    }


    /*
     * -----------------------------------------------
     * PRESSURE
     * -----------------------------------------------
     */

    if(metric==="pressure"){

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "hide"
        );

    }


    /*
     * -----------------------------------------------
     * WIND
     * -----------------------------------------------
     */

    if(metric==="wind"){

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "show"
        );

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "stop"
        );

    }


    /*
     * -----------------------------------------------
     * RAIN
     * -----------------------------------------------
     */

    if(metric==="rain"){

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "hide"
        );

    }


    /*
     * -----------------------------------------------
     * CLOUD
     * -----------------------------------------------
     */

    if(metric==="cloud"){

        callAPI(
            "CBRND_MAP_V5_CLOUD_FIELD",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_HOTSPOTS",
            "start"
        );

        callAPI(
            "CBRND_MAP_V5_TEMPERATURE_HEATMAP",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_FLOW",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_WIND_STREAMLINES",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_RAIN_FIELD",
            "stop"
        );

        callAPI(
            "CBRND_MAP_V5_COMPASS",
            "hide"
        );

    }

}


/* =========================================================
   UPDATE LIVE STATUS
   ========================================================= */

function updateMasterStatus(){

    const status=
        document.getElementById(
            "cbrndV5LiveStatus"
        );

    if(!status)
        return;


    let badge=
        document.getElementById(
            "cbrndV5MasterStatus"
        );


    if(!badge){

        badge=
            document.createElement("div");

        badge.id=
            "cbrndV5MasterStatus";

        status.appendChild(badge);

    }


    const metric=
        getMetric();

    const radar=
        window.CBRND_MAP_V5_RADAR_ACTIVE
        ? "ON"
        : "OFF";

    const fps=
        window.CBRND_MAP_V5_FPS ||
        60;

    const points=
        Array.isArray(
            window.CBRND_MAP_V5_DATA
        )
        ?
        window.CBRND_MAP_V5_DATA.length
        :
        0;


    badge.innerHTML=
        `
        <span class="master-live-dot"></span>
        <b>MASTER LIVE</b>
        <span>•</span>
        <span>${metric.toUpperCase()}</span>
        <span>•</span>
        <span>${points} PTS</span>
        <span>•</span>
        <span>RADAR ${radar}</span>
        <span>•</span>
        <span>${fps} FPS</span>
        `;

}


/* =========================================================
   MASTER CSS
   ========================================================= */

function addMasterCSS(){

    if(
        document.getElementById(
            "cbrndV5MasterCSS"
        )
    ){
        return;
    }


    const style=
        document.createElement("style");

    style.id=
        "cbrndV5MasterCSS";


    style.textContent=`

        #cbrndV5MasterStatus{

            margin-top:6px;

            display:flex;

            align-items:center;

            flex-wrap:wrap;

            gap:6px;

            font-size:10px;

            letter-spacing:.6px;

            color:#bfefff;

            opacity:.95;

        }


        .master-live-dot{

            width:7px;

            height:7px;

            border-radius:50%;

            background:#00ff9d;

            box-shadow:
                0 0 6px #00ff9d,
                0 0 12px #00ff9d;

            animation:
                cbrndMasterPulse
                1.2s infinite;

        }


        @keyframes cbrndMasterPulse{

            0%{
                opacity:.35;
                transform:scale(.8);
            }

            50%{
                opacity:1;
                transform:scale(1.2);
            }

            100%{
                opacity:.35;
                transform:scale(.8);
            }

        }


        /*
         * Mobile
         */

        @media(max-width:600px){

            #cbrndV5MasterStatus{

                font-size:8px;

                gap:4px;

            }

        }

    `;


    document.head.appendChild(style);

}


/* =========================================================
   METRIC CHANGE WATCHER
   ========================================================= */

let lastMetric=
    getMetric();


function watchMetric(){

    const metric=
        getMetric();


    if(metric!==lastMetric){

        lastMetric=metric;

        syncLayers();

    }

}


/* =========================================================
   MAIN MASTER LOOP
   ========================================================= */

function masterLoop(){

    watchMetric();

    updateMasterStatus();

    requestAnimationFrame(
        masterLoop
    );

}


/* =========================================================
   MAP READY INITIALIZATION
   ========================================================= */

function initialize(){

    addMasterCSS();

    syncLayers();

    updateMasterStatus();

    console.log(
        "CBRND MAP V5 MASTER:",
        "INITIALIZED"
    );

}


/* =========================================================
   PUBLIC MASTER API
   ========================================================= */

window.CBRND_MAP_V5_MASTER={

    ready:true,

    sync:function(){

        syncLayers();

        updateMasterStatus();

    },

    metric:function(){

        return getMetric();

    },

    status:function(){

        return{

            ready:true,

            metric:
                getMetric(),

            points:
                Array.isArray(
                    window.CBRND_MAP_V5_DATA
                )
                ?
                window.CBRND_MAP_V5_DATA.length
                :
                0,

            radar:
                !!window
                .CBRND_MAP_V5_RADAR_ACTIVE,

            fps:
                window
                .CBRND_MAP_V5_FPS ||
                60

        };

    }

};


/* =========================================================
   START
   ========================================================= */

if(
    document.readyState==="loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        ()=>{

            setTimeout(
                initialize,
                1000
            );

            requestAnimationFrame(
                masterLoop
            );

        }
    );

}else{

    setTimeout(
        initialize,
        1000
    );

    requestAnimationFrame(
        masterLoop
    );

}


console.log(
    "CBRND MAP V5 PART 30 READY — MASTER CONTROLLER ACTIVE"
);

})();
