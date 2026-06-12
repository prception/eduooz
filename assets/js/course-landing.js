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
    if (window.innerWidth > 1024) {
        const monolithCards = document.querySelectorAll('.monolith-card');
        const ambientLayers = document.querySelectorAll('.ambient-layer');
        const defaultBg = document.getElementById('bg-default');

        monolithCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const targetId = this.getAttribute('data-target-bg');
                const targetLayer = document.getElementById(targetId);
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));
                if (targetLayer) {
                    targetLayer.classList.add('active-bg');
                }
            });

            card.addEventListener('mouseleave', function() {
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));
                if (defaultBg) {
                    defaultBg.classList.add('active-bg');
                }
            });
        });
        
        const monolithGrid = document.querySelector('.monolith-grid');
        if(monolithGrid) {
            monolithGrid.addEventListener('mouseleave', () => {
                ambientLayers.forEach(layer => layer.classList.remove('active-bg'));
                if (defaultBg) defaultBg.classList.add('active-bg');
            });
        }
    }

    // --- 3. Trajectory Tab Switching Logic ---
    const tabContainer = document.getElementById('trajectoryTabs');
    const contentWrapper = document.getElementById('trajectoryContent');
    const masterHeading = document.getElementById('trajectoryHeading');

    if (tabContainer && contentWrapper) {
        const tabs = tabContainer.querySelectorAll('.trajectory-tab');
        const sections = contentWrapper.querySelectorAll('.trajectory-section');
        const sectionHeadings = contentWrapper.querySelectorAll('.trajectory-section-heading');

        const headingMap = {
            all: 'All State & Central Nursing Exams',
            state: 'Kerala State PSC Nursing Exams',
            central: 'Central Government Nursing Exams',
            gcc: 'GCC Nursing Licensing Exams'
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Update master heading with smooth transition
                if (masterHeading) {
                    masterHeading.classList.add('is-transitioning');
                    setTimeout(() => {
                        masterHeading.textContent = headingMap[filter] || headingMap.all;
                        masterHeading.classList.remove('is-transitioning');
                    }, 300);
                }

                // Show/hide individual section headings
                sectionHeadings.forEach(h => {
                    if (filter === 'all') {
                        h.style.display = 'none';
                    } else {
                        h.style.display = '';
                    }
                });

                // Filter sections with animation
                sections.forEach(section => {
                    const sectionType = section.getAttribute('data-section');

                    if (filter === 'all' || sectionType === filter) {
                        section.classList.remove('is-hidden');
                        section.classList.remove('is-entering');
                        // Force reflow to restart animation
                        void section.offsetWidth;
                        section.classList.add('is-entering');
                    } else {
                        section.classList.add('is-hidden');
                        section.classList.remove('is-entering');
                    }
                });

                // Re-trigger GSAP scroll animations for newly visible cards
                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 100);
            });
        });

        // Initialize: hide section headings on load (default is "all")
        sectionHeadings.forEach(h => { h.style.display = 'none'; });
    }
}



});

/* ==================================================================================
   courses.js — Course landing page animations (course-hero, video, faculty, etc.)
   ================================================================================== */
document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Initialize Lenis Smooth Scrolling (skip if already initialized) ---
    function initLenis() {
        if (window.lenis) return;
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
            start: 700, 
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

        // --- 1B. Dynamic FOMO Urgency Timer ---
        const timerEl = document.getElementById('fomo-timer');
        if (timerEl) {
            let timeRemaining = 48 * 3600 + Math.floor(Math.random() * 3600); // Randomized 48+ hours in seconds
            setInterval(() => {
                timeRemaining--;
                const h = Math.floor(timeRemaining / 3600);
                const m = Math.floor((timeRemaining % 3600) / 60);
                const s = timeRemaining % 60;
                timerEl.innerHTML = `<i class="fa-regular fa-clock"></i> Closes in ${h}h ${m}m ${s}s`;
            }, 1000);
        }

        // --- 2. Jitter-Free 3D Dashboard Tilt ---
        // We attach the mouse listener to the wrapper, but animate the inner card.
        const wrapper = document.querySelector('.course-vital-wrapper');
        const card = document.getElementById('vital-card');

        if (wrapper && card) {
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                
                // Mouse position relative to the wrapper
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                
                // Calculate center
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Rotation Limits (Max tilt: 10 degrees)
                const rotateX = ((y - centerY) / centerY) * -10; 
                const rotateY = ((x - centerX) / centerX) * 10;

                // Apply 3D Rotation to the inner card
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                
                // Update the Glare position
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });

            // Reset smoothly when mouse leaves
            wrapper.addEventListener('mouseleave', () => {
                card.style.transform = `rotateX(0deg) rotateY(0deg)`;
                
                // Add a temporary transition for the snap-back
                card.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
                setTimeout(() => {
                    // Remove transition so mouse tracking is instant again
                    card.style.transition = `none`;
                }, 500);
            });
        }

    // --- 3. GSAP Video Section Reveal ---
    gsap.set(".g-vid-reveal", { autoAlpha: 1 });
    gsap.from(".g-vid-reveal", {
        scrollTrigger: { trigger: ".course-video-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // --- 4. Cinematic YouTube Lazy-Load Logic ---
    const videoPlayer = document.getElementById('custom-video-player');

    if (videoPlayer) {
        videoPlayer.addEventListener('click', function() {
            // Check if iframe already exists to prevent multiple clicks
            if (this.querySelector('.youtube-iframe')) return;

            // Get the YouTube ID from the data attribute
            const ytId = this.getAttribute('data-yt-id');
            const innerWrapper = this.querySelector('.video-player-inner');

            // Construct the YouTube iframe URL (Autoplay ON, no rel videos)
            const iframeHTML = `
                <iframe class="youtube-iframe" 
                        src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            `;

            // Fade out the custom UI to black, then inject the iframe
            gsap.to(innerWrapper.children, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    // Inject iframe
                    innerWrapper.insertAdjacentHTML('beforeend', iframeHTML);
                }
            });
        });
    }
    
    
    // --- 5. GSAP Curriculum Reveal ---
    gsap.set(".g-curr-reveal", { autoAlpha: 1 });
    gsap.from(".g-curr-reveal", {
        scrollTrigger: { trigger: ".curriculum-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // --- 6. Interactive Phase Filter Logic ---
    const phaseBtns = document.querySelectorAll('.phase-btn');
    const phaseGrids = document.querySelectorAll('.matrix-grid');

    if (phaseBtns.length > 0 && phaseGrids.length > 0) {
        
        phaseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // If already active, do nothing
                if (this.classList.contains('active')) return;

                // 1. Update Button UI
                phaseBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // 2. Identify target grid
                const targetId = this.getAttribute('data-target');
                const targetGrid = document.getElementById(targetId);
                const currentGrid = document.querySelector('.matrix-grid.active-grid');

                // 3. GSAP Transition Sequence
                const tl = gsap.timeline();

                // Fade out current grid
                if (currentGrid) {
                    tl.to(currentGrid.querySelectorAll('.module-glass-card'), {
                        y: 20,
                        opacity: 0,
                        duration: 0.3,
                        stagger: 0.05,
                        ease: "power2.in",
                        onComplete: () => {
                            currentGrid.style.display = 'none';
                            currentGrid.classList.remove('active-grid');
                        }
                    });
                }

                // Fade in new grid
                tl.call(() => {
                    targetGrid.style.display = 'grid';
                    targetGrid.classList.add('active-grid');
                    // Reset opacity for GSAP to animate from
                    gsap.set(targetGrid, { opacity: 1 }); 
                })
                .fromTo(targetGrid.querySelectorAll('.module-glass-card'), 
                    { y: 40, opacity: 0 },
                    { 
                        y: 0, 
                        opacity: 1, 
                        duration: 0.6, 
                        stagger: 0.1, 
                        ease: "back.out(1.2)" 
                    }
                );
            });
        });

        // Mobile touch support for cards
        if (window.innerWidth <= 1024) {
            const moduleCards = document.querySelectorAll('.module-glass-card');
            moduleCards.forEach(card => {
                card.addEventListener('click', () => {
                    card.classList.toggle('is-open');
                });
            });
        }
    }

    // --- 7. Vercel-Style Spotlight Physics ---
    const syllabusSection = document.getElementById('syllabus');
    if (syllabusSection) {
        syllabusSection.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.module-glass-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    }

    // --- 7. GSAP Duration & Schedule Reveal ---
    
    // 1. Fade up the elements
    gsap.set(".g-dur-reveal", { autoAlpha: 1 });
    gsap.from(".g-dur-reveal", {
        scrollTrigger: { trigger: ".duration-light-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // 2. The Number Counter Animation
    const durationCounter = document.getElementById('duration-counter');
    
    if (durationCounter) {
        // We create an object to hold the starting value
        const targetValue = 6; // Target duration (6 Months)
        const counterObj = { val: 0 }; 

        gsap.to(counterObj, {
            val: targetValue,
            duration: 2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".massive-time-block",
                start: "top 85%", // Triggers animation as soon as the number comes into view
            },
            // On every frame of the animation, update the HTML text
            onUpdate: function() {
                // Math.floor ensures we only show whole numbers while it counts up
                durationCounter.innerHTML = Math.floor(counterObj.val);
            }
        });
    }

    // --- 9. GSAP Pricing Vault Interactions ---
    
    // 1. Reveal Animation
    gsap.set(".g-price-reveal", { autoAlpha: 1 });
    gsap.from(".g-price-reveal", {
        scrollTrigger: { trigger: ".pricing-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // 2. The Toggle Engine (One-Time vs EMI)
    const btnOnetime = document.getElementById('btn-onetime');
    const btnEmi = document.getElementById('btn-emi');
    const togglePill = document.querySelector('.toggle-pill');
    const priceValues = document.querySelectorAll('.price-value');
    const priceSuffixes = document.querySelectorAll('.price-suffix');

    if (btnOnetime && btnEmi && togglePill) {
        
        // Initialize pill width based on first button
        togglePill.style.width = `${btnOnetime.offsetWidth}px`;

        function switchPricing(mode) {
            // Animate Numbers
            priceValues.forEach(el => {
                const targetVal = el.getAttribute(`data-${mode}`);
                
                // Fade out, change value, fade in
                gsap.to(el, {
                    opacity: 0, y: -10, duration: 0.2, 
                    onComplete: () => {
                        el.innerHTML = targetVal;
                        gsap.to(el, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" });
                    }
                });
            });

            // Update Suffixes (e.g., "/ mo")
            priceSuffixes.forEach(el => {
                const targetSuffix = el.getAttribute(`data-${mode}-suffix`);
                el.innerHTML = targetSuffix;
            });
        }

        btnOnetime.addEventListener('click', () => {
            if(btnOnetime.classList.contains('active')) return;
            
            btnEmi.classList.remove('active');
            btnOnetime.classList.add('active');
            
            // Move pill to the left
            togglePill.style.transform = `translateX(0)`;
            togglePill.style.width = `${btnOnetime.offsetWidth}px`;
            
            switchPricing('onetime');
        });

        btnEmi.addEventListener('click', () => {
            if(btnEmi.classList.contains('active')) return;
            
            btnOnetime.classList.remove('active');
            btnEmi.classList.add('active');
            
            // Move pill to the right
            togglePill.style.transform = `translateX(${btnOnetime.offsetWidth}px)`;
            togglePill.style.width = `${btnEmi.offsetWidth}px`;
            
            switchPricing('emi');
        });
    }

    // 3. Jitter-Free 3D Hover Physics for Pricing Cards
    const vaultWrappers = document.querySelectorAll('.vault-card-wrapper');
    
    vaultWrappers.forEach(wrapper => {
        const card = wrapper.querySelector('.vault-card');
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top; 
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -8; 
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });

        wrapper.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
            card.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
            setTimeout(() => { card.style.transition = `none`; }, 500);
        });
    });


        // --- 7. GSAP Cinematic Video Section ---
    
    // Scroll Reveal
    gsap.set(".g-vid-reveal", { autoAlpha: 1 });
    gsap.from(".g-vid-reveal", {
        scrollTrigger: {
            trigger: ".video-luxury-section",
            start: "top 80%",
        },
        y: 40, opacity: 0, filter: "blur(10px)", 
        duration: 1.2, stagger: 0.15, ease: "power3.out", clearProps: "filter"
    });

    // --- Cinematic Lights Out & Magnetic Cursor Logic ---
    const mainPortal = document.getElementById('main-portal');
    const playCursor = document.querySelector('.magnetic-play-cursor');

    if(mainPortal && playCursor) {
        // 1. Hover Entrance: Snap cursor to mouse entry
        mainPortal.addEventListener('mouseenter', (e) => {
            const rect = mainPortal.getBoundingClientRect();
            const x = (e.clientX - rect.left) - (rect.width / 2);
            const y = (e.clientY - rect.top) - (rect.height / 2);
            
            gsap.set(playCursor, { x: x, y: y, xPercent: -50, yPercent: -50, scale: 0.5 });
        });

        // 2. Hover Exit
        mainPortal.addEventListener('mouseleave', () => {
            gsap.to(playCursor, { opacity: 0, scale: 0.5, duration: 0.3 });
        });

        // 3. Mouse Move: Magnetic Tracking using separated coordinates and percentages
        mainPortal.addEventListener('mousemove', (e) => {
            const rect = mainPortal.getBoundingClientRect();
            const x = (e.clientX - rect.left) - (rect.width / 2);
            const y = (e.clientY - rect.top) - (rect.height / 2);

            gsap.to(playCursor, {
                x: x, 
                y: y,
                xPercent: -50,
                yPercent: -50,
                scale: 1,
                opacity: 1,
                duration: 0.2, 
                ease: "sine.out"
            });
        });
    }

    // --- 7. Curved Playlist Liquid Slider Logic ---
    const playlistCards = document.querySelectorAll('.playlist-card');
    const activeVidImg = document.getElementById('active-vid-img');
    const activeVidTitle = document.getElementById('active-vid-title');
    const activeVidDesc = document.getElementById('active-vid-desc');
    const playlistTrack = document.querySelector('.playlist-track');
    
    let autoSlideInterval;
    let isAnimating = false;
    window.lastDragDist = 0;

    // (Initialization is handled dynamically by renderPlaylistCards after data is loaded)

    // --- 7. YouTube Data API v3 Dynamic Fetcher ---
    const YOUTUBE_API_KEY = ""; // PASTE YOUR YOUTUBE DATA API V3 KEY HERE
    
    const extractYTId = (url) => {
        const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    const formatViews = (views) => {
        if (views >= 1000000) return (views / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (views >= 1000) return (views / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return views;
    };

    const formatDuration = (pt) => {
        const match = pt.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return "00:00";
        const h = (parseInt(match[1]) || 0);
        const m = (parseInt(match[2]) || 0);
        const s = (parseInt(match[3]) || 0);
        let str = "";
        if (h > 0) str += h + ":";
        str += (m < 10 && h > 0 ? "0" : "") + m + ":";
        str += (s < 10 ? "0" : "") + s;
        return str;
    };

    const fetchYTMetadataRealtime = async (card) => {
        if (!YOUTUBE_API_KEY) return; // Silent fallback to static HTML attributes if no key is provided
        
        const ytUrl = card.getAttribute('data-url');
        const videoId = extractYTId(ytUrl);
        if (!videoId) return;

        try {
            const apiEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
            const response = await fetch(apiEndpoint);
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const vid = data.items[0];
                const cleanTitle = vid.snippet.title;
                const viewsStr = `${formatViews(vid.statistics.viewCount)} views`;
                
                const publishedAt = new Date(vid.snippet.publishedAt);
                const monthsAgo = Math.floor((new Date() - publishedAt) / (1000 * 60 * 60 * 24 * 30));
                let dateStr = monthsAgo > 11 ? `${Math.floor(monthsAgo / 12)} years ago` : `${monthsAgo} months ago`;
                if (monthsAgo === 0) dateStr = 'recently';
                
                const statsStr = `${viewsStr} â€¢ ${dateStr}`;
                const rawDesc = vid.snippet.description.split('\n')[0].substring(0, 80) + "..."; 
                const durationStr = formatDuration(vid.contentDetails.duration);
                
                card.setAttribute('data-title', cleanTitle);
                card.setAttribute('data-desc', rawDesc);
                card.setAttribute('data-stats', statsStr);
                
                const durEl = card.querySelector('.playlist-duration');
                if (durEl) durEl.innerText = durationStr;
                
                if (card.classList.contains('active')) {
                    const activeVidTitle = document.getElementById('active-vid-title');
                    const activeVidDesc = document.getElementById('active-vid-desc');
                    const activeVidStats = document.getElementById('active-vid-stats');
                    
                    if (activeVidTitle) activeVidTitle.innerText = cleanTitle;
                    if (activeVidDesc) activeVidDesc.innerText = rawDesc;
                    if (activeVidStats) activeVidStats.innerText = statsStr;
                }
            }
        } catch (error) {
            console.warn("YouTube API Fetch Failed: ", error); // Fails gracefully
        }
    };

    // Helper to center the active card (index 2) in the viewport
    const getCenterOffset = () => {
        if (!playlistTrack || !playlistTrack.children[2]) return 0;
        const viewport = document.querySelector('.playlist-viewport');
        const viewportWidth = viewport.offsetWidth;
        const card = playlistTrack.children[2];
        const cardWidth = card.offsetWidth;
        const gap = parseInt(window.getComputedStyle(playlistTrack).gap) || 0;
        const card2Center = (cardWidth + gap) * 2 + (cardWidth / 2);
        return (viewportWidth / 2) - card2Center;
    };

    // Initial positioning
    if (playlistTrack) {
        gsap.set(playlistTrack, { x: getCenterOffset() });
        window.addEventListener('resize', () => {
             gsap.set(playlistTrack, { x: getCenterOffset() });
        });
    }

    // Trigger background fetch for all localized cards on load
    playlistCards.forEach(card => fetchYTMetadataRealtime(card));

    let mainPortalSyncTL = null;
    
    const syncMainPortal = (card) => {
        if (!card) return;
        
        // Enforce DOM level Active CSS swapping (use LIVE children, not stale NodeList)
        Array.from(playlistTrack.children).forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const newImg = card.getAttribute('data-img');
        const newTitle = card.getAttribute('data-title');
        const newDesc = card.getAttribute('data-desc');
        const newStats = card.getAttribute('data-stats');
        const newUrl = card.getAttribute('data-url');
        
        // Prevent GSAP timeline collision if swiping incredibly fast
        if (mainPortalSyncTL) mainPortalSyncTL.kill();

        mainPortalSyncTL = gsap.timeline();
        mainPortalSyncTL.to([activeVidImg, ".active-video-meta"], {
            opacity: 0, filter: "blur(15px)", scale: 1.05, duration: 0.25, ease: "power2.in",
            onComplete: () => {
                // Destroy iframe to stop audio
                const existingIframe = document.querySelector('.main-video-portal iframe');
                if (existingIframe) existingIframe.remove();
                const playCursor = document.querySelector('.main-video-portal .magnetic-play-cursor');
                if (playCursor) playCursor.style.display = '';

                if(activeVidImg) activeVidImg.src = newImg;
                if(activeVidTitle) activeVidTitle.innerText = newTitle;
                if(activeVidDesc) activeVidDesc.innerText = newDesc;
                const statsEl = document.getElementById('active-vid-stats');
                if (statsEl && newStats) statsEl.innerText = newStats;
                const linkEl = document.querySelector('.yt-badge');
                if (linkEl && newUrl) linkEl.href = newUrl;
            }
        })
        .to([activeVidImg, ".active-video-meta"], {
            opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.35, ease: "power3.out"
        });
    };

    // (Click handlers are attached dynamically by renderPlaylistCards)

    // --- 7.5 Inline YouTube Iframe Player ---
    const playerPortal = document.getElementById('main-portal');
    if (playerPortal) {
        playerPortal.addEventListener('click', (e) => {
            if (e.target.closest('.yt-badge')) return; 

            const linkEl = document.querySelector('.yt-badge');
            if (!linkEl) return;

            const ytUrl = linkEl.href;
            const match = ytUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (match && match[1]) {
                const videoId = match[1];
                const frameContainer = playerPortal.querySelector('.video-glass-frame');
                
                if (!frameContainer.querySelector('iframe')) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
                    iframe.setAttribute('frameborder', '0');
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                    iframe.setAttribute('allowfullscreen', 'true');
                    iframe.style.position = 'absolute'; iframe.style.top = '0'; iframe.style.left = '0';
                    iframe.style.width = '100%'; iframe.style.height = '100%';
                    iframe.style.zIndex = '15'; iframe.style.borderRadius = 'inherit'; 
                    frameContainer.appendChild(iframe);
                    
                    const cursor = playerPortal.querySelector('.magnetic-play-cursor');
                    if (cursor) cursor.style.display = 'none';
                    if (autoSlideInterval) clearInterval(autoSlideInterval);
                }
            }
        });
    }

    const startAutoSlide = () => {
        if (!playlistTrack) return;
        autoSlideInterval = setInterval(() => {
            if (isAnimating) return;
            const rightCard = playlistTrack.children[3]; 
            if (rightCard) rightCard.click();
        }, 3000); 
    };

    // --- YOUTUBE CATEGORY DATA STORE ---
    // The user can edit these URLs later to populate each tab!
    // --- Category-Specific YouTube Playlists ---
    // --- Category-Specific YouTube Playlists (Real Titles) ---
    const nursingPlaylist = [
        { img: "https://img.youtube.com/vi/E1X1RFFt138/maxresdefault.jpg", url: "https://youtu.be/E1X1RFFt138?si=0TrAngTwP8UsTbqw", title: "Super notes for Assistant Professor in Nursing", desc: "Eduooz International Academy | Nursing Exam Guide", stats: "Eduooz - Nurses Learning Hub", duration: "08:53" },
        { img: "https://img.youtube.com/vi/4J_sUv_L5f0/maxresdefault.jpg", url: "https://youtu.be/4J_sUv_L5f0?si=eK1eW4HgoQy_c_4v", title: "DHS Staff Nurse Exam Preparation 2025", desc: "How to Crack DHS Exam Fast | Eduooz Results & Strategy", stats: "Eduooz - Nurses Learning Hub", duration: "13:17" },
        { img: "https://img.youtube.com/vi/YglY46sa7oA/maxresdefault.jpg", url: "https://youtu.be/YglY46sa7oA?si=9NVPLSGX5_PXlb3f", title: "POWER PLAN for DHA | MOH | DOH/HAAD | Prometric", desc: "Pearson VUE | Study Strategy by Eduooz Academy", stats: "Eduooz - Nurses Learning Hub", duration: "14:49" },
        { img: "https://img.youtube.com/vi/w76w1arkX7E/maxresdefault.jpg", url: "https://youtu.be/w76w1arkX7E?si=AkVPt67Hjx39jZ2o", title: "NCLEX-RN Animation Class", desc: "Eduooz Academy | Free Power Pack for Score Boosting", stats: "Eduooz - Nurses Learning Hub", duration: "15:08" },
        { img: "https://img.youtube.com/vi/tmP81NRePkA/maxresdefault.jpg", url: "https://youtu.be/tmP81NRePkA?si=6Bvjk8TS63e6Lq0X", title: "Pearson VUE Nursing Prometric Exam", desc: "Important Questions Discussion & Practice Session", stats: "Eduooz - Nurses Learning Hub", duration: "14:46" },
        { img: "https://img.youtube.com/vi/dcKOKETcrK4/maxresdefault.jpg", url: "https://youtu.be/dcKOKETcrK4?si=_bCrpIn0Ei5463Lc", title: "Nursing Prometric Exam", desc: "Important Questions Discussion and Practice Session", stats: "Eduooz - Nurses Learning Hub", duration: "15:39" },
        { img: "https://img.youtube.com/vi/XjogZEgAA2M/maxresdefault.jpg", url: "https://youtu.be/XjogZEgAA2M?si=CMIgkmReFJ203EEp", title: "Mission NORCET 11 | Eduooz Academy", desc: "Let's Start Today!", stats: "Eduooz - Nurses Learning Hub", duration: "05:26" },
        { img: "https://img.youtube.com/vi/_iRggg9Y_UQ/maxresdefault.jpg", url: "https://youtu.be/_iRggg9Y_UQ?si=igzGt6bHNU1yPDE0", title: "Nursing Prometric Exam", desc: "Important Question Discussion & Practice Session", stats: "Eduooz - Nurses Learning Hub", duration: "09:40" },
        { img: "https://img.youtube.com/vi/ptIFWQ_cJIQ/maxresdefault.jpg", url: "https://youtu.be/ptIFWQ_cJIQ?si=lUJVrBOF0iteUge-", title: "Nursing Saudi | Complete Career Details", desc: "Eduooz International Academy", stats: "Eduooz - Nurses Learning Hub", duration: "09:53" },
        { img: "https://img.youtube.com/vi/ftKaRv5WUmk/maxresdefault.jpg", url: "https://youtu.be/ftKaRv5WUmk?si=4pybFeukOVsPX4UN", title: "Nursing Kuwait Prometric Complete Exam Training", desc: "Eduooz International Academy", stats: "Eduooz - Nurses Learning Hub", duration: "18:24" }
    ];

    const pharmacistPlaylist = [
        { img: "https://img.youtube.com/vi/Gab0IJ_-8tQ/maxresdefault.jpg", url: "https://youtu.be/Gab0IJ_-8tQ?si=ly1hZz50CT5Cm1sJ", title: "Paracetamol Pharmacology in 5 Minutes", desc: "Eduooz International Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "07:00" },
        { img: "https://img.youtube.com/vi/vcEzTp2HEF4/maxresdefault.jpg", url: "https://youtu.be/vcEzTp2HEF4?si=H_dShvotFAtU6U2-", title: "Phenytoin Pharmacology in 5 Minutes", desc: "Eduooz International Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "07:44" },
        { img: "https://img.youtube.com/vi/ugvAoQFZCf8/maxresdefault.jpg", url: "https://youtu.be/ugvAoQFZCf8?si=Xve9l2gbIS4zsc2K", title: "Sulfonamides in Pharmacology \u2014 Explained in 5 Min", desc: "Eduooz International Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "17:06" },
        { img: "https://img.youtube.com/vi/f47-76tui34/maxresdefault.jpg", url: "https://youtu.be/f47-76tui34?si=1UUWegNs946ZP4t8", title: "Kerala PSC Pharmacist | Diazepam Pharmacology in 5 Min", desc: "Quick Revision", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "15:24" },
        { img: "https://img.youtube.com/vi/Hp1yBFQ4e2o/maxresdefault.jpg", url: "https://youtu.be/Hp1yBFQ4e2o?si=Mi8KCpsul_oVHqiT", title: "Kerala PSC Pharmacist | Insulin Pharmacology in 5 Min", desc: "Eduooz Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "15:00" },
        { img: "https://img.youtube.com/vi/-GIBgYF63ko/maxresdefault.jpg", url: "https://youtu.be/-GIBgYF63ko?si=GfJ_gzwzcpvDli6J", title: "Pharmacology Quick Revision | Eduooz Academy", desc: "Kerala PSC Pharmacist Exam Preparation", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "48:58" },
        { img: "https://img.youtube.com/vi/iElZRUtCE14/maxresdefault.jpg", url: "https://youtu.be/iElZRUtCE14?si=9FDSi7s8xRxsFSQr", title: "Pharmacist Exam Strategy | Eduooz Academy", desc: "Kerala PSC Pharmacist Coaching", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "71:47" },
        { img: "https://img.youtube.com/vi/dg9FUWQShk0/maxresdefault.jpg", url: "https://youtu.be/dg9FUWQShk0?si=iWu2KspQkvf3mtT0", title: "RRB Pharmacist 2025 | Online Coaching with Eduooz", desc: "Complete Exam Preparation", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "11:19" },
        { img: "https://img.youtube.com/vi/lYvPIHaV4O0/maxresdefault.jpg", url: "https://youtu.be/lYvPIHaV4O0?si=pTA9wdsYlzegwduT", title: "Kerala PSC Pharmacist | Markovnikov\u2019s Rule in 5 Min", desc: "Eduooz Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "12:10" },
        { img: "https://img.youtube.com/vi/ChlT_2r96R4/maxresdefault.jpg", url: "https://youtu.be/ChlT_2r96R4?si=KWiv-uVkglAWMq6S", title: "Metformin Pharmacology: A 5-Minute Simplified Explanation", desc: "Eduooz International Academy", stats: "Eduooz Academy - Pharmacist PSC Coaching", duration: "11:55" }
    ];

    const labTechPlaylist = [
        { img: "https://img.youtube.com/vi/ZqHuz3kBS-4/maxresdefault.jpg", url: "https://youtu.be/ZqHuz3kBS-4?si=8KR8BPVrxqIx5LVT", title: "Lab Technician DHS Long-Term Course", desc: "Simple Learning with Eduooz Academy", stats: "Eduooz MLT Academy", duration: "16:01" },
        { img: "https://img.youtube.com/vi/l7QKm6WsqBA/maxresdefault.jpg", url: "https://youtu.be/l7QKm6WsqBA?si=jmsu-g3UkIC-IqZQ", title: "Lab Technician DHS Long Term Course", desc: "Simple & Easy Learning \u2013 Eduooz International Academy", stats: "Eduooz MLT Academy", duration: "10:40" },
        { img: "https://img.youtube.com/vi/Er5l3ptq6RM/maxresdefault.jpg", url: "https://youtu.be/Er5l3ptq6RM?si=DiKVQ33nqlKuXhex", title: "Kerala PSC Lab Technician: Scientist Nicknames", desc: "Eduooz Academy", stats: "Eduooz MLT Academy", duration: "04:26" },
        { img: "https://img.youtube.com/vi/8X8A_tso5Dk/maxresdefault.jpg", url: "https://youtu.be/8X8A_tso5Dk?si=7aX5tb0U5DeAga-2", title: "Lab Technician DHS Long Term \u2013 Calendar of Health", desc: "Eduooz International Academy", stats: "Eduooz MLT Academy", duration: "07:21" },
        { img: "https://img.youtube.com/vi/ElQf1fTFPCw/maxresdefault.jpg", url: "https://youtu.be/ElQf1fTFPCw?si=TnNxZ7tqCTR7nsXE", title: "Mosquito Vector Chart Explained | PSC MLT Exams", desc: "Lab Technician Long Term | Eduooz", stats: "Eduooz MLT Academy", duration: "06:41" },
        { img: "https://img.youtube.com/vi/DXZWVrGW3DI/maxresdefault.jpg", url: "https://youtu.be/DXZWVrGW3DI?si=mpHvYaC3dNYBUhRv", title: "Lab Technician DHS Long Term Program", desc: "Smart & Easy Learning \u2013 Eduooz International Academy", stats: "Eduooz MLT Academy", duration: "03:44" },
        { img: "https://img.youtube.com/vi/N_aayNO3RmM/maxresdefault.jpg", url: "https://youtu.be/N_aayNO3RmM?si=BT8VPPUEBMK0vQzA", title: "Kerala PSC Junior Lab Assistant", desc: "Easy Preparation Strategy | Eduooz Academy", stats: "Eduooz MLT Academy", duration: "03:00" },
        { img: "https://img.youtube.com/vi/Oe5m4qBXJYQ/maxresdefault.jpg", url: "https://youtu.be/Oe5m4qBXJYQ?si=IOlZCURaYBrgGv5W", title: "Kerala PSC Junior Lab Assistant | Level & Exam Details", desc: "Eduooz Academy", stats: "Eduooz MLT Academy", duration: "06:39" },
        { img: "https://img.youtube.com/vi/N_aayNO3RmM/maxresdefault.jpg", url: "https://youtu.be/N_aayNO3RmM?si=pgjy3DlrD2sH0Klx", title: "Kerala PSC Junior Lab Assistant", desc: "Easy Preparation Strategy | Eduooz Academy", stats: "Eduooz MLT Academy", duration: "03:00" },
        { img: "https://img.youtube.com/vi/z0h8iw7-pfc/maxresdefault.jpg", url: "https://youtu.be/z0h8iw7-pfc?si=fB0eZoo2A-vVvc9L", title: "Lab Technician (DHS Long Term) | Complete Learning Program", desc: "Eduooz Academy", stats: "Eduooz MLT Academy", duration: "02:22" }
    ];

    const germanPlaylist = [
        { img: "https://img.youtube.com/vi/yHO54z55JkA/maxresdefault.jpg", url: "https://youtu.be/yHO54z55JkA?si=KRMANjBEh_WBdrRO", title: "German Alphabets A\u2013D | Learn German for Beginners", desc: "Malayalam / English Explanation | Eduooz Academy", stats: "Eduooz - Nurses Learning Hub", duration: "10:38" },
        { img: "https://img.youtube.com/vi/s3SfINGk5Bw/maxresdefault.jpg", url: "https://youtu.be/s3SfINGk5Bw?si=b89VxYNgY9UhZtS8", title: "German Alphabets E\u2013H | Learn German for Beginners", desc: "Malayalam / English Explanation | Eduooz Academy", stats: "Eduooz - Nurses Learning Hub", duration: "07:14" },
        { img: "https://img.youtube.com/vi/0b8vw2bJ6g8/maxresdefault.jpg", url: "https://youtu.be/0b8vw2bJ6g8?si=ZLmGg8tTIg26ItCw", title: "Learn German Alphabets I\u2013O", desc: "Easy Explanation in Malayalam & English | Eduooz Academy", stats: "Eduooz - Nurses Learning Hub", duration: "11:25" }
    ];

    // "All" tab shows a curated mix from every category (interleaved dynamically)
    const allPlaylist = [];
    const maxLen = Math.max(nursingPlaylist.length, pharmacistPlaylist.length, labTechPlaylist.length, germanPlaylist.length);
    for (let i = 0; i < maxLen; i++) {
        if (nursingPlaylist[i]) allPlaylist.push(nursingPlaylist[i]);
        if (pharmacistPlaylist[i]) allPlaylist.push(pharmacistPlaylist[i]);
        if (labTechPlaylist[i]) allPlaylist.push(labTechPlaylist[i]);
        if (germanPlaylist[i]) allPlaylist.push(germanPlaylist[i]);
    }

    const ytCategoryData = {
        'All': allPlaylist,
        'Nursing': nursingPlaylist,
        'Pharmacist': pharmacistPlaylist,
        'Lab Technician': labTechPlaylist,
        'German Language': germanPlaylist
    };

    // --- Dynamic Playlist Card Renderer ---
    function renderPlaylistCards(playlist) {
        if (!playlistTrack) return;

        // Clear existing cards
        playlistTrack.innerHTML = '';

        // Generate card elements from data
        playlist.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.setAttribute('data-img', item.img);
            card.setAttribute('data-url', item.url);
            card.setAttribute('data-title', item.title);
            card.setAttribute('data-desc', item.desc);
            card.setAttribute('data-stats', item.stats);

            card.innerHTML = `
                <div class="playlist-duration">${item.duration}</div>
                <img src="${item.img}" alt="${item.title}">
                <div class="play-icon-sm"><i class="fa-solid fa-play"></i></div>
            `;

            playlistTrack.appendChild(card);
        });

        // Mark the 3rd card (index 2) as active
        if (playlistTrack.children.length > 2) {
            playlistTrack.children[2].classList.add('active');
        }

        // Attach click handlers to new cards
        Array.from(playlistTrack.children).forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.isTrusted && window.lastDragDist > 10) { e.preventDefault(); return; }
                if (isAnimating) return;

                const index = Array.from(playlistTrack.children).indexOf(card);
                if (index === 2 && card.classList.contains('active')) return;

                syncMainPortal(card);

                const currentCardWidth = playlistTrack.children[0].offsetWidth + (parseInt(window.getComputedStyle(playlistTrack).gap) || 0);
                const offset = getCenterOffset();

                const dist = index - 2;
                if (dist !== 0) {
                    isAnimating = true;
                    if (dist > 0) {
                        gsap.to(playlistTrack, { x: offset - (currentCardWidth * dist), duration: 0.5, ease: "power2.out", onComplete: () => {
                            for (let i = 0; i < dist; i++) playlistTrack.appendChild(playlistTrack.firstElementChild);
                            gsap.set(playlistTrack, { x: offset });
                            isAnimating = false;
                        }});
                    } else {
                        const absDist = Math.abs(dist);
                        for (let i = 0; i < absDist; i++) playlistTrack.prepend(playlistTrack.lastElementChild);
                        gsap.set(playlistTrack, { x: offset - (currentCardWidth * absDist) });
                        gsap.to(playlistTrack, { x: offset, duration: 0.5, ease: "power2.out", onComplete: () => isAnimating = false });
                    }
                }
            });
        });

        // Re-center and sync portal
        gsap.set(playlistTrack, { x: getCenterOffset() });
        const centerCard = playlistTrack.children[2];
        if (centerCard) syncMainPortal(centerCard);
    }

    // Initial render with "All" playlist
    renderPlaylistCards(allPlaylist);

    // YouTube Category Tabs Logic
    const ytTabs = document.querySelectorAll('.yt-tab');
    if (ytTabs.length > 0) {
        ytTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                if(tab.classList.contains('active')) return;

                ytTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const category = tab.innerText.trim();
                const playlistData = ytCategoryData[category];
                
                if(playlistData && playlistTrack) {
                    gsap.to(playlistTrack, { opacity: 0, duration: 0.2, onComplete: () => {
                        renderPlaylistCards(playlistData);
                        gsap.to(playlistTrack, { opacity: 1, duration: 0.3 });
                    }});
                }
            });
        });
    }

    // --- 8. Seamless Infinite Grab & Swipe Logic ---
    let isDragging = false;
    let startX = 0;
    
    // Dynamic width calculation helper
    const getCardWidth = () => {
        if(!playlistTrack || !playlistTrack.children[0]) return 280;
        const gap = parseInt(window.getComputedStyle(playlistTrack).gap) || 0;
        return playlistTrack.children[0].offsetWidth + gap;
    };
    let cachedCenterOffset = 0;
    const pointerDown = (e) => {
        if (isAnimating || !playlistTrack) return;
        isDragging = true;
        window.lastDragDist = 0;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        playlistTrack.style.cursor = 'grabbing';
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        
        cachedCenterOffset = getCenterOffset();
    };

    const pointerMove = (e) => {
        if (!isDragging || isAnimating) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        let walk = x - startX;
        
        // True infinite loop DOM manipulation during active Drag
        const currentWidth = getCardWidth();
        if (walk <= -currentWidth) {
            playlistTrack.appendChild(playlistTrack.firstElementChild);
            startX -= currentWidth; walk += currentWidth;
            syncMainPortal(playlistTrack.children[2]);
        } else if (walk >= currentWidth) {
            playlistTrack.prepend(playlistTrack.lastElementChild);
            startX += currentWidth; walk -= currentWidth;
            syncMainPortal(playlistTrack.children[2]);
        }
        
        window.lastDragDist += Math.abs(walk); // Ensure clicks disable gracefully
        gsap.set(playlistTrack, { x: cachedCenterOffset + walk });
    };

    const pointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        playlistTrack.style.cursor = 'grab';

        const endX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
        const walk = endX - startX;
        const currentWidth = getCardWidth();
        const offset = getCenterOffset();

        if (walk < -50 && !isAnimating) {
            isAnimating = true;
            gsap.to(playlistTrack, { x: offset - currentWidth, duration: 0.35, ease: "power2.out", onComplete: () => {
                playlistTrack.appendChild(playlistTrack.firstElementChild);
                gsap.set(playlistTrack, { x: offset });
                syncMainPortal(playlistTrack.children[2]);
                isAnimating = false;
            }});
        } else if (walk > 50 && !isAnimating) {
            isAnimating = true;
            gsap.to(playlistTrack, { x: offset + currentWidth, duration: 0.35, ease: "power2.out", onComplete: () => {
                playlistTrack.prepend(playlistTrack.lastElementChild);
                gsap.set(playlistTrack, { x: offset });
                syncMainPortal(playlistTrack.children[2]);
                isAnimating = false;
            }});
        } else {
            // Snap back to precise center if lazy swipe
            gsap.to(playlistTrack, { x: offset, duration: 0.3, ease: "power2.out" });
        }
        startAutoSlide();
    };

    if (playlistTrack) {
        playlistTrack.style.cursor = 'grab';
        playlistTrack.addEventListener('mousedown', pointerDown);
        playlistTrack.addEventListener('mousemove', pointerMove);
        window.addEventListener('mouseup', pointerUp);
        
        playlistTrack.addEventListener('touchstart', pointerDown, {passive: true});
        playlistTrack.addEventListener('touchmove', pointerMove, {passive: true});
        window.addEventListener('touchend', pointerUp);
    }

    // Removed ecosystem hover pause functionality at user request

    startAutoSlide();

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

    // --- 11. GSAP Testimonials Reveal ---
    gsap.set(".g-test-reveal", { autoAlpha: 1 });
    gsap.from(".g-test-reveal", {
        scrollTrigger: { trigger: ".testimonials-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // --- 12. Testimonial Marquee: JS-Driven Infinite Scroll + Drag ---
    document.querySelectorAll('.test-marquee-container').forEach((container, idx) => {
        const track = container.querySelector('.test-marquee-track');
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
        function onUp() { isDragging = false; }

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

    // --- 15. FACULTY MORPHING: DYNAMIC DOM WRAPPER FOR CSS GRID ---
    document.querySelectorAll('.fac-hidden-details').forEach(details => {
        if(details.querySelector('.fac-hidden-inner')) return;
        const inner = document.createElement('div');
        inner.className = 'fac-hidden-inner';
        while (details.firstChild) {
            inner.appendChild(details.firstChild);
        }
        details.appendChild(inner);
    });

    // Mobile Interaction for Morph Cards
    const morphCards = document.querySelectorAll('.fac-morph-card');
    if (window.innerWidth <= 1024 && morphCards.length > 0) {
        morphCards.forEach(card => {
            card.addEventListener('click', function() {
                const isOpen = this.classList.contains('is-open');
                morphCards.forEach(c => c.classList.remove('is-open'));
                if (!isOpen) this.classList.add('is-open');
            });
        });
    }

    // --- 16. PLACEMENTS: CINEMATIC INFINITE DRAG FILMSTRIP ---
    const facTrack = document.getElementById('faculty-track');
    const facWrapper = document.querySelector('.filmstrip-track-wrapper');
    
    if(facTrack && facWrapper) {
        const cards = Array.from(facTrack.children);
        
        // 1. Clone cards to create the seamless loop illusion
        cards.forEach(card => {
            let clone = card.cloneNode(true);
            facTrack.appendChild(clone);
        });

        const allCards = Array.from(facTrack.children);

        // 2. Physics Variables
        let targetX = 0;
        let currentX = 0;
        let isDragging = false;
        let startX = 0;
        let dragStartX = 0;
        let autoScrollSpeed = 1;
        let trackWidth = 0;

        function updateMeasurements() {
            trackWidth = facTrack.scrollWidth / 2;
        }
        setTimeout(updateMeasurements, 500);
        window.addEventListener('resize', updateMeasurements);

        facWrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            dragStartX = targetX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            targetX = dragStartX + (dx * 1.5);
        });

        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mouseleave', () => isDragging = false);

        // Touch for Mobile
        facWrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            dragStartX = targetX;
            autoScrollSpeed = 0;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - startX;
            targetX = dragStartX + (dx * 1.5);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
            autoScrollSpeed = 1;
        });

        facWrapper.addEventListener('mouseenter', () => autoScrollSpeed = 0);
        facWrapper.addEventListener('mouseleave', () => autoScrollSpeed = 1);

        // Render Loop
        function animateFaculty() {
            if (!isDragging) {
                targetX -= autoScrollSpeed;
            }

            currentX += (targetX - currentX) * 0.08;

            if (currentX <= -trackWidth) {
                currentX += trackWidth;
                targetX += trackWidth;
            } else if (currentX > 0) {
                currentX -= trackWidth;
                targetX -= trackWidth;
            }

            gsap.set(facTrack, { x: currentX });

            // Mobile auto-reveal
            if (window.innerWidth <= 1024) {
                const screenCenter = window.innerWidth / 2;
                allCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    if (cardCenter > screenCenter - (rect.width * 0.55) && cardCenter < screenCenter + (rect.width * 0.55)) {
                        card.classList.add('mobile-active');
                    } else {
                        card.classList.remove('mobile-active');
                    }
                });
            } else {
                allCards.forEach(card => card.classList.remove('mobile-active'));
            }

            requestAnimationFrame(animateFaculty);
        }
        animateFaculty();
    }

    // --- 17. FINAL REVEAL ANIMATIONS (Faculty & Placements) ---
    gsap.set(".g-fac-reveal, .g-place-reveal", { autoAlpha: 1 });
    
    gsap.from(".g-fac-reveal", {
        scrollTrigger: { trigger: ".faculty-morph-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    gsap.from(".g-place-reveal", {
        scrollTrigger: { trigger: ".faculty-filmstrip-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // --- 11. GSAP Application Terminal Logic ---
    
    // 1. Reveal Animation
    gsap.set(".g-cta-reveal", { autoAlpha: 1 });
    gsap.from(".g-cta-reveal", {
        scrollTrigger: { trigger: ".cta-terminal-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    

});

        // Tab Filtering Logic with GSAP
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const boxes = document.querySelectorAll('.course-box');

                // Hide all first
                gsap.to(boxes, {
                    opacity: 0, scale: 0.9, y: 20, duration: 0.2, onComplete: () => {
                        boxes.forEach(box => {
                            if (filter === 'all' || box.getAttribute('data-category') === filter) {
                                box.style.display = 'flex';
                                // Show filtered
                                gsap.to(box, {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    duration: 0.4,
                                    ease: "back.out(1.5)",
                                    stagger: 0.05
                                });
                            } else {
                                box.style.display = 'none';
                            }
                        });
                    }
                });
            });
        });

        // FAQ Accordion
        document.querySelectorAll('.faq-q').forEach(q => {
            q.addEventListener('click', () => {
                const answer = q.nextElementSibling;
                const icon = q.querySelector('i');
                const isOpen = answer.style.maxHeight !== '0px' && answer.style.maxHeight !== '';

                // Close all others
                document.querySelectorAll('.faq-a').forEach(a => a.style.maxHeight = '0px');
                document.querySelectorAll('.faq-q i').forEach(i => i.style.transform = 'rotate(0deg)');

                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.style.transform = 'rotate(45deg)';
                }
            });
        });

        // --- Video Testimonials Logic ---
        (function () {
            const playlistItems = document.querySelectorAll('.testi-playlist-item');
            const featuredImg = document.getElementById('testiFeaturedImg');
            const avatarImg = document.getElementById('testiAvatarImg');
            const nameEl = document.getElementById('testiName');
            const subEl = document.getElementById('testiSub');
            const badgeEl = document.getElementById('testiBadge');
            const quoteEl = document.getElementById('testiQuote');

            if (!playlistItems.length) return;

            let currentIndex = 0;
            let autoPlayInterval;

            function updateFeatured(index) {
                // Remove active class from all
                playlistItems.forEach(item => item.classList.remove('active'));

                // Add active class to current
                const currentItem = playlistItems[index];
                currentItem.classList.add('active');

                // Animate transition using GSAP
                gsap.to('.testi-featured', {
                    opacity: 0, duration: 0.2, onComplete: () => {
                        // Update content
                        featuredImg.src = currentItem.dataset.img;
                        avatarImg.src = currentItem.dataset.avatar;
                        nameEl.textContent = currentItem.dataset.name;
                        subEl.textContent = currentItem.dataset.sub;
                        badgeEl.innerHTML = '<i class="fa-solid fa-check"></i> ' + currentItem.dataset.badge;
                        quoteEl.innerHTML = '<i class="fa-solid fa-quote-left testi-quote-icon"></i> <p>' + currentItem.dataset.quote + '</p>';

                        // Fade back in
                        gsap.to('.testi-featured', { opacity: 1, duration: 0.3 });
                    }
                });
            }

            function nextItem() {
                currentIndex = (currentIndex + 1) % playlistItems.length;
                updateFeatured(currentIndex);
            }

            function startAutoPlay() {
                // Clear any existing before starting to prevent multiple intervals
                clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextItem, 2000);
            }

            function stopAutoPlay() {
                clearInterval(autoPlayInterval);
            }

            // Click handling
            playlistItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    currentIndex = index;
                    updateFeatured(currentIndex);
                    stopAutoPlay();
                    // Resume after 5 seconds of inactivity
                    setTimeout(startAutoPlay, 5000);
                });
            });

            // Pause autoplay on hover over featured section or playlist
            const featuredSection = document.getElementById('testiFeatured');
            const playlistSection = document.getElementById('testiPlaylist');

            if (featuredSection && playlistSection) {
                featuredSection.addEventListener('mouseenter', stopAutoPlay);
                featuredSection.addEventListener('mouseleave', startAutoPlay);
                playlistSection.addEventListener('mouseenter', stopAutoPlay);
                playlistSection.addEventListener('mouseleave', startAutoPlay);
            }

            // Start Autoplay
            startAutoPlay();
        })();

        // --- YouTube Carousel ---
        (function () {
            const track = document.getElementById('ytTrack');
            const viewport = document.getElementById('ytViewport');
            const prevBtn = document.getElementById('ytPrev');
            const nextBtn = document.getElementById('ytNext');
            const dotsEl = document.getElementById('ytDots');
            if (!track) return;

            const cards = Array.from(track.querySelectorAll('.yt-card'));
            let currentIndex = 0;

            function getSlidesVisible() {
                const w = window.innerWidth;
                if (w <= 640) return 1;
                if (w <= 991) return 2;
                return 3;
            }

            function getTotal() {
                return Math.ceil(cards.length / getSlidesVisible());
            }

            // Build dots
            function buildDots() {
                dotsEl.innerHTML = '';
                const total = getTotal();
                for (let i = 0; i < total; i++) {
                    const d = document.createElement('button');
                    d.className = 'yt-dot' + (i === 0 ? ' active' : '');
                    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
                    d.addEventListener('click', () => goTo(i));
                    dotsEl.appendChild(d);
                }
            }

            function updateDots() {
                const dotBtns = dotsEl.querySelectorAll('.yt-dot');
                dotBtns.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
            }

            function goTo(index) {
                const slidesVisible = getSlidesVisible();
                const total = getTotal();
                currentIndex = Math.max(0, Math.min(index, total - 1));

                const cardWidth = cards[0].getBoundingClientRect().width;
                const gap = 24;
                const slideOffset = currentIndex * slidesVisible * (cardWidth + gap);
                track.style.transform = `translateX(-${slideOffset}px)`;

                prevBtn.disabled = currentIndex === 0;
                nextBtn.disabled = currentIndex >= total - 1;
                updateDots();
            }

            prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
            nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

            buildDots();
            goTo(0);
            window.addEventListener('resize', () => { buildDots(); goTo(0); });
        })();

        // Animations
        document.addEventListener('DOMContentLoaded', () => {
            gsap.registerPlugin(ScrollTrigger);
            const lenis = new Lenis();
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);

            gsap.utils.toArray('.g-reveal').forEach(el => {
                gsap.from(el, {
                    scrollTrigger: { trigger: el, start: "top 85%" },
                    y: 30, opacity: 0, duration: 0.8, ease: "power2.out"
                });
            });

            // Placement stat cards entrance
            gsap.utils.toArray('.placement-stat-card').forEach((card, i) => {
                gsap.from(card, {
                    scrollTrigger: { trigger: card, start: "top 88%" },
                    y: 40, opacity: 0, duration: 0.7,
                    delay: i * 0.1,
                    ease: "power2.out"
                });
            });

            const tl = gsap.timeline();
            tl.from('.glass-pill', { opacity: 0, y: 20, duration: 0.6 })
                .from('.hero-title-main', { opacity: 0, y: 30, duration: 0.8 }, "-=0.3")
                .from('.hero-desc', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
                .from('.cta-cluster', { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");
        });

    

/* ==================================================================================
   exam-landing.js — Data-driven exam page renderer (reads window.EXAM_CONFIG)
   ================================================================================== */
/**
 * Exam Landing Page — Dynamic Renderer & Interactivity
 * Reads window.EXAM_CONFIG and populates all sections
 */
document.addEventListener("DOMContentLoaded", () => {

    const CONFIG = window.EXAM_CONFIG;
    if (!CONFIG) { console.warn('EXAM_CONFIG not found.'); return; }

    // --- 1. RENDER EXAM SNAPSHOT ---
    function renderSnapshot() {
        const grid = document.getElementById('snapshot-grid');
        if (!grid || !CONFIG.snapshot) return;

        const items = CONFIG.snapshot;
        grid.innerHTML = items.map(item => `
            <div class="snapshot-card g-exam-reveal">
                <div class="snap-icon"><i class="${item.icon}"></i></div>
                <div class="snap-label">${item.label}</div>
                <div class="snap-value">${item.link ? `<a href="${item.link}" target="_blank">${item.value}</a>` : item.value}</div>
            </div>
        `).join('');
    }

    // --- 2. RENDER ABOUT SECTION (Video Carousel + Stat Counters) ---
    function renderAbout() {
        var track     = document.getElementById('aev-track');
        var dotsWrap  = document.getElementById('aev-dots');
        var prevBtn   = document.getElementById('aev-prev');
        var nextBtn   = document.getElementById('aev-next');
        var trackWrap = document.getElementById('aev-track-wrap');
        var statsEl   = document.getElementById('aev-stats');

        if (!track) return;

        var videos = [
            { id: 'd5xoc5zvWyQ', title: 'NORCET 11 — All You Need to Know', tag: 'Latest' },
            { id: 'qEBQcfAy5e4', title: 'NORCET 10 — Nursing Officer Exam Details', tag: 'Popular' },
            { id: 'h9NjqU6IyzE', title: 'Best NORCET Preparation Strategy', tag: 'Strategy' },
            { id: 'u6EAh2w3bPo', title: 'NORCET 9 — Must-Know Exam Questions', tag: 'MCQs' }
        ];

        var current   = 0;
        var isHovered = false;
        var autoTimer = null;
        var touchStartX = 0;

        /* ── Build cards ── */
        function buildCards() {
            track.innerHTML = videos.map(function(v, i) {
                return '<a class="aev-card' + (i === 0 ? ' aev-active' : '') + '"'
                     + ' href="https://www.youtube.com/watch?v=' + v.id + '"'
                     + ' target="_blank" rel="noopener" data-idx="' + i + '">'
                     + '<img class="aev-thumb" loading="lazy"'
                     + '  src="https://img.youtube.com/vi/' + v.id + '/maxresdefault.jpg"'
                     + '  onerror="this.onerror=null;this.src=\'https://img.youtube.com/vi/' + v.id + '/hqdefault.jpg\'"'
                     + '  alt="' + v.title + '">'
                     + '<div class="aev-overlay"></div>'
                     + '<div class="aev-play"><i class="fa-solid fa-play" style="margin-left:3px"></i></div>'
                     + '<span class="aev-tag">' + v.tag + '</span>'
                     + '<div class="aev-caption"><p class="aev-card-title">' + v.title + '</p></div>'
                     + '</a>';
            }).join('');

            buildDots();
            updateCarousel(false);
        }

        /* ── Dots ── */
        function buildDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = videos.map(function(_, i) {
                return '<button class="aev-dot' + (i === 0 ? ' aev-dot-active' : '') + '" aria-label="Video ' + (i + 1) + '"></button>';
            }).join('');
            dotsWrap.querySelectorAll('.aev-dot').forEach(function(dot, i) {
                dot.addEventListener('click', function() { goTo(i); });
            });
        }

        /* ── Position track to center active card ── */
        function updateCarousel(animate) {
            var cards = track.querySelectorAll('.aev-card');
            if (!cards.length || !trackWrap) return;

            var containerW = trackWrap.offsetWidth;
            var cardW      = cards[0].offsetWidth;
            var gap        = 16;
            var peekOffset = (containerW - cardW) / 2;
            var offset     = peekOffset - current * (cardW + gap);

            track.style.transition = animate
                ? 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)'
                : 'none';
            track.style.transform = 'translateX(' + offset + 'px)';

            cards.forEach(function(c, i) {
                c.classList.toggle('aev-active', i === current);
            });

            if (dotsWrap) {
                dotsWrap.querySelectorAll('.aev-dot').forEach(function(d, i) {
                    d.classList.toggle('aev-dot-active', i === current);
                });
            }
        }

        function goTo(idx) {
            current = ((idx % videos.length) + videos.length) % videos.length;
            updateCarousel(true);
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        /* ── Auto-slide ── */
        function startAuto() {
            clearInterval(autoTimer);
            autoTimer = setInterval(function() {
                if (!isHovered) next();
            }, 4000);
        }

        /* ── Nav buttons ── */
        if (nextBtn) nextBtn.addEventListener('click', function() { next(); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', function() { prev(); startAuto(); });

        /* ── Hover pause ── */
        var carousel = document.getElementById('aev-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', function() { isHovered = true; });
            carousel.addEventListener('mouseleave', function() { isHovered = false; });
        }

        /* ── Touch swipe ── */
        if (trackWrap) {
            trackWrap.addEventListener('touchstart', function(e) {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });
            trackWrap.addEventListener('touchend', function(e) {
                var dx = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(dx) > 40) {
                    if (dx < 0) next(); else prev();
                    startAuto();
                }
            }, { passive: true });
        }

        /* ── Recalculate on resize ── */
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() { updateCarousel(false); }, 150);
        });

        /* ── Animated stat counters (Intersection Observer) ── */
        if (statsEl) {
            var countersRun = false;
            var statsObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting && !countersRun) {
                        countersRun = true;
                        statsEl.querySelectorAll('.aev-stat-num').forEach(function(el) {
                            var target   = parseInt(el.dataset.target, 10);
                            var suffix   = el.dataset.suffix  || '';
                            var prefix   = el.dataset.prefix  || '';
                            var duration = 1600;
                            var startTs  = null;
                            (function tick(ts) {
                                if (!startTs) startTs = ts;
                                var p   = Math.min((ts - startTs) / duration, 1);
                                var ease = 1 - Math.pow(1 - p, 3);
                                el.textContent = prefix + Math.round(ease * target) + suffix;
                                if (p < 1) requestAnimationFrame(tick);
                            })(performance.now());
                        });
                        statsObserver.disconnect();
                    }
                });
            }, { threshold: 0.5 });
            statsObserver.observe(statsEl);
        }

        /* ── Init ── */
        buildCards();
        startAuto();
    }

    // --- 3. RENDER ELIGIBILITY ---
    function renderEligibility() {
        const grid = document.getElementById('eligibility-grid');
        if (!grid || !CONFIG.eligibility) return;

        grid.innerHTML = CONFIG.eligibility.map(item => `
            <div class="elig-card g-exam-reveal">
                <div class="elig-icon"><i class="${item.icon}"></i></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `).join('');
    }

    // --- 4. ELIGIBILITY CHECKER LOGIC ---
    function initEligibilityChecker() {
        const form = document.getElementById('elig-checker-form');
        const result = document.getElementById('elig-result');
        if (!form || !result) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const qualification = form.querySelector('[name="qualification"]').value;
            const registration = form.querySelector('[name="registration"]').value;
            const category = form.querySelector('[name="category"]').value;
            const dob = form.querySelector('[name="dob"]').value;

            if (!qualification || !registration || !category || !dob) {
                showResult(result, 'warning', '<i class="fa-solid fa-triangle-exclamation"></i> Please fill in all fields to check eligibility.');
                return;
            }

            // Calculate age
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // Check rules from config
            const rules = CONFIG.eligibilityRules;
            if (!rules) {
                showResult(result, 'success', '<i class="fa-solid fa-circle-check"></i> Based on your inputs, you appear to meet the basic eligibility criteria.');
                return;
            }

            // Check qualification
            if (rules.qualifications && !rules.qualifications.includes(qualification)) {
                showResult(result, 'error', '<i class="fa-solid fa-circle-xmark"></i> Your qualification does not meet the minimum requirement for this exam.');
                return;
            }

            // Check registration
            if (rules.registrationRequired && registration === 'no') {
                showResult(result, 'error', '<i class="fa-solid fa-circle-xmark"></i> Active nursing council registration is mandatory for this exam.');
                return;
            }

            // Check age
            const maxAge = rules.ageLimit[category] || rules.ageLimit.general;
            const minAge = rules.minAge || 18;

            if (age < minAge) {
                showResult(result, 'error', `<i class="fa-solid fa-circle-xmark"></i> Minimum age requirement is ${minAge} years. You are currently ${age} years old.`);
                return;
            }

            if (maxAge && age > maxAge) {
                showResult(result, 'warning', `<i class="fa-solid fa-triangle-exclamation"></i> The maximum age for ${category} category is ${maxAge} years. You are ${age} years old. Check official notification for relaxations.`);
                return;
            }

            showResult(result, 'success', '<i class="fa-solid fa-circle-check"></i> Congratulations! Based on your inputs, you meet the eligibility criteria for this exam.');
        });
    }

    function showResult(el, type, html) {
        el.className = 'elig-result show ' + type;
        el.innerHTML = html;
    }

    // --- 5. RENDER AGE RELAXATION ---
    function renderAgeRelaxation() {
        const grid = document.getElementById('age-relax-grid');
        if (!grid || !CONFIG.ageRelaxation) return;

        grid.innerHTML = CONFIG.ageRelaxation.map(item => `
            <div class="age-card g-exam-reveal">
                <h4>${item.category}</h4>
                <div class="age-value">${item.maxAge} years</div>
                <div class="age-detail">${item.relaxation}</div>
            </div>
        `).join('');
    }

    // --- 6. RENDER SYLLABUS ---
    function renderSyllabus() {
        const grid = document.getElementById('syllabus-grid');
        if (!grid || !CONFIG.syllabus) return;

        grid.innerHTML = CONFIG.syllabus.map(subject => `
            <div class="subject-card g-exam-reveal" data-subject="${subject.name.toLowerCase()}">
                <h4>
                    <span class="subj-icon"><i class="${subject.icon || 'fa-solid fa-book'}"></i></span>
                    ${subject.name}
                </h4>
                <ul>
                    ${subject.topics.map(t => `<li><i class="fa-solid fa-chevron-right"></i> ${t}</li>`).join('')}
                </ul>
            </div>
        `).join('');

        // Search functionality
        const searchInput = document.getElementById('syllabus-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const cards = grid.querySelectorAll('.subject-card');
                cards.forEach(card => {
                    const text = card.textContent.toLowerCase();
                    card.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }

    // --- 7. RENDER PREPARATION STEPS ---
    function renderPreparation() {
        const container = document.getElementById('prepare-timeline');
        if (!container || !CONFIG.preparation) return;

        container.innerHTML = CONFIG.preparation.map((step, i) => `
            <div class="prepare-step g-exam-reveal" data-step="${String(i + 1).padStart(2, '0')}">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                ${step.duration ? `<span class="step-duration"><i class="fa-regular fa-clock"></i> ${step.duration}</span>` : ''}
            </div>
        `).join('');
    }

    // --- 8. RENDER EXAM PROCESS ---
    function renderProcess() {
        const flow = document.getElementById('process-flow');
        if (!flow || !CONFIG.examProcess) return;

        flow.innerHTML = CONFIG.examProcess.map(node => `
            <div class="process-node g-exam-reveal">
                <div class="node-circle"><i class="${node.icon}"></i></div>
                <div>
                    <h5>${node.title}</h5>
                    <span>${node.subtitle || ''}</span>
                </div>
            </div>
        `).join('');
    }

    // --- 9. RENDER WHY EDUOOZ ---
    function renderWhyEduooz() {
        const grid = document.getElementById('why-grid');
        if (!grid || !CONFIG.whyEduooz) return;

        grid.innerHTML = CONFIG.whyEduooz.map(item => `
            <div class="why-card g-exam-reveal">
                <div class="why-icon"><i class="${item.icon}"></i></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `).join('');
    }

    // --- 10. RENDER PREVIOUS PAPERS (PDF EXPLORER) ---
    // Loads from /question-papers/papers.json; falls back to CONFIG.previousPapers
    function renderPapers() {
        var grid     = document.getElementById('pex-paper-grid');
        if (!grid) return;

        var examSlug = CONFIG.examSlug || 'aiims-norcet';

        /* ── Resolve papers.json URL relative to current page ── */
        var jsonPath = (function() {
            var depth = window.location.pathname.split('/').filter(Boolean).length;
            var prefix = '';
            for (var i = 0; i < depth; i++) prefix += '../';
            return prefix + 'question-papers/papers.json';
        }());

        fetch(jsonPath)
            .then(function(r) {
                if (!r.ok) throw new Error('fetch failed');
                return r.json();
            })
            .then(function(data) {
                var allPapers = (data.papers || []).filter(function(p) {
                    return p.examSlug === examSlug;
                });
                // Enrich with meta field for display if missing
                allPapers.forEach(function(p) {
                    if (!p.meta) {
                        var parts = [];
                        if (p.questionCount) parts.push(p.questionCount + ' MCQs');
                        if (p.duration) parts.push(p.duration);
                        p.meta = parts.join(' · ');
                    }
                });
                initPaperExplorer(allPapers);
            })
            .catch(function() {
                // Graceful fallback to EXAM_CONFIG inline data
                var fallback = (CONFIG.previousPapers || []);
                initPaperExplorer(fallback);
            });

        function initPaperExplorer(papers) {
            var emptyEl  = document.getElementById('pex-empty');
            var iframe   = document.getElementById('pex-iframe');
            var skeleton = document.getElementById('pex-skeleton');
            var locked   = document.getElementById('pex-locked-state');
            var infoYear = document.getElementById('pex-info-year');
            var infoTitle= document.getElementById('pex-info-title');
            var dlBtn    = document.getElementById('pex-download-btn');
            var zoomLbl  = document.getElementById('pex-zoom-label');
            var tabsEl   = document.getElementById('pex-tabs');

            var activePaper = null;
            var currentZoom = 100;
            var activeYear  = 'all';
            var searchQuery = '';

            /* ── Auto-generate year filter tabs from data ── */
            if (tabsEl) {
                var years = papers
                    .map(function(p) { return p.year; })
                    .filter(function(y, i, a) { return a.indexOf(y) === i; })
                    .sort().reverse();

                tabsEl.innerHTML = '<button class="pex-tab active" data-year="all">All Years</button>'
                    + years.map(function(y) {
                        return '<button class="pex-tab" data-year="' + y + '">' + y + '</button>';
                    }).join('');
            }

            /* ── Zoom ── */
            function setZoom(z) {
                currentZoom = Math.max(60, Math.min(200, z));
                if (iframe) {
                    iframe.style.transform = 'scale(' + (currentZoom / 100) + ')';
                    iframe.style.transformOrigin = 'top center';
                }
                if (zoomLbl) zoomLbl.textContent = currentZoom + '%';
            }
            var zIn  = document.getElementById('pex-zoom-in');
            var zOut = document.getElementById('pex-zoom-out');
            if (zIn)  zIn.addEventListener('click',  function() { setZoom(currentZoom + 20); });
            if (zOut) zOut.addEventListener('click', function() { setZoom(currentZoom - 20); });

            /* ── Fullscreen ── */
            var fsBtn = document.getElementById('pex-fullscreen-btn');
            if (fsBtn) {
                fsBtn.addEventListener('click', function() {
                    var card = document.getElementById('pex-preview-card');
                    if (!card) return;
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        fsBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
                    } else {
                        if (card.requestFullscreen) card.requestFullscreen();
                        fsBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
                    }
                });
            }

            /* ── Load PDF preview ── */
            function loadPreview(paper) {
                if (!skeleton || !locked || !iframe) return;
                locked.classList.remove('pex-show');
                iframe.classList.remove('pex-loaded');
                skeleton.classList.remove('pex-hidden');

                if (!paper.pdfUrl) {
                    setTimeout(function() {
                        skeleton.classList.add('pex-hidden');
                        var locTitle = document.getElementById('pex-locked-title');
                        var locSub   = document.getElementById('pex-locked-sub');
                        if (locTitle) locTitle.textContent = paper.shortTitle || paper.title;
                        if (locSub)   locSub.textContent   = 'Enroll to access and download this paper.';
                        locked.classList.add('pex-show');
                    }, 480);
                    return;
                }

                iframe.src = '';
                setTimeout(function() {
                    iframe.onload = function() {
                        skeleton.classList.add('pex-hidden');
                        iframe.classList.add('pex-loaded');
                    };
                    iframe.src = paper.pdfUrl;
                }, 100);
            }

            /* ── Select paper ── */
            function selectPaper(paper) {
                activePaper = paper;
                if (infoYear)  infoYear.textContent  = paper.year + (paper.shift ? ' · ' + paper.shift : '');
                if (infoTitle) infoTitle.textContent = paper.shortTitle || paper.title;

                grid.querySelectorAll('.pex-paper-card').forEach(function(c) {
                    c.classList.toggle('pex-active', c.dataset.id === paper.id);
                });

                if (dlBtn) {
                    if (paper.pdfUrl) {
                        dlBtn.href = paper.pdfUrl;
                        dlBtn.setAttribute('target', '_blank');
                        dlBtn.style.opacity = '';
                        dlBtn.style.pointerEvents = '';
                    } else {
                        dlBtn.href = '#';
                        dlBtn.removeAttribute('target');
                        dlBtn.style.opacity = '0.38';
                        dlBtn.style.pointerEvents = 'none';
                    }
                }

                // Update URL to paper SEO page using history API (shareable, crawlable)
                if (paper.slug && window.history && window.history.pushState) {
                    var paperUrl = '/question-papers/' + paper.slug + '/';
                    window.history.replaceState({ paperId: paper.id }, paper.title, paperUrl);
                }

                loadPreview(paper);
            }

            /* ── Render cards ── */
            function renderCards(list) {
                if (list.length === 0) {
                    grid.innerHTML = '';
                    if (emptyEl) emptyEl.classList.add('pex-show');
                    return;
                }
                if (emptyEl) emptyEl.classList.remove('pex-show');

                grid.innerHTML = list.map(function(paper, i) {
                    var isActive = activePaper && activePaper.id === paper.id;
                    var seoHref  = paper.slug ? '/question-papers/' + paper.slug + '/' : '#';
                    return '<div class="pex-paper-card' + (isActive ? ' pex-active' : '') + '"'
                         + ' data-id="' + paper.id + '"'
                         + ' style="animation-delay:' + (i * 0.05) + 's">'
                         + '<div class="pex-card-top">'
                         +   '<div class="pex-card-icon"><i class="fa-solid fa-file-pdf"></i></div>'
                         +   '<span class="pex-year-badge">' + paper.year + '</span>'
                         + '</div>'
                         + '<h4 class="pex-card-title">' + (paper.shortTitle || paper.title) + '</h4>'
                         + '<p class="pex-card-meta"><i class="fa-regular fa-file-lines"></i> '
                         +   (paper.meta || '')
                         +   (paper.pages ? ' · ' + paper.pages + ' pages' : '')
                         + '</p>'
                         + '<div class="pex-card-footer">'
                         +   '<div class="pex-active-chip"><i class="fa-solid fa-eye"></i> Previewing</div>'
                         +   '<a class="pex-seo-link" href="' + seoHref + '" title="Full page for ' + (paper.shortTitle || paper.title) + '"'
                         +     ' onclick="event.stopPropagation()">'
                         +     '<i class="fa-solid fa-arrow-up-right-from-square"></i>'
                         +   '</a>'
                         + '</div>'
                         + '</div>';
                }).join('');

                grid.querySelectorAll('.pex-paper-card').forEach(function(card) {
                    card.addEventListener('click', function() {
                        var id = card.dataset.id;
                        var found = papers.filter(function(p) { return p.id === id; })[0];
                        if (found) selectPaper(found);
                    });
                });
            }

            /* ── Filter ── */
            function applyFilter() {
                var filtered = papers.slice();
                if (activeYear !== 'all') {
                    filtered = filtered.filter(function(p) { return p.year === activeYear; });
                }
                if (searchQuery) {
                    var q = searchQuery;
                    filtered = filtered.filter(function(p) {
                        return (p.title || '').toLowerCase().indexOf(q) !== -1
                            || (p.shortTitle || '').toLowerCase().indexOf(q) !== -1
                            || (p.year || '').indexOf(q) !== -1
                            || (p.shift || '').toLowerCase().indexOf(q) !== -1;
                    });
                }
                renderCards(filtered);
                var stillVisible = filtered.some(function(p) { return activePaper && p.id === activePaper.id; });
                if (filtered.length && !stillVisible) selectPaper(filtered[0]);
            }

            /* ── Tab listeners (bound on live DOM after tab build) ── */
            function bindTabs() {
                var tabs = document.querySelectorAll('#pex-tabs .pex-tab');
                tabs.forEach(function(tab) {
                    tab.addEventListener('click', function() {
                        tabs.forEach(function(t) { t.classList.remove('active'); });
                        tab.classList.add('active');
                        activeYear = tab.dataset.year;
                        applyFilter();
                    });
                });
            }
            bindTabs();

            /* ── Search listener ── */
            var searchInput = document.getElementById('pex-search');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    searchQuery = searchInput.value.toLowerCase().trim();
                    applyFilter();
                });
            }

            /* ── Init ── */
            renderCards(papers);
            if (papers.length) selectPaper(papers[0]);

            // Restore scroll position on browser back
            window.addEventListener('popstate', function(e) {
                if (e.state && e.state.paperId) {
                    var found = papers.filter(function(p) { return p.id === e.state.paperId; })[0];
                    if (found) selectPaper(found);
                }
            });
        }
    }

    // --- 11. RENDER PRACTICE TESTS ---
    function renderPracticeTests() {
        const grid = document.getElementById('practice-grid');
        if (!grid || !CONFIG.practiceTests) return;

        grid.innerHTML = CONFIG.practiceTests.map(test => `
            <div class="practice-card g-exam-reveal">
                <div class="practice-header">
                    <span class="difficulty-badge ${test.difficulty}">${test.difficulty}</span>
                </div>
                <h4>${test.title}</h4>
                <div class="practice-meta">
                    <span><i class="fa-regular fa-circle-question"></i> ${test.questions} Questions</span>
                    <span><i class="fa-regular fa-clock"></i> ${test.duration}</span>
                </div>
                <a href="${test.url || '#'}" class="btn-start-test">
                    <i class="fa-solid fa-play"></i> Start Test
                </a>
            </div>
        `).join('');
    }

    // --- 12. RENDER STUDY MATERIALS ---
    function renderMaterials() {
        const grid = document.getElementById('materials-grid');
        if (!grid || !CONFIG.studyMaterials) return;

        grid.innerHTML = CONFIG.studyMaterials.map(mat => `
            <div class="material-card g-exam-reveal">
                <div class="mat-icon"><i class="${mat.icon}"></i></div>
                <div class="mat-content">
                    <h4>${mat.title}</h4>
                    <p>${mat.description}</p>
                    <a href="${mat.url || '#'}" class="btn-download-mat">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                </div>
            </div>
        `).join('');
    }

    // --- 13. RENDER RELATED RESOURCES ---
    function renderResources() {
        const container = document.getElementById('resources-pills');
        if (!container || !CONFIG.relatedResources) return;

        container.innerHTML = CONFIG.relatedResources.map(res => `
            <a href="${res.url || '#'}" class="resource-pill">
                <i class="${res.icon}"></i> ${res.label}
            </a>
        `).join('');
    }

    // --- 14. RENDER FAQ ---
    function renderFAQ() {
        const container = document.getElementById('faq-accordion');
        if (!container || !CONFIG.faqs) return;

        const half = Math.ceil(CONFIG.faqs.length / 2);
        const col1 = CONFIG.faqs.slice(0, half);
        const col2 = CONFIG.faqs.slice(half);

        function renderColumn(items, startIdx) {
            return items.map((faq, i) => `
                <div class="faq-item">
                    <button class="faq-question">
                        <span class="faq-num">${String(startIdx + i + 1).padStart(2, '0')}</span>
                        <span class="faq-text">${faq.question}</span>
                        <div class="faq-toggle">
                            <div class="horizontal-line"></div>
                            <div class="vertical-line"></div>
                        </div>
                    </button>
                    <div class="faq-answer-wrapper">
                        <div class="faq-answer-inner">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        container.innerHTML = `
            <div class="faq-column">${renderColumn(col1, 0)}</div>
            <div class="faq-column">${renderColumn(col2, half)}</div>
        `;

    }

    // --- 15. STICKY NAVIGATION ---
    function initStickyNav() {
        const nav = document.getElementById('exam-sticky-nav');
        if (!nav) return;

        document.body.classList.add('has-sticky-nav');

        const links = nav.querySelectorAll('.esn-btn[href^="#"]');
        const sectionMap = [];

        links.forEach(link => {
            const id = link.getAttribute('href').substring(1);
            const section = document.getElementById(id);
            if (section) sectionMap.push({ link, section, id });
        });

        if (!sectionMap.length) return;

        let currentActiveId = null;
        let clickScrollTarget = null;
        let clickScrollTimer = null;

        // Apply active class with deduplication to prevent unnecessary DOM writes
        function setActive(id) {
            if (currentActiveId === id) return;
            currentActiveId = id;
            links.forEach(l => l.classList.remove('active'));
            const activeLink = nav.querySelector(`.esn-btn[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                // On mobile horizontal bar, scroll active item into view
                if (window.innerWidth <= 1024) {
                    const track = nav.querySelector('.esn-track');
                    const item = activeLink.closest('.esn-item');
                    if (track && item) {
                        const trackRect = track.getBoundingClientRect();
                        const itemRect = item.getBoundingClientRect();
                        const center = track.scrollLeft + (itemRect.left - trackRect.left) - (trackRect.width / 2) + (itemRect.width / 2);
                        track.scrollTo({ left: center, behavior: 'smooth' });
                    }
                }
            }
        }

        // Fallback: find the section whose center is nearest to viewport center
        function getActiveSectionByPosition() {
            const scrollY = window.scrollY;
            const viewportH = window.innerHeight;

            if (scrollY < 50) return sectionMap[0].id;
            if (scrollY + viewportH >= document.documentElement.scrollHeight - 80) {
                return sectionMap[sectionMap.length - 1].id;
            }

            const viewportMid = scrollY + viewportH * 0.5;
            let bestId = sectionMap[0].id;
            let bestDist = Infinity;

            sectionMap.forEach(({ section, id }) => {
                const sMid = section.offsetTop + section.offsetHeight * 0.5;
                const dist = Math.abs(viewportMid - sMid);
                if (dist < bestDist) { bestDist = dist; bestId = id; }
            });

            return bestId;
        }

        // Smooth scroll + ripple on click
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                const ripple = document.createElement('span');
                ripple.className = 'esn-ripple';
                link.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);

                const id = link.getAttribute('href').substring(1);
                const target = document.getElementById(id);

                // Set active immediately and lock observer overrides during smooth scroll
                setActive(id);
                clickScrollTarget = id;
                clearTimeout(clickScrollTimer);

                if (target) {
                    const offset = window.innerWidth <= 1024 ? 80 : 0;
                    const y = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    // Release lock after smooth scroll settles (~900ms)
                    clickScrollTimer = setTimeout(() => { clickScrollTarget = null; }, 900);
                }
            });
        });

        // Keyboard navigation (arrow keys between items)
        nav.addEventListener('keydown', (e) => {
            const btns = Array.from(links);
            const idx = btns.indexOf(document.activeElement);
            if (idx === -1) return;
            const isMobile = window.innerWidth <= 1024;
            const prev = isMobile ? 'ArrowLeft' : 'ArrowUp';
            const next = isMobile ? 'ArrowRight' : 'ArrowDown';
            if (e.key === prev && idx > 0) { e.preventDefault(); btns[idx - 1].focus(); }
            if (e.key === next && idx < btns.length - 1) { e.preventDefault(); btns[idx + 1].focus(); }
        });

        // Track intersection ratios for all observed sections simultaneously
        const visibleRatios = new Map();

        function resolveActiveSection() {
            if (clickScrollTarget) return;

            const scrollY = window.scrollY;
            const viewportH = window.innerHeight;

            // Edge: bottom of page → last section
            if (scrollY + viewportH >= document.documentElement.scrollHeight - 80) {
                setActive(sectionMap[sectionMap.length - 1].id);
                return;
            }

            if (visibleRatios.size === 0) {
                setActive(getActiveSectionByPosition());
                return;
            }

            // Among visible sections score by: intersection ratio (primary) and
            // how close the section center is to the viewport center (secondary).
            // Scoring in sectionMap order preserves document order as a tiebreaker.
            const viewportCenter = viewportH * 0.5;
            let bestId = null;
            let bestScore = -Infinity;

            sectionMap.forEach(({ section, id }) => {
                if (!visibleRatios.has(id)) return;
                const ratio = visibleRatios.get(id);
                const rect = section.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height * 0.5;
                const distFromCenter = Math.abs(sectionCenter - viewportCenter);
                // Higher ratio and closer to viewport center wins
                const score = ratio * 100 - distFromCenter * 0.05;
                if (score > bestScore) { bestScore = score; bestId = id; }
            });

            if (bestId) setActive(bestId);
        }

        // Multiple thresholds give smooth ratio updates for accurate scoring
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    visibleRatios.set(entry.target.id, entry.intersectionRatio);
                } else {
                    visibleRatios.delete(entry.target.id);
                }
            });
            resolveActiveSection();
        }, {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        });

        sectionMap.forEach(({ section }) => observer.observe(section));

        // Activate first section immediately on page load
        setActive(sectionMap[0].id);

        // Hide nav while hero is visible
        const hero = document.querySelector('.course-hero-section');
        if (hero) {
            const heroObserver = new IntersectionObserver(([entry]) => {
                nav.classList.toggle('is-hidden', entry.isIntersecting);
            }, { threshold: 0.3 });
            heroObserver.observe(hero);
        }

        // Unified scroll handler: bottom-edge detection + hide-on-scroll-down
        let lastScrollY = window.scrollY;
        let rafId = null;

        window.addEventListener('scroll', () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                const currentY = window.scrollY;

                // Bottom-of-page: guarantee last section stays active
                if (!clickScrollTarget && currentY + window.innerHeight >= document.documentElement.scrollHeight - 80) {
                    setActive(sectionMap[sectionMap.length - 1].id);
                }

                // Hide nav on scroll-down, reveal on scroll-up
                if (currentY > 150) {
                    nav.classList.toggle('esn-scrolled-down', currentY > lastScrollY + 6);
                } else {
                    nav.classList.remove('esn-scrolled-down');
                }
                lastScrollY = currentY;
                rafId = null;
            });
        }, { passive: true });

        // Mobile: tap to show tooltip briefly
        nav.querySelectorAll('.esn-item').forEach(item => {
            item.addEventListener('touchstart', () => {
                nav.querySelectorAll('.esn-item').forEach(i => i.classList.remove('esn-tapped'));
                item.classList.add('esn-tapped');
                setTimeout(() => item.classList.remove('esn-tapped'), 2000);
            }, { passive: true });
        });
    }

    // --- 16. GSAP SCROLL ANIMATIONS ---
    function initAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Reveal all elements with g-exam-reveal class
        gsap.utils.toArray('.g-exam-reveal').forEach(el => {
            gsap.from(el, {
                y: 40,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // --- INITIALIZE ALL ---
    // Renders are isolated too: a bad CONFIG section won't block later steps.
    [
        renderSnapshot, renderAbout, renderEligibility, initEligibilityChecker,
        renderAgeRelaxation, renderSyllabus, renderPreparation, renderProcess,
        renderWhyEduooz, renderPapers, renderPracticeTests, renderMaterials,
        renderResources, renderFAQ, initFaqAccordion, initStickyNav,
        initSyllabusTabs, initPrepareAccordion
    ].forEach(fn => {
        try { fn(); }
        catch (e) { console.warn('[Render Init] ' + fn.name + ' failed:', e); }
    });

    // --- PREMIUM INTERACTIONS ---
    // Each init is isolated: one failure cannot cascade to the next.
    [
        initWhyShowcase,
        initAgeExplorer,
        initVerticalCarousels,
        initJourneyTimeline,
        initFacultyCarousel,
        initReviewCounters,
        initReviewCarousel,
        initMockTestSystem
    ].forEach(fn => {
        try { fn(); }
        catch (e) { console.warn('[Carousel Init] ' + fn.name + ' failed:', e); }
    });

    // Delay animations to let DOM render
    setTimeout(() => { try { initAnimations(); } catch(e) { console.warn('[Init] initAnimations failed:', e); } }, 100);
});

// ===========================================
// WHY EDUOOZ — Rotating Feature Showcase
// Slides between two sets of why-cards with
// CSS-driven progress-bar dots and auto-advance.
// ===========================================
function initWhyShowcase() {
    const wrapper = document.getElementById('why-showcase');
    if (!wrapper) return;

    const slides = Array.from(wrapper.querySelectorAll('.why-showcase-slide'));
    const dots   = Array.from(wrapper.querySelectorAll('.progress-dot'));
    if (slides.length < 2) return;

    let current  = 0;
    let timer    = null;
    const DELAY  = 4500; // must match CSS @keyframes progress-fill duration

    function goTo(idx) {
        const prev = current;
        current = ((idx % slides.length) + slides.length) % slides.length;
        if (prev === current) return;

        // Exit old slide with left-slide animation
        slides[prev].classList.add('exit-left');
        slides[prev].classList.remove('active');
        setTimeout(() => slides[prev].classList.remove('exit-left'), 700);

        // Activate incoming slide
        slides[current].classList.add('active');

        // Restart dot progress animation: remove then force reflow then re-add
        dots.forEach((d, i) => {
            d.classList.remove('active');
            if (i === current) {
                void d.offsetWidth; // flush so CSS animation restarts
                d.classList.add('active');
            }
        });
    }

    function next() { goTo(current + 1); }

    function startAuto() {
        clearInterval(timer);
        timer = setInterval(next, DELAY);
    }

    // Dot clicks
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
    });

    // Touch swipe
    let touchStartX = 0;
    wrapper.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        clearInterval(timer);
    }, { passive: true });
    wrapper.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) dx < 0 ? next() : goTo(current - 1);
        startAuto();
    }, { passive: true });

    // Hover pause (CSS pauses the ::after fill animation; JS pauses the interval)
    wrapper.addEventListener('mouseenter', () => clearInterval(timer));
    wrapper.addEventListener('mouseleave', startAuto);

    // Ensure clean initial state
    slides.forEach((s, i) => { s.classList.toggle('active', i === 0); s.classList.remove('exit-left'); });
    dots.forEach((d, i)   => d.classList.toggle('active', i === 0));

    startAuto();
}

// --- FACULTY SHOWCASE CAROUSEL ---
function initFacultyCarousel() {
    const stage = document.getElementById('fac-car-stage');
    const track = document.getElementById('fac-car-track');
    const prevBtn = document.getElementById('fac-car-prev');
    const nextBtn = document.getElementById('fac-car-next');
    const dotsEl = document.getElementById('fac-car-dots');
    if (!track || !stage) return;

    const cards = Array.from(track.querySelectorAll('.fac-car-card'));
    if (cards.length === 0) return;

    const GAP = 28;
    let current = 0;
    let autoTimer = null;
    let isPaused = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragCurrentX = 0;

    // Animated counters
    function animateCounters(card) {
        card.querySelectorAll('[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count);
            if (el.dataset.counted) { el.textContent = target.toLocaleString() + '+'; return; }
            el.dataset.counted = '1';
            const duration = 1400;
            const start = performance.now();
            (function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = Math.round(target * ease);
                el.textContent = val.toLocaleString() + '+';
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });
    }

    function getCardWidth() {
        const sw = stage.offsetWidth;
        if (window.innerWidth <= 600) return sw * 0.88;
        if (window.innerWidth <= 900) return sw * 0.65;
        return sw * 0.34;
    }

    function update() {
        const cardW = getCardWidth();
        const sw = stage.offsetWidth;
        const offset = (sw - cardW) / 2 - current * (cardW + GAP);
        cards.forEach(c => { c.style.width = cardW + 'px'; });
        track.style.transform = `translateX(${offset}px)`;
        cards.forEach((c, i) => {
            c.classList.remove('fac-car-active', 'fac-car-nearby');
            if (i === current) {
                c.classList.add('fac-car-active');
                animateCounters(c);
            } else if (Math.abs(i - current) === 1 || (current === 0 && i === cards.length - 1) || (current === cards.length - 1 && i === 0)) {
                c.classList.add('fac-car-nearby');
            }
        });
        if (dotsEl) {
            Array.from(dotsEl.querySelectorAll('.fac-car-dot')).forEach((d, i) => {
                d.classList.toggle('fac-car-dot-active', i === current);
            });
        }
    }

    function goTo(idx) {
        current = ((idx % cards.length) + cards.length) % cards.length;
        update();
    }

    function buildDots() {
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        cards.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.className = 'fac-car-dot' + (i === 0 ? ' fac-car-dot-active' : '');
            btn.setAttribute('aria-label', `Go to faculty ${i + 1}`);
            btn.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotsEl.appendChild(btn);
        });
    }

    function resetAuto() {
        clearInterval(autoTimer);
        if (!isPaused) {
            autoTimer = setInterval(() => goTo(current + 1), 4000);
        }
    }

    // Arrow buttons
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Pause on hover
    const root = document.querySelector('.fac-car-root');
    if (root) {
        root.addEventListener('mouseenter', () => { isPaused = true; clearInterval(autoTimer); });
        root.addEventListener('mouseleave', () => { isPaused = false; resetAuto(); });
    }

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 44) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });

    // Mouse drag
    track.addEventListener('mousedown', e => {
        isDragging = true;
        dragStartX = e.clientX;
        track.style.cursor = 'grabbing';
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        dragCurrentX = e.clientX;
    });
    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        track.style.cursor = '';
        const diff = dragStartX - dragCurrentX;
        if (Math.abs(diff) > 50) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    });

    // Click to focus card
    cards.forEach((card, i) => {
        card.addEventListener('click', () => { if (i !== current) { goTo(i); resetAuto(); } });
    });

    // Keyboard navigation
    const section = document.querySelector('.fac-showcase-section');
    if (section) {
        section.setAttribute('tabindex', '0');
        section.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); resetAuto(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); resetAuto(); }
        });
    }

    // Mouse wheel
    if (stage) {
        stage.addEventListener('wheel', e => {
            e.preventDefault();
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                e.deltaX > 0 ? goTo(current + 1) : goTo(current - 1);
            } else {
                e.deltaY > 0 ? goTo(current + 1) : goTo(current - 1);
            }
            resetAuto();
        }, { passive: false });
    }

    // Floating particles
    const particlesEl = document.getElementById('fac-particles');
    if (particlesEl) {
        for (let i = 0; i < 20; i++) {
            const dot = document.createElement('div');
            const size = 3 + Math.random() * 4;
            dot.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                border-radius:50%;
                background:rgba(6,182,212,${0.08 + Math.random()*0.12});
                left:${Math.random()*100}%;
                top:${Math.random()*100}%;
                animation: fac-float-particle ${8 + Math.random()*12}s ease-in-out ${Math.random()*5}s infinite;
            `;
            particlesEl.appendChild(dot);
        }
    }

    window.addEventListener('resize', update, { passive: true });

    buildDots();
    goTo(0);
    resetAuto();
}

// --- FAQ ACCORDION ---
function initFaqAccordion() {
    const container = document.getElementById('faq-accordion');
    if (!container) return;

    container.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            if (!item) return;
            const isActive = item.classList.contains('active');

            // Close all open items and remove wrapper dimming
            container.querySelectorAll('.faq-item.active').forEach(open => open.classList.remove('active'));
            container.classList.remove('has-active');

            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
                container.classList.add('has-active');
            }
        });
    });
}

// --- GOOGLE REVIEWS COUNTERS ---
function initReviewCounters() {
    const bar = document.getElementById('greview-stats-bar');
    if (!bar) return;

    const counters = bar.querySelectorAll('.greview-count[data-target]');
    if (!counters.length) return;

    let triggered = false;
    const observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || triggered) return;
        triggered = true;

        counters.forEach(el => {
            const target = parseFloat(el.dataset.target);
            const suffix = el.dataset.suffix || '';
            const isDecimal = target % 1 !== 0;
            const duration = 1600;
            const start = performance.now();

            (function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 3);
                const val = target * ease;
                el.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            })(start);
        });

        observer.disconnect();
    }, { threshold: 0.4 });

    observer.observe(bar);
}

// --- GOOGLE REVIEWS CAROUSEL ---
function initReviewCarousel() {
    const viewport = document.getElementById('greview-carousel-viewport');
    const track    = document.getElementById('greview-track');
    const prevBtn  = document.getElementById('greview-prev');
    const nextBtn  = document.getElementById('greview-next');
    const dotsEl   = document.getElementById('greview-dots');

    if (!track || !viewport) return;

    const cards = Array.from(track.querySelectorAll('.greview-card'));
    const GAP   = 18; // matches CSS gap
    let current = 0;
    let autoTimer = null;

    function getVisible() {
        const w = window.innerWidth;
        if (w <= 480) return 1;
        if (w <= 768) return 2;
        return 3;
    }

    function getMax() {
        return Math.max(0, cards.length - getVisible());
    }

    function setWidths() {
        const visible = getVisible();
        const vpW = viewport.offsetWidth;
        const cardW = (vpW - GAP * (visible - 1)) / visible;
        cards.forEach(c => { c.style.width = cardW + 'px'; c.style.flexShrink = '0'; });
    }

    function buildDots() {
        const max = getMax();
        dotsEl.innerHTML = '';
        for (let i = 0; i <= max; i++) {
            const btn = document.createElement('button');
            btn.className = 'greview-dot' + (i === current ? ' greview-dot-active' : '');
            btn.setAttribute('aria-label', `Go to review ${i + 1}`);
            btn.addEventListener('click', () => { goTo(i); resetAuto(); });
            dotsEl.appendChild(btn);
        }
    }

    function updateDots() {
        Array.from(dotsEl.querySelectorAll('.greview-dot')).forEach((d, i) => {
            d.classList.toggle('greview-dot-active', i === current);
        });
    }

    function goTo(idx) {
        current = Math.max(0, Math.min(idx, getMax()));

        const visible = getVisible();
        const vpW = viewport.offsetWidth;
        const cardW = (vpW - GAP * (visible - 1)) / visible;
        track.style.transform = `translateX(-${current * (cardW + GAP)}px)`;

        prevBtn.disabled = current === 0;
        nextBtn.disabled = current >= getMax();

        updateDots();
    }

    function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => {
            goTo(current >= getMax() ? 0 : current + 1);
        }, 5000);
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    // Pause auto on hover
    const wrap = document.getElementById('greview-carousel-wrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => clearInterval(autoTimer));
        wrap.addEventListener('mouseleave', resetAuto);
        wrap.addEventListener('focusin',    () => clearInterval(autoTimer));
        wrap.addEventListener('focusout',   resetAuto);
    }

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend',   e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 44) { goTo(current + (diff > 0 ? 1 : -1)); resetAuto(); }
    }, { passive: true });

    // Keyboard on focused arrows
    [prevBtn, nextBtn].forEach(btn => {
        btn.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
            if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
        });
    });

    // Resize
    window.addEventListener('resize', () => {
        setWidths();
        buildDots();
        goTo(Math.min(current, getMax()));
    }, { passive: true });

    // Init
    setWidths();
    buildDots();
    goTo(0);
    resetAuto();
}

// ===========================================
// MOCK TEST SYSTEM
// ===========================================
function initMockTestSystem() {
    const wrapper = document.getElementById('mts-wrapper');
    if (!wrapper) return;

    // ── Question Bank ──────────────────────────────────────────
        const CATEGORIES = [
      {
        name: 'Cardiology', icon: 'fa-heart-pulse', color: '#ef4444',
        sections: [
          {
            name: 'Cardiology I',
            questions: [
              { q:'What is the typical distribution of the heart relative to the sternum?', opts:['Equal distribution (50% left, 50% right)','Three-fourths left, one-fourth right','Two-thirds left, one-third right','Entirely within the left side'], ans:2, exp:'The heart is described as having 2/3 part in the left, 1/3 right of the sternum.' },
              { q:'Which layer of the heart wall is responsible for the pumping action and comprises ~95% of the total heart wall?', opts:['Endocardium','Epicardium','Fibrous Pericardium','Myocardium'], ans:3, exp:'The Myocardium is the thickest layer (~95% of the heart wall) responsible for the pumping action.' },
              { q:'The apex (inferior pointed end) of the heart is formed by the tip of which chamber?', opts:['Right Atrium (RA)','Right Ventricle (RV)','Left Atrium (LA)','Left Ventricle (LV)'], ans:3, exp:'The apex is the pointed end of the heart inferiorly and is formed by the tip of the Left Ventricle.' },
              { q:'For a normal adult, the estimated Cardiac Output (CO) is:', opts:['3 L/min','5 L/min','7 L/min','10 L/min'], ans:1, exp:'Cardiac output (CO) is specified as 5 L/min.' },
              { q:"The outermost layer of the heart's fibrous covering (Fibrous Pericardium) is characterized as being:", opts:['Thin, elastic, and smooth serous membrane','Muscular tissue primarily responsible for contraction','Superficial, tough, inelastic, dense, irregular connective tissue layer','Made up of squamous epithelium'], ans:2, exp:'The Fibrous Pericardium is described as a superficial, tough, inelastic, dense, irregular connective tissue layer.' },
              { q:'The embryological development of the heart begins and is completed during:', opts:['Begins 1st week, completed 4th week','Starts 3rd week, completed 9th week','Starts 4th week, completed 12th week','Begins 9th week, continues until birth'], ans:1, exp:'Development of the heart starts during the 3rd week of gestation and is completed by the 9th week.' },
              { q:'The superior portion of the heart (Base) is anatomically situated at which ICS?', opts:['Left 5th ICS','2nd ICS','4th ICS','6th ICS'], ans:1, exp:'The superior portion of the heart, the Base, is situated in the 2nd ICS.' },
              { q:'The innermost layer of the heart wall, which provides a smooth lining for the chambers, is the:', opts:['Myocardium','Epicardium','Parietal Pericardium','Endocardium'], ans:3, exp:'The Endocardium is the innermost layer of the heart wall and provides a smooth lining for the chambers.' },
              { q:'The Serous Pericardium (inner double-layered covering) is subdivided into the:', opts:['Fibrous and Parietal layers','Parietal and Visceral layers','Myocardial and Epicardial layers','Endocardial and Visceral layers'], ans:1, exp:'The Serous Pericardium consists of an Outer layer (Parietal) and an Inner layer (Visceral pericardium).' },
              { q:'A major function of the pericardial fluid in the pericardial cavity is:', opts:['To supply oxygen to the myocardium','To initiate the electrical conduction system','To reduce friction between membranes during contraction','To attach the heart to the diaphragm'], ans:2, exp:'The pericardial cavity is filled with serous fluid, which reduces friction between membranes during contraction of the heart.' },
              { q:'Which embryonic heart structure develops into the Ascending Aorta and Pulmonary Trunk?', opts:['Bulbus cordis','Primitive ventricle','Primitive atrium','Truncus arteriosus'], ans:3, exp:'The Truncus arteriosus develops into the Ascending aorta and pulmonary trunk.' },
              { q:'A condition where the heart is located on the right side of the thoracic cavity is termed:', opts:['Levocardia','Dextrocardia','Mesocardia','Cardiac Tamponade'], ans:1, exp:'The condition where the Heart is on the right side of the thoracic cavity is called Dextrocardia.' },
              { q:'Excessive secretion of pericardial fluid and blood leads to:', opts:['Endocarditis and Myocarditis','Cardiac tamponade and Pericardial effusion','Dextrocardia and Levocardia','VSD and Tetralogy of Fallot'], ans:1, exp:'Excessive secretion of pericardial fluid and blood leads to cardiac tamponade and pericardial effusion.' },
              { q:'Which borders of the heart are formed primarily by the Left Ventricle (LV)?', opts:['Right border and Superior border','Inferior border only','Left border and partly the Inferior border','Superior border only'], ans:2, exp:'The Left border is formed by the LV (partly by the LA); the Inferior border is mainly by RV and partly by LV.' },
              { q:'The Infundibulum (conus arteriosus) is a conical pouch from the upper and left angle of RV from which the ___ arises.', opts:['Aorta','Pulmonary veins','Pulmonary trunk','Coronary sinus'], ans:2, exp:'The Infundibulum (conus arteriosus) is formed from the upper and left angle of RV from which the pulmonary trunk arises.' },
              { q:'The Apex is at the left 5th ICS. What is its position relative to the median plane?', opts:['1â€“3 cm from the median plane','Medial to the sternal margin','Medial to the midclavicular line (7â€“9 cm from the median plane)','Lateral to the anterior axillary line'], ans:2, exp:'The apex is situated at the left 5th ICS, medial to the midclavicular line (7â€“9 cm from the median plane).' },
              { q:'Defects in the development of the infundibulum are associated with which congenital heart defect?', opts:['Ventricular Septal Defect (VSD)','Atrial Septal Defect (ASD)','Tetralogy of Fallot (TOF)','Patent Ductus Arteriosus (PDA)'], ans:2, exp:'Defects in infundibulum development can result in Tetralogy of Fallot (TOF).' },
              { q:'The procedure used to remove excess pericardial fluid from the pericardial cavity is known as:', opts:['Cardiac catheterization','Angiography','Cardioversion','Pericardiocentesis'], ans:3, exp:'Removing excess pericardial fluid from the pericardial cavity is called Pericardiocentesis.' },
              { q:'The Visceral pericardium (inner layer of Serous Pericardium) is continuous with which layer of the heart wall?', opts:['Myocardium','Endocardium','Epicardium','Fibrous pericardium'], ans:2, exp:'The Epicardium is the outermost layer of the heart wall and is another name for the visceral layer of pericardium.' },
              { q:'The heart valves (Aortic, Pulmonary, Tricuspid, Mitral) originate embryologically from which structure?', opts:['Truncus arteriosus','Bulbus cordis','Primitive ventricle','Endocardial cushions'], ans:3, exp:'The Endocardial cushions develop into the Aortic, pulmonary, tricuspid, and mitral valves.' },
              { q:'In adult females, the approximate weight of the heart is:', opts:['300 gm','250 gm','Size reference (12 Ã— 9 Ã— 6 cm)','Output reference (5 L/min)'], ans:1, exp:'The weight of the heart in females is 250 gm.' },
              { q:'The term "conus arteriosus" refers to the _____ structure, while "infundibulum" refers to the internal structure.', opts:['Muscular','Fibrous','External','Visceral'], ans:2, exp:'The infundibulum refers to the internal structure, whereas the conus arteriosus refers to the external structure.' },
              { q:'The superior broad part of the heart (Base) is anatomically formed by which chamber?', opts:['Right Atrium (RA)','Right Ventricle (RV)','Left Atrium (LA)','Left Ventricle (LV)'], ans:2, exp:'The Base of the heart is the posterior surface and is formed by the Left Atrium (LA).' },
              { q:'Which embryonic heart structure gives rise to the trabeculated portions of the Right and Left Ventricles?', opts:['Bulbus cordis','Primitive atrium','Truncus arteriosus','Primitive ventricle'], ans:3, exp:'The Primitive ventricle develops into the Trabeculated RV and LV.' },
              { q:'For pericardiocentesis, the nurse should anticipate placing the needle at which insertion site?', opts:['2nd ICS, right sternal border','Midclavicular line, 5th ICS','5th ICS near the sternal margin','Subxiphoid area only'], ans:2, exp:'The needle insertion site for pericardiocentesis is the 5th ICS near the sternal margin. Patient position: supine with HOB elevated 30â€“60 degrees.' }
            ]
          },
          {
            name: 'Cardiology II',
            questions: [
              { q:'The primary natural pacemaker (SA node) normally generates electrical impulses at what rate?', opts:['40â€“60 times/min','20â€“40 times/min','60â€“100 times/min','1â€“5 times/min'], ans:2, exp:'The SA node, the main natural pacemaker of the heart, generates electrical impulses at 60â€“100 times per minute.' },
              { q:'If the SA node fails, the AV node can sustain a heart rate of approximately:', opts:['60â€“100 bpm','40â€“60 bpm','20â€“40 bpm','10â€“20 bpm'], ans:1, exp:'If the SA node fails, the AV node can take over and initiate a heart rate of 40â€“60 bpm.' },
              { q:'Which component forms the last part of the conduction system and acts as tertiary pacemaker with the slowest intrinsic rate?', opts:['SA node','AV node','Bundle of His','Purkinje fibers'], ans:3, exp:'The Purkinje fibers form the last part of the conduction system and sustain a rate of 20â€“40 bpm if both SA and AV nodes fail.' },
              { q:'The conduction velocity of the Atrioventricular (AV) node is approximately:', opts:['4 m/sec','1 m/sec','0.05 m/sec','10 m/sec'], ans:2, exp:'The conduction velocity of the AV node is about 0.05 m/sec.' },
              { q:'What is the speed of electrical impulse conduction through the Purkinje fibers?', opts:['0.05 m/sec','1 m/sec','2 m/sec','About 4 m/sec'], ans:3, exp:'Purkinje fibers conduct impulses at about 4 m/sec, enabling simultaneous spread to both ventricles.' },
              { q:'The primary significance of the "AV nodal delay" is to:', opts:['Increase force of ventricular contraction','Allow time for repolarization of the AV node','Provide time for emptying of blood from atria into ventricles','Speed up impulse transmission to the Bundle of His'], ans:2, exp:'The AV nodal delay ensures time for atrial contraction to complete before ventricular contraction begins, allowing effective pumping.' },
              { q:'Which autonomic nervous system intervention shortens the AV nodal delay?', opts:['Vagal stimulation','Cholinergic stimulation','Sympathetic stimulation','Parasympathetic stimulation'], ans:2, exp:'AV nodal delay is shortened by sympathetic stimulation. Parasympathetic (vagal) stimulation lengthens the delay.' },
              { q:'Which anatomical structure is the only conducting pathway between the atria and the ventricles?', opts:['SA node','Purkinje fibers','Internodal fibers','Atrioventricular (AV) node'], ans:3, exp:'The AV node is the only conducting pathway located between the atria and the ventricles.' },
              { q:'The Bundle of His prevents which specific electrical flow phenomenon?', opts:['Accelerated conduction','Delayed conduction','Antidromic conduction','Retrograde conduction of impulses back into the atria'], ans:3, exp:'The AV bundle (Bundle of His) does not permit retrograde conduction of impulses back into the atria.' },
              { q:'Which three bands are primarily included in the internodal fibers connecting the SA node to the AV node?', opts:['Right, Middle, and Left tracts','Anterior Wenckebach, Middle Thorel, Posterior Bachman','Anterior internodal tract of Bachman, Middle of Wenckebach, Posterior of Thorel','Right bundle branch, Left bundle branch, and Bundle of His'], ans:2, exp:'The internodal fibers include: Anterior internodal tract of Bachman, Middle internodal tract of Wenckebach, and Posterior internodal tract of Thorel.' },
              { q:'Which pathway correctly represents the normal sequence of electrical impulse conduction through the heart?', opts:['AV node â†’ Bundle branches â†’ Bundle of His â†’ SA node â†’ Purkinje','SA node â†’ Bundle of His â†’ Bundle branches â†’ AV node â†’ Purkinje','SA node â†’ AV node â†’ Bundle of His â†’ Bundle branches â†’ Purkinje fibers','AV node â†’ AV bundle â†’ SA node â†’ Purkinje â†’ Bundle branches'], ans:2, exp:'The correct pathway: SA node â†’ AV node â†’ Bundle of His â†’ Bundle branches â†’ Purkinje fibers.' },
              { q:'Oxygenated blood first enters into which chamber of the heart?', opts:['Right ventricle','Right atrium','Pulmonary artery','Left atrium'], ans:3, exp:'Oxygenated blood first enters into the Left atrium (from pulmonary veins).' },
              { q:'Which chamber is primarily responsible for ejecting oxygenated blood into the systemic circulation?', opts:['Right atrium','Right ventricle','Left atrium','Left ventricle'], ans:3, exp:'The Left ventricle ejects oxygenated blood into the general (systemic) circulation.' },
              { q:'The total number of chambers in the human heart is:', opts:['4','1','3','2'], ans:0, exp:'The human heart contains a total of 4 chambers.' },
              { q:'Which valve is located between the right atrium and the right ventricle?', opts:['Mitral valve','Bicuspid valve','Aortic valve','Tricuspid valve'], ans:3, exp:'The Tricuspid valve is located between the right atrium and the right ventricle.' },
              { q:'The valve that prevents the backward flow of blood into the left atrium is the:', opts:['Tricuspid valve','Aortic valve','Pulmonary valve','Mitral valve'], ans:3, exp:'The Mitral valve (Bicuspid valve) prevents the backward flow of blood into the left atrium.' },
              { q:'The innermost layer of the heart is known as the:', opts:['Epicardium','Pericardium','Myocardium','Endocardium'], ans:3, exp:'The innermost layer of the heart is the Endocardium.' },
              { q:'The apical impulse of the heart is normally felt at which intercostal space (ICS)?', opts:['Right 2nd ICS','Left 2nd ICS','Right 5th ICS','Left 5th ICS'], ans:3, exp:'The apical impulse of the heart is normally felt at the Left 5th ICS.' },
              { q:'Cardiac muscle differs significantly from skeletal muscle primarily due to which unique characteristic?', opts:['It contains actin and myosin','It requires calcium for contraction','It has automaticity and conductivity','It thrives without oxygen'], ans:2, exp:'Cardiac muscle differs from skeletal muscle because it possesses automaticity and conductivity.' },
              { q:'The heart receives oxygen and nutrients via two main coronary arteries, which are the first branches of the:', opts:['Pulmonary artery','Superior Vena Cava','Pulmonary vein','Aorta'], ans:3, exp:'The right and left coronary arteries are the first branches of the aorta.' },
              { q:'The Left Main Coronary Artery (LCA) typically branches into the:', opts:['Posterior descending artery and Right marginal artery','Left Anterior Descending (LAD) and Circumflex artery','Conus branch and Posterior descending artery','Right coronary artery and Circumflex artery'], ans:1, exp:'The Left Main Coronary Artery divides into: LAD and Circumflex artery.' },
              { q:'The Right Main Coronary Artery (RCA) supplies all of the following EXCEPT the:', opts:['Right atrium','Right ventricle','Inferior portion of the LV','Lateral portion of the LV'], ans:3, exp:'The RCA supplies the right atrium, right ventricle, inferior LV, posterior septal wall, SA/AV nodes. The Circumflex artery supplies the lateral and posterior LV.' },
              { q:'Which area is supplied by the Left Anterior Descending (LAD) artery?', opts:['Left atrium','Posterior septal wall','Lateral and posterior surface of the LV','Anterior ventricular septum'], ans:3, exp:'The LAD supplies the anterior wall of the LV, the anterior ventricular septum, and the apex of the LV.' },
              { q:'Which specific branch of the Left Coronary Artery provides blood to the left atrium?', opts:['Left anterior descending (LAD)','Posterior descending artery (PDA)','Right coronary artery (RCA)','Circumflex artery'], ans:3, exp:'The Circumflex artery supplies blood to the Left Atrium (LA).' },
              { q:'The arteries are called "coronary" because they:', opts:['Run alongside the superior vena cava','Are the largest arteries in the body','Supply the cardiac apex','Encircle the base of the ventricles somewhat like a crown'], ans:3, exp:'The arteries are called "coronary" because they encircle the base of the ventricles, resembling a crown.' }
            ]
          },
          {
            name: 'Cardiology III',
            questions: [
              { q:'What physiological event marks the beginning of ventricular systole and produces the first heart sound (S1)?', opts:['Closure of the semilunar valves','Ventricular filling','Opening of the AV valves','Closure of the atrioventricular (AV) valves'], ans:3, exp:'The First heart sound (S1), known as "Lub," is heard as the atrioventricular valves close at the beginning of ventricular systole.' },
              { q:'Where is the first heart sound (S1) typically heard loudest during cardiac auscultation?', opts:['Base of the heart','Erb\'s point','Pulmonary area','Apex of the heart'], ans:3, exp:'S1 is heard loudest at the apex of the heart.' },
              { q:'The second heart sound (S2), or "Dub," is caused by the closure of which valves?', opts:['Tricuspid and Mitral valves','Semilunar valves','Aortic and Tricuspid valves','Mitral and Pulmonary valves'], ans:1, exp:'S2 is heard when the semilunar valves close at the beginning of ventricular diastole.' },
              { q:'The third heart sound (S3), also called a ventricular gallop, occurs due to:', opts:['Produced during atrial systole','Increased resistance during valve opening','Closure of the semilunar valves','The rushing of blood during ventricular filling'], ans:3, exp:'The Third heart sound (S3) occurs due to the rushing of blood during ventricular filling.' },
              { q:'The presence of the third heart sound (S3) is considered a normal finding in which population?', opts:['Individuals over 60 years old','Patients with heart failure','Patients with valvular regurgitation','Individuals less than 30 years old'], ans:3, exp:'S3 is normal in individuals younger than 30 years.' },
              { q:'Which term describes the condition when S3 is audible, giving the rhythm resemblance to the gallop of a horse?', opts:['Sinus rhythm','Sinus tachycardia','Gallop rhythm or triple rhythm','Pathological murmur'], ans:2, exp:'If S3 is audible, the rhythm resembles the gentle gallop of a horse and is called gallop rhythm or triple sound.' },
              { q:'The Fourth heart sound (S4) is produced during atrial systole if what condition is present?', opts:['Decrease in ventricular wall compliance','Decreased heart rate','Resistance to ventricular filling','Closure of AV valves'], ans:2, exp:'S4 is produced during atrial systole if resistance to ventricular filling is present.' },
              { q:'Which area of cardiac auscultation is described as the Left 5th ICS below the nipple at the Left midclavicular line?', opts:['Tricuspid valve area','Aortic valve area','Erb\'s point','Mitral valve area'], ans:3, exp:'The Mitral valve is auscultated at the Left 5th ICS below the nipple, Left midclavicular line.' },
              { q:'For a normal heart rate of 72 bpm, what is the approximate total duration of the cardiac cycle?', opts:['0.1 seconds','0.3 seconds','0.8 seconds','1.0 second'], ans:2, exp:'When the heart rate is 72 bpm, the duration of each cardiac cycle is about 0.8 seconds.' },
              { q:'In the cardiac cycle, the term "Systole" refers to:', opts:['Relaxation','Filling','Contraction','Repolarization'], ans:2, exp:'Systole refers to contraction.' },
              { q:'During a 0.8 second cardiac cycle, what is the specified duration of ventricular systole?', opts:['0.1 sec','0.5 sec','0.7 sec','0.3 sec'], ans:3, exp:'The duration of ventricular systole is 0.3 seconds.' },
              { q:'During a 0.8 second cardiac cycle, the duration of atrial diastole is:', opts:['0.1 sec','0.3 sec','0.5 sec','0.7 sec'], ans:3, exp:'The duration of atrial diastole is 0.7 seconds.' },
              { q:'What is the approximate Cardiac Output (CO) for an average adult at rest?', opts:['70 ml (stroke volume)','72 bpm (heart rate)','300â€“400 L/min','5 L/min'], ans:3, exp:'For an average adult at rest, CO is approximately 5 L/min.' },
              { q:'Cardiac Output (CO) is calculated using which relationship?', opts:['CO = SBP âˆ’ DBP','CO = CI / BSA','CO = SV Ã— HR','CO = Apical pulse âˆ’ Radial pulse'], ans:2, exp:'Cardiac output is calculated by multiplying stroke volume (SV) and heart rate (HR): CO = SV Ã— HR.' },
              { q:'What is the normal stroke volume (SV), defined as the amount of blood pumped per heartbeat?', opts:['5 L/min','120 ml','70 ml','40 mmHg'], ans:2, exp:'Normal stroke volume is 70 ml.' },
              { q:'Which organ receives the largest percentage of cardiac output (CO) at rest (30%)?', opts:['Kidney','Brain','Skeletal muscles','Liver'], ans:3, exp:'The Liver receives 30% of the distribution of CO, which is the maximum percentage listed.' },
              { q:'What is the normal cardiac reserve (maximum increase in CO above normal) in a young adult?', opts:['500â€“600%','5 L/min','300â€“400%','2.8 L/mÂ²/min'], ans:2, exp:'Normal cardiac reserve in a young adult is 300â€“400%.' },
              { q:'What is the formula used to determine the Cardiac Index (CI)?', opts:['CI = SBP / DBP','CI = CO / BSA','CI = SV Ã— HR','CI = HR / BSA'], ans:1, exp:'Cardiac Index (CI) is calculated as CO/BSA (body surface area).' },
              { q:'A heart rate greater than 100 bpm is defined as:', opts:['Normal sinus rhythm','Sinus bradycardia','Sinus tachycardia','Ventricular gallop'], ans:2, exp:'Sinus tachycardia is defined as a heart rate greater than 100 bpm.' },
              { q:'Stimulation of sympathetic nerve fibers leads to the release of which neurotransmitter?', opts:['Acetylcholine','Serotonin','Dopamine','Norepinephrine'], ans:3, exp:'Stimulation of sympathetic nerve fibers releases the neurotransmitter norepinephrine.' },
              { q:'Stimulation of sympathetic nerve fibers causes which cardiovascular effect?', opts:['Decreased heart rate','Lessened ventricular contractility','Increased conduction speed through the AV node','Occurs when an increase in BP is detected'], ans:2, exp:'Sympathetic nerve stimulation causes increased conduction speed through the AV node, increased heart rate, and increased contractility.' },
              { q:'Stimulation of parasympathetic nerve fibers releases acetylcholine, leading to what primary cardiac effect?', opts:['Increased atrial and ventricular contractility','Peripheral vasoconstriction','Increased heart rate','Decreased heart rate'], ans:3, exp:'Stimulation of parasympathetic nerve fibers releases acetylcholine, resulting in a decreased heart rate.' },
              { q:'Under what condition does stimulation of parasympathetic nerve fibers primarily occur?', opts:['When a decrease in pressure is detected','During exercise','During ventricular systole','When an increase in BP is detected'], ans:3, exp:'Parasympathetic stimulation occurs when an increase in BP (blood pressure) is detected.' },
              { q:'What is the time required for a drop of blood to pass from the RA, through entire circulation, and back in a resting person?', opts:['0.8 seconds','30 seconds','About 1 minute','5 minutes'], ans:2, exp:'Circulation time is about 1 minute in a resting person.' },
              { q:'Pulse pressure is calculated by:', opts:['Heart Rate divided by Stroke Volume','Systolic Blood Pressure minus Diastolic Blood Pressure','Cardiac Output divided by Body Surface Area','Apical pulse minus radial pulse'], ans:1, exp:'Pulse pressure is the difference between SBP (Systolic Blood Pressure) and DBP (Diastolic Blood Pressure).' }
            ]
          },
          {
            name: 'Cardiology IV',
            questions: [
              { q:'Where does the aorta originate and what type of blood does it carry?', opts:['Right ventricle; deoxygenated blood','Left atrium; oxygen-rich blood','Right atrium; deoxygenated blood','Left ventricle; oxygen-rich blood'], ans:3, exp:'The aorta originates from the left ventricle and carries oxygen-rich blood to all parts of the body.' },
              { q:'Which is the longest principal division of the aorta?', opts:['Ascending aorta (5 cm)','Arch of aorta (4â€“5 cm)','Thoracic aorta (20 cm)','Abdominal aorta (5 cm)'], ans:2, exp:'The Thoracic aorta is the longest at 20 cm. Ascending aorta: 5 cm, Arch: 4â€“5 cm, Abdominal: 5 cm.' },
              { q:'What is the correct length of the thoracic aorta?', opts:['5 cm','20 cm','10 cm','4â€“5 cm'], ans:1, exp:'The thoracic aorta has a length of 20 cm.' },
              { q:'The brachiocephalic artery is a direct branch of which part of the aorta?', opts:['Aortic arch','Thoracic aorta','Abdominal aorta','Ascending aorta'], ans:0, exp:'The aortic arch has three main branches: brachiocephalic, left common carotid, and left subclavian arteries.' },
              { q:'Which artery is a visceral branch of the thoracic aorta that supplies the lungs?', opts:['Bronchial artery','Subcostal artery','Pericardial artery','Esophageal artery'], ans:0, exp:'Bronchial arteries are visceral branches of the thoracic aorta that provide oxygenated blood to the lungs.' },
              { q:'Which of the following is an unpaired branch of the abdominal aorta?', opts:['Celiac trunk','Renal artery','Gonadal artery','Suprarenal artery'], ans:0, exp:'The celiac trunk is an unpaired branch that supplies the liver, stomach, and spleen.' },
              { q:'The Celiac trunk divides into three main branches. Which of these is NOT one of them?', opts:['Superior mesenteric artery','Left gastric artery','Splenic artery','Common hepatic artery'], ans:0, exp:'The Superior mesenteric artery is a separate branch of the abdominal aorta, not a branch of the celiac trunk.' },
              { q:'At which vertebral level does the abdominal aorta split into the common iliac arteries?', opts:['4th lumbar vertebra','1st lumbar vertebra','12th thoracic vertebra','5th lumbar vertebra'], ans:0, exp:'The abdominal aorta ends by bifurcating at the level of the 4th lumbar vertebra.' },
              { q:'What structure is supplied by the Superior phrenic artery?', opts:['Muscles of intercostal space','Superior part of diaphragm','Inferior part of diaphragm','Pericardium of heart'], ans:1, exp:'The superior phrenic artery is a branch of the thoracic aorta that supplies the upper (superior) part of the diaphragm.' },
              { q:'Which division of the aorta is specifically 5 cm long and begins at the left ventricle?', opts:['Ascending aorta','Aortic arch','Abdominal aorta','Thoracic aorta'], ans:0, exp:'The ascending aorta is 5 cm long and starts directly from the left ventricle.' },
              { q:'Which CK isoenzyme is specific to cardiac muscle?', opts:['CK-MM','CK-BB','CK-MB','CK-AA'], ans:2, exp:'CK-MB is predominantly found in cardiac muscle and rises in myocardial injury.' },
              { q:'Which troponin is most specific for myocardial injury?', opts:['Troponin C','Troponin I','Troponin T','Myoglobin'], ans:1, exp:'Troponin I is released only from cardiac muscle and is not found in skeletal muscle, making it most specific for myocardial injury.' },
              { q:'Troponin I remains elevated after MI for up to:', opts:['24 hours','48 hours','3â€“5 days','7â€“10 days'], ans:3, exp:'Troponin I remains elevated for 7â€“10 days, allowing late diagnosis of MI.' },
              { q:'Which marker rises earliest after myocardial injury?', opts:['CK-MB','Troponin I','Myoglobin','LDH'], ans:2, exp:'Myoglobin rises within 2 hours of myocardial injury, making it a sensitive early marker though not specific.' },
              { q:'The "flipped LDH pattern" in acute MI refers to:', opts:['LDH-2 > LDH-1','LDH-1 = LDH-2','LDH-1 > LDH-2','LDH-3 > LDH-1'], ans:2, exp:'In MI, LDH-1 exceeds LDH-2 (flipped pattern), unlike the normal pattern where LDH-2 > LDH-1.' },
              { q:'Elevated homocysteine increases cardiac risk by:', opts:['Increasing oxygen supply','Causing endothelial damage','Reducing platelet aggregation','Enhancing vasodilation'], ans:1, exp:'Homocysteine damages the endothelium and promotes thrombosis, increasing cardiovascular risk.' },
              { q:'BNP is primarily secreted from the:', opts:['Atria','Ventricles','Lungs','Kidneys'], ans:1, exp:'BNP is produced mainly by ventricular myocardium in response to stretch/pressure overload.' },
              { q:'Who invented the electrocardiograph?', opts:['Carlo Matteucci','William Harvey','William Einthoven','Claude Bernard'], ans:2, exp:'William Einthoven invented the ECG in 1895.' },
              { q:'Normal PR interval duration is:', opts:['< 0.12 sec','0.12â€“0.20 sec','0.20â€“0.30 sec','> 0.30 sec'], ans:1, exp:'PR interval represents AV conduction time and normally lasts 0.12â€“0.20 sec.' },
              { q:'Which ECG wave represents ventricular depolarization?', opts:['P wave','T wave','QRS complex','U wave'], ans:2, exp:'The QRS complex corresponds to ventricular depolarization.' },
              { q:'A prominent U wave on ECG suggests:', opts:['Hypercalcemia','Hypokalemia','Hypernatremia','Acidosis'], ans:1, exp:'Hypokalemia causes delayed repolarization producing prominent U waves on ECG.' },
              { q:'Which artery supplies the left upper limb directly from the aortic arch?', opts:['Left common carotid','Left subclavian','Brachiocephalic','Axillary'], ans:1, exp:'The left subclavian artery arises directly from the aortic arch and supplies the left upper limb.' },
              { q:'Normal adult aortic diameter is approximately:', opts:['1â€“2 cm','2â€“3 cm','3â€“4 cm','4â€“5 cm'], ans:1, exp:'The normal diameter of the aorta is 2â€“3 cm.' },
              { q:'The aortic arch supplies blood mainly to the:', opts:['Abdomen','Pelvis','Head, neck, and upper limbs','Lower limbs'], ans:2, exp:'Branches of the aortic arch supply the head, neck, and upper extremities.' },
              { q:'The abdominal aorta terminates by dividing into:', opts:['Femoral arteries','External iliac arteries','Internal iliac arteries','Common iliac arteries'], ans:3, exp:'The abdominal aorta bifurcates into the right and left common iliac arteries.' }
            ]
          },
          {
            name: 'Cardiology V',
            questions: [
              { q:'A client is prescribed Holter monitoring. Which instruction should the nurse prioritize?', opts:['Maintain bed rest throughout the testing period','Avoid all normal daily activities to prevent artifacts','Keep a detailed diary of activities and any symptoms','The client may take a brief shower if the monitor is kept dry'], ans:2, exp:'Clients undergoing Holter monitoring should perform normal daily activities but must maintain a diary to document symptoms. Baths and showers must be avoided.' },
              { q:'Which is considered the best test for diagnosing intermittent arrhythmias?', opts:['Resting 12-lead ECG','Holter monitoring','Transthoracic echocardiography','Cardiac catheterization'], ans:1, exp:'Holter monitoring provides continuous ECG recording over 24â€“72 hours, making it the best test for detecting intermittent arrhythmias.' },
              { q:'During an exercise stress test, which finding indicates a "positive" result for ischemia?', opts:['An increase in systolic blood pressure','A heart rate increase of 20 bpm','ST-segment depression of â‰¥ 1 mm','Absence of Q waves in all leads'], ans:2, exp:'A positive stress test for ischemia is characterized by ST-segment depression â‰¥ 1 mm, ST elevation in leads without Q waves, or exercise-induced chest pain.' },
              { q:'A client unable to tolerate physical exercise for a stress test may receive which medications to simulate exercise?', opts:['Metoprolol or Atenolol','Dipyridamole or Dobutamine','Metformin or Insulin','Warfarin or Heparin'], ans:1, exp:'If a client cannot tolerate exercise, IV infusion of dipyridamole or dobutamine is given to simulate the effect of exercise on the heart.' },
              { q:'Which of the following should the client avoid before an exercise ECG?', opts:['Water and clear liquids','Smoking, alcohol, and caffeine','Normal walking and light activity','High-protein meals'], ans:1, exp:'Pre-procedure instructions include advising the client to avoid smoking, alcohol, and caffeine, as these can affect heart rate and rhythm.' },
              { q:'What is the primary clinical advantage of Transesophageal Echocardiography (TEE) over Transthoracic Echocardiography?', opts:['It is entirely non-invasive','It does not require a probe','It provides clearer images of posterior heart structures','It is the most commonly performed echocardiogram'], ans:2, exp:'TEE involves passing a probe into the esophagus, providing clearer images of posterior heart structures because the probe is closer to the heart.' },
              { q:'Which parameter provides the best information about left ventricular systolic function on an echocardiogram?', opts:['Pulmonary artery pressure','Right atrial size','Ejection fraction','Direction of blood flow via Doppler'], ans:2, exp:'The ejection fraction (EF) is the percentage of end-diastolic blood volume ejected during systole and provides critical information about LV systolic function.' },
              { q:'A client diagnosed with systolic heart failure would have which ejection fraction (EF) value?', opts:['60%','55%','50%','40%'], ans:3, exp:'A normal EF is 55â€“65%. Clients with systolic heart failure generally have an EF < 45%, so 40% is consistent with this diagnosis.' },
              { q:'Which diagnostic procedure is the "gold standard" for detecting atherosclerotic obstruction of coronary arteries?', opts:['Exercise Stress Test','Doppler Echocardiography','Coronary Angiography','Holter Monitoring'], ans:2, exp:'Coronary angiography, performed during cardiac catheterization, is the gold standard for detecting atherosclerotic obstruction and evaluating coronary artery patency.' },
              { q:'When performing a right-sided cardiac catheterization, the catheter is inserted through a:', opts:['Vein','Artery','Bronchus','Esophagus'], ans:0, exp:'Right-sided heart catheterization is performed by inserting a catheter into a vein, whereas left-sided heart catheterization involves insertion into an artery.' },
              { q:'Which access route is often preferred for coronary angiography due to a lower risk of bleeding?', opts:['Femoral artery','Radial artery','Subclavian vein','Internal jugular vein'], ans:1, exp:'The radial artery is preferred because it is associated with less bleeding at the insertion site compared to the femoral approach.' },
              { q:'Why must Metformin be withheld for 24 hours prior to cardiac catheterization?', opts:['To prevent hypoglycemia during the procedure','To avoid interference with sedative medications','To prevent the risk of lactic acidosis associated with contrast dye','To ensure the client remains NPO'], ans:2, exp:'Metformin is withheld because the contrast dye used in angiography, combined with metformin, increases the risk of lactic acidosis.' },
              { q:'A client undergoing cardiac catheterization asks what they will feel when the dye is injected. The nurse should respond:', opts:['You will feel a sharp, stinging pain in your chest','You may feel a flushed, warm sensation throughout your body','You will likely feel an immediate need to cough','You will not feel anything at all'], ans:1, exp:'When the contrast dye is injected, the client commonly experiences a flushed and warm feeling throughout the body.' },
              { q:'Following a cardiac catheterization, how often should the nurse initially monitor peripheral pulses and the insertion site?', opts:['Every 15 minutes for 4 hours','Every 30 minutes for 2 hours','Once every hour for 6 hours','Every 2 hours for the first 24 hours'], ans:1, exp:'Post-procedure care includes monitoring peripheral pulses, colour, warmth, and sensation distal to the site every 30 minutes for the first 2 hours.' },
              { q:'To prevent arterial occlusion after cardiac catheterization via the femoral artery, the nurse should ensure:', opts:['The extremity is kept extended for 4â€“6 hours','The client walks immediately to promote circulation','The head of the bed is elevated to 90 degrees','A cold compress is applied to the site for 12 hours'], ans:0, exp:'The affected extremity must be kept extended for 4â€“6 hours, and the client should maintain strict bed rest for 6â€“12 hours to prevent arterial occlusion.' },
              { q:'The nurse encourages increased fluid intake following cardiac catheterization primarily to:', opts:['Replace blood lost during the procedure','Facilitate excretion of the contrast dye','Maintain blood pressure in the presence of sedatives','Prevent the formation of blood clots'], ans:1, exp:'Contrast dyes have an osmotic diuretic effect, and fluid intake is encouraged to help excrete the dye and replace fluid loss.' },
              { q:'What is the normal range for Central Venous Pressure (CVP) measured in mm Hg?', opts:['1â€“2 mm Hg','2â€“6 mm Hg','6â€“12 mm Hg','10â€“15 mm Hg'], ans:1, exp:'The normal CVP is 2â€“6 mm Hg (or 4â€“12 cm Hâ‚‚O).' },
              { q:"A client's CVP reading is 1 mm Hg. The nurse interprets this as a sign of:", opts:['Fluid overload','Right-sided heart failure','Hypovolemia','Pulmonary hypertension'], ans:2, exp:'A low CVP (below 2 mm Hg) indicates hypovolemia, while a high CVP indicates fluid overload or right heart failure.' },
              { q:'Which factor would cause an increase in Central Venous Pressure (CVP)?', opts:['Deep inhalation','Distributive shock','Mechanical ventilation with PEEP','Dehydration'], ans:2, exp:'Factors that increase CVP include mechanical ventilation with PEEP, heart failure, hypervolemia, and cardiac tamponade.' },
              { q:'Pulmonary Artery Wedge Pressure (PAWP) is a clinical estimate of:', opts:['Right ventricular end-diastolic pressure','Left atrial pressure','Mean arterial pressure','Right atrial pressure'], ans:1, exp:'PAWP (PCWP) is measured by wedging a catheter into a small pulmonary arterial branch to estimate left atrial pressure and LV end-diastolic pressure.' },
              { q:'What is the normal value for Pulmonary Artery Wedge Pressure (PAWP)?', opts:['2â€“6 mmHg','6â€“12 mmHg','15â€“25 mmHg','25â€“30 mmHg'], ans:1, exp:'The normal value for PAWP is 6â€“12 mmHg.' },
              { q:'Pulmonary hypertension is clinically defined as pulmonary artery pressure (PAP) greater than:', opts:['10 mm Hg at rest','15 mm Hg at rest','25 mm Hg at rest','40 mm Hg at rest'], ans:2, exp:'Pulmonary hypertension occurs if the pressure in the pulmonary artery is > 25 mm Hg at rest or 30 mm Hg during activity.' },
              { q:'Where is the phlebostatic axis anatomically located?', opts:['2nd intercostal space, mid-clavicular line','4th intercostal space, mid-axillary line','5th intercostal space, left sternal border','4th intercostal space, mid-clavicular line'], ans:1, exp:'The phlebostatic axis is the intersection of the 4th intercostal space and the mid-axillary line.' },
              { q:'What is the clinical significance of the phlebostatic axis?', opts:['Site for auscultating the mitral valve','Preferred site for radial artery puncture','Zero reference point for hemodynamic pressure measurements','Indicates the location of the left ventricle'], ans:2, exp:'The phlebostatic axis is used as the zero level for hemodynamic pressure measurements (CVP, PAP, PCWP) to ensure accurate standardized readings.' },
              { q:'When leveling a pressure transducer for hemodynamic monitoring, the phlebostatic axis corresponds approximately to the level of the:', opts:['Left ventricle','Aortic arch','Right atrium','Pulmonary artery'], ans:2, exp:'The phlebostatic axis corresponds approximately to the level of the right atrium.' }
            ]
          }
        ]
      },
      {
        name: 'CNS', icon: 'fa-brain', color: '#8b5cf6',
        sections: [
          {
            name: 'CNS I',
            questions: [
          { q:'Which structure is responsible for generating and transmitting the nerve impulse and is known as the working unit of the nervous system?', opts:['Neuroglia','Astrocyte','Schwann cell','Neuron'], ans:3, exp:'Neurons are identified as the working unit of the nervous system, responsible for generating and transmitting the nerve impulse.' },
          { q:'What is the typical duration of the action potential produced by nervous tissue?', opts:['1 second','1 minute','1 millisecond','1 microsecond'], ans:2, exp:'Nervous tissue has the property to produce action potential, which has a 1 millisecond duration.' },
          { q:'The nerve cell body, also known as the soma or perikaryon, contains all of the following components EXCEPT:', opts:['Mitochondria','Nissl bodies','Cell membrane','Neurotransmitters'], ans:3, exp:'The cell body consists of cytoplasm, nucleus, lysosomes, mitochondria, Nissl bodies, and Golgi complex. Neurotransmitters are synthesized in pre-synaptic neurons and stored in vesicles.' },
          { q:'Nissl bodies are composed of:', opts:['Cytoplasm and Golgi complex','Lysosomes and mitochondria','Polysomes and rough endoplasmic reticulum','Synaptic vesicles and neurofilaments'], ans:2, exp:'Nissl bodies are characteristic of nerve cells and consist of polysomes and rough endoplasmic reticulum.' },
          { q:'Nissl bodies are present in which parts of the neuron?', opts:['Axons only','Nerve cell bodies and axons','Dendrites and axons','Nerve cell bodies and dendrites'], ans:3, exp:'Nissl bodies are present in nerve cell bodies and dendrites but are absent in axons.' },
          { q:'A genetic defect in the synthesis of lysosomal enzymes results in which specific storage disease?', opts:['Multiple sclerosis','Tay-Sachs disease','Gliosis',"Parkinson's disease"], ans:1, exp:'A genetic defect in the synthesis of lysosomal enzymes results in the storage disease, Tay-Sachs disease.' },
          { q:'Which part of the neuron conducts in a decremental fashion and transmits synaptic input toward the cell body?', opts:['Axon','Myelin sheath','Dendrites','Nodes of Ranvier'], ans:2, exp:'Dendrites receive synaptic input, transmit it toward the cell body, and conduct in a decremental fashion.' },
          { q:'In a myelinated nerve fiber, the myelin sheath is produced in the Peripheral Nervous System (PNS) by:', opts:['Oligodendrocytes','Astrocytes','Schwann cells','Ependymal cells'], ans:2, exp:'The myelin sheath is produced in the PNS by Schwann cells.' },
          { q:'Where is the myelin sheath absent at regular intervals along a nerve fiber?', opts:['Pre-synaptic membrane','Synaptic cleft','Nodes of Ranvier','Perikaryon'], ans:2, exp:'The myelin sheath is absent at regular intervals, and these absent areas are called nodes of Ranvier.' },
          { q:'Which type of neuroglia are the largest glial cells, star-shaped, and play a role in forming the Blood-Brain Barrier (BBB)?', opts:['Microglia','Oligodendrocytes','Astrocytes','Schwann cells'], ans:2, exp:'Astrocytes are described as star-shaped, the largest glial cells, and they help to form the BBB.' },
          { q:'The process where Astrocytes form glial scars in damaged areas of the brain is known as:', opts:['Phagocytosis','Remyelination','Gliosis','Synaptic input'], ans:2, exp:'Astrocytes form glial scars in damaged areas of the brain, a process called gliosis.' },
          { q:'Damage or destruction to which type of glial cell is associated with multiple sclerosis?', opts:['Astrocytes','Microglia','Ependymal cells','Oligodendrocytes'], ans:3, exp:'Oligodendrocytes, the myelin-forming cells of the CNS, are destroyed in multiple sclerosis.' },
          { q:'Which neuroglia line the central canal of the spinal cord and the ventricles of the brain, and are involved in CSF secretion?', opts:['Astrocytes','Ependymal cells','Microglia','Satellite cells'], ans:1, exp:'Ependymal cells line these structures and are involved in the secretion of cerebrospinal fluid (CSF).' },
          { q:'Which small glial cells arise from monocytes entering the CNS from the blood and function as macrophages in damaged tissue?', opts:['Oligodendrocytes','Astrocytes','Microglia','Schwann cells'], ans:2, exp:'Microglia arise from monocytes and function as macrophages when activated by inflammatory or degenerative processes.' },
          { q:'What is the total number of pairs of cranial nerves that arise from the brain?', opts:['10 pairs','31 pairs','12 pairs','20 pairs'], ans:2, exp:'Cranial nerves arise from the brain, and there is a total of 12 pairs.' },
          { q:'Visceral neurons (autonomic nerve fibers) are classified based on distribution because they supply the:', opts:['Skeletal muscles of the body','Internal organs of the body','Brain and spinal cord','Skin receptors'], ans:1, exp:'Visceral neurons/autonomic nerve fibers supply the internal organs of the body.' },
          { q:'Neurons that conduct sensory impulses toward the brain or spinal cord are classified as:', opts:['Motor neurons','Efferent neurons','Afferent neurons','Somatic neurons'], ans:2, exp:'Sensory neurons/Afferent neurons conduct sensory impulses towards the brain or spinal cord.' },
          { q:'What is the minute space between the presynaptic and postsynaptic neurons called?', opts:['Synaptic junction','Synaptic vesicle','Synaptic cleft','Synaptic body'], ans:2, exp:'The minute space between pre and post-synaptic neurons is called a synaptic cleft.' },
          { q:'In a chemical synapse, where is the neurotransmitter synthesized and stored before transmission?', opts:['Synaptic cleft','Post-synaptic membrane','Myelin sheath','Pre-synaptic neurons'], ans:3, exp:'Neurotransmitter is synthesized by the pre-synaptic neurons and stored in vesicles.' },
          { q:'Electrical synapses, or ephapses, are characterized by consisting of:', opts:['Neurotransmitter receptors','Polysomes','Gap junctions','Myelin sheaths'], ans:2, exp:'Electrical synapses (ephapses) consist of gap junctions and allow ions to pass from cell to cell.' },
          { q:'Satellite cells are glial cells of the PNS that perform what function?', opts:['Form myelin sheath on PNS neurons','Enclose cell bodies of sensory neurons in spinal ganglia','Function as macrophages','Line the central canal'], ans:1, exp:'Satellite cells enclose the cell bodies of sensory neurons in the spinal ganglia.' },
          { q:'How many total pairs of spinal nerves arise from the spinal cord?', opts:['12 pairs','30 pairs','31 pairs','40 pairs'], ans:2, exp:'Spinal nerves arise from the spinal cord, and there is a total of 31 pairs.' },
          { q:'Motor neurons (efferent neurons) carry impulses from the CNS to stimulate:', opts:['Sensory input','Contraction in muscle tissue','Secretion in glandular tissue','Both B and C'], ans:3, exp:'Motor neurons carry impulses from the CNS to either muscle tissue (stimulates contraction) or glandular tissue (stimulates secretion).' },
          { q:'Neuroglia cells are generally different from neurons because neuroglia cells:', opts:['Are excitable','Are non-excitable and capable of cell division throughout life','Generate action potentials','Transmit nerve impulses'], ans:1, exp:'Neuroglia are non-excitable glial cells and are capable of cell division throughout life.' }
            ]
          },
          {
            name: 'CNS II',
            questions: [
          { q:'A nurse is preparing a client for a CT scan using contrast dye. Which pre-procedural action is essential?', opts:['Placing the client in a prone position for 2 hours','Withholding all caffeine and stimulants for 48 hours','Assessing for allergies to iodine, contrast dyes, or shellfish','Ensuring all metal objects are removed from the client'], ans:2, exp:'Pre-procedural interventions for a CT scan using dye include assessing the client for allergies to iodine, contrast dyes, or shellfish. Option A relates to Lumbar Puncture, B to EEG, D to MRI.' },
          { q:"During the injection of contrast dye for a CT scan, the client reports a hot, flushed sensation and a metallic taste in their mouth. What is the nurse's priority action?", opts:['Stop the injection immediately and assess for anaphylaxis','Administer replacement fluids to prevent dehydration','Inform the client that this is a normal expected sensation','Check the dye injection site for hematoma formation'], ans:2, exp:'A hot, flushed sensation and metallic taste when contrast dye is injected are normal expected findings that the nurse should inform the client about beforehand.' },
          { q:'Following a CT scan with contrast dye, which assessment should the nurse perform regarding the injection site?', opts:['Monitor the site for CSF leakage','Check for the presence of a hematoma or bleeding','Assess for pain on the outer part of the elbow',"Check for a positive Phalen's sign"], ans:1, exp:'Post-procedure interventions include assessing the injection site for bleeding or hematoma, and monitoring the extremity for color, warmth, and distal pulses.' },
          { q:'A Lumbar Puncture is contraindicated in clients diagnosed with which condition?', opts:['Carpal tunnel syndrome','Hypotension','Increased Intracranial Pressure (ICP)',"Positive Phalen's sign"], ans:2, exp:'A Lumbar Puncture is specifically contraindicated in clients with increased ICP.' },
          { q:'Where is the spinal needle inserted during a standard Lumbar Puncture procedure?', opts:['Into the subarachnoid space through the L3-L4 interspace','Over the median nerve in the wrist','Into the lateral epicondyle','Through the occipital lobe'], ans:0, exp:'A Lumbar Puncture involves the insertion of a spinal needle through the L3-L4 interspace into the lumbar subarachnoid space.' },
          { q:'Post-procedure care following a Lumbar Puncture requires placing the patient in a prone position for what duration?', opts:['6 hours','60 seconds','2 hours','24-48 hours'], ans:2, exp:'Post-procedure interventions for a Lumbar Puncture require placing the patient in a prone position for 2 hours.' },
          { q:'What potential post-procedure complication should the nurse monitor for specifically after a Lumbar Puncture?', opts:['Hot, flushed sensation in the mouth','CSF leakage or headache','Compression of the radial nerve','Development of Beta waves'], ans:1, exp:'Post-procedure interventions for a Lumbar Puncture include monitoring for headache and checking for the presence of CSF leakage.' },
          { q:'Which dietary instruction is appropriate for a client preparing for an EEG?', opts:['Allow the client to have breakfast','Withhold all oral intake for 8 hours','Restrict fluid intake due to expected diuresis','Withhold only medications, not beverages'], ans:0, exp:'A key pre-procedural intervention for an EEG is to allow the client to have breakfast.' },
          { q:'Which normal adult brain wave pattern is associated with being awake with mental activity?', opts:['Alpha (8-13 Hz)','Theta (4-7 Hz)','Delta (<3.5 Hz)','Beta (14-30 Hz)'], ans:3, exp:'The Beta wave (14-30 Hz) is the normal adult brain wave associated with being awake with mental activity.' },
          { q:'What brain wave pattern is characteristic of deep sleep?', opts:['Beta','Alpha','Delta','Gamma'], ans:2, exp:'Delta waves (<3.5 Hz) are the brain waves associated with deep sleep.' },
          { q:'A GCS score less than 8 indicates which state?', opts:['Minor injury','Moderate injury','Coma','Awake and resting'], ans:2, exp:'A score less than 8 on the GCS indicates coma.' },
          { q:'Which clinical manifestation is characteristic of Carpal Tunnel Syndrome?', opts:['Pain on the outer part of the elbow','Impaired sensation in the distribution of the median nerve','Compression on the nerve from walking with crutches','Brain wave activity of 8-13 Hz'], ans:1, exp:'Clinical manifestations of CTS include weakness, pain, numbness and tingling sensation, and impaired sensation in the distribution of the median nerve.' },
          { q:"A positive response to Phalen's sign is identified by which finding?", opts:['An immediate hot, flushed sensation','Tingling in the distribution of the median nerve over the hand','Point tenderness over the lateral epicondyle','A GCS score of 9-12'], ans:1, exp:"Both Tinel's sign and Phalen's sign are positive if there is a sensation of tingling in the distribution of the median nerve over the hand." },
          { q:'Radial tunnel syndrome is also known by which common name?', opts:['Saturday night palsy','Crutch palsy','Persistent tennis elbow','Honeymoon palsy'], ans:2, exp:'Radial tunnel syndrome is also known as persistent tennis elbow.' },
          { q:'Which is a characteristic clinical feature of Tennis Elbow (Lateral Epicondylitis)?', opts:['Numbness and tingling in the median nerve distribution','Point tenderness over the lateral epicondyle','Tingling sensation when tapping the wrist','Compression of the L3-L4 interspace'], ans:1, exp:'Clinical features of Tennis Elbow include pain on the outer part of the elbow and point tenderness over the lateral epicondyle.' },
          { q:'Which alias for Radial Nerve Palsy is specifically associated with compression due to falling asleep with the back of the arm compressed, often related to alcohol intake?', opts:['Honeymoon palsy','Crutch palsy','Squash palsy','Saturday night palsy'], ans:3, exp:'Saturday night palsy is an alias for Radial Nerve Palsy, where alcohol is sometimes a factor as a person falls asleep with the back of their arm compressed.' }
            ]
          },
          {
            name: 'CNS III',
            questions: [
          { q:'Meningitis is pathologically defined as the inflammation involving which specific layers of the Central Nervous System (CNS)?', opts:['Dura mater and subarachnoid space','White and grey matter of the brain','Arachnoid and pia mater of the brain and spinal cord','Brain parenchymal tissue and cerebrum'], ans:2, exp:'Meningitis is the inflammation of the meninges, specifically the arachnoid and pia mater of the brain and spinal cord.' },
          { q:'Which of the following classifications of meningitis is also known as "Septic Meningitis"?', opts:['Tuberculous bacilli meningitis (TBM)','Aseptic meningitis','Bacterial meningitis (Pyogenic)','Viral meningitis'], ans:2, exp:'Bacterial meningitis is referred to as septic meningitis or Pyogenic meningitis.' },
          { q:'The organism responsible for causing infection of the meninges typically enters the Central Nervous System (CNS) through which primary route(s)?', opts:['Direct inoculation via lumbar puncture','Gastrointestinal tract invasion','Upper respiratory tract or bloodstream','Direct spread from the inner ear'], ans:2, exp:'The causative organism enters into the CNS through the upper respiratory tract or bloodstream.' },
          { q:'Septic Meningitis is most frequently observed in which demographic?', opts:['Adults aged 20 to 40 years','Age group 6 to 24 months','Birth to 2 months','Immunocompromised elderly patients'], ans:2, exp:'Septic meningitis (Bacterial meningitis) is most common from birth to 2 months.' },
          { q:'Which clinical manifestation is uniquely associated with meningococcal meningitis, differentiating it from other forms?', opts:['Seizure activity','Nuchal rigidity','Red macular (petechial) rash',"Positive Brudzinski's sign"], ans:2, exp:'A red macular (petechial) rash specifically occurs in meningococcal meningitis only.' },
          { q:'Seizure activity is a common complication in meningitis, reported to occur in what fraction of cases?', opts:['Half of cases','1/4th cases','1/3rd cases','2/3rds cases'], ans:2, exp:'Seizure occurs in 1/3rd cases of meningitis.' },
          { q:"A nurse assesses a patient for meningeal irritation. A positive Kernig's Sign is elicited when:", opts:['Neck flexion results in involuntary hip flexion','Neck flexion produces an electric shock sensation radiating down the spine','The extension of the knee is painful or limited when the knee and hip are both flexed to 90 degrees','The patient exhibits extreme neck stiffness (nuchal rigidity)'], ans:2, exp:"Kernig's Sign is positive when the knee is flexed to 90 degrees, the hip is flexed to 90 degrees, and the subsequent extension of the knee is painful or limited." },
          { q:'Which etiological agent is responsible for Tuberculous Bacilli Meningitis (TBM)?', opts:['Neisseria meningitidis','Tubercle bacilli (acid-fast bacilli) or mycobacterium tuberculosis','Mycoplasma','Herpes simplex'], ans:1, exp:'TBM is caused by tubercle bacilli (acid-fast bacilli) or mycobacterium tuberculosis.' },
          { q:'In the cerebrospinal fluid (CSF) analysis of Bacterial Meningitis, which combination of findings is expected regarding appearance and glucose levels?', opts:['Clear appearance; Normal glucose','Clear appearance; Decreased glucose','Turbid appearance; Decreased glucose (<40 mg/dL)','Turbid appearance; Normal glucose'], ans:2, exp:'Bacterial Meningitis is characterized by Turbid appearance and Decreased glucose levels (<40 mg/dL).' },
          { q:'A lumbar puncture performed on a client suspected of having Viral Meningitis would typically yield CSF with which characteristics regarding WBC count and Glucose level?', opts:['WBC >1000 cells/uL; Decreased glucose','WBC <500 cells/uL; Low or absent glucose','WBC <300 cells/uL with Lymphocytic predominance; Normal glucose','WBC 25-300 microl; Normal glucose'], ans:2, exp:'Viral Meningitis CSF analysis shows WBC count <300 with Lymphocytic predominance and Normal glucose (50-80 mg/dL).' },
          { q:'Which CSF finding is commonly associated with Fungal Meningitis?', opts:['Protein levels 15-45 mg/dL','Opening pressure below 90 mm Hg','WBC count >1000 cells/uL','Protein levels >200 mg/dL'], ans:3, exp:'Fungal Meningitis is associated with Protein levels >200 mg/dL and Normal-Elevated Opening Pressure.' },
          { q:'In the pharmacological management of Meningitis, which medication class is specifically advised for headache relief?', opts:['Steroids (Dexamethasone)','Antivirals (Acyclovir)','Anti-seizure medications','Analgesics (Codeine)'], ans:3, exp:'Management for meningitis includes Analgesics (Codeine for headache).' },
          { q:'The definitive description of Encephalitis involves the inflammation of which specific components of the brain?', opts:['The meninges (arachnoid and pia mater)','Cranial nerves and spinal nerve roots','Brain parenchymal tissue and white and grey matter of the brain','Cerebral cortex and the ventricles'], ans:2, exp:'Encephalitis is the inflammation of the brain parenchymal tissue and inflammation of white and grey matter of the brain.' },
          { q:'Which specific viral pathogen is listed as an etiology for Encephalitis?', opts:['Mumps virus','Enterovirus','Arbovirus','Cytomegalovirus (CMV)'], ans:3, exp:'Viral etiologies for Encephalitis include CMV, HSV, EBV, and Measles virus.' },
          { q:'If a patient with Encephalitis is managed to control increased Intracranial Pressure (ICP), the Head of Bed (HOB) should be elevated to what range?', opts:['15-20 degrees','30-45 degrees','60 degrees','90 degrees'], ans:1, exp:'Management for Encephalitis includes elevating HOB 30-45 degrees to help control ICP.' },
          { q:'Brain Abscess is defined as a pathological condition characterized by:', opts:['Chronic demyelination of CNS neurons','Inflammation restricted to the gray matter','Accumulation of pus within the brain tissue resulting from local or systemic infection','Inflammation of the brain and spinal cord meninges'], ans:2, exp:'Brain abscess is the accumulation of pus within the brain tissue that can result from a local or systemic infection.' },
          { q:'When comparing CSF analysis results for Encephalitis and Brain Abscess, a key distinction is often seen in the glucose level:', opts:['Encephalitis glucose is decreased; Brain Abscess glucose is normal','Encephalitis glucose is Normal; Brain Abscess glucose is Low or absent','Both conditions typically show decreased glucose','Both conditions typically show normal glucose'], ans:1, exp:'In Encephalitis, glucose is Normal. In Brain Abscess, glucose is Low or absent.' },
          { q:'Multiple Sclerosis (MS) is classified as a chronic, progressive, degenerative disorder resulting from the destruction of which vital component for nerve conduction in the CNS?', opts:['Astrocyte connections','Pia mater','Myelin sheath of neurons','Oligodendrocytes themselves'], ans:2, exp:'MS occurs due to the destruction of the myelin sheath of neurons in the CNS, which is essential for normal conduction of nerve impulses.' },
          { q:'Multiple Sclerosis is also commonly known by which two alternative names?', opts:['Septic meningitis and TBM',"Kernig's disease and Brudzinski's syndrome",'Disseminated sclerosis or Encephalomyelitis disseminate','Acute disseminated encephalomyelitis (ADEM)'], ans:2, exp:'MS is known as disseminated sclerosis or Encephalomyelitis disseminate.' },
          { q:'Multiple Sclerosis exhibits a specific gender prevalence, affecting women approximately:', opts:['Three times as much as men','Twice as much as men','Equally as much as men','Half as much as men'], ans:1, exp:'MS affects the 20 to 40 years age range, and women are affected twice as much as men.' },
          { q:"A patient with Multiple Sclerosis experiences an electric shock-like sensation radiating down the spine upon neck flexion. This sign, known as Lhermitte's Sign, is also referred to as the:", opts:['Positive Babinski reflex','Spasticity phenomenon','Barber chair phenomenon',"Uhthoff's phenomenon"], ans:2, exp:"Lhermitte's sign, described as the electric shock-like sensation on neck flexion, is also known as the Barber chair phenomenon." },
          { q:'Which clinical manifestation of Multiple Sclerosis is defined as the paralysis of all four limbs due to bilateral lesion of the pyramidal tract at the cervical region?', opts:['Hemiplegia','Paraplegia','Quadriplegia/tetraplegia','Diplegia'], ans:2, exp:'Quadriplegia/tetraplegia is defined as the paralysis of all 4 limbs due to bilateral lesion of the pyramidal tract at the cervical region.' },
          { q:'Which factor is listed as a potential risk factor that may trigger relapses or exacerbations in a client with Multiple Sclerosis?', opts:['High protein diet','Elevated blood sugar','Stress','High potassium intake'], ans:2, exp:'Risk factors for MS exacerbations include Pregnancy, Fatigue, Stress, Trauma, and Infection.' },
          { q:'In the diagnostic workup for Multiple Sclerosis, which specific immunological finding in CSF analysis supports the diagnosis?', opts:['Decreased CSF glucose level','Normal serum globulin level','Increased oligoclonal antibody level','Decreased protein level'], ans:2, exp:'Diagnosis via LP and CSF analysis shows Elevated proteins, Increased oligoclonal antibody level, and Increased gamma globulin level.' },
          { q:'A core nursing intervention to address constipation in a client with Multiple Sclerosis involves advising which specific dietary modification?', opts:['Low-fat, low-fiber diet with fluid restriction','High protein, low potassium diet','Balanced diet: low-fat, high fiber diet','High carbohydrate diet to increase energy'], ans:2, exp:'Nursing care advice includes a balanced diet: low-fat, high fiber diet to relieve constipation, along with high protein, potassium-rich diet and increased fluids.' }
            ]
          },
          {
            name: 'CNS IV',
            questions: [
          { q:'The underlying mechanism of muscle weakness in Myasthenia Gravis (MG) involves antibodies that specifically target and destroy which structure?', opts:['Dopamine receptors in the substantia nigra','Acetylcholine receptors at the neuromuscular junction','Gamma-aminobutyric acid (GABA) receptors in the brain','Motor end plates, causing hyperpolarization'], ans:1, exp:'Myasthenia Gravis is an autoimmune disease where antibodies destroy the acetylcholine receptor at the neuromuscular junction, causing decreased functional ACh receptors and lack of Na+ influx preventing muscle contraction.' },
          { q:'A patient presenting with Myasthenia Gravis exhibits severe generalized weakness that is notably worse in the late afternoon or evening. This manifestation is best described as:', opts:['Tremor (Pill rolling)','Rigidity (Stiffness)','Extreme weakness and fatigue in the evening','Loss of automatic movements'], ans:2, exp:'Extreme weakness and fatigue in the evening is a clinical manifestation of MG. The weakness is characterized as fluctuating weakness of skeletal muscles, particularly those used for chewing, speaking, breathing, and eye muscles.' },
          { q:'Which finding, if noted during the assessment of a patient experiencing a Myasthenic Crisis, is considered an acute life-threatening sign?', opts:['Ptosis and Diplopia','Decreased urine output','Respiratory paralysis and failure','Bowel and bladder incontinence'], ans:2, exp:'Clinical manifestations of Myasthenia Gravis include respiratory paralysis and failure. Myasthenic crisis is defined as an acute attack or acute exacerbation of the disease.' },
          { q:'The Tensilon test involves administering Edrophonium. If the patient has Myasthenia Gravis, what result is expected?', opts:['Muscle strength is not improved, indicating the weakness is due to other reasons','Muscle strength is improved, indicating possibly Myasthenia Gravis','Severe cholinergic side effects immediately necessitate administering atropine','An acute exacerbation of the disease occurs'], ans:1, exp:"During the Tensilon test, if Edrophonium is injected and the patient's muscle strength is improved, it indicates possibly Myasthenia Gravis." },
          { q:'In Myasthenia Gravis, the diagnosis process often includes screening for Thymoma. Which diagnostic studies are specifically mentioned for detecting this condition?', opts:['Nerve conduction study and EMG','Lumbar puncture and CSF analysis','CT or MRI Scan','Tensilon Test'], ans:2, exp:'CT and MRI Scans are used to detect Thymoma. Other diagnostic methods include the Tensilon test, Nerve conduction study, and EMG.' },
          { q:'A Myasthenic Crisis (acute attack of myasthenia gravis) can be caused by:', opts:['Overmedication with anticholinesterase drugs','Excessive secretion of cholinesterase','A rapid unrecognized progression of the disease, such as due to infection or inadequate medication','Anticholinergic drug administration'], ans:2, exp:'A Myasthenic crisis is caused by a rapid unrecognized progression of the disease. Specific factors include inadequate medication, infection, fatigue, and stress.' },
          { q:'The initial cause of muscle contraction failure in Myasthenia Gravis at the neuromuscular junction is due to:', opts:['Excessive cholinesterase destroying acetylcholine','Insufficient secretion of sodium (Na+)','Destruction of acetylcholine receptors leading to a lack of Na+ influx','Depolarization of the motor end plates'], ans:2, exp:'In Myasthenia Gravis, autoantibodies cause acetylcholine receptors to be internalized and degraded, leading to a lack of Na+ influx which prevents muscle contraction.' },
          { q:'Plasmapheresis (Plasma exchange therapy) is utilized in the management of Myasthenia Gravis for what specific purpose?', opts:['To increase dopamine levels in the brain','To remove circulating anti-Ach receptor antibody','To prevent the destruction of levodopa by the liver','To depolarize the motor end plates'], ans:1, exp:'Plasmapheresis is used in management to remove circulating anti-Ach receptor antibody.' },
          { q:'A patient is diagnosed with Cholinergic Crisis. The nurse recognizes that this crisis is typically caused by:', opts:['Infection or fatigue','Inadequate amount of medication','Overmedication with anticholinesterase','Degeneration of dopamine-producing cells'], ans:2, exp:'Cholinergic crisis is caused by overmedication with anticholinesterase.' },
          { q:'For a patient experiencing Cholinergic Crisis, the priority nursing intervention related to medication administration involves:', opts:['Administering IV immunoglobulin','Administering Bromocriptine','Administering the antidote atropine sulfate','Providing a high-calorie, protein, and fiber diet'], ans:2, exp:'The interventions for Cholinergic Crisis are to withhold anticholinesterase medication and administer antidote atropine sulfate.' },
          { q:'In addition to fluctuating muscle weakness in the eyes and face, which two related swallowing and respiratory findings are characteristic clinical manifestations of Myasthenia Gravis?', opts:['Dysphagia and Hoarseness in voice','Micrographia and Monotonous speech','Constipation and Amnesia','Rigidity and Bradykinesia'], ans:0, exp:'Clinical manifestations include dysphagia (difficulty chewing and swallowing) and hoarseness in voice.' },
          { q:'Which assessment finding is unique to the assessment of Myasthenic Crisis, indicating severe systemic stress and deterioration?', opts:['Loss of ability to control body movements','Absent cough and swallow reflex','Tremors in hands and fingers at rest','Insufficient secretion of acetylcholine'], ans:1, exp:'Assessment findings during a Myasthenic Crisis include absent cough and swallow reflex, along with increased pulse, respiration, and BP, dyspnea, anoxia, cyanosis, and decreased urine output.' },
          { q:'The use of immunosuppressants such as Azathioprine and Cyclosporine, along with surgery like Thymectomy, are categorized under which component of Myasthenia Gravis care?', opts:['Diagnosis','Assessment','Complication','Management'], ans:3, exp:'Immunosuppressants (Azathioprine, Cyclosporine) and surgery (Thymectomy) are listed under the Management section for the disease.' },
          { q:"Parkinson's Disease (PD) is fundamentally characterized by the degeneration of dopamine-producing cells located in which specific brain structure?", opts:['Thalamus','Globus pallidus','Basal ganglia','Substantia nigra'], ans:3, exp:"Parkinson's Disease occurs due to the degeneration of dopamine-producing cells in the substantia nigra (nuclei in the extrapyramidal system of the midbrain)." },
          { q:"The characteristic triad of cardinal features used in the clinical diagnosis of Parkinson's Disease includes:", opts:['Dysphagia, Ptosis, and Diplopia','Tremor (Pill rolling), Rigidity (Stiffness), and Bradykinesia (Abnormal slow movement)','Akinesia, Micrographia, and Amnesia','Monotonous speech, Constipation, and Loss of automatic movements'], ans:1, exp:"The three cardinal features of Parkinson's Disease are Tremor (Pill rolling), Rigidity (Stiffness), and Bradykinesia (Abnormal slow movement)." },
          { q:"The purpose of Carbidopa when administered in combination with Levodopa for Parkinson's Disease management is:", opts:['To block reuptake of dopamine into presynaptic neurons','To activate dopamine receptors in the CNS','To convert L-dopa to dopamine in the brain','To prevent the destruction of levodopa by the liver and from early metabolism'], ans:3, exp:'Carbidopa must be given because it prevents the destruction of levodopa by the liver and from early metabolism.' },
          { q:"The primary reason a combination of Carbidopa and Levodopa is administered to Parkinson's patients, rather than dopamine alone, is:", opts:['Dopamine cannot cross the blood-brain barrier (BBB)','L-dopa is a dopamine antagonist','Carbidopa causes excessive secretion of cholinesterase','L-dopa is required to treat associated psychiatric symptoms'], ans:0, exp:'The combination is used because dopamine itself cannot cross the blood-brain barrier (BBB). L-dopa (precursor of dopamine) is converted to dopamine in the brain.' },
          { q:"Which clinical manifestation of Parkinson's Disease describes the progressively smaller handwriting often seen in patients?", opts:['Akinesia','Bradykinesia','Micrographia','Diplopia'], ans:2, exp:'Handwriting that becomes progressively smaller is described as micrographia.' },
          { q:"In Parkinson's Disease, loss of automatic movements, such as eye blinking and arm swinging while walking, is a clinical manifestation listed alongside:", opts:['Myasthenic crisis','Decreased functional acetylcholine receptors','Constipation and monotonous speech','Absent cough reflex'], ans:2, exp:"The loss of automatic movements is listed alongside Constipation and Monotonous speech (quick, soft, slurred speech) as clinical manifestations of Parkinson's Disease." },
          { q:'What specific dietary advice is given to patients taking antiparkinson medication?', opts:['Avoid high-calorie, protein, fiber, and soft diet','Avoid food rich in Vitamin B6 (fish, beef liver, organ meat)','Increase intake of foods rich in Vitamin B6','Avoid atropine sulfate'], ans:1, exp:'Patients should be advised to avoid food rich in Vitamin B6 (fish, beef liver, organ meat) because it blocks the effect of antiparkinson medication.' },
          { q:"Anticholinergic drugs, such as Atropine, Benztropine, and Trihexyphenidyl, are used in the management of Parkinson's Disease primarily to:", opts:['Increase dopamine secretion','Prevent levodopa destruction','Control tremor and hypersecretion of the body','Treat Myasthenic crisis'], ans:2, exp:'Anticholinergics (e.g., Atropine, Benztropine, Trihexyphenidyl) are used to control tremor and hypersecretion of the body.' },
          { q:'Which class of medication, including Bromocriptine, Selegeline, and Pramipexole, is used in PD management because it activates dopamine receptors in the CNS to increase dopamine secretion?', opts:['Anticholinergics','Anti-cholinesterase','Dopamine agonists','Antivirals (Amantadine)'], ans:2, exp:'Dopamine agonists, such as Bromocriptine, Selegeline, and Pramipexole, activate the dopamine receptor in the CNS to increase the secretion of dopamine.' },
          { q:"What type of surgery involves the placement of a neurostimulator (brain pacemaker) that sends electrical impulses through implanted electrodes to specific targets in the brain for Parkinson's Disease?", opts:['Thymectomy','Ablation surgery (Thalamotomy)','Deep Brain Stimulation (DBS)','Fetal neural tissue transplantation'], ans:2, exp:'The placement of a medical device - a neurostimulator (brain pacemaker) - which sends electrical impulses through implanted electrodes to specific targets in the brain is known as Deep Brain Stimulation.' },
          { q:'Amantadine, classified as an antiviral drug, helps reduce the effects of parkinsonism by performing what action?', opts:['Blocking reuptake of dopamine into presynaptic neurons','Activating the acetylcholine receptor','Preventing dopamine from crossing the BBB','Destroying cholinesterase enzymes'], ans:0, exp:'Amantadine (an antiviral drug) blocks reuptake of dopamine into presynaptic neurons and reduces the effects of parkinsonism.' },
          { q:"Ablation surgery for Parkinson's Disease includes which of the following specific procedures targeting areas in the brain?", opts:['Thymectomy, Plasmapheresis, and Transplantation','Thalamotomy, Pallidotomy, and Subthalamic Nucleotomy','Deep Brain Stimulation only','EMG and Nerve conduction study'], ans:1, exp:'Ablation surgery involves the stereotactic ablation of areas in the thalamus (thalamotomy), globus pallidus (pallidotomy), and subthalamic nucleus (subthalamic nucleotomy).' }
            ]
          },
          {
            name: 'CNS V',
            questions: [
          { q:'Which of the following is considered the most sensitive and earliest clinical manifestation of increased Intracranial Pressure (ICP)?', opts:['Projectile vomiting','Bradycardia','Altered Level of Consciousness (LOC)','Papilledema'], ans:2, exp:'Altered LOC is listed as the most sensitive and earliest indication of increased ICP.' },
          { q:"The pathological changes in Alzheimer's Disease are associated with the abnormal formation of which specific proteins?", opts:['Glucagon and Insulin','Serotonin and Dopamine','Tau and Beta Amyloid','Albumin and Globulin'], ans:2, exp:"Pathological changes in the brain associated with Alzheimer's Disease involve the abnormal formation of Tau and Beta Amyloid proteins, which lead to plaque formation and disrupt normal function." },
          { q:"A patient with Alzheimer's Disease is demonstrating an inability to execute familiar skillful activities, such as brushing their teeth or buttoning a shirt. This clinical manifestation is known as:", opts:['Amnesia','Agnosia','Apraxia','Aphasia'], ans:2, exp:'Apraxia is defined as the inability to execute familiar skillful activities.' },
          { q:"The Cholinergic hypothesis of Alzheimer's Disease suggests that the primary cause is a reduction in which specific neurotransmitter?", opts:['Epinephrine','Dopamine','Gamma-aminobutyric acid (GABA)','Acetylcholine (Ach)'], ans:3, exp:"The Cholinergic hypothesis posits that a reduction in Ach causes Alzheimer's Disease (AD)." },
          { q:"Which of the following medications is a centrally-acting acetylcholinesterase inhibitor listed for the management of Alzheimer's Disease?", opts:['Carbamazepine','Prednisolone','Donepezil (Aricept)','Neostigmine bromide'], ans:2, exp:'Aricept (Donepezil) is listed as a centrally-acting acetylcholinesterase inhibitor, along with Tacrine (Cognex), Rivastigmine (Exelon), and Galantamine (Reminyl).' },
          { q:"Which factor is specifically listed as a risk factor for Alzheimer's Disease (AD)?", opts:['Type 2 Diabetes Mellitus','Chronic Kidney Disease','Downs syndrome','Severe Hypertension'], ans:2, exp:"Downs syndrome is explicitly listed as a risk factor for AD, along with advanced age, family history, obesity, dyslipidemia, and brain injury." },
          { q:'Trigeminal neuralgia (Tic Douloureux) is a disorder affecting which branch of the V cranial nerve (trigeminal nerve)?', opts:['The motor branch','The efferent branch','The sensory or afferent branch','The autonomic branch'], ans:2, exp:'Trigeminal neuralgia is a disorder of the sensory or afferent branch of the V cranial nerve (trigeminal nerve).' },
          { q:'A patient experiencing sharp facial pain associated with Trigeminal Neuralgia reports that the pain is often triggered by simple activities. Which of the following is listed as a common trigger?', opts:['Lying supine','Washing the face','Mild ambient temperature changes','Taking warm baths'], ans:1, exp:'Conditions may be triggered by cold and hot substances, washing the face, chewing foods, or extremely hot or cold fluids.' },
          { q:'In the management of Trigeminal Neuralgia, nursing interventions regarding nutrition include:', opts:['Encouraging large, solid, high-fiber meals','Providing hot beverages and cold desserts','Instructing the patient to chew food on the unaffected side','Administering analgesics for mealtime pain relief'], ans:2, exp:'Nursing management includes instructing the patient to chew food on the unaffected side and providing small feedings of liquids and soft foods.' },
          { q:'Which class of medication is considered the first-line therapy for Trigeminal Neuralgia?', opts:['Antivirals (Acyclovir)','Anticonvulsants (Carbamazepine)','Anticholinesterases (Neostigmine)','Corticosteroids (Prednisolone)'], ans:1, exp:'Anti-convulsants (e.g., Carbamazepine, valproate, phenytoin) are considered the first-line therapy for trigeminal neuralgia to decrease trigeminal nerve activity.' },
          { q:"Bell's Palsy is a disease affecting the motor branch of which specific cranial nerve?", opts:['CN V (Trigeminal)','CN VII (Facial)','CN IX (Glossopharyngeal)','CN XII (Hypoglossal)'], ans:1, exp:"Bell's Palsy is a disease of the motor branch of the facial nerve (VII cranial nerve)." },
          { q:"Which symptom is characteristic of Bell's Palsy clinical manifestations?", opts:['Pain lasting 1-15 minutes along the trigeminal nerve','Bilateral facial paralysis','Unilateral loss of taste','Atrophy of the cerebral cortex'], ans:2, exp:"Clinical manifestations of Bell's Palsy include flaccid facial muscles, inability to raise the eyebrow/smile/close the eyeball, and unilateral loss of taste." },
          { q:"In the nursing management of Bell's Palsy, which intervention is crucial to prevent the loss of muscle tone?", opts:['Protecting the eye with artificial tear instillation','Promoting frequent oral care','Encouraging the patient to do facial exercises','Instructing the client to chew on the unaffected side'], ans:2, exp:'Nursing interventions include encouraging the patient to do facial exercises to prevent the loss of muscle tone.' },
          { q:"Which antiviral medication is listed for the management of Bell's Palsy?", opts:['Pyridostigmine','Acyclovir','Gabapentin','Mannitol'], ans:1, exp:"Antiviral - Acyclovir is listed under the management for Bell's Palsy." },
          { q:'What is the established normal range for Intracranial Pressure (ICP) measurement?', opts:['1-5 mm Hg','7-15 mm Hg','16-20 mm Hg','20-30 mm Hg'], ans:1, exp:'The Normal ICP is specified as 7-15 mm Hg.' },
          { q:'According to the Monroe Kellie Doctrine, if there is an increase in the volume of the brain tissue within the skull, what must occur to maintain a constant pressure?', opts:['The overall volume must increase, leading to a seizure','The CSF volume must increase','There must be a decrease in one or both of the other components (blood or CSF)','Cerebral perfusion pressure will drop instantly to zero'], ans:2, exp:'The Monroe Kellie Doctrine states that the volume of blood, brain, and CSF is constant, and an increase in any component leads to a decrease in one or both components from the cranium.' },
          { q:'In the context of Cerebral Blood Flow (CBF), a hike (increase) in PaCO2 results in which physiological change?', opts:['Cerebral vasoconstriction, leading to decreased ICP','Systemic hypotension, stabilizing ICP','Cerebral vasodilatation, resulting in increased ICP','Autoregulation failure, regardless of MAP'], ans:2, exp:'A hike in PaCO2 results in cerebral vasodilatation, and hence, ICP will also increase.' },
          { q:'Cerebral Perfusion Pressure (CPP) is calculated using which formula?', opts:['CPP = ICP + Mean Arterial Pressure (MAP)','CPP = MAP - Intracranial Pressure (ICP)','CPP = Systolic Blood Pressure (SBP) - Diastolic Blood Pressure (DBP)','CPP = ICP - MAP'], ans:1, exp:'The formula provided is CPP = Mean Arterial Pressure (MAP) - Intracranial Pressure (ICP).' },
          { q:"Which combination of vital signs is characteristic of Cushing's triad, a classical sign of increased ICP?", opts:['Hypotension, Tachycardia, Rapid/Deep respirations','Systolic HTN, Narrowed pulse pressure, Tachycardia','Systolic HTN, Widening of pulse pressure, Bradycardia','Hypotension, Bradycardia, Irregular heart rhythm'], ans:2, exp:"Cushing's triad consists of Systolic HTN, Widening of pulse pressure, and Bradycardia, often accompanied by irregular respiration or bradypnea." },
          { q:'A patient with severe increased ICP exhibits Decorticate (flexor) posturing. This specific posturing pattern is associated with a lesion in which area?', opts:['Brainstem (Pons, mid-brain)','Spinal cord','Cortex','Cerebellum'], ans:2, exp:'Decorticate (Flexor) posturing is associated with a Cortex lesion.' },
          { q:'Which clinical manifestation is listed as a late sign of increased ICP?', opts:['Altered LOC','Headache','Projectile vomiting','Lethargy'], ans:2, exp:'Projectile vomiting is a severe manifestation associated with significantly elevated ICP, listed as a classical sign when pressure is significantly high.' },
          { q:'In the management of increased ICP, the head of the bed should be elevated to what degree?', opts:['15 degrees','30 degrees','45 degrees','60 degrees'], ans:1, exp:'Management includes elevating the head of the bed to 30 degrees.' },
          { q:'Which type of pharmacological agent is specifically used in ICP management to decrease the production of CSF?', opts:['Osmotic diuretic (Mannitol)','Antihypertensives','Anticonvulsants','Carbonic anhydrase inhibitors'], ans:3, exp:'Carbonic anhydrase inhibitors are used to decrease the production of CSF and lower ICP.' },
          { q:"Autoregulation, the brain's ability to maintain a steady cerebral blood flow (CBF), is unable to function when the Mean Arterial Pressure (MAP) is below which critical threshold?", opts:['Less than 15 mm Hg','Less than 50 mm Hg','Greater than 150 mm Hg','Between 70 and 100 mm Hg'], ans:1, exp:'When the mean arterial pressure (MAP) is less than 50 mm Hg or greater than 150 mm Hg, the arterioles are unable to autoregulate.' },
          { q:'Which surgical intervention is used to divert CSF from the ventricles to the peritoneum for the management of increased ICP?', opts:['Craniotomy','Endarterectomy','VP shunt','External ventricular drain (EVD)'], ans:2, exp:'VP shunt is listed under surgical management to divert CSF from ventricles to the peritoneum.' }
            ]
          }
        ]
      },      {
        name: 'GI System', icon: 'fa-utensils', color: '#f59e0b',
        sections: [
          {
            name: 'GI System I',
            questions: [
          { q:"McBurney's point tenderness (appendicitis) is located at:", opts:['Left lower quadrant','Right lower quadrant â€” 1/3 between ASIS and umbilicus','Epigastric region','Right upper quadrant'], ans:1, exp:"McBurney's point: 1/3 of the way from the right ASIS to the umbilicus â€” the appendix location." },
          { q:"Cullen's sign (periumbilical ecchymosis) indicates:", opts:['Appendicitis','Retroperitoneal hemorrhage â€” classic in hemorrhagic pancreatitis','Bowel obstruction','Cholecystitis'], ans:1, exp:"Cullen's sign (periumbilical bruising) + Grey-Turner's sign (flank bruising) both indicate retroperitoneal hemorrhage." },
          { q:'When auscultating the abdomen, the correct order of assessment is:', opts:['Inspect, palpate, percuss, auscultate','Inspect, auscultate, percuss, palpate','Auscultate, inspect, percuss, palpate','Palpate, percuss, auscultate, inspect'], ans:1, exp:'Auscultation before palpation/percussion is critical â€” palpation can alter bowel sounds.' },
          { q:'A patient with liver cirrhosis is most likely to exhibit:', opts:['Peripheral cyanosis and clubbing','Spider angiomata, jaundice, palmar erythema, and ascites','Barrel chest and pursed-lip breathing','JVD and pedal edema only'], ans:1, exp:'Cirrhosis signs: jaundice, spider nevi, palmar erythema, ascites, caput medusae, asterixis (flapping tremor).' },
          { q:'Dietary management for hepatic encephalopathy includes:', opts:['High-protein, high-carbohydrate diet','Protein restriction and lactulose to reduce ammonia production','High-fat, low-carbohydrate diet','Unrestricted diet with albumin supplementation'], ans:1, exp:'Hepatic encephalopathy is driven by ammonia. Protein is restricted; lactulose traps NH3 in the colon as NH4+ and speeds elimination.' },
          { q:"Which feature distinguishes Crohn's disease from ulcerative colitis?", opts:["Crohn's: continuous from rectum; UC: skip lesions","Crohn's: transmural skip lesions, any GI segment; UC: mucosal-only continuous colitis","Crohn's: colon only; UC: involves small bowel","Both are clinically identical"], ans:1, exp:"Crohn's = skip lesions, transmural, any part of GI tract. UC = continuous, mucosal only, colon only, bloody diarrhea." },
          { q:'Dumping syndrome typically occurs:', opts:['12-24 hours after eating','15-30 minutes after eating (early) or 1-3 hours (late)','Only when fasting','Only with high-fat foods'], ans:1, exp:'Early dumping (15-30 min): rapid gastric emptying causes osmotic shift. Late (1-3 hr): reactive hypoglycemia. Tx: small frequent meals, high protein/fat, low simple carbs.' },
          { q:"Murphy's sign (acute cholecystitis) is:", opts:['Rebound tenderness in the RLQ','Inspiratory arrest on deep RUQ palpation due to pain','Periumbilical ecchymosis','Shoulder pain on RUQ palpation'], ans:1, exp:"Murphy's sign: patient inhales deeply while examiner presses under the right costal margin â€” pain causes inspiratory arrest." },
          { q:'Initial management of acute pancreatitis includes:', opts:['Early high-fat oral feeding','NPO (or early enteral nutrition), IV fluids, pain control, and monitoring','Immediate surgery','Antacids and H2 blockers'], ans:1, exp:'Acute pancreatitis: bowel rest, aggressive IV hydration (Lactated Ringer preferred), analgesia, monitoring for complications.' },
          { q:'A nurse finds absent bowel sounds 6 hours post-abdominal surgery. Priority action:', opts:['Encourage oral fluids immediately','Keep NPO, document, and monitor for paralytic ileus','Administer a laxative','Vigorous ambulation immediately'], ans:1, exp:'Absent bowel sounds post-op suggest paralytic ileus. NPO, monitoring, early ambulation (when cleared), and IV fluids are priorities.' },
          { q:'Esophageal varices develop as a complication of:', opts:['GERD','Portal hypertension from liver cirrhosis','Peptic ulcer disease','Mallory-Weiss tear'], ans:1, exp:'Portal hypertension causes collateral circulation through gastroesophageal varices. Rupture causes massive upper GI bleeding.' },
          { q:'A healthy stoma should appear:', opts:['Pale pink with slight edema','Bright red to beefy-red and moist','Blue-black or dark purple','Dry and white'], ans:1, exp:'A healthy stoma is bright red (like oral mucosa) and moist. Blue/black = ischemia â€” report immediately.' },
          { q:'The most accurate method to verify NG tube placement is:', opts:['Auscultating air insufflation','Checking pH of aspirate (pH below 5.5)','Chest X-ray (radiograph)','Observing for respiratory distress'], ans:2, exp:'Gold standard for NG tube placement = chest X-ray. pH testing is a secondary check; auscultation alone is unreliable.' },
          { q:'GERD management includes:', opts:['Sleeping flat and large meals before bed','Elevating head of bed 30 degrees, small frequent meals, and avoiding triggers','High-fat diet and antacids only','Tight abdominal binders'], ans:1, exp:'GERD: HOB elevation, small meals, avoid lying down 2-3 hours post-meal, avoid caffeine/alcohol/spicy/fatty foods, PPIs.' },
          { q:'H. pylori eradication (first-line triple therapy) consists of:', opts:['Antacid + antibiotics for 3 days','PPI + clarithromycin + amoxicillin for 14 days','H2 blocker + one antibiotic for 7 days','Surgery only'], ans:1, exp:'Triple therapy: PPI + 2 antibiotics (clarithromycin + amoxicillin or metronidazole) x 14 days. Compliance is critical.' },
          { q:'TPN (total parenteral nutrition) is most commonly associated with:', opts:['Respiratory alkalosis','CLABSI and hyperglycemia','Hypokalemia from insulin release','Peripheral vein thrombosis only'], ans:1, exp:'TPN risks: central line-associated bloodstream infection (CLABSI), hyperglycemia, electrolyte imbalances, hepatic steatosis.' },
          { q:'Hematemesis (vomiting blood) most likely indicates bleeding from:', opts:['Lower GI tract (below ligament of Treitz)','Upper GI tract (esophagus, stomach, or duodenum)','Urinary tract','Respiratory tract'], ans:1, exp:'Hematemesis = upper GI bleed (above ligament of Treitz). Melena also indicates upper GI bleed. Hematochezia = lower GI bleed.' },
          { q:'Celiac disease requires lifelong:', opts:['Lactose-free diet','Gluten-free diet (no wheat, barley, rye)','Low-FODMAP diet','High-fibre diet'], ans:1, exp:'Celiac = immune-mediated enteropathy triggered by gluten. Strict gluten-free diet allows mucosal healing.' },
          { q:'Hepatitis A is transmitted via:', opts:['Blood and body fluids','Fecal-oral route (contaminated food and water)','Sexual contact primarily','Vertical (mother-to-child)'], ans:1, exp:'Hep A: fecal-oral. Self-limiting, no chronic form. Vaccine available.' },
          { q:'Hepatitis B is transmitted via:', opts:['Fecal-oral route only','Blood, sexual contact, and vertical (perinatal) transmission','Airborne droplets','Insect bites'], ans:1, exp:'Hep B: parenteral, sexual, and vertical (mother to baby during birth). Can progress to chronic hepatitis, cirrhosis, HCC.' },
          { q:'Ascites is managed with:', opts:['High-sodium diet and oral steroids','Sodium restriction, spironolactone, and therapeutic paracentesis','High-protein diet and furosemide alone','Antibiotics and fluid restriction'], ans:1, exp:'Ascites: sodium restriction (below 2 g/day), spironolactone (first-line diuretic), furosemide, large-volume paracentesis for symptomatic/refractory cases.' },
          { q:'Signs of peritonitis include:', opts:['Soft abdomen with normal bowel sounds','Rigid board-like abdomen, rebound tenderness, and absent bowel sounds','Distended abdomen with hyperactive bowel sounds','Epigastric pain relieved by food'], ans:1, exp:'Peritonitis: intense diffuse abdominal pain, guarding, rigidity, rebound tenderness, absent bowel sounds, fever â€” surgical emergency.' },
          { q:'Compared to a colostomy, an ileostomy produces:', opts:['Formed stool similar to normal defecation','Liquid to semi-liquid output (large bowel water absorption is bypassed)','No output for the first week','Bloody output for 2-3 days'], ans:1, exp:'Ileostomy = small bowel stoma â€” liquid/semi-liquid output. Colostomy output is more formed depending on location.' },
          { q:'Priority monitoring for a patient with a Sengstaken-Blakemore tube:', opts:['Urinary retention','Airway obstruction from balloon migration','Wound dehiscence','Electrolyte imbalance only'], ans:1, exp:'Blakemore tube balloons can migrate and compress the airway â€” always have scissors at bedside to cut tube if needed.' },
          { q:'Which lab finding is characteristic of acute pancreatitis?', opts:['Elevated troponin I','Elevated serum amylase and lipase (above 3x upper limit of normal)','Elevated AST and ALT only','Elevated ALP and GGT'], ans:1, exp:'Amylase and lipase both rise in pancreatitis; lipase is more specific. Aminotransferases suggest hepatitis; ALP/GGT suggests biliary disease.' }
            ]
          },
          {
            name: 'GI System II',
            questions: [
          { q:'GERD (gastroesophageal reflux disease) is best diagnosed by:', opts:['CT scan of the abdomen','24-hour pH monitoring (gold standard) or esophageal manometry'], ans:1, exp:'24-hour ambulatory pH monitoring: records acid exposure in esophagus over 24 hours. Gold standard for GERD diagnosis when empirical PPI trial is inconclusive.' },
          { q:'Proton pump inhibitors (PPIs) like omeprazole should be taken:', opts:['With food or immediately after eating','30-60 minutes before the first meal of the day (peak acid suppression)'], ans:1, exp:'PPIs are prodrugs activated by acid. Best taken 30-60 min before first meal to inhibit active proton pumps. Evening dose if nocturnal symptoms.' },
          { q:'Mallory-Weiss tear results from:', opts:['H. pylori infection','Forceful vomiting causing a mucosal tear at the gastroesophageal junction'], ans:1, exp:'Mallory-Weiss tear: longitudinal mucosal laceration at GEJ from forceful vomiting (classically in alcoholics). Presents with hematemesis after vomiting. Usually self-limiting; endoscopic treatment if significant.' },
          { q:'Acute bleeding esophageal varices are managed with:', opts:['Emergency surgery only','IV octreotide (vasopressin analogue), endoscopic band ligation, and antibiotic prophylaxis'], ans:1, exp:'Variceal bleed: octreotide reduces portal pressure, endoscopic band ligation controls bleeding, antibiotics prevent SBP (ceftriaxone). TIPSS for refractory cases.' },
          { q:'Achalasia is characterized by:', opts:['Hypermotility of the esophagus with rapid emptying','Failure of lower esophageal sphincter relaxation with absent peristalsis causing dysphagia'], ans:1, exp:'Achalasia: LES fails to relax + absent peristalsis. Progressive dysphagia to solids then liquids, regurgitation, weight loss. Barium swallow: bird-beak narrowing. Treat: pneumatic dilation or Heller myotomy.' },
          { q:'Sliding hiatal hernia vs paraesophageal hernia:', opts:['Both are clinically identical','Sliding (most common): GEJ herniates â€” causes GERD. Paraesophageal: fundus herniates alongside GEJ â€” risk of strangulation'], ans:1, exp:'Sliding hiatal hernia (95%): GEJ slides above diaphragm â€” GERD symptoms. Paraesophageal hernia: fundus herniates but GEJ stays â€” risk of volvulus and strangulation (surgical emergency).' },
          { q:'Dumping syndrome dietary management includes:', opts:['Large meals 3 times daily, high simple carbohydrates','Small frequent meals (6 per day), high protein and fat, low simple carbs, avoid fluids with meals'], ans:1, exp:'Dumping syndrome: small frequent meals, lie down 30 min after eating (delays gastric emptying), avoid simple sugars and fluids with meals. Octreotide for refractory cases.' },
          { q:'Upper GI bleed management priorities include:', opts:['Oral antacids and observation','IV access x2 large bore, fluid resuscitation, type and crossmatch, NPO, urgent endoscopy'], ans:1, exp:'Upper GI bleed: large-bore IV x2, aggressive fluid resuscitation, blood transfusion (target Hb 7-8 g/dL), NPO, urgent EGD (diagnostic + therapeutic). PPI infusion reduces re-bleeding.' },
          { q:'Coffee ground emesis indicates:', opts:['Fresh active arterial bleeding','Old blood â€” digestion of hemoglobin by gastric acid (slower upper GI bleed)'], ans:1, exp:'Coffee ground emesis = blood oxidized by gastric acid = slower upper GI bleed (peptic ulcer, gastric cancer). Bright red hematemesis = active arterial bleed (variceal, severe ulcer).' },
          { q:'Melena (black tarry stool) indicates:', opts:['Lower GI bleed below sigmoid colon','Upper GI bleed (typically) â€” blood passes through GI tract and is digested, appearing black and tarry'], ans:1, exp:'Melena: upper GI bleed. Requires approximately 50-80 mL blood in upper GI tract. Characteristic foul tarry odor. Hematochezia (bright red per rectum): lower GI bleed or massive upper GI bleed.' },
          { q:'Peptic ulcer disease: gastric vs duodenal ulcer pain difference:', opts:['Both cause identical constant pain','Gastric ulcer: pain worsened by eating. Duodenal ulcer: pain relieved by eating, worsened 2-4 hours later (hunger pain)'], ans:1, exp:'Gastric ulcer: eating worsens pain (food stimulates acid/gastric motor activity). Duodenal ulcer: food buffers acid â€” eating relieves pain, then pain returns 2-4 hours later (acid rebound).' },
          { q:'Nasogastric tube (NGT) insertion nursing steps include:', opts:['Insert with head extended, check by auscultation only','Measure NEX (nose-earlobe-xiphoid) length, use water-based lubricant, head flexed, confirm by X-ray'], ans:1, exp:'NGT insertion: NEX measurement, lubricate tip, head flexed (closes airway), advance to measured length, confirm by X-ray before use. Never force past resistance.' },
          { q:'Esophageal cancer risk factors include:', opts:['Frequent exercise and high fiber diet','GERD and Barrett esophagus (adenocarcinoma), smoking and alcohol (squamous cell carcinoma)'], ans:1, exp:'Esophageal cancer: adenocarcinoma (rising) â€” GERD, Barrett esophagus, obesity. Squamous cell carcinoma â€” tobacco, alcohol, achalasia, hot liquids. Progressive dysphagia (solids to liquids) is the classic presentation.' },
          { q:'Gastric outlet obstruction causes:', opts:['Diarrhea and hypokalemia','Projectile non-bilious vomiting leading to metabolic alkalosis and hypokalemia (from HCl and K+ loss)'], ans:1, exp:'Gastric outlet obstruction: persistent vomiting of gastric contents (HCl, K+) causes hypochloremic hypokalemic metabolic alkalosis. NGT decompression, IV fluid correction.' },
          { q:'H2 receptor blockers (ranitidine, famotidine) mechanism:', opts:['Block proton pump (H+/K+ ATPase)','Block histamine H2 receptors on parietal cells, reducing acid secretion'], ans:1, exp:'H2 blockers: competitive antagonists of histamine H2 receptors on parietal cells. Reduce basal and meal-stimulated acid secretion. Less potent than PPIs but faster onset.' },
          { q:'NSAID gastropathy prevention includes:', opts:['Taking NSAIDs on an empty stomach','Co-administration of PPI or misoprostol, lowest effective NSAID dose, COX-2 selective NSAIDs'], ans:1, exp:'NSAID gastropathy: NSAIDs inhibit COX-1 â†’ reduce prostaglandin (mucosal protection) â†’ ulcers. Prevention: PPI with NSAID, misoprostol, COX-2 selective (celecoxib) â€” lower GI risk.' },
          { q:'Gastric cancer most common type worldwide is:', opts:['Leiomyosarcoma','Adenocarcinoma (intestinal or diffuse type)'], ans:1, exp:'Gastric cancer: 95% adenocarcinoma. H. pylori is the most important risk factor. Diffuse type (signet ring cells): associated with CDH1 mutation, poor prognosis, younger patients. Intestinal type: H. pylori, dietary nitrates.' },
          { q:'Zollinger-Ellison syndrome is caused by:', opts:['H. pylori infection alone','Gastrin-secreting tumor (gastrinoma) causing massive acid hypersecretion and multiple peptic ulcers'], ans:1, exp:'ZES: gastrinoma in pancreas or duodenum secretes excess gastrin. Multiple ulcers in unusual locations (distal duodenum, jejunum), refractory to standard treatment, diarrhea. Diagnose: serum gastrin level.' },
          { q:'Total enteral nutrition (TEN) via NGT is preferred over TPN because:', opts:['TEN is more cost-effective only','TEN preserves gut mucosal integrity, reduces bacterial translocation, CLABSI risk, and is associated with better outcomes in critically ill patients'], ans:1, exp:'Enteral nutrition maintains gut integrity, prevents mucosal atrophy and bacterial translocation. Preferred over TPN in almost all situations where GI tract is functional. "If the gut works, use it."' },
          { q:'Proton pump inhibitors long-term risks include:', opts:['Only minimal side effects at any dose','Hypomagnesemia, C. difficile infection risk, community-acquired pneumonia risk, osteoporosis/hip fractures, Vitamin B12 deficiency'], ans:1, exp:'Long-term PPI: reduces gastric acid (needed for Mg2+ and B12 absorption), increases C. diff risk (altered gut flora), increases pneumonia risk (acid barrier reduced), bone density loss.' },
          { q:'Octreotide (somatostatin analogue) in upper GI bleeding works by:', opts:['Directly lysing blood clots','Reducing portal pressure by inhibiting splanchnic vasodilation and decreasing gastrointestinal hormone secretion'], ans:1, exp:'Octreotide: reduces portal hypertension by inhibiting vasodilatory GI hormones. First-line pharmacological treatment for variceal bleeding alongside endoscopic therapy.' },
          { q:'Barrett esophagus is a risk factor for:', opts:['Squamous cell carcinoma only','Esophageal adenocarcinoma (malignant transformation of metaplastic columnar epithelium)'], ans:1, exp:'Barrett esophagus: GERD-induced replacement of squamous esophageal epithelium with intestinal columnar metaplasia. Increases adenocarcinoma risk 30-125 times. Requires surveillance endoscopy.' },
          { q:'Nasogastric tube feeding aspiration prevention includes:', opts:['Bolus feeding in supine position','HOB elevated 30-45 degrees, check residuals, aspirate before each feeding (intermittent)'], ans:1, exp:'Aspiration prevention: HOB 30-45 degrees at all times during feeding, gastric residual checks (hold if above 200-500 mL per protocol), oral hygiene, confirm tube position before feeding.' },
          { q:'Gastrostomy tube (G-tube) care includes:', opts:['Daily tube rotation and cleaning around insertion site with soap and water','Pulling tube in and out daily to prevent granulation tissue'], ans:0, exp:'G-tube care: rotate tube daily (prevents embedded bumper), clean site with soap and water, check balloon water (deflation monthly), monitor for granulation tissue, leakage, infection.' }
            ]
          },
          {
            name: 'GI System III',
            questions: [
          { q:'Hepatitis B surface antigen (HBsAg) indicates:', opts:['Immunity from prior vaccination','Active hepatitis B infection (acute or chronic) â€” patient is infectious'], ans:1, exp:'HBsAg: present in active HBV infection (acute or chronic). Persists more than 6 months = chronic HBV. HBsAb: indicates immunity (vaccination or resolved infection). HBcAb: past or current infection.' },
          { q:'Hepatitis C treatment (direct-acting antivirals) achieves sustained virological response in:', opts:['Less than 20% of patients','Over 95% of patients with modern DAA regimens'], ans:1, exp:'Modern DAAs (sofosbuvir + ledipasvir, glecaprevir + pibrentasvir): SVR rates above 95% in 8-12 weeks. SVR = cured (undetectable HCV RNA 12 weeks after treatment completion).' },
          { q:'Child-Pugh score for liver cirrhosis assesses:', opts:['Tumor burden in liver cancer','Bilirubin, albumin, PT/INR, ascites, and encephalopathy â€” predicts surgical risk and prognosis'], ans:1, exp:'Child-Pugh score (A/B/C): bilirubin, albumin, PT/INR, presence and severity of ascites and encephalopathy. Score 5-6=A (mild), 7-9=B (moderate), 10-15=C (severe).' },
          { q:'Portal hypertension complications include:', opts:['Hypertension only','Esophageal/gastric varices, ascites, splenomegaly, portosystemic encephalopathy, spontaneous bacterial peritonitis'], ans:1, exp:'Portal hypertension (portal pressure above 12 mmHg): varices (risk of fatal bleed), ascites, hypersplenism (thrombocytopenia), HE, SBP. Caused by cirrhosis in 90% of cases.' },
          { q:'Lactulose treats hepatic encephalopathy by:', opts:['Directly detoxifying ammonia in the blood','Converting NH3 (ammonia) to NH4+ (trapped in colon), acidifying colonic contents, and increasing stool frequency'], ans:1, exp:'Lactulose: metabolized by colonic bacteria producing acid environment that traps ammonia as NH4+ (cannot be absorbed). Also acts as cathartic. Dose adjusted to 2-3 soft stools/day.' },
          { q:'Spontaneous bacterial peritonitis (SBP) diagnosis requires:', opts:['Culture-positive ascitic fluid only','Ascitic fluid PMN count above 250 cells/mcL (with or without positive culture)'], ans:1, exp:'SBP: PMN count above 250 cells/mcL in ascitic fluid. Culture may be negative (culture-negative SBP). Commonest organism: E. coli. Treat: ceftriaxone or ciprofloxacin. Prophylaxis: norfloxacin.' },
          { q:'Hepatorenal syndrome (HRS) is best described as:', opts:['Hepatitis-induced kidney inflammation','Functional renal failure in cirrhosis from severe renal vasoconstriction â€” kidneys histologically normal'], ans:1, exp:'HRS: cirrhosis causes splanchnic vasodilation and reflex renal vasoconstriction. Rising creatinine with no other cause. Two types: HRS-AKI (type 1, rapid) and HRS-CKD (type 2, slower). Treatment: vasoconstrictors + albumin.' },
          { q:'Liver biopsy post-procedure nursing care includes:', opts:['Immediately ambulate and resume full diet','Right lateral position for 2 hours (liver compression), vital signs every 15 min, observe for hemorrhage and pneumothorax'], ans:1, exp:'Post liver biopsy: right lateral decubitus position for 2 hours (compresses liver), bed rest 4-6 hours, vital signs monitoring, watch for right shoulder pain (diaphragmatic irritation), bleeding, pneumothorax.' },
          { q:'Obstructive jaundice (post-hepatic) characteristics:', opts:['Unconjugated bilirubin elevated, dark urine, pale stools','Conjugated bilirubin elevated, dark urine (bilirubin in urine), pale stools (no bile to intestine)'], ans:1, exp:'Post-hepatic (obstructive) jaundice: bile flow blocked (gallstones, pancreatic cancer). Conjugated bilirubin backs up into blood, spills into urine (dark), absent in intestine (pale/clay stools).' },
          { q:'Cholecystitis nursing care includes:', opts:['High-fat diet to stimulate bile flow','NPO initially, IV fluids, analgesics, antibiotics, and preparation for cholecystectomy'], ans:1, exp:'Acute cholecystitis: NPO, IV fluids, analgesics (morphine or ketorolac), antibiotics if complicated, urgent laparoscopic cholecystectomy (ideally within 72 hours of symptom onset).' },
          { q:'Gallstone composition most commonly is:', opts:['Pure uric acid stones','Cholesterol stones (80%) in Western populations'], ans:1, exp:'Cholesterol gallstones (80%): risk factors â€” female, fat, forty, fertile, fair (5Fs). Also obesity, rapid weight loss, pregnancy, OCP. Pigment stones: hemolytic anemia, cirrhosis, biliary infection.' },
          { q:'Ranson criteria (acute pancreatitis severity) at admission include:', opts:['Temperature above 39C and lipase above 1000','Age above 55, WBC above 16,000, glucose above 200, LDH above 350, AST above 250'], ans:1, exp:'Ranson criteria admission: age above 55, WBC above 16k, glucose above 200, LDH above 350, AST above 250. At 48h: additional 5 criteria. Score above 3 = severe pancreatitis.' },
          { q:'Chronic pancreatitis causes:', opts:['Acute onset abdominal pain only','Malabsorption (steatorrhea) from exocrine insufficiency, diabetes from endocrine failure, chronic pain, and calcifications'], ans:1, exp:'Chronic pancreatitis: progressive fibrosis from repeated injury (alcohol #1, genetic, autoimmune). Exocrine failure causes fat malabsorption (steatorrhea). Endocrine failure causes DM. Pain management is key.' },
          { q:'Pancreatic enzyme replacement therapy (PERT) in chronic pancreatitis is taken:', opts:['Once daily on an empty stomach','With every meal and snack containing fat'], ans:1, exp:'PERT (pancrelipase): must be taken WITH meals (not before/after). Dose adjusted to achieve normal stool consistency. Monitor for adequate response (weight gain, reduced steatorrhea).' },
          { q:'Primary biliary cholangitis (PBC) is characterized by:', opts:['Caused by bile duct gallstones','Autoimmune destruction of intrahepatic bile ducts â€” associated with anti-mitochondrial antibodies (AMA)'], ans:1, exp:'PBC: autoimmune disease, predominantly women, associated with AMA (positive in 95%). Progressive cholestatic liver disease. Pruritus is often the first symptom. Treat: ursodeoxycholic acid.' },
          { q:'ERCP (endoscopic retrograde cholangiopancreatography) post-procedure monitoring includes:', opts:['Only pain assessment','Vital signs, amylase/lipase (post-ERCP pancreatitis), abdominal pain, fever (cholangitis), bleeding'], ans:1, exp:'Post-ERCP complications: pancreatitis (most common â€” 3-5%), cholangitis, perforation, bleeding. Monitor amylase 4-6 hours post-procedure. Report fever, severe abdominal pain, jaundice.' },
          { q:'Liver transplant rejection signs include:', opts:['Normal LFTs with fatigue only','Elevated LFTs, fever, jaundice, malaise â€” confirmed by biopsy'], ans:1, exp:'Liver transplant rejection (acute cellular rejection): elevated bilirubin, ALT/AST rise, fever, malaise, jaundice, right upper quadrant pain. Biopsy confirms. Treat with high-dose IV methylprednisolone.' },
          { q:'Spironolactone is preferred over furosemide as first-line in cirrhotic ascites because:', opts:['It works faster','It counteracts secondary hyperaldosteronism (major mechanism driving ascites formation in cirrhosis)'], ans:1, exp:'In cirrhotic ascites: secondary hyperaldosteronism drives sodium and water retention. Spironolactone (aldosterone antagonist) addresses the mechanism. Furosemide added for additional diuresis (ratio 100:40 mg).' },
          { q:'Pancreatic pseudocyst is a complication of:', opts:['Chronic constipation','Acute or chronic pancreatitis â€” a fluid-filled cavity enclosed by fibrous tissue, not a true epithelial cyst'], ans:1, exp:'Pancreatic pseudocyst: fluid collection after pancreatitis, enclosed in fibrous tissue. Most resolve spontaneously. Large/symptomatic: drainage (endoscopic cystgastrostomy). Monitor for infection, hemorrhage.' },
          { q:'INR is prolonged in liver failure because:', opts:['Kidneys fail to excrete clotting factors','The liver produces coagulation factors (II, VII, IX, X) â€” liver failure reduces their synthesis'], ans:1, exp:'Liver synthesizes: fibrinogen (I), II, V, VII, IX, X, XI, and protein C/S. Liver failure impairs coagulation factor production causing prolonged PT/INR. Vitamin K may partially correct if not true synthetic failure.' },
          { q:'Alpha-fetoprotein (AFP) is elevated in:', opts:['Viral hepatitis only','Hepatocellular carcinoma (HCC) â€” used for surveillance in cirrhotic patients'], ans:1, exp:'AFP: tumor marker for HCC. Used for HCC surveillance (AFP + liver ultrasound every 6 months in cirrhosis). Also elevated in yolk sac tumors and occasionally benign liver disease. Diagnosis: imaging + biopsy.' },
          { q:'Non-alcoholic fatty liver disease (NAFLD) management includes:', opts:['Specific medication targeting NAFLD only','Weight loss (7-10%), exercise, diabetes and lipid control â€” no approved pharmacotherapy'], ans:1, exp:'NAFLD/NASH: weight loss 7-10% improves histology. Address metabolic risk factors (obesity, diabetes, dyslipidemia). Lifestyle modification is the only proven treatment. Vitamin E in non-diabetic NASH.' },
          { q:'Grey-Turner sign in pancreatitis appears at:', opts:['Epigastric area','Flanks (retroperitoneal hemorrhage tracking to flanks)'], ans:1, exp:"Grey-Turner sign: flank ecchymosis from retroperitoneal hemorrhage in severe pancreatitis. Cullen's sign: periumbilical ecchymosis. Both indicate severe hemorrhagic pancreatitis â€” poor prognosis." },
          { q:'Hepatic artery thrombosis post-liver transplant requires:', opts:['Observation for 48 hours','Urgent re-exploration or interventional radiology â€” most serious early vascular complication'], ans:1, exp:'Hepatic artery thrombosis: most serious early post-transplant vascular complication (occurs within 30 days). Causes graft failure and biliary necrosis. Urgent surgical re-exploration or thrombolysis. Retransplant often required.' }
            ]
          },
          {
            name: 'GI System IV',
            questions: [
          { q:'Ulcerative colitis (UC) distinguishing features include:', opts:['Skip lesions, transmural inflammation, rectal sparing','Continuous mucosal inflammation always starting from rectum, blood and mucus in stool'], ans:1, exp:'UC: continuous inflammation from rectum extending proximally (never skips). Mucosal only (not transmural). Bloody diarrhea, urgency, tenesmus. Complication: toxic megacolon.' },
          { q:'Toxic megacolon is a complication of:', opts:['Appendicitis','Severe ulcerative colitis or Crohn colitis â€” colonic dilation above 6 cm with systemic toxicity'], ans:1, exp:'Toxic megacolon: fulminant colitis causing colonic dilation above 6 cm, systemic toxicity (fever, tachycardia, leukocytosis, peritoneal signs). High mortality. Treatment: aggressive medical (bowel rest, IV steroids, antibiotics) or urgent colectomy.' },
          { q:'5-aminosalicylate (5-ASA) medications (mesalamine) are first-line for:', opts:['Crohn disease only','Mild-to-moderate ulcerative colitis â€” maintenance of remission and induction'], ans:1, exp:'5-ASA (mesalamine, sulfasalazine): anti-inflammatory at colonic mucosa. First-line for mild-moderate UC. Available as oral, enema, suppository. Less effective in Crohn disease.' },
          { q:'Biologics (anti-TNF agents like infliximab) in IBD nursing considerations include:', opts:['No special precautions needed','TB screening (TST or IGRA) before initiation, monitor for infections, withhold for serious infection or fever'], ans:1, exp:'Anti-TNF biologics (infliximab, adalimumab): screen for latent TB (IGRA/TST + CXR), hepatitis B, fungal infections. Risk of serious opportunistic infections. Withhold if serious infection develops. Live vaccines contraindicated.' },
          { q:'Bowel obstruction: small bowel vs large bowel characteristics:', opts:['Both present identically','Small bowel: central crampy pain, vomiting early, high-pitched tinkling bowel sounds. Large bowel: distension predominates, vomiting late'], ans:1, exp:'Small bowel obstruction (adhesions #1): periumbilical pain, early vomiting, hyperactive/high-pitched bowel sounds, central distension. Large bowel obstruction (cancer #1): marked distension, late vomiting, peripheral distribution.' },
          { q:'Diverticulitis differs from diverticulosis in that:', opts:['Both are the same condition','Diverticulosis: asymptomatic colonic outpouchings. Diverticulitis: inflamed/infected diverticula causing LLQ pain, fever, leukocytosis'], ans:1, exp:'Diverticulosis: outpouchings (usually sigmoid colon) â€” asymptomatic. Diverticulitis: inflammation/infection â€” LLQ pain, fever, leukocytosis, nausea. CT confirms. Uncomplicated: antibiotics and bowel rest. Complicated: perforation, abscess â€” surgery.' },
          { q:'Appendicitis classic presentation includes:', opts:['LLQ pain and diarrhea without fever','Periumbilical pain migrating to RLQ (McBurney point), nausea, vomiting, fever, rebound tenderness'], ans:1, exp:'Appendicitis: begins as periumbilical/diffuse pain, migrates to RLQ within 24 hours. Anorexia, nausea, fever (low-grade). Rebound tenderness at McBurney point. WBC elevated. CT is most accurate.' },
          { q:'Irritable bowel syndrome (IBS) is characterized by:', opts:['Bloody diarrhea with mucosal inflammation on colonoscopy','Chronic abdominal pain with altered bowel habits (diarrhea, constipation, or mixed) without structural abnormality (Rome IV criteria)'], ans:1, exp:'IBS: functional GI disorder, no mucosal inflammation. Rome IV criteria: recurrent abdominal pain at least 1 day/week for 3 months, related to defecation, onset + change in stool form/frequency. Stress and diet trigger.' },
          { q:'Colorectal cancer screening starts at what age for average-risk individuals?', opts:['Age 30','Age 45 (updated from 50 by USPSTF in 2021)'], ans:1, exp:'ACS and USPSTF now recommend colorectal cancer screening beginning at age 45 for average-risk individuals. Options: colonoscopy every 10 years, annual FIT (fecal immunochemical test), flexible sigmoidoscopy.' },
          { q:'Rectal prolapse nursing care includes:', opts:['Manual reduction only by the patient at home','Applying moist saline gauze to protect mucosa, gentle manual reduction with steady pressure, notify provider'], ans:1, exp:'Rectal prolapse: apply wet saline gauze to protect exposed mucosa, keep moist, gentle manual reduction with constant steady pressure (not rapid force), elevate hips if possible, notify provider urgently.' },
          { q:'Colostomy irrigation is done to:', opts:['Treat an active infection','Regulate colostomy output and reduce use of pouch in some sigmoid colostomy patients'], ans:1, exp:'Colostomy irrigation: instilling water to stimulate defecation. Only suitable for sigmoid/descending colostomies with firm predictable output. Patient may be pouch-free between irrigations once regulated.' },
          { q:'Clostridium difficile (C. diff) infection prevention requires:', opts:['Standard precautions with gloves only','Contact precautions, soap and water handwashing (not alcohol gel â€” spores resistant to alcohol), dedicated equipment'], ans:1, exp:'C. diff: contact precautions, private room if possible. Alcohol hand gel DOES NOT kill C. diff spores â€” soap and water required. Bleach disinfection of environment. Precipitants: recent antibiotics, PPIs.' },
          { q:'Crohn disease extra-intestinal manifestations include:', opts:['None â€” Crohn is confined to GI tract','Uveitis, episcleritis, erythema nodosum, pyoderma gangrenosum, ankylosing spondylitis, primary sclerosing cholangitis, aphthous ulcers'], ans:1, exp:'Crohn extra-intestinal manifestations: joints (arthritis, ankylosing spondylitis), eyes (uveitis, episcleritis), skin (EN, PG), liver (PSC â€” more common in UC). May precede or parallel bowel activity.' },
          { q:'Hemorrhoids: internal vs external:', opts:['Both cause identical pain and bleeding','Internal: above dentate line, painless bleeding. External: below dentate line, painful, can thrombose'], ans:1, exp:'Internal hemorrhoids: above dentate line (no somatic innervation) â€” painless bright red rectal bleeding. External hemorrhoids: below dentate line (rich innervation) â€” painful, especially if thrombosed.' },
          { q:'Bowel preparation for colonoscopy typically involves:', opts:['48-hour fast only','Low-residue diet then polyethylene glycol (PEG) solution or sodium phosphate â€” clears colon for visualization'], ans:1, exp:'Colonoscopy prep: split-dose PEG solution (4L or 2L + adjuncts), bisacodyl, or sodium picosulfate. Low-residue diet 1-2 days before. Clear liquids day before. NPO 4-6 hours before procedure.' },
          { q:'After colonoscopy, patients should be informed:', opts:['Resume all activity and diet immediately including driving','Expect bloating and gas from air insufflation, minor bleeding if polyp removed, avoid driving 24 hours if sedated, return if severe pain or heavy bleeding'], ans:1, exp:'Post-colonoscopy: bloating and cramping normal (air insufflation). Minor spotting after polypectomy normal. Report: severe abdominal pain (perforation), heavy rectal bleeding, fever. No driving 24 hours if sedated.' },
          { q:'Antidiarrheal agents (loperamide â€” Imodium) are CONTRAINDICATED in:', opts:['All cases of diarrhea','Bloody diarrhea, suspected infectious colitis (C. diff, E. coli O157:H7), or inflammatory bowel disease flare'], ans:1, exp:'Loperamide: slows intestinal motility. Contraindicated in bloody/inflammatory diarrhea â€” retains toxins and bacteria, can cause toxic megacolon. Use only in non-infectious functional diarrhea.' },
          { q:'Celiac disease diagnostic testing includes:', opts:['Colonoscopy alone','Serology (anti-tTG IgA antibody + total IgA) followed by small bowel biopsy (gold standard)'], ans:1, exp:'Celiac diagnosis: anti-tissue transglutaminase IgA (most sensitive and specific). Check total IgA (IgA deficiency causes false negative). Duodenal biopsy on gluten-containing diet: villous atrophy confirms.' },
          { q:'Lactose intolerance management includes:', opts:['Complete avoidance of all dairy products','Reducing lactose-containing foods, using lactase enzyme supplements, or consuming fermented dairy (yogurt, hard cheese)'], ans:1, exp:'Lactose intolerance: reduced lactase enzyme. Manage: reduce lactose intake, use lactase drops/tablets with dairy, choose hard cheese and yogurt (less lactose), lactose-free dairy products. Not the same as milk allergy.' },
          { q:'Acute mesenteric ischemia presentation is:', opts:['Gradual onset crampy pain that improves with eating','Sudden severe abdominal pain out of proportion to physical findings â€” vascular emergency'], ans:1, exp:'Acute mesenteric ischemia: sudden severe pain out of proportion to exam (early), then peritonitis as bowel infarcts. AF embolism is most common cause. Urgent CT angiography. High mortality.' },
          { q:'Laxative types: osmotic vs stimulant:', opts:['Both work identically','Osmotic (lactulose, PEG): draw water into colon. Stimulant (bisacodyl, senna): stimulate peristalsis by irritating colon wall'], ans:1, exp:'Osmotic laxatives (PEG, lactulose, MgOH): increase luminal water. Stimulant laxatives (bisacodyl, senna, castor oil): stimulate colon motility directly. Bulk-forming (psyllium): increase stool bulk.' },
          { q:'Volvulus (sigmoid most common) management:', opts:['Conservative management always','Urgent endoscopic decompression (sigmoidoscope/rectal tube) or surgery if compromised bowel'], ans:1, exp:'Sigmoid volvulus: sigmoid colon twists on its mesentery causing obstruction. Decompression with sigmoidoscope if no peritonitis. Surgery (sigmoid resection) for recurrence or gangrenous bowel.' },
          { q:'Anorectal fistula (fistula-in-ano) nursing care includes:', opts:['No special care required after surgery','Sitz baths, wound care, dressing changes â€” patient education on drainage, hygiene, and follow-up'], ans:1, exp:'Fistula-in-ano: abnormal tract between anal canal and perianal skin (often from abscess). Surgical treatment (fistulotomy or seton placement). Post-op: sitz baths, wound care, dressing changes, avoid constipation.' }
            ]
          },
          {
            name: 'GI System V',
            questions: [
          { q:'Abdominal assessment sequence is:', opts:['Inspect, palpate, percuss, auscultate','Inspect, auscultate, percuss, palpate'], ans:1, exp:'Auscultation BEFORE palpation/percussion in abdominal assessment to prevent alteration of bowel sounds. Inspect for distension, scars, peristalsis, then auscultate, percuss, palpate.' },
          { q:'Serum albumin as a nutritional marker reflects:', opts:['Caloric intake over the past 24 hours','Nutritional status over 2-3 weeks (half-life 20 days) â€” marker of chronic malnutrition'], ans:1, exp:'Albumin: half-life 20 days â€” reflects chronic (weeks to months) nutritional status. Normal: 3.5-5 g/dL. Below 3.5: hypoalbuminemia (malnutrition, liver failure, protein-losing states). Prealbumin: half-life 2-3 days â€” more acute.' },
          { q:'Prealbumin (transthyretin) is preferred over albumin for monitoring nutritional response because:', opts:['It is a better marker of chronic malnutrition','It has a shorter half-life (2-3 days) reflecting recent changes in nutritional intake'], ans:1, exp:'Prealbumin (half-life 2-3 days): rapidly changes with nutrition support â€” better for monitoring response to treatment. Albumin (half-life 20 days): too slow for short-term monitoring.' },
          { q:'Nasogastric feeding residual volume check â€” hold feed if residual exceeds:', opts:['25 mL','Institutional protocol (commonly 200-500 mL) â€” if elevated, hold and reassess in 1-2 hours'], ans:1, exp:'High gastric residual volumes (above 200-500 mL per protocol) indicate delayed gastric emptying â€” risk of aspiration. Hold feeding, reposition, assess for ileus, consider prokinetic agent (metoclopramide).' },
          { q:'Ondansetron (Zofran) mechanism of action is:', opts:['Dopamine D2 receptor antagonist','Serotonin (5-HT3) receptor antagonist â€” blocks receptors in gut and CTZ'], ans:1, exp:'Ondansetron: 5-HT3 antagonist. Blocks serotonin receptors in the GI tract and chemoreceptor trigger zone (CTZ). Effective for chemotherapy-induced, post-operative, and radiation-induced nausea/vomiting.' },
          { q:'Metoclopramide (Reglan) side effect of concern is:', opts:['Hypertension and tachycardia','Extrapyramidal symptoms (EPS) â€” tardive dyskinesia with long-term use'], ans:1, exp:'Metoclopramide: dopamine D2 antagonist and 5-HT4 agonist. EPS risk (acute dystonia, parkinsonism, akathisia, tardive dyskinesia with long-term use). Contraindicated in Parkinson disease and bowel obstruction.' },
          { q:'Loperamide (Imodium) mechanism:', opts:['Stimulates intestinal secretion','Acts on opioid receptors in the intestine (does not cross BBB) â€” slows motility and reduces secretion'], ans:1, exp:'Loperamide: peripheral opioid receptor agonist in intestinal wall. Slows peristalsis, reduces intestinal secretion and increases sphincter tone. Does not enter CNS. No analgesic effect.' },
          { q:'Lactulose dose in hepatic encephalopathy is titrated to:', opts:['Blood ammonia level normalization only','2-3 soft stools per day â€” sign of adequate bowel acidification and ammonia trapping'], ans:1, exp:'Lactulose target: 2-3 soft stools per day. Excessive lactulose causes diarrhea and dehydration (worsen HE from prerenal azotemia). Monitor mental status improvement and stool consistency.' },
          { q:'Rifaximin in hepatic encephalopathy works by:', opts:['Directly binding ammonia in blood','Non-absorbable antibiotic reducing ammonia-producing gut bacteria without systemic absorption'], ans:1, exp:'Rifaximin: non-absorbable rifamycin antibiotic. Reduces gut bacterial ammonia production. Added to lactulose in recurrent HE. Minimal systemic absorption (below 1%) â€” safe in liver disease.' },
          { q:'Mesalamine suppositories are used for:', opts:['Right-sided (proximal) colon disease','Rectal and distal sigmoid UC â€” delivers medication directly to inflamed mucosa'], ans:1, exp:'Mesalamine suppositories: reach only rectum/distal sigmoid. Enemas reach splenic flexure. Oral mesalamine for more proximal disease. Match formulation to disease extent for optimal topical effect.' },
          { q:'Azathioprine in IBD requires monitoring of:', opts:['INR and PT only','CBC (myelosuppression â€” agranulocytosis), LFTs, TPMT enzyme activity before initiation'], ans:1, exp:'Azathioprine: thiopurine immunosuppressant. Monitor CBC (leukopenia, thrombocytopenia), LFTs (hepatotoxicity). Check TPMT (thiopurine methyltransferase) before starting â€” low activity increases toxicity risk.' },
          { q:'TPN complications related to the catheter include:', opts:['Only metabolic imbalances','CLABSI, pneumothorax during insertion, air embolism, thrombosis'], ans:1, exp:'TPN catheter complications: CLABSI (most dangerous â€” strict aseptic technique, dedicated TPN line), pneumothorax during central line insertion, venous thrombosis, air embolism. Metabolic: hyperglycemia, electrolyte imbalances.' },
          { q:'Refeeding syndrome risk is highest in:', opts:['Mildly malnourished patients starting oral diet','Severely malnourished patients (anorexia nervosa, prolonged fasting) starting nutrition â€” precipitous falls in phosphate, potassium, magnesium'], ans:1, exp:'Refeeding syndrome: severe malnutrition + rapid nutrition initiation causes intracellular shift of phosphate, K+, Mg2+. Hypophosphatemia (most significant) causes cardiac arrhythmias, respiratory failure, rhabdomyolysis. Start nutrition slowly, correct electrolytes before starting.' },
          { q:'Fecal immunochemical test (FIT) for colorectal cancer screening:', opts:['Detects blood from any GI source','Detects human hemoglobin specifically from lower GI tract â€” done annually'], ans:1, exp:'FIT: human-specific antibody for hemoglobin. More specific than guaiac FOBT (no dietary restrictions). Done annually. Positive FIT requires diagnostic colonoscopy. Sensitivity 79%, specificity 94%.' },
          { q:'Post-endoscopy (EGD) nursing care includes:', opts:['Immediate oral fluids and full diet','NPO until gag reflex returns, monitor for sore throat/complications, semi-recumbent position, observe for bleeding or perforation signs'], ans:1, exp:'Post-EGD: keep NPO until gag reflex fully returns (45-60 min after local anesthetic) to prevent aspiration. Monitor for perforation (severe chest pain, fever), bleeding. Outpatient: escort needed if sedated.' },
          { q:'Stool characteristics: steatorrhea (fatty stools) indicates:', opts:['Lower GI bleeding','Malabsorption (pancreatic exocrine insufficiency, celiac disease, Crohn disease)'], ans:1, exp:'Steatorrhea: large, pale, greasy, malodorous stools that float and are difficult to flush. Indicates fat malabsorption. Causes: pancreatic exocrine insufficiency, celiac disease, short bowel syndrome, Crohn disease.' },
          { q:'Colonoscopy bowel preparation quality affects:', opts:['Patient comfort only','Adenoma detection rate â€” poor prep misses up to 50% of polyps'], ans:1, exp:'Inadequate bowel prep is the most common reason for failed colonoscopy (polyps missed, procedure aborted). Document prep quality (Boston Bowel Preparation Scale). Poor prep: early repeat colonoscopy.' },
          { q:'Sulfasalazine (5-ASA + sulfapyridine) side effects include:', opts:['No significant side effects','Nausea, headache, oligospermia (reversible), folate deficiency â€” supplement folic acid'], ans:1, exp:'Sulfasalazine: sulfa component causes most side effects (nausea, headache, reversible male infertility). Supplement folic acid (sulfa inhibits folate absorption). Check G6PD in susceptible populations.' },
          { q:'Gastrostomy tube (PEG) site infection management includes:', opts:['Removing the tube immediately','Cleaning with soap and water, topical antibiotics for minor infection, IV antibiotics for cellulitis, notify provider'], ans:1, exp:'PEG site infection: clean with soap and water daily, apply topical antibiotics (mupirocin) for mild infection. Cellulitis: oral/IV antibiotics. Embedded bumper or significant infection may require tube removal.' },
          { q:'Paralytic ileus differs from mechanical obstruction in that:', opts:['Both require surgery','Paralytic ileus: bowel is open but not moving (absent bowel sounds). Mechanical: physical blockage (high-pitched then absent sounds)'], ans:1, exp:'Paralytic ileus: absent or diminished bowel sounds, generalized distension, no physical blockage. Causes: post-op, electrolyte imbalance, peritonitis, drugs. Treatment: correct cause, NPO, ambulation, NG suction if needed.' },
          { q:'Nutritional assessment tool validated for ICU patients includes:', opts:['BMI only','NUTRIC score (Nutrition Risk in Critically Ill) â€” higher score indicates benefit from early aggressive nutrition support'], ans:1, exp:'NUTRIC score: validated nutritional risk tool for ICU patients. Factors: age, APACHE II, SOFA score, comorbidities, ICU LOS before EN. Score 6+ (without IL-6) = high nutrition risk â€” start EN within 24-48 hours.' },
          { q:'Enema administration technique includes:', opts:['Patient supine, 150 cm above mattress, slow infusion','Patient left lateral (Sims) position, tube lubricated, enema bag 30-45 cm above mattress, slow instillation, hold for prescribed time'], ans:1, exp:'Enema: left lateral Sims position (facilitates flow into sigmoid colon), lubricate rectal tube 7-10 cm, bag 30-45 cm above mattress, instill slowly (avoid cramping), instruct patient to hold 5-15 min.' }
            ]
          }
        ]
      },      {
        name: 'Musculo Skeletal', icon: 'fa-bone', color: '#10b981',
        sections: [
          {
            name: 'Musculo Skeletal I',
            questions: [
              { q:'What is the scientific study of bones called?', opts:['Myology','Osteology','Arthrology','Cytology'], ans:1, exp:'Osteology is the scientific study of bones.' },
              { q:'Which type of skeletal system is internal to the muscles and found in humans and higher vertebrates?', opts:['Exoskeleton','Endoskeleton','Hydrostatic skeleton','Dermal skeleton'], ans:1, exp:'An endoskeleton is internal to the muscles; an exoskeleton (insects) is rigid material to which muscles attach on the inner aspects.' },
              { q:'Which function of the skeletal system involves the production of blood cells?', opts:['Mineral Homeostasis','Triglyceride Storage','Hemopoiesis','Shape and Support'], ans:2, exp:'Hemopoiesis is the process where red bone marrow produces red blood cells, white blood cells, and platelets.' },
              { q:"What percentage of the body's total calcium is stored within the bones?", opts:['50%','65%','80%','97%'], ans:3, exp:'97% of the calcium in the human body is located in the bones.' },
              { q:'From which embryological layer is bone tissue derived?', opts:['Ectoderm','Mesoderm','Endoderm','Epiderm'], ans:1, exp:'Bone is a specialized connective tissue derived from the mesoderm.' },
              { q:'Which bone cells are responsible for the resorption and breakdown of the bone matrix?', opts:['Osteoblasts','Osteogenic cells','Osteocytes','Osteoclasts'], ans:3, exp:'Osteoclasts are bone-removing/resorbing cells that function in the destruction of the bone matrix during growth, remodeling, or fracture repair.' },
              { q:'What are the young, bone-forming cells found in the periosteum that form the bone matrix?', opts:['Osteocytes','Osteoblasts','Osteoclasts','Stem cells'], ans:1, exp:'Osteoblasts are young cells that form the bone matrix and eventually mature into osteocytes.' },
              { q:'Which cells are mature bone cells trapped within the matrix and responsible for maintaining bone tissue?', opts:['Osteocytes','Osteoblasts','Osteoclasts','Osteogenic cells'], ans:0, exp:'Osteocytes are the most abundant cells in bone and are responsible for regulating and maintaining the bone matrix.' },
              { q:'Inorganic calcium and phosphorus make up approximately what percentage of the dry weight of bone?', opts:['20%','35%','65%','97%'], ans:2, exp:'Mineral salts, specifically inorganic calcium and phosphorus, constitute 65% of the dry weight of the bone.' },
              { q:'The long, cylindrical middle portion or shaft of a long bone is known as the:', opts:['Epiphysis','Metaphysis','Diaphysis','Periosteum'], ans:2, exp:'The diaphysis is the long, cylindrical middle portion, also known as the shaft or body of the bone.' },
              { q:'What is the name of the thin layer of hyaline cartilage in a growing bone where length growth occurs?', opts:['Epiphyseal line','Epiphyseal plate','Articular cartilage','Endosteum'], ans:1, exp:'The epiphyseal plate (growth plate) is hyaline cartilage where length growth occurs; it is replaced by an epiphyseal line when growth stops.' },
              { q:"Which structure is the outermost tough sheath of dense irregular connective tissue that enables thickness growth?", opts:['Endosteum','Periosteum','Articular cartilage',"Sharpey's fibers"], ans:1, exp:'The periosteum is the outermost sheath that contains osteoblasts for thickness growth and serves as an attachment point for tendons and ligaments.' },
              { q:'What connects bone to bone?', opts:['Tendon','Ligament',"Sharpey's fiber",'Muscle'], ans:1, exp:'A ligament connects bone to bone, while a tendon connects muscle to bone.' },
              { q:'What percentage of the adult skeleton is composed of compact bone?', opts:['20%','50%','80%','97%'], ans:2, exp:'Compact bone makes up 80% of the skeleton, while spongy bone makes up the remaining 20%.' },
              { q:'What is the functional unit of compact bone?', opts:['Trabeculae','Osteon (Haversian System)','Canaliculi','Lacunae'], ans:1, exp:'The structural and functional unit of compact bone is the Osteon, or Haversian System.' },
              { q:'Which spaces in compact bone contain osteocytes, calcium, and lymph fluid?', opts:['Canaliculi','Lamellae','Lacunae','Haversian canals'], ans:2, exp:'Lacunae are flattened spaces between lamellae that contain osteocytes and fluid.' },
              { q:'What is the functional unit of spongy bone?', opts:['Osteon','Trabeculae','Lamellae','Nutrient foramen'], ans:1, exp:'Spongy bone does not contain osteons; its functional unit is the trabeculae, which are irregular patterns of thin columns.' },
              { q:'In which type of bone tissue is red bone marrow primarily found in adults?', opts:['Compact bone','Spongy bone','Diaphysis','Periosteum'], ans:1, exp:'Spongy bone (cancellous bone) contains microscopic spaces filled with red bone marrow, which is responsible for blood cell production.' },
              { q:'Which of the following is an example of a short bone?', opts:['Humerus','Sternum','Carpal bone','Vertebrae'], ans:2, exp:'Short bones are cube-shaped and equal in length and width, with examples including carpal and tarsal bones.' },
              { q:'Which bone is classified as the largest sesamoid bone in the body?', opts:['Pisiform','Patella','Scapula','Hyoid'], ans:1, exp:'The patella (kneecap) is the largest sesamoid bone in the body.' },
              { q:'Pneumatic bones, such as the maxilla and ethmoid, are characterized by:', opts:['A complex shape','Being sesame seed-shaped','Containing air-filled spaces','Lacking a medullary cavity'], ans:2, exp:'Pneumatic bones are defined as bones containing air-filled spaces.' },
              { q:'How many bones are in the adult human axial skeleton?', opts:['126','206','80','60'], ans:2, exp:'The adult skeleton is divided into the axial skeleton (80 bones) and the appendicular skeleton (126 bones).' },
              { q:'Which of these is NOT part of the axial skeleton?', opts:['Skull','Ribs','Clavicle','Vertebral column'], ans:2, exp:'The axial skeleton consists of the skull, hyoid, auditory ossicles, vertebral column, and thorax (ribs/sternum). The clavicle is part of the pectoral girdle in the appendicular skeleton.' },
              { q:'How many bones are located in the human upper limbs (total for both sides)?', opts:['30','60','80','126'], ans:1, exp:'The upper limbs consist of 60 bones, including 2 humerus, 2 radius, 2 ulna, 16 carpals, 10 metacarpals, and 28 phalanges.' },
              { q:'Where does the nutrient artery enter the long bone?', opts:['The epiphysis','Through the articular cartilage','Through the nutrient foramen in the diaphysis','Beneath the endosteum'], ans:2, exp:'The nutrient artery enters the shaft (diaphysis) through the nutrient foramen and then divides in the medullary cavity.' }
            ]
          },
          {
            name: 'Musculo Skeletal II',
            questions: [
              { q:'A nurse is assessing a newborn and notes gaps filled with membranes in the suture lines. These are correctly identified as:', opts:['Sutures','Fontanelles','Ossification centers','Foramen magnum'], ans:1, exp:'Fontanelles are wide gaps or membrane-filled spaces located in the suture lines at birth.' },
              { q:'How many cranial bones compose the framework of the head?', opts:['8','12','14','22'], ans:0, exp:'The bony framework of the head includes 8 cranial bones that enclose and protect the brain.' },
              { q:'Which bone is the only movable bone in the human skull?', opts:['Maxilla','Vomer','Mandible','Zygomatic'], ans:2, exp:'The mandible (lower jaw) is the largest, strongest, and only movable bone of the skull.' },
              { q:'A nurse notes a depressed anterior fontanelle in an infant. This finding most likely indicates:', opts:['Increased intracranial pressure','Normal development','Dehydration','Hydrocephalus'], ans:2, exp:'A depressed anterior fontanelle is a clinical sign of dehydration.' },
              { q:'At what age should the anterior fontanelle (bregma) typically ossify?', opts:['2 to 3 months','3 to 6 months','12 to 18 months','18 to 24 months'], ans:3, exp:'The anterior fontanelle (bregma) typically ossifies between 18 and 24 months of age.' },
              { q:'Which part of the temporal bone is the hardest and contains the structures of the inner ear?', opts:['Squamous part','Mastoid part','Petrous part','Tympanic part'], ans:2, exp:'The petrous part is the hardest part of the temporal bone and houses the inner ear, including the cochlea and semicircular canals.' },
              { q:'Which suture unites the two parietal bones at the superior midline?', opts:['Coronal suture','Sagittal suture','Lambdoid suture','Squamous suture'], ans:1, exp:'The sagittal suture unites both parietal bones at the superior midline of the skull.' },
              { q:'Which bone does not articulate with any other bone and is situated at the base of the tongue?', opts:['Mandible','Hyoid bone','Palatine bone','Ethmoid bone'], ans:1, exp:'The hyoid bone is a horseshoe-shaped bone at the base of the tongue that does not articulate with any other bone.' },
              { q:'A bulging anterior fontanelle in an infant is a clinical sign of:', opts:['Dehydration','Malnutrition','Increased intracranial pressure','Normal growth spurts'], ans:2, exp:'A bulging anterior fontanelle is an indicator of increased pressure within the cranium.' },
              { q:'Which cranial bone contains the foramen magnum through which the spinal cord passes?', opts:['Frontal bone','Sphenoid bone','Ethmoid bone','Occipital bone'], ans:3, exp:'The occipital bone forms the posterior base of the cranium and contains the foramen magnum.' },
              { q:'How many facial bones are there in the human skull?', opts:['8','10','14','22'], ans:2, exp:'The bony framework of the head is composed of 8 cranial bones and 14 bones of the face.' },
              { q:'Which facial bone is known as the bridge of the nose?', opts:['Lacrimal','Nasal','Vomer','Inferior nasal conchae'], ans:1, exp:'There are two nasal bones that form the bridge of the nose.' },
              { q:'The maxilla articulates with every bone of the face EXCEPT:', opts:['Mandible','Nasal','Zygomatic','Lacrimal'], ans:0, exp:'The maxillae form the upper jaw and articulate with every face bone except for the mandible.' },
              { q:'Which suture is also known as the metopic suture?', opts:['Coronal suture','Sagittal suture','Squamous suture','Frontal suture'], ans:3, exp:'The frontal suture, which divides the two halves of the frontal bone, is also known as the metopic suture.' },
              { q:'At what age does the posterior fontanelle (lambda) typically ossify?', opts:['1 to 2 months','2 to 3 months','6 months','12 to 18 months'], ans:1, exp:'The posterior fontanelle (lambda) is triangular in shape and typically ossifies at 2 to 3 months of age.' },
              { q:'Which fontanelle is located between the frontal, parietal, and temporal bones and typically closes by 3 to 6 months?', opts:['Anterior fontanelle','Posterior fontanelle','Antero-lateral (sphenoid) fontanelle','Posterio-lateral (mastoid) fontanelle'], ans:2, exp:'The antero-lateral (sphenoid) fontanelle is located between the frontal, parietal, and temporal bones and closes at 3 to 6 months.' },
              { q:'What is the smallest facial bone?', opts:['Vomer','Palatine','Lacrimal','Nasal'], ans:2, exp:'The two lacrimal bones are the smallest facial bones and are located on the medial orbital wall.' },
              { q:'The lambdoid suture unites which bones?', opts:['Frontal and parietal','Parietal and occipital','Parietal and temporal','Temporal and occipital'], ans:1, exp:'The lambdoid suture (lambda) unites both parietal bones with the occipital bone.' },
              { q:'Which part of the temporal bone contains air cells that, if infected, can spread infection to the brain?', opts:['Squamous part','Petrous part','Mastoid part','Tympanic part'], ans:2, exp:'The mastoid part contains mastoid air cells, and mastoiditis can spread to the brain.' },
              { q:'The cheekbones are formed by which bones?', opts:['Maxillae','Palatine bones','Zygomatic bones','Sphenoid bones'], ans:2, exp:'The two zygomatic bones are the cheekbones.' },
              { q:'At what age does the frontal (metopic) suture typically complete its fusion?', opts:['3 months to 2 years','18 to 24 months','21 to 30 years','40 to 60 years'], ans:0, exp:'The frontal (metopic) suture completely fuses between 3 months and 2 years of age.' },
              { q:'Which suture unites the frontal bone with both parietal bones?', opts:['Sagittal suture','Lambdoid suture','Coronal suture','Squamous suture'], ans:2, exp:'The coronal suture unites the frontal bone with both parietal bones.' },
              { q:'Which fontanelle is diamond or kite-shaped and is the largest of the fontanelles?', opts:['Posterior fontanelle','Anterior fontanelle','Mastoid fontanelle','Sphenoid fontanelle'], ans:1, exp:'The anterior fontanelle (bregma) is the largest fontanelle (2.5 x 3 cm) and is diamond/kite-shaped.' },
              { q:'The total number of fontanelles present in the fetal skull is:', opts:['2','4','6','8'], ans:2, exp:'There are a total of 6 fontanelles present in the fetal skull.' },
              { q:'Which part of the temporal bone forms the walls of the ear canal?', opts:['Squamous part','Mastoid part','Petrous part','Tympanic part'], ans:3, exp:'The tympanic part of the temporal bone forms the walls of the external auditory meatus (ear canal).' }
            ]
          },
          {
            name: 'Musculo Skeletal III',
            questions: [
              { q:'How many vertebrae are present in the adult vertebral column compared to that of an infant?', opts:['Adult: 33; Infant: 26','Adult: 26; Infant: 33','Adult: 24; Infant: 33','Adult: 33; Infant: 33'], ans:1, exp:'An adult vertebral column contains 26 vertebrae, while infants and children have 33 flexible vertebrae.' },
              { q:'Which section of the vertebral column consists of exactly 7 vertebrae?', opts:['Thoracic','Lumbar','Cervical','Sacral'], ans:2, exp:'The spinal column includes 7 cervical vertebrae.' },
              { q:'Which spinal curvatures are considered primary curves because they form first during fetal development?', opts:['Cervical and Lumbar','Thoracic and Sacral','Cervical and Thoracic','Lumbar and Sacral'], ans:1, exp:'The thoracic and sacral curves are primary curves that form first during fetal development and are concave in shape.' },
              { q:"A nurse assesses an elderly female and notes an exaggerated thoracic curve (dowager's hump). What is the medical term?", opts:['Scoliosis','Lordosis','Torticollis','Kyphosis'], ans:3, exp:"Kyphosis is an exaggeration of the thoracic curve, often called dowager's hump, and is mostly seen in elderly women." },
              { q:'Which abnormal spinal curvature is characterized by exaggeration of the lumbar curve, common in pregnancy and obesity?', opts:['Kyphosis','Lordosis','Scoliosis','Torticollis'], ans:1, exp:'Lordosis (swayback or hollow back) is an exaggeration of the lumbar curve common in pregnancy and obesity.' },
              { q:'A patient presents with lateral side-to-side bending of the spine in the thoracic region. What is this condition?', opts:['Kyphosis','Lordosis','Scoliosis','Torticollis'], ans:2, exp:'Scoliosis is a lateral bending of the spine, usually in the thoracic region, and is treated with a brace.' },
              { q:'Torticollis (wryneck) is caused by a muscle spasm that results in what?', opts:['Side-to-side bending of the spine','Exaggerated lumbar curve','Twisted neck in an unusual position','Dehydration of intervertebral disks'], ans:2, exp:'Torticollis is a twisted neck in an unusual position due to muscle spasm.' },
              { q:'Why do elderly individuals often experience a loss in height?', opts:['Fusion of the cervical vertebrae','Dehydration and compression of intervertebral disks','Increased bone density in the lumbar region','Ossification of the xiphoid process'], ans:1, exp:'Elderly people lose height because intervertebral disks dehydrate and compress due to a loss of bone density.' },
              { q:'Which cervical vertebra lacks a body and articulates with the occipital bone to form the atlanto-occipital joint?', opts:['C1 (Atlas)','C2 (Axis)','C7 (Vertebra Prominens)','T1'], ans:0, exp:'C1 (Atlas) lacks a body and articulates with the occipital bone.' },
              { q:'The C2 vertebra (Axis) is unique because it possesses a peg-like structure called the:', opts:['Spinous process','Transverse foramen','Odontoid process (dens)','Lamina'], ans:2, exp:'C2 (Axis) has a peg-like odontoid process (dens) that articulates with the Atlas.' },
              { q:'Which region of the vertebral column contains the largest and strongest vertebrae?', opts:['Cervical','Thoracic','Lumbar','Sacral'], ans:2, exp:'Lumbar vertebrae are the largest and strongest in the vertebral column.' },
              { q:'The sacrum is formed by fusion of 5 vertebrae. Between what ages does this fusion typically occur?', opts:['8-18','16-30','20-30','40'], ans:1, exp:'The sacrum consists of 5 fused vertebrae and typically fuses between the ages of 16 and 30.' },
              { q:'The sternum consists of three parts. What is the name of the superior handle part?', opts:['Body','Xiphoid Process','Manubrium','Clavicle'], ans:2, exp:'The manubrium is the superior handle part of the sternum.' },
              { q:'At approximately what age does the xiphoid process completely ossify?', opts:['20','30','40','50'], ans:2, exp:'The xiphoid process ossifies completely around age 40.' },
              { q:'Which pairs of ribs are classified as true ribs because they attach directly to the sternum via hyaline cartilage?', opts:['1st-7th pairs','8th-12th pairs','11th and 12th pairs','1st-10th pairs'], ans:0, exp:'True ribs (1st-7th pairs) attach directly to the sternum via hyaline cartilage.' },
              { q:'Which ribs are referred to as floating ribs because they have no anterior attachment?', opts:['1st and 2nd pairs','7th and 8th pairs','11th and 12th pairs','8th-10th pairs'], ans:2, exp:'Floating ribs (11th and 12th pairs) have no anterior attachment.' },
              { q:'Which region of the clavicle is most frequently fractured in the human body?', opts:['S-shaped curve','Medial end','Lateral end','Mid-region'], ans:3, exp:'The mid-region of the clavicle is the most frequently fractured site in the body.' },
              { q:'The highest point of the shoulder is formed by which process of the scapula?', opts:['Coracoid process','Acromion process','Glenoid cavity','Spinous process'], ans:1, exp:'The acromion process is the highest point of the shoulder.' },
              { q:'Where is the most common fracture site on the humerus (arm bone)?', opts:['Anatomical neck','Surgical neck','Capitulum','Trochlea'], ans:1, exp:'The surgical neck of the humerus is a common fracture site.' },
              { q:"A Colle's fracture involves a fracture of the distal end of which bone, resulting in a dinner fork deformity?", opts:['Ulna','Humerus','Radius','Scapula'], ans:2, exp:"A fracture of the distal end of the radius is known as a Colle's fracture and causes a dinner fork deformity." },
              { q:'Which carpal bone is responsible for 70% of all carpal fractures?', opts:['Lunate','Triquetrum','Capitate','Scaphoid'], ans:3, exp:'The scaphoid bone accounts for 70% of carpal fractures.' },
              { q:'In a newborn, the hip bone consists of three separate bones (Ilium, Ischium, Pubis). Between what ages do these fuse?', opts:['Birth to 5','8-18','16-30','20-30'], ans:1, exp:'The three bones of the hip fuse between the ages of 8 and 18.' },
              { q:'What is the longest, heaviest, and largest bone in the human body?', opts:['Tibia','Humerus','Femur','Fibula'], ans:2, exp:'The femur (thigh bone) is the longest, heaviest, and largest bone in the body.' },
              { q:"A fracture of the distal end of the fibula is clinically known as a:", opts:["Colle's fracture","Pott's fracture",'Greenstick fracture','Stress fracture'], ans:1, exp:"A fracture of the distal end of the fibula is a Pott's fracture." },
              { q:'Which identifies the three smallest bones in the body, located in the middle ear?', opts:['Malleus, Incus, Stapes','Talus, Calcaneus, Navicular','Ilium, Ischium, Pubis','Scaphoid, Lunate, Triquetrum'], ans:0, exp:'The three smallest bones in the body are the auditory ossicles: malleus, incus, and stapes.' }
            ]
          },
          {
            name: 'Musculo Skeletal IV',
            questions: [
              { q:'Which statement correctly identifies a joint (articulation)?', opts:['The point where a muscle attaches to a bone','The site at which two or more bones come together to articulate','A fluid-filled sac that cushions bones','A fibrous band that connects bone to bone'], ans:1, exp:'A joint (articulation) is the site at which any two or more bones come together to articulate.' },
              { q:'Which classification refers to joints that are considered freely movable?', opts:['Synarthrosis','Amphiarthrosis','Diarthrosis','Syndesmosis'], ans:2, exp:'Synovial joints are classified as Diarthrosis (freely movable joints). Synarthrosis = immovable; Amphiarthrosis = slightly movable.' },
              { q:'The sutures found in the skull are classified as which type of joint?', opts:['Cartilaginous','Fibrous','Synovial','Diarthrosis'], ans:1, exp:'Sutures are a type of fibrous joint where articulating surfaces are connected tightly by dense fibrous tissue.' },
              { q:'An injury to the interosseous membrane connecting the radius and ulna is an example of which type of fibrous joint?', opts:['Suture','Gomphosis','Syndesmosis','Synchondrosis'], ans:2, exp:'A syndesmosis is a fibrous joint where bones are united by a sheet of fibrous tissue, such as the interosseous membrane connecting the radius and ulna.' },
              { q:'Which statement is true regarding a gomphosis joint?', opts:['It allows significant movement during chewing','It is a joint between a tooth and its alveolar socket','It is a temporary joint that later ossifies','It is connected by hyaline cartilage'], ans:1, exp:'A gomphosis is a special type of joint between a tooth and its alveolar socket in the maxilla or mandible.' },
              { q:'Which example best illustrates a primary cartilaginous joint (synchondrosis)?', opts:['The pubic symphysis','Intervertebral discs','The epiphyseal plate in a growing long bone','The wrist joint'], ans:2, exp:'The epiphyseal plate is a primary cartilaginous joint that permits growth and later ossifies.' },
              { q:'How do secondary cartilaginous joints (symphyses) differ from primary cartilaginous joints?', opts:['They are connected by hyaline cartilage only','They generally occur in the midline of the body and do not ossify','They are completely immovable (synarthrosis)','They contain a synovial cavity'], ans:1, exp:'Secondary cartilaginous joints (symphyses) are united by strong fibrocartilage, usually occur in the midline, and do not ossify.' },
              { q:'Articular cartilage in a synovial joint has which characteristic?', opts:['It is rich in blood vessels to promote healing','It is nourished by synovial fluid','It contains many nerve endings to signal pain','It is composed of white fibrocartilage'], ans:1, exp:'Articular cartilage is covered by hyaline cartilage, has no nerve or blood supply, and is nourished by synovial fluid.' },
              { q:'The inner layer of the articular capsule in a synovial joint is responsible for which function?', opts:['Forming ligaments to hold bones together','Attaching muscles to bones','Secreting and absorbing synovial fluid','Providing a dense connective tissue shield'], ans:2, exp:'The articular capsule consists of an outer fibrous capsule and an inner synovial membrane, which secretes and absorbs synovial fluid.' },
              { q:'Joints feel stiff in the morning but move better after a warm shower because:', opts:['Warmth decreases the production of synovial fluid','Warmth makes the ligaments more rigid','Synovial fluid secretion increases when the joint is warmed','Heat causes the bursa to shrink'], ans:2, exp:'The secretion of synovial fluid increases when the joint is warmed, which helps lubricate the joint and reduce friction.' },
              { q:'Which accessory structure of a joint is a closed, small fluid-filled sac that cushions between bones and tendons?', opts:['Ligament','Tendon','Bursa','Meniscus'], ans:2, exp:'A bursa is a closed, small fluid-filled sac lined by a synovial membrane that provides a cushion around joints like the shoulder or knee.' },
              { q:'A nurse asks a patient to move their arm away from the midline of the body. This movement is documented as:', opts:['Adduction','Abduction','Flexion','Circumduction'], ans:1, exp:'Abduction is movement away from the midline, while adduction is movement towards the midline.' },
              { q:'Which movement involves turning the palm of the hand upward?', opts:['Pronation','Supination','Eversion','Rotation'], ans:1, exp:'Supination is turning the palm of the hand up, and pronation is turning the palm down.' },
              { q:'A patient moves their toes toward their shin during ankle exercises. The nurse identifies this as:', opts:['Plantar flexion','Inversion','Dorsiflexion','Eversion'], ans:2, exp:'Dorsiflexion is the flexion of the ankle/toes toward the shin. Plantar flexion is movement toward the sole of the foot.' },
              { q:'A patient swinging their arms in a large circle is performing which combination of movements?', opts:['Flexion and Extension only','Protraction and Retraction','Circumduction','Rotation'], ans:2, exp:'Circumduction is a combination of flexion, extension, abduction, and adduction (e.g., swinging arms in circles).' },
              { q:'A patient shrugging their shoulders upward is performing which motion?', opts:['Depression','Elevation','Protraction','Retraction'], ans:1, exp:'Elevation is raising a body part up, while depression is lowering it.' },
              { q:'Moving the jaw forward (gliding motion anteriorly) is an example of:', opts:['Retraction','Protraction','Eversion','Extension'], ans:1, exp:'Protraction is a gliding motion anteriorly (forward), while retraction is moving the structure back to the anatomical position.' },
              { q:'Which type of synovial joint allows for movement in all directions (polyaxial)?', opts:['Hinge','Pivot','Ball and Socket','Gliding'], ans:2, exp:'Ball and socket joints (e.g., shoulder, hip) feature a spherical head fitting into a cup-like depression, allowing movement in all directions.' },
              { q:'The elbow and knee are examples of which type of synovial joint?', opts:['Saddle','Hinge','Condyloid','Pivot'], ans:1, exp:'Hinge joints are uniaxial and allow only flexion and extension in one plane. Examples include the knee, elbow, and ankle.' },
              { q:'The atlantoaxial joint, which allows for the shaking of the head to signal no, is what type of joint?', opts:['Hinge','Condyloid','Pivot','Plane'], ans:2, exp:'A pivot (trochoid) joint features a rounded surface articulating with a ring-like structure, allowing rotational movement.' },
              { q:'A condyloid (ellipsoid) joint, such as the wrist, allows for which of the following?', opts:['Rotational movement only','Movement in 2 axes (flexion/extension, abduction/adduction) but NO rotation','Movement in all planes including rotation','Gliding only'], ans:1, exp:'Condyloid joints are biaxial; they allow movement in two axes but no rotational movement.' },
              { q:'Which specific joint is the only example of a saddle joint?', opts:['The hip joint','The carpometacarpal joint of the thumb','The inter-tarsal joints','The distal radio-ulnar joint'], ans:1, exp:'The carpometacarpal joint of the thumb is a saddle-shaped articulation allowing movement in all planes.' },
              { q:'Inter-carpal and inter-tarsal joints, where flat surfaces slide over one another, are classified as:', opts:['Hinge joints','Pivot joints','Gliding (Plane) joints','Condyloid joints'], ans:2, exp:'Gliding (plane) joints occur where flat surfaces slide or glide over one another, such as in the carpal or tarsal bones.' },
              { q:'The primary function of a ligament in a synovial joint is to:', opts:['Attach muscles to bones','Secrete synovial fluid','Strengthen the capsule and limit unwanted movement','Provide nutrients to the articular cartilage'], ans:2, exp:'Ligaments strengthen the joint capsule, hold bones together, limit unwanted movement, and maintain the normal relationship of bones.' },
              { q:'Which statement best describes the difference between a tendon and a ligament?', opts:['A tendon connects bone to bone, while a ligament connects muscle to bone','A ligament is a fluid-filled sac, while a tendon is fibrous tissue','A tendon is fibrous connective tissue attaching muscle to bone, while a ligament holds bones together','There is no functional difference; they are both dense connective tissue'], ans:2, exp:'A tendon is fibrous connective tissue serving as the attachment of muscles to bones, whereas ligaments hold bones together.' }
            ]
          },
          {
            name: 'Musculo Skeletal V',
            questions: [
              { q:'Which of the following is an accurate function performed by muscles?', opts:['Pumping blood through the heart','Moving food through the digestive tract','Providing protection to inner organs','All of the above'], ans:3, exp:'The muscular system is responsible for moving blood by pumping the heart, moving food through the digestive system, and providing protection to inner organs.' },
              { q:'Which type of muscle tissue is attached to the skeletal system and under voluntary control?', opts:['Smooth muscle','Cardiac muscle','Skeletal muscle','Visceral muscle'], ans:2, exp:'Skeletal muscle is attached to the skeletal system and is under voluntary or conscious control. Smooth and cardiac muscles are involuntary.' },
              { q:'When examining skeletal muscle under a microscope, which characteristic should be observed?', opts:['Spindle-shaped cells','Single, central nucleus','Multinucleated cells with visible striations','Non-striated fibers'], ans:2, exp:'Skeletal muscle cells are very long, multinucleated (having many nuclei), and have striations visible under a microscope.' },
              { q:'Where would a nurse expect to find smooth muscle tissue in the body?', opts:['Biceps brachii','Myocardium','Wall of the urinary bladder','Diaphragm'], ans:2, exp:'Smooth muscle is located in the walls of hollow internal structures such as the urinary bladder (detrusor muscle).' },
              { q:'Which statement regarding cardiac muscle tissue is correct?', opts:['It is under voluntary control','It contains intercalated discs','It lacks striations','It has a peripheral nucleus'], ans:1, exp:'Cardiac muscle is striated but features unique cell membrane modifications called intercalated discs. It is involuntary and typically has a single central nucleus.' },
              { q:'What is the role of gap junctions found within intercalated discs in cardiac muscle?', opts:['To hold fibers together during contraction','To store calcium ions','To provide a route for quick conduction of electrical current','To anchor the muscle to bone'], ans:2, exp:'Gap junctions in intercalated discs provide a route for the quick conduction of electrical current from one fiber to another.' },
              { q:'What is the name of the connective tissue sheath that covers the entire skeletal muscle?', opts:['Endomysium','Perimysium','Epimysium','Sarcolemma'], ans:2, exp:'The epimysium is the connective tissue sheath that covers the entire muscle.' },
              { q:'Which term refers to a bundle of muscle cells within a skeletal muscle?', opts:['Myofibril','Fascicle','Sarcomere','Motor unit'], ans:1, exp:'A bundle of muscle cells within a muscle is called a fascicle.' },
              { q:'The sarcolemma refers to which part of the muscle cell?', opts:['The cytoplasm','The endoplasmic reticulum','The specific name for the muscle cell membrane','The contractile unit'], ans:2, exp:'The sarcolemma is the specific name for the muscle cell membrane.' },
              { q:'Which two proteins are classified as the main contractile proteins in muscle fibers?', opts:['Troponin and Tropomyosin','Titin and Myomesin','Myosin and Actin','Dystrophin and Alpha-actinin'], ans:2, exp:'Myosin and actin are the two contractile proteins responsible for muscle contraction.' },
              { q:'A thick filament in a myofibril is primarily composed of which protein?', opts:['Actin','Troponin','Myosin','Tropomyosin'], ans:2, exp:'Thick filaments are made up of myosin molecules.' },
              { q:'Which proteins are responsible for regulating or relaxing the muscle contraction process?', opts:['Myosin and Actin','Tropomyosin and Troponin','Titin and Dystrophin','Myomesin and Alpha-actinin'], ans:1, exp:'Tropomyosin and troponin are regulatory/relaxing proteins.' },
              { q:'A motor unit is defined as:', opts:['A single muscle fiber and its blood supply','A motor neuron and all the muscle fibers it innervates','The area where a tendon attaches to a bone','The connection between two cardiac muscle cells'], ans:1, exp:'A motor unit consists of a motor neuron and all the muscle fibers it innervates.' },
              { q:'Which neurotransmitter is released at the neuromuscular junction to trigger muscle contraction?', opts:['Norepinephrine','Dopamine','Acetylcholine (ACh)','Serotonin'], ans:2, exp:'Acetylcholine (ACh) is the neurotransmitter stored in vesicles and released into the synaptic cleft to trigger contraction.' },
              { q:'A patient is unable to raise their eyebrows. Which muscle might be affected?', opts:['Orbicularis oculi','Buccinator','Occipitofrontalis','Masseter'], ans:2, exp:'The occipitofrontalis muscle is responsible for raising the eyebrows.' },
              { q:'Which muscle is known as the kissing muscle because it closes and shapes the lips?', opts:['Orbicularis oculi','Orbicularis oris','Buccinator','Zygomaticus'], ans:1, exp:'The orbicularis oris surrounds the mouth and is known as the kissing muscle because it closes the lips and shapes them for whistling.' },
              { q:"The trumpeter's muscle, used in chewing and blowing air, is the:", opts:['Masseter','Buccinator','Temporalis','Risorius'], ans:1, exp:"The buccinator is a flat cheek muscle known as the trumpeter's muscle because it draws the cheeks in." },
              { q:'Which muscle exerts major pressure for chewing by closing the jaw?', opts:['Sternocleidomastoid','Trapezius','Masseter','Platysma'], ans:2, exp:'The masseter is a broad muscle that closes the jaw and exerts major pressure for chewing.' },
              { q:'A nurse asks a patient to turn their head from side to side. Which muscle is primarily being tested?', opts:['Trapezius','Latissimus dorsi','Sternocleidomastoid','Sacrospinalis'], ans:2, exp:'The sternocleidomastoid turns the head from side to side and flexes the neck.' },
              { q:'Which large, flat muscle covers the lower back and is responsible for adducting and medially rotating the arm?', opts:['Trapezius','Latissimus dorsi','Teres major','Rectus abdominis'], ans:1, exp:'The latissimus dorsi is a large, flat muscle covering the lower back that adducts, medially rotates, and extends the arm.' },
              { q:'What is the deepest muscle of the abdominal wall?', opts:['Rectus abdominis','External oblique','Internal oblique','Transversus abdominis'], ans:3, exp:'The transversus abdominis is the deepest abdominal muscle.' },
              { q:'The white cord that divides the abdomen into right and left halves from the xiphoid process to the symphysis pubis is the:', opts:['Linea semilunaris','Linea alba','Rectus sheath','Inguinal ligament'], ans:1, exp:'The linea alba (white cord) is a strong midline tendinous cord dividing the abdomen.' },
              { q:'Which muscle is considered the most important muscle for breathing?', opts:['External intercostals','Internal intercostals','Diaphragm','Levator ani'], ans:2, exp:'The diaphragm is the most important breathing muscle.' },
              { q:'During inhalation, which muscles act to elevate the ribs and increase thoracic volume?', opts:['Internal intercostals','External intercostals','Transversus abdominis','Quadratus lumborum'], ans:1, exp:'External intercostals elevate the ribs to increase thoracic volume for inhaling.' },
              { q:'Which muscle of the pelvic floor forms a sling to support the pelvic organs?', opts:['Coccygeus','Levator ani','Sacrospinalis','Pyloric sphincter'], ans:1, exp:'The levator ani muscles form a sling that supports the pelvic organs.' }
            ]
          }
        ]
      },      {
        name: 'Respiratory', icon: 'fa-lungs', color: '#06b6d4',
        sections: [
          {
            name: 'Respiratory I',
            questions: [
              { q:'What are the two main divisions of the respiratory system structurally?', opts:['Upper and lower respiratory systems','Conducting and respiratory zones','Alveolar and bronchiolar systems','External and internal respiration'], ans:0, exp:'Structurally, the respiratory system is divided into the upper (nose, pharynx, larynx) and lower (trachea, bronchi, bronchioles, lungs) systems.' },
              { q:'What is the functional division of the respiratory system?', opts:['Pulmonary and systemic systems','Conducting and respiratory zones','External and internal respiration','Alveolar and bronchial systems'], ans:1, exp:'Functionally, the respiratory system is divided into the conducting zone (airways) and the respiratory zone (gas exchange areas).' },
              { q:'What is the primary function of the respiratory zone?', opts:['Filtering air','Gas exchange','Humidifying air','Producing sound'], ans:1, exp:'The respiratory zone, including respiratory bronchioles, alveolar ducts, and alveoli, is responsible for gas exchange.' },
              { q:'What type of epithelium lines most of the respiratory tract?', opts:['Simple squamous','Stratified squamous','Pseudostratified ciliated columnar','Transitional'], ans:2, exp:'Most of the respiratory tract is lined by pseudostratified ciliated columnar epithelium, which helps protect, humidify, and clear the airways.' },
              { q:'Which structure in the nasal cavity helps filter large particles from inhaled air?', opts:['Olfactory receptors','Vibrissae','Cilia','Turbinates'], ans:1, exp:'Vibrissae are coarse hairs in the nasal vestibule that filter large particles from inhaled air.' },
              { q:'What is the anatomical function of the turbinates in the nasal cavity?', opts:['Gas exchange','Filtering particles','Increasing surface area for humidifying and warming air','Supporting mucosal layers'], ans:2, exp:'Turbinates increase the surface area to improve air warming and humidification.' },
              { q:'What separates the two nostrils?', opts:['Ala','Columella','Septal cartilage','Vibrissae'], ans:1, exp:'The columella is the soft, median portion separating the nostrils.' },
              { q:'Which sinus is the largest and commonly infected?', opts:['Frontal','Sphenoidal','Ethmoidal','Maxillary'], ans:3, exp:"The maxillary sinus is the largest and is prone to infections due to its drainage opening being above its floor." },
              { q:'Which area in the nasal septum is prone to nosebleeds?', opts:["Woodruff's area","Little's area",'Nasal vestibule','Conchae'], ans:1, exp:"Little's area is a vascular network prone to epistaxis and located in the anterior inferior part of the nasal septum." },
              { q:'What type of cartilage is the cricoid cartilage?', opts:['Fibrocartilage','Elastic cartilage','Hyaline cartilage','Calcified cartilage'], ans:2, exp:'The cricoid cartilage is hyaline cartilage and is the only complete cartilaginous ring in the larynx.' },
              { q:'Which nerve supplies most intrinsic muscles of the larynx?', opts:['Superior laryngeal nerve','Recurrent laryngeal nerve','Vagus nerve','Glossopharyngeal nerve'], ans:1, exp:'The recurrent laryngeal nerve supplies all intrinsic muscles of the larynx except the cricothyroid.' },
              { q:'What is the role of surfactant in alveoli?', opts:['Facilitates oxygen diffusion','Reduces surface tension to prevent alveolar collapse','Increases alveolar volume','Enhances immune response'], ans:1, exp:'Surfactant reduces surface tension, preventing alveolar collapse during expiration.' },
              { q:'What is the major muscle involved in quiet breathing?', opts:['External intercostal muscles','Internal intercostal muscles','Diaphragm','Scalene muscles'], ans:2, exp:'The diaphragm is the primary muscle used in quiet breathing.' },
              { q:'Which lung has three lobes?', opts:['Right lung','Left lung','Both lungs','Neither lung'], ans:0, exp:'The right lung has three lobes: superior, middle, and inferior.' },
              { q:'What prevents food from entering the airway during swallowing?', opts:['Vocal cords','Epiglottis','Uvula','Arytenoid cartilage'], ans:1, exp:'The epiglottis covers the entrance of the larynx during swallowing, preventing food from entering the airway.' },
              { q:'What type of epithelium is present in alveoli?', opts:['Pseudostratified columnar','Stratified squamous','Simple squamous','Transitional'], ans:2, exp:'Simple squamous epithelium facilitates efficient gas exchange in alveoli.' },
              { q:'Which nerve is responsible for diaphragm innervation?', opts:['Vagus nerve','Glossopharyngeal nerve','Phrenic nerve','Recurrent laryngeal nerve'], ans:2, exp:'The phrenic nerve innervates the diaphragm, enabling its contraction during breathing.' },
              { q:'What is the maximum volume of air that lungs can contain?', opts:['Tidal volume','Vital capacity','Functional residual capacity','Total lung capacity'], ans:3, exp:'Total lung capacity is the maximum air volume the lungs can hold, typically about 6 liters.' },
              { q:'What prevents over-inflation of the lungs?', opts:['Phrenic reflex','Hering-Breuer reflex','Carotid sinus reflex','Baroreceptor reflex'], ans:1, exp:'The Hering-Breuer reflex inhibits excessive lung inflation via stretch receptors.' },
              { q:'Which bronchus is more prone to obstruction by foreign bodies?', opts:['Right bronchus','Left bronchus','Both equally','Neither bronchus'], ans:0, exp:'The right bronchus is wider, shorter, and more vertical, making it more prone to obstruction.' },
              { q:'What is the primary function of the pleural fluid?', opts:['Insulate the lungs','Reduce friction between the pleurae','Absorb shock','Prevent lung collapse'], ans:1, exp:'Pleural fluid reduces friction between the parietal and visceral pleura during respiration.' },
              { q:'What is the anatomical dead space volume?', opts:['150 mL','350 mL','500 mL','1 liter'], ans:0, exp:'Anatomical dead space volume is about 150 mL in adults, representing the air not involved in gas exchange.' },
              { q:'What type of cartilage forms the thyroid cartilage?', opts:['Elastic cartilage','Hyaline cartilage','Fibrocartilage','Calcified cartilage'], ans:1, exp:'The thyroid cartilage is hyaline cartilage and provides structural support to the larynx.' },
              { q:'Which sinus is closely related to the roots of the maxillary molar teeth?', opts:['Frontal sinus','Maxillary sinus','Ethmoid sinus','Sphenoidal sinus'], ans:1, exp:'The maxillary sinus is in close proximity to the maxillary molar teeth, and dental issues can lead to sinus problems.' },
              { q:'What is the function of the posterior cricoarytenoid muscle?', opts:['Adducts vocal cords','Abducts vocal cords','Elevates larynx','Lowers larynx'], ans:1, exp:'The posterior cricoarytenoid muscle abducts the vocal cords, opening the airway.' }
            ]
          },
          {
            name: 'Respiratory II',
            questions: [
              { q:'What type of epithelium lines the nasal cavity?', opts:['Simple squamous','Stratified squamous','Ciliated columnar','Transitional'], ans:2, exp:'The nasal cavity is lined by ciliated columnar epithelium, which helps move mucus and trapped particles.' },
              { q:'Which structure increases the surface area in the nasal cavity for airflow?', opts:['Conchae','Eustachian tubes','Turbinates','Both conchae and turbinates'], ans:3, exp:'Conchae (also called turbinates) are projections in the nasal cavity that increase surface area for airflow and filtration.' },
              { q:'The maxillary sinus drains into the:', opts:['Inferior meatus','Middle meatus','Superior meatus','Frontal sinus'], ans:1, exp:'The maxillary sinus opens into the middle meatus through the hiatus semilunaris.' },
              { q:'Which sinus is most commonly infected?', opts:['Frontal','Ethmoid','Maxillary','Sphenoid'], ans:2, exp:'The maxillary sinus is prone to infection due to its superior drainage opening.' },
              { q:'What type of cartilage forms the epiglottis?', opts:['Hyaline','Fibrocartilage','Elastic fibrocartilage','None of the above'], ans:2, exp:'The epiglottis is composed of elastic fibrocartilage, allowing flexibility to cover the laryngeal opening during swallowing.' },
              { q:'Which nerve supplies the cricothyroid muscle?', opts:['Internal laryngeal nerve','External laryngeal nerve','Recurrent laryngeal nerve','Glossopharyngeal nerve'], ans:1, exp:'The external laryngeal nerve, a branch of the superior laryngeal nerve, supplies the cricothyroid muscle.' },
              { q:'Which of the following is the only complete ring of cartilage in the respiratory tract?', opts:['Thyroid','Arytenoid','Cricoid','Cuneiform'], ans:2, exp:'The cricoid cartilage forms a complete ring and provides structural support.' },
              { q:'The nasopharynx contains:', opts:['Palatine tonsils','Pharyngeal tonsils','Lingual tonsils','None of the above'], ans:1, exp:'The pharyngeal tonsils (adenoids) are located in the nasopharynx.' },
              { q:'Which muscle is primarily responsible for quiet breathing?', opts:['Sternocleidomastoid','External intercostal','Diaphragm','Abdominal muscles'], ans:2, exp:'The diaphragm is the primary muscle involved in quiet breathing, controlled by the phrenic nerve.' },
              { q:'What is the functional unit of the lung?', opts:['Bronchioles','Alveoli','Pleura','Trachea'], ans:1, exp:'The alveoli are the primary site for gas exchange in the lungs.' },
              { q:'Gas exchange occurs across:', opts:['Stratified squamous epithelium','Simple squamous epithelium','Pseudostratified columnar epithelium','Cuboidal epithelium'], ans:1, exp:'Simple squamous epithelium in the alveoli allows efficient gas exchange.' },
              { q:'What prevents over-inflation of the lungs?', opts:['Phrenic nerve','Hering-Breuer reflex','Cough reflex','Stretching of bronchioles'], ans:1, exp:'The Hering-Breuer reflex inhibits excessive lung inflation via vagus nerve feedback.' },
              { q:'Which lung has three lobes?', opts:['Left lung','Right lung','Both lungs','Neither lung'], ans:1, exp:'The right lung has three lobes: superior, middle, and inferior.' },
              { q:'The safety muscle of the larynx is:', opts:['Cricothyroid','Posterior cricoarytenoid','Thyroarytenoid','Lateral cricoarytenoid'], ans:1, exp:'The posterior cricoarytenoid muscle abducts the vocal cords and prevents airway obstruction.' },
              { q:'Residual volume is:', opts:['1L','1.5L','2L','2.5L'], ans:1, exp:'Residual volume is the air remaining in the lungs after maximum expiration, approximately 1.5L.' },
              { q:'Which sinus is located behind the eyes?', opts:['Maxillary','Frontal','Sphenoid','Ethmoid'], ans:2, exp:'The sphenoid sinus is deep within the skull behind the eyes.' },
              { q:'The trachea divides at which vertebral level?', opts:['T4','T5','T6','C6'], ans:1, exp:'The trachea bifurcates at the carina, located at the T5 vertebral level.' },
              { q:'Epistaxis management includes:', opts:['Nasal cauterization','Packing','Sitting upright','All of the above'], ans:3, exp:'Management strategies for epistaxis include cauterization, packing, and proper positioning.' },
              { q:"Which cartilage forms the Adam's apple?", opts:['Cricoid','Thyroid','Epiglottis','Arytenoid'], ans:1, exp:"The thyroid cartilage forms the laryngeal prominence, or Adam's apple." },
              { q:'During inspiration, air pressure in the lungs:', opts:['Increases','Decreases','Remains constant','Oscillates'], ans:1, exp:'Negative pressure is created during inspiration, drawing air into the lungs.' }
            ]
          },
          {
            name: 'Respiratory III',
            questions: [
              { q:"Caisson's disease is also known as:", opts:['Altitude sickness','Hyperbaric decompression sickness','Nitrogen narcosis','Dysbaric osteonecrosis'], ans:1, exp:"It occurs when a person ascends rapidly from a high-pressure environment causing nitrogen bubbles to form, hence hyperbaric decompression sickness." },
              { q:"Main causative mechanism of Caisson's disease:", opts:['Hypoxia','Formation of nitrogen bubbles','Carbon dioxide retention','Hyperventilation'], ans:1, exp:'Rapid decompression causes nitrogen dissolved in body fluids to form bubbles causing vascular obstruction and ischemia.' },
              { q:"Doppler ultrasound helps in Caisson's disease by:", opts:['Measuring cardiac output','Detecting venous gas emboli','Checking arterial flow','Assessing muscle perfusion'], ans:1, exp:'Doppler ultrasound is used for bubble detection in divers.' },
              { q:"Supportive measures in Caisson's disease include all EXCEPT:", opts:['Keeping patient warm','Adequate hydration','Administering diuretics','Oxygen therapy'], ans:2, exp:'Diuretics worsen dehydration and tissue ischemia.' },
              { q:'Histoplasmosis primarily involves:', opts:['CNS','Lungs','Kidneys','Joints'], ans:1, exp:'Histoplasmosis is a pulmonary fungal infection often mimicking TB.' },
              { q:'Disseminated histoplasmosis is seen in:', opts:['Healthy adults','Immunocompromised patients','Diabetics only','Elderly females'], ans:1, exp:'Disseminated histoplasmosis is common in HIV/AIDS and transplant patients.' },
              { q:'Drug indicated for severe or CNS histoplasmosis:', opts:['Amphotericin B','Fluconazole','Griseofulvin','Clotrimazole'], ans:0, exp:'Amphotericin B is reserved for severe disseminated or CNS involvement.' },
              { q:'Sarcoidosis is characterized by:', opts:['Caseating granulomas','Non-caseating granulomas','Fungal spores','Amyloid deposition'], ans:1, exp:'The hallmark of sarcoidosis is non-caseating granulomatous inflammation.' },
              { q:'Erythema nodosum in sarcoidosis represents:', opts:['Late-stage fibrosis','Acute inflammatory sign','Fungal infection','Hypersensitivity vasculitis'], ans:1, exp:'Erythema nodosum (EN) is a painful, erythematous, tender, subcutaneous nodule, usually found over the extensor surfaces of the legs, representing an acute inflammatory sign.' },
              { q:"The causative organism of Legionnaires' disease is:", opts:['Mycoplasma pneumoniae','Legionella pneumophila','Klebsiella pneumoniae','Chlamydia psittaci'], ans:1, exp:'Legionella pneumophila is a Gram-negative, facultative intracellular bacillus that causes severe atypical pneumonia known as Legionnaires disease.' },
              { q:'The mild, self-limited, non-pneumonic form of Legionella infection is called:', opts:['Pontiac fever','Q fever','Psittacosis','Farmer\'s lung'], ans:0, exp:'Pontiac fever is a flu-like illness caused by L. pneumophila but without pneumonia. It is self-resolving within a few days.' },
              { q:"Which laboratory abnormality is most characteristic of Legionnaires' disease?", opts:['Hypernatremia','Hyponatremia','Hypokalemia','Hypercalcemia'], ans:1, exp:'Legionella infection often causes hyponatremia (<130 mEq/L) due to SIADH (syndrome of inappropriate antidiuretic hormone secretion).' },
              { q:'The culture medium of choice for isolating Legionella pneumophila is:', opts:['MacConkey agar','Chocolate agar','Buffered Charcoal Yeast Extract (BCYE) agar','Sabouraud\'s agar'], ans:2, exp:'Legionella requires L-cysteine and iron salts, available in BCYE medium, for growth.' },
              { q:"Radiographic finding most typical of Legionnaires' disease:", opts:['Bilateral interstitial infiltrates','Patchy unilateral lobar consolidation','Cavitation','Pleural effusion'], ans:1, exp:'Legionella pneumonia usually shows patchy or focal consolidation, often unilateral, which may progress rapidly without treatment.' },
              { q:'In sarcoidosis, serum angiotensin-converting enzyme (ACE) levels are:', opts:['Decreased','Increased','Unchanged','Variable'], ans:1, exp:'Activated macrophages in sarcoid granulomas produce ACE, leading to elevated serum ACE levels, which correlate with disease activity.' },
              { q:'Hypercalcemia in sarcoidosis is due to:', opts:['Increased bone resorption','Increased intestinal absorption due to macrophage activation of vitamin D','Parathyroid adenoma','Renal failure'], ans:1, exp:'Macrophages in granulomas convert inactive vitamin D to its active form (1,25-dihydroxyvitamin D3), increasing calcium absorption from the gut.' },
              { q:'The Kveim-Siltzbach test in sarcoidosis is:', opts:['A skin test using tuberculin','A diagnostic test using sarcoid spleen extract','A blood test for ACE levels','A culture test for fungi'], ans:1, exp:'The Kveim test involves intradermal injection of sarcoid tissue suspension. A positive test shows a granulomatous nodule at the injection site within 4-6 weeks.' },
              { q:'Which pathobiological feature best explains dissemination in histoplasmosis?', opts:['Spores remain extracellular and are cleared by neutrophils','Yeast forms survive and multiply inside macrophages','Organism only colonizes cilia of bronchial epithelium','Virions integrate into host genome'], ans:1, exp:'After inhalation, spores convert to yeast in the lungs and survive within macrophages, which facilitates reticuloendothelial dissemination (liver, spleen, bone marrow).' },
              { q:'The dimorphic fungus causing classical pulmonary histoplasmosis is:', opts:['Coccidioides immitis','Histoplasma capsulatum','Blastomyces dermatitidis','Aspergillus fumigatus'], ans:1, exp:'Histoplasma capsulatum is the causative agent of histoplasmosis, presenting as a mold in the environment and yeast in tissues (dimorphic).' },
              { q:'Which skin lesion is most specific for sarcoidosis?', opts:['Erythema nodosum','Lupus pernio','Maculopapular rash','Pyoderma gangrenosum'], ans:2, exp:'Maculopapular rash is considered most specific for sarcoidosis among the listed options.' },
              { q:'Which radiographic stage of sarcoidosis shows only bilateral hilar lymphadenopathy without pulmonary infiltrates?', opts:['Stage I','Stage II','Stage III','Stage IV'], ans:0, exp:'Stage I indicates isolated bilateral hilar lymphadenopathy. Stage II: lymphadenopathy + infiltrates. Stage III: infiltrates only. Stage IV: fibrosis.' },
              { q:'First-line pharmacologic treatment for symptomatic pulmonary sarcoidosis is:', opts:['Azathioprine','Prednisolone','Methotrexate','Hydroxychloroquine'], ans:1, exp:'Prednisolone (0.5-1 mg/kg/day, tapered) is the first-line therapy for active or symptomatic sarcoidosis.' },
              { q:"The diagnostic test most commonly used for rapid confirmation of Legionnaires' disease is:", opts:['Blood culture','Sputum Gram stain','Urinary antigen test','Cold agglutinin test'], ans:2, exp:'The urinary antigen test detects Legionella pneumophila serogroup 1 antigen and provides rapid, specific diagnosis even after antibiotic therapy.' },
              { q:'Which of the following is a neurological manifestation of severe Type II Caisson\'s disease?', opts:['Joint pain','Cutis marmorata','Spinal cord lesion with paralysis','Skin itching'], ans:2, exp:"Type II (severe) decompression sickness involves CNS, respiratory, and circulatory systems. Neurological signs include dizziness, ataxia, paralysis, and spinal cord infarction." },
              { q:"Caisson's disease is also called:", opts:['Barotrauma',"Diver's palsy",'Nitrogen narcosis','Air embolism'], ans:1, exp:"Caisson's disease (decompression sickness) is also called diver's palsy or the bends, seen in divers, aviators, astronauts, and tunnel workers due to rapid decompression." }
            ]
          },
          {
            name: 'Respiratory IV',
            questions: [
              { q:'The hallmark pathophysiological feature of ARDS is:', opts:['Decreased alveolar surface area','Increased alveolar-capillary membrane permeability','Reduced surfactant synthesis','Bronchospasm'], ans:1, exp:'ARDS causes damage to the alveolar-capillary barrier, leading to leakage of protein-rich fluid into alveoli causing pulmonary edema and decreased gas exchange.' },
              { q:'Which of the following is a direct cause of ARDS?', opts:['Sepsis','Pancreatitis','Aspiration of gastric contents','Massive transfusion'], ans:2, exp:'Direct lung injuries affect alveoli directly, e.g. aspiration, pneumonia, drowning, contusion. Others are indirect/systemic causes.' },
              { q:'Sepsis leading to ARDS is an example of:', opts:['Direct lung injury','Indirect (systemic) lung injury','Iatrogenic lung injury','Traumatic lung injury'], ans:1, exp:'In sepsis, inflammatory mediators cause capillary leak in lungs, making it an indirect cause of ARDS.' },
              { q:'In the exudative phase (1-7 days) of ARDS, the alveoli are filled with:', opts:['Transudate','Protein-rich exudate','Blood clots','Mucus'], ans:1, exp:'Damage leads to leakage of protein-rich plasma causing alveolar flooding, hyaline membrane formation, and impaired gas exchange.' },
              { q:'The proliferative phase of ARDS is characterized by:', opts:['Capillary leak','Type II pneumocyte and fibroblast proliferation','Surfactant depletion','Pulmonary hemorrhage'], ans:1, exp:'The proliferative phase (1-3 weeks) involves fibroblast proliferation and type II cell hyperplasia for repair and fibrosis.' },
              { q:'The fibrotic phase (>3 weeks) of ARDS leads to:', opts:['Lung hyperinflation','Increased alveolar recruitment','Pulmonary fibrosis and decreased compliance','Atelectasis resolution'], ans:2, exp:'Chronic inflammation leads to interstitial fibrosis causing stiff, non-compliant lungs and chronic respiratory failure.' },
              { q:'The earliest clinical feature of ARDS is:', opts:['Productive cough','Hemoptysis','Wheezing','Severe dyspnea and tachypnea'], ans:3, exp:'Sudden onset tachypnea, dyspnea, and hypoxemia unresponsive to oxygen are classic early signs of ARDS.' },
              { q:'Which symptom reflects worsening hypoxemia in ARDS?', opts:['Polyuria','Cyanosis','Bradycardia','Hypotonia'], ans:1, exp:'Hypoxemia leads to bluish discoloration (cyanosis) and restlessness/confusion.' },
              { q:'The Berlin definition (2012) of ARDS includes which of the following?', opts:['Onset within 1 month','Bilateral opacities unexplained by cardiac failure','PCWP > 20 mmHg','PaO2/FiO2 > 300 mmHg'], ans:1, exp:'Diagnostic criteria: onset within 1 week, bilateral opacities, non-cardiogenic cause, PaO2/FiO2 ratio for severity.' },
              { q:'According to Berlin classification, PaO2/FiO2 ratio = 120 mmHg indicates:', opts:['Mild ARDS','Severe ARDS','Moderate ARDS','Non-ARDS hypoxemia'], ans:2, exp:'Mild = 200-300 mmHg, Moderate = 100-200 mmHg, Severe = <100 mmHg. A ratio of 120 falls in the moderate range.' },
              { q:'Which ABG pattern is most common in early ARDS?', opts:['Respiratory acidosis','Respiratory alkalosis','Metabolic acidosis','Mixed acidosis'], ans:1, exp:'Hyperventilation due to hypoxia causes low PaCO2 and respiratory alkalosis initially.' },
              { q:'Chest X-ray in ARDS classically shows:', opts:['Bilateral white-out or ground-glass opacities','Cavitary lesions','Honeycomb pattern','Unilateral infiltrate'], ans:0, exp:'Diffuse bilateral infiltrates represent alveolar flooding and non-cardiogenic pulmonary edema.' },
              { q:'Pulmonary capillary wedge pressure (PCWP) in ARDS usually is:', opts:['>25 mmHg','<18 mmHg','20-25 mmHg','Elevated due to left failure'], ans:1, exp:'Normal/low PCWP confirms non-cardiogenic cause of pulmonary edema.' },
              { q:'Which mechanical ventilation setting is ideal in ARDS?', opts:['Low tidal volume (6 mL/kg)','High tidal volume','Zero PEEP','High plateau pressure'], ans:0, exp:'Lung-protective ventilation with low tidal volume (6 mL/kg) and plateau pressure < 30 cm H2O prevents barotrauma.' },
              { q:'Purpose of PEEP in ARDS ventilation:', opts:['Reduce tidal volume','Prevent alveolar collapse','Increase CO2 removal','Reduce surfactant production'], ans:1, exp:'PEEP keeps alveoli open, improving oxygenation and reducing atelectasis.' },
              { q:'Which position improves oxygenation in severe ARDS?', opts:["Fowler's",'Lateral','Supine','Prone'], ans:3, exp:'Prone position redistributes perfusion to better-ventilated alveoli and improves gas exchange.' },
              { q:'Fluid management in ARDS aims at:', opts:['Volume expansion','Conservative fluid strategy','Liberal fluid therapy','Colloid administration'], ans:1, exp:'Conservative fluids decrease pulmonary edema, improving oxygenation.' },
              { q:'Which drug is used to reduce bronchospasm in ARDS?', opts:['Ipratropium','Albuterol (Salbutamol)','Morphine','Adrenaline'], ans:1, exp:'Short-acting beta-2 agonists relieve bronchospasm and improve ventilation.' },
              { q:'Role of corticosteroids in ARDS management:', opts:['Early in all cases','Selective use (methylprednisolone)','Contraindicated','Only after fibrosis develops'], ans:1, exp:'Low-dose steroids may benefit patients in early or fibroproliferative phases to reduce inflammation.' },
              { q:'Neuromuscular blockers (e.g., cisatracurium) are indicated in ARDS when:', opts:['Mild ARDS','During weaning','Early severe ARDS (PaO2/FiO2 < 150)','For sedation only'], ans:2, exp:'Used briefly to improve ventilator synchrony and oxygenation in severe cases.' },
              { q:'Common mechanical complication of ARDS ventilation:', opts:['Pneumothorax','Pulmonary embolism','Atelectasis','Hemothorax'], ans:0, exp:'High airway pressures can rupture alveoli causing pneumothorax, pneumomediastinum, or subcutaneous emphysema.' },
              { q:'A shipyard worker presents with progressive dyspnea and Velcro crackles. Chest X-ray shows pleural plaques. The most probable diagnosis is:', opts:['Silicosis','Asbestosis','Siderosis','Byssinosis'], ans:1, exp:'Pleural plaques on the parietal pleura and diaphragm are hallmark features of asbestosis caused by long-term asbestos exposure.' },
              { q:'A 55-year-old miner presents with dyspnea and dry cough. Chest X-ray shows upper lobe nodules with eggshell calcification of hilar lymph nodes. Diagnosis?', opts:['Silicosis','Asbestosis','Siderosis','Byssinosis'], ans:0, exp:'Silicosis classically shows multiple small upper-lobe nodules and eggshell calcification of hilar nodes.' },
              { q:'Progressive Massive Fibrosis is a feature seen in:', opts:['Byssinosis',"Silicosis and Coal worker's pneumoconiosis",'Asbestosis only','Siderosis'], ans:1, exp:"Both silicosis and coal worker's pneumoconiosis may progress to large fibrotic masses (>1 cm) with respiratory failure." },
              { q:'A textile worker develops chest tightness and dyspnea every Monday, improving by mid-week. The likely condition is:', opts:['Siderosis','Byssinosis','Chronic bronchitis',"Farmer's lung"], ans:1, exp:'Monday fever is due to cotton dust exposure releasing histamine causing reversible bronchospasm, typical of byssinosis.' }
            ]
          },
          {
            name: 'Respiratory V',
            questions: [
              { q:'Presence of air in the pleural cavity leading to partial or complete lung collapse is called:', opts:['Hemothorax','Pleural effusion','Pneumothorax','Empyema'], ans:2, exp:'Pneumothorax is defined as air in pleural cavity; hemothorax = blood; effusion = fluid; empyema = pus.' },
              { q:'Primary spontaneous pneumothorax is most common in:', opts:['Young, tall, thin males','Elderly women','Infants','COPD patients'], ans:0, exp:'Primary spontaneous pneumothorax occurs without lung disease, often in young tall thin males due to rupture of subpleural blebs.' },
              { q:'Secondary spontaneous pneumothorax occurs in all EXCEPT:', opts:['COPD','Asthma','TB','Diabetes mellitus'], ans:3, exp:'Secondary spontaneous pneumothorax occurs in underlying lung disease (COPD, TB, asthma, CF, ILD). Diabetes mellitus is not a cause.' },
              { q:'Catamenial pneumothorax occurs in:', opts:['Men during puberty','Women within 48 hours of menstruation','Children with asthma','Elderly with heart disease'], ans:1, exp:'Catamenial pneumothorax is rare, occurs in women aged >25-30 years, linked to menstruation.' },
              { q:'Tension pneumothorax is dangerous because:', opts:['Causes increased venous return','Air escapes easily','Causes mediastinal shift and obstructive shock','Occurs only in children'], ans:2, exp:'In tension pneumothorax, a one-way valve mechanism traps air causing increased pressure, mediastinal shift, decreased venous return, and obstructive shock.' },
              { q:'Classical clinical sign of tension pneumothorax is:', opts:['Tracheal deviation towards affected side','Tracheal deviation away from affected side','Dull percussion note','Crackles on auscultation'], ans:1, exp:'In tension pneumothorax, mediastinum shifts away from affected side causing trachea to deviate to the opposite side.' },
              { q:'On percussion, pneumothorax gives:', opts:['Stony dull note','Hyperresonant note','Tympanitic note','Impaired resonance'], ans:1, exp:'Air collection causes hyperresonance. Fluid collection (hemothorax/effusion) causes dullness.' },
              { q:'Investigation of choice for small pneumothorax:', opts:['X-ray','CT chest','Ultrasound','MRI'], ans:1, exp:'CT is most sensitive and detects small pneumothoraces.' },
              { q:'Chest X-ray finding in pneumothorax:', opts:['Homogeneous opacity with meniscus sign','Absence of lung markings beyond pleural line','Crescent sign','Honeycomb pattern'], ans:1, exp:'Pneumothorax shows absence of lung markings beyond the visceral pleura.' },
              { q:'Immediate management of tension pneumothorax:', opts:['Thoracotomy','Needle decompression in 2nd ICS MCL','Observation only','Pleurodesis'], ans:1, exp:'Emergency management requires immediate needle decompression at 2nd ICS, midclavicular line, followed by chest tube insertion.' },
              { q:'Preferred site for chest tube insertion:', opts:['2nd ICS midclavicular','5th ICS mid-axillary line','8th ICS posteriorly','1st ICS parasternal'], ans:1, exp:'The safe triangle at 5th ICS, mid-axillary line is the standard site for chest tube insertion.' },
              { q:'Safe triangle for chest tube drainage includes all EXCEPT:', opts:['Anterior border of latissimus dorsi','Lateral border of pectoralis major','Line superior to nipple','Posterior axillary line'], ans:3, exp:'The safe triangle is bounded by the anterior border of latissimus dorsi, lateral border of pectoralis major, and the nipple line (5th ICS).' },
              { q:'Definitive management of recurrent pneumothorax:', opts:['Thoracentesis','Pleurodesis (talc/doxycycline)','Needle aspiration','Observation'], ans:1, exp:'Recurrent or persistent pneumothorax is managed with pleurodesis or surgical bullectomy.' },
              { q:'Hemothorax is defined as:', opts:['Blood-stained sputum','Pleural fluid hematocrit >50% of blood','Blood in alveoli','Pleural fluid RBCs >10,000'], ans:1, exp:'Hemothorax is confirmed when pleural fluid hematocrit exceeds 50% of peripheral blood hematocrit.' },
              { q:'Most common cause of hemothorax:', opts:['TB','Trauma','Lung cancer','Anticoagulant therapy'], ans:1, exp:'Traumatic chest injury is the most common cause of hemothorax.' },
              { q:'Clinical finding in massive hemothorax:', opts:['Hyperresonant percussion','Dull percussion','Crepitus','Crackles'], ans:1, exp:'Blood collection in the pleural space causes dullness on percussion and reduced breath sounds.' },
              { q:'Chest X-ray feature of hemothorax:', opts:['Homogeneous opacity with meniscus sign','Pneumomediastinum','Air bronchograms','Hyperinflated lung'], ans:0, exp:'Fluid in the pleural space causes homogeneous opacity with a meniscus sign on chest X-ray.' },
              { q:'Confirmatory test for hemothorax:', opts:['Chest X-ray','Thoracentesis','CT','Ultrasound'], ans:1, exp:'Thoracentesis with pleural fluid hematocrit >50% of blood hematocrit confirms hemothorax.' },
              { q:'Initial management of hemothorax includes all EXCEPT:', opts:['Airway, Breathing, Circulation (ABC)','Oxygen','Immediate thoracotomy','IV fluids'], ans:2, exp:'Thoracotomy is reserved for massive bleeds; initial management focuses on ABC, oxygen, and IV fluids.' },
              { q:'Indication for thoracotomy in hemothorax:', opts:['Drainage <200 mL/hr','Initial drainage >1500 mL','Pleural effusion >500 mL','Hematocrit <20%'], ans:1, exp:'Surgical thoracotomy is indicated if initial drainage exceeds 1500 mL or ongoing bleeding exceeds 200 mL/hr.' },
              { q:'Complication of hemothorax:', opts:['Pneumoperitoneum','Fibrothorax','Pulmonary fibrosis','Pneumobilia'], ans:1, exp:'Organized blood clot in the pleural cavity leads to fibrosis and fibrothorax.' },
              { q:'Empyema occurring as a complication of hemothorax results from:', opts:['Pleural effusion','Infected hemothorax','Pneumonia','Atelectasis'], ans:1, exp:'Infected hemothorax can progress to empyema (pus in the pleural cavity).' },
              { q:'Shock in tension pneumothorax is:', opts:['Hypovolemic','Obstructive','Cardiogenic','Septic'], ans:1, exp:'Due to compression of venous return by trapped air, tension pneumothorax causes obstructive shock.' },
              { q:'Best investigation to detect small collections in a trauma setting:', opts:['Chest X-ray','Ultrasound (FAST)','CT chest','Pleural tap'], ans:1, exp:'FAST (Focused Assessment with Sonography in Trauma) detects small pleural fluid and hemothorax quickly.' },
              { q:'Which procedure carries a risk of iatrogenic pneumothorax?', opts:['Appendectomy','Central line insertion','Hernia repair','Tonsillectomy'], ans:1, exp:'Central venous line insertion, thoracentesis, and mechanical ventilation can cause iatrogenic pneumothorax.' }
            ]
          }
        ]
      }
    ];
    let SECTIONS = [];

    // ── State ──────────────────────────────────────────────────
    let state = {};

    function resetState(catIdx) {
        const singleCat = (catIdx !== undefined && catIdx !== null && catIdx >= 0);
        if (singleCat) {
            const cat = CATEGORIES[catIdx];
            SECTIONS = cat.sections.map(sec => ({ ...sec, icon: cat.icon, color: cat.color }));
        } else {
            SECTIONS = CATEGORIES.flatMap(cat =>
                cat.sections.map(sec => ({ ...sec, icon: cat.icon, color: cat.color }))
            );
        }
        state = {
            currentSection:  0,
            currentQuestion: 0,
            selectedCategory: singleCat ? catIdx : null,
            sectionStates:   SECTIONS.map(() => 'active'),
            answers:        SECTIONS.map(sec => Array(sec.questions.length).fill(null)),
            sectionResults: SECTIONS.map(() => null),
            chartInstances: {}
        };
    }

    // ── DOM refs ───────────────────────────────────────────────
    const screenWelcome  = document.getElementById('mts-welcome');
    const screenExam     = document.getElementById('mts-exam');
    const screenResults  = document.getElementById('mts-results');
    const tabsScroll     = document.getElementById('mts-tabs-scroll');
    const qCounter       = document.getElementById('mts-q-counter');
    const sectionBadge   = document.getElementById('mts-section-badge');
    const progressFill   = document.getElementById('mts-progress-fill');
    const qNum           = document.getElementById('mts-q-num');
    const qText          = document.getElementById('mts-q-text');
    const optionsWrap    = document.getElementById('mts-options');
    const submitBtn      = document.getElementById('mts-submit-btn');
    const feedbackCard   = document.getElementById('mts-feedback-card');
    const feedbackResult = document.getElementById('mts-feedback-result');
    const correctReveal  = document.getElementById('mts-correct-reveal');
    const explanationEl  = document.getElementById('mts-explanation');
    const navBar         = document.getElementById('mts-nav-bar');
    const prevBtn        = document.getElementById('mts-prev-btn');
    const nextBtn        = document.getElementById('mts-next-btn');
    const navCenter      = document.getElementById('mts-nav-center');
    const sectionDone    = document.getElementById('mts-section-done');
    const doneTitle      = document.getElementById('mts-done-title');
    const doneStats      = document.getElementById('mts-done-stats');
    const nextSectionBtn = document.getElementById('mts-next-section-btn');
    const scAnswered     = document.getElementById('sc-answered');
    const scCorrect      = document.getElementById('sc-correct');
    const scWrong        = document.getElementById('sc-wrong');
    const scScore        = document.getElementById('sc-score');
    const scAccuracy     = document.getElementById('sc-accuracy');
    const scAccFill      = document.getElementById('sc-acc-fill');
    const scoreSection   = document.getElementById('mts-score-section');
    const sectionsMini   = document.getElementById('mts-sections-mini');

    // ── Utility ────────────────────────────────────────────────
    function show(el)  { if (el) el.classList.remove('mts-hidden'); }
    function hide(el)  { if (el) el.classList.add('mts-hidden');    }
    function showScreen(name) {
        [screenWelcome, screenExam, screenResults].forEach(s => { if (s) s.classList.add('mts-hidden'); });
        const target = { welcome: screenWelcome, exam: screenExam, results: screenResults }[name];
        if (target) target.classList.remove('mts-hidden');
    }

    let pendingCatIdx = null;

    // ── Category Nav (left panel) ───────────────────────────────
    function buildCatNav() {
        const catNav = document.getElementById('mts-cat-nav');
        if (!catNav) return;
        catNav.innerHTML = CATEGORIES.map((cat, i) => {
            const isActive = i === state.selectedCategory;
            return `<button class="mts-left-cat${isActive ? ' mts-left-cat-active' : ''}" data-cat-idx="${i}" style="--cat-col:${cat.color}">
                <i class="fa-solid ${cat.icon}"></i>
                <span>${cat.name}</span>
            </button>`;
        }).join('');
        catNav.querySelectorAll('.mts-left-cat').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.catIdx);
                if (idx === state.selectedCategory) return;
                pendingCatIdx = idx;
                openCatConfirm();
            });
        });
    }

    // ── Tabs ───────────────────────────────────────────────────
    function buildTabs() {
        if (!tabsScroll) return;
        tabsScroll.innerHTML = SECTIONS.map((sec, i) => {
            const ans = state.answers[i];
            const answered = ans.filter(a => a !== null).length;
            const allDone = answered === sec.questions.length;
            const isCurrent = i === state.currentSection;

            let cls = 'mts-tab';
            let icon = '';
            if (isCurrent)    { cls += ' mts-tab-active'; icon = '<i class="fa-solid fa-circle-dot"></i> '; }
            else if (allDone) { cls += ' mts-tab-done';   icon = '<i class="fa-solid fa-check"></i> '; }

            const scoreEl = answered > 0
                ? `<span class="mts-tab-score">${answered}/${sec.questions.length}</span>`
                : '';
            return `<button class="${cls}" data-sec="${i}"><span>${icon}Section ${i + 1}</span>${scoreEl}</button>`;
        }).join('');
        tabsScroll.querySelectorAll('.mts-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                state.currentSection  = parseInt(btn.dataset.sec);
                state.currentQuestion = 0;
                renderQuestion();
            });
        });
    }

    // ── Score panel ────────────────────────────────────────────
    function updateScorePanel() {
        const sec = state.currentSection;
        const ans = state.answers[sec];
        const answered = ans.filter(a => a !== null).length;
        const correct  = ans.filter(a => a && a.correct).length;
        const wrong    = answered - correct;
        const acc      = answered > 0 ? Math.round(correct / answered * 100) : 0;

        if (scAnswered) scAnswered.textContent = answered;
        if (scCorrect)  scCorrect.textContent  = correct;
        if (scWrong)    scWrong.textContent     = wrong;
        if (scScore)    scScore.textContent     = correct;
        if (scAccuracy) scAccuracy.textContent  = acc + '%';
        if (scAccFill)  scAccFill.style.width   = acc + '%';
        if (scoreSection) scoreSection.textContent = 'Section ' + (sec + 1);

        if (sectionsMini) {
            sectionsMini.innerHTML = SECTIONS.map((s, i) => {
                const ans = state.answers[i];
                const answered = ans.filter(a => a !== null).length;
                const allDone = answered === s.questions.length;
                const isCurrent = i === sec;
                const correctCount = ans.filter(a => a && a.correct).length;

                let cls = 'mts-mini-section';
                if (isCurrent)    { cls += ' mts-mini-active'; }
                else if (allDone) { cls += ' mts-mini-done'; }

                let right = '';
                if (isCurrent) {
                    right = `${answered}/${s.questions.length}`;
                } else if (answered > 0) {
                    right = `<span class="mts-mini-score">${correctCount}✓ &nbsp;${answered}/${s.questions.length}</span>`;
                } else {
                    right = '<span style="opacity:0.4;font-size:0.72rem">Not started</span>';
                }
                return `<div class="${cls}" data-jump-sec="${i}"><span>Section ${i + 1}</span>${right}</div>`;
            }).join('');
            sectionsMini.querySelectorAll('[data-jump-sec]').forEach(row => {
                row.addEventListener('click', () => {
                    state.currentSection  = parseInt(row.dataset.jumpSec);
                    state.currentQuestion = 0;
                    renderQuestion();
                });
            });
        }
    }

    // ── Render question ────────────────────────────────────────
    function renderQuestion() {
        const sec = state.currentSection;
        const qi  = state.currentQuestion;
        const q   = SECTIONS[sec].questions[qi];
        const existing = state.answers[sec][qi];
        const answered = existing !== null;

        show(document.getElementById('mts-question-card'));
        hide(sectionDone);

        if (qNum)     qNum.textContent      = `Q${qi + 1}.`;
        if (qText)    qText.textContent     = q.q;
        if (qCounter) qCounter.textContent  = `Question ${qi + 1} of ${SECTIONS[sec].questions.length}`;
        if (sectionBadge) sectionBadge.textContent = 'Section ' + (sec + 1);
        if (progressFill) progressFill.style.width = ((qi + (answered ? 1 : 0)) / SECTIONS[sec].questions.length * 100) + '%';

        // Build options
        if (optionsWrap) {
            optionsWrap.innerHTML = q.opts.map((opt, idx) => {
                let cls = 'mts-option';
                if (answered) {
                    if (idx === q.ans)               cls += ' mts-opt-correct';
                    else if (idx === existing.selected) cls += ' mts-opt-wrong';
                }
                const disabled = answered ? 'disabled' : '';
                return `<button class="${cls}" data-idx="${idx}" ${disabled}>
                    <span class="mts-opt-key">${String.fromCharCode(65+idx)}</span>${opt}
                </button>`;
            }).join('');

            if (!answered) {
                optionsWrap.querySelectorAll('.mts-option').forEach(btn => {
                    btn.addEventListener('click', () => {
                        optionsWrap.querySelectorAll('.mts-option').forEach(b => b.classList.remove('mts-opt-selected'));
                        btn.classList.add('mts-opt-selected');
                        if (submitBtn) submitBtn.disabled = false;
                    });
                });
            }
        }

        // Submit button — always disabled until an option is selected
        if (submitBtn) {
            submitBtn.disabled = true;
            if (answered) hide(submitBtn); else show(submitBtn);
        }

        // Feedback
        if (answered) {
            showFeedback(sec, qi, existing.selected);
            show(navBar);
            updateNavButtons(sec, qi);
        } else {
            hide(feedbackCard);
            hide(navBar);
        }

        buildCatNav();
        buildTabs();
        updateScorePanel();
    }

    // ── Show feedback ──────────────────────────────────────────
    function showFeedback(sec, qi, selected) {
        const q = SECTIONS[sec].questions[qi];
        const isCorrect = selected === q.ans;

        show(feedbackCard);
        if (feedbackResult) {
            feedbackResult.className = 'mts-feedback-result ' + (isCorrect ? 'mts-correct' : 'mts-wrong');
            feedbackResult.innerHTML = isCorrect
                ? '<i class="fa-solid fa-circle-check"></i> Correct Answer! +1 Mark Awarded'
                : '<i class="fa-solid fa-circle-xmark"></i> Incorrect Answer';
        }
        if (!isCorrect && correctReveal) {
            show(correctReveal);
            correctReveal.innerHTML = `<strong>Correct Answer:</strong> ${q.opts[q.ans]}`;
        } else if (correctReveal) {
            hide(correctReveal);
        }
        if (explanationEl) {
            explanationEl.innerHTML = `<strong>Explanation:</strong> ${q.exp}`;
        }
    }

    // ── Nav buttons ────────────────────────────────────────────
    function updateNavButtons(sec, qi) {
        if (prevBtn) prevBtn.style.visibility = qi > 0 ? 'visible' : 'hidden';
        if (nextBtn) {
            nextBtn.innerHTML = 'Next <i class="fa-solid fa-chevron-right"></i>';
            nextBtn.className = 'mts-nav-btn mts-btn-cyan';
            nextBtn.disabled = (qi >= SECTIONS[sec].questions.length - 1);
        }
        if (navCenter) {
            const secAns = state.answers[sec].filter(a => a !== null).length;
            navCenter.textContent = `${secAns} / ${SECTIONS[sec].questions.length} answered`;
        }
    }

    // ── Submit answer ──────────────────────────────────────────
    function submitAnswer() {
        const selected = optionsWrap ? optionsWrap.querySelector('.mts-opt-selected') : null;
        if (!selected) return;
        const sec = state.currentSection;
        const qi  = state.currentQuestion;
        const selectedIdx = parseInt(selected.dataset.idx);
        const isCorrect   = selectedIdx === SECTIONS[sec].questions[qi].ans;

        state.answers[sec][qi] = { selected: selectedIdx, correct: isCorrect };
        hide(submitBtn);
        renderQuestion();
    }

    // ── Complete section (saves results; no longer blocks navigation) ─────
    function completeSection() {
        const sec = state.currentSection;
        const ans = state.answers[sec];
        const correct = ans.filter(a => a && a.correct).length;
        const wrong   = ans.filter(a => a && !a.correct).length;
        state.sectionResults[sec] = { correct, wrong, score: correct };
        buildCatNav();
        buildTabs();
        updateScorePanel();
    }

    // ── Results screen ─────────────────────────────────────────
    function showResults() {
        showScreen('results');

        // Compute results from answers (all attempted sections)
        const attempted = SECTIONS.map((sec, i) => {
            const ans = state.answers[i];
            const answered = ans.filter(a => a !== null).length;
            if (answered === 0) return null;
            const correct = ans.filter(a => a && a.correct).length;
            const wrong   = answered - correct;
            return { i, r: { correct, wrong, score: correct } };
        }).filter(Boolean);
        const totalQs    = attempted.reduce((sum, {i}) => sum + SECTIONS[i].questions.length, 0);
        const totCorrect = attempted.reduce((s, {r}) => s + r.correct, 0);
        const totWrong   = attempted.reduce((s, {r}) => s + r.wrong, 0);
        const totalScore = totCorrect;
        const pct        = totalQs > 0 ? Math.round(totCorrect / totalQs * 100) : 0;
        const passed     = pct >= 60;

        const subEl = document.getElementById('mts-results-sub');
        if (subEl) subEl.textContent = `Score: ${totalScore}/${totalQs} · ${pct}% · ${passed ? '✅ PASS' : '❌ NEEDS IMPROVEMENT'}`;

        // Section scores — only attempted sections
        const secScoresEl = document.getElementById('mts-section-scores');
        if (secScoresEl) {
            secScoresEl.innerHTML = attempted.map(({i, r}) => {
                const pctW = Math.round(r.correct / SECTIONS[i].questions.length * 100);
                return `<div class="mts-sec-score-row">
                    <span class="mts-sec-score-label">${SECTIONS[i].name}</span>
                    <div class="mts-sec-score-bar-wrap"><div class="mts-sec-score-bar" style="width:0%" data-target="${pctW}"></div></div>
                    <span class="mts-sec-score-val">${r.correct}/${SECTIONS[i].questions.length}</span>
                </div>`;
            }).join('');
            setTimeout(() => {
                secScoresEl.querySelectorAll('.mts-sec-score-bar').forEach(b => {
                    b.style.width = b.dataset.target + '%';
                });
            }, 100);
        }

        // Total row
        const totEl = document.getElementById('mts-total-score-row');
        if (totEl) {
            totEl.innerHTML = `<span class="mts-total-score-left">Total Score</span>
                <span class="mts-total-score-right">${totalScore} / ${totalQs} &nbsp;·&nbsp; ${pct}%</span>`;
        }

        // Analytics
        const scores = attempted.map(({i, r}) => ({ i, correct: r.correct }));
        const best   = scores.reduce((a, b) => b.correct > a.correct ? b : a, scores[0]);
        const worst  = scores.reduce((a, b) => b.correct < a.correct ? b : a, scores[0]);
        const anaEl  = document.getElementById('mts-analytics-grid');
        if (anaEl) {
            anaEl.innerHTML = [
                ['Accuracy', pct + '%', passed ? 'Pass' : 'Below 60%'],
                ['Total Correct', totCorrect, `of ${totalQs}`],
                ['Total Wrong', totWrong, `of ${totalQs}`],
                ...(scores.length > 1 ? [
                    ['Strongest', SECTIONS[best.i].name, `${best.correct}/${SECTIONS[best.i].questions.length}`],
                    ['Weakest',   SECTIONS[worst.i].name, `${worst.correct}/${SECTIONS[worst.i].questions.length}`]
                ] : []),
                ['Status', passed ? 'PASS' : 'FAIL', '']
            ].map(([lbl, val, sub]) =>
                `<div class="mts-analytic-item">
                    <div class="mts-analytic-label">${lbl}</div>
                    <div class="mts-analytic-val">${val}</div>
                    ${sub ? `<div class="mts-analytic-sub">${sub}</div>` : ''}
                </div>`
            ).join('');
        }

        // Charts
        buildCharts(totCorrect, totWrong, scores, totalQs);

        // Question review
        buildReviewList('all');
        const filterBtns = document.querySelectorAll('.mts-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('mts-filter-active'));
                btn.classList.add('mts-filter-active');
                buildReviewList(btn.dataset.filter);
            });
        });
    }

    // ── Charts ─────────────────────────────────────────────────
    function buildCharts(totCorrect, totWrong, scores, totalQs) {
        if (typeof Chart === 'undefined') return;

        Object.values(state.chartInstances).forEach(c => { try { c.destroy(); } catch(e) {} });
        state.chartInstances = {};

        // Donut
        const donutCtx = document.getElementById('mts-donut-chart');
        if (donutCtx) {
            state.chartInstances.donut = new Chart(donutCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Correct', 'Wrong'],
                    datasets: [{ data: [totCorrect, totWrong], backgroundColor: ['#06b6d4','#f43f5e'], borderWidth: 0, hoverOffset: 6 }]
                },
                options: {
                    cutout: '68%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } } },
                    animation: { animateRotate: true, duration: 1000 }
                }
            });
        }
        const centerEl = document.getElementById('mts-donut-center');
        if (centerEl) {
            const pct = totalQs > 0 ? Math.round(totCorrect / totalQs * 100) : 0;
            centerEl.innerHTML = `<strong>${pct}%</strong><span>Accuracy</span>`;
        }
        const legendEl = document.getElementById('mts-donut-legend');
        if (legendEl) {
            legendEl.innerHTML = [['#06b6d4','Correct', totCorrect], ['#f43f5e','Wrong', totWrong]].map(([c, lbl, val]) =>
                `<div class="mts-donut-legend-item"><div class="mts-legend-dot" style="background:${c}"></div>${lbl}: ${val}</div>`
            ).join('');
        }

        // Bar
        const barCtx = document.getElementById('mts-bar-chart');
        if (barCtx) {
            const maxQs = Math.max(...scores.map(s => SECTIONS[s.i].questions.length));
            state.chartInstances.bar = new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: scores.map(s => SECTIONS[s.i].name.split(' ')[0]),
                    datasets: [{
                        data: scores.map(s => s.correct),
                        backgroundColor: scores.map((s, i) => ['#06b6d4','#3b82f6','#7c3aed','#14b8a6','#f59e0b'][i]),
                        borderRadius: 8, borderSkipped: false
                    }]
                },
                options: {
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` Score: ${ctx.raw}/${SECTIONS[scores[ctx.dataIndex].i].questions.length}` } } },
                    scales: {
                        y: { min: 0, max: maxQs, ticks: { stepSize: Math.ceil(maxQs / 5), font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
                        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
                    },
                    animation: { duration: 800 }
                }
            });
        }
    }

    // ── Question review ────────────────────────────────────────
    function buildReviewList(filter) {
        const listEl = document.getElementById('mts-review-list');
        if (!listEl) return;
        let items = [];
        SECTIONS.forEach((sec, si) => {
            sec.questions.forEach((q, qi) => {
                const ans = state.answers[si][qi];
                if (!ans) return;
                const isCorrect = ans.correct;
                if (filter === 'correct' && !isCorrect) return;
                if (filter === 'wrong'   && isCorrect)  return;
                items.push({ si, qi, q, ans, isCorrect });
            });
        });
        listEl.innerHTML = items.map(({ si, qi, q, ans, isCorrect }) => `
            <div class="mts-review-item ${isCorrect ? 'mts-rev-correct' : 'mts-rev-wrong'}">
                <div class="mts-review-q">S${si+1} Q${qi+1}: ${q.q}</div>
                <div class="mts-review-answers">
                    <div class="mts-review-row">
                        <span class="mts-review-row-label">Your Ans</span>
                        <span class="mts-review-row-val ${isCorrect ? 'mts-val-correct' : 'mts-val-wrong'}">${q.opts[ans.selected]}</span>
                    </div>
                    ${!isCorrect ? `<div class="mts-review-row"><span class="mts-review-row-label">Correct</span><span class="mts-review-row-val mts-val-correct">${q.opts[q.ans]}</span></div>` : ''}
                </div>
                <span class="mts-review-status ${isCorrect ? 'mts-status-correct' : 'mts-status-wrong'}">${isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
            </div>`
        ).join('') || '<div style="padding:20px;text-align:center;color:#94a3b8;font-size:0.85rem;">No questions to show.</div>';
    }

    // ── Retest ─────────────────────────────────────────────────
    function retest() {
        if (screenResults) screenResults.classList.add('mts-hidden');
        if (screenExam)    screenExam.classList.add('mts-hidden');
        if (screenWelcome) screenWelcome.classList.remove('mts-hidden');
    }

    // ── Category selection (welcome screen) ────────────────────
    let selectedCatIdx = 0;
    const catGrid = document.getElementById('mts-cat-grid');
    if (catGrid) {
        catGrid.querySelectorAll('.mts-cat-card').forEach(card => {
            card.addEventListener('click', () => {
                catGrid.querySelectorAll('.mts-cat-card').forEach(c => c.classList.remove('mts-cat-active'));
                card.classList.add('mts-cat-active');
                selectedCatIdx = parseInt(card.dataset.cat);
            });
        });
    }

    // ── Wire events ────────────────────────────────────────────
    const startBtn = document.getElementById('mts-start-btn');
    if (startBtn) startBtn.addEventListener('click', () => {
        resetState(selectedCatIdx);
        showScreen('exam');
        renderQuestion();
    });

    if (submitBtn) submitBtn.addEventListener('click', submitAnswer);

    if (prevBtn) prevBtn.addEventListener('click', () => {
        if (state.currentQuestion > 0) {
            state.currentQuestion--;
            renderQuestion();
        }
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (state.currentQuestion < SECTIONS[state.currentSection].questions.length - 1) {
            state.currentQuestion++;
            renderQuestion();
        }
    });

    if (nextSectionBtn) nextSectionBtn.addEventListener('click', () => {
        const next = state.currentSection + 1;
        if (next >= SECTIONS.length) {
            showResults();
        } else {
            state.currentSection  = next;
            state.currentQuestion = 0;
            renderQuestion();
        }
    });

    const retestBtn  = document.getElementById('mts-retest-btn');
    if (retestBtn) retestBtn.addEventListener('click', retest);

    // Exit button — show confirm modal
    const exitBtn         = document.getElementById('mts-exit-btn');
    const exitModal       = document.getElementById('mts-exit-modal');
    const exitCancelBtn   = document.getElementById('mts-exit-cancel-btn');
    const exitConfirmBtn  = document.getElementById('mts-exit-confirm-btn');

    function openExitModal()  { if (exitModal) exitModal.classList.remove('mts-hidden'); }
    function closeExitModal() { if (exitModal) exitModal.classList.add('mts-hidden'); }

    if (exitBtn)        exitBtn.addEventListener('click', openExitModal);
    if (exitCancelBtn)  exitCancelBtn.addEventListener('click', closeExitModal);
    if (exitConfirmBtn) exitConfirmBtn.addEventListener('click', () => {
        closeExitModal();
        retest();
    });
    // Close on backdrop click
    if (exitModal) exitModal.addEventListener('click', (e) => {
        if (e.target === exitModal) closeExitModal();
    });

    // ── Category switch confirmation (from left nav) ────────────
    const catConfirmModal = document.getElementById('mts-cat-confirm-modal');
    const catCancelBtn    = document.getElementById('mts-cat-cancel-btn');
    const catConfirmBtn   = document.getElementById('mts-cat-confirm-btn');

    function openCatConfirm()  { if (catConfirmModal) catConfirmModal.classList.remove('mts-hidden'); }
    function closeCatConfirm() { if (catConfirmModal) catConfirmModal.classList.add('mts-hidden'); }

    if (catCancelBtn) catCancelBtn.addEventListener('click', () => { pendingCatIdx = null; closeCatConfirm(); });
    if (catConfirmBtn) catConfirmBtn.addEventListener('click', () => {
        if (pendingCatIdx !== null) {
            selectedCatIdx = pendingCatIdx;
            const idx = pendingCatIdx;
            pendingCatIdx = null;
            closeCatConfirm();
            resetState(idx);
            showScreen('exam');
            renderQuestion();
        }
    });
    if (catConfirmModal) catConfirmModal.addEventListener('click', e => {
        if (e.target === catConfirmModal) { pendingCatIdx = null; closeCatConfirm(); }
    });

    // Init: disable submit until option selected
    if (submitBtn) submitBtn.disabled = true;
}

// ===========================================
// HOW TO PREPARE — Accordion
// Hover on desktop, click on touch devices
// ===========================================
function initPrepareAccordion() {
    const steps = document.querySelectorAll('.prepare-timeline .prepare-step');
    if (!steps.length) return;

    const isTouch = () => window.matchMedia('(hover: none)').matches;
    let openStep = null;

    function open(step) {
        if (openStep && openStep !== step) close(openStep);
        step.classList.add('is-open');
        step.setAttribute('aria-expanded', 'true');
        openStep = step;
    }

    function close(step) {
        step.classList.remove('is-open');
        step.setAttribute('aria-expanded', 'false');
        if (openStep === step) openStep = null;
    }

    function toggle(step) {
        step.classList.contains('is-open') ? close(step) : open(step);
    }

    steps.forEach(step => {
        // Desktop: hover
        step.addEventListener('mouseenter', () => {
            if (!isTouch()) open(step);
        });
        step.addEventListener('mouseleave', () => {
            if (!isTouch()) close(step);
        });

        // Touch: click/tap
        step.addEventListener('click', () => {
            if (isTouch()) toggle(step);
        });

        // Keyboard: Enter / Space always works
        step.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggle(step);
            }
        });
    });
}

// ===========================================
// SYLLABUS TAB EXPLORER
// ===========================================
function initSyllabusTabs() {
    const tabs = document.querySelectorAll('.syl-tab');
    const panels = document.querySelectorAll('.syl-panel');
    if (!tabs.length) return;

    function activateTab(tab) {
        const target = tab.dataset.tab;

        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
            t.setAttribute('tabindex', '-1');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');

        panels.forEach(p => {
            p.classList.remove('active', 'entering');
        });
        const panel = document.getElementById(`syl-panel-${target}`);
        if (panel) {
            panel.classList.add('active');
            void panel.offsetWidth; // force reflow to restart animation
            panel.classList.add('entering');
        }
    }

    tabs.forEach((tab, idx) => {
        tab.setAttribute('tabindex', idx === 0 ? '0' : '-1');
        tab.addEventListener('click', () => activateTab(tab));
        tab.addEventListener('keydown', (e) => {
            const arr = Array.from(tabs);
            const i = arr.indexOf(tab);
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const next = arr[(i + 1) % arr.length];
                next.focus();
                activateTab(next);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = arr[(i - 1 + arr.length) % arr.length];
                prev.focus();
                activateTab(prev);
            } else if (e.key === 'Home') {
                e.preventDefault();
                arr[0].focus();
                activateTab(arr[0]);
            } else if (e.key === 'End') {
                e.preventDefault();
                arr[arr.length - 1].focus();
                activateTab(arr[arr.length - 1]);
            }
        });
    });

    // Trigger entrance animation on first panel
    const firstPanel = document.querySelector('.syl-panel.active');
    if (firstPanel) {
        void firstPanel.offsetWidth;
        firstPanel.classList.add('entering');
    }
}

// ===========================================
// PREMIUM INTERACTION: Age Explorer Accordion
// Only handles standalone instances (not in vcarousel)
// ===========================================
function initAgeExplorer() {
    // Skip vcarousel-tracks — handled inside initVerticalCarousels()
    const standalone = document.getElementById('age-explorer');
    if (!standalone) return;
    const cards = standalone.querySelectorAll('.age-explorer-card');
    if (!cards.length) return;

    cards.forEach((card) => {
        const front = card.querySelector('.age-explorer-front');
        if (!front) return;
        front.addEventListener('click', () => {
            const isExpanded = card.classList.contains('expanded');
            cards.forEach(c => c.classList.remove('expanded'));
            if (!isExpanded) card.classList.add('expanded');
        });
    });
}

// ===========================================
// PREMIUM: Vertical Carousels (Eligibility + Age Relaxation)
// Independent auto-scroll, keyboard, wheel, touch, expand-pause
// ===========================================
function initVerticalCarousels() {
    document.querySelectorAll('.vcarousel-viewport').forEach(viewport => {
        const track = viewport.querySelector('.vcarousel-track');
        const dotsContainer = viewport.querySelector('.vcarousel-dots');
        if (!track) return;

        const cards = Array.from(track.children);
        const totalCards = cards.length;
        if (totalCards === 0) return;
        const visibleCount = 2;
        const autoplayDelay = parseInt(viewport.dataset.autoplay) || 8000;
        const transitionDuration = '1s cubic-bezier(0.25, 1, 0.5, 1)';

        let currentSlide = 0;
        let interval = null;
        let isPaused = false;
        let isCardExpanded = false;
        let wheelLocked = false;
        const totalSlides = Math.ceil(totalCards / visibleCount);

        function goToSlide(index, smooth = true) {
            if (index >= totalSlides) index = 0;
            if (index < 0) index = totalSlides - 1;
            currentSlide = index;
            const cardHeight = cards[0] ? cards[0].offsetHeight : 180;
            const gap = 16;
            const offset = currentSlide * (cardHeight * visibleCount + gap * visibleCount);
            track.style.transition = smooth ? `transform ${transitionDuration}` : 'none';
            track.style.transform = `translateY(-${offset}px)`;
            updateDots();
            updateActiveCards();
        }

        function next() { goToSlide(currentSlide + 1); }
        function prev() { goToSlide(currentSlide - 1); }

        function updateActiveCards() {
            cards.forEach((card, i) => {
                card.classList.remove('is-active');
                const startIdx = currentSlide * visibleCount;
                if (i >= startIdx && i < startIdx + visibleCount) {
                    card.classList.add('is-active');
                }
            });
        }

        // --- Dots ---
        if (dotsContainer) {
            dotsContainer.innerHTML = ''; // clear any stale dots from prior init
            dotsContainer.classList.add('vertical-dots');
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('div');
                dot.className = 'vdot' + (i === 0 ? ' active' : '');
                dot.dataset.index = i;
                dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.vdot').forEach((d, i) => {
                d.classList.toggle('active', i === currentSlide);
            });
        }

        // --- Autoplay (independent per viewport) ---
        function startAutoplay() {
            stopAutoplay();
            interval = setInterval(() => {
                if (!isPaused && !isCardExpanded) next();
            }, autoplayDelay);
        }
        function stopAutoplay() {
            if (interval) clearInterval(interval);
        }
        function resetAutoplay() { stopAutoplay(); startAutoplay(); }

        // --- Hover pause (only this column) ---
        viewport.addEventListener('mouseenter', () => { isPaused = true; });
        viewport.addEventListener('mouseleave', () => { isPaused = false; });

        // --- Mouse wheel with debounce (only this column) ---
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (wheelLocked) return;
            wheelLocked = true;
            if (e.deltaY > 0) next();
            else prev();
            resetAutoplay();
            setTimeout(() => { wheelLocked = false; }, 900);
        }, { passive: false });

        // --- Touch swipe (only this column) ---
        let touchStartY = 0;
        viewport.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            isPaused = true;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            const deltaY = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(deltaY) > 30) {
                if (deltaY > 0) next();
                else prev();
            }
            isPaused = false;
            resetAutoplay();
        }, { passive: true });

        // --- Keyboard navigation (only when focused) ---
        viewport.setAttribute('tabindex', '0');
        viewport.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') { e.preventDefault(); prev(); resetAutoplay(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); next(); resetAutoplay(); }
        });

        // --- Expand/collapse pause (age explorer cards) ---
        const ageCards = track.querySelectorAll('.age-explorer-card');
        ageCards.forEach(card => {
            const front = card.querySelector('.age-explorer-front');
            if (!front) return;
            const newFront = front.cloneNode(true);
            front.parentNode.replaceChild(newFront, front);
            newFront.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');
                ageCards.forEach(c => c.classList.remove('expanded'));
                if (!isExpanded) {
                    card.classList.add('expanded');
                    isCardExpanded = true;
                } else {
                    isCardExpanded = false;
                }
            });
        });

        goToSlide(0, false);
        startAutoplay();
    });
}

// ===========================================
// PREMIUM: Exam Process — Journey Timeline
// Milestones, expandable cards, progress line
// ===========================================
function initJourneyTimeline() {
    const section = document.querySelector('.journey-timeline-section');
    if (!section) return;

    const milestones = Array.from(section.querySelectorAll('.journey-milestone'));
    const cards      = Array.from(section.querySelectorAll('.journey-card'));
    const progressFill   = document.getElementById('journey-progress-fill');
    const counterCurrent = document.getElementById('journey-current');
    const prevBtn = document.getElementById('journey-prev');
    const nextBtn = document.getElementById('journey-next');
    if (!milestones.length || !cards.length) return;

    const totalSteps = milestones.length;
    let currentStep = -1; // -1 forces first activate(0) to run fully

    function activate(index) {
        if (index < 0 || index >= totalSteps || index === currentStep) return;
        currentStep = index;

        // Milestones
        milestones.forEach((m, i) => m.classList.toggle('active', i === index));

        // Exit all cards, then force a reflow so the entrance transition fires from opacity:0
        cards.forEach(c => c.classList.remove('active'));
        const nextCard = cards[index];
        if (nextCard) {
            void nextCard.offsetWidth; // flush style so transition starts from hidden state
            nextCard.classList.add('active');
        }

        // Progress bar
        const pct = totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 100;
        if (progressFill) progressFill.style.width = pct + '%';

        // Counter
        if (counterCurrent) counterCurrent.textContent = index + 1;

        // Button states
        if (prevBtn) prevBtn.disabled = index === 0;
        if (nextBtn) nextBtn.disabled = index === totalSteps - 1;

        // Scroll milestone into view only on small screens
        if (milestones[index] && window.innerWidth <= 768) {
            milestones[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }

    // Milestone clicks
    milestones.forEach((m, i) => m.addEventListener('click', () => activate(i)));

    // Nav buttons
    if (prevBtn) prevBtn.addEventListener('click', () => activate(currentStep - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => activate(currentStep + 1));

    // Keyboard
    section.setAttribute('tabindex', '0');
    section.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    { e.preventDefault(); activate(currentStep - 1); }
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  { e.preventDefault(); activate(currentStep + 1); }
    });

    // Swipe on roadmap
    const roadmap = section.querySelector('.journey-roadmap');
    if (roadmap) {
        let touchStartX = 0;
        roadmap.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        roadmap.addEventListener('touchend',   (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) activate(delta < 0 ? currentStep + 1 : currentStep - 1);
        }, { passive: true });
    }

    // Swipe on detail cards area too
    const detailCards = section.querySelector('.journey-detail-cards');
    if (detailCards) {
        let touchStartX = 0;
        detailCards.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
        detailCards.addEventListener('touchend',   (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(delta) > 40) activate(delta < 0 ? currentStep + 1 : currentStep - 1);
        }, { passive: true });
    }

    activate(0);
}


 // 2. Faculty Data Pool (Replaces Alumni Pool for Fade-in Grid)
    const facultyPool = [
        // Batch 1
        { name: "Shine Stephen", role: "Asst. Professor (Ex-AIIMS)", badge: "MSc (N)", icon: '<i class="fa-solid fa-trophy"></i>', desc: "A PGIMER & INC-WHO PhD Scholar, former AIIMS faculty, and multi-rank holder in KPSC exams.", img: "assets/images/faculties/SHINE.png" },
        { name: "Nayana Shaji", role: "M Pharm Pharmacology", badge: "GPAT Ranker", icon: '<i class="fa-solid fa-award"></i>', desc: "A GPAT Ranker and distinction holder across various Kerala & Central competitive pharmacy exams.", img: "assets/images/faculties/NAYANA.jpeg" },
        { name: "Vidhu R Vijayan", role: "MSc Nursing (Orthopedic)", badge: "NCLEX RN", icon: '<i class="fa-solid fa-stethoscope"></i>', desc: "An Orthopedic Nursing specialist who successfully passed the international NCLEX RN certification.", img: "assets/images/faculties/VIDHU.JPG.jpeg" },
        // Batch 2
        { name: "Honey Mol P. V", role: "MSc Molecular Biology", badge: "Distinction", icon: '<i class="fa-solid fa-dna"></i>', desc: "A Molecular Biology distinction holder and proven rank holder in Kerala PSC state recruitment.", img: "assets/images/faculties/HONEY.JPG.jpeg" },
        { name: "Sreelekshmi E. M", role: "MSc Microbiology", badge: "2nd Rank", icon: '<i class="fa-solid fa-microscope"></i>', desc: "Achieved 2nd Rank in state-level health recruitment for Microbiology specialists.", img: "assets/images/faculties/SREELEKSHMI.jpeg" },
        { name: "Arathy Surendran", role: "MSc Nursing (Pediatrics)", badge: "KUHS Scholar", icon: '<i class="fa-solid fa-baby"></i>', desc: "A Pediatrics Nursing scholar from KUHS and a recognized Kerala PSC nursing rank holder.", img: "assets/images/faculties/ARATHY.JPG.jpeg" },
        // Batch 3
        { name: "Aparna T. M", role: "M Pharm - KUHS", badge: "1st Rank", icon: '<i class="fa-solid fa-capsules"></i>', desc: "A distinguished M Pharm professional and 1st Rank holder in the KUHS pharmacy boards.", img: "assets/images/faculties/APARNA.jpeg" },
        { name: "Dr. Manjima G. S", role: "Doctor of Pharmacy (PharmD)", badge: "Int'l Scholar", icon: '<i class="fa-solid fa-globe"></i>', desc: "Awarded an International Scholarship for MSc Pharmacology in the UK after completing PharmD.", img: "assets/images/faculties/MANJIMA.jpeg" },
        { name: "Jesna Prasad", role: "BSc Nursing", badge: "German B2", icon: '<i class="fa-solid fa-language"></i>', desc: "A BSc Nurse with German A1-B2 proficiency, expert in guiding global migration for healthcare.", img: "assets/images/faculties/JESNA.JPG.jpeg" },
        // Batch 4 (Cycling back with Top Faculty to keep 3 cards)
        { name: "Jeethu Paul", role: "MSc Nursing (Pediatric)", badge: "KPSC Ranker", icon: '<i class="fa-solid fa-user-nurse"></i>', desc: "A specialized Pediatric Nurse with consistent ranking records in various Kerala PSC exams.", img: "assets/images/faculties/JEETHU.JPG.jpeg" },
        { name: "Shine Stephen", role: "Asst. Professor (Ex-AIIMS)", badge: "MSc (N)", icon: '<i class="fa-solid fa-trophy"></i>', desc: "A PGIMER & INC-WHO PhD Scholar, former AIIMS faculty, and multi-rank holder in KPSC exams.", img: "assets/images/faculties/SHINE.png" },
        { name: "Nayana Shaji", role: "M Pharm Pharmacology", badge: "GPAT Ranker", icon: '<i class="fa-solid fa-award"></i>', desc: "A GPAT Ranker and distinction holder across various Kerala & Central competitive pharmacy exams.", img: "assets/images/faculties/NAYANA.jpeg" }
    ];

    let currentFacultyBatch = 0; // Tracks which group of 3 is currently displayed
    
    // --- PERFORMANCE FIX: Shadowing DOM Nodes instead of arbitrary innerHTML insertion ---
    // And decoupling Parallax animation layer from Fade animation layer 
    const activeWrappers = document.querySelectorAll('.alumni-card-wrapper');
    const facultyDOMNodes = Array.from(activeWrappers).map(wrapper => {
        return {
            wrapper:   wrapper,
            cycleNode: wrapper.querySelector('.alumni-cycle-animator') || wrapper,
            img:       wrapper.querySelector('img'),
            badge:     wrapper.querySelector('.rank-badge'),
            name:      wrapper.querySelector('.alumni-text-overlay h3') || wrapper.querySelector('h3'),
            role:      wrapper.querySelector('.exam-name'),
            icon:      wrapper.querySelector('.dest-icon'),
            desc:      wrapper.querySelector('.placement-dest span:last-child')
        };
    });

    function bindTiltPhysics(nodeInfo) {
        const wrapper = nodeInfo.wrapper;
        const card = wrapper.querySelector('.prismatic-card');
        if (!card) return;

        let rect, centerX, centerY;
        let activeRAF = null;

        wrapper.addEventListener('mouseenter', () => {
            rect = wrapper.getBoundingClientRect();
            centerX = rect.width / 2;
            centerY = rect.height / 2;
            card.style.transition = "none";
        });

        wrapper.addEventListener('mousemove', (e) => {
            if(!rect) return; 
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            
            // Cancel unexecuted frames to prevent bottlenecking
            if(activeRAF) window.cancelAnimationFrame(activeRAF);

            activeRAF = window.requestAnimationFrame(() => {
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });

        wrapper.addEventListener('mouseleave', () => {
            if(activeRAF) window.cancelAnimationFrame(activeRAF);
            card.style.transition = `transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease`;
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
            setTimeout(() => {
                card.style.transition = `transform 0.15s ease, box-shadow 0.15s ease`;
            }, 600);
            rect = null; 
        });
    }

    // Bind tilt physics EXACTLY ONCE to avoid Compound Listener Leaks
    facultyDOMNodes.forEach(bindTiltPhysics);

    // Pre-load all images so no pop-in happens during cycle
    facultyPool.forEach(fac => {
        if(fac.img) {
            const img = new Image();
            img.src = fac.img;
        }
    });

    // 3. Cycling Engine (Zero DOM Reflow Edition)
    function cycleFaculty() {
        const totalBatches = Math.ceil(facultyPool.length / 3);
        currentFacultyBatch = (currentFacultyBatch + 1) % totalBatches;
        const batch = facultyPool.slice(currentFacultyBatch * 3, currentFacultyBatch * 3 + 3);

        // Phase 1: Fade Out + Jump Up (staggered cascade strictly on decopled inner node)
        facultyDOMNodes.forEach((node, i) => {
            setTimeout(() => {
                node.cycleNode.classList.add('cycling-out');
            }, i * 150);
        });

        // Phase 2: Direct Text Modification safely masked by CSS invisibility
        setTimeout(() => {
            facultyDOMNodes.forEach((node, i) => {
                const fac = batch[i];
                if (fac) {
                    if(node.img) { node.img.src = fac.img; node.img.alt = fac.name; }
                    if(node.badge) node.badge.textContent = fac.badge;
                    if(node.name) node.name.textContent = fac.name;
                    if(node.role) node.role.textContent = fac.role;
                    if(node.icon) node.icon.innerHTML = fac.icon;
                    if(node.desc) node.desc.textContent = fac.desc;
                }
                
                node.cycleNode.classList.remove('cycling-out');
                node.cycleNode.classList.add('cycling-in');
            });

            // Phase 3: Jump Reveal from Below 
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    facultyDOMNodes.forEach((node, i) => {
                        setTimeout(() => {
                            node.cycleNode.classList.remove('cycling-in');
                        }, i * 150);
                    });
                });
            });
        }, 800);
    }

    // Start cycling every 5 seconds
    setInterval(cycleFaculty, 5000);

    // --- 11. GSAP Testimonials Reveal ---
    gsap.set(".g-test-reveal", { autoAlpha: 1 });
    gsap.from(".g-test-reveal", {
        scrollTrigger: { trigger: ".testimonials-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out",
        clearProps: "filter,transform"
    });
