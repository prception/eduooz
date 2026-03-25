document.addEventListener("DOMContentLoaded", () => {

    // ============================================
    // 1. THREE.JS — MEDICAL PARTICLE FIELD (LIGHT THEME)
    // ============================================
    const canvas = document.getElementById("hero-canvas");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Fully transparent background
    camera.position.z = 50;

    // --- Particle System: DNA helix + ambient particles ---
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Light-theme color palette (soft purples, violets, lavenders)
    const colorPalette = [
        new THREE.Color(0x8b5cf6), // violet
        new THREE.Color(0xa78bfa), // light violet
        new THREE.Color(0xc4b5fd), // lavender
        new THREE.Color(0x7c3aed), // deep purple   
        new THREE.Color(0x6ee7b7), // emerald hint
        new THREE.Color(0xddd6fe), // very light purple
    ];

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        if (i < 250) {
            // DNA Helix strand 1
            const t = (i / 250) * Math.PI * 8;
            positions[i3] = Math.cos(t) * 12 + 20;
            positions[i3 + 1] = (i / 250) * 80 - 40;
            positions[i3 + 2] = Math.sin(t) * 12 + (Math.random() - 0.5) * 4;
        } else if (i < 500) {
            // DNA Helix strand 2
            const j = i - 250;
            const t = (j / 250) * Math.PI * 8 + Math.PI;
            positions[i3] = Math.cos(t) * 12 + 20;
            positions[i3 + 1] = (j / 250) * 80 - 40;
            positions[i3 + 2] = Math.sin(t) * 12 + (Math.random() - 0.5) * 4;
        } else {
            // Ambient particles
            positions[i3] = (Math.random() - 0.5) * 120;
            positions[i3 + 1] = (Math.random() - 0.5) * 80;
            positions[i3 + 2] = (Math.random() - 0.5) * 60;
        }

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i3] = col.r;
        colors[i3 + 1] = col.g;
        colors[i3 + 2] = col.b;

        sizes[i] = i < 500 ? 1.5 + Math.random() * 1.5 : 0.5 + Math.random() * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float uTime;
            uniform float uPixelRatio;

            void main() {
                vColor = color;
                vec3 pos = position;
                pos.y += sin(uTime * 0.3 + position.x * 0.1) * 0.5;
                pos.x += cos(uTime * 0.2 + position.y * 0.1) * 0.3;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;

            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                alpha *= 0.45;
                
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending, // Normal blending for light backgrounds
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // --- Connection Lines (DNA rungs) ---
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineColors = [];

    for (let i = 0; i < 250; i += 8) {
        const i3_a = i * 3;
        const i3_b = (i + 250) * 3;

        linePositions.push(
            positions[i3_a], positions[i3_a + 1], positions[i3_a + 2],
            positions[i3_b], positions[i3_b + 1], positions[i3_b + 2]
        );

        // Soft purple lines for light theme
        lineColors.push(0.55, 0.36, 0.93, 0.55, 0.36, 0.93);
    }

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.1,
        blending: THREE.NormalBlending,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // --- Mouse Interaction ---
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    document.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // --- Animate ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();

        particleMaterial.uniforms.uTime.value = elapsed;

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        particles.rotation.y = mouseX * 0.15 + elapsed * 0.02;
        particles.rotation.x = mouseY * 0.08;
        lines.rotation.y = mouseX * 0.15 + elapsed * 0.02;
        lines.rotation.x = mouseY * 0.08;

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize ---
    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    });


    // ============================================
    // 2. CUSTOM TEXT SPLITTER
    // ============================================
    const splitText = document.getElementById("split-text");
    if (splitText) {
        const textHtml = splitText.innerHTML;
        let newHtml = "";
        let isTag = false;

        for (let i = 0; i < textHtml.length; i++) {
            let char = textHtml[i];
            if (char === "<") isTag = true;
            if (!isTag && char !== " " && char !== "\n" && char !== "\r") {
                newHtml += `<span class="char">${char}</span>`;
            } else {
                newHtml += char;
            }
            if (char === ">") isTag = false;
        }
        splitText.innerHTML = newHtml;
    }


    // ============================================
    // 3. GSAP ENTRANCE TIMELINE (all mask-reveals fixed)
    // ============================================
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Aurora orbs
    tl.from(".glow-orb", {
        opacity: 0,
        scale: 0.5,
        duration: 2.5,
        stagger: 0.4,
        ease: "power2.out"
    }, 0);

    // Navbar
    tl.from(".liquid-nav", {
        y: -60,
        opacity: 0,
        duration: 1,
        ease: "power4.out"
    }, 0.3);

    // Badge — animate from opacity:0 to opacity:1
    tl.to(".badge-glass", {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, 0.6);

    // Character-by-character title
    tl.from(".char", {
        y: 60,
        rotationX: -90,
        scaleY: 1.8,
        opacity: 0,
        filter: "blur(15px)",
        duration: 1,
        stagger: 0.025,
        ease: "back.out(1.2)"
    }, 0.7);

    // Subtitle — use .to() for mask-reveal elements  
    tl.to(".aesthetic-subtitle", {
        opacity: 1,
        y: 0,
        duration: 0.9,
    }, "-=0.5");

    // CTA wrapper
    tl.to(".cta-wrapper", {
        opacity: 1,
        y: 0,
        duration: 0.9,
    }, "-=0.7");

    // Trust badges
    tl.to(".trust-badges", {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, "-=0.5");

    tl.from(".exam-pill", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(2)"
    }, "-=0.4");

    // Visual ring
    tl.from(".visual-ring", {
        scale: 0.6,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
    }, 0.8);

    // Floating tags — .to() for mask-reveal
    tl.to(".floating-tag", {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(2)"
    }, "-=0.6");

    // Stats cards — .to() for mask-reveal
    tl.to(".stat-card", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: "power4.out"
    }, "-=0.5");

    // Marquee
    tl.from(".marquee-strip", {
        opacity: 0,
        duration: 1,
    }, "-=0.5");

    // Scroll indicator
    tl.to(".scroll-indicator", {
        opacity: 1,
        y: 0,
        duration: 0.8,
    }, "-=0.3");


    // ============================================
    // 4. ANIMATED COUNTERS
    // ============================================
    function animateCounters() {
        const statCards = document.querySelectorAll(".stat-card[data-count]");
        statCards.forEach((card) => {
            const target = parseInt(card.dataset.count);
            const suffix = card.dataset.suffix || "";
            const valueEl = card.querySelector(".stat-value");
            
            gsap.to({ val: 0 }, {
                val: target,
                duration: 2,
                delay: 1.8,
                ease: "power2.out",
                onUpdate: function () {
                    valueEl.textContent = Math.round(this.targets()[0].val) + suffix;
                }
            });
        });
    }

    animateCounters();


    // ============================================
    // 5. CONTINUOUS FLOATING ANIMATIONS
    // ============================================
    gsap.to(".orb-1", { x: 80, y: 40, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-2", { x: -60, y: -60, duration: 12, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-3", { scale: 1.3, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut" });

    // Floating tags orbit
    gsap.utils.toArray(".floating-tag").forEach((tag, i) => {
        gsap.to(tag, {
            y: `+=${10 + Math.random() * 10}`,
            x: `+=${-8 + Math.random() * 16}`,
            rotation: -3 + Math.random() * 6,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.5
        });
    });

    // Stats cards subtle float
    gsap.utils.toArray(".stat-card").forEach((card, i) => {
        gsap.to(card, {
            y: `+=${5 + Math.random() * 5}`,
            duration: 2.5 + Math.random() * 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3
        });
    });


    // ============================================
    // 6. MOUSE PARALLAX
    // ============================================
    document.addEventListener("mousemove", (e) => {
        const x = (e.clientX / window.innerWidth - 0.5);
        const y = (e.clientY / window.innerHeight - 0.5);

        gsap.to(".hero-content", {
            x: -x * 15,
            y: -y * 10,
            duration: 1.2,
            ease: "power2.out"
        });

        gsap.to(".visual-ring", {
            x: x * 20,
            y: y * 15,
            duration: 1.2,
            ease: "power2.out"
        });

        gsap.to(".stats-grid", {
            x: x * 8,
            y: y * 5,
            duration: 1,
            ease: "power2.out"
        });
    });


    // ============================================
    // 7. NAVBAR + HAMBURGER
    // ============================================
    const nav = document.getElementById("main-nav");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("nav-links");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 80) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("mobile-open");
        });

        navLinks.querySelectorAll(".nav-item").forEach(link => {
            link.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navLinks.classList.remove("mobile-open");
            });
        });
    }


    // ============================================
    // 8. MAGNETIC CTA HOVER
    // ============================================
    const ctaBtn = document.getElementById("cta-primary");
    if (ctaBtn) {
        ctaBtn.addEventListener("mousemove", (e) => {
            const rect = ctaBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(ctaBtn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        ctaBtn.addEventListener("mouseleave", () => {
            gsap.to(ctaBtn, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.3)"
            });
        });
    }


    // ============================================
    // 9. EXAM PILL HOVER
    // ============================================
    document.querySelectorAll(".exam-pill").forEach(pill => {
        pill.addEventListener("mouseenter", () => {
            gsap.to(pill, { scale: 1.1, duration: 0.3, ease: "back.out(3)" });
        });
        pill.addEventListener("mouseleave", () => {
            gsap.to(pill, { scale: 1, duration: 0.4, ease: "power2.out" });
        });
    });

});