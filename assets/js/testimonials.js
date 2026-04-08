document.addEventListener("DOMContentLoaded", () => {
    
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
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
                console.log('Lenis initialized and integrated with GSAP.');
            } else {
                function raf(time) {
                    lenis.raf(time);
                    requestAnimationFrame(raf);
                }
                requestAnimationFrame(raf);
            }
        }
        
        initLenis();
    // Magnetic Buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left) - rect.width / 2;
            const y = (e.clientY - rect.top) - rect.height / 2;
            gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power2.out" });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        });
    });

    // --- 2. Navbar Light/Dark Blend Logic ---
    function initNavbarScroll() {
        const navbar = document.getElementById("navbar");
        if (!navbar) return;
        ScrollTrigger.create({
            start: 100, // Trigger when scrolled 500px down
            onEnter: () => navbar.classList.add("light-mode"),
            onLeaveBack: () => navbar.classList.remove("light-mode")
        });
    }

    if (document.getElementById("navbar")) {
        initNavbarScroll();
    } else {
        window.addEventListener('headerLoaded', initNavbarScroll);
    }

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

    
    // --- 1. GSAP Grid Entrance Reveal ---
    gsap.set(".g-archive-reveal", { autoAlpha: 1 });
    
    const archiveElements = gsap.utils.toArray('.g-archive-reveal');
    archiveElements.forEach((element) => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%"
            },
            y: 40, opacity: 0, duration: 0.8, ease: "power3.out"
        });
    });

    // --- 11. Testimonial Marquee: JS-Driven Infinite Scroll + Drag ---
    document.querySelectorAll('.marquee-wrapper').forEach((container, idx) => {
        const track = container.querySelector('.marquee-track');
        if (!track) return;

        const direction = idx === 0 ? -1 : 1; // Row 1 scrolls left, Row 2 scrolls right
        const autoSpeed = 0.5; // Pixels per frame

        let targetX = 0;
        let currentX = 0;
        let isDragging = false;
        let startPointerX = 0;
        let dragAnchorX = 0;
        let halfWidth = 0;

        function measure() {
            halfWidth = track.scrollWidth / 2;
            // Start Row 2 at -halfWidth so it can scroll rightward
            if (direction === 1 && targetX === 0) {
                targetX = -halfWidth;
                currentX = -halfWidth;
            }
        }
        setTimeout(measure, 300);
        window.addEventListener('resize', measure);

        // Pointer Down
        function onDown(e) {
            isDragging = true;
            startPointerX = e.clientX ?? e.touches[0].clientX;
            dragAnchorX = targetX;
            container.style.cursor = 'grabbing';
        }
        // Pointer Move
        function onMove(e) {
            if (!isDragging) return;
            e.preventDefault();
            const px = e.clientX ?? (e.touches?.[0]?.clientX);
            if (px == null) return;
            targetX = dragAnchorX + (px - startPointerX);
        }
        // Pointer Up
        function onUp() { 
            isDragging = false; 
            container.style.cursor = 'grab';
        }

        container.style.cursor = 'grab';
        container.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        container.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);

        // Render Loop
        function animate() {
            if (!isDragging) {
                targetX += autoSpeed * direction;
            }
            // LERP for smoothness
            currentX += (targetX - currentX) * 0.06;

            // Seamless loop wrap
            if (currentX <= -halfWidth) {
                currentX += halfWidth;
                targetX += halfWidth;
            } else if (currentX >= 0) {
                currentX -= halfWidth;
                targetX -= halfWidth;
            }

            track.style.transform = `translateX(${currentX}px)`;
            requestAnimationFrame(animate);
        }
        animate();
    });

        // --- 1. Reveal Animations ---
        gsap.set(".g-theater-reveal", { autoAlpha: 1 });
        gsap.from(".g-theater-reveal", {
            scrollTrigger: { trigger: ".swipe-theater-section", start: "top 80%" },
            y: 40, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power3.out"
        });
    
        // --- 2. Desktop Navigation Arrows Logic ---
        const track = document.getElementById('video-track');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
    
        if (track && btnPrev && btnNext) {
            btnNext.addEventListener('click', () => {
                // Scroll right by the width of one card + gap
                const cardWidth = track.querySelector('.theater-card').offsetWidth;
                track.scrollBy({ left: cardWidth + 40, behavior: 'smooth' });
            });
    
            btnPrev.addEventListener('click', () => {
                const cardWidth = track.querySelector('.theater-card').offsetWidth;
                track.scrollBy({ left: -(cardWidth + 40), behavior: 'smooth' });
            });
        }
    
        // --- 3. Video Modal Logic ---
        const videoContainers = document.querySelectorAll('.video-container');
        const modal = document.getElementById('videoModal');
        const modalIframe = document.getElementById('modalIframe');
        const closeModal = document.getElementById('closeVideoModal');
    
        videoContainers.forEach(container => {
            container.addEventListener('click', function() {
                const card = this.closest('.theater-card');
                const ytId = card.getAttribute('data-yt-id');
                
                modalIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
                modal.classList.add('active');
            });
        });

        function closeVideo() {
            modal.classList.remove('active');
            setTimeout(() => { modalIframe.src = ""; }, 400); // Wait for fade out to stop audio
        }

        if (closeModal) closeModal.addEventListener('click', closeVideo);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeVideo();
            });
        }

});
