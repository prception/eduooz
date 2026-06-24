document.addEventListener("DOMContentLoaded", () => {

    // 1. Lenis smooth scroll
    function initLenis() {
        if (typeof Lenis === 'undefined') return;
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });
        window.lenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        }
    }
    initLenis();

    // 2. GSAP Animations
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        gsap.set(".g-reveal", { autoAlpha: 1 });

        // Hero reveal
        gsap.from(".g-reveal", {
            y: 40,
            opacity: 0,
            filter: "blur(12px)",
            duration: 1.1,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.4,
            clearProps: "filter"
        });

        // Section scroll reveal
        gsap.utils.toArray(".legal-section, .legal-intro-block").forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play none none none"
                },
                y: 28,
                opacity: 0,
                duration: 0.75,
                ease: "power3.out"
            });
        });
    }

    // 3. Active TOC link tracking via IntersectionObserver
    const sections = document.querySelectorAll('.legal-section[id]');
    const tocLinks = document.querySelectorAll('.toc-link');

    if (sections.length && tocLinks.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    const active = document.querySelector(`.toc-link[href="#${entry.target.id}"]`);
                    if (active) active.classList.add('active');
                }
            });
        }, { rootMargin: '-15% 0px -72% 0px' });

        sections.forEach(s => observer.observe(s));
    }

    // 4. Smooth scroll for TOC links
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            if (window.lenis) {
                window.lenis.scrollTo(target, { offset: -100, duration: 1.1 });
            } else {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 5. Scroll-to-Top button
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 450);
        }, { passive: true });

        scrollTopBtn.addEventListener('click', () => {
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 1.2 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // 6. Navbar light/dark mode on scroll
    function initNavbar() {
        const navbar = document.getElementById("navbar");
        if (!navbar || typeof ScrollTrigger === 'undefined') return;
        ScrollTrigger.create({
            start: 200,
            onEnter:     () => navbar.classList.add("light-mode"),
            onLeaveBack: () => navbar.classList.remove("light-mode")
        });
    }

    if (document.getElementById("navbar")) {
        initNavbar();
    } else {
        window.addEventListener('headerLoaded', initNavbar);
    }
});
