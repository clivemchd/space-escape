import * as THREE from 'three';

export class Missile {
    constructor(position) {
        const geometry = new THREE.SphereGeometry(0.1, 8, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Copy the spaceship's position and offset it forward
        this.mesh.position.copy(position);
        this.mesh.position.z -= 1; // Spawn in front of the spacecraft
        
        // Velocity points towards the black hole
        this.velocity = new THREE.Vector3(0, 0, -1);
    }

    update() {
        this.mesh.position.add(this.velocity);
    }

    isOutOfBounds(zLimit) {
        return this.mesh.position.z < zLimit;
    }
} 