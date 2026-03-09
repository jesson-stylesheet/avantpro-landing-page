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

        // Create a matchMedia instance
        let mm = gsap.matchMedia();

        // --------------------------------------------------
        // DESKTOP & TABLET ANIMATION (min-width: 769px)
        // --------------------------------------------------
        mm.add("(min-width: 769px)", () => {
            // Setup default state
            gsap.set([desc, btn], { opacity: 0, pointerEvents: 'none' });
            gsap.set(title, { yPercent: 100 });

            // Create the main scroll-driven timeline
            const scrollTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: lookbookBlock,
                    start: "top 25%",
                    end: "bottom bottom",
                    scrub: true,
                }
            });

            // Grid Reveal Timeline
            const revealTimeline = gsap.timeline();
            const dy = window.innerHeight;

            columns.forEach((column, colIndex) => {
                const fromTop = colIndex % 2 === 0;
                revealTimeline.from(column.querySelectorAll('.gallery__item'), {
                    y: dy * (fromTop ? -1 : 1),
                    stagger: {
                        each: 0.06,
                        from: fromTop ? "end" : "start"
                    },
                    ease: "power1.inOut"
                }, "reveal");
            });

            // Grid Zoom Timeline
            const zoomTimeline = gsap.timeline({
                defaults: { duration: 1, ease: "power3.inOut" }
            });

            zoomTimeline.to(grid, { scale: 2.05 })
                .to(columns[0], { xPercent: -40 }, "<")
                .to(columns[2], { xPercent: 40 }, "<")
                .to(columns[1].querySelectorAll('.gallery__item'), {
                    yPercent: (index) => (index < Math.floor(columns[1].querySelectorAll('.gallery__item').length / 2) ? -1 : 1) * 40,
                    duration: 0.5,
                    ease: "power1.inOut"
                }, "-=0.5");

            // Content Toggle Timeline
            const toggleContent = (isVisible) => {
                gsap.timeline({ defaults: { overwrite: true } })
                    .to(title, {
                        yPercent: isVisible ? 0 : 100,
                        duration: 0.7,
                        ease: "power2.inOut"
                    })
                    .to([desc, btn], {
                        opacity: isVisible ? 1 : 0,
                        duration: 0.4,
                        ease: isVisible ? "power1.inOut" : "power1.out",
                        pointerEvents: isVisible ? "all" : "none"
                    }, isVisible ? "-=90%" : "<");
            };

            // Assemble the Main Timeline
            scrollTimeline
                .add(revealTimeline)
                .add(zoomTimeline, "-=0.6")
                .add(() => toggleContent(scrollTimeline.scrollTrigger.direction === 1), "-=0.32");

            // Parallax effect for the sticky wrapper
            gsap.from(wrapper, {
                yPercent: -100,
                ease: "none",
                scrollTrigger: {
                    trigger: lookbookBlock,
                    start: "top bottom",
                    end: "top top",
                    scrub: true
                }
            });

            // Fade in the title contextually
            gsap.to(content, {
                opacity: 1,
                duration: 0.7,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: lookbookBlock,
                    start: "top 57%",
                    toggleActions: "play none none reset"
                }
            });

            // Cleanup function for when media query doesn't match
            return () => {
                // Return elements to normal state when reverting
                gsap.set([title, desc, btn, content, grid, wrapper], { clearProps: "all" });
                columns.forEach(col => {
                    gsap.set(col, { clearProps: "all" });
                    gsap.set(col.querySelectorAll('.gallery__item'), { clearProps: "all" });
                });
            };
        });

        // --------------------------------------------------
        // MOBILE ANIMATION (max-width: 768px)
        // --------------------------------------------------
        mm.add("(max-width: 768px)", () => {
            // Simple fade and slide up for each image as you scroll
            const items = gsap.utils.toArray('.gallery__item:not(.empty-frame)');

            items.forEach((item) => {
                // Ensure initial state is set for the reveal
                gsap.set(item, { opacity: 0, y: 30 });

                gsap.to(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%", // Trigger when top of image is 85% down viewport
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power2.out"
                });
            });

            // Cleanup
            return () => {
                gsap.set(items, { clearProps: "all" });
            };
        });
    }
}
