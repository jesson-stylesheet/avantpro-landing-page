// This script now ONLY handles the background particle animation.

// --- Global Variables ---
let scene, camera, renderer, particles;

// --- Main Initialization ---
init();
animate();

function init() {
    // --- Scene Setup ---
    const container = document.getElementById('scene-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 800; // Push camera back a bit for a wider view of particles

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // --- Create Objects ---
    createParticles();
    
    // --- Animate Text ---
    gsap.to('h2', { duration: 1.5, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
    gsap.to('p', { duration: 1.5, opacity: 1, y: 0, delay: 1, ease: 'power2.out' });

    // --- Event Listener ---
    window.addEventListener('resize', onWindowResize, false);

    // Logo shine animation
    const shinePath = document.querySelector('.shine-path');
    const gradient = document.querySelector('#shine');

    // Create the shine animation
    gsap.to(gradient, {
        attr: {
            x1: '100%',
            x2: '200%'
        },
        duration: 3,
        repeat: -1,
        ease: 'none'
    });
}


function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles over a larger area
        posArray[i] = (Math.random() - 0.5) * 2500; 
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 1.0, color: 0xC09E50 }); // Slightly larger particles
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (particles) {
        // Slower, more subtle rotation
        particles.rotation.x += 0.00005;
        particles.rotation.y += 0.0001;
    }

    renderer.render(scene, camera);
}
