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



    // --- 1. GSAP Premium Entrance Reveal ---
        const tl = gsap.timeline();
        gsap.set(".g-course-reveal", { autoAlpha: 1 });

        tl.from(".g-course-reveal", {
            y: 50, 
            opacity: 0, 
            filter: "blur(15px)", 
            duration: 1.5, 
            stagger: 0.2, 
            ease: "power4.out", 
            delay: 0.1
        });
    

    // --- 3. Navbar Light/Dark Blend Logic (If applicable to About page) ---
    function initNavbarScroll() {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;
        ScrollTrigger.create({
            start: 50, 
            onEnter: () => navbar.classList.add("light-mode"),
            onLeaveBack: () => navbar.classList.remove("light-mode")
        });
    }

    if (document.getElementById("navbar")) {
        initNavbarScroll();
    } else {
        window.addEventListener('headerLoaded', initNavbarScroll);
    }

    
    // --- 1. Hero Reveal ---
    gsap.set(".g-gal-reveal", { autoAlpha: 1 });
    gsap.from(".g-gal-reveal", {
        y: 40, opacity: 0, filter: "blur(10px)", 
        duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2
    });

    // --- 2. Asymmetrical Column Parallax (Desktop Only) ---
    let mmGallery = gsap.matchMedia();
    mmGallery.add("(min-width: 1025px)", () => {
        
        // Fast Column (Moves Up Faster)
        gsap.to(".col-fast", {
            yPercent: -40, 
            ease: "none",
            scrollTrigger: {
                trigger: ".gallery-wall-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Slow Column (Moves Up Slower)
        gsap.to(".col-slow", {
            yPercent: -15, 
            ease: "none",
            scrollTrigger: {
                trigger: ".gallery-wall-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Medium Column (Moves Up Normal)
        gsap.to(".col-medium", {
            yPercent: -25, 
            ease: "none",
            scrollTrigger: {
                trigger: ".gallery-wall-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // --- 3. Magnetic Glass Cursor Logic ---
        const cursor = document.getElementById('gallery-cursor');
        const gallerySection = document.getElementById('gallery-trigger');
        const cards = document.querySelectorAll('.gal-img-card');

        // GSAP quickTo is incredibly performant for mouse tracking
        let xTo = gsap.quickTo(cursor, "x", {duration: 0.2, ease: "power3"});
        let yTo = gsap.quickTo(cursor, "y", {duration: 0.2, ease: "power3"});

        // Track mouse position globally
        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX - 40); // -40 to center the 80px cursor
            yTo(e.clientY - 40);
        });

        // Show/Hide cursor when entering/leaving the gallery section
        gallerySection.addEventListener("mouseenter", () => {
            gallerySection.classList.add("is-hovering");
        });
        
        gallerySection.addEventListener("mouseleave", () => {
            gallerySection.classList.remove("is-hovering");
        });

        // Make the cursor expand slightly when physically over a card
        cards.forEach(card => {
            card.addEventListener("mouseenter", () => {
                gsap.to(cursor, { scale: 1.2, duration: 0.3, backgroundColor: "rgba(6, 182, 212, 0.2)", borderColor: "var(--brand-cyan)" });
            });
            card.addEventListener("mouseleave", () => {
                gsap.to(cursor, { scale: 1, duration: 0.3, backgroundColor: "rgba(255, 255, 255, 0.1)", borderColor: "rgba(255, 255, 255, 0.4)" });
            });
        });
    });

    // --- 4. Cinematic Lightbox Logic ---
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const allImages = document.querySelectorAll('.gal-img-card img');

    // Open Lightbox
    allImages.forEach(img => {
        img.addEventListener('click', () => {
            const highResSrc = img.getAttribute('src'); // You can swap this to a data-highres attribute if you have larger files
            lightboxImg.src = highResSrc;
            lightbox.classList.add('active');
            
            // Pause Lenis scrolling while lightbox is open
            if(window.lenis) window.lenis.stop();
        });
    });

    // Close Lightbox
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => { lightboxImg.src = ""; }, 400); // Clear image after fade out
        
        // Resume Lenis scrolling
        if(window.lenis) window.lenis.start();
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        // Close if clicking outside the image
        if(e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

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

});
