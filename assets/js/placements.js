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

        
        // --- 9. GSAP Cinematic Footer Reveal ---
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
    
    
    // --- 1. GSAP Reveal Animations ---
    gsap.set(".g-place-reveal", { autoAlpha: 1 });
    
    const revealElements = gsap.utils.toArray('.g-place-reveal');
    revealElements.forEach((el, i) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            y: 40, opacity: 0, filter: "blur(10px)", duration: 1, ease: "power3.out"
        });
    });

    // --- 2. Live Data Counter Animation ---
    const counters = document.querySelectorAll('.counter');
    
    // We only want the animation to run once when the dashboard comes into view
    let hasCounted = false;

    ScrollTrigger.create({
        trigger: ".hero-data-dashboard",
        start: "top 80%",
        onEnter: () => {
            if (!hasCounted) {
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target'); // The final number
                    const duration = 2000; // 2 seconds
                    const frameRate = 1000 / 60; // 60fps
                    const totalFrames = Math.round(duration / frameRate);
                    const increment = target / totalFrames;
                    
                    let currentVal = 0;
                    
                    const updateCounter = setInterval(() => {
                        currentVal += increment;
                        
                        // If we hit or pass the target, stop and set exactly to target
                        if (currentVal >= target) {
                            counter.innerText = target.toLocaleString(); // Adds commas for 10,000
                            clearInterval(updateCounter);
                        } else {
                            // Math.ceil gives it a fast, chunky feel. Math.floor works too.
                            counter.innerText = Math.ceil(currentVal).toLocaleString();
                        }
                    }, frameRate);
                });
                hasCounted = true;
            }
        }
    });


});