import * as THREE from 'three';

export class CollisionSystem {
    static checkCollisions(spaceship, asteroids, missiles, onAsteroidHit, onMissileHit) {
        const spaceshipBoundingSphere = new THREE.Sphere(
            spaceship.getPosition(),
            0.5  // Fixed radius for spaceship collision
        );
        
        for (let asteroid of asteroids) {
            // Create a bounding sphere for the asteroid using its model
            if (!asteroid.model) continue; // Skip if model hasn't loaded yet
            
            const asteroidBoundingBox = new THREE.Box3().setFromObject(asteroid.model);
            const asteroidCenter = new THREE.Vector3();
            asteroidBoundingBox.getCenter(asteroidCenter);
            
            // Calculate radius as half the maximum dimension of the bounding box
            const asteroidSize = new THREE.Vector3();
            asteroidBoundingBox.getSize(asteroidSize);
            const asteroidRadius = Math.max(asteroidSize.x, asteroidSize.y, asteroidSize.z) * 0.5;
            
            const asteroidBoundingSphere = new THREE.Sphere(
                asteroid.group.position,
                asteroidRadius
            );
            
            if (spaceshipBoundingSphere.intersectsSphere(asteroidBoundingSphere)) {
                onAsteroidHit(asteroid);
            }
            
            for (let missile of missiles) {
                const missileBoundingSphere = new THREE.Sphere(
                    missile.mesh.position,
                    0.1  // Fixed radius for missile collision
                );
                
                if (asteroidBoundingSphere.intersectsSphere(missileBoundingSphere)) {
                    onMissileHit(asteroid, missile);
                }
            }
        }
    }
} 