import * as THREE from 'three';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';

export class Decor {
    constructor(scene) {
        this.scene = scene;
    }

    loadArbre(position = new THREE.Vector3(0, 0, 0), scale = 50) {
        
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
        const cube = new THREE.Mesh( geometry, material );

        cube.position.copy(position);
        cube.scale.set(scale, scale, scale);
        this.scene.add(cube); // Ajouter à la scène
    }
    placeTrees(map, abreNombre = 10) {
        let treesPlaced = 0; // Suivi du nombre d'arbres placés
    
        while (treesPlaced < abreNombre) {
            const x = Math.floor(Math.random() * map.size.width);
            const z = Math.floor(Math.random() * map.size.width);
            const block = map.getBlock(x, 0, z);  
            const blockId = block.id;
    
            if (blockId === 1) { // Si c'est de l'herbe
                const trueHeight = block.trueHeight;  
                const yPosition = trueHeight + 1.5; // Placer l'arbre au-dessus, avec un décalage supplémentaire
    
                // Vérification du placement pour s'assurer que l'arbre ne s'enfonce pas dans l'herbe
                if (yPosition > trueHeight + 0.5) {
                    // Placer l'arbre si la position est correcte
                    this.loadArbre(new THREE.Vector3(x + 0.5, yPosition, z), 1);
                    treesPlaced++;
                }
            }
        }
    }
    
    

    
}
