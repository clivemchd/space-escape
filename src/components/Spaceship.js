import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cache for loaded model
const modelCache = {
    model: null
};

export class Spaceship {
    static initializeModel(loadingManager) {
        if (!modelCache.model) {
            const loader = new GLTFLoader(loadingManager);
            loader.load('/space-escape/modals/interstellar_ranger_one/scene.gltf', (gltf) => {
                modelCache.model = gltf.scene;
            });
        }
    }

    constructor() {
        this.group = new THREE.Group();
        
        if (modelCache.model) {
            const model = modelCache.model.clone();
            model.scale.set(0.3, 0.3, 0.3);
            // Rotate to face towards black hole (pointed part facing right)
            model.rotation.y = Math.PI; 
            model.rotation.z = 0; 
            model.rotation.x = 0;
            this.group.add(model);
            this.model = model;
        } else {
            // Fallback or wait for model to load
            console.warn('Spaceship model not loaded yet');
        }
        
        // Set initial position
        this.group.position.z = 0;
        
        // Maximum tilt angles in radians
        this.maxSideTilt = Math.PI / 12;  // 15 degrees for left/right
        this.maxVerticalTilt = Math.PI / 12; // 7.5 degrees for up/down
        // Current tilts for smooth transition
        this.currentSideTilt = 0;
        this.currentVerticalTilt = 0;
    }

    reset() {
        this.group.position.set(0, 0, 0);
    }

    move(direction, amount) {
        const viewportConstraints = this.calculateViewportConstraints();
        const nextPosition = this.group.position.clone();
        
        // Target tilts based on direction
        let targetSideTilt = 0;
        let targetVerticalTilt = 0;
        
        switch(direction) {
            case 'left':
                nextPosition.x -= amount;
                targetSideTilt = -this.maxSideTilt;
                break;
            case 'right':
                nextPosition.x += amount;
                targetSideTilt = this.maxSideTilt;
                break;
            case 'up':
                nextPosition.y += amount;
                targetVerticalTilt = this.maxVerticalTilt; // Reversed: positive for up
                break;
            case 'down':
                nextPosition.y -= amount;
                targetVerticalTilt = -this.maxVerticalTilt;  // Reversed: negative for down
                break;
        }

        // Smoothly interpolate current tilts towards target
        if (direction === 'left' || direction === 'right') {
            this.currentSideTilt += (targetSideTilt - this.currentSideTilt) * 0.1;
            // Return vertical tilt to neutral when moving horizontally
            this.currentVerticalTilt += (0 - this.currentVerticalTilt) * 0.1;
        } else if (direction === 'up' || direction === 'down') {
            this.currentVerticalTilt += (targetVerticalTilt - this.currentVerticalTilt) * 0.1;
            // Return side tilt to neutral when moving vertically
            this.currentSideTilt += (0 - this.currentSideTilt) * 0.1;
        } else {
            // Return both tilts to neutral when not moving
            this.currentSideTilt += (0 - this.currentSideTilt) * 0.1;
            this.currentVerticalTilt += (0 - this.currentVerticalTilt) * 0.1;
        }

        // Apply the tilts
        if (this.model) {
            this.model.rotation.z = this.currentSideTilt;
            this.model.rotation.x = this.currentVerticalTilt;
        }

        // Check if the next position is within bounds before applying
        if (nextPosition.x >= viewportConstraints.left && 
            nextPosition.x <= viewportConstraints.right &&
            nextPosition.y >= viewportConstraints.bottom && 
            nextPosition.y <= viewportConstraints.top) {
            this.group.position.copy(nextPosition);
        }
        
        // Keep the spaceship at a fixed z position
        this.group.position.z = 0;
    }

    calculateViewportConstraints() {
        // Calculate viewport constraints based on camera FOV and position
        const fov = 75; // Match your camera's FOV
        const distance = 5; // Match your camera's z position
        const vFov = (fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * distance;
        const width = height * (window.innerWidth / window.innerHeight);
        
        // Use 80% of the visible area to keep ship fully visible
        const margin = 0.8;
        return {
            left: -width * margin / 2,
            right: width * margin / 2,
            top: height * margin / 2,
            bottom: -height * margin / 2
        };
    }

    clampPosition(min, max) {
        const constraints = this.calculateViewportConstraints();
        this.group.position.x = THREE.MathUtils.clamp(
            this.group.position.x, 
            constraints.left,
            constraints.right
        );
        this.group.position.y = THREE.MathUtils.clamp(
            this.group.position.y,
            constraints.bottom,
            constraints.top
        );
    }

    getPosition() {
        return this.group.position;
    }

    // Getter for the mesh property to maintain compatibility
    get mesh() {
        return this.group;
    }
} 