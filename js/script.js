// --- Global Variables ---
let scene, camera, renderer, controls;
let particles;
let logoGroup;

// --- Main Initialization ---
init();
animate();

function init() {
    // --- Scene Setup ---
    const container = document.getElementById('scene-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 600;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    
    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xcccccc, 1.0));
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(200, 200, 600);
    scene.add(pointLight);

    // --- Controls ---
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- Create Objects ---
    createLogo();
    createParticles();
    
    // --- Animate Text ---
    gsap.to('h2', { duration: 1.5, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
    gsap.to('p', { duration: 1.5, opacity: 1, y: 0, delay: 1, ease: 'power2.out' });

    // --- Event Listener ---
    window.addEventListener('resize', onWindowResize, false);
}

function createLogo() {
    const svgMarkup = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.000000 511.000000" preserveAspectRatio="xMidYMid meet"><path d="M2200 5094 c-300 -27 -478 -55 -815 -129 -200 -43 -489 -134 -705 -222 -279 -113 -641 -312 -669 -368 -11 -23 -11 -61 -1 -229 61 -1055 354 -2010 849 -2771 271 -417 659 -814 1057 -1079 141 -95 253 -160 406 -237 l117 -59 68 32 c199 93 496 279 695 434 232 182 479 435 659 675 83 110 219 306 219 315 0 2 21 36 47 76 82 129 206 379 329 663 37 87 130 356 177 515 80 269 175 739 206 1025 18 159 41 482 41 570 l0 80 -88 56 c-370 237 -810 410 -1382 543 -257 60 -807 129 -995 125 -38 -1 -135 -8 -215 -15z m425 -289 c481 -32 1065 -165 1490 -340 125 -51 255 -115 255 -125 0 -10 -363 -253 -510 -340 -259 -154 -499 -280 -675 -354 -60 -26 -119 -51 -130 -56 -24 -11 -239 -85 -275 -94 -14 -4 -50 -14 -80 -22 -172 -47 -261 -59 -465 -59 -176 0 -210 3 -282 23 -138 38 -208 71 -345 165 -82 56 -89 59 -116 48 -26 -11 -52 -46 -52 -71 0 -5 38 -66 85 -136 203 -304 274 -531 262 -838 -7 -167 -22 -242 -82 -397 -54 -140 -96 -215 -238 -423 -32 -47 -33 -59 -6 -97 32 -46 71 -40 160 25 297 215 646 321 944 286 247 -29 488 -128 717 -295 86 -62 141 -59 162 10 6 23 -3 42 -61 118 -51 66 -92 150 -118 237 -27 88 -27 294 -1 395 43 170 132 357 260 550 44 66 82 122 85 125 3 3 26 32 51 65 25 33 47 62 50 65 3 3 29 34 59 70 136 166 455 495 720 744 l94 88 -7 -113 c-18 -290 -67 -638 -126 -894 -125 -543 -303 -1018 -520 -1390 -29 -49 -62 -106 -73 -125 -64 -113 -259 -380 -372 -510 -136 -157 -377 -381 -550 -511 -140 -105 -459 -299 -493 -299 -40 0 -344 184 -502 304 -710 538 -1213 1351 -1466 2371 -101 406 -155 756 -170 1090 l-6 140 104 56 c422 230 908 384 1483 473 211 32 491 56 590 50 33 -2 101 -6 150 -9z"/></svg>`;
    const loader = new THREE.SVGLoader();
    const svgData = loader.parse(svgMarkup);
    
    const material = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, metalness: 1.0, roughness: 0.2, side: THREE.DoubleSide });
    const extrudeSettings = { depth: 40, bevelEnabled: true, bevelThickness: 2, bevelSize: 1, bevelSegments: 2 };

    logoGroup = new THREE.Group();
    const tempGroup = new THREE.Group(); // Use a temporary group to measure the logo

    svgData.paths.forEach(path => {
        const shapes = THREE.SVGLoader.createShapes(path);
        shapes.forEach(shape => {
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mesh = new THREE.Mesh(geometry, material);
            tempGroup.add(mesh);
        });
    });

    // After creating all meshes, calculate the true center of the entire logo
    const box = new THREE.Box3().setFromObject(tempGroup);
    const center = box.getCenter(new THREE.Vector3());

    // Re-process the meshes, but this time translate the geometry of each part
    // This moves the vertices of the geometry, effectively centering the object around its local origin
    tempGroup.children.forEach(mesh => {
        mesh.geometry.translate(-center.x, -center.y, -center.z);
        logoGroup.add(mesh.clone()); // Add a clone to the final group
    });

    // Now logoGroup is geometrically centered around its own origin (0,0,0)
    logoGroup.scale.set(0.5, -0.5, 0.5); 
    
    scene.add(logoGroup);
}

function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 8000;
    const posArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2000;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.75, color: 0xC09E50 });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    particles.position.z = -200; // Push particles behind the logo
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    if (particles) {
        particles.rotation.x += 0.0001;
        particles.rotation.y += 0.0002;
    }

    renderer.render(scene, camera);
}
