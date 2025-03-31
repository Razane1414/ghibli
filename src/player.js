import * as THREE from 'three';
import * as CANNON from 'cannon-es';  // Utilisation de cannon-es

class Player {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;

        this.position = new THREE.Vector3(0, 10, 0);  // Position initiale
        this.velocity = new CANNON.Vec3(0, 0, 0);  // Vitesse initiale
        this.jumpForce = 10;  // Force de saut

        // Créer le corps rigide du joueur
        this.body = new CANNON.Body({
            mass: 1,  // Masse du joueur
            position: new CANNON.Vec3(0, 15, 0),  
            shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),  // Forme du joueur (cube)
            linearDamping: 0.9,  
            angularDamping: 0.9
        });
        this.world.addBody(this.body);

        // Créer un modèle 3D pour le joueur
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Positionner la caméra pour qu'elle suive le joueur
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 10);  // Position de la caméra

        // Variables pour les contrôles
        this.isJumping = false;
    }

    // Mettre à jour la position du joueur et la caméra
    update() {
        // Vérifier si le corps rigide existe et a une position valide
        if (this.body && this.body.position) {
            // Synchroniser le modèle 3D avec le corps rigide
            this.mesh.position.copy(this.body.position);
    
            // Vérifier si le corps rigide a un quaternion pour la rotation
            if (this.body.rotation) {
                const quat = this.body.rotation; // Récupère le quaternion de Cannon.js
                this.mesh.rotation.setFromQuaternion(quat); // Appliquer le quaternion à Three.js
            } else {
                console.error("Rotation du corps rigide non initialisée.");
            }
    
            // Mettre à jour la position de la caméra pour suivre le joueur
            this.camera.position.set(this.body.position.x, this.body.position.y + 5, this.body.position.z + 10);
            this.camera.lookAt(this.body.position);
        } else {
            console.error("Le corps rigide du joueur n'est pas correctement initialisé.");
        }
    }
    

    // Déplacer le joueur
    move(keys) {
        const speed = 5;

        // Appliquer une force en fonction des touches appuyées
        if (keys['z']) {
            this.body.velocity.z = -speed;
        } else if (keys['s']) {
            this.body.velocity.z = speed; 
        }

        if (keys['q']) {
            this.body.velocity.x = -speed;
        } else if (keys['d']) {
            this.body.velocity.x = speed; 
        }

        // Sauter (force vers le haut)
        if (keys['Space'] && !this.isJumping) {
            this.body.velocity.y = this.jumpForce; // Appliquer la force de saut
            this.isJumping = true;  // Indiquer que le joueur est en train de sauter
        }

        // Réinitialiser la condition de saut lorsque le joueur touche le sol
        if (this.body.position.y <= 1) {  // Si le joueur touche le sol (hauteur très proche de 0)
            this.isJumping = false;
            this.body.velocity.y = 0;  // Réinitialiser la vitesse verticale
        }
    }
}

export default Player;
