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
    // Clean stacked-card crossfade driven by scroll
    const lookbookBlock = document.querySelector('.block--main');

    if (lookbookBlock) {
        const isMobile = window.innerWidth <= 768;
        const content = document.querySelector('.js-content');
        const title = document.querySelector('.js-title');
        const desc = document.querySelector('.js-desc');
        const btn = document.querySelector('.js-btn');
        const scrollPrompt = document.querySelector('.js-scroll-prompt');
        const items = gsap.utils.toArray('.js-spiral-item');

        if (isMobile) {
            // ---- MOBILE: Vertical feed with simple scroll reveals ----
            // Show text immediately, no pinning
            gsap.set(content, { opacity: 1 });
            gsap.set(title, { yPercent: 0 });
            gsap.set([desc, btn], { opacity: 1, pointerEvents: 'all' });
            // Hide scroll prompt on mobile (it's a natural feed)
            gsap.set(scrollPrompt, { opacity: 0, display: 'none' });

            // Gallery items: simple fade-up reveal on scroll
            items.forEach((item) => {
                // Reset stacked positioning for mobile feed
                gsap.set(item, { position: 'relative', scale: 1, y: 30, opacity: 0 });

                gsap.to(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 90%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease: "power2.out"
                });
            });

        } else {
            // ---- DESKTOP: Pinned stacked-card crossfade ----

            // 1. Initial Setup
            // Override the opacity-zero CSS class so GSAP controls visibility
            gsap.set(content, { opacity: 1 });
            gsap.set(title, { opacity: 0, y: 30 });
            gsap.set([desc, btn], { opacity: 0, y: 20 });
            gsap.set(scrollPrompt, { opacity: 0 });

            // Stack images: subtle start state (slightly below + scaled down + invisible)
            gsap.set(items, {
                scale: 0.92,
                y: 60,
                opacity: 0,
                zIndex: (i, target, targets) => targets.length - i
            });

            // 2. Intro animation — plays immediately on page load (not scroll-dependent)
            const intro = gsap.timeline({ delay: 0.3 });
            intro.to(title, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" })
                .to(desc, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4")
                .to(btn, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
                .to(scrollPrompt, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.2");

            // 3. Create the scroll-driven Timeline for the image sequence
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: lookbookBlock,
                    start: "top top",
                    end: "+=400%",
                    scrub: 0.8,
                    pin: true,
                    anticipatePin: 1
                }
            });

            // 4. On scroll: fade out the text + scroll prompt, then cycle images
            tl.to(scrollPrompt, { opacity: 0, duration: 0.3, ease: "power2.inOut" }, 0)
                .to(content, { opacity: 0, y: -30, duration: 0.5, ease: "power2.inOut" }, 0.1);

            // 5. Stacked Card Crossfade
            const cardDuration = 0.6;
            const holdDuration = 0.5;
            const fadeOutDuration = 0.4;
            const spacing = cardDuration + holdDuration;
            const firstCardStart = 0.8;

            items.forEach((item, index) => {
                const isLast = index === items.length - 1;
                const inStart = firstCardStart + (index * spacing);
                const outStart = inStart + cardDuration + holdDuration;

                // Animate IN — subtle slide up + scale to 1 + fade in
                tl.to(item, {
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    duration: cardDuration,
                    ease: "power2.out"
                }, inStart);

                // Animate OUT — fade + slight scale up (except last item stays)
                if (!isLast) {
                    tl.to(item, {
                        scale: 1.04,
                        opacity: 0,
                        duration: fadeOutDuration,
                        ease: "power2.in"
                    }, outStart);
                }
            });
        }
    }
}



