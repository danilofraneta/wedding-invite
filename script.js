import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- ENVELOPE LOGIC ---
const envelope = document.getElementById('envelope');
const overlay = document.getElementById('envelopeOverlay');

if (envelope) {
    envelope.addEventListener('click', () => {
        envelope.classList.add('open');
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

// --- MYSTIC LIGHTING ---
const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 2.5);
scene.add(hemiLight);

const mysticLight = new THREE.PointLight(0xffcc00, 15, 100);
mysticLight.position.set(-5, 5, 5); // Moved light toward the top-left
scene.add(mysticLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// --- MODEL LOADING ---
const loader = new GLTFLoader();
let flower;

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
                child.material.envMapIntensity = 2;
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