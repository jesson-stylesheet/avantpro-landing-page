// --- Global Variables ---
let bgScene, bgCamera, bgRenderer, bgParticles;
let logoScene, logoCamera, logoRenderer, logoGroup, logoControls;

// --- Main Initialization ---
init();
animate();

// --- Functions ---
function init() {
    initBackground();
    initLogo();
    initTextAnimation();
    window.addEventListener('resize', onWindowResize, false);
}

// Setup for the background particle system
function initBackground() {
    const container = document.getElementById('bg-container');
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    bgCamera.position.z = 500;

    bgRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    bgRenderer.setPixelRatio(window.devicePixelRatio);
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(bgRenderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2000;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.75, color: 0xC09E50 });
    bgParticles = new THREE.Points(particlesGeometry, particlesMaterial);
    bgScene.add(bgParticles);
}

// Setup for the 3D logo
function initLogo() {
    const container = document.getElementById('logo-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    logoScene = new THREE.Scene();
    logoCamera = new THREE.PerspectiveCamera(50, width / height, 1, 2000);
    logoCamera.position.z = 500;

    logoRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    logoRenderer.setPixelRatio(window.devicePixelRatio);
    logoRenderer.setSize(width, height);
    container.appendChild(logoRenderer.domElement);

    // Lighting for the logo
    logoScene.add(new THREE.AmbientLight(0xcccccc, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(200, 200, 500);
    logoCamera.add(pointLight); // Attach light to camera
    logoScene.add(logoCamera);

    // Controls for the logo
    logoControls = new THREE.OrbitControls(logoCamera, logoRenderer.domElement);
    logoControls.enableDamping = true;
    logoControls.dampingFactor = 0.05;
    logoControls.enableZoom = false;
    logoControls.autoRotate = true;
    logoControls.autoRotateSpeed = 0.75;

    // SVG loading and creation
    const svgMarkup = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.000000 511.000000" preserveAspectRatio="xMidYMid meet"><path d="M2200 5094 c-300 -27 -478 -55 -815 -129 -200 -43 -489 -134 -705 -222 -279 -113 -641 -312 -669 -368 -11 -23 -11 -61 -1 -229 61 -1055 354 -2010 849 -2771 271 -417 659 -814 1057 -1079 141 -95 253 -160 406 -237 l117 -59 68 32 c199 93 496 279 695 434 232 182 479 435 659 675 83 110 219 306 219 315 0 2 21 36 47 76 82 129 206 379 329 663 37 87 130 356 177 515 80 269 175 739 206 1025 18 159 41 482 41 570 l0 80 -88 56 c-370 237 -810 410 -1382 543 -257 60 -807 129 -995 125 -38 -1 -135 -8 -215 -15z m425 -289 c481 -32 1065 -165 1490 -340 125 -51 255 -115 255 -125 0 -10 -363 -253 -510 -340 -259 -154 -499 -280 -675 -354 -60 -26 -119 -51 -130 -56 -24 -11 -239 -85 -275 -94 -14 -4 -50 -14 -80 -22 -172 -47 -261 -59 -465 -59 -176 0 -210 3 -282 23 -138 38 -208 71 -345 165 -82 56 -89 59 -116 48 -26 -11 -52 -46 -52 -71 0 -5 38 -66 85 -136 203 -304 274 -531 262 -838 -7 -167 -22 -242 -82 -397 -54 -140 -96 -215 -238 -423 -32 -47 -33 -59 -6 -97 32 -46 71 -40 160 25 297 215 646 321 944 286 247 -29 488 -128 717 -295 86 -62 141 -59 162 10 6 23 -3 42 -61 118 -51 66 -92 150 -118 237 -27 88 -27 294 -1 395 43 170 132 357 260 550 44 66 82 122 85 125 3 3 26 32 51 65 25 33 47 62 50 65 3 3 29 34 59 70 136 166 455 495 720 744 l94 88 -7 -113 c-18 -290 -67 -638 -126 -894 -125 -543 -303 -1018 -520 -1390 -29 -49 -62 -106 -73 -125 -64 -113 -259 -380 -372 -510 -136 -157 -377 -381 -550 -511 -140 -105 -459 -299 -493 -299 -40 0 -344 184 -502 304 -710 538 -1213 1351 -1466 2371 -101 406 -155 756 -170 1090 l-6 140 104 56 c422 230 908 384 1483 473 211 32 491 56 590 50 33 -2 101 -6 150 -9z"/></svg>`;
    const loader = new THREE.SVGLoader();
    const svgData = loader.parse(svgMarkup);

    const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 1.0, roughness: 0.2, side: THREE.DoubleSide });
    const extrudeSettings = { depth: 40, bevelEnabled: true, bevelThickness: 2, bevelSize: 1, bevelSegments: 2 };
    
    logoGroup = new THREE.Group();
    svgData.paths.forEach(path => {
        const shapes = THREE.SVGLoader.createShapes(path);
        shapes.forEach(shape => {
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mesh = new THREE.Mesh(geometry, material);
            logoGroup.add(mesh);
        });
    });

    const box = new THREE.Box3().setFromObject(logoGroup);
    const center = box.getCenter(new THREE.Vector3());
    logoGroup.position.copy(center).negate();
    
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y);
    const scale = container.clientWidth / maxDim; // Scale to fit container width
    logoGroup.scale.set(scale, -scale, scale);

    logoScene.add(logoGroup);
}

// GSAP text animations
function initTextAnimation() {
    gsap.to('h2', { duration: 1.5, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
    gsap.to('p', { duration: 1.5, opacity: 1, y: 0, delay: 1, ease: 'power2.out' });
}

// Handle window resizing
function onWindowResize() {
    // Resize background canvas
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);

    // Resize logo canvas
    const logoContainer = document.getElementById('logo-container');
    logoCamera.aspect = logoContainer.clientWidth / logoContainer.clientHeight;
    logoCamera.updateProjectionMatrix();
    logoRenderer.setSize(logoContainer.clientWidth, logoContainer.clientHeight);
}

// Main animation loop
function animate() {
    requestAnimationFrame(animate);

    // Animate background
    bgParticles.rotation.x += 0.0001;
    bgParticles.rotation.y += 0.0002;
    bgRenderer.render(bgScene, bgCamera);

    // Animate logo
    logoControls.update();
    logoRenderer.render(logoScene, logoCamera);
}
