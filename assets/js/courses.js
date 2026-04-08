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

    