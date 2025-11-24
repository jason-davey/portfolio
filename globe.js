import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

class SpinningGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.animationId = null;

        this.init();
        this.animate();
        this.setupResize();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);

        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 3;

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(2, 2, 2);
        this.scene.add(directionalLight);

        // Globe creation
        this.createGlobe();
    }

    createGlobe() {
        const geometry = new THREE.SphereGeometry(1, 64, 32);

        // Load texture
        const loader = new THREE.TextureLoader();
        const texture = loader.load('./world-map-texture.png',
            () => {
                console.log('Texture loaded successfully');
            },
            (progress) => {
                console.log('Loading progress:', progress);
            },
            (error) => {
                console.error('Error loading texture:', error);
                // Fallback to solid color if texture fails
                this.createFallbackGlobe(geometry);
                return;
            }
        );

        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: false
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
    }

    createFallbackGlobe(geometry) {
        // Fallback solid color globe
        const material = new THREE.MeshLambertMaterial({
            color: 0x6b8e6b
        });
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.globe) {
            // Rotate around Y-axis (360 degrees every 8 seconds)
            this.globe.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    setupResize() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        if (this.globe) {
            this.globe.geometry.dispose();
            this.globe.material.dispose();
        }

        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Export for ES6 modules
export { SpinningGlobe };