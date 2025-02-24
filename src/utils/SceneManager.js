import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        
        // Load starmap texture and set as background
        const textureLoader = new THREE.TextureLoader();
        const starMapTexture = textureLoader.load('/space-escape/textures/starmap.jpg');
        // Use NoColorSpace for the background to reduce brightness
        starMapTexture.colorSpace = THREE.SRGBColorSpace;
        this.scene.background = starMapTexture;

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // Enhanced renderer settings
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        // Keep sRGB color space for rendered objects
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Normal brightness lighting (will only affect meshes, not background)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);

        // Set camera position
        this.camera.position.z = 5;

        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    add(object) {
        this.scene.add(object.mesh);
    }

    remove(object) {
        this.scene.remove(object.mesh);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
} 