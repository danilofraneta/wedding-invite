import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// --- ENVELOPE LOGIC ---
const envelope = document.getElementById('envelope');
const overlay = document.getElementById('envelopeOverlay');
const music = document.getElementById('bg-music');

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
        }, 1200);
    });
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

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    if (flower) {
        flower.rotation.x += 0.003;
    }
    renderer.render(scene, camera);
}

animate();