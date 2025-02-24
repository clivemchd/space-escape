import * as THREE from 'three';
import { Spaceship } from './components/Spaceship';
import { BlackHole } from './components/BlackHole';
import { Missile } from './components/Missile';
import { Asteroid } from './components/Asteroid';
import { CollisionSystem } from './systems/CollisionSystem';
import { InputSystem } from './systems/InputSystem';
import { GameState } from './utils/GameState';
import { SceneManager } from './utils/SceneManager';

class AssetLoader {
    constructor() {
        this.totalAssets = 4; // Spaceship, 2 asteroids, blackhole
        this.loadedAssets = 0;
        this.loadingManager = new THREE.LoadingManager();
        this.setupLoadingManager();
    }

    setupLoadingManager() {
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.loadedAssets = itemsLoaded;
            const progress = (itemsLoaded / itemsTotal) * 100;
            this.updateLoadingScreen(progress);
        };

        this.loadingManager.onLoad = () => {
            console.log('All assets loaded');
            this.hideLoadingScreen();
            // Start the game once everything is loaded
            window.game = new Game();
            window.game.animate();
        };

        this.loadingManager.onError = (url) => {
            console.error('Error loading asset:', url);
        };
    }

    updateLoadingScreen(progress) {
        const loadingBar = document.getElementById('loading-bar');
        const loadingText = document.getElementById('loading-text');
        loadingBar.style.width = `${progress}%`;
        loadingText.textContent = `Loading assets: ${Math.round(progress)}%`;
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
    }

    static initialize() {
        const loader = new AssetLoader();
        // Pre-load all models
        Asteroid.initializeModels(loader.loadingManager);
        Spaceship.initializeModel(loader.loadingManager);
        BlackHole.initializeModel(loader.loadingManager);
    }
}

class Game {
    constructor() {
        this.gameState = new GameState();
        this.sceneManager = new SceneManager();
        
        // Initialize game objects
        this.spaceship = new Spaceship();
        this.blackHole = new BlackHole();
        this.missiles = [];
        this.asteroids = [];
        
        // Add objects to scene
        this.sceneManager.add(this.spaceship);
        this.sceneManager.add(this.blackHole);
        
        // Setup input system with pause and end game handlers
        this.inputSystem = new InputSystem(
            () => this.createMissile(),
            () => this.togglePause(),
            () => this.endGame()
        );
        
        // Setup restart button
        document.getElementById('restart-button').addEventListener('click', () => this.reset());
        
        // Modified asteroid spawn settings
        this.asteroidSpawnRate = 0.01;
        this.lastAsteroidSpawn = 0;
        this.minSpawnInterval = 800;
        this.maxAsteroids = 20; // Reduced from 100 to prevent overwhelming the scene
        
        // Performance optimization: Create object pools
        this.missilePool = [];
        this.asteroidPool = [];
        this.poolSize = 30;
        
        // Initialize object pools
        for (let i = 0; i < this.poolSize; i++) {
            this.missilePool.push(new Missile(new THREE.Vector3()));
            this.asteroidPool.push(new Asteroid());
        }

        // Track if damage flash is currently active
        this.isFlashing = false;
    }
    
    togglePause() {
        this.gameState.togglePause();
    }
    
    endGame() {
        this.gameState.endGame();
    }
    
    createMissile() {
        if (!this.gameState.isGameOver) {
            let missile;
            if (this.missilePool.length > 0) {
                missile = this.missilePool.pop();
                missile.mesh.position.copy(this.spaceship.getPosition());
            } else {
                missile = new Missile(this.spaceship.getPosition());
            }
            this.missiles.push(missile);
            this.sceneManager.add(missile);
        }
    }
    
    createAsteroid() {
        let asteroid;
        if (this.asteroidPool.length > 0) {
            asteroid = this.asteroidPool.pop();
            // Reset asteroid position
            asteroid.group.position.x = (Math.random() - 0.5) * 15;
            asteroid.group.position.y = (Math.random() - 0.5) * 15;
            asteroid.group.position.z = -100;
        } else {
            asteroid = new Asteroid();
        }
        this.asteroids.push(asteroid);
        this.sceneManager.add(asteroid);
    }
    
    removeAsteroid(asteroid) {
        this.sceneManager.remove(asteroid);
        this.asteroids = this.asteroids.filter(a => a !== asteroid);
        // Reset asteroid properties before returning to pool
        asteroid.group.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            -100
        );
        this.asteroidPool.push(asteroid);
    }
    
    removeMissile(missile) {
        this.sceneManager.remove(missile);
        this.missiles = this.missiles.filter(m => m !== missile);
        if (this.missilePool.length < this.poolSize) {
            this.missilePool.push(missile);
        }
    }
    
    reset() {
        // Reset game state
        this.gameState.reset();
        
        // Reset spaceship
        this.spaceship.reset();
        
        // Clear asteroids and missiles
        [...this.asteroids, ...this.missiles].forEach(object => {
            this.sceneManager.remove(object);
        });
        this.asteroids = [];
        this.missiles = [];
        
        // Hide game over screen
        document.getElementById('game-over').classList.add('hidden');
    }
    
    showDamageFlash() {
        if (!this.isFlashing) {
            this.isFlashing = true;
            const flash = document.getElementById('damage-flash');
            flash.classList.remove('hidden');
            
            // Remove the flash element and reset flag after animation completes
            setTimeout(() => {
                flash.classList.add('hidden');
                this.isFlashing = false;
            }, 150); // Match this to the CSS animation duration
        }
    }
    
    update() {
        // Always update the black hole animation, even when paused
        this.blackHole.update(this.gameState.score);
        
        if (!this.gameState.isGameOver && !this.gameState.isPaused) {
            // Update spaceship position based on input
            if (this.inputSystem.isKeyPressed('ArrowLeft')) this.spaceship.move('left', 0.1);
            if (this.inputSystem.isKeyPressed('ArrowRight')) this.spaceship.move('right', 0.1);
            if (this.inputSystem.isKeyPressed('ArrowUp')) this.spaceship.move('up', 0.1);
            if (this.inputSystem.isKeyPressed('ArrowDown')) this.spaceship.move('down', 0.1);
            
            // Keep spaceship within bounds
            this.spaceship.clampPosition(-10, 10);
            
            // Update missiles with object pooling
            this.missiles.forEach(missile => {
                missile.update();
                if (missile.isOutOfBounds(-100)) {
                    this.removeMissile(missile);
                }
            });
            
            // Modified asteroid spawn logic
            const currentTime = Date.now();
            const timeSinceLastSpawn = currentTime - this.lastAsteroidSpawn;
            
            // Dynamically adjust spawn interval based on game progress
            const adjustedInterval = Math.max(
                this.minSpawnInterval * (1 - this.gameState.score / 10000), // Decrease interval as score increases
                200 // Minimum 200ms between spawns
            );
            
            if (this.asteroids.length < this.maxAsteroids && 
                timeSinceLastSpawn > adjustedInterval) {
                this.createAsteroid();
                this.lastAsteroidSpawn = currentTime;
            }
            
            // Update asteroids with object pooling
            this.asteroids.forEach(asteroid => {
                asteroid.update(this.gameState.speed);
                if (asteroid.isOutOfBounds(10)) {
                    this.removeAsteroid(asteroid);
                }
            });
            
            // Check collisions
            CollisionSystem.checkCollisions(
                this.spaceship,
                this.asteroids,
                this.missiles,
                (asteroid) => {
                    this.gameState.decreaseLives(0.5);
                    this.removeAsteroid(asteroid);
                    this.showDamageFlash();
                },
                (asteroid, missile) => {
                    this.removeAsteroid(asteroid);
                    this.removeMissile(missile);
                    this.gameState.updateScore(100);
                }
            );
            
            // Increase speed and score
            this.gameState.increaseSpeed(0.0001);
            this.gameState.updateScore(this.gameState.speed);
        }
        
        // Always render the scene
        this.sceneManager.render();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.update();
    }
}

// Initialize asset loading instead of creating game directly
AssetLoader.initialize(); 