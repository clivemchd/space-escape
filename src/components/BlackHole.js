import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache for loaded model
const modelCache = {
    model: null
};

export class BlackHole {
    static initializeModel(loadingManager) {
        if (!modelCache.model) {
            const loader = new GLTFLoader(loadingManager);
            loader.load('/space-escape/modals/blackhole/scene.gltf', (gltf) => {
                modelCache.model = gltf.scene;
            });
        }
    }

    constructor() {
        this.group = new THREE.Group();
        
        if (modelCache.model) {
            const model = modelCache.model.clone();
            // Scale the black hole appropriately
            model.scale.set(5, 5, 5);
            // Set fixed rotation to show accretion disk in the middle with side tilt
            model.rotation.x = Math.PI / 10;  // Slight forward tilt
            model.rotation.y = Math.PI / 10;  // Slight Y rotation for perspective
            model.rotation.z = -Math.PI / 8;  // Side tilt (right up, left down)
            this.model = model;
            this.group.add(model);
        } else {
            console.warn('Black hole model not loaded yet');
        }
        
        // Position the black hole far in the distance
        this.group.position.z = -100;
        this.targetZ = -100; // Target position for smooth movement
        
        // Add dramatic lighting
        const lights = [
            new THREE.PointLight(0xffd700, 1, 50), // Golden yellow
            new THREE.PointLight(0xff8c00, 1, 50), // Dark orange
            new THREE.PointLight(0xffff00, 1, 50)  // Yellow
        ];
        
        lights.forEach((light, i) => {
            light.position.set(
                Math.cos(i * Math.PI * 2 / 3) * 10,
                Math.sin(i * Math.PI * 2 / 3) * 10,
                0
            );
            this.group.add(light);
        });
    }
    
    update(score) {
        // Calculate target position based on score
        // Move from -100 to -50 as score increases
        this.targetZ = -100 + Math.min(50, score / 100);
        
        // Smooth movement towards target position
        this.group.position.z += (this.targetZ - this.group.position.z) * 0.005;
        
        // Scale up slightly as it gets closer
        const distanceScale = 1 + ((-50 - this.group.position.z) / -50) * 0.5;
        if (this.model) {
            const baseScale = 5;
            this.model.scale.set(
                baseScale * distanceScale,
                baseScale * distanceScale,
                baseScale * distanceScale
            );
        }
    }
    
    get mesh() {
        return this.group;
    }
} 