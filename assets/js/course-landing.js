document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Initialize Lenis Smooth Scrolling ---
    function initLenis() {
        if (typeof Lenis === 'undefined') {
            console.warn('Lenis script not loaded.');
            return;
        }
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.lenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }
    initLenis();

    // --- 2. GSAP Text Reveal Sequence ---
    const tl = gsap.timeline();
    gsap.set(".g-reveal", { autoAlpha: 1 });

    tl.from(".g-reveal", {
        y: 50, 
        opacity: 0, 
        filter: "blur(15px)", 
        duration: 1.2, 
        stagger: 0.15, 
        ease: "power3.out", 
        delay: 0.5,
        clearProps: "filter"
    });

    

    // --- 3. Navbar Light/Dark Blend Logic (If applicable to About page) ---
    function initNavbarScroll() {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;
        ScrollTrigger.create({
            start: 200, 
            onEnter: () => navbar.classList.add("light-mode"),
            onLeaveBack: () => navbar.classList.remove("light-mode")
        });
    }

    if (document.getElementById("navbar")) {
        initNavbarScroll();
    } else {
        window.addEventListener('headerLoaded', initNavbarScroll);
    }

        function initFooterAnimation() {
        let mmFooter = gsap.matchMedia();
        
        mmFooter.add("(min-width: 1025px)", () => {
            gsap.set(".luxury-footer-inner", { willChange: "transform, opacity" });

            gsap.from(".luxury-footer-inner", {
                scrollTrigger: {
                    trigger: ".luxury-footer-wrapper",
                    start: "top bottom",
                    end: "bottom bottom",
                    scrub: 1
                },
                yPercent: -20,
                scale: 0.95,
                opacity: 0.5,
                ease: "none",
                force3D: true
            });
        });
    }

    if (document.querySelector('.luxury-footer-wrapper')) {
        initFooterAnimation();
    } else {
        window.addEventListener('footerLoaded', initFooterAnimation);
    }

    // --- 10. Scroll to Top Button ---
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            // Use Lenis smooth scroll if available, otherwise native
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    {
    
    // --- 1. GSAP Hero Entrance Reveal ---
    const tl = gsap.timeline();
    gsap.set(".g-nexus-reveal", { autoAlpha: 1 });

    tl.from(".g-nexus-reveal", {
        y: 40, 
        opacity: 0, 
        filter: "blur(10px)", 
        duration: 1.2, 
        stagger: 0.15, 
        ease: "power3.out", 
        delay: 0.2
    });

    // --- 2. Interactive Node Parallax Physics ---
    // We only attach the mouse listener to the wrapper on Desktop devices
    const nexusWrapper = document.querySelector('.nexus-hero-section');
    const parallaxElements = document.querySelectorAll('.parallax-element');

    if (nexusWrapper && parallaxElements.length > 0 && window.innerWidth > 1024) {
        
        nexusWrapper.addEventListener('mousemove', (e) => {
            // Get mouse position relative to the center of the screen
            const x = (e.clientX - window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2);

            parallaxElements.forEach((el) => {
                // Get the unique speed data attribute for each node
                const speed = el.getAttribute('data-speed');
                
                // Calculate movement (Invert the movement so it feels like floating)
                const xMove = x * speed;
                const yMove = y * speed;

                // Apply movement smoothly using GSAP
                gsap.to(el, {
                    x: xMove,
                    y: yMove,
                    duration: 1.5, // High duration gives it a "lazy, floating" feel
                    ease: "power2.out"
                });
            });
        });

        // Reset to center smoothly when mouse leaves the hero section
        nexusWrapper.addEventListener('mouseleave', () => {
            parallaxElements.forEach((el) => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 1.5,
                    ease: "power2.out"
                });
            });
        });
    }
}

{
    
    // --- 1. Reveal Animations ---
    gsap.set(".g-monolith-reveal", { autoAlpha: 1 });
    
    // Animate the cards upwards, but keep the staggered layout intact
    const monoElements = gsap.utils.toArray('.g-monolith-reveal');
    monoElements.forEach((el) => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 85%" },
            y: "+=40", opacity: 0, filter: "blur(10px)", duration: 1, ease: "power3.out"
        });
    });

    // --- 2. The Atmospheric Background Logic (Desktop Only) ---
    // We disable this on mobile via CSS (display: none on wrapper), but we also check via JS
    if (window.innerWidth > 1024) {
        const monolithCards = document.querySelectorAll('.monolith-card');
        const ambientLayers = document.querySelectorAll('.ambient-layer');
        const defaultBg = document.getElementById('bg-default');

        monolithCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                // 1. Get the target background ID
                const targetId = this.getAttribute('data-target-bg');
                const targetLayer = document.getElementById(targetId);

                // 2. Remove active class from all layers
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));

                // 3. Add active class to target layer
                if (targetLayer) {
                    targetLayer.classList.add('active-bg');
                }
            });

            card.addEventListener('mouseleave', function() {
                // Return to the default dark gradient when mouse leaves
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));
                if (defaultBg) {
                    defaultBg.classList.add('active-bg');
                }
            });
        });
        
        // Optional: Ensure default is active if mouse leaves the whole grid
        const monolithGrid = document.querySelector('.monolith-grid');
        if(monolithGrid) {
            monolithGrid.addEventListener('mouseleave', () => {
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));
                if (defaultBg) defaultBg.classList.add('active-bg');
            });
        }
    }
}



});