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

    
    
    // --- 1. Reveal Animations ---
    const tl = gsap.timeline();
    
    gsap.set(".g-blog-reveal", { autoAlpha: 1 });
    tl.from(".g-blog-reveal", {
        y: 40, opacity: 0, filter: "blur(10px)", 
        duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2
    });

    gsap.set(".g-feed-reveal", { autoAlpha: 1 });
    const feedItems = gsap.utils.toArray('.g-feed-reveal');
    feedItems.forEach((item) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%"
            },
            y: 50, opacity: 0, duration: 1, ease: "back.out(1.2)"
        });
    });

    // --- 2. Cinematic Image Parallax ---
    // Only run on desktop to ensure smooth performance
    let mmFeed = gsap.matchMedia();
    mmFeed.add("(min-width: 1025px)", () => {
        
        const parallaxImages = gsap.utils.toArray('.stack-parallax-img');
        
        parallaxImages.forEach((img) => {
            gsap.fromTo(img, 
                { yPercent: -15 }, // Start pushed up
                { 
                  yPercent: 15,   // End pushed down (creates deep movement inside the mask)
                  ease: "none",
                  scrollTrigger: {
                      trigger: img.closest('.stack-visual'),
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true
                  }
                }
            );
        });

        // Subtle floating effect on the overlapping content cards
        const contentCards = gsap.utils.toArray('.stack-content-card');
        contentCards.forEach((card) => {
            gsap.to(card, {
                y: -30, // Floats upward slightly as you scroll past
                ease: "none",
                scrollTrigger: {
                    trigger: card.closest('.cinematic-stack'),
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
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

    // --- 2. Load More Button Logic ---
    const loadMoreBtn = document.getElementById('load-more-blogs');
    
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            const btnText = this.querySelector('.btn-text');
            const btnLoader = this.querySelector('.btn-loader');
            
            // 1. Show loading state
            btnText.classList.add('d-none');
            btnLoader.classList.remove('d-none');
            this.style.pointerEvents = 'none'; // Prevent double clicking
            
            // 2. Simulate network request (Timeout)
            // In a real build, you would run your AJAX/Fetch request here to grab the next HTML items
            setTimeout(() => {
                
                // Once loaded, revert button state
                btnLoader.classList.add('d-none');
                btnText.classList.remove('d-none');
                btnText.innerHTML = "All Caught Up!";
                
                // Make button look disabled/completed
                this.style.borderColor = 'rgba(0,0,0,0.05)';
                this.style.color = 'var(--text-muted-light)';
                
            }, 1500); // 1.5 second fake delay
        });
    }

    // --- 3. Archive Filter Tab Logic ---
    const filterTabs = document.querySelectorAll('.filter-tab');
    const archiveCards = document.querySelectorAll('.archive-card');

    if (filterTabs.length > 0 && archiveCards.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                filterTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                this.classList.add('active');

                const filterValue = this.getAttribute('data-filter');

                // Advanced GSAP Filtering Animation
                // 1. Hide all cards first
                gsap.to(archiveCards, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                        archiveCards.forEach(card => card.style.display = 'none');
                        
                        // 2. Determine which cards to show
                        const cardsToShow = filterValue === 'all' 
                            ? Array.from(archiveCards) 
                            : Array.from(archiveCards).filter(card => card.getAttribute('data-filter-topic') === filterValue);

                        // 3. Show matching cards and animate them in
                        if(cardsToShow.length > 0) {
                            cardsToShow.forEach(card => card.style.display = 'block');
                            
                            // Re-trigger ScrollTrigger to recalculate positions as grid shifts
                            ScrollTrigger.refresh();

                            gsap.fromTo(cardsToShow, 
                                { scale: 0.8, opacity: 0, y: 30 },
                                { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.2)" }
                            );
                        }
                    }
                });
            });
        });
    }


});