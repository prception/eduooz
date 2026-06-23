document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Initialize Lenis Smooth Scrolling ---
  function initLenis() {
    if (typeof Lenis === "undefined") {
      console.warn("Lenis script not loaded.");
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    window.lenis = lenis;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
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
    clearProps: "filter",
  });

  // --- 3. Navbar Light/Dark Blend Logic (If applicable to About page) ---
  function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    ScrollTrigger.create({
      start: 200,
      onEnter: () => navbar.classList.add("light-mode"),
      onLeaveBack: () => navbar.classList.remove("light-mode"),
    });
  }

  if (document.getElementById("navbar")) {
    initNavbarScroll();
  } else {
    window.addEventListener("headerLoaded", initNavbarScroll);
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
          scrub: 1,
        },
        yPercent: -20,
        scale: 0.95,
        opacity: 0.5,
        ease: "none",
        force3D: true,
      });
    });
  }

  if (document.querySelector(".luxury-footer-wrapper")) {
    initFooterAnimation();
  } else {
    window.addEventListener("footerLoaded", initFooterAnimation);
  }

  // --- 10. Scroll to Top Button ---
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      // Use Lenis smooth scroll if available, otherwise native
      if (window.lenis) {
        window.lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
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
      delay: 0.2,
    });

    // --- 2. Interactive Node Parallax Physics ---
    // We only attach the mouse listener to the wrapper on Desktop devices
    const nexusWrapper = document.querySelector(".nexus-hero-section");
    const parallaxElements = document.querySelectorAll(".parallax-element");

    if (
      nexusWrapper &&
      parallaxElements.length > 0 &&
      window.innerWidth > 1024
    ) {
      nexusWrapper.addEventListener("mousemove", (e) => {
        // Get mouse position relative to the center of the screen
        const x = e.clientX - window.innerWidth / 2;
        const y = e.clientY - window.innerHeight / 2;

        parallaxElements.forEach((el) => {
          // Get the unique speed data attribute for each node
          const speed = el.getAttribute("data-speed");

          // Calculate movement (Invert the movement so it feels like floating)
          const xMove = x * speed;
          const yMove = y * speed;

          // Apply movement smoothly using GSAP
          gsap.to(el, {
            x: xMove,
            y: yMove,
            duration: 1.5, // High duration gives it a "lazy, floating" feel
            ease: "power2.out",
          });
        });
      });

      // Reset to center smoothly when mouse leaves the hero section
      nexusWrapper.addEventListener("mouseleave", () => {
        parallaxElements.forEach((el) => {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 1.5,
            ease: "power2.out",
          });
        });
      });
    }
  }

  {
    // --- 1. Reveal Animations ---
    gsap.set(".g-monolith-reveal", { autoAlpha: 1 });

    // Animate the cards upwards, but keep the staggered layout intact
    const monoElements = gsap.utils.toArray(".g-monolith-reveal");
    monoElements.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 85%" },
        y: "+=40",
        opacity: 0,
        filter: "blur(10px)",
        duration: 1,
        ease: "power3.out",
      });
    });

    // --- 3. Trajectory Tab Switching Logic ---
    const tabContainer = document.getElementById("trajectoryTabs");
    const contentWrapper = document.getElementById("trajectoryContent");

    if (tabContainer && contentWrapper) {
      const tabs = tabContainer.querySelectorAll(".trajectory-tab");
      const sections = contentWrapper.querySelectorAll(".trajectory-section");

      tabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          const filter = this.getAttribute("data-filter");

          // Update active tab
          tabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");

          // Filter sections with animation
          sections.forEach((section) => {
            const sectionType = section.getAttribute("data-section");

            if (filter === "all" || sectionType === filter) {
              section.classList.remove("is-hidden");
              section.classList.remove("is-entering");
              // Force reflow to restart animation
              void section.offsetWidth;
              section.classList.add("is-entering");
            } else {
              section.classList.add("is-hidden");
              section.classList.remove("is-entering");
            }
          });

          // Re-trigger GSAP scroll animations for newly visible cards
          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        });
      });
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
    if (typeof Lenis === "undefined") {
      console.warn("Lenis script not loaded.");
      return;
    }
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });
    window.lenis = lenis;

    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
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
      onLeaveBack: () => navbar.classList.remove("light-mode"),
    });
  }

  if (document.getElementById("navbar")) {
    initNavbarScroll();
  } else {
    window.addEventListener("headerLoaded", initNavbarScroll);
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
    delay: 0.1,
  });

  // --- 1B. Dynamic FOMO Urgency Timer ---
  const timerEl = document.getElementById("fomo-timer");
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
  const wrapper = document.querySelector(".course-vital-wrapper");
  const card = document.getElementById("vital-card");

  if (wrapper && card) {
    wrapper.addEventListener("mousemove", (e) => {
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
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });

    // Reset smoothly when mouse leaves
    wrapper.addEventListener("mouseleave", () => {
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
  gsap.from(".course-video-section .g-vid-reveal", {
    scrollTrigger: { trigger: ".course-video-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // --- 4. Cinematic YouTube Lazy-Load Logic ---
  const videoPlayer = document.getElementById("custom-video-player");

  if (videoPlayer) {
    videoPlayer.addEventListener("click", function () {
      // Check if iframe already exists to prevent multiple clicks
      if (this.querySelector(".youtube-iframe")) return;

      // Get the YouTube ID from the data attribute
      const ytId = this.getAttribute("data-yt-id");
      const innerWrapper = this.querySelector(".video-player-inner");

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
          innerWrapper.insertAdjacentHTML("beforeend", iframeHTML);
        },
      });
    });
  }

  // --- 5. GSAP Curriculum Reveal ---
  gsap.set(".g-curr-reveal", { autoAlpha: 1 });
  gsap.from(".g-curr-reveal", {
    scrollTrigger: { trigger: ".curriculum-premium-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // --- 6. Interactive Phase Filter Logic ---
  const phaseBtns = document.querySelectorAll(".phase-btn");
  const phaseGrids = document.querySelectorAll(".matrix-grid");

  if (phaseBtns.length > 0 && phaseGrids.length > 0) {
    phaseBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        // If already active, do nothing
        if (this.classList.contains("active")) return;

        // 1. Update Button UI
        phaseBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");

        // 2. Identify target grid
        const targetId = this.getAttribute("data-target");
        const targetGrid = document.getElementById(targetId);
        const currentGrid = document.querySelector(".matrix-grid.active-grid");

        // 3. GSAP Transition Sequence
        const tl = gsap.timeline();

        // Fade out current grid
        if (currentGrid) {
          tl.to(currentGrid.querySelectorAll(".module-glass-card"), {
            y: 20,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.in",
            onComplete: () => {
              currentGrid.style.display = "none";
              currentGrid.classList.remove("active-grid");
            },
          });
        }

        // Fade in new grid
        tl.call(() => {
          targetGrid.style.display = "grid";
          targetGrid.classList.add("active-grid");
          // Reset opacity for GSAP to animate from
          gsap.set(targetGrid, { opacity: 1 });
        }).fromTo(
          targetGrid.querySelectorAll(".module-glass-card"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
        );
      });
    });

    // Mobile touch support for cards
    if (window.innerWidth <= 1024) {
      const moduleCards = document.querySelectorAll(".module-glass-card");
      moduleCards.forEach((card) => {
        card.addEventListener("click", () => {
          card.classList.toggle("is-open");
        });
      });
    }
  }

  // --- 7. Vercel-Style Spotlight Physics ---
  const syllabusSection = document.getElementById("syllabus");
  if (syllabusSection) {
    syllabusSection.addEventListener("mousemove", (e) => {
      const cards = document.querySelectorAll(".module-glass-card");
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      }
    });
  }

  // --- 7. GSAP Duration & Schedule Reveal ---

  // 1. Fade up the elements
  gsap.set(".g-dur-reveal", { autoAlpha: 1 });
  gsap.from(".g-dur-reveal", {
    scrollTrigger: { trigger: ".duration-light-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // 2. The Number Counter Animation
  const durationCounter = document.getElementById("duration-counter");

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
      onUpdate: function () {
        // Math.floor ensures we only show whole numbers while it counts up
        durationCounter.innerHTML = Math.floor(counterObj.val);
      },
    });
  }

  // --- 9. GSAP Pricing Vault Interactions ---

  // 1. Reveal Animation
  gsap.set(".g-price-reveal", { autoAlpha: 1 });
  gsap.from(".g-price-reveal", {
    scrollTrigger: { trigger: ".pricing-premium-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // 2. The Toggle Engine (One-Time vs EMI)
  const btnOnetime = document.getElementById("btn-onetime");
  const btnEmi = document.getElementById("btn-emi");
  const togglePill = document.querySelector(".toggle-pill");
  const priceValues = document.querySelectorAll(".price-value");
  const priceSuffixes = document.querySelectorAll(".price-suffix");

  if (btnOnetime && btnEmi && togglePill) {
    // Initialize pill width based on first button
    togglePill.style.width = `${btnOnetime.offsetWidth}px`;

    function switchPricing(mode) {
      // Animate Numbers
      priceValues.forEach((el) => {
        const targetVal = el.getAttribute(`data-${mode}`);

        // Fade out, change value, fade in
        gsap.to(el, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          onComplete: () => {
            el.innerHTML = targetVal;
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.3,
              ease: "back.out(1.5)",
            });
          },
        });
      });

      // Update Suffixes (e.g., "/ mo")
      priceSuffixes.forEach((el) => {
        const targetSuffix = el.getAttribute(`data-${mode}-suffix`);
        el.innerHTML = targetSuffix;
      });
    }

    btnOnetime.addEventListener("click", () => {
      if (btnOnetime.classList.contains("active")) return;

      btnEmi.classList.remove("active");
      btnOnetime.classList.add("active");

      // Move pill to the left
      togglePill.style.transform = `translateX(0)`;
      togglePill.style.width = `${btnOnetime.offsetWidth}px`;

      switchPricing("onetime");
    });

    btnEmi.addEventListener("click", () => {
      if (btnEmi.classList.contains("active")) return;

      btnOnetime.classList.remove("active");
      btnEmi.classList.add("active");

      // Move pill to the right
      togglePill.style.transform = `translateX(${btnOnetime.offsetWidth}px)`;
      togglePill.style.width = `${btnEmi.offsetWidth}px`;

      switchPricing("emi");
    });
  }

  // 3. Jitter-Free 3D Hover Physics for Pricing Cards
  const vaultWrappers = document.querySelectorAll(".vault-card-wrapper");

  vaultWrappers.forEach((wrapper) => {
    const card = wrapper.querySelector(".vault-card");

    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });

    wrapper.addEventListener("mouseleave", () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg)`;
      card.style.transition = `transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)`;
      setTimeout(() => {
        card.style.transition = `none`;
      }, 500);
    });
  });

  // --- 7. GSAP Cinematic Video Section ---

  // Scroll Reveal
  gsap.set(".g-vid-reveal", { autoAlpha: 1 });
  gsap.from(".video-luxury-section .g-vid-reveal", {
    scrollTrigger: {
      trigger: ".video-luxury-section",
      start: "top 80%",
    },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
    clearProps: "filter",
  });

  // --- Cinematic Lights Out & Magnetic Cursor Logic ---
  const mainPortal = document.getElementById("main-portal");
  const playCursor = document.querySelector(".magnetic-play-cursor");

  if (mainPortal && playCursor) {
    // 1. Hover Entrance: Snap cursor to mouse entry
    mainPortal.addEventListener("mouseenter", (e) => {
      const rect = mainPortal.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.set(playCursor, {
        x: x,
        y: y,
        xPercent: -50,
        yPercent: -50,
        scale: 0.5,
      });
    });

    // 2. Hover Exit
    mainPortal.addEventListener("mouseleave", () => {
      gsap.to(playCursor, { opacity: 0, scale: 0.5, duration: 0.3 });
    });

    // 3. Mouse Move: Magnetic Tracking using separated coordinates and percentages
    mainPortal.addEventListener("mousemove", (e) => {
      const rect = mainPortal.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(playCursor, {
        x: x,
        y: y,
        xPercent: -50,
        yPercent: -50,
        scale: 1,
        opacity: 1,
        duration: 0.2,
        ease: "sine.out",
      });
    });
  }

  // --- 7. Curved Playlist Liquid Slider Logic ---
  const playlistCards = document.querySelectorAll(".playlist-card");
  const activeVidImg = document.getElementById("active-vid-img");
  const activeVidTitle = document.getElementById("active-vid-title");
  const activeVidDesc = document.getElementById("active-vid-desc");
  const playlistTrack = document.querySelector(".playlist-track");

  let autoSlideInterval;
  let isAnimating = false;
  let lastDragDist = 0;

  // (Initialization is handled dynamically by renderPlaylistCards after data is loaded)

  // --- 7. YouTube Data API v3 Dynamic Fetcher ---
  const YOUTUBE_API_KEY = ""; // PASTE YOUR YOUTUBE DATA API V3 KEY HERE

  const extractYTId = (url) => {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const formatViews = (views) => {
    if (views >= 1000000)
      return (views / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (views >= 1000)
      return (views / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return views;
  };

  const formatDuration = (pt) => {
    const match = pt.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "00:00";
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    let str = "";
    if (h > 0) str += h + ":";
    str += (m < 10 && h > 0 ? "0" : "") + m + ":";
    str += (s < 10 ? "0" : "") + s;
    return str;
  };

  const fetchYTMetadataRealtime = async (card) => {
    if (!YOUTUBE_API_KEY) return; // Silent fallback to static HTML attributes if no key is provided

    const ytUrl = card.getAttribute("data-url");
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
        const monthsAgo = Math.floor(
          (new Date() - publishedAt) / (1000 * 60 * 60 * 24 * 30),
        );
        let dateStr =
          monthsAgo > 11
            ? `${Math.floor(monthsAgo / 12)} years ago`
            : `${monthsAgo} months ago`;
        if (monthsAgo === 0) dateStr = "recently";

        const statsStr = `${viewsStr} â€¢ ${dateStr}`;
        const rawDesc =
          vid.snippet.description.split("\n")[0].substring(0, 80) + "...";
        const durationStr = formatDuration(vid.contentDetails.duration);

        card.setAttribute("data-title", cleanTitle);
        card.setAttribute("data-desc", rawDesc);
        card.setAttribute("data-stats", statsStr);

        const durEl = card.querySelector(".playlist-duration");
        if (durEl) durEl.innerText = durationStr;

        if (card.classList.contains("active")) {
          const activeVidTitle = document.getElementById("active-vid-title");
          const activeVidDesc = document.getElementById("active-vid-desc");
          const activeVidStats = document.getElementById("active-vid-stats");

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
    const viewport = document.querySelector(".playlist-viewport");
    if (!viewport) return 0;
    const viewportWidth = viewport.offsetWidth;
    const card = playlistTrack.children[2];
    const cardWidth = card.offsetWidth;
    const gap = parseInt(window.getComputedStyle(playlistTrack).gap) || 0;
    const card2Center = (cardWidth + gap) * 2 + cardWidth / 2;
    return viewportWidth / 2 - card2Center;
  };

  // Initial positioning
  if (playlistTrack) {
    gsap.set(playlistTrack, { x: getCenterOffset() });
    window.addEventListener("resize", () => {
      gsap.set(playlistTrack, { x: getCenterOffset() });
    });
  }

  // Trigger background fetch for all localized cards on load
  playlistCards.forEach((card) => fetchYTMetadataRealtime(card));

  let mainPortalSyncTL = null;

  const syncMainPortal = (card) => {
    if (!card) return;

    // Enforce DOM level Active CSS swapping (use LIVE children, not stale NodeList)
    Array.from(playlistTrack.children).forEach((c) =>
      c.classList.remove("active"),
    );
    card.classList.add("active");

    const newImg = card.getAttribute("data-img");
    const newTitle = card.getAttribute("data-title");
    const newDesc = card.getAttribute("data-desc");
    const newStats = card.getAttribute("data-stats");
    const newUrl = card.getAttribute("data-url");

    // Prevent GSAP timeline collision if swiping incredibly fast
    if (mainPortalSyncTL) mainPortalSyncTL.kill();

    mainPortalSyncTL = gsap.timeline();
    mainPortalSyncTL
      .to([activeVidImg, ".active-video-meta"], {
        opacity: 0,
        filter: "blur(15px)",
        scale: 1.05,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          // Destroy iframe to stop audio
          const existingIframe = document.querySelector(
            ".main-video-portal iframe",
          );
          if (existingIframe) existingIframe.remove();
          const playCursor = document.querySelector(
            ".main-video-portal .magnetic-play-cursor",
          );
          if (playCursor) playCursor.style.display = "";

          if (activeVidImg) activeVidImg.src = newImg;
          if (activeVidTitle) activeVidTitle.innerText = newTitle;
          if (activeVidDesc) activeVidDesc.innerText = newDesc;
          const statsEl = document.getElementById("active-vid-stats");
          if (statsEl && newStats) statsEl.innerText = newStats;
          const linkEl = document.querySelector(".yt-badge");
          if (linkEl && newUrl) linkEl.href = newUrl;
        },
      })
      .to([activeVidImg, ".active-video-meta"], {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
      });
  };

  // (Click handlers are attached dynamically by renderPlaylistCards)

  // --- 7.5 Inline YouTube Iframe Player ---
  const playerPortal = document.getElementById("main-portal");
  if (playerPortal) {
    playerPortal.addEventListener("click", (e) => {
      if (e.target.closest(".yt-badge")) return;

      const linkEl = document.querySelector(".yt-badge");
      if (!linkEl) return;

      const ytUrl = linkEl.href;
      const match = ytUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const videoId = match[1];
        const frameContainer = playerPortal.querySelector(".video-glass-frame");

        if (!frameContainer.querySelector("iframe")) {
          const iframe = document.createElement("iframe");
          iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
          iframe.setAttribute("frameborder", "0");
          iframe.setAttribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          );
          iframe.setAttribute("allowfullscreen", "true");
          iframe.style.position = "absolute";
          iframe.style.top = "0";
          iframe.style.left = "0";
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.zIndex = "15";
          iframe.style.borderRadius = "inherit";
          frameContainer.appendChild(iframe);

          const cursor = playerPortal.querySelector(".magnetic-play-cursor");
          if (cursor) cursor.style.display = "none";
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
    {
      img: "https://img.youtube.com/vi/E1X1RFFt138/maxresdefault.jpg",
      url: "https://youtu.be/E1X1RFFt138?si=0TrAngTwP8UsTbqw",
      title: "Super notes for Assistant Professor in Nursing",
      desc: "Eduooz International Academy | Nursing Exam Guide",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "08:53",
    },
    {
      img: "https://img.youtube.com/vi/4J_sUv_L5f0/maxresdefault.jpg",
      url: "https://youtu.be/4J_sUv_L5f0?si=eK1eW4HgoQy_c_4v",
      title: "DHS Staff Nurse Exam Preparation 2025",
      desc: "How to Crack DHS Exam Fast | Eduooz Results & Strategy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "13:17",
    },
    {
      img: "https://img.youtube.com/vi/YglY46sa7oA/maxresdefault.jpg",
      url: "https://youtu.be/YglY46sa7oA?si=9NVPLSGX5_PXlb3f",
      title: "POWER PLAN for DHA | MOH | DOH/HAAD | Prometric",
      desc: "Pearson VUE | Study Strategy by Eduooz Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "14:49",
    },
    {
      img: "https://img.youtube.com/vi/w76w1arkX7E/maxresdefault.jpg",
      url: "https://youtu.be/w76w1arkX7E?si=AkVPt67Hjx39jZ2o",
      title: "NCLEX-RN Animation Class",
      desc: "Eduooz Academy | Free Power Pack for Score Boosting",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "15:08",
    },
    {
      img: "https://img.youtube.com/vi/tmP81NRePkA/maxresdefault.jpg",
      url: "https://youtu.be/tmP81NRePkA?si=6Bvjk8TS63e6Lq0X",
      title: "Pearson VUE Nursing Prometric Exam",
      desc: "Important Questions Discussion & Practice Session",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "14:46",
    },
    {
      img: "https://img.youtube.com/vi/dcKOKETcrK4/maxresdefault.jpg",
      url: "https://youtu.be/dcKOKETcrK4?si=_bCrpIn0Ei5463Lc",
      title: "Nursing Prometric Exam",
      desc: "Important Questions Discussion and Practice Session",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "15:39",
    },
    {
      img: "https://img.youtube.com/vi/XjogZEgAA2M/maxresdefault.jpg",
      url: "https://youtu.be/XjogZEgAA2M?si=CMIgkmReFJ203EEp",
      title: "Mission NORCET 11 | Eduooz Academy",
      desc: "Let's Start Today!",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "05:26",
    },
    {
      img: "https://img.youtube.com/vi/_iRggg9Y_UQ/maxresdefault.jpg",
      url: "https://youtu.be/_iRggg9Y_UQ?si=igzGt6bHNU1yPDE0",
      title: "Nursing Prometric Exam",
      desc: "Important Question Discussion & Practice Session",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "09:40",
    },
    {
      img: "https://img.youtube.com/vi/ptIFWQ_cJIQ/maxresdefault.jpg",
      url: "https://youtu.be/ptIFWQ_cJIQ?si=lUJVrBOF0iteUge-",
      title: "Nursing Saudi | Complete Career Details",
      desc: "Eduooz International Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "09:53",
    },
    {
      img: "https://img.youtube.com/vi/ftKaRv5WUmk/maxresdefault.jpg",
      url: "https://youtu.be/ftKaRv5WUmk?si=4pybFeukOVsPX4UN",
      title: "Nursing Kuwait Prometric Complete Exam Training",
      desc: "Eduooz International Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "18:24",
    },
  ];

  const pharmacistPlaylist = [
    {
      img: "https://img.youtube.com/vi/Gab0IJ_-8tQ/maxresdefault.jpg",
      url: "https://youtu.be/Gab0IJ_-8tQ?si=ly1hZz50CT5Cm1sJ",
      title: "Paracetamol Pharmacology in 5 Minutes",
      desc: "Eduooz International Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "07:00",
    },
    {
      img: "https://img.youtube.com/vi/vcEzTp2HEF4/maxresdefault.jpg",
      url: "https://youtu.be/vcEzTp2HEF4?si=H_dShvotFAtU6U2-",
      title: "Phenytoin Pharmacology in 5 Minutes",
      desc: "Eduooz International Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "07:44",
    },
    {
      img: "https://img.youtube.com/vi/ugvAoQFZCf8/maxresdefault.jpg",
      url: "https://youtu.be/ugvAoQFZCf8?si=Xve9l2gbIS4zsc2K",
      title: "Sulfonamides in Pharmacology \u2014 Explained in 5 Min",
      desc: "Eduooz International Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "17:06",
    },
    {
      img: "https://img.youtube.com/vi/f47-76tui34/maxresdefault.jpg",
      url: "https://youtu.be/f47-76tui34?si=1UUWegNs946ZP4t8",
      title: "Kerala PSC Pharmacist | Diazepam Pharmacology in 5 Min",
      desc: "Quick Revision",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "15:24",
    },
    {
      img: "https://img.youtube.com/vi/Hp1yBFQ4e2o/maxresdefault.jpg",
      url: "https://youtu.be/Hp1yBFQ4e2o?si=Mi8KCpsul_oVHqiT",
      title: "Kerala PSC Pharmacist | Insulin Pharmacology in 5 Min",
      desc: "Eduooz Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "15:00",
    },
    {
      img: "https://img.youtube.com/vi/-GIBgYF63ko/maxresdefault.jpg",
      url: "https://youtu.be/-GIBgYF63ko?si=GfJ_gzwzcpvDli6J",
      title: "Pharmacology Quick Revision | Eduooz Academy",
      desc: "Kerala PSC Pharmacist Exam Preparation",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "48:58",
    },
    {
      img: "https://img.youtube.com/vi/iElZRUtCE14/maxresdefault.jpg",
      url: "https://youtu.be/iElZRUtCE14?si=9FDSi7s8xRxsFSQr",
      title: "Pharmacist Exam Strategy | Eduooz Academy",
      desc: "Kerala PSC Pharmacist Coaching",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "71:47",
    },
    {
      img: "https://img.youtube.com/vi/dg9FUWQShk0/maxresdefault.jpg",
      url: "https://youtu.be/dg9FUWQShk0?si=iWu2KspQkvf3mtT0",
      title: "RRB Pharmacist 2025 | Online Coaching with Eduooz",
      desc: "Complete Exam Preparation",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "11:19",
    },
    {
      img: "https://img.youtube.com/vi/lYvPIHaV4O0/maxresdefault.jpg",
      url: "https://youtu.be/lYvPIHaV4O0?si=pTA9wdsYlzegwduT",
      title: "Kerala PSC Pharmacist | Markovnikov\u2019s Rule in 5 Min",
      desc: "Eduooz Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "12:10",
    },
    {
      img: "https://img.youtube.com/vi/ChlT_2r96R4/maxresdefault.jpg",
      url: "https://youtu.be/ChlT_2r96R4?si=KWiv-uVkglAWMq6S",
      title: "Metformin Pharmacology: A 5-Minute Simplified Explanation",
      desc: "Eduooz International Academy",
      stats: "Eduooz Academy - Pharmacist PSC Coaching",
      duration: "11:55",
    },
  ];

  const labTechPlaylist = [
    {
      img: "https://img.youtube.com/vi/ZqHuz3kBS-4/maxresdefault.jpg",
      url: "https://youtu.be/ZqHuz3kBS-4?si=8KR8BPVrxqIx5LVT",
      title: "Lab Technician DHS Long-Term Course",
      desc: "Simple Learning with Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "16:01",
    },
    {
      img: "https://img.youtube.com/vi/l7QKm6WsqBA/maxresdefault.jpg",
      url: "https://youtu.be/l7QKm6WsqBA?si=jmsu-g3UkIC-IqZQ",
      title: "Lab Technician DHS Long Term Course",
      desc: "Simple & Easy Learning \u2013 Eduooz International Academy",
      stats: "Eduooz MLT Academy",
      duration: "10:40",
    },
    {
      img: "https://img.youtube.com/vi/Er5l3ptq6RM/maxresdefault.jpg",
      url: "https://youtu.be/Er5l3ptq6RM?si=DiKVQ33nqlKuXhex",
      title: "Kerala PSC Lab Technician: Scientist Nicknames",
      desc: "Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "04:26",
    },
    {
      img: "https://img.youtube.com/vi/8X8A_tso5Dk/maxresdefault.jpg",
      url: "https://youtu.be/8X8A_tso5Dk?si=7aX5tb0U5DeAga-2",
      title: "Lab Technician DHS Long Term \u2013 Calendar of Health",
      desc: "Eduooz International Academy",
      stats: "Eduooz MLT Academy",
      duration: "07:21",
    },
    {
      img: "https://img.youtube.com/vi/ElQf1fTFPCw/maxresdefault.jpg",
      url: "https://youtu.be/ElQf1fTFPCw?si=TnNxZ7tqCTR7nsXE",
      title: "Mosquito Vector Chart Explained | PSC MLT Exams",
      desc: "Lab Technician Long Term | Eduooz",
      stats: "Eduooz MLT Academy",
      duration: "06:41",
    },
    {
      img: "https://img.youtube.com/vi/DXZWVrGW3DI/maxresdefault.jpg",
      url: "https://youtu.be/DXZWVrGW3DI?si=mpHvYaC3dNYBUhRv",
      title: "Lab Technician DHS Long Term Program",
      desc: "Smart & Easy Learning \u2013 Eduooz International Academy",
      stats: "Eduooz MLT Academy",
      duration: "03:44",
    },
    {
      img: "https://img.youtube.com/vi/N_aayNO3RmM/maxresdefault.jpg",
      url: "https://youtu.be/N_aayNO3RmM?si=BT8VPPUEBMK0vQzA",
      title: "Kerala PSC Junior Lab Assistant",
      desc: "Easy Preparation Strategy | Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "03:00",
    },
    {
      img: "https://img.youtube.com/vi/Oe5m4qBXJYQ/maxresdefault.jpg",
      url: "https://youtu.be/Oe5m4qBXJYQ?si=IOlZCURaYBrgGv5W",
      title: "Kerala PSC Junior Lab Assistant | Level & Exam Details",
      desc: "Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "06:39",
    },
    {
      img: "https://img.youtube.com/vi/N_aayNO3RmM/maxresdefault.jpg",
      url: "https://youtu.be/N_aayNO3RmM?si=pgjy3DlrD2sH0Klx",
      title: "Kerala PSC Junior Lab Assistant",
      desc: "Easy Preparation Strategy | Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "03:00",
    },
    {
      img: "https://img.youtube.com/vi/z0h8iw7-pfc/maxresdefault.jpg",
      url: "https://youtu.be/z0h8iw7-pfc?si=fB0eZoo2A-vVvc9L",
      title: "Lab Technician (DHS Long Term) | Complete Learning Program",
      desc: "Eduooz Academy",
      stats: "Eduooz MLT Academy",
      duration: "02:22",
    },
  ];

  const germanPlaylist = [
    {
      img: "https://img.youtube.com/vi/yHO54z55JkA/maxresdefault.jpg",
      url: "https://youtu.be/yHO54z55JkA?si=KRMANjBEh_WBdrRO",
      title: "German Alphabets A\u2013D | Learn German for Beginners",
      desc: "Malayalam / English Explanation | Eduooz Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "10:38",
    },
    {
      img: "https://img.youtube.com/vi/s3SfINGk5Bw/maxresdefault.jpg",
      url: "https://youtu.be/s3SfINGk5Bw?si=b89VxYNgY9UhZtS8",
      title: "German Alphabets E\u2013H | Learn German for Beginners",
      desc: "Malayalam / English Explanation | Eduooz Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "07:14",
    },
    {
      img: "https://img.youtube.com/vi/0b8vw2bJ6g8/maxresdefault.jpg",
      url: "https://youtu.be/0b8vw2bJ6g8?si=ZLmGg8tTIg26ItCw",
      title: "Learn German Alphabets I\u2013O",
      desc: "Easy Explanation in Malayalam & English | Eduooz Academy",
      stats: "Eduooz - Nurses Learning Hub",
      duration: "11:25",
    },
  ];

  // "All" tab shows a curated mix from every category (interleaved dynamically)
  const allPlaylist = [];
  const maxLen = Math.max(
    nursingPlaylist.length,
    pharmacistPlaylist.length,
    labTechPlaylist.length,
    germanPlaylist.length,
  );
  for (let i = 0; i < maxLen; i++) {
    if (nursingPlaylist[i]) allPlaylist.push(nursingPlaylist[i]);
    if (pharmacistPlaylist[i]) allPlaylist.push(pharmacistPlaylist[i]);
    if (labTechPlaylist[i]) allPlaylist.push(labTechPlaylist[i]);
    if (germanPlaylist[i]) allPlaylist.push(germanPlaylist[i]);
  }

  const ytCategoryData = {
    All: allPlaylist,
    Nursing: nursingPlaylist,
    Pharmacist: pharmacistPlaylist,
    "Lab Technician": labTechPlaylist,
    "German Language": germanPlaylist,
  };

  // --- Dynamic Playlist Card Renderer ---
  function renderPlaylistCards(playlist) {
    if (!playlistTrack) return;

    // Clear existing cards
    playlistTrack.innerHTML = "";

    // Generate card elements from data
    playlist.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "playlist-card";
      card.setAttribute("data-img", item.img);
      card.setAttribute("data-url", item.url);
      card.setAttribute("data-title", item.title);
      card.setAttribute("data-desc", item.desc);
      card.setAttribute("data-stats", item.stats);

      card.innerHTML = `
                <div class="playlist-duration">${item.duration}</div>
                <img src="${item.img}" alt="${item.title}">
                <div class="play-icon-sm"><i class="fa-solid fa-play"></i></div>
            `;

      playlistTrack.appendChild(card);
    });

    // Mark the 3rd card (index 2) as active
    if (playlistTrack.children.length > 2) {
      playlistTrack.children[2].classList.add("active");
    }

    // Attach click handlers to new cards
    Array.from(playlistTrack.children).forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.isTrusted && lastDragDist > 10) {
          e.preventDefault();
          return;
        }
        if (isAnimating) return;

        const index = Array.from(playlistTrack.children).indexOf(card);
        if (index === 2 && card.classList.contains("active")) return;

        syncMainPortal(card);

        const currentCardWidth =
          playlistTrack.children[0].offsetWidth +
          (parseInt(window.getComputedStyle(playlistTrack).gap) || 0);
        const offset = getCenterOffset();

        const dist = index - 2;
        if (dist !== 0) {
          isAnimating = true;
          if (dist > 0) {
            gsap.to(playlistTrack, {
              x: offset - currentCardWidth * dist,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                for (let i = 0; i < dist; i++)
                  playlistTrack.appendChild(playlistTrack.firstElementChild);
                gsap.set(playlistTrack, { x: offset });
                isAnimating = false;
              },
            });
          } else {
            const absDist = Math.abs(dist);
            for (let i = 0; i < absDist; i++)
              playlistTrack.prepend(playlistTrack.lastElementChild);
            gsap.set(playlistTrack, { x: offset - currentCardWidth * absDist });
            gsap.to(playlistTrack, {
              x: offset,
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => (isAnimating = false),
            });
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

  // Expose for youtube-filter.js (nursing page-specific video filtering)
  window._eduoozData = { nursing: nursingPlaylist, category: ytCategoryData };
  window._renderPlaylistCards = renderPlaylistCards;

  // YouTube Category Tabs Logic
  const ytTabs = document.querySelectorAll(".yt-tab");
  if (ytTabs.length > 0) {
    ytTabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        if (tab.classList.contains("active")) return;

        ytTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const category = tab.innerText.trim();
        const playlistData = ytCategoryData[category];

        if (playlistData && playlistTrack) {
          gsap.to(playlistTrack, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => {
              renderPlaylistCards(playlistData);
              gsap.to(playlistTrack, { opacity: 1, duration: 0.3 });
            },
          });
        }
      });
    });
  }

  // --- 8. Seamless Infinite Grab & Swipe Logic ---
  let isDragging = false;
  let startX = 0;

  // Dynamic width calculation helper
  const getCardWidth = () => {
    if (!playlistTrack || !playlistTrack.children[0]) return 280;
    const gap = parseInt(window.getComputedStyle(playlistTrack).gap) || 0;
    return playlistTrack.children[0].offsetWidth + gap;
  };
  let cachedCenterOffset = 0;
  const pointerDown = (e) => {
    if (isAnimating || !playlistTrack) return;
    isDragging = true;
    lastDragDist = 0;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    playlistTrack.style.cursor = "grabbing";
    if (autoSlideInterval) clearInterval(autoSlideInterval);

    cachedCenterOffset = getCenterOffset();
  };

  const pointerMove = (e) => {
    if (!isDragging || isAnimating) return;
    const x = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    let walk = x - startX;

    // True infinite loop DOM manipulation during active Drag
    const currentWidth = getCardWidth();
    if (walk <= -currentWidth) {
      playlistTrack.appendChild(playlistTrack.firstElementChild);
      startX -= currentWidth;
      walk += currentWidth;
      syncMainPortal(playlistTrack.children[2]);
    } else if (walk >= currentWidth) {
      playlistTrack.prepend(playlistTrack.lastElementChild);
      startX += currentWidth;
      walk -= currentWidth;
      syncMainPortal(playlistTrack.children[2]);
    }

    lastDragDist += Math.abs(walk); // Ensure clicks disable gracefully
    gsap.set(playlistTrack, { x: cachedCenterOffset + walk });
  };

  const pointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    playlistTrack.style.cursor = "grab";

    const endX = e.type.includes("mouse")
      ? e.pageX
      : e.changedTouches
        ? e.changedTouches[0].clientX
        : startX;
    const walk = endX - startX;
    const currentWidth = getCardWidth();
    const offset = getCenterOffset();

    if (walk < -50 && !isAnimating) {
      isAnimating = true;
      gsap.to(playlistTrack, {
        x: offset - currentWidth,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          playlistTrack.appendChild(playlistTrack.firstElementChild);
          gsap.set(playlistTrack, { x: offset });
          syncMainPortal(playlistTrack.children[2]);
          isAnimating = false;
        },
      });
    } else if (walk > 50 && !isAnimating) {
      isAnimating = true;
      gsap.to(playlistTrack, {
        x: offset + currentWidth,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          playlistTrack.prepend(playlistTrack.lastElementChild);
          gsap.set(playlistTrack, { x: offset });
          syncMainPortal(playlistTrack.children[2]);
          isAnimating = false;
        },
      });
    } else {
      // Snap back to precise center if lazy swipe
      gsap.to(playlistTrack, { x: offset, duration: 0.3, ease: "power2.out" });
    }
    startAutoSlide();
  };

  if (playlistTrack) {
    playlistTrack.style.cursor = "grab";
    playlistTrack.addEventListener("mousedown", pointerDown);
    playlistTrack.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);

    playlistTrack.addEventListener("touchstart", pointerDown, {
      passive: true,
    });
    playlistTrack.addEventListener("touchmove", pointerMove, { passive: true });
    window.addEventListener("touchend", pointerUp);
  }

  // Removed ecosystem hover pause functionality at user request

  startAutoSlide();

  // --- 11. GSAP Testimonials Reveal ---
  gsap.set(".g-test-reveal", { autoAlpha: 1 });
  gsap.from(".g-test-reveal", {
    scrollTrigger: {
      trigger: ".testimonials-premium-section",
      start: "top 80%",
    },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // --- 12. Testimonial Marquee: JS-Driven Infinite Scroll + Drag ---
  document
    .querySelectorAll(".test-marquee-container")
    .forEach((container, idx) => {
      const track = container.querySelector(".test-marquee-track");
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
      window.addEventListener("resize", measure);

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
        const px = e.clientX ?? e.touches?.[0]?.clientX;
        if (px == null) return;
        targetX = dragAnchorX + (px - startPointerX);
      }
      // Pointer Up
      function onUp() {
        isDragging = false;
      }

      container.addEventListener("mousedown", onDown);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      container.addEventListener("touchstart", onDown, { passive: true });
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onUp);

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
  document.querySelectorAll(".fac-hidden-details").forEach((details) => {
    if (details.querySelector(".fac-hidden-inner")) return;
    const inner = document.createElement("div");
    inner.className = "fac-hidden-inner";
    while (details.firstChild) {
      inner.appendChild(details.firstChild);
    }
    details.appendChild(inner);
  });

  // Mobile Interaction for Morph Cards
  const morphCards = document.querySelectorAll(".fac-morph-card");
  if (window.innerWidth <= 1024 && morphCards.length > 0) {
    morphCards.forEach((card) => {
      card.addEventListener("click", function () {
        const isOpen = this.classList.contains("is-open");
        morphCards.forEach((c) => c.classList.remove("is-open"));
        if (!isOpen) this.classList.add("is-open");
      });
    });
  }

  // --- 16. PLACEMENTS: CINEMATIC INFINITE DRAG FILMSTRIP ---
  const facTrack = document.getElementById("faculty-track");
  const facWrapper = document.querySelector(".filmstrip-track-wrapper");

  if (facTrack && facWrapper) {
    const cards = Array.from(facTrack.children);

    // 1. Clone cards to create the seamless loop illusion
    cards.forEach((card) => {
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
    window.addEventListener("resize", updateMeasurements);

    facWrapper.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      dragStartX = targetX;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      targetX = dragStartX + dx * 1.5;
    });

    window.addEventListener("mouseup", () => (isDragging = false));
    window.addEventListener("mouseleave", () => (isDragging = false));

    // Touch for Mobile
    facWrapper.addEventListener("touchstart", (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
      dragStartX = targetX;
      autoScrollSpeed = 0;
    });

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        targetX = dragStartX + dx * 1.5;
      },
      { passive: true },
    );

    window.addEventListener("touchend", () => {
      isDragging = false;
      autoScrollSpeed = 1;
    });

    facWrapper.addEventListener("mouseenter", () => (autoScrollSpeed = 0));
    facWrapper.addEventListener("mouseleave", () => (autoScrollSpeed = 1));

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
        allCards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          if (
            cardCenter > screenCenter - rect.width * 0.55 &&
            cardCenter < screenCenter + rect.width * 0.55
          ) {
            card.classList.add("mobile-active");
          } else {
            card.classList.remove("mobile-active");
          }
        });
      } else {
        allCards.forEach((card) => card.classList.remove("mobile-active"));
      }

      requestAnimationFrame(animateFaculty);
    }
    animateFaculty();
  }

  // --- 17. FINAL REVEAL ANIMATIONS (Faculty & Placements) ---
  gsap.set(".g-fac-reveal, .g-place-reveal", { autoAlpha: 1 });

  gsap.from(".g-fac-reveal", {
    scrollTrigger: { trigger: ".faculty-morph-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  gsap.from(".g-place-reveal", {
    scrollTrigger: { trigger: ".faculty-filmstrip-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });

  // --- 11. GSAP Application Terminal Logic ---

  // 1. Reveal Animation
  gsap.set(".g-cta-reveal", { autoAlpha: 1 });
  gsap.from(".g-cta-reveal", {
    scrollTrigger: { trigger: ".cta-terminal-section", start: "top 80%" },
    y: 40,
    opacity: 0,
    filter: "blur(10px)",
    duration: 1.2,
    stagger: 0.15,
    ease: "power3.out",
  });
});

// Tab Filtering Logic with GSAP
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const filter = btn.getAttribute("data-filter");
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const boxes = document.querySelectorAll(".course-box");

    // Hide all first
    gsap.to(boxes, {
      opacity: 0,
      scale: 0.9,
      y: 20,
      duration: 0.2,
      onComplete: () => {
        boxes.forEach((box) => {
          if (
            filter === "all" ||
            box.getAttribute("data-category") === filter
          ) {
            box.style.display = "flex";
            // Show filtered
            gsap.to(box, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.4,
              ease: "back.out(1.5)",
              stagger: 0.05,
            });
          } else {
            box.style.display = "none";
          }
        });
      },
    });
  });
});

// FAQ Accordion
document.querySelectorAll(".faq-q").forEach((q) => {
  q.addEventListener("click", () => {
    const answer = q.nextElementSibling;
    const icon = q.querySelector("i");
    const isOpen =
      answer.style.maxHeight !== "0px" && answer.style.maxHeight !== "";

    // Close all others
    document
      .querySelectorAll(".faq-a")
      .forEach((a) => (a.style.maxHeight = "0px"));
    document
      .querySelectorAll(".faq-q i")
      .forEach((i) => (i.style.transform = "rotate(0deg)"));

    if (!isOpen) {
      answer.style.maxHeight = answer.scrollHeight + "px";
      icon.style.transform = "rotate(45deg)";
    }
  });
});

// --- Video Testimonials Logic ---
(function () {
  const playlistItems = document.querySelectorAll(".testi-playlist-item");
  const featuredImg = document.getElementById("testiFeaturedImg");
  const avatarImg = document.getElementById("testiAvatarImg");
  const nameEl = document.getElementById("testiName");
  const subEl = document.getElementById("testiSub");
  const badgeEl = document.getElementById("testiBadge");
  const quoteEl = document.getElementById("testiQuote");

  if (!playlistItems.length) return;

  let currentIndex = 0;
  let autoPlayInterval;

  function updateFeatured(index) {
    // Remove active class from all
    playlistItems.forEach((item) => item.classList.remove("active"));

    // Add active class to current
    const currentItem = playlistItems[index];
    currentItem.classList.add("active");

    // Animate transition using GSAP
    gsap.to(".testi-featured", {
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        // Update content
        featuredImg.src = currentItem.dataset.img;
        avatarImg.src = currentItem.dataset.avatar;
        nameEl.textContent = currentItem.dataset.name;
        subEl.textContent = currentItem.dataset.sub;
        badgeEl.innerHTML =
          '<i class="fa-solid fa-check"></i> ' + currentItem.dataset.badge;
        quoteEl.innerHTML =
          '<i class="fa-solid fa-quote-left testi-quote-icon"></i> <p>' +
          currentItem.dataset.quote +
          "</p>";

        // Fade back in
        gsap.to(".testi-featured", { opacity: 1, duration: 0.3 });
      },
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
    item.addEventListener("click", () => {
      currentIndex = index;
      updateFeatured(currentIndex);
      stopAutoPlay();
      // Resume after 5 seconds of inactivity
      setTimeout(startAutoPlay, 5000);
    });
  });

  // Pause autoplay on hover over featured section or playlist
  const featuredSection = document.getElementById("testiFeatured");
  const playlistSection = document.getElementById("testiPlaylist");

  if (featuredSection && playlistSection) {
    featuredSection.addEventListener("mouseenter", stopAutoPlay);
    featuredSection.addEventListener("mouseleave", startAutoPlay);
    playlistSection.addEventListener("mouseenter", stopAutoPlay);
    playlistSection.addEventListener("mouseleave", startAutoPlay);
  }

  // Start Autoplay
  startAutoPlay();
})();

// --- YouTube Carousel ---
(function () {
  const track = document.getElementById("ytTrack");
  const viewport = document.getElementById("ytViewport");
  const prevBtn = document.getElementById("ytPrev");
  const nextBtn = document.getElementById("ytNext");
  const dotsEl = document.getElementById("ytDots");
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".yt-card"));
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
    dotsEl.innerHTML = "";
    const total = getTotal();
    for (let i = 0; i < total; i++) {
      const d = document.createElement("button");
      d.className = "yt-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(d);
    }
  }

  function updateDots() {
    const dotBtns = dotsEl.querySelectorAll(".yt-dot");
    dotBtns.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
  }

  function goTo(index) {
    const slidesVisible = getSlidesVisible();
    const total = getTotal();
    currentIndex = Math.max(0, Math.min(index, total - 1));

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 24;
    const slideOffset = currentIndex * slidesVisible * (cardWidth + gap);
    track.style.transform = `translateX(-${slideOffset}px)`;

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= total - 1;
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

  buildDots();
  goTo(0);
  window.addEventListener("resize", () => {
    buildDots();
    goTo(0);
  });
})();

// Animations
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);
  if (window.lenis) return;
  const lenis = new Lenis();
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  gsap.utils.toArray(".g-reveal").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%" },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  });

  // Placement stat cards entrance
  gsap.utils.toArray(".placement-stat-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: { trigger: card, start: "top 88%" },
      y: 40,
      opacity: 0,
      duration: 0.7,
      delay: i * 0.1,
      ease: "power2.out",
    });
  });

  const tl = gsap.timeline();
  tl.from(".glass-pill", { opacity: 0, y: 20, duration: 0.6 })
    .from(".hero-title-main", { opacity: 0, y: 30, duration: 0.8 }, "-=0.3")
    .from(".hero-desc", { opacity: 0, y: 20, duration: 0.8 }, "-=0.5")
    .from(".cta-cluster", { opacity: 0, y: 20, duration: 0.8 }, "-=0.5");
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
  if (!CONFIG) {
    console.warn("EXAM_CONFIG not found.");
    return;
  }

  // --- 1. RENDER EXAM SNAPSHOT ---
  function renderSnapshot() {
    const grid = document.getElementById("snapshot-grid");
    if (!grid || !CONFIG.snapshot) return;

    const items = CONFIG.snapshot;
    grid.innerHTML = items
      .map(
        (item) => `
            <div class="snapshot-card g-exam-reveal">
                <div class="snap-icon"><i class="${item.icon}"></i></div>
                <div class="snap-label">${item.label}</div>
                <div class="snap-value">${item.link ? `<a href="${item.link}" target="_blank">${item.value}</a>` : item.value}</div>
            </div>
        `,
      )
      .join("");
  }

  // --- 2. RENDER ABOUT SECTION (Video Carousel + Stat Counters) ---
  function renderAbout() {
    var track = document.getElementById("aev-track");
    var dotsWrap = document.getElementById("aev-dots");
    var prevBtn = document.getElementById("aev-prev");
    var nextBtn = document.getElementById("aev-next");
    var trackWrap = document.getElementById("aev-track-wrap");
    var statsEl = document.getElementById("aev-stats");

    if (!track) return;

    var videos = [
      {
        id: "d5xoc5zvWyQ",
        title: "NORCET 11 — All You Need to Know",
        tag: "Latest",
      },
      {
        id: "qEBQcfAy5e4",
        title: "NORCET 10 — Nursing Officer Exam Details",
        tag: "Popular",
      },
      {
        id: "h9NjqU6IyzE",
        title: "Best NORCET Preparation Strategy",
        tag: "Strategy",
      },
      {
        id: "u6EAh2w3bPo",
        title: "NORCET 9 — Must-Know Exam Questions",
        tag: "MCQs",
      },
    ];

    var current = 0;
    var isHovered = false;
    var autoTimer = null;
    var touchStartX = 0;

    /* ── Build cards ── */
    function buildCards() {
      track.innerHTML = videos
        .map(function (v, i) {
          return (
            '<a class="aev-card' +
            (i === 0 ? " aev-active" : "") +
            '"' +
            ' href="https://www.youtube.com/watch?v=' +
            v.id +
            '"' +
            ' target="_blank" rel="noopener" data-idx="' +
            i +
            '">' +
            '<img class="aev-thumb" loading="lazy"' +
            '  src="https://img.youtube.com/vi/' +
            v.id +
            '/maxresdefault.jpg"' +
            "  onerror=\"this.onerror=null;this.src='https://img.youtube.com/vi/" +
            v.id +
            "/hqdefault.jpg'\"" +
            '  alt="' +
            v.title +
            '">' +
            '<div class="aev-overlay"></div>' +
            '<div class="aev-play"><i class="fa-solid fa-play" style="margin-left:3px"></i></div>' +
            '<span class="aev-tag">' +
            v.tag +
            "</span>" +
            '<div class="aev-caption"><p class="aev-card-title">' +
            v.title +
            "</p></div>" +
            "</a>"
          );
        })
        .join("");

      buildDots();
      updateCarousel(false);
    }

    /* ── Dots ── */
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = videos
        .map(function (_, i) {
          return (
            '<button class="aev-dot' +
            (i === 0 ? " aev-dot-active" : "") +
            '" aria-label="Video ' +
            (i + 1) +
            '"></button>'
          );
        })
        .join("");
      dotsWrap.querySelectorAll(".aev-dot").forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          goTo(i);
        });
      });
    }

    /* ── Position track to center active card ── */
    function updateCarousel(animate) {
      var cards = track.querySelectorAll(".aev-card");
      if (!cards.length || !trackWrap) return;

      var containerW = trackWrap.offsetWidth;
      var cardW = cards[0].offsetWidth;
      var gap = 16;
      var peekOffset = (containerW - cardW) / 2;
      var offset = peekOffset - current * (cardW + gap);

      track.style.transition = animate
        ? "transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)"
        : "none";
      track.style.transform = "translateX(" + offset + "px)";

      cards.forEach(function (c, i) {
        c.classList.toggle("aev-active", i === current);
      });

      if (dotsWrap) {
        dotsWrap.querySelectorAll(".aev-dot").forEach(function (d, i) {
          d.classList.toggle("aev-dot-active", i === current);
        });
      }
    }

    function goTo(idx) {
      current = ((idx % videos.length) + videos.length) % videos.length;
      updateCarousel(true);
    }

    function next() {
      goTo(current + 1);
    }
    function prev() {
      goTo(current - 1);
    }

    /* ── Auto-slide ── */
    function startAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(function () {
        if (!isHovered) next();
      }, 4000);
    }

    /* ── Nav buttons ── */
    if (nextBtn)
      nextBtn.addEventListener("click", function () {
        next();
        startAuto();
      });
    if (prevBtn)
      prevBtn.addEventListener("click", function () {
        prev();
        startAuto();
      });

    /* ── Hover pause ── */
    var carousel = document.getElementById("aev-carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", function () {
        isHovered = true;
      });
      carousel.addEventListener("mouseleave", function () {
        isHovered = false;
      });
    }

    /* ── Touch swipe ── */
    if (trackWrap) {
      trackWrap.addEventListener(
        "touchstart",
        function (e) {
          touchStartX = e.touches[0].clientX;
        },
        { passive: true },
      );
      trackWrap.addEventListener(
        "touchend",
        function (e) {
          var dx = e.changedTouches[0].clientX - touchStartX;
          if (Math.abs(dx) > 40) {
            if (dx < 0) next();
            else prev();
            startAuto();
          }
        },
        { passive: true },
      );
    }

    /* ── Recalculate on resize ── */
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        updateCarousel(false);
      }, 150);
    });

    /* ── Animated stat counters (Intersection Observer) ── */
    if (statsEl) {
      var countersRun = false;
      var statsObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !countersRun) {
              countersRun = true;
              statsEl.querySelectorAll(".aev-stat-num").forEach(function (el) {
                var target = parseInt(el.dataset.target, 10);
                var suffix = el.dataset.suffix || "";
                var prefix = el.dataset.prefix || "";
                var duration = 1600;
                var startTs = null;
                (function tick(ts) {
                  if (!startTs) startTs = ts;
                  var p = Math.min((ts - startTs) / duration, 1);
                  var ease = 1 - Math.pow(1 - p, 3);
                  el.textContent = prefix + Math.round(ease * target) + suffix;
                  if (p < 1) requestAnimationFrame(tick);
                })(performance.now());
              });
              statsObserver.disconnect();
            }
          });
        },
        { threshold: 0.5 },
      );
      statsObserver.observe(statsEl);
    }

    /* ── Init ── */
    buildCards();
    startAuto();
  }

  // --- 3. RENDER ELIGIBILITY CARDS (from window.courseEligibility.qualification) ---
  function renderEligibilityCards() {
    const track = document.getElementById("elig-col-track");
    const cfg = window.courseEligibility;
    if (!track || !cfg || !cfg.qualification || !cfg.qualification.length) return;

    track.innerHTML = cfg.qualification
      .map(
        (item) => `
            <div class="elig-card">
                <div class="elig-card-header">
                    <div class="elig-icon"><i class="${item.icon}"></i></div>
                    <h4>${item.title}</h4>
                </div>
                <p>${item.description}</p>
            </div>
        `,
      )
      .join("");
  }

  // --- 4. RENDER AGE RULES (from window.courseEligibility.ageRules) ---
  function renderAgeRules() {
    const track = document.getElementById("age-col-track");
    const cfg = window.courseEligibility;
    if (!track || !cfg || !cfg.ageRules || !cfg.ageRules.length) return;

    track.innerHTML = cfg.ageRules
      .map(
        (rule) => `
            <div class="age-explorer-card">
                <div class="age-explorer-front">
                    <div class="age-explorer-icon"><i class="${rule.icon || "fa-solid fa-user"}"></i></div>
                    <div class="age-explorer-info">
                        <h4>${rule.category}</h4>
                        <span class="age-badge">${rule.maxAge || rule.badge || "—"}</span>
                    </div>
                    <div class="age-explorer-toggle"><i class="fa-solid fa-chevron-down"></i></div>
                </div>
                <div class="age-explorer-detail"><p>${rule.description || rule.detail || ""}</p></div>
            </div>
        `,
      )
      .join("");
  }

  // --- 5. ELIGIBILITY CHECKER — dynamic form builder + validation engine ---
  // --- 5. ELIGIBILITY CHECKER — field-driven form builder + validation engine ---

  function initEligibilityChecker() {
    const form = document.getElementById("elig-checker-form");
    const resultEl = document.getElementById("elig-result");
    if (!form || !resultEl) return;

    const rawCfg = window.eligibilityCheckerConfig;
    if (!rawCfg) return;

    const cfg = normalizeCheckerConfig(rawCfg);

    buildCheckerForm(form, cfg);
    initConditionalFields(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runEligibilityCheck(form, resultEl, cfg);
    });
  }

  // Converts old-format config (acceptedQualifications as objects, acceptedCategories,
  // additionalFields) to the canonical field-driven format. Pages using fields[] pass through.
  function normalizeCheckerConfig(cfg) {
    if (cfg.fields && cfg.fields.length) return cfg;

    const fields = [];
    fields.push({ type: "text", id: "name", label: "Full Name", required: true });

    if (cfg.acceptedQualifications && cfg.acceptedQualifications.length) {
      const opts = cfg.acceptedQualifications.map((q) =>
        typeof q === "string" ? { value: q, label: q } : q,
      );
      if (cfg.showOtherQualification !== false) {
        opts.push({ value: "other", label: "Other / Not Listed" });
      }
      fields.push({ type: "select", id: "qualification", label: "Qualification", required: true, options: opts });
    }

    const needsReg = cfg.registrationRequired || cfg.showRegistration;
    if (needsReg) {
      fields.push({
        type: "select",
        id: "registration",
        label: cfg.registrationLabel || "Nursing Council Registration",
        required: true,
        options: [
          { value: "yes", label: "Yes – Active Registration" },
          { value: "no", label: "No" },
        ],
      });
    }

    if (cfg.acceptedCategories && cfg.acceptedCategories.length) {
      fields.push({
        type: "select",
        id: "category",
        label: "Caste / Category",
        required: true,
        options: cfg.acceptedCategories.map((c) => ({ value: c.value, label: c.label })),
      });
    }

    fields.push({ type: "date", id: "dob", label: "Date of Birth", required: true });

    (cfg.additionalFields || []).forEach((f) => {
      fields.push({ ...f, id: f.name || f.id });
    });

    // Derive baseMaxAge and ageRelaxation from absolute per-category maxAge values
    const baseMaxAge =
      cfg.baseMaxAge ||
      cfg.maxAge ||
      (cfg.acceptedCategories
        ? ((cfg.acceptedCategories.find((c) => c.value === "general") || {}).maxAge || null)
        : null);

    const ageRelaxation = {};
    if (cfg.ageRelaxation) {
      Object.assign(ageRelaxation, cfg.ageRelaxation);
    } else if (cfg.acceptedCategories) {
      cfg.acceptedCategories.forEach((c) => {
        ageRelaxation[c.value] =
          c.maxAge != null && baseMaxAge != null ? c.maxAge - baseMaxAge : 0;
      });
    }

    return {
      fields,
      minAge: cfg.minAge || 18,
      baseMaxAge,
      ageRelaxation,
      acceptedQualifications: (cfg.acceptedQualifications || []).map((q) =>
        typeof q === "string" ? q : q.value,
      ),
      registrationFieldId: needsReg ? "registration" : false,
    };
  }

  function buildCheckerForm(form, cfg) {
    const fields = cfg.fields || [];
    let html = "";
    let i = 0;

    while (i < fields.length) {
      const f = fields[i];
      const next = fields[i + 1];

      if (f.span === "full" || !next) {
        html += `<div class="form-row">${buildFieldHTML(f)}</div>`;
        i++;
      } else {
        html += `<div class="form-row">${buildFieldHTML(f)}${buildFieldHTML(next)}</div>`;
        i += 2;
      }
    }

    html += `<button type="submit" class="btn-check-elig">
      <i class="fa-solid fa-magnifying-glass"></i> Check Eligibility
    </button>`;

    form.innerHTML = html;
  }

  function buildFieldHTML(field) {
    const showWhenAttrs = field.showWhen
      ? ` data-show-when-field="${field.showWhen.field}" data-show-when-value="${field.showWhen.value}"`
      : "";
    const hiddenClass = field.showWhen ? " ec-hidden" : "";
    const fid = `ec-${field.id}`;
    let inputHTML = "";

    if (field.type === "select") {
      const opts = (field.options || [])
        .map((o) => `<option value="${o.value}">${o.label}</option>`)
        .join("");
      inputHTML = `<select id="${fid}" name="${field.id}"><option value="">Select…</option>${opts}</select>`;
    } else if (field.type === "date") {
      inputHTML = `<input type="date" id="${fid}" name="${field.id}" />`;
    } else if (field.type === "number") {
      inputHTML = `<input type="number" id="${fid}" name="${field.id}"
        placeholder="${field.placeholder || ""}"
        min="${field.min != null ? field.min : ""}"
        max="${field.max != null ? field.max : ""}" />`;
    } else {
      inputHTML = `<input type="text" id="${fid}" name="${field.id}"
        placeholder="${field.placeholder || "Enter " + field.label.toLowerCase()}" />`;
    }

    return `<div class="form-group${hiddenClass}"${showWhenAttrs}>
      <label for="${fid}">${field.label}</label>
      ${inputHTML}
    </div>`;
  }

  // Wire up showWhen conditional visibility — run once after form is built
  function initConditionalFields(form) {
    form.querySelectorAll("[data-show-when-field]").forEach((group) => {
      const controlEl = form.querySelector(`[name="${group.dataset.showWhenField}"]`);
      if (!controlEl) return;

      function update() {
        const visible = controlEl.value === group.dataset.showWhenValue;
        group.classList.toggle("ec-hidden", !visible);
        if (!visible) {
          const input = group.querySelector("input, select");
          if (input) input.value = "";
        }
      }

      controlEl.addEventListener("change", update);
      update();
    });
  }

  function runEligibilityCheck(form, resultEl, cfg) {
    // Collect values from visible fields only
    const data = {};
    form.querySelectorAll(".form-group:not(.ec-hidden) [name]").forEach((el) => {
      data[el.name] = el.value.trim();
    });

    // Required field check (visible fields only)
    const missing = (cfg.fields || [])
      .filter((f) => {
        if (!f.required) return false;
        if (f.showWhen && data[f.showWhen.field] !== f.showWhen.value) return false;
        return !data[f.id];
      })
      .map((f) => f.label);

    if (missing.length) {
      showResult(resultEl, "warning",
        buildResultHTML("warning", "Incomplete Form",
          `Please fill in: <strong>${missing.join(", ")}</strong>`, null));
      return;
    }

    // Age calculation
    let age = null;
    if (data.dob) {
      const birth = new Date(data.dob);
      const now = new Date();
      age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    }

    // Age limit via relaxation engine: effectiveMax = baseMaxAge + relaxation[category]
    const category = data.category || "general";
    const relaxation = cfg.ageRelaxation ? (cfg.ageRelaxation[category] ?? 0) : 0;
    const effectiveMaxAge = cfg.baseMaxAge != null ? cfg.baseMaxAge + relaxation : null;
    const minAge = cfg.minAge || 18;

    // Resolve display labels from field definitions
    const fields = cfg.fields || [];
    const qualField = fields.find((f) => f.id === "qualification");
    const catField = fields.find((f) => f.id === "category");
    const qualLabel =
      (qualField && (qualField.options || []).find((o) => o.value === data.qualification) || {}).label ||
      data.qualification || "—";
    const catLabel =
      (catField && (catField.options || []).find((o) => o.value === category) || {}).label ||
      category;

    const regFieldId = cfg.registrationFieldId || false;
    const regField = regFieldId ? fields.find((f) => f.id === regFieldId) : null;
    const summary = {
      qualification: qualLabel,
      age: age != null ? `${age} yrs` : "—",
      ageLimit: effectiveMaxAge != null
        ? `${minAge}–${effectiveMaxAge} yrs${relaxation ? ` (base ${cfg.baseMaxAge} + ${relaxation} relaxation)` : ""}`
        : "—",
      registrationLabel: regField ? regField.label : "Registration",
      registration:
        data[regFieldId] === "yes" ? "Active"
        : data[regFieldId] === "no" ? "Not registered"
        : "—",
    };

    // --- Validation chain ---
    let status = null;
    let reason = null;

    // 1. Qualification
    if (cfg.acceptedQualifications && cfg.acceptedQualifications.length &&
        !cfg.acceptedQualifications.includes(data.qualification)) {
      status = "notEligible";
      reason = `Your qualification (<strong>${qualLabel}</strong>) does not meet the minimum requirement for this examination.`;
    }

    // 2. Registration
    if (!status && regFieldId && data[regFieldId] === "no") {
      status = "notEligible";
      reason = `A valid and active <strong>${summary.registrationLabel}</strong> is mandatory for this examination.`;
    }

    // 3. Age – minimum
    if (!status && age != null && age < minAge) {
      status = "notEligible";
      reason = `Minimum age is <strong>${minAge} years</strong>. Your calculated age is <strong>${age} years</strong>.`;
    }

    // 4. Age – maximum (warning, not hard fail — notification may have relaxations)
    if (!status && age != null && effectiveMaxAge != null && age > effectiveMaxAge) {
      status = "warning";
      reason = `Age limit for <strong>${catLabel}</strong> is <strong>${effectiveMaxAge} yrs</strong>. Your age is <strong>${age} yrs</strong>. Verify the official notification for any additional relaxations.`;
    }

    // 5. Custom rules array (window.customEligibilityRules)
    if (!status && Array.isArray(window.customEligibilityRules)) {
      for (const rule of window.customEligibilityRules) {
        try {
          const r = rule(data);
          if (!r) continue;
          const s = r.status || (r.eligible === false ? "notEligible" : r.warn ? "warning" : null);
          if (s === "notEligible") { status = "notEligible"; reason = r.reason; break; }
          if (s === "warning")     { status = "warning";     reason = r.reason; break; }
        } catch (e) {
          console.warn("[eligibility] custom rule error:", e);
        }
      }
    }

    // 6. Legacy single function — backward compat for pages not yet migrated
    if (!status && typeof window.customEligibilityCheck === "function") {
      try {
        const r = window.customEligibilityCheck(data);
        if (r && r.eligible === false) { status = "notEligible"; reason = r.reason; }
        else if (r && (r.warn || r.status === "warning")) { status = "warning"; reason = r.reason; }
      } catch (e) {
        console.warn("[eligibility] customEligibilityCheck error:", e);
      }
    }

    if (!status) {
      status = "eligible";
      reason = `You meet all the eligibility criteria for this examination. You are eligible to apply.`;
    }

    showResult(resultEl,
      status === "notEligible" ? "error" : status,
      buildResultHTML(status, null, reason, summary));
  }

  function buildResultHTML(status, titleOverride, reason, summary) {
    const meta = {
      eligible:    { icon: "fa-solid fa-circle-check",        title: "Congratulations! You appear eligible." },
      warning:     { icon: "fa-solid fa-triangle-exclamation", title: "Please Verify Official Notification" },
      notEligible: { icon: "fa-solid fa-circle-xmark",        title: "Not Eligible" },
    };
    const { icon, title } = meta[status] || meta.eligible;

    const summaryHTML = summary
      ? `<div class="elig-summary-grid">
          <div class="elig-summary-row">
            <span class="elig-summary-label">Qualification</span>
            <span class="elig-summary-value">${summary.qualification}</span>
          </div>
          <div class="elig-summary-row">
            <span class="elig-summary-label">Calculated Age</span>
            <span class="elig-summary-value">${summary.age}</span>
          </div>
          <div class="elig-summary-row">
            <span class="elig-summary-label">Age Limit</span>
            <span class="elig-summary-value">${summary.ageLimit}</span>
          </div>
          <div class="elig-summary-row">
            <span class="elig-summary-label">${summary.registrationLabel}</span>
            <span class="elig-summary-value">${summary.registration}</span>
          </div>
        </div>`
      : "";

    const confidence = `<p class="elig-confidence">Based on the eligibility criteria configured for this examination. Candidates should verify final eligibility using the official notification before applying.</p>`;

    return `<i class="${icon}"></i>
      <div class="elig-result-body">
        <strong>${titleOverride || title}</strong>
        ${reason ? `<p>${reason}</p>` : ""}
        ${summaryHTML}
        ${confidence}
      </div>`;
  }

  function showResult(el, type, html) {
    el.className = "elig-result show " + type;
    el.innerHTML = html;
  }

  // --- 6. RENDER SYLLABUS ---
  function renderSyllabus() {
    const grid = document.getElementById("syllabus-grid");
    if (!grid || !CONFIG.syllabus) return;

    grid.innerHTML = CONFIG.syllabus
      .map(
        (subject) => `
            <div class="subject-card g-exam-reveal" data-subject="${subject.name.toLowerCase()}">
                <h4>
                    <span class="subj-icon"><i class="${subject.icon || "fa-solid fa-book"}"></i></span>
                    ${subject.name}
                </h4>
                <ul>
                    ${subject.topics.map((t) => `<li><i class="fa-solid fa-chevron-right"></i> ${t}</li>`).join("")}
                </ul>
            </div>
        `,
      )
      .join("");

    // Search functionality
    const searchInput = document.getElementById("syllabus-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = grid.querySelectorAll(".subject-card");
        cards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? "" : "none";
        });
      });
    }
  }

  // --- 7. RENDER PREPARATION STEPS ---
  function renderPreparation() {
    const container = document.getElementById("prepare-timeline");
    if (!container || !CONFIG.preparation) return;

    container.innerHTML = CONFIG.preparation
      .map(
        (step, i) => `
            <div class="prepare-step g-exam-reveal" data-step="${String(i + 1).padStart(2, "0")}">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
                ${step.duration ? `<span class="step-duration"><i class="fa-regular fa-clock"></i> ${step.duration}</span>` : ""}
            </div>
        `,
      )
      .join("");
  }

  // --- 8. RENDER EXAM PROCESS ---
  function renderProcess() {
    const flow = document.getElementById("process-flow");
    if (!flow || !CONFIG.examProcess) return;

    flow.innerHTML = CONFIG.examProcess
      .map(
        (node) => `
            <div class="process-node g-exam-reveal">
                <div class="node-circle"><i class="${node.icon}"></i></div>
                <div>
                    <h5>${node.title}</h5>
                    <span>${node.subtitle || ""}</span>
                </div>
            </div>
        `,
      )
      .join("");
  }

  // --- 9. RENDER WHY EDUOOZ ---
  function renderWhyEduooz() {
    const grid = document.getElementById("why-grid");
    if (!grid || !CONFIG.whyEduooz) return;

    grid.innerHTML = CONFIG.whyEduooz
      .map(
        (item) => `
            <div class="why-card g-exam-reveal">
                <div class="why-icon"><i class="${item.icon}"></i></div>
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        `,
      )
      .join("");
  }

  // --- 10. RENDER PREVIOUS PAPERS (PDF EXPLORER) ---
  // Loads from /question-papers/papers.json; falls back to CONFIG.previousPapers
  function renderPapers() {
    var grid = document.getElementById("pex-paper-grid");
    if (!grid) return;

    var examSlug = CONFIG.examSlug || "aiims-norcet";

    /* ── Resolve papers.json URL relative to current page ── */
    var jsonPath = (function () {
      var depth = window.location.pathname.split("/").filter(Boolean).length;
      var prefix = "";
      for (var i = 0; i < depth; i++) prefix += "../";
      return prefix + "question-papers/papers.json";
    })();

    fetch(jsonPath)
      .then(function (r) {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then(function (data) {
        var allPapers = (data.papers || []).filter(function (p) {
          return p.examSlug === examSlug;
        });
        // Enrich with meta field for display if missing
        allPapers.forEach(function (p) {
          if (!p.meta) {
            var parts = [];
            if (p.questionCount) parts.push(p.questionCount + " MCQs");
            if (p.duration) parts.push(p.duration);
            p.meta = parts.join(" · ");
          }
        });
        initPaperExplorer(allPapers);
      })
      .catch(function () {
        // Graceful fallback to EXAM_CONFIG inline data
        var fallback = CONFIG.previousPapers || [];
        initPaperExplorer(fallback);
      });

    function initPaperExplorer(papers) {
      var emptyEl = document.getElementById("pex-empty");
      var iframe = document.getElementById("pex-iframe");
      var skeleton = document.getElementById("pex-skeleton");
      var locked = document.getElementById("pex-locked-state");
      var infoYear = document.getElementById("pex-info-year");
      var infoTitle = document.getElementById("pex-info-title");
      var dlBtn = document.getElementById("pex-download-btn");
      var zoomLbl = document.getElementById("pex-zoom-label");
      var tabsEl = document.getElementById("pex-tabs");

      var activePaper = null;
      var currentZoom = 100;
      var activeYear = "all";
      var searchQuery = "";

      /* ── Auto-generate year filter tabs from data ── */
      if (tabsEl) {
        var years = papers
          .map(function (p) {
            return p.year;
          })
          .filter(function (y, i, a) {
            return a.indexOf(y) === i;
          })
          .sort()
          .reverse();

        tabsEl.innerHTML =
          '<button class="pex-tab active" data-year="all">All Years</button>' +
          years
            .map(function (y) {
              return (
                '<button class="pex-tab" data-year="' +
                y +
                '">' +
                y +
                "</button>"
              );
            })
            .join("");
      }

      /* ── Zoom ── */
      function setZoom(z) {
        currentZoom = Math.max(60, Math.min(200, z));
        if (iframe) {
          iframe.style.transform = "scale(" + currentZoom / 100 + ")";
          iframe.style.transformOrigin = "top center";
        }
        if (zoomLbl) zoomLbl.textContent = currentZoom + "%";
      }
      var zIn = document.getElementById("pex-zoom-in");
      var zOut = document.getElementById("pex-zoom-out");
      if (zIn)
        zIn.addEventListener("click", function () {
          setZoom(currentZoom + 20);
        });
      if (zOut)
        zOut.addEventListener("click", function () {
          setZoom(currentZoom - 20);
        });

      /* ── Fullscreen ── */
      var fsBtn = document.getElementById("pex-fullscreen-btn");
      if (fsBtn) {
        fsBtn.addEventListener("click", function () {
          var card = document.getElementById("pex-preview-card");
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
        locked.classList.remove("pex-show");
        iframe.classList.remove("pex-loaded");
        skeleton.classList.remove("pex-hidden");

        if (!paper.pdfUrl) {
          setTimeout(function () {
            skeleton.classList.add("pex-hidden");
            var locTitle = document.getElementById("pex-locked-title");
            var locSub = document.getElementById("pex-locked-sub");
            if (locTitle)
              locTitle.textContent = paper.shortTitle || paper.title;
            if (locSub)
              locSub.textContent = "Enroll to access and download this paper.";
            locked.classList.add("pex-show");
          }, 480);
          return;
        }

        iframe.src = "";
        setTimeout(function () {
          iframe.onload = function () {
            skeleton.classList.add("pex-hidden");
            iframe.classList.add("pex-loaded");
          };
          iframe.src = paper.pdfUrl;
        }, 100);
      }

      /* ── Select paper ── */
      function selectPaper(paper) {
        activePaper = paper;
        if (infoYear)
          infoYear.textContent =
            paper.year + (paper.shift ? " · " + paper.shift : "");
        if (infoTitle) infoTitle.textContent = paper.shortTitle || paper.title;

        grid.querySelectorAll(".pex-paper-card").forEach(function (c) {
          c.classList.toggle("pex-active", c.dataset.id === paper.id);
        });

        if (dlBtn) {
          if (paper.pdfUrl) {
            dlBtn.href = paper.pdfUrl;
            dlBtn.setAttribute("target", "_blank");
            dlBtn.style.opacity = "";
            dlBtn.style.pointerEvents = "";
          } else {
            dlBtn.href = "#";
            dlBtn.removeAttribute("target");
            dlBtn.style.opacity = "0.38";
            dlBtn.style.pointerEvents = "none";
          }
        }

        // Update URL to paper SEO page using history API (shareable, crawlable)
        if (paper.slug && window.history && window.history.pushState) {
          var paperUrl = "/question-papers/" + paper.slug + "/";
          window.history.replaceState(
            { paperId: paper.id },
            paper.title,
            paperUrl,
          );
        }

        loadPreview(paper);
      }

      /* ── Render cards ── */
      function renderCards(list) {
        if (list.length === 0) {
          grid.innerHTML = "";
          if (emptyEl) emptyEl.classList.add("pex-show");
          return;
        }
        if (emptyEl) emptyEl.classList.remove("pex-show");

        grid.innerHTML = list
          .map(function (paper, i) {
            var isActive = activePaper && activePaper.id === paper.id;
            var seoHref = paper.slug
              ? "/question-papers/" + paper.slug + "/"
              : "#";
            return (
              '<div class="pex-paper-card' +
              (isActive ? " pex-active" : "") +
              '"' +
              ' data-id="' +
              paper.id +
              '"' +
              ' style="animation-delay:' +
              i * 0.05 +
              's">' +
              '<div class="pex-card-top">' +
              '<div class="pex-card-icon"><i class="fa-solid fa-file-pdf"></i></div>' +
              '<span class="pex-year-badge">' +
              paper.year +
              "</span>" +
              "</div>" +
              '<h4 class="pex-card-title">' +
              (paper.shortTitle || paper.title) +
              "</h4>" +
              '<p class="pex-card-meta"><i class="fa-regular fa-file-lines"></i> ' +
              (paper.meta || "") +
              (paper.pages ? " · " + paper.pages + " pages" : "") +
              "</p>" +
              '<div class="pex-card-footer">' +
              '<div class="pex-active-chip"><i class="fa-solid fa-eye"></i> Previewing</div>' +
              '<a class="pex-seo-link" href="' +
              seoHref +
              '" title="Full page for ' +
              (paper.shortTitle || paper.title) +
              '"' +
              ' onclick="event.stopPropagation()">' +
              '<i class="fa-solid fa-arrow-up-right-from-square"></i>' +
              "</a>" +
              "</div>" +
              "</div>"
            );
          })
          .join("");

        grid.querySelectorAll(".pex-paper-card").forEach(function (card) {
          card.addEventListener("click", function () {
            var id = card.dataset.id;
            var found = papers.filter(function (p) {
              return p.id === id;
            })[0];
            if (found) selectPaper(found);
          });
        });
      }

      /* ── Filter ── */
      function applyFilter() {
        var filtered = papers.slice();
        if (activeYear !== "all") {
          filtered = filtered.filter(function (p) {
            return p.year === activeYear;
          });
        }
        if (searchQuery) {
          var q = searchQuery;
          filtered = filtered.filter(function (p) {
            return (
              (p.title || "").toLowerCase().indexOf(q) !== -1 ||
              (p.shortTitle || "").toLowerCase().indexOf(q) !== -1 ||
              (p.year || "").indexOf(q) !== -1 ||
              (p.shift || "").toLowerCase().indexOf(q) !== -1
            );
          });
        }
        renderCards(filtered);
        var stillVisible = filtered.some(function (p) {
          return activePaper && p.id === activePaper.id;
        });
        if (filtered.length && !stillVisible) selectPaper(filtered[0]);
      }

      /* ── Tab listeners (bound on live DOM after tab build) ── */
      function bindTabs() {
        var tabs = document.querySelectorAll("#pex-tabs .pex-tab");
        tabs.forEach(function (tab) {
          tab.addEventListener("click", function () {
            tabs.forEach(function (t) {
              t.classList.remove("active");
            });
            tab.classList.add("active");
            activeYear = tab.dataset.year;
            applyFilter();
          });
        });
      }
      bindTabs();

      /* ── Search listener ── */
      var searchInput = document.getElementById("pex-search");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          searchQuery = searchInput.value.toLowerCase().trim();
          applyFilter();
        });
      }

      /* ── Init ── */
      renderCards(papers);
      if (papers.length) selectPaper(papers[0]);

      // Restore scroll position on browser back
      window.addEventListener("popstate", function (e) {
        if (e.state && e.state.paperId) {
          var found = papers.filter(function (p) {
            return p.id === e.state.paperId;
          })[0];
          if (found) selectPaper(found);
        }
      });
    }
  }

  // --- 10b. STATIC PAPER EXPLORER (for pages with manually-written paper cards) ---
  function initStaticPaperExplorer() {
    var grid = document.querySelector(".pex-paper-grid");
    if (!grid || grid.id === "pex-paper-grid") return;

    var iframe = document.getElementById("pex-iframe");
    var skeleton = document.getElementById("pex-skeleton");
    var locked = document.getElementById("pex-locked-state");
    var lockedTitle = document.getElementById("pex-locked-title");
    var lockedSub = document.getElementById("pex-locked-sub");
    var infoYear = document.getElementById("pex-info-year");
    var infoTitle = document.getElementById("pex-info-title");
    var dlBtn = document.getElementById("pex-download-btn");
    var zoomLbl = document.getElementById("pex-zoom-label");
    var tabsEl = document.querySelector(".pex-tabs");
    var searchEl = document.getElementById("pex-search");
    var emptyEl = document.getElementById("pex-empty");
    var currentZoom = 100;

    if (locked) locked.classList.add("pex-show");
    if (skeleton) skeleton.classList.add("pex-hidden");

    var zIn = document.getElementById("pex-zoom-in");
    var zOut = document.getElementById("pex-zoom-out");
    function setZoom(z) {
      currentZoom = Math.max(60, Math.min(200, z));
      if (iframe) {
        iframe.style.transform = "scale(" + currentZoom / 100 + ")";
        iframe.style.transformOrigin = "top center";
      }
      if (zoomLbl) zoomLbl.textContent = currentZoom + "%";
    }
    if (zIn) zIn.addEventListener("click", function () { setZoom(currentZoom + 20); });
    if (zOut) zOut.addEventListener("click", function () { setZoom(currentZoom - 20); });

    var fsBtn = document.getElementById("pex-fullscreen-btn");
    if (fsBtn) {
      fsBtn.addEventListener("click", function () {
        var card = document.getElementById("pex-preview-card");
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

    function loadPreview(pdfUrl, year, title) {
      if (infoYear) infoYear.textContent = year || "";
      if (infoTitle) infoTitle.textContent = title || "";

      if (!pdfUrl) {
        if (skeleton) skeleton.classList.add("pex-hidden");
        if (lockedTitle) lockedTitle.textContent = title || "Paper Unavailable";
        if (lockedSub) lockedSub.textContent = "Enroll to access and download this paper.";
        if (locked) locked.classList.add("pex-show");
        if (iframe) { iframe.classList.remove("pex-loaded"); iframe.src = ""; }
        if (dlBtn) { dlBtn.removeAttribute("href"); dlBtn.style.opacity = "0.38"; dlBtn.style.pointerEvents = "none"; }
        return;
      }

      if (dlBtn) { dlBtn.href = pdfUrl; dlBtn.setAttribute("target", "_blank"); dlBtn.style.opacity = ""; dlBtn.style.pointerEvents = ""; }
      if (locked) locked.classList.remove("pex-show");
      if (skeleton) skeleton.classList.remove("pex-hidden");
      if (iframe) {
        iframe.classList.remove("pex-loaded");
        iframe.src = "";
        setTimeout(function () {
          iframe.onload = function () {
            if (skeleton) skeleton.classList.add("pex-hidden");
            iframe.classList.add("pex-loaded");
          };
          iframe.src = pdfUrl;
        }, 100);
      }
    }

    function getCardPdf(card) {
      if (card.dataset.pdf !== undefined) return card.dataset.pdf;
      var href = card.getAttribute("href");
      if (href && href !== "#" && href.indexOf(".pdf") !== -1) return card.href;
      return "";
    }

    function handleCardClick(card, e) {
      if (e.target.closest(".pex-seo-link")) return;
      e.preventDefault();
      var yearEl = card.querySelector(".pex-year-badge");
      var titleEl = card.querySelector(".pex-card-title, h4");
      var year = card.dataset.year || (yearEl ? yearEl.textContent.trim() : "");
      var title = card.dataset.title || (titleEl ? titleEl.textContent.trim() : "");
      grid.querySelectorAll(".pex-paper-card").forEach(function (c) { c.classList.remove("pex-active"); });
      card.classList.add("pex-active");
      loadPreview(getCardPdf(card), year, title);
    }

    grid.querySelectorAll(".pex-paper-card").forEach(function (card) {
      card.addEventListener("click", function (e) { handleCardClick(card, e); });
    });

    function applyFilter(year, query) {
      var anyVisible = false;
      grid.querySelectorAll(".pex-paper-card").forEach(function (card) {
        var yearEl = card.querySelector(".pex-year-badge");
        var titleEl = card.querySelector(".pex-card-title, h4");
        var cardYear = card.dataset.year || (yearEl ? yearEl.textContent.trim() : "");
        var title = (card.dataset.title || (titleEl ? titleEl.textContent.trim() : "")).toLowerCase();
        var yearMatch = year === "all" || cardYear === year;
        var searchMatch = !query || title.indexOf(query) !== -1 || cardYear.toLowerCase().indexOf(query) !== -1;
        var visible = yearMatch && searchMatch;
        card.style.display = visible ? "" : "none";
        if (visible) anyVisible = true;
      });
      if (emptyEl) emptyEl.classList.toggle("pex-show", !anyVisible);
    }

    if (tabsEl) {
      tabsEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".pex-tab");
        if (!btn) return;
        tabsEl.querySelectorAll(".pex-tab").forEach(function (t) { t.classList.remove("active"); });
        btn.classList.add("active");
        applyFilter(btn.dataset.year || "all", searchEl ? searchEl.value.toLowerCase().trim() : "");
      });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        var activeTab = tabsEl ? tabsEl.querySelector(".pex-tab.active") : null;
        var year = activeTab ? (activeTab.dataset.year || "all") : "all";
        applyFilter(year, searchEl.value.toLowerCase().trim());
      });
    }
  }

  // --- 10c. QP EXPLORER — New unified question-papers design (qp- prefix) ---
  function initQPExplorer() {
    var cardGrid = document.querySelector(".qp-card-grid");
    if (!cardGrid) return;

    var iframe      = document.getElementById("qp-iframe");
    var skeleton    = document.getElementById("qp-skeleton");
    var emptyState  = document.getElementById("qp-empty-state");
    var lockedState = document.getElementById("qp-locked-state");
    var lockedTitle = document.getElementById("qp-locked-title");
    var infoYear    = document.getElementById("qp-info-year");
    var infoTitle   = document.getElementById("qp-info-title");
    var dlBtn       = document.getElementById("qp-download-btn");
    var zoomLbl     = document.getElementById("qp-zoom-label");
    var noResults   = document.getElementById("qp-no-results");
    var tabsEl      = document.querySelector(".qp-year-tabs");
    var currentZoom = 100;

    /* ── Initial idle state ── */
    function resetToIdle() {
      if (emptyState)  emptyState.classList.remove("qp-hidden");
      if (lockedState) lockedState.classList.remove("qp-show");
      if (skeleton)    skeleton.classList.remove("qp-show");
      if (iframe)      { iframe.classList.remove("qp-loaded"); iframe.src = ""; }
    }
    resetToIdle();

    /* ── Zoom ── */
    function setZoom(z) {
      currentZoom = Math.max(60, Math.min(200, z));
      if (iframe) {
        iframe.style.transform = "scale(" + currentZoom / 100 + ")";
        iframe.style.transformOrigin = "top center";
      }
      if (zoomLbl) zoomLbl.textContent = currentZoom + "%";
    }
    var zIn  = document.getElementById("qp-zoom-in");
    var zOut = document.getElementById("qp-zoom-out");
    if (zIn)  zIn.addEventListener("click",  function () { setZoom(currentZoom + 20); });
    if (zOut) zOut.addEventListener("click", function () { setZoom(currentZoom - 20); });

    /* ── Fullscreen ── */
    var fsBtn = document.getElementById("qp-fullscreen-btn");
    if (fsBtn) {
      fsBtn.addEventListener("click", function () {
        var card = document.getElementById("qp-preview-card");
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

    /* ── Load preview ── */
    function loadPreview(pdfUrl, year, title, downloadUrl) {
      if (infoYear)  infoYear.textContent  = year  || "";
      if (infoTitle) infoTitle.textContent = title || "";

      if (!pdfUrl) {
        /* No PDF — show locked/enroll state */
        if (emptyState)  emptyState.classList.add("qp-hidden");
        if (skeleton)    skeleton.classList.remove("qp-show");
        if (lockedTitle) lockedTitle.textContent = title || "Paper Unavailable";
        if (lockedState) lockedState.classList.add("qp-show");
        if (iframe)      { iframe.classList.remove("qp-loaded"); iframe.src = ""; }
        if (dlBtn) {
          dlBtn.removeAttribute("href");
          dlBtn.style.opacity       = "0.38";
          dlBtn.style.pointerEvents = "none";
        }
        return;
      }

      /* Has PDF — load in iframe */
      if (dlBtn) {
        dlBtn.href = downloadUrl || pdfUrl;
        dlBtn.setAttribute("target", "_blank");
        dlBtn.style.opacity       = "";
        dlBtn.style.pointerEvents = "";
      }
      if (emptyState)  emptyState.classList.add("qp-hidden");
      if (lockedState) lockedState.classList.remove("qp-show");
      if (skeleton)    skeleton.classList.add("qp-show");
      if (iframe) {
        iframe.classList.remove("qp-loaded");
        iframe.src = "";
        setTimeout(function () {
          iframe.onload = function () {
            if (skeleton) skeleton.classList.remove("qp-show");
            iframe.classList.add("qp-loaded");
          };
          iframe.src = pdfUrl;
        }, 100);
      }
    }

    /* ── Card click ── */
    function activateCard(card) {
      cardGrid.querySelectorAll(".qp-card").forEach(function (c) {
        c.classList.remove("qp-active");
      });
      card.classList.add("qp-active");

      var pdfUrl      = card.dataset.pdf      || "";
      var title       = card.dataset.title    || (card.querySelector(".qp-card-title") ? card.querySelector(".qp-card-title").textContent.trim() : "");
      var year        = card.dataset.year     || (card.querySelector(".qp-card-year")  ? card.querySelector(".qp-card-year").textContent.trim()  : "");
      var downloadUrl = card.dataset.download || pdfUrl;

      loadPreview(pdfUrl, year, title, downloadUrl);
    }

    cardGrid.querySelectorAll(".qp-card").forEach(function (card) {
      card.addEventListener("click", function () { activateCard(card); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activateCard(card); }
      });
    });

    /* ── Year filter tabs ── */
    function applyFilter(year) {
      var anyVisible = false;
      cardGrid.querySelectorAll(".qp-card").forEach(function (card) {
        var cardYear  = card.dataset.year || (card.querySelector(".qp-card-year") ? card.querySelector(".qp-card-year").textContent.trim() : "");
        var visible   = year === "all" || cardYear === year;
        card.style.display = visible ? "" : "none";
        if (visible) anyVisible = true;
      });
      if (noResults) noResults.classList.toggle("qp-show", !anyVisible);
    }

    if (tabsEl) {
      tabsEl.addEventListener("click", function (e) {
        var btn = e.target.closest(".qp-year-tab");
        if (!btn) return;
        tabsEl.querySelectorAll(".qp-year-tab").forEach(function (t) { t.classList.remove("active"); });
        btn.classList.add("active");
        applyFilter(btn.dataset.year || "all");
      });
    }
  }

  // --- 11. RENDER PRACTICE TESTS ---
  function renderPracticeTests() {
    const grid = document.getElementById("practice-grid");
    if (!grid || !CONFIG.practiceTests) return;

    grid.innerHTML = CONFIG.practiceTests
      .map(
        (test) => `
            <div class="practice-card g-exam-reveal">
                <div class="practice-header">
                    <span class="difficulty-badge ${test.difficulty}">${test.difficulty}</span>
                </div>
                <h4>${test.title}</h4>
                <div class="practice-meta">
                    <span><i class="fa-regular fa-circle-question"></i> ${test.questions} Questions</span>
                    <span><i class="fa-regular fa-clock"></i> ${test.duration}</span>
                </div>
                <a href="${test.url || "#"}" class="btn-start-test">
                    <i class="fa-solid fa-play"></i> Start Test
                </a>
            </div>
        `,
      )
      .join("");
  }

  // --- 12. RENDER STUDY MATERIALS ---
  function renderMaterials() {
    const grid = document.getElementById("materials-grid");
    if (!grid || !CONFIG.studyMaterials) return;

    grid.innerHTML = CONFIG.studyMaterials
      .map(
        (mat) => `
            <div class="material-card g-exam-reveal">
                <div class="mat-icon"><i class="${mat.icon}"></i></div>
                <div class="mat-content">
                    <h4>${mat.title}</h4>
                    <p>${mat.description}</p>
                    <a href="${mat.url || "#"}" class="btn-download-mat">
                        <i class="fa-solid fa-download"></i> Download
                    </a>
                </div>
            </div>
        `,
      )
      .join("");
  }

  // --- 13. RENDER RELATED RESOURCES ---
  function renderResources() {
    const container = document.getElementById("resources-pills");
    if (!container || !CONFIG.relatedResources) return;

    container.innerHTML = CONFIG.relatedResources
      .map(
        (res) => `
            <a href="${res.url || "#"}" class="resource-pill">
                <i class="${res.icon}"></i> ${res.label}
            </a>
        `,
      )
      .join("");
  }

  // --- 14. RENDER FAQ ---
  function renderFAQ() {
    const container = document.getElementById("faq-accordion");
    if (!container || !CONFIG.faqs) return;

    const half = Math.ceil(CONFIG.faqs.length / 2);
    const col1 = CONFIG.faqs.slice(0, half);
    const col2 = CONFIG.faqs.slice(half);

    function renderColumn(items, startIdx) {
      return items
        .map(
          (faq, i) => `
                <div class="faq-item">
                    <button class="faq-question">
                        <span class="faq-num">${String(startIdx + i + 1).padStart(2, "0")}</span>
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
            `,
        )
        .join("");
    }

    container.innerHTML = `
            <div class="faq-column">${renderColumn(col1, 0)}</div>
            <div class="faq-column">${renderColumn(col2, half)}</div>
        `;
  }

  // --- 15. STICKY NAVIGATION ---
  function initStickyNav() {
    const nav = document.getElementById("exam-sticky-nav");
    if (!nav) return;

    document.body.classList.add("has-sticky-nav");

    const links = nav.querySelectorAll('.esn-btn[href^="#"]');
    const sectionMap = [];

    links.forEach((link) => {
      const id = link.getAttribute("href").substring(1);
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
      links.forEach((l) => l.classList.remove("active"));
      const activeLink = nav.querySelector(`.esn-btn[href="#${id}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
        // On mobile horizontal bar, scroll active item into view
        if (window.innerWidth <= 1024) {
          const track = nav.querySelector(".esn-track");
          const item = activeLink.closest(".esn-item");
          if (track && item) {
            const trackRect = track.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const center =
              track.scrollLeft +
              (itemRect.left - trackRect.left) -
              trackRect.width / 2 +
              itemRect.width / 2;
            track.scrollTo({ left: center, behavior: "smooth" });
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
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      });

      return bestId;
    }

    // Smooth scroll + ripple on click
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        const ripple = document.createElement("span");
        ripple.className = "esn-ripple";
        link.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        const id = link.getAttribute("href").substring(1);
        const target = document.getElementById(id);

        // Set active immediately and lock observer overrides during smooth scroll
        setActive(id);
        clickScrollTarget = id;
        clearTimeout(clickScrollTimer);

        if (target) {
          const offset = window.innerWidth <= 1024 ? 80 : 0;
          const y =
            target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
          // Release lock after smooth scroll settles (~900ms)
          clickScrollTimer = setTimeout(() => {
            clickScrollTarget = null;
          }, 900);
        }
      });
    });

    // Keyboard navigation (arrow keys between items)
    nav.addEventListener("keydown", (e) => {
      const btns = Array.from(links);
      const idx = btns.indexOf(document.activeElement);
      if (idx === -1) return;
      const isMobile = window.innerWidth <= 1024;
      const prev = isMobile ? "ArrowLeft" : "ArrowUp";
      const next = isMobile ? "ArrowRight" : "ArrowDown";
      if (e.key === prev && idx > 0) {
        e.preventDefault();
        btns[idx - 1].focus();
      }
      if (e.key === next && idx < btns.length - 1) {
        e.preventDefault();
        btns[idx + 1].focus();
      }
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
        if (score > bestScore) {
          bestScore = score;
          bestId = id;
        }
      });

      if (bestId) setActive(bestId);
    }

    // Multiple thresholds give smooth ratio updates for accurate scoring
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleRatios.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleRatios.delete(entry.target.id);
          }
        });
        resolveActiveSection();
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      },
    );

    sectionMap.forEach(({ section }) => observer.observe(section));

    // Activate first section immediately on page load
    setActive(sectionMap[0].id);

    // Hide nav while hero is visible
    const hero = document.querySelector(".course-hero-section");
    if (hero) {
      const heroObserver = new IntersectionObserver(
        ([entry]) => {
          nav.classList.toggle("is-hidden", entry.isIntersecting);
        },
        { threshold: 0.3 },
      );
      heroObserver.observe(hero);
    }

    // Unified scroll handler: bottom-edge detection + hide-on-scroll-down
    let lastScrollY = window.scrollY;
    let rafId = null;

    window.addEventListener(
      "scroll",
      () => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const currentY = window.scrollY;

          // Bottom-of-page: guarantee last section stays active
          if (
            !clickScrollTarget &&
            currentY + window.innerHeight >=
              document.documentElement.scrollHeight - 80
          ) {
            setActive(sectionMap[sectionMap.length - 1].id);
          }

          // Hide nav on scroll-down, reveal on scroll-up
          if (currentY > 150) {
            nav.classList.toggle(
              "esn-scrolled-down",
              currentY > lastScrollY + 6,
            );
          } else {
            nav.classList.remove("esn-scrolled-down");
          }
          lastScrollY = currentY;
          rafId = null;
        });
      },
      { passive: true },
    );

    // Mobile: tap to show tooltip briefly
    nav.querySelectorAll(".esn-item").forEach((item) => {
      item.addEventListener(
        "touchstart",
        () => {
          nav
            .querySelectorAll(".esn-item")
            .forEach((i) => i.classList.remove("esn-tapped"));
          item.classList.add("esn-tapped");
          setTimeout(() => item.classList.remove("esn-tapped"), 2000);
        },
        { passive: true },
      );
    });
  }

  // --- 16. GSAP SCROLL ANIMATIONS ---
  function initAnimations() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
      return;

    gsap.registerPlugin(ScrollTrigger);

    // Reveal all elements with g-exam-reveal class
    gsap.utils.toArray(".g-exam-reveal").forEach((el) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });
  }

  // --- INITIALIZE ALL ---
  // Renders are isolated too: a bad CONFIG section won't block later steps.
  [
    renderSnapshot,
    renderAbout,
    renderEligibilityCards,
    renderAgeRules,
    initEligibilityChecker,
    renderSyllabus,
    renderPreparation,
    renderProcess,
    renderWhyEduooz,
    renderPapers,
    renderPracticeTests,
    renderMaterials,
    renderResources,
    renderFAQ,
    initFaqAccordion,
    initStickyNav,
    initSyllabusTabs,
    initPrepareAccordion,
  ].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("[Render Init] " + fn.name + " failed:", e);
    }
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
    initMockTestSystem,
    initStaticPaperExplorer,
    initQPExplorer,
  ].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn("[Carousel Init] " + fn.name + " failed:", e);
    }
  });

  // Delay animations to let DOM render
  setTimeout(() => {
    try {
      initAnimations();
    } catch (e) {
      console.warn("[Init] initAnimations failed:", e);
    }
  }, 100);
});

// ===========================================
// WHY EDUOOZ — Rotating Feature Showcase
// Slides between two sets of why-cards with
// CSS-driven progress-bar dots and auto-advance.
// ===========================================
function initWhyShowcase() {
  const wrapper = document.getElementById("why-showcase");
  if (!wrapper) return;

  const slides = Array.from(wrapper.querySelectorAll(".why-showcase-slide"));
  const dots = Array.from(wrapper.querySelectorAll(".progress-dot"));
  if (slides.length < 2) return;

  let current = 0;
  let timer = null;
  const DELAY = 4500; // must match CSS @keyframes progress-fill duration

  function goTo(idx) {
    const prev = current;
    current = ((idx % slides.length) + slides.length) % slides.length;
    if (prev === current) return;

    // Exit old slide with left-slide animation
    slides[prev].classList.add("exit-left");
    slides[prev].classList.remove("active");
    setTimeout(() => slides[prev].classList.remove("exit-left"), 700);

    // Activate incoming slide
    slides[current].classList.add("active");

    // Restart dot progress animation: remove then force reflow then re-add
    dots.forEach((d, i) => {
      d.classList.remove("active");
      if (i === current) {
        void d.offsetWidth; // flush so CSS animation restarts
        d.classList.add("active");
      }
    });
  }

  function next() {
    goTo(current + 1);
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, DELAY);
  }

  // Dot clicks
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      startAuto();
    });
  });

  // Touch swipe
  let touchStartX = 0;
  wrapper.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      clearInterval(timer);
    },
    { passive: true },
  );
  wrapper.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) dx < 0 ? next() : goTo(current - 1);
      startAuto();
    },
    { passive: true },
  );

  // Hover pause (CSS pauses the ::after fill animation; JS pauses the interval)
  wrapper.addEventListener("mouseenter", () => clearInterval(timer));
  wrapper.addEventListener("mouseleave", startAuto);

  // Ensure clean initial state
  slides.forEach((s, i) => {
    s.classList.toggle("active", i === 0);
    s.classList.remove("exit-left");
  });
  dots.forEach((d, i) => d.classList.toggle("active", i === 0));

  startAuto();
}

// --- FACULTY SHOWCASE CAROUSEL ---
function initFacultyCarousel() {
  const stage = document.getElementById("fac-car-stage");
  const track = document.getElementById("fac-car-track");
  const prevBtn = document.getElementById("fac-car-prev");
  const nextBtn = document.getElementById("fac-car-next");
  const dotsEl = document.getElementById("fac-car-dots");
  if (!track || !stage) return;

  const cards = Array.from(track.querySelectorAll(".fac-car-card"));
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
    card.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count);
      if (el.dataset.counted) {
        el.textContent = target.toLocaleString() + "+";
        return;
      }
      el.dataset.counted = "1";
      const duration = 1400;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val = Math.round(target * ease);
        el.textContent = val.toLocaleString() + "+";
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
    cards.forEach((c) => {
      c.style.width = cardW + "px";
    });
    track.style.transform = `translateX(${offset}px)`;
    cards.forEach((c, i) => {
      c.classList.remove("fac-car-active", "fac-car-nearby");
      if (i === current) {
        c.classList.add("fac-car-active");
        animateCounters(c);
      } else if (
        Math.abs(i - current) === 1 ||
        (current === 0 && i === cards.length - 1) ||
        (current === cards.length - 1 && i === 0)
      ) {
        c.classList.add("fac-car-nearby");
      }
    });
    if (dotsEl) {
      Array.from(dotsEl.querySelectorAll(".fac-car-dot")).forEach((d, i) => {
        d.classList.toggle("fac-car-dot-active", i === current);
      });
    }
  }

  function goTo(idx) {
    current = ((idx % cards.length) + cards.length) % cards.length;
    update();
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    cards.forEach((_, i) => {
      const btn = document.createElement("button");
      btn.className = "fac-car-dot" + (i === 0 ? " fac-car-dot-active" : "");
      btn.setAttribute("aria-label", `Go to faculty ${i + 1}`);
      btn.addEventListener("click", () => {
        goTo(i);
        resetAuto();
      });
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
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      goTo(current - 1);
      resetAuto();
    });
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      goTo(current + 1);
      resetAuto();
    });

  // Pause on hover
  const root = document.querySelector(".fac-car-root");
  if (root) {
    root.addEventListener("mouseenter", () => {
      isPaused = true;
      clearInterval(autoTimer);
    });
    root.addEventListener("mouseleave", () => {
      isPaused = false;
      resetAuto();
    });
  }

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) {
        goTo(current + (diff > 0 ? 1 : -1));
        resetAuto();
      }
    },
    { passive: true },
  );

  // Mouse drag
  track.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    track.style.cursor = "grabbing";
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
  });
  document.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.cursor = "";
    const diff = dragStartX - dragCurrentX;
    if (Math.abs(diff) > 50) {
      goTo(current + (diff > 0 ? 1 : -1));
      resetAuto();
    }
  });

  // Click to focus card
  cards.forEach((card, i) => {
    card.addEventListener("click", () => {
      if (i !== current) {
        goTo(i);
        resetAuto();
      }
    });
  });

  // Keyboard navigation
  const section = document.querySelector(".fac-showcase-section");
  if (section) {
    section.setAttribute("tabindex", "0");
    section.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(current - 1);
        resetAuto();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(current + 1);
        resetAuto();
      }
    });
  }

  // Mouse wheel
  if (stage) {
    stage.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.deltaX > 0 ? goTo(current + 1) : goTo(current - 1);
        } else {
          e.deltaY > 0 ? goTo(current + 1) : goTo(current - 1);
        }
        resetAuto();
      },
      { passive: false },
    );
  }

  // Floating particles
  const particlesEl = document.getElementById("fac-particles");
  if (particlesEl) {
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement("div");
      const size = 3 + Math.random() * 4;
      dot.style.cssText = `
                position:absolute;
                width:${size}px;height:${size}px;
                border-radius:50%;
                background:rgba(6,182,212,${0.08 + Math.random() * 0.12});
                left:${Math.random() * 100}%;
                top:${Math.random() * 100}%;
                animation: fac-float-particle ${8 + Math.random() * 12}s ease-in-out ${Math.random() * 5}s infinite;
            `;
      particlesEl.appendChild(dot);
    }
  }

  window.addEventListener("resize", update, { passive: true });

  buildDots();
  goTo(0);
  resetAuto();
}

// --- FAQ ACCORDION ---
function initFaqAccordion() {
  const container = document.getElementById("faq-accordion");
  if (!container) return;

  container.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isActive = item.classList.contains("active");

      // Close all open items and remove wrapper dimming
      container
        .querySelectorAll(".faq-item.active")
        .forEach((open) => open.classList.remove("active"));
      container.classList.remove("has-active");

      // Open clicked item if it was closed
      if (!isActive) {
        item.classList.add("active");
        container.classList.add("has-active");
      }
    });
  });
}

// --- GOOGLE REVIEWS COUNTERS ---
function initReviewCounters() {
  const bar = document.getElementById("greview-stats-bar");
  if (!bar) return;

  const counters = bar.querySelectorAll(".greview-count[data-target]");
  if (!counters.length) return;

  let triggered = false;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || triggered) return;
      triggered = true;

      counters.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const suffix = el.dataset.suffix || "";
        const isDecimal = target % 1 !== 0;
        const duration = 1600;
        const start = performance.now();

        (function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          const val = target * ease;
          el.textContent =
            (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });

      observer.disconnect();
    },
    { threshold: 0.4 },
  );

  observer.observe(bar);
}
window.initReviewCounters = initReviewCounters;

// --- GOOGLE REVIEWS CAROUSEL ---
function initReviewCarousel() {
  // Stop any timer left by a previous init (used by google-reviews.js re-init)
  if (typeof window._greviewAutoTimer !== "undefined") {
    clearInterval(window._greviewAutoTimer);
    window._greviewAutoTimer = undefined;
  }

  const viewport = document.getElementById("greview-carousel-viewport");
  const track = document.getElementById("greview-track");
  const prevBtn = document.getElementById("greview-prev");
  const nextBtn = document.getElementById("greview-next");
  const dotsEl = document.getElementById("greview-dots");

  if (!track || !viewport) return;

  const cards = Array.from(track.querySelectorAll(".greview-card"));
  const GAP = 18; // matches CSS gap
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
    cards.forEach((c) => {
      c.style.width = cardW + "px";
      c.style.flexShrink = "0";
    });
  }

  function buildDots() {
    const max = getMax();
    dotsEl.innerHTML = "";
    for (let i = 0; i <= max; i++) {
      const btn = document.createElement("button");
      btn.className =
        "greview-dot" + (i === current ? " greview-dot-active" : "");
      btn.setAttribute("aria-label", `Go to review ${i + 1}`);
      btn.addEventListener("click", () => {
        goTo(i);
        resetAuto();
      });
      dotsEl.appendChild(btn);
    }
  }

  function updateDots() {
    Array.from(dotsEl.querySelectorAll(".greview-dot")).forEach((d, i) => {
      d.classList.toggle("greview-dot-active", i === current);
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
    window._greviewAutoTimer = autoTimer; // allows google-reviews.js to clear on re-init
  }

  prevBtn.addEventListener("click", () => {
    goTo(current - 1);
    resetAuto();
  });
  nextBtn.addEventListener("click", () => {
    goTo(current + 1);
    resetAuto();
  });

  // Pause auto on hover
  const wrap = document.getElementById("greview-carousel-wrap");
  if (wrap) {
    wrap.addEventListener("mouseenter", () => clearInterval(autoTimer));
    wrap.addEventListener("mouseleave", resetAuto);
    wrap.addEventListener("focusin", () => clearInterval(autoTimer));
    wrap.addEventListener("focusout", resetAuto);
  }

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true },
  );
  track.addEventListener(
    "touchend",
    (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 44) {
        goTo(current + (diff > 0 ? 1 : -1));
        resetAuto();
      }
    },
    { passive: true },
  );

  // Keyboard on focused arrows
  [prevBtn, nextBtn].forEach((btn) => {
    btn.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        goTo(current - 1);
        resetAuto();
      }
      if (e.key === "ArrowRight") {
        goTo(current + 1);
        resetAuto();
      }
    });
  });

  // Resize
  window.addEventListener(
    "resize",
    () => {
      setWidths();
      buildDots();
      goTo(Math.min(current, getMax()));
    },
    { passive: true },
  );

  // Init
  setWidths();
  buildDots();
  goTo(0);
  resetAuto();
}
window.initReviewCarousel = initReviewCarousel;

// ===========================================
// MOCK TEST SYSTEM — moved to practice-test.js
// Initialized by question-bank.js after loading
// ===========================================
function initMockTestSystem() {}

// ===========================================
// HOW TO PREPARE — Accordion
// Hover on desktop, click on touch devices
// ===========================================
function initPrepareAccordion() {
  const steps = document.querySelectorAll(".prepare-timeline .prepare-step");
  if (!steps.length) return;

  const isTouch = () => window.matchMedia("(hover: none)").matches;
  let openStep = null;

  function open(step) {
    if (openStep && openStep !== step) close(openStep);
    step.classList.add("is-open");
    step.setAttribute("aria-expanded", "true");
    openStep = step;
  }

  function close(step) {
    step.classList.remove("is-open");
    step.setAttribute("aria-expanded", "false");
    if (openStep === step) openStep = null;
  }

  function toggle(step) {
    step.classList.contains("is-open") ? close(step) : open(step);
  }

  steps.forEach((step) => {
    // Desktop: hover
    step.addEventListener("mouseenter", () => {
      if (!isTouch()) open(step);
    });
    step.addEventListener("mouseleave", () => {
      if (!isTouch()) close(step);
    });

    // Touch: click/tap
    step.addEventListener("click", () => {
      if (isTouch()) toggle(step);
    });

    // Keyboard: Enter / Space always works
    step.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
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
  const tabNav = document.querySelector(".syllabus-tabs-nav");
  const tabs = document.querySelectorAll(".syl-tab");
  const panels = document.querySelectorAll(".syl-panel");
  if (!tabs.length) return;

  function buildSyllabusAccordions() {
    const MIN_HEADING_COUNT = 2;
    const MIN_TOPIC_COUNT = 8;
    const MIN_TEXT_LENGTH = 750;

    panels.forEach((panel) => {
      if (panel.dataset.sylAccordionReady === "true") return;

      const panelLists = panel.querySelector(".syl-panel-lists");
      if (!panelLists) return;

      const headingCount = panel.querySelectorAll(".syl-sub-heading").length;
      const topicCount = panel.querySelectorAll(".syllabus-list li").length;
      const contentLength = panelLists.textContent
        .replace(/\s+/g, " ")
        .trim().length;

      if (
        headingCount < MIN_HEADING_COUNT ||
        (topicCount < MIN_TOPIC_COUNT && contentLength < MIN_TEXT_LENGTH)
      ) {
        return;
      }

      const columnGroups = Array.from(panelLists.children).filter((child) =>
        child.matches("div"),
      );

      if (!columnGroups.length) return;

      const tabId = panel.getAttribute("aria-labelledby");
      const tabLabel = tabId
        ? document.getElementById(tabId)?.textContent.trim() || "Syllabus"
        : "Syllabus";

      const accordionGrid = document.createElement("div");
      accordionGrid.className = "syl-panel-lists syl-panel-accordion";

      const createAccordionItem = (
        columnIndex,
        sectionIndex,
        title,
        contentNodes,
        options = {},
      ) => {
        const item = document.createElement("div");
        item.className = "syl-accordion-item";

        if (options.fullWidth) {
          item.classList.add("syl-panel-static-item");
        }

        const buttonId = `${panel.id}-acc-btn-${columnIndex}-${sectionIndex}`;
        const contentId = `${panel.id}-acc-panel-${columnIndex}-${sectionIndex}`;

        const trigger = document.createElement("button");
        trigger.type = "button";
        trigger.className = "syl-accordion-trigger";
        trigger.id = buttonId;
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", contentId);

        const headingWrap = document.createElement("span");
        headingWrap.className = "syl-accordion-heading";

        const titleWrap = document.createElement("span");
        titleWrap.className = "syl-accordion-title";
        titleWrap.textContent = title;

        const chevron = document.createElement("i");
        chevron.className = "fa-solid fa-chevron-down syl-accordion-chevron";

        headingWrap.append(titleWrap);
        trigger.append(headingWrap, chevron);

        const panelBody = document.createElement("div");
        panelBody.className = "syl-accordion-panel";
        panelBody.id = contentId;
        panelBody.setAttribute("role", "region");
        panelBody.setAttribute("aria-labelledby", buttonId);
        panelBody.setAttribute(
          "aria-hidden",
          String(!Boolean(options.openByDefault)),
        );

        const panelInner = document.createElement("div");
        panelInner.className = "syl-accordion-panel-inner";

        if (options.openByDefault) {
          item.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
        }

        if (options.fullWidth) {
          panelInner.classList.add("syl-accordion-panel-inner-static");
        }

        contentNodes.forEach((node) => {
          panelInner.appendChild(node.cloneNode(true));
        });

        panelBody.appendChild(panelInner);

        const toggle = () => {
          const isOpen = item.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", String(isOpen));
          panelBody.setAttribute("aria-hidden", String(!isOpen));
        };

        trigger.addEventListener("click", toggle);

        item.append(trigger, panelBody);
        return item;
      };

      const isCompactPanel =
        headingCount < MIN_HEADING_COUNT ||
        (topicCount < MIN_TOPIC_COUNT && contentLength < MIN_TEXT_LENGTH);

      if (isCompactPanel) {
        const staticItem = createAccordionItem(0, 0, tabLabel, [panelLists], {
          openByDefault: true,
          fullWidth: true,
        });
        accordionGrid.appendChild(staticItem);
        panelLists.replaceWith(accordionGrid);
        panel.dataset.sylAccordionReady = "true";
        return;
      }

      columnGroups.forEach((column, columnIndex) => {
        const accordionColumn = document.createElement("div");
        accordionColumn.className = "syl-accordion-column";

        const children = Array.from(column.children);
        let currentTitle = "";
        let currentContent = [];

        const flushSection = (sectionIndex) => {
          if (!currentTitle || !currentContent.length) return;
          accordionColumn.appendChild(
            createAccordionItem(
              columnIndex,
              sectionIndex,
              currentTitle,
              currentContent,
            ),
          );
          currentTitle = "";
          currentContent = [];
        };

        let sectionIndex = 0;
        children.forEach((child) => {
          if (child.classList.contains("syl-sub-heading")) {
            flushSection(sectionIndex);
            currentTitle = child.textContent.trim();
            sectionIndex += 1;
            return;
          }

          if (currentTitle) {
            currentContent.push(child);
          }
        });

        flushSection(sectionIndex);

        if (accordionColumn.children.length) {
          accordionGrid.appendChild(accordionColumn);
        }
      });

      if (!accordionGrid.children.length) return;

      panelLists.replaceWith(accordionGrid);
      panel.dataset.sylAccordionReady = "true";
    });
  }

  function syncTabNavScrollState() {
    if (!tabNav) return;
    const isOverflowing = tabNav.scrollWidth > tabNav.clientWidth + 1;
    tabNav.classList.toggle("is-overflowing", isOverflowing);
    tabNav.scrollLeft = 0;
  }

  function activateTab(tab) {
    const target = tab.dataset.tab;

    tabs.forEach((t) => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
      t.setAttribute("tabindex", "-1");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    tab.setAttribute("tabindex", "0");

    panels.forEach((p) => {
      p.classList.remove("active", "entering");
    });
    const panel = document.getElementById(`syl-panel-${target}`);
    if (panel) {
      panel.classList.add("active");
      void panel.offsetWidth; // force reflow to restart animation
      panel.classList.add("entering");
    }
  }

  tabs.forEach((tab, idx) => {
    tab.setAttribute("tabindex", idx === 0 ? "0" : "-1");
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (e) => {
      const arr = Array.from(tabs);
      const i = arr.indexOf(tab);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = arr[(i + 1) % arr.length];
        next.focus();
        activateTab(next);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = arr[(i - 1 + arr.length) % arr.length];
        prev.focus();
        activateTab(prev);
      } else if (e.key === "Home") {
        e.preventDefault();
        arr[0].focus();
        activateTab(arr[0]);
      } else if (e.key === "End") {
        e.preventDefault();
        arr[arr.length - 1].focus();
        activateTab(arr[arr.length - 1]);
      }
    });
  });

  buildSyllabusAccordions();

  // Trigger entrance animation on first panel
  const firstPanel = document.querySelector(".syl-panel.active");
  if (firstPanel) {
    void firstPanel.offsetWidth;
    firstPanel.classList.add("entering");
  }

  syncTabNavScrollState();
  window.addEventListener("load", syncTabNavScrollState, { once: true });
  window.addEventListener("resize", syncTabNavScrollState);
}

// ===========================================
// PREMIUM INTERACTION: Age Explorer Accordion
// Only handles standalone instances (not in vcarousel)
// ===========================================
function initAgeExplorer() {
  // Skip vcarousel-tracks — handled inside initVerticalCarousels()
  const standalone = document.getElementById("age-explorer");
  if (!standalone) return;
  const cards = standalone.querySelectorAll(".age-explorer-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    const front = card.querySelector(".age-explorer-front");
    if (!front) return;
    front.addEventListener("click", () => {
      const isExpanded = card.classList.contains("expanded");
      cards.forEach((c) => c.classList.remove("expanded"));
      if (!isExpanded) card.classList.add("expanded");
    });
  });
}

// ===========================================
// PREMIUM: Vertical Carousels (Eligibility + Age Relaxation)
// Independent auto-scroll, keyboard, wheel, touch, expand-pause
// ===========================================
function initVerticalCarousels() {
  document.querySelectorAll(".vcarousel-viewport").forEach((viewport) => {
    const track = viewport.querySelector(".vcarousel-track");
    const dotsContainer = viewport.querySelector(".vcarousel-dots");
    if (!track) return;

    const cards = Array.from(track.children);
    const totalCards = cards.length;
    if (totalCards === 0) return;
    const visibleCount = 2;
    const autoplayDelay = parseInt(viewport.dataset.autoplay) || 8000;
    const transitionDuration = "1s cubic-bezier(0.25, 1, 0.5, 1)";

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
      const offset =
        currentSlide * (cardHeight * visibleCount + gap * visibleCount);
      track.style.transition = smooth
        ? `transform ${transitionDuration}`
        : "none";
      track.style.transform = `translateY(-${offset}px)`;
      updateDots();
      updateActiveCards();
    }

    function next() {
      goToSlide(currentSlide + 1);
    }
    function prev() {
      goToSlide(currentSlide - 1);
    }

    function updateActiveCards() {
      cards.forEach((card, i) => {
        card.classList.remove("is-active");
        const startIdx = currentSlide * visibleCount;
        if (i >= startIdx && i < startIdx + visibleCount) {
          card.classList.add("is-active");
        }
      });
    }

    // --- Dots ---
    if (dotsContainer) {
      dotsContainer.innerHTML = ""; // clear any stale dots from prior init
      dotsContainer.classList.add("vertical-dots");
      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement("div");
        dot.className = "vdot" + (i === 0 ? " active" : "");
        dot.dataset.index = i;
        dot.addEventListener("click", () => {
          goToSlide(i);
          resetAutoplay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.querySelectorAll(".vdot").forEach((d, i) => {
        d.classList.toggle("active", i === currentSlide);
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
    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // --- Hover pause (only this column) ---
    viewport.addEventListener("mouseenter", () => {
      isPaused = true;
    });
    viewport.addEventListener("mouseleave", () => {
      isPaused = false;
    });

    // --- Mouse wheel with debounce (only this column) ---
    viewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (wheelLocked) return;
        wheelLocked = true;
        if (e.deltaY > 0) next();
        else prev();
        resetAutoplay();
        setTimeout(() => {
          wheelLocked = false;
        }, 900);
      },
      { passive: false },
    );

    // --- Touch swipe (only this column) ---
    let touchStartY = 0;
    viewport.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.touches[0].clientY;
        isPaused = true;
      },
      { passive: true },
    );

    viewport.addEventListener(
      "touchend",
      (e) => {
        const deltaY = touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(deltaY) > 30) {
          if (deltaY > 0) next();
          else prev();
        }
        isPaused = false;
        resetAutoplay();
      },
      { passive: true },
    );

    // --- Keyboard navigation (only when focused) ---
    viewport.setAttribute("tabindex", "0");
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        prev();
        resetAutoplay();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        next();
        resetAutoplay();
      }
    });

    // --- Expand/collapse pause (age explorer cards) ---
    const ageCards = track.querySelectorAll(".age-explorer-card");
    ageCards.forEach((card) => {
      const front = card.querySelector(".age-explorer-front");
      if (!front) return;
      const newFront = front.cloneNode(true);
      front.parentNode.replaceChild(newFront, front);
      newFront.addEventListener("click", () => {
        const isExpanded = card.classList.contains("expanded");
        ageCards.forEach((c) => c.classList.remove("expanded"));
        if (!isExpanded) {
          card.classList.add("expanded");
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
  const section = document.querySelector(".journey-timeline-section");
  if (!section) return;

  const milestones = Array.from(section.querySelectorAll(".journey-milestone"));
  const cards = Array.from(section.querySelectorAll(".journey-card"));
  const progressFill = document.getElementById("journey-progress-fill");
  const counterCurrent = document.getElementById("journey-current");
  const prevBtn = document.getElementById("journey-prev");
  const nextBtn = document.getElementById("journey-next");
  if (!milestones.length || !cards.length) return;

  const totalSteps = milestones.length;
  let currentStep = -1; // -1 forces first activate(0) to run fully

  function activate(index) {
    if (index < 0 || index >= totalSteps || index === currentStep) return;
    currentStep = index;

    // Milestones
    milestones.forEach((m, i) => m.classList.toggle("active", i === index));

    // Exit all cards, then force a reflow so the entrance transition fires from opacity:0
    cards.forEach((c) => c.classList.remove("active"));
    const nextCard = cards[index];
    if (nextCard) {
      void nextCard.offsetWidth; // flush style so transition starts from hidden state
      nextCard.classList.add("active");
    }

    // Progress bar
    const pct = totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 100;
    if (progressFill) progressFill.style.width = pct + "%";

    // Counter
    if (counterCurrent) counterCurrent.textContent = index + 1;

    // Button states
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === totalSteps - 1;

    // Scroll milestone into view only on small screens
    if (milestones[index] && window.innerWidth <= 768) {
      milestones[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }

  // Milestone clicks
  milestones.forEach((m, i) => m.addEventListener("click", () => activate(i)));

  // Nav buttons
  if (prevBtn)
    prevBtn.addEventListener("click", () => activate(currentStep - 1));
  if (nextBtn)
    nextBtn.addEventListener("click", () => activate(currentStep + 1));

  // Keyboard
  section.setAttribute("tabindex", "0");
  section.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      activate(currentStep - 1);
    }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      activate(currentStep + 1);
    }
  });

  // Swipe on roadmap
  const roadmap = section.querySelector(".journey-roadmap");
  if (roadmap) {
    let touchStartX = 0;
    roadmap.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    roadmap.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40)
          activate(delta < 0 ? currentStep + 1 : currentStep - 1);
      },
      { passive: true },
    );
  }

  // Swipe on detail cards area too
  const detailCards = section.querySelector(".journey-detail-cards");
  if (detailCards) {
    let touchStartX = 0;
    detailCards.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
      },
      { passive: true },
    );
    detailCards.addEventListener(
      "touchend",
      (e) => {
        const delta = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40)
          activate(delta < 0 ? currentStep + 1 : currentStep - 1);
      },
      { passive: true },
    );
  }

  activate(0);
}

// 2. Faculty Data Pool (Replaces Alumni Pool for Fade-in Grid)
const facultyPool = [
  // Batch 1
  {
    name: "Shine Stephen",
    role: "Former AIIMS Faculty | UGC NET | MHA | PGDHSR",
    badge: "Assistant Professor | PGIMER MSc (N) | PhD Scholar",
    icon: '<i class="fa-solid fa-trophy"></i>',
    img: "/assets/images/mentors/SHINE.png",
    quals: [
      "Asst. Professor – Govt. Nursing College (on leave)",
      "Former Faculty, College of Nursing AIIMS",
      "MSc (N) – PGIMER | MHA | PGDHSR | UGC NET",
      "PhD Scholar (INC-WHO)",
      "9th Rank – KPSC Asst. Professor Exam (2024)",
      "19th Rank – Nursing Tutor KPSC (2023)",
    ],
  },
  {
    name: "Nayana Shaji",
    role: "Distinction Holder | Kerala & Central Exam Ranker",
    badge: "M.Pharm Pharmacology | GPAT Rank Holder",
    icon: '<i class="fa-solid fa-award"></i>',
    img: "/assets/images/mentors/NAYANA.jpeg",
    quals: [
      "M.Pharm Pharmacology",
      "Distinction Holder",
      "GPAT Rank Holder",
      "Kerala & Central Exams Rank Holder",
    ],
  },
  {
    name: "Vidhu R Vijayan",
    role: "NCLEX RN Passed",
    badge: "MSc Nursing (Orthopedic)",
    icon: '<i class="fa-solid fa-stethoscope"></i>',
    img: "/assets/images/mentors/VIDHU.JPG.jpeg",
    quals: [
      "MSc. Nursing (Orthopedic)",
      "NCLEX RN Passed",
    ],
  },
  // Batch 2
  {
    name: "Honey Mol P.V",
    role: "Kerala PSC Rank Holder",
    badge: "MSc Molecular Biology | Distinction Holder",
    icon: '<i class="fa-solid fa-flask"></i>',
    img: "/assets/images/mentors/HONEY.JPG.jpeg",
    quals: [
      "MSc Molecular Biology",
      "Distinction Holder",
      "Kerala PSC Rank Holder",
    ],
  },
  {
    name: "Sreelakshmi E.M",
    role: "Kerala PSC Rank Holder",
    badge: "MSc Microbiology | 2nd Rank Holder",
    icon: '<i class="fa-solid fa-microscope"></i>',
    img: "/assets/images/mentors/SREELEKSHMI.jpeg",
    quals: [
      "MSc Microbiology",
      "2nd Rank Holder",
      "Kerala PSC Rank Holder",
    ],
  },
  {
    name: "Arathy Surendran",
    role: "Kerala PSC Rank Holder",
    badge: "MSc Nursing (Pediatrics) – KUHS",
    icon: '<i class="fa-solid fa-child"></i>',
    img: "/assets/images/mentors/ARATHY.JPG.jpeg",
    quals: [
      "MSc Nursing (Pediatrics) – KUHS",
      "Kerala PSC Rank Holder",
    ],
  },
  // Batch 3
  {
    name: "Aparna T.M",
    role: "1st Rank Holder – M.Pharm, KUHS",
    badge: "M.Pharm – KUHS | 1st Rank Holder",
    icon: '<i class="fa-solid fa-pills"></i>',
    img: "/assets/images/mentors/APARNA.jpeg",
    quals: [
      "M.Pharm – KUHS",
      "1st Rank Holder",
    ],
  },
  {
    name: "Dr. Manjima G.S",
    role: "International Scholar | MSc Pharmacology (UK) – Commendation",
    badge: "Doctor of Pharmacy | MSc Pharmacology (UK)",
    icon: '<i class="fa-solid fa-graduation-cap"></i>',
    img: "/assets/images/mentors/MANJIMA.jpeg",
    quals: [
      "Doctor of Pharmacy",
      "MSc Pharmacology (UK) – Commendation",
      "International Scholarship Awardee",
    ],
  },
  {
    name: "Jesna Prasad",
    role: "German A1–B2 Qualified | Nursing Background",
    badge: "German B1–B2 Certified | BSc Nursing",
    icon: '<i class="fa-solid fa-language"></i>',
    img: "/assets/images/mentors/JESNA.JPG.jpeg",
    quals: [
      "BSc Nursing",
      "German A1-A2 Certified",
      "German B1-B2 Certified",
    ],
  },
  // Batch 4
  {
    name: "Jeethu Paul",
    role: "Kerala PSC Rank Holder",
    badge: "MSc Nursing (Pediatric)",
    icon: '<i class="fa-solid fa-heart-pulse"></i>',
    img: "/assets/images/mentors/JEETHU.JPG.jpeg",
    quals: [
      "MSc Nursing (Pediatric)",
      "Kerala PSC Rank Holder",
    ],
  },
  {
    name: "Shine Stephen",
    role: "Former AIIMS Faculty | UGC NET | MHA | PGDHSR",
    badge: "Assistant Professor | PGIMER MSc (N) | PhD Scholar",
    icon: '<i class="fa-solid fa-trophy"></i>',
    img: "/assets/images/mentors/SHINE.png",
    quals: [
      "Asst. Professor – Govt. Nursing College (on leave)",
      "Former Faculty, College of Nursing AIIMS",
      "MSc (N) – PGIMER | MHA | PGDHSR | UGC NET",
      "PhD Scholar (INC-WHO)",
      "9th Rank – KPSC Asst. Professor Exam (2024)",
      "19th Rank – Nursing Tutor KPSC (2023)",
    ],
  },
  {
    name: "Nayana Shaji",
    role: "Distinction Holder | Kerala & Central Exam Ranker",
    badge: "M.Pharm Pharmacology | GPAT Rank Holder",
    icon: '<i class="fa-solid fa-award"></i>',
    img: "/assets/images/mentors/NAYANA.jpeg",
    quals: [
      "M.Pharm Pharmacology",
      "Distinction Holder",
      "GPAT Rank Holder",
      "Kerala & Central Exams Rank Holder",
    ],
  },
];

let currentFacultyBatch = 0; // Tracks which group of 3 is currently displayed

// --- PERFORMANCE FIX: Shadowing DOM Nodes instead of arbitrary innerHTML insertion ---
// And decoupling Parallax animation layer from Fade animation layer
const activeWrappers = document.querySelectorAll(".alumni-card-wrapper");
const facultyDOMNodes = Array.from(activeWrappers).map((wrapper) => {
  return {
    wrapper: wrapper,
    cycleNode: wrapper.querySelector(".alumni-cycle-animator") || wrapper,
    img: wrapper.querySelector("img"),
    badge: wrapper.querySelector(".rank-badge"),
    name:
      wrapper.querySelector(".alumni-text-overlay h3") ||
      wrapper.querySelector("h3"),
    role: wrapper.querySelector(".exam-name"),
    descContainer: wrapper.querySelector(".placement-dest"),
  };
});

function buildQualList(quals) {
  if (!quals || !quals.length) return "";
  return '<ul class="fac-desc-list">' +
    quals.map(function(q) { return "<li>" + q + "</li>"; }).join("") +
    "</ul>";
}

function updateFacultyDots() {
  var dots = document.querySelectorAll(".fac-batch-dot");
  if (!dots.length) return;
  var start = currentFacultyBatch * 3;
  var end   = Math.min(start + 3, 10);
  dots.forEach(function(dot, i) {
    dot.classList.toggle("fac-batch-dot-active", i >= start && i < end);
  });
}

function initFacultyDots() {
  var grid = document.querySelector(".alumni-showcase-grid");
  if (!grid) return;

  var section = document.createElement("div");
  section.className = "fac-dots-section";

  // 10 dots — one per unique faculty member
  var dotsEl = document.createElement("div");
  dotsEl.className = "fac-batch-dots";
  for (var i = 0; i < 10; i++) {
    var dot = document.createElement("span");
    dot.className = "fac-batch-dot" + (i < 3 ? " fac-batch-dot-active" : "");
    dotsEl.appendChild(dot);
  }
  section.appendChild(dotsEl);

  // Meet All Mentors link
  var ctaWrap = document.createElement("div");
  ctaWrap.innerHTML =
    '<a href="/faculties.html" class="btn-meet-mentors">' +
      '<i class="fa-solid fa-users"></i> Meet All Mentors' +
    '</a>';
  section.appendChild(ctaWrap);

  grid.insertAdjacentElement("afterend", section);
}

function bindTiltPhysics(nodeInfo) {
  const wrapper = nodeInfo.wrapper;
  const card = wrapper.querySelector(".prismatic-card");
  if (!card) return;

  let rect, centerX, centerY;
  let activeRAF = null;

  wrapper.addEventListener("mouseenter", () => {
    rect = wrapper.getBoundingClientRect();
    centerX = rect.width / 2;
    centerY = rect.height / 2;
    card.style.transition = "none";
  });

  wrapper.addEventListener("mousemove", (e) => {
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    // Cancel unexecuted frames to prevent bottlenecking
    if (activeRAF) window.cancelAnimationFrame(activeRAF);

    activeRAF = window.requestAnimationFrame(() => {
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  });

  wrapper.addEventListener("mouseleave", () => {
    if (activeRAF) window.cancelAnimationFrame(activeRAF);
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

// Initialize first batch description as qualification list on page load
(function initFacultyDescriptions() {
  var initialBatch = facultyPool.slice(0, 3);
  facultyDOMNodes.forEach(function(node, i) {
    var fac = initialBatch[i];
    if (fac && node.descContainer) {
      node.descContainer.innerHTML = buildQualList(fac.quals);
    }
  });
  initFacultyDots();
}());

// Pre-load all images so no pop-in happens during cycle
facultyPool.forEach((fac) => {
  if (fac.img) {
    const img = new Image();
    img.src = fac.img;
  }
});

// 3. Cycling Engine (Zero DOM Reflow Edition)
function cycleFaculty() {
  const totalBatches = Math.ceil(facultyPool.length / 3);
  currentFacultyBatch = (currentFacultyBatch + 1) % totalBatches;
  updateFacultyDots();
  const batch = facultyPool.slice(
    currentFacultyBatch * 3,
    currentFacultyBatch * 3 + 3,
  );

  // Phase 1: Fade Out + Jump Up (staggered cascade strictly on decopled inner node)
  facultyDOMNodes.forEach((node, i) => {
    setTimeout(() => {
      node.cycleNode.classList.add("cycling-out");
    }, i * 150);
  });

  // Phase 2: Direct Text Modification safely masked by CSS invisibility
  setTimeout(() => {
    facultyDOMNodes.forEach((node, i) => {
      const fac = batch[i];
      if (fac) {
        if (node.img) {
          node.img.src = fac.img;
          node.img.alt = fac.name;
        }
        if (node.badge) node.badge.textContent = fac.badge;
        if (node.name) node.name.textContent = fac.name;
        if (node.role) node.role.textContent = fac.role;
        if (node.descContainer) node.descContainer.innerHTML = buildQualList(fac.quals);
      }

      node.cycleNode.classList.remove("cycling-out");
      node.cycleNode.classList.add("cycling-in");
    });

    // Phase 3: Jump Reveal from Below
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        facultyDOMNodes.forEach((node, i) => {
          setTimeout(() => {
            node.cycleNode.classList.remove("cycling-in");
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
  y: 40,
  opacity: 0,
  filter: "blur(10px)",
  duration: 1.2,
  stagger: 0.15,
  ease: "power3.out",
  clearProps: "filter,transform",
});

/* ==========================================================
   VFC TILT 3D — Vital Feature Card 3D Hover
   ========================================================== */
(function vfcTilt3D() {
  "use strict";

  function init() {
    var card = document.getElementById("vital-card");
    if (!card) return;

    /* â”€â”€ Perspective container â”€â”€ */
    var wrapper = card.closest(".course-vital-wrapper");
    if (wrapper) {
      wrapper.style.perspective = "1200px";
      wrapper.style.perspectiveOrigin = "50% 40%";
    }
    card.style.transformStyle = "preserve-3d";
    card.style.willChange = "transform";
    card.style.transition = "none";

    /* â”€â”€ Enable preserve-3d on the feature card chain â”€â”€ */
    [".vfc-grid-wrap", ".vfc-slide", ".vfc-card-grid"].forEach(function (sel) {
      var el = card.querySelector(sel);
      if (el) {
        el.style.transformStyle = "preserve-3d";
      }
    });

    /* â”€â”€ Moving light reflection overlay â”€â”€ */
    var light = document.createElement("div");
    light.style.cssText = [
      "position:absolute",
      "inset:0",
      "border-radius:inherit",
      "pointer-events:none",
      "z-index:200",
      "opacity:0",
      "transition:opacity 0.35s ease",
      "background:radial-gradient(circle at 50% 50%,rgba(255,255,255,0.14) 0%,rgba(255,255,255,0.05) 38%,transparent 60%)",
      "mix-blend-mode:overlay",
      "will-change:background,opacity",
    ].join(";");
    card.appendChild(light);

    /* â”€â”€ Layer parallax config â”€â”€ */
    var LAYER_DEFS = [
      { sel: ".vfc-header", factor: 0.1 },
      { sel: ".vfc-stats", factor: 0.18 },
      { sel: ".vfc-grid-wrap", factor: 0.28 },
      { sel: ".vfc-footer", factor: 0.36 },
    ];
    var MAX_PARALLAX = 11;

    var layers = [];
    LAYER_DEFS.forEach(function (cfg) {
      var el = card.querySelector(cfg.sel);
      if (el) {
        el.style.willChange = "transform";
        el.style.transition = "none";
        layers.push({ el: el, factor: cfg.factor });
      }
    });

    /* â”€â”€ Animation state â”€â”€ */
    var isHovered = false;
    var mouseNX = 0,
      mouseNY = 0;
    var curRX = 0,
      curRY = 0;
    var curTX = 0,
      curTY = 0;
    var curLX = 0,
      curLY = 0;
    var tgtRX = 0,
      tgtRY = 0;
    var tgtTX = 0,
      tgtTY = 0;
    var rafId = null;

    var LERP_R = 0.075;
    var LERP_T = 0.055;
    var LERP_L = 0.065;
    var MAX_ROT = 6;
    var MAX_FLT = 6;
    var EPS = 0.005;

    function lerp(c, t, f) {
      return c + (t - c) * f;
    }

    /* â”€â”€ rAF loop â”€â”€ */
    function animate() {
      curRX = lerp(curRX, tgtRX, LERP_R);
      curRY = lerp(curRY, tgtRY, LERP_R);
      curTX = lerp(curTX, tgtTX, LERP_T);
      curTY = lerp(curTY, tgtTY, LERP_T);
      curLX = lerp(curLX, mouseNX, LERP_L);
      curLY = lerp(curLY, mouseNY, LERP_L);

      card.style.transform =
        "rotateX(" +
        curRX.toFixed(3) +
        "deg) " +
        "rotateY(" +
        curRY.toFixed(3) +
        "deg) " +
        "translateX(" +
        curTX.toFixed(3) +
        "px) " +
        "translateY(" +
        curTY.toFixed(3) +
        "px)";

      layers.forEach(function (l) {
        var tx = curLX * MAX_PARALLAX * l.factor;
        var ty = curLY * MAX_PARALLAX * l.factor;
        l.el.style.transform =
          "translateX(" +
          tx.toFixed(3) +
          "px) translateY(" +
          ty.toFixed(3) +
          "px)";
      });

      var settled =
        Math.abs(curRX - tgtRX) < EPS &&
        Math.abs(curRY - tgtRY) < EPS &&
        Math.abs(curTX - tgtTX) < EPS &&
        Math.abs(curTY - tgtTY) < EPS &&
        Math.abs(curLX - mouseNX) < EPS &&
        Math.abs(curLY - mouseNY) < EPS;

      if (!settled || isHovered) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
        if (!isHovered) {
          card.style.transform =
            "rotateX(0deg) rotateY(0deg) translateX(0) translateY(0)";
          layers.forEach(function (l) {
            l.el.style.transform = "translateX(0) translateY(0)";
          });
        }
      }
    }

    /* â”€â”€ mouseenter â”€â”€ */
    card.addEventListener("mouseenter", function () {
      isHovered = true;
      light.style.opacity = "1";
      card.style.transition = "none";
      layers.forEach(function (l) {
        l.el.style.transition = "none";
      });
      if (!rafId) rafId = requestAnimationFrame(animate);
    });

    /* â”€â”€ mousemove â”€â”€ */
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      mouseNX = x * 2 - 1;
      mouseNY = y * 2 - 1;

      tgtRY = mouseNX * MAX_ROT;
      tgtRX = -mouseNY * MAX_ROT;
      tgtTX = mouseNX * MAX_FLT * 0.45;
      tgtTY = mouseNY * MAX_FLT * 0.45;

      light.style.background =
        "radial-gradient(circle at " +
        (x * 100).toFixed(1) +
        "% " +
        (y * 100).toFixed(1) +
        "%, " +
        "rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 38%, transparent 60%)";
    });

    /* â”€â”€ mouseleave â”€â”€ */
    card.addEventListener("mouseleave", function () {
      isHovered = false;
      mouseNX = 0;
      mouseNY = 0;
      tgtRX = 0;
      tgtRY = 0;
      tgtTX = 0;
      tgtTY = 0;
      light.style.opacity = "0";

      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      /* Smooth CSS spring-back */
      card.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
      card.style.transform =
        "rotateX(0deg) rotateY(0deg) translateX(0) translateY(0)";

      layers.forEach(function (l) {
        l.el.style.transition = "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
        l.el.style.transform = "translateX(0) translateY(0)";
      });

      /* Reset any active feature-box lift */
      card.querySelectorAll(".vfc-card").forEach(function (vc) {
        vc.style.transition =
          "transform 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease, opacity 0.45s ease, background 0.45s ease";
        vc.style.transform = "translateZ(0) translateY(0) scale(1)";
        vc.style.boxShadow = "";
        vc.style.opacity = "1";
        vc.style.background = "";
      });

      setTimeout(function () {
        if (!isHovered) {
          card.style.transition = "none";
          curRX = 0;
          curRY = 0;
          curTX = 0;
          curTY = 0;
          curLX = 0;
          curLY = 0;
          layers.forEach(function (l) {
            l.el.style.transition = "none";
          });
        }
      }, 660);
    });

    /* â”€â”€ Feature-box 3D lift (translateZ + Y + scale) â”€â”€ */
    var allVfcCards = Array.prototype.slice.call(
      card.querySelectorAll(".vfc-card"),
    );
    allVfcCards.forEach(function (vc) {
      vc.style.willChange = "transform, box-shadow, opacity";

      vc.addEventListener("mouseenter", function () {
        var grid = vc.closest(".vfc-card-grid");
        var siblings = grid
          ? Array.prototype.slice.call(grid.querySelectorAll(".vfc-card"))
          : [vc];

        siblings.forEach(function (other) {
          if (other === vc) {
            other.style.transition =
              "transform 0.26s cubic-bezier(0.22,1,0.36,1), box-shadow 0.26s ease, opacity 0.26s ease, background 0.26s ease";
            other.style.transform =
              "translateZ(24px) translateY(-5px) scale(1.03)";
            other.style.boxShadow =
              "0 20px 48px rgba(0,0,0,0.4), 0 0 22px rgba(6,182,212,0.22)";
            other.style.background = "rgba(255,255,255,0.12)";
            other.style.opacity = "1";
          } else {
            other.style.transition =
              "transform 0.26s cubic-bezier(0.22,1,0.36,1), opacity 0.26s ease";
            other.style.transform =
              "translateZ(-7px) translateY(2px) scale(0.972)";
            other.style.opacity = "0.65";
          }
        });
      });

      vc.addEventListener("mouseleave", function () {
        var grid = vc.closest(".vfc-card-grid");
        var siblings = grid
          ? Array.prototype.slice.call(grid.querySelectorAll(".vfc-card"))
          : [vc];

        siblings.forEach(function (other) {
          other.style.transition =
            "transform 0.42s cubic-bezier(0.22,1,0.36,1), box-shadow 0.42s ease, opacity 0.42s ease, background 0.42s ease";
          other.style.transform = "translateZ(0) translateY(0) scale(1)";
          other.style.boxShadow = "";
          other.style.background = "";
          other.style.opacity = "1";
        });
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ==========================================================
   PREMIUM APP SHOWCASE (PAS) — Initialization
   ========================================================== */
(function pasInit() {
  "use strict";

  var CIRCUMFERENCE = 207.3;
  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* 1. SCREEN CAROUSEL */
  var slides = Array.prototype.slice.call(
    document.querySelectorAll(".pas-slide"),
  );
  var currentSlide = 0;
  var carouselTimer = null;
  var phoneHovered = false;

  function goToSlide(idx) {
    var prev = currentSlide;
    currentSlide = ((idx % slides.length) + slides.length) % slides.length;
    if (prev === currentSlide) return;

    slides[prev].classList.add("pas-slide-exit");
    slides[prev].classList.remove("pas-slide-active");

    setTimeout(function () {
      slides[prev].classList.remove("pas-slide-exit");
    }, 520);

    slides[currentSlide].classList.add("pas-slide-active");
  }

  function startCarousel() {
    clearInterval(carouselTimer);
    carouselTimer = setInterval(function () {
      if (!phoneHovered) goToSlide(currentSlide + 1);
    }, 3500);
  }

  function goToScreenByKey(screenKey) {
    var idx = slides.findIndex(function (s) {
      return s.getAttribute("data-screen") === screenKey;
    });
    if (idx !== -1 && idx !== currentSlide) {
      goToSlide(idx);
      clearInterval(carouselTimer);
      startCarousel();
    }
  }

  /* 2. NOTIFICATION QUEUE */
  var notifications = [
    {
      icon: "fa-check-circle",
      title: "Mock Test Completed!",
      sub: "Score: 178/200 Â· Rank Top 5%",
      color: "#10b981",
    },
    {
      icon: "fa-arrow-trend-up",
      title: "Your Rank Improved!",
      sub: "Up 24 positions â†’ AIR 42",
      color: "#06b6d4",
    },
    {
      icon: "fa-bell",
      title: "New AIIMS NORCET Notification",
      sub: "Application window opens tomorrow",
      color: "#c026d3",
    },
    {
      icon: "fa-video",
      title: "Live Class Starts in 15 Minutes",
      sub: "Pharmacology Â· Prof. Shine Stephen",
      color: "#f59e0b",
    },
  ];
  var notifIdx = 0;
  var notifBadge = document.getElementById("pasNotifBadge");
  var notifTitle = document.getElementById("pasNotifTitle");
  var notifSub = document.getElementById("pasNotifSub");
  var notifIcon = document.getElementById("pasNotifIcon");

  function showNotif() {
    if (!notifBadge) return;
    var n = notifications[notifIdx % notifications.length];
    notifIdx++;

    /* Update content */
    notifTitle.textContent = n.title;
    notifSub.textContent = n.sub;
    notifIcon.className = "fa-solid " + n.icon;
    notifIcon.parentElement.style.background =
      "linear-gradient(135deg, " + n.color + ", " + n.color + "88)";

    /* Slide in */
    notifBadge.classList.add("pas-notif-visible");

    /* Fade out after 2.4s */
    setTimeout(function () {
      notifBadge.classList.remove("pas-notif-visible");
    }, 2400);
  }

  function scheduleNotifs() {
    setTimeout(function loop() {
      showNotif();
      setTimeout(loop, 7000 + Math.random() * 3000);
    }, 2000);
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           3. 3D TILT (phone frame only, not wrapper)
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  var phoneScene = document.getElementById("pasPhoneScene");
  var phoneWrapper = document.getElementById("pasPhoneWrapper");
  var phoneFrame = document.getElementById("pasPhoneFrame");
  var phoneShadow = document.getElementById("pasPhoneShadow");

  if (phoneScene && phoneFrame && !prefersReduced) {
    var tgtRX = 0,
      tgtRY = 0;
    var curRX = 0,
      curRY = 0;
    var tiltRaf = null;

    function tiltTick() {
      curRX += (tgtRX - curRX) * 0.08;
      curRY += (tgtRY - curRY) * 0.08;

      phoneFrame.style.transform =
        "rotateX(" +
        curRX.toFixed(3) +
        "deg) rotateY(" +
        curRY.toFixed(3) +
        "deg)";

      /* Shadow shifts opposite to tilt */
      if (phoneShadow) {
        var sx = 50 + curRY * 1.5;
        var sy = 50 + curRX * 1.5;
        phoneShadow.style.transform =
          "translateX(" + (curRY * 2).toFixed(1) + "px)";
      }

      var settled =
        Math.abs(curRX - tgtRX) < 0.02 && Math.abs(curRY - tgtRY) < 0.02;
      if (!settled || phoneHovered) {
        tiltRaf = requestAnimationFrame(tiltTick);
      } else {
        tiltRaf = null;
      }
    }

    phoneScene.addEventListener("mousemove", function (e) {
      var rect = phoneScene.getBoundingClientRect();
      var nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      var ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      tgtRY = nx * 10;
      tgtRX = -ny * 8;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltTick);
    });

    phoneScene.addEventListener("mouseleave", function () {
      phoneHovered = false;
      tgtRX = 0;
      tgtRY = 0;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(tiltTick);

      /* Spring back phone frame */
      phoneFrame.style.transition =
        "transform 0.6s cubic-bezier(0.22,1,0.36,1)";
      setTimeout(function () {
        phoneFrame.style.transition = "";
      }, 640);
    });

    phoneScene.addEventListener("mouseenter", function () {
      phoneHovered = true;
    });
  }

  /*  3b. MOUSE EFFECTS: spotlight Â· rim light Â· scale lift */
  (function () {
    if (!phoneScene || !phoneFrame || prefersReduced) return;

    var phoneScreenEl = phoneFrame.querySelector(".pas-screen");

    /*  Spotlight overlay injected into the screen  */
    var spotlight = document.createElement("div");
    spotlight.style.cssText =
      "position:absolute;inset:0;border-radius:44px;" +
      "pointer-events:none;z-index:30;" +
      "opacity:0;transition:opacity 0.4s ease;" +
      "mix-blend-mode:soft-light;" +
      "background:radial-gradient(circle 110px at 50% 50%," +
      "rgba(200,180,255,0.55) 0%,transparent 70%)";
    if (phoneScreenEl) phoneScreenEl.appendChild(spotlight);

    /* â”€â”€ Rim-glow overlay behind the frame â”€â”€ */
    var rimEl = document.createElement("div");
    rimEl.style.cssText =
      "position:absolute;inset:-3px;border-radius:58px;" +
      "pointer-events:none;z-index:-1;" +
      "opacity:0;transition:opacity 0.4s ease;" +
      "background:transparent;" +
      "filter:blur(8px)";
    phoneFrame.style.position = "relative";
    phoneFrame.style.overflow = "visible";
    phoneFrame.insertBefore(rimEl, phoneFrame.firstChild);

    /* â”€â”€ Lerp state â”€â”€ */
    var tSpotX = 50,
      tSpotY = 50;
    var cSpotX = 50,
      cSpotY = 50;
    var tRimX = 0,
      tRimY = 0;
    var cRimX = 0,
      cRimY = 0;
    var efxRaf = null;
    var isOver = false;

    /* base box-shadow tokens */
    var BASE_SHADOW =
      "0 0 0 1px rgba(0,0,0,0.14)," +
      "0 40px 80px rgba(15,23,42,0.28)," +
      "0 14px 36px rgba(91,33,182,0.2)," +
      "0 3px 8px rgba(0,0,0,0.1)";

    function efxTick() {
      var L = 0.1;
      cSpotX += (tSpotX - cSpotX) * L;
      cSpotY += (tSpotY - cSpotY) * L;
      cRimX += (tRimX - cRimX) * L;
      cRimY += (tRimY - cRimY) * L;

      /* spotlight */
      spotlight.style.background =
        "radial-gradient(circle 110px at " +
        cSpotX.toFixed(1) +
        "% " +
        cSpotY.toFixed(1) +
        "%," +
        "rgba(200,180,255,0.55) 0%," +
        "rgba(167,139,250,0.2) 45%," +
        "transparent 70%)";

      /* rim glow â€” directional */
      var mag = Math.sqrt(cRimX * cRimX + cRimY * cRimY);
      var opa = Math.min(mag * 0.65, 0.75).toFixed(2);
      var ox = (cRimX * 10).toFixed(1);
      var oy = (cRimY * 10).toFixed(1);
      phoneFrame.style.boxShadow =
        BASE_SHADOW +
        "," +
        ox +
        "px " +
        oy +
        "px 28px rgba(167,139,250," +
        opa +
        ")," +
        "0 0 48px 4px rgba(139,92,246," +
        (opa * 0.35).toFixed(2) +
        ")";

      var settled =
        Math.abs(cSpotX - tSpotX) < 0.3 &&
        Math.abs(cSpotY - tSpotY) < 0.3 &&
        Math.abs(cRimX - tRimX) < 0.005 &&
        Math.abs(cRimY - tRimY) < 0.005;

      if (!settled || isOver) efxRaf = requestAnimationFrame(efxTick);
      else efxRaf = null;
    }

    /* mousemove â€” update targets */
    phoneScene.addEventListener("mousemove", function (e) {
      var fr = phoneFrame.getBoundingClientRect();
      var nx = (e.clientX - fr.left) / fr.width;
      var ny = (e.clientY - fr.top) / fr.height;

      tSpotX = nx * 100;
      tSpotY = ny * 100;
      tRimX = nx * 2 - 1;
      tRimY = ny * 2 - 1;

      if (!efxRaf) efxRaf = requestAnimationFrame(efxTick);
    });

    /* mouseenter  show effects, scale lift */
    phoneScene.addEventListener("mouseenter", function () {
      isOver = true;
      spotlight.style.opacity = "1";
      rimEl.style.opacity = "1";

      if (phoneWrapper) {
        phoneWrapper.style.transition =
          "transform 0.45s cubic-bezier(0.22,1,0.36,1)";
        phoneWrapper.style.transform = "scale(1.045)";
      }
      if (!efxRaf) efxRaf = requestAnimationFrame(efxTick);
    });

    /* mouseleave â€” hide effects, spring back */
    phoneScene.addEventListener("mouseleave", function () {
      isOver = false;
      spotlight.style.opacity = "0";
      rimEl.style.opacity = "0";
      tRimX = 0;
      tRimY = 0;

      /* restore base shadow smoothly */
      setTimeout(function () {
        if (!isOver) phoneFrame.style.boxShadow = BASE_SHADOW;
      }, 420);

      if (phoneWrapper) {
        phoneWrapper.style.transition =
          "transform 0.55s cubic-bezier(0.22,1,0.36,1)";
        phoneWrapper.style.transform = "";
        setTimeout(function () {
          if (!isOver) phoneWrapper.style.transition = "";
        }, 570);
      }
      if (!efxRaf) efxRaf = requestAnimationFrame(efxTick);
    });
  })();

  /* 4. FEATURE CARD â†’ SWITCH SCREEN */
  var featureCards = Array.prototype.slice.call(
    document.querySelectorAll(".pas-feature-card"),
  );

  featureCards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      var screenKey = card.getAttribute("data-screen");
      featureCards.forEach(function (c) {
        c.classList.remove("pas-card-active");
      });
      card.classList.add("pas-card-active");
      goToScreenByKey(screenKey);
    });
    card.addEventListener("mouseleave", function () {
      card.classList.remove("pas-card-active");
    });
  });

  /* 5. INTERSECTION OBSERVER â€” entrance + stats  */
  var statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    /* Circular SVG progress + counters */
    var progEls = Array.prototype.slice.call(
      document.querySelectorAll(".pas-circle-progress"),
    );
    progEls.forEach(function (el, i) {
      var pct = parseInt(el.getAttribute("data-pct"), 10) || 0;
      var offset = CIRCUMFERENCE * (1 - pct / 100);

      setTimeout(function () {
        el.style.strokeDashoffset = offset;
      }, i * 120);
    });

    /* Number counter */
    var numEls = Array.prototype.slice.call(
      document.querySelectorAll(".pas-circle-num"),
    );
    numEls.forEach(function (el, i) {
      var target = parseInt(el.getAttribute("data-target"), 10) || 0;
      var start = 0;
      var delay = i * 120;
      var dur = prefersReduced ? 0 : 1200;
      var startTs = null;

      setTimeout(function () {
        function step(ts) {
          if (!startTs) startTs = ts;
          var progress = Math.min((ts - startTs) / dur, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        if (dur === 0) {
          el.textContent = target;
        } else requestAnimationFrame(step);
      }, delay);
    });

    /* Stat items fade in */
    var statItems = Array.prototype.slice.call(
      document.querySelectorAll(".pas-stat-item"),
    );
    statItems.forEach(function (item, i) {
      setTimeout(function () {
        item.classList.add("pas-stat-visible");
      }, i * 100);
    });
  }

  function animateEntrance() {
    /* Cards stagger */
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".pas-feature-card"),
    );
    cards.forEach(function (card, i) {
      setTimeout(
        function () {
          card.classList.add("pas-card-visible");
        },
        300 + i * 80,
      );
    });

    /* CTA */
    var cta = document.getElementById("pasCta");
    if (cta)
      setTimeout(function () {
        cta.classList.add("pas-cta-visible");
      }, 600);
  }

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateEntrance();
          animateStats();
          sectionObserver.disconnect();
        }
      });
    },
    { threshold: 0.15 },
  );

  var pasSection = document.querySelector(".pas-section");
  if (pasSection) sectionObserver.observe(pasSection);

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
           6. BOOTSTRAP
        â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  function init() {
    if (!slides.length) return;

    /* Pause float on hover */
    if (phoneWrapper) {
      phoneWrapper.addEventListener("mouseenter", function () {
        phoneHovered = true;
        phoneWrapper.style.animationPlayState = "paused";
        var shadow = document.getElementById("pasPhoneShadow");
        if (shadow) shadow.style.animationPlayState = "paused";
      });
      phoneWrapper.addEventListener("mouseleave", function () {
        phoneHovered = false;
        phoneWrapper.style.animationPlayState = "running";
        var shadow = document.getElementById("pasPhoneShadow");
        if (shadow) shadow.style.animationPlayState = "running";
      });
    }

    startCarousel();
    if (!prefersReduced) scheduleNotifs();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ==========================================================
   VFC CAROUSEL — Vital Feature Card Auto-Slide
   ========================================================== */
(function vfcInit() {
  var DURATION = 4000;
  var current = 0;
  var timer = null;
  var isHovered = false;
  var slides, dots, progressFill;

  function init() {
    var card = document.getElementById("vital-card");
    if (!card) return;

    slides = Array.prototype.slice.call(card.querySelectorAll(".vfc-slide"));
    dots = Array.prototype.slice.call(card.querySelectorAll(".vfc-dot"));
    progressFill = document.getElementById("vfc-progress");

    if (!slides.length) return;

    /* Dot click handlers */
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        goTo(idx);
      });
    });

    /* Pause on hover */
    card.addEventListener("mouseenter", function () {
      isHovered = true;
      if (progressFill) progressFill.classList.add("vfc-paused");
    });
    card.addEventListener("mouseleave", function () {
      isHovered = false;
      if (progressFill) progressFill.classList.remove("vfc-paused");
    });

    goTo(0);
    startTimer();
  }

  function goTo(idx) {
    var prev = current;
    current = ((idx % slides.length) + slides.length) % slides.length;

    slides[prev].classList.remove("active");
    slides[current].classList.add("active");

    dots.forEach(function (d, i) {
      d.classList.toggle("active", i === current);
    });

    resetProgress();
  }

  function resetProgress() {
    if (!progressFill) return;
    progressFill.classList.remove("vfc-animating", "vfc-paused");
    void progressFill.offsetWidth; /* force reflow â€” restarts CSS animation */
    progressFill.classList.add("vfc-animating");
    if (isHovered) progressFill.classList.add("vfc-paused");
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
      if (!isHovered) goTo((current + 1) % slides.length);
    }, DURATION);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ==========================================================
   ELIGIBILITY SCROLL-LOCK SYSTEM
   ========================================================== */
(function () {
  "use strict";

  /* ---- Age relaxation accordion ---- */
  function initAccordion() {
    document
      .querySelectorAll("#elig-scroll-scene .age-explorer-card")
      .forEach(function (card) {
        card.addEventListener("click", function () {
          var isOpen = card.classList.contains("expanded");
          document
            .querySelectorAll("#elig-scroll-scene .age-explorer-card.expanded")
            .forEach(function (c) {
              c.classList.remove("expanded");
            });
          if (!isOpen) card.classList.add("expanded");
        });
      });
  }

  /* ---- Slide-in entry animation ---- */
  function initEntryAnim() {
    var scene = document.getElementById("elig-scroll-scene");
    if (!scene) return;
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("elig-visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    scene.querySelectorAll(".split-column").forEach(function (c) {
      io.observe(c);
    });
  }

  /* ====================================================
           SCROLL-LOCK ENGINE
           Wheel events are intercepted while the sticky section
           is in the viewport. ONLY the left (Eligibility) column
           scrolls as a vertical carousel â€” the right column is a
           static reference panel showing all cards at once.

           Page scroll resumes only when:
             - scrolling DOWN: left column reaches its bottom
             - scrolling UP:   left column returns to its top
           ==================================================== */
  function initScrollLock() {
    var scene = document.getElementById("elig-scroll-scene");
    var leftPane = document.getElementById("elig-col-pane");

    if (!scene || !leftPane) return;

    /* Skip on touch/mobile â€” CSS resets the sticky layout there */
    var mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) return;
    mq.addEventListener("change", function (e) {
      if (e.matches) document.removeEventListener("wheel", onWheel);
      else document.addEventListener("wheel", onWheel, { passive: false });
    });

    var justUnlocked = false;
    var unlockTimer = null;
    var vel = 0;
    var rafId = null;

    /* ---- Helpers ---- */
    function isInLockZone() {
      var r = scene.getBoundingClientRect();
      return r.top <= 2 && r.bottom > window.innerHeight * 0.05;
    }

    function leftAtEdge(goingDown) {
      var max = leftPane.scrollHeight - leftPane.clientHeight;
      if (max <= 1) return true; /* not scrollable â€” treat as done */
      return goingDown
        ? leftPane.scrollTop >= max - 4
        : leftPane.scrollTop <= 4;
    }

    function normDelta(e) {
      if (e.deltaMode === 1) return e.deltaY * 20;
      if (e.deltaMode === 2) return e.deltaY * window.innerHeight;
      return e.deltaY;
    }

    function setJustUnlocked() {
      justUnlocked = true;
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(function () {
        justUnlocked = false;
      }, 350);
    }

    /* ---- Momentum animation loop (left column only) ---- */
    function tick() {
      if (Math.abs(vel) > 0.3) {
        var maxL = leftPane.scrollHeight - leftPane.clientHeight;
        leftPane.scrollTop = Math.max(
          0,
          Math.min(maxL, leftPane.scrollTop + vel),
        );
        vel *= 0.87;
        rafId = requestAnimationFrame(tick);
      } else {
        vel = 0;
        rafId = null;
      }
    }

    /* ---- Wheel handler ---- */
    function onWheel(e) {
      if (justUnlocked) return;
      if (!isInLockZone()) return;

      var goingDown = e.deltaY > 0;

      if (leftAtEdge(goingDown)) {
        setJustUnlocked();
        vel = 0;
        return; /* let page scroll through */
      }

      e.preventDefault();

      var delta = normDelta(e);
      var MAX_VEL = 55;
      vel = Math.max(-MAX_VEL, Math.min(MAX_VEL, vel + delta * 0.75));

      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    document.addEventListener("wheel", onWheel, { passive: false });
  }

  /* ---- Bootstrap ---- */
  function init() {
    initAccordion();
    initEntryAnim();
    initScrollLock();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
