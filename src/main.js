import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Map } from './map';
import { Decor } from './decor';
import Player from './player';  // Importer la classe Player
import * as CANNON from 'cannon-es';  

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let ratioLargeurHauteur = SCREEN_WIDTH / SCREEN_HEIGHT;

const stats = new Stats();
document.body.append(stats.dom);

// Render setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.setPixelRatio(window.devicePixelRatio); // Adapte la résolution
document.body.appendChild(renderer.domElement);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, ratioLargeurHauteur);
camera.position.set(-32, 16, -32);
camera.lookAt(0, 0, 0);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 0, 16); // Control au centre de la map 32/2
controls.update();

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const map = new Map();
map.generate();
scene.add(map);
window.map = map;

// Créer l'instance de Decor pour ajouter les arbres
const arbre = new Decor(scene);  
// Appeler la méthode pour ajouter des arbres
arbre.placeTrees(map, 10);

// Physics setup (Cannon.js)
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Appliquer la gravité

// Créer le joueur
const player = new Player(scene, world);

// Lights
function addLights() {
    const light1 = new THREE.DirectionalLight();
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight();
    light2.position.set(-1, 1, -0.5);
    scene.add(light2);

    const ambiant = new THREE.AmbientLight();
    ambiant.intensity = 0.1;
    scene.add(ambiant);
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Mettre à jour la physique
    world.step(1 / 60);  // Mettre à jour la simulation physique (60 FPS)

    // Déplacer le joueur en fonction des touches appuyées
    player.move(keys);

    // Mettre à jour la position du joueur et de la caméra
    player.update();

    if (map.uniformsEau) {
        map.uniformsEau.time.value = performance.now() / 1000;
    }

    renderer.render(scene, camera);
    stats.update();
}

// Gérer les changements de taille d'écran
function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    ratioLargeurHauteur = SCREEN_WIDTH / SCREEN_HEIGHT;

    camera.aspect = ratioLargeurHauteur;
    camera.updateProjectionMatrix();

    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
}

window.addEventListener("resize", onWindowResize);

// Gérer les entrées clavier pour le mouvement du joueur
let keys = {};
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Ajouter la lumière et démarrer l'animation
addLights();
animate();
