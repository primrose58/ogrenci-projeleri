import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Void Descent - Core Logic
 */

// --- Configuration ---
const CONFIG = {
    segmentCount: 40,
    segmentLength: 0.5,
    gravity: -0.01, // Very low gravity to prevent self-snapping
    friction: 0.9,
    stiffness: 20, // Rigid rope
    speed: 0.2,
    maxTension: 50.0, // Very high threshold (impossible to snap by accident)
    fov: 60
};

// --- State ---
const state = {
    isPlaying: false,
    startTime: 0,
    score: 0,
    energy: 0,
    tension: 0,
    depth: 0,
    mouseX: 0,
    mouseY: 0,
    isDragging: false,
    particles: []
};

// --- Scene Setup ---
const canvasContainer = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.03);

const camera = new THREE.PerspectiveCamera(CONFIG.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ReinhardToneMapping;
canvasContainer.appendChild(renderer.domElement);

// Post Processing (Bloom)
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 1.6;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lighting
const ambientLight = new THREE.AmbientLight(0x808080);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 2, 100);
pointLight.position.set(0, 10, 10);
scene.add(pointLight);

// Tunnel Light
const tunnelLight = new THREE.PointLight(0x00f3ff, 1, 50);
tunnelLight.position.set(0, 0, 10);
scene.add(tunnelLight);

// --- Particles (Juice) ---
const particleCount = 200;
const particleGeo = new THREE.BufferGeometry();
const particlePos = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) particlePos[i] = (Math.random() - 0.5) * 40;
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});
const particlesMesh = new THREE.Points(particleGeo, particleMat);
scene.add(particlesMesh);

function updateParticles() {
    const positions = particlesMesh.geometry.attributes.position.array;
    for (let i = 1; i < particleCount * 3; i += 3) { // Y axis
        positions[i] += CONFIG.speed * 2; // Move up faster than tunnel
        if (positions[i] > 20) positions[i] -= 40; // Loop
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;
}

// Camera Shake Helper
let shakeIntensity = 0;
function addShake(amount) {
    shakeIntensity = Math.min(shakeIntensity + amount, 1.0);
}
function updateShake() {
    if (shakeIntensity > 0) {
        const rx = (Math.random() - 0.5) * shakeIntensity;
        const ry = (Math.random() - 0.5) * shakeIntensity;
        camera.position.x = rx;
        camera.position.y = ry;
        shakeIntensity *= 0.9;
        if (shakeIntensity < 0.01) {
            shakeIntensity = 0;
            camera.position.set(0, 0, 20); // Reset
        }
    }
}

// --- Rope Physics (Verlet) ---
class Point {
    constructor(x, y, z, pinned = false) {
        this.pos = new THREE.Vector3(x, y, z);
        this.oldPos = new THREE.Vector3(x, y, z);
        this.pinned = pinned;
    }

    update() {
        if (this.pinned) return;

        const vel = this.pos.clone().sub(this.oldPos).multiplyScalar(CONFIG.friction);
        this.oldPos.copy(this.pos);
        this.pos.add(vel);
        this.pos.y += CONFIG.gravity;
    }
}

class Stick {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = CONFIG.segmentLength;
    }

    update() {
        const dx = this.p2.pos.x - this.p1.pos.x;
        const dy = this.p2.pos.y - this.p1.pos.y;
        const dz = this.p2.pos.z - this.p1.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist === 0) return;

        const diff = this.length - dist;
        const percent = diff / dist / 2;
        const offset = new THREE.Vector3(dx * percent, dy * percent, dz * percent);

        if (!this.p1.pinned) this.p1.pos.sub(offset);
        if (!this.p2.pinned) this.p2.pos.add(offset);
    }
}

// Init Rope
const points = [];
const sticks = [];

// Rope Visuals
const ropeCurve = new THREE.CatmullRomCurve3([]);
let ropeMesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    emissive: 0x00f3ff,
    emissiveIntensity: 0.5,
    roughness: 0.4,
    metalness: 0.8
}));
scene.add(ropeMesh);

// Payload
const payloadGroup = new THREE.Group();
scene.add(payloadGroup);

const payloadGeo = new THREE.IcosahedronGeometry(0.8, 0);
const payloadMat = new THREE.MeshStandardMaterial({
    color: 0xff00ff,
    wireframe: true,
    emissive: 0xff00ff,
    emissiveIntensity: 0.8
});
const payloadMesh = new THREE.Mesh(payloadGeo, payloadMat);
payloadGroup.add(payloadMesh);

const glowGeo = new THREE.SphereGeometry(0.4, 16, 16);
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
payloadGroup.add(glowMesh);

// Init Physics functions
function initRope() {
    points.length = 0;
    sticks.length = 0;
    const startY = 10;
    for (let i = 0; i < CONFIG.segmentCount; i++) {
        points.push(new Point(0, startY - (i * CONFIG.segmentLength), 0, i === 0));
    }
    for (let i = 0; i < points.length - 1; i++) {
        sticks.push(new Stick(points[i], points[i + 1]));
    }
}

// --- Environment ---
const tunnelSegments = [];
const tunnelGeo = new THREE.TorusGeometry(8, 0.5, 16, 50);
const tunnelMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.1,
    metalness: 0.5,
    wireframe: true
});

function spawnTunnelSegment(z) {
    const mesh = new THREE.Mesh(tunnelGeo, tunnelMat);
    mesh.position.set(0, 0, z);
    mesh.rotation.z = Math.random() * Math.PI;
    scene.add(mesh);
    tunnelSegments.push(mesh);
}

for (let i = 0; i < 30; i++) {
    spawnTunnelSegment(-i * 5);
}

// Collectibles
const collectibles = [];
const orbGeo = new THREE.OctahedronGeometry(0.4, 0);
const orbMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });

function spawnCollectible(z) {
    if (Math.random() > 0.4) return;
    const mesh = new THREE.Mesh(orbGeo, orbMat);
    const angle = Math.random() * Math.PI * 2;
    const radius = 3;
    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, z);

    const light = new THREE.PointLight(0xffff00, 1, 3);
    mesh.add(light);

    scene.add(mesh);
    collectibles.push(mesh);
}

// --- Input ---
function handleInput(x, y) {
    state.mouseX = (x / window.innerWidth) * 2 - 1;
    state.mouseY = -(y / window.innerHeight) * 2 + 1;
    state.isDragging = true;
}

window.addEventListener('mousemove', e => handleInput(e.clientX, e.clientY));
window.addEventListener('touchmove', e => {
    e.preventDefault();
    handleInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('mouseup', () => state.isDragging = false);
window.addEventListener('touchend', () => state.isDragging = false);

// --- Game Loop ---
function updatePhysics() {
    // Anchor Follow
    if (points.length > 0) {
        const vector = new THREE.Vector3(state.mouseX, state.mouseY, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z + 20;
        const targetPos = camera.position.clone().add(dir.multiplyScalar(distance));

        targetPos.x = Math.max(-5, Math.min(5, targetPos.x));
        targetPos.y = Math.max(5, Math.min(15, targetPos.y));

        points[0].pos.lerp(targetPos, 0.1);
        points[0].pos.z = 0;
    }

    // Verlet Step
    points.forEach(p => p.update());
    for (let i = 0; i < CONFIG.stiffness; i++) {
        sticks.forEach(s => s.update());
    }

    // Visuals Update
    const vectors = points.map(p => p.pos);
    const curve = new THREE.CatmullRomCurve3(vectors);

    if (ropeMesh.geometry) ropeMesh.geometry.dispose();
    ropeMesh.geometry = new THREE.TubeGeometry(curve, 64, 0.15, 8, false);

    const tail = points[points.length - 1];
    payloadGroup.position.copy(tail.pos);
    payloadGroup.rotation.x += 0.02;
    payloadGroup.rotation.y += 0.05;

    // Tension
    const totalLen = (points.length - 1) * CONFIG.segmentLength;
    const currLen = points[0].pos.distanceTo(tail.pos);
    const tension = Math.max(0, currLen - totalLen);
    state.tension = tension;

    // Tension UI
    const tensionPct = Math.min(tension / 3.0, 1.0);
    const color = new THREE.Color(0x00f3ff).lerp(new THREE.Color(0xff0000), tensionPct);
    ropeMesh.material.color = color;
    ropeMesh.material.emissive = color;

    const bar = document.getElementById('tension-bar-fill');
    if (bar) bar.style.width = `${tensionPct * 100}%`;

    // Shake
    if (tensionPct > 0.7) {
        addShake((tensionPct - 0.7) * 0.5);
    }

    // Snap Check with Grace Period
    if (state.tension > CONFIG.maxTension && state.isPlaying && (Date.now() - state.startTime > 2000)) {
        addShake(2.0);
        gameOver();
    }

    // Debug UI
    // document.getElementById('score-value').innerText = `D: ${Math.floor(state.depth)}m | T: ${state.tension.toFixed(2)}`;
}

// RE-ADDED MISSING FUNCTION
function updateEnvironment() {
    if (!state.isPlaying) return;

    state.depth += CONFIG.speed;
    document.getElementById('score-value').innerText = Math.floor(state.depth) + 'm';

    // Move Tunnel
    tunnelSegments.forEach(mesh => {
        mesh.position.z += CONFIG.speed;
        mesh.rotation.z += 0.005;
        if (mesh.position.z > 20) {
            mesh.position.z -= 150;
            spawnCollectible(mesh.position.z);
        }
    });

    // Move Collectibles
    collectibles.forEach((mesh, idx) => {
        mesh.position.z += CONFIG.speed;
        mesh.rotation.y += 0.05;

        // Collision
        if (mesh.position.distanceTo(payloadGroup.position) < 1.5) {
            scene.remove(mesh);
            collectibles.splice(idx, 1);
            state.energy++;
            document.getElementById('currency-value').innerText = state.energy;
        } else if (mesh.position.z > 20) {
            scene.remove(mesh);
            collectibles.splice(idx, 1);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (state.isPlaying) {
        updatePhysics();
        updateEnvironment();
        updateParticles();
        updateShake();
    }

    composer.render();
}

function startGame() {
    state.isPlaying = true;
    state.startTime = Date.now();
    state.score = 0;
    state.energy = 0;
    state.depth = 0;
    state.tension = 0;

    state.mouseX = 0;
    state.mouseY = 0;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('score-value').innerText = '0m';
    document.getElementById('currency-value').innerText = '0';

    initRope();
}

function gameOver() {
    state.isPlaying = false;
    document.getElementById('final-score').innerText = Math.floor(state.depth);
    document.getElementById('final-currency').innerText = state.energy;
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('warning-overlay').classList.add('hidden');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    bloomPass.resolution.set(window.innerWidth, window.innerHeight);
});

initRope();
animate();
