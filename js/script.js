// --- PARTICLE BACKGROUND SCRIPT --- //
// This script uses the Three.js library to create a dynamic particle background.

// Global variables for the Three.js scene
let scene, camera, renderer, particles;

// Initialize and animate the scene
initParticles();
animateParticles();

/**
 * Initializes the entire Three.js scene, including the camera, renderer,
 * and adds the particle system. Also sets up the window resize listener.
 */
function initParticles() {
    const container = document.getElementById('scene-container');
    if (container) {
        // 1. Scene Setup: The container for all 3D objects.
        scene = new THREE.Scene();

        // 2. Camera Setup: Defines the perspective from which we view the scene.
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 800; // Move camera back to see the particles

        // 3. Renderer Setup: Draws the scene onto the canvas.
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha:true makes background transparent
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // 4. Create the particles and add them to the scene.
        createParticles();

        // 5. Event Listener: Resize the canvas when the window is resized.
        window.addEventListener('resize', onWindowResize, false);
    }
}
/**
 * Creates the geometry and material for the particle system and adds it to the scene.
 */
function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();

    // Default to a smaller particle count for mobile
    const isMobile = window.innerWidth < 768;
    const particlesCount = isMobile ? 4000 : 8000;

    const posArray = new Float32Array(particlesCount * 3); // Each particle has x, y, z coordinates

    // Randomly position each particle in a large cube
    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 2500;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Define the material (appearance) of the particles
    const particleSize = isMobile ? 3.0 : 1.0;
    const particlesMaterial = new THREE.PointsMaterial({ size: particleSize, color: 0xE0E0E0 });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

/**
 * Handles window resize events to keep the Three.js canvas responsive.
 */
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/**
 * The animation loop, which re-renders the scene on every frame
 * and applies a gentle rotation to the particle system.
 */
function animateParticles() {
    requestAnimationFrame(animateParticles);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (particles && !prefersReducedMotion) {
        // Gently rotate the particle system only if reduced motion is not preferred
        particles.rotation.x += 0.00005;
        particles.rotation.y += 0.0001;
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// --- GSAP TEXT ANIMATION SCRIPT --- //
// This script uses the GSAP library to animate the main headline and sub-headline.
gsap.to('h2', { duration: 1.5, opacity: 1, y: 0, delay: 0.5, ease: 'power2.out' });
gsap.to('.content > p', { duration: 1.5, opacity: 1, y: 0, delay: 1, ease: 'power2.out' });


// --- NAVIGATION ANIMATION SCRIPT --- //
// This script controls the liquid-style animation on the top navigation bar.
class NavigationEffect {
    constructor(navigation) {
        this.navigation = navigation;
        this.anchors = this.navigation.querySelectorAll("a");
        this.current = navigation.querySelector('.active'); // The initially active item
        this.previous = null;

        // Set initial state without animation
        if (this.current) this.handleCurrent(this.current, false);

        // Add click listeners to all navigation links
        this.anchors.forEach((anchor) => {
            anchor.addEventListener("click", (e) => {
                // Only prevent default for internal links (href="#"), allow external links to navigate
                if (anchor.getAttribute('href') === '#') {
                    e.preventDefault();
                    if (this.current === anchor) return; // Do nothing if already active
                    this.handlePrevious(); // Animate out the previous item
                    this.handleCurrent(anchor, true); // Animate in the new item
                }
                // For external links, let the default behavior happen (navigation)
            });
        });
    }

    /**
     * Handles the animation for the newly selected item.
     * @param {HTMLElement} current - The anchor element that was clicked.
     * @param {boolean} animate - Whether to run the animation or just set the state.
     */
    handleCurrent(current, animate = true) {
        this.current = current;
        this.current.classList.add("active");
        const nodes = this.getNodes(this.current);

        if (!animate) return; // Skip animation on initial load

        // Animate the gold and teal rectangles up with an elastic ease
        gsap.to(nodes.gold, {
            duration: 1.8,
            ease: "elastic.out(1.4, 0.4)",
            yPercent: -100, // Move them up 100% of their height
            stagger: 0.008,
            overwrite: true
        });

        gsap.to(nodes.teal, {
            duration: 1.8,
            ease: "elastic.out(1.4, 0.4)",
            yPercent: -100,
            stagger: 0.008,
            overwrite: true
        });
    }

    /**
     * Handles the animation for the previously selected item.
     */
    handlePrevious() {
        this.previous = this.navigation.querySelector(".active");
        if (this.previous) {
            this.previous.classList.remove("active");
            const nodes = this.getNodes(this.previous);

            // Animate the rectangles back down to their original position
            gsap.to(nodes.gold, {
                duration: 0.2,
                ease: "power1.out",
                yPercent: 0,
                overwrite: true,
                stagger: 0.012
            });

            gsap.to(nodes.teal, {
                duration: 0.2,
                ease: "power1.out",
                yPercent: 0,
                overwrite: true,
                delay: 0.02,
                stagger: 0.012
            });
        }
    }

    /**
     * Helper function to get the animated SVG rectangles from a nav item.
     * @param {HTMLElement} item - The anchor element.
     * @returns {{gold: HTMLElement[], teal: HTMLElement[]}} - The shuffled nodes for animation.
     */
    getNodes(item) {
        return {
            gold: gsap.utils.shuffle(gsap.utils.selector(item)(".gold rect")),
            teal: gsap.utils.shuffle(gsap.utils.selector(item)(".teal rect"))
        };
    }
}

// Initialize the navigation effect once the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    new NavigationEffect(document.querySelector(".top-nav"));
});

// --- SCROLLTRIGGER EVENTS --- //
if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const eventPosts = document.querySelectorAll('.event-post');
    if (eventPosts.length > 0) {
        eventPosts.forEach((post) => {
            gsap.to(post, {
                scrollTrigger: {
                    trigger: post,
                    start: "top 85%", // Animation starts when top of post hits 85% of viewport
                    toggleActions: "play none none reverse" // Play on enter, reverse on leave back
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out"
            });
            // Initial state for animation
            gsap.set(post, { y: 50, opacity: 0 });
        });
    }

    // --- Lookbook Scroll Animation --- //
    // Based on Codrops Sticky Grid Scroll Tutorial
    const lookbookBlock = document.querySelector('.block--main');

    if (lookbookBlock) {
        const grid = document.querySelector('.js-grid');
        const columns = document.querySelectorAll('.js-col');
        const content = document.querySelector('.js-content');
        const title = document.querySelector('.js-title');
        const desc = document.querySelector('.js-desc');
        const btn = document.querySelector('.js-btn');
        const wrapper = document.querySelector('.block__wrapper');
        const scrollPrompt = document.querySelector('.js-scroll-prompt');

        // 1. Initial Setup
        const items = gsap.utils.toArray('.js-spiral-item');

        // Hide Text initially
        gsap.set([desc, btn, scrollPrompt], { opacity: 0, pointerEvents: 'none' });
        gsap.set(title, { yPercent: 100 });

        // Place images out of view for the spiral entry
        // z: -1000 sends it back in 3D space, rotation down to spin up
        gsap.set(items, {
            scale: 0,
            rotation: -720, // Spin backwards 2 full rotations
            y: "-100vh", // Start high up
            opacity: 0,
            zIndex: (i, target, targets) => targets.length - i // First item on top
        });

        // 2. Create the main ScrollTrigger Timeline
        // This will pin the entire block and scrub the animation over a long scroll
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: lookbookBlock,
                start: "top top", // Start pinning when the top hits the top of viewport
                end: "+=1000%", // Increased from 600% to 1000% to give much more scroll space for slower pacing
                scrub: 1, // Smooth scrubbing taking 1 second to catch up to scroll bar
                pin: true, // Pin the container!
                anticipatePin: 1
            }
        });

        // 3. Animate the Text In (Happens right at the start of the scroll)
        tl.to(title, { yPercent: 0, duration: 0.5, ease: "power2.out" }, 0)
            .to([desc, btn, scrollPrompt], { opacity: 1, pointerEvents: 'all', duration: 0.5, ease: "power2.out" }, 0.2)
            .to(scrollPrompt, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 2); // Fade out prompt once user scrolls enough

        // 4. Create the Spiral Sequence
        // Calculate dynamic stagger so that each image finishes just as the next begins
        items.forEach((item, index) => {
            const isLast = index === items.length - 1;

            // We increase the timing gaps to allow "dwell time" where the image sits at scale 1.
            // Timeline unit math:
            // Animate IN happens over 2 units of time.
            const inStart = index * 4; // Space each image start by 4 timeline units (was 1.5)
            const outStart = inStart + 3; // Start animating out 3 units after it started moving IN (gives 1 unit of pure "sit still" dwell time at scale 1)

            // Animate IN
            tl.to(item, {
                scale: 1, // The last item naturally spans 100vw due to CSS .hero-item
                rotation: 0,
                y: 0,
                opacity: 1,
                duration: 2,
                ease: "power3.out"
            }, inStart);

            // Animate OUT (Except for the very last item, which stays)
            if (!isLast) {
                tl.to(item, {
                    scale: 1.5, // Zoom past the screen
                    opacity: 0,
                    duration: 1.5,
                    ease: "power2.in"
                }, outStart);
            } else {
                // For the last item, let's fade out the text so the hero image shines
                tl.to([title, desc, btn], {
                    opacity: 0,
                    duration: 1,
                    ease: "power2.inOut"
                }, inStart + 0.5);
            }
        });
    }
}
