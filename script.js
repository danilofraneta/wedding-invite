import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// --- ENVELOPE LOGIC ---
const envelope = document.getElementById('envelope');
const overlay = document.getElementById('envelopeOverlay');
const music = document.getElementById('bg-music');
let isAutoScrolling = false;
let ignoreScroll = false;
let flowerMixer;
const clock = new THREE.Clock();

if (envelope) {
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');

        // ▶️ START MUSIC
        if (music) {
            music.volume = 0.5; // 0.0 - 1.0
            music.play().catch(() => { });
        }

        setTimeout(() => {
            overlay.classList.add('open');

            showScrollIndicatorAfterEnvelope();

            // 🔥 pokreni animacije tek sad
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('show');
            });

            // ⬇️ DODAJ OVO
            setTimeout(() => {
                hintScroll();
                scheduleScrollHint(3000);  // ⬅️ DODAJ OVO
            }, 5500); // čeka da korisnik vidi sadržaj

        }, 1200);
    });
}

let userScrolled = false;


function hintScroll() {
    if (userScrolled) return;

    isAutoScrolling = true;
    ignoreScroll = true; // 👈 počni ignorisati

    const startY = window.scrollY;
    const amplitude = 60;
    const duration = 600;

    let startTime = null;

    document.documentElement.style.scrollBehavior = "auto";

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const movement = Math.sin(progress * Math.PI) * amplitude;
        window.scrollTo(0, startY + movement);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            document.documentElement.style.scrollBehavior = "smooth";
            isAutoScrolling = false;

            // 👇 KLJUČNO – mali delay da se browser smiri
            setTimeout(() => {
                ignoreScroll = false;
            }, 200);
        }
    }

    requestAnimationFrame(animate);
}

// --- THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Slightly further back to accommodate the larger scale

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('flower-canvas'),
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- SUNNY DAY LIGHTING ---

// ☀️ Sun light (main light)
const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
sunLight.position.set(5, 10, 5);
scene.add(sunLight);

// 🌤️ Sky light (blue from above, warm from ground)
const hemiLight = new THREE.HemisphereLight(
    0xb1e1ff,  // sky color (light blue)
    0xffe0b2,  // ground color (warm bounce)
    1.2
);
scene.add(hemiLight);

// 🌫️ Soft ambient fill
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// --- MODEL LOADING ---
const loader = new GLTFLoader();
let flower;

new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/venice_sunset_1k.hdr', function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

loader.load(
    'assets/models/flower.glb',
    (gltf) => {
        flower = gltf.scene;
        scene.add(flower);

        // ✅ POKRENI ANIMACIJU IZ GLB
        if (gltf.animations && gltf.animations.length > 0) {
            flowerMixer = new THREE.AnimationMixer(flower);

            gltf.animations.forEach((clip) => {
                flowerMixer.clipAction(clip).play();
            });
        }

        // --- POSITION & SIZE ---
        flower.scale.set(2.2, 2.2, 2.2); // Doubled the size
        flower.position.x = -0.5;        // Moves it to the left
        flower.position.y = 1.5;         // Moves it to the top

        flower.traverse((child) => {
            if (child.isMesh) {

                // 🌈 COLOR (tint)
                child.material.color.offsetHSL(0, 0, 0.05); // brighter colors

                // 💡 BRIGHTNESS / REFLECTION
                child.material.envMapIntensity = 3;

                // 🌸 SOFT LOOK
                child.material.roughness = 0.6;  // lower = shinier
                child.material.metalness = 0.1;

                // ✨ OPTIONAL: make colors pop more
                child.material.emissive = new THREE.Color(0x220000);
                child.material.emissiveIntensity = 0.2;

                child.material.side = THREE.DoubleSide;

                child.material.roughness = 0.5;

                child.material.polygonOffset = true;
                child.material.polygonOffsetFactor = 1;
                child.material.polygonOffsetUnits = 1;

                child.material.transparent = true;
                child.material.depthWrite = false;
            }
        });
        console.log("Success: Large Corner Flower loaded!");
    }
);

// --- INTERACTIVITY ---
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (flower) {
        // Slow rotation
        flower.rotation.y = scrollY * 0.005;

        // Parallax: It drifts slightly as you scroll
        // Starting at 1.5 (top) and moving down slowly
        flower.position.y = 1.5 - (scrollY * 0.002);

        // Subtle side-to-side sway
        flower.position.x = -0.5 + Math.sin(scrollY * 0.001) * 0.2;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Adjust position on resize to keep it in the corner
    if (flower) {
        flower.position.x = window.innerWidth < 768 ? -1.5 : -2.5;
    }
});



// Tajmer
const weddingDate = new Date(2026, 5, 21);

const el = {
    months: document.getElementById("months"),
    days: document.getElementById("days"),
    hours: document.getElementById("hours")
};

function animateChange(element, newValue) {
    element.style.transform = "translateY(-10px)";
    element.style.opacity = "0";

    setTimeout(() => {
        element.textContent = String(newValue).padStart(2, "0");
        element.style.transform = "translateY(0)";
        element.style.opacity = "1";
    }, 150);
}

function updateCountdown() {
    const now = new Date();
    let diff = weddingDate - now;

    if (diff <= 0) return;

    let totalHours = Math.floor(diff / (1000 * 60 * 60));
    let days = Math.floor(totalHours / 24);
    let months = Math.floor(days / 30);

    days = days % 30;
    let hours = totalHours % 24;

    animateChange(el.months, months);
    animateChange(el.days, days);
    animateChange(el.hours, hours);
}

// update every second
// Pokreni odmah
updateCountdown();

// Izračunaj koliko je ostalo do sljedećeg sata
function scheduleNextUpdate() {
    const now = new Date();
    const msToNextHour =
        (60 - now.getMinutes()) * 60 * 1000 -
        now.getSeconds() * 1000;

    setTimeout(() => {
        updateCountdown();
        scheduleNextUpdate(); // ponovo zakazivanje
    }, msToNextHour);
}

scheduleNextUpdate();
updateCountdown();

const countdown = document.getElementById("countdown");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            countdown.classList.add("show");
        }
    });
});

observer.observe(countdown);



const reveals = document.querySelectorAll(".reveal");

const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, {
    threshold: 0.05,
    rootMargin: "0px 0px -100px 0px"
});

reveals.forEach(el => observer2.observe(el));


// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();

    if (flowerMixer) {
        flowerMixer.update(delta);
    }

    if (flower) {
        flower.rotation.x += 0.003;
    }

    renderer.render(scene, camera);
}

animate();


document.addEventListener("visibilitychange", () => {
    if (!music) return;

    if (document.hidden) {
        music.pause();
    } else {
        music.play().catch(() => { });
    }
});






const indicator = document.getElementById("scrollIndicator");
let scrollHintTimeout;

// funkcija koja pokazuje strelicu samo ako korisnik još nije skrolovao
function scheduleScrollHint(delay = 4000) {
    clearTimeout(scrollHintTimeout);
    scrollHintTimeout = setTimeout(() => {
        if (!userScrolled && indicator) {
            indicator.classList.add("show");
        }
    }, delay);
}

// sakrij strelicu čim korisnik scrolluje
function hideScrollIndicator() {
    if (!indicator) return;

    indicator.classList.remove("show");
    indicator.style.opacity = "0";
    indicator.style.transition = "opacity 0.5s ease";
}

// prati scroll
window.addEventListener("scroll", () => {
    if (isAutoScrolling || ignoreScroll) return;

    if (userScrolled) return;

    userScrolled = true;
    hideScrollIndicator();
    clearTimeout(scrollHintTimeout);
});

// pokreni hint nakon otvaranja koverti i animacija
function showScrollIndicatorAfterEnvelope() {
    // mala pauza da se overlay fade-out završi
    setTimeout(() => {
        scheduleScrollHint(4000); // strelica se pojavi 4s ako korisnik ne scrolluje
    }, 500);
}



function showScrollIndicatorSafe() {
    // čeka dok overlay potpuno nestane
    setTimeout(() => {
        if (!userScrolled) {
            indicator.classList.add("show");
        }
    }, 500); // 0.5s nakon fade-out
}













const langBtn = document.getElementById("langToggle");

let currentLang = "me"; // default je naš

const translations = {
    me: {
        subtitle: "Pozivamo Vas na naše vjenčanje",
        date: "20. jun 2026.",
        detailsTitle: "Detalji",
        timeLabel: "Vrijeme",
        locationLabel: "Lokacija",
        locationValue: "Restoran Adriatica<br>Kamenari, Crna Gora",
        dressLabel: "Dres kod",
        dressValue: "Formalno",
        greeting: "Radujemo se Vašem dolasku!",
        months: "mjeseca",
        days: "dana",
        hours: "sati"
    },
    en: {
        subtitle: "We invite you to our wedding",
        date: "June 20, 2026",
        detailsTitle: "Details",
        timeLabel: "Time",
        locationLabel: "Location",
        locationValue: "Restaurant Adriatica<br>Kamenari, Montenegro",
        dressLabel: "Dress Code",
        dressValue: "Formal",
        greeting: "We look forward to your arrival!",
        months: "months",
        days: "days",
        hours: "hours"
    }
};

langBtn.addEventListener("click", () => {
    currentLang = currentLang === "me" ? "en" : "me";

    const t = translations[currentLang];

    // HERO subtitle
    document.querySelector(".subtitle").textContent = t.subtitle;

    // datum
    document.querySelector(".datum").textContent = t.date;

    // labels
    document.querySelectorAll(".label2")[0].textContent = t.timeLabel;
    document.querySelectorAll(".label2")[1].textContent = t.locationLabel;
    document.querySelector(".location-text").innerHTML = t.locationValue;
    document.querySelectorAll(".label2")[2].textContent = t.dressLabel;

    // dress code value
    document.querySelector(".details-title").childNodes[1].nodeValue = " " + t.detailsTitle + " ";
    document.querySelector(".dress-code-text").textContent = t.dressValue;
    // greeting
    document.querySelector(".pozdrav p").textContent = t.greeting;

    // countdown labels
    const labels = document.querySelectorAll(".countdown .label");
    labels[0].textContent = t.months;
    labels[1].textContent = t.days;
    labels[2].textContent = t.hours;

    // promijeni dugme tekst
    langBtn.textContent = currentLang === "me" ? "EN" : "SR";
});