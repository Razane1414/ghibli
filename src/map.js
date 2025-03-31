import * as THREE from 'three';
import alea from 'alea';
import { createNoise2D } from 'simplex-noise';
import { vertexShader, fragmentShader } from './shader/shaderWater.js';

export class Map extends THREE.Group {
    data = [];

    constructor(size = { width: 64, height: 8 }) {
        super();
        this.size = size;
        this.bruitScale = 0.02;

        // Herbe – géométrie cube (1x1x1)
        this.geometryHerbe = new THREE.BoxGeometry(1, 1, 1);
        this.materialHerbe = new THREE.MeshLambertMaterial({ color: 0x6D8858 });

        // Eau – ShaderMaterial
        this.uniformsEau = {
            time: { value: 0 }
        };

        this.materialEau = new THREE.ShaderMaterial({
            uniforms: this.uniformsEau,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide
        });
    }

    generate() {
        this.generateTerrain();
        this.generateMeshes();
    }

    generateTerrain() {
        this.data = [];

        const noise2D = createNoise2D(alea('seed-stable'));
        const bruitScale = this.bruitScale;
        const maxHeight = this.size.height;

        for (let x = 0; x < this.size.width; x++) {
            const column = [];
            for (let y = 0; y < this.size.height; y++) {
                const layer = [];
                for (let z = 0; z < this.size.width; z++) {
                    const isInLac = (x >= 10 && x <= 40 && z >= 10 && z <= 40);  
                    const height = Math.floor((noise2D(x * bruitScale, z * bruitScale) + 1) / 2 * maxHeight);

                    if (isInLac) {
                        layer.push({ id: 2 });
                    } else if (!isInLac && y <= height) {
                        layer.push({ id: 1, trueHeight: height });
                    } else {
                        layer.push({ id: 0 });
                    }
                }
                column.push(layer);
            }
            this.data.push(column);
        }
    }

    generateMeshes() {
        this.clear();
        
        const maxCount = this.size.width * this.size.width * this.size.height;
        const meshHerbe = new THREE.InstancedMesh(this.geometryHerbe, this.materialHerbe, maxCount);
        meshHerbe.count = 0;
        
        const matrix = new THREE.Matrix4();
        
        // Variables pour définir la zone du lac
        const lacMinX = 10;
        const lacMaxX = 40;
        const lacMinZ = 10;
        const lacMaxZ = 40;
    
        // Calculer la taille du lac en fonction des limites
        const lacWidth = lacMaxX - lacMinX + 1;
        const lacHeight = lacMaxZ - lacMinZ + 1;
    
        // Créer un seul plan pour l'eau, couvrant toute la zone du lac
        const waterPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(lacWidth, lacHeight), // Taille du plan selon la zone du lac
            this.materialEau
        );
    
        // Positionner l'eau à la surface
        const waterHeight = this.size.height / 4;  // Position de l'eau à la surface
        waterPlane.rotation.x = -Math.PI / 2;
        waterPlane.position.set(lacMinX + lacWidth / 2, waterHeight, lacMinZ + lacHeight / 2);  // Centrer le plan dans le lac
    
        // Ajouter l'eau au terrain
        this.add(waterPlane);
    
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const block = this.getBlock(x, y, z);
                    const blockId = block.id;
    
                    // Si le bloc est de type herbe
                    if (blockId === 1) {
                        matrix.setPosition(x + 0.5, y + 0.5, z + 0.5); // Positionner le cube (herbe)
                        const instanceId = meshHerbe.count++;
                        meshHerbe.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                    }
                }
            }
        }
    
        this.add(meshHerbe); // Ajouter l'herbe
    }
    
    

    getBlock(x, y, z) {
        if (this.estDansLesLimites(x, y, z)) {
            return this.data[x][y][z];
        }
        return null;
    }

    getBlockType(x, y, z) {
        const block = this.getBlock(x, y, z);
        if (!block) return null;
        return block.id === 1 ? 'herbe' : block.id === 2 ? 'eau' : 'vide';
    }

    estDansLesLimites(x, y, z) {
        return (
            x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width
        );
    }

    setBlockInstanceId(x, y, z, instanceId) {
        const block = this.getBlock(x, y, z);
        if (block) {
            block.instanceId = instanceId;
        }
    }
}
