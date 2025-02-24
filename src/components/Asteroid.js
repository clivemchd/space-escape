import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache for loaded models
const modelCache = {
    loaders: {},
    models: {}
};

export class Asteroid {
    static initializeModels(loadingManager) {
        // Pre-load asteroid models
        const asteroidPaths = [
            '/space-escape/modals/asteroid_01/scene.gltf',
            '/space-escape/modals/asteroid/scene.gltf',
            '/space-escape/modals/asteroid_02/scene.gltf'
        ];
        
        asteroidPaths.forEach(path => {
            if (!modelCache.models[path]) {
                const loader = new GLTFLoader(loadingManager);
                loader.load(path, (gltf) => {
                    // Clone the geometry and materials for reuse
                    const model = gltf.scene.clone();
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.geometry = child.geometry.clone();
                            child.material = child.material.clone();
                            child.material.side = THREE.DoubleSide;
                        }
                    });
                    modelCache.models[path] = model;
                });
            }
        });
    }

    constructor() {
        this.group = new THREE.Group();
        // Store base size for distance-based scaling
        this.baseSize = Math.random() * 0.1 + 0.05;
        
        // Use all three asteroid models
        const asteroidPaths = [
            '/space-escape/modals/asteroid_01/scene.gltf',
            '/space-escape/modals/asteroid/scene.gltf',
            '/space-escape/modals/asteroid_02/scene.gltf'
        ];
        const selectedPath = asteroidPaths[Math.floor(Math.random() * asteroidPaths.length)];
        this.modelPath = selectedPath; // Store the path for scaling logic
        
        if (modelCache.models[selectedPath]) {
            // Use cached model
            this.setupModel(modelCache.models[selectedPath].clone(), selectedPath);
        } else {
            // Load model if not cached (fallback)
            const loader = new GLTFLoader();
            loader.load(selectedPath, (gltf) => {
                this.setupModel(gltf.scene, selectedPath);
            });
        }
        
        // Random position with reduced spread
        this.group.position.x = (Math.random() - 0.5) * 15;
        this.group.position.y = (Math.random() - 0.5) * 15;
        this.group.position.z = -100;
        
        // Reduced rotation speeds for better performance
        this.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        };
    }

    setupModel(model, selectedPath) {
        // Start with a very small initial scale
        const initialScale = 0.01;
        model.scale.set(initialScale, initialScale, initialScale);
        
        model.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        
        this.group.add(model);
        this.model = model;
    }

    update(speed) {
        this.group.position.z += speed;
        
        if (this.model) {
            // Update rotations
            this.model.rotation.x += this.rotationSpeed.x;
            this.model.rotation.y += this.rotationSpeed.y;
            this.model.rotation.z += this.rotationSpeed.z;
            
            // Calculate scale based on distance
            // -100 is starting Z position, 10 is ending Z position
            const progress = (this.group.position.z + 100) / 110; // 0 to 1
            let targetScale;
            if (this.modelPath.includes('asteroid_01')) {
                targetScale = this.baseSize * 0.15;  // Keep asteroid_01 very small (15% of normal size)
            } else if (this.modelPath.includes('asteroid_02')) {
                targetScale = this.baseSize * 5;   // Make asteroid_02 larger (250% of normal size)
            } else {
                targetScale = this.baseSize;         // Normal size for regular asteroid
            }
            
            // Smoothly interpolate scale
            const currentScale = THREE.MathUtils.lerp(
                0.01,  // Start very small
                targetScale,
                Math.min(1, Math.max(0, progress))  // Clamp between 0 and 1
            );
            
            this.model.scale.set(currentScale, currentScale, currentScale);
        }
    }

    isOutOfBounds(zLimit) {
        return this.group.position.z > zLimit;
    }

    get mesh() {
        return this.group;
    }
} 