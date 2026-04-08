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


    
    // --- Three.js: Frosted Glass DNA with Assembly Animation ---
    const container = document.getElementById('cinematic-canvas');
    let scene, camera, renderer, dnaGroup, clock; // Declare outside for scope
    
    if (container && typeof THREE !== 'undefined') {
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0a0514, 0.015); // Adds depth to the shadows
        
        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(10, 0, 55);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        
        // Enable Hyper-Realistic Shadows
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        dnaGroup = new THREE.Group();
        scene.add(dnaGroup);

        // PERFECT FROSTED GLASS MATERIAL
        const frostedGlassMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transmission: 0.95, // Lets light through
            opacity: 1,
            metalness: 0.1,
            roughness: 0.5, // The key to "Frosted" look (scatters light)
            ior: 1.45,
            thickness: 2.5, // Simulates thick glass volume for refraction
            clearcoat: 0.8, // Keeps the outer edge shiny
            clearcoatRoughness: 0.2
        });

        // Emissive glowing connectors
        const glowMatCyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2 });
        const glowMatMagenta = new THREE.MeshStandardMaterial({ color: 0xc026d3, emissive: 0xc026d3, emissiveIntensity: 2 });

        const numNodes = 100;
        const radius = 5.5;
        const heightStep = 0.65;
        
        const sphereGeo = new THREE.SphereGeometry(1.1, 32, 32);
        const connectionGeo = new THREE.CylinderGeometry(0.2, 0.2, radius * 2, 16);

        // Array to hold pieces for animation
        const dnaPieces = [];

        // DNA Construction Loop
        for (let i = 0; i < numNodes; i++) {
            const angle = i * 0.18;
            const targetY = (i - numNodes / 2) * heightStep;

            const targetX1 = Math.cos(angle) * radius; 
            const targetZ1 = Math.sin(angle) * radius;
            const targetX2 = Math.cos(angle + Math.PI) * radius; 
            const targetZ2 = Math.sin(angle + Math.PI) * radius;

            // Create Strand 1
            const node1 = new THREE.Mesh(sphereGeo, frostedGlassMat);
            node1.castShadow = true; node1.receiveShadow = true;
            dnaGroup.add(node1);
            
            // Create Strand 2
            const node2 = new THREE.Mesh(sphereGeo, frostedGlassMat);
            node2.castShadow = true; node2.receiveShadow = true;
            dnaGroup.add(node2);

            // Store target data for assembly
            dnaPieces.push({ mesh: node1, tX: targetX1, tY: targetY, tZ: targetZ1, delay: i * 0.02 });
            dnaPieces.push({ mesh: node2, tX: targetX2, tY: targetY, tZ: targetZ2, delay: i * 0.02 });

            // Add Rungs (Connecting bridges) occasionally
            if (i % 3 === 0) {
                const rung = new THREE.Mesh(connectionGeo, i % 2 === 0 ? glowMatCyan : glowMatMagenta);
                rung.castShadow = true; rung.receiveShadow = true;
                dnaGroup.add(rung);
                
                // Rungs need specific rotation targets
                dnaPieces.push({ 
                    mesh: rung, 
                    tX: 0, tY: targetY, tZ: 0, 
                    tRotY: -angle, tRotZ: Math.PI / 2,
                    delay: i * 0.02 + 0.5, // Rungs form slightly after the nodes
                    isRung: true 
                });
            }
        }

        // THE ASSEMBLY ANIMATION (Explode -> Assemble)
        dnaPieces.forEach(piece => {
            // 1. Explode initial positions (Randomly scattered)
            const explodeRadius = 60;
            piece.mesh.position.set(
                (Math.random() - 0.5) * explodeRadius,
                (Math.random() - 0.5) * explodeRadius - 20, // Spawn from below
                (Math.random() - 0.5) * explodeRadius
            );
            piece.mesh.scale.set(0, 0, 0); // Start invisible

            if (piece.isRung) {
                piece.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            }

            // 2. Animate to mathematical target (Building the Helix)
            gsap.to(piece.mesh.position, {
                x: piece.tX, y: piece.tY, z: piece.tZ,
                duration: 2.5,
                ease: "expo.out",
                delay: 1 + piece.delay // Wait 1 second before starting assembly
            });

            gsap.to(piece.mesh.scale, {
                x: 1, y: 1, z: 1,
                duration: 2,
                ease: "back.out(1.5)",
                delay: 1 + piece.delay
            });

            if (piece.isRung) {
                gsap.to(piece.mesh.rotation, {
                    x: 0, y: piece.tRotY, z: piece.tRotZ,
                    duration: 2.5,
                    ease: "expo.out",
                    delay: 1 + piece.delay
                });
            }
        });

        // --- ADD FLOATING HEALTHCARE ELEMENTS ---
        const floatingGroup = new THREE.Group();
        scene.add(floatingGroup);
        const floatingElements = [];
        const glowMatGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });

        function createMedicalCross(scale) {
            const group = new THREE.Group();
            const boxV = new THREE.BoxGeometry(0.5 * scale, 1.6 * scale, 0.4 * scale);
            const boxH = new THREE.BoxGeometry(1.6 * scale, 0.5 * scale, 0.4 * scale);
            const meshV = new THREE.Mesh(boxV, frostedGlassMat);
            const meshH = new THREE.Mesh(boxH, frostedGlassMat);
            meshV.castShadow = true; meshH.castShadow = true;
            group.add(meshV, meshH);
            return group;
        }

        function createCapsule(scale) {
            const group = new THREE.Group();
            const r = 0.4 * scale;
            const h = 0.5 * scale;
            const topGroup = new THREE.Group();
            const sphereGeo = new THREE.SphereGeometry(r, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
            const cylGeo = new THREE.CylinderGeometry(r, r, h, 24);
            const topCap = new THREE.Mesh(sphereGeo, glowMatMagenta);
            topCap.position.y = h / 2;
            const topBody = new THREE.Mesh(cylGeo, glowMatMagenta);
            topGroup.add(topCap, topBody);
            topGroup.position.y = h / 2;
            const botGroup = new THREE.Group();
            const botCap = new THREE.Mesh(sphereGeo, frostedGlassMat);
            botCap.rotation.x = Math.PI;
            botCap.position.y = -h / 2;
            const botBody = new THREE.Mesh(cylGeo, frostedGlassMat);
            botGroup.add(botCap, botBody);
            botGroup.position.y = -h / 2;
            group.add(topGroup, botGroup);
            return group;
        }

        function createTestTube(scale) {
            const group = new THREE.Group();
            const tubeGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 1.6 * scale, 16, 1, true);
            const tube = new THREE.Mesh(tubeGeo, frostedGlassMat);
            const capGeo = new THREE.SphereGeometry(0.18 * scale, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
            const cap = new THREE.Mesh(capGeo, frostedGlassMat);
            cap.position.y = -0.8 * scale;
            const liquidGeo = new THREE.CylinderGeometry(0.14 * scale, 0.14 * scale, 0.6 * scale, 16);
            const liquid = new THREE.Mesh(liquidGeo, glowMatGreen);
            liquid.position.y = -0.4 * scale;
            const rimGeo = new THREE.TorusGeometry(0.2 * scale, 0.04 * scale, 8, 24);
            const rim = new THREE.Mesh(rimGeo, glowMatCyan);
            rim.rotation.x = Math.PI / 2;
            rim.position.y = 0.8 * scale;
            group.add(tube, cap, liquid, rim);
            return group;
        }

        function createStethoscope(scale) {
            const group = new THREE.Group();
            const tr = 0.05 * scale; 
            const earGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16);
            const postGeo = new THREE.CylinderGeometry(tr, tr, 0.15 * scale, 16);
            const leftEar = new THREE.Mesh(earGeo, glowMatCyan);
            leftEar.position.set(-0.5 * scale, 0.8 * scale, 0);
            const leftPost = new THREE.Mesh(postGeo, frostedGlassMat);
            leftPost.position.set(-0.625 * scale, 0.8 * scale, 0);
            leftPost.rotation.z = Math.PI / 2;
            const rightEar = new THREE.Mesh(earGeo, glowMatCyan);
            rightEar.position.set(-0.1 * scale, 0.8 * scale, 0);
            const rightPost = new THREE.Mesh(postGeo, frostedGlassMat);
            rightPost.position.set(-0.025 * scale, 0.8 * scale, 0);
            rightPost.rotation.z = Math.PI / 2;
            const upperVertGeo = new THREE.CylinderGeometry(tr, tr, 0.6 * scale, 16);
            const leftVert = new THREE.Mesh(upperVertGeo, frostedGlassMat);
            leftVert.position.set(-0.7 * scale, 0.5 * scale, 0);
            const rightVert = new THREE.Mesh(upperVertGeo, frostedGlassMat);
            rightVert.position.set(0.1 * scale, 0.5 * scale, 0);
            const upperTorusGeo = new THREE.TorusGeometry(0.4 * scale, tr, 16, 32, Math.PI);
            const upperTorus = new THREE.Mesh(upperTorusGeo, frostedGlassMat);
            upperTorus.position.set(-0.3 * scale, 0.2 * scale, 0);
            upperTorus.rotation.z = Math.PI;
            const lowerLeftVertGeo = new THREE.CylinderGeometry(tr, tr, 0.8 * scale, 16);
            const lowerLeftVert = new THREE.Mesh(lowerLeftVertGeo, frostedGlassMat);
            lowerLeftVert.position.set(-0.3 * scale, -0.6 * scale, 0);
            const lowerTorusGeo = new THREE.TorusGeometry(0.4 * scale, tr, 16, 32, Math.PI);
            const lowerTorus = new THREE.Mesh(lowerTorusGeo, frostedGlassMat);
            lowerTorus.position.set(0.1 * scale, -1.0 * scale, 0);
            lowerTorus.rotation.z = Math.PI; 
            const lowerRightVertGeo = new THREE.CylinderGeometry(tr, tr, 1.2 * scale, 16);
            const lowerRightVert = new THREE.Mesh(lowerRightVertGeo, frostedGlassMat);
            lowerRightVert.position.set(0.5 * scale, -0.4 * scale, 0);
            const chestGeo = new THREE.TorusGeometry(0.18 * scale, 0.07 * scale, 16, 32);
            const chest = new THREE.Mesh(chestGeo, glowMatMagenta);
            chest.position.set(0.5 * scale, 0.2 * scale, 0);
            group.add(leftEar, leftPost, rightEar, rightPost, leftVert, rightVert, upperTorus, lowerLeftVert, lowerTorus, lowerRightVert, chest);
            group.position.x = 0.1 * scale;
            group.position.y = 0.3 * scale;
            return group;
        }

        const elementConfigs = [
            // Left region (Spreads out far left)
            { create: () => createMedicalCross(2.5), pos: [-13, -3, 5], rot: [0.002, 0.004, 0.005], delay: 0.2 },
            { create: () => createCapsule(2), pos: [-15, -10, -10], rot: [0.003, 0.002, 0.005], delay: 0.6 },
            { create: () => createTestTube(2), pos: [-5, 5, 25], rot: [0.003, 0.003, 0.002], delay: 0.9 }, // Up close
            
            // Middle region (Around the DNA)
            { create: () => createTestTube(1.5), pos: [8, 22, -15], rot: [0.003, 0.003, 0.002], delay: 0.4 },
            { create: () => createStethoscope(1.8), pos: [12, -22, 10], rot: [0.002, 0.005, 0.003], delay: 0.8 },
            
            // Right region (Spreads out far right)
            { create: () => createStethoscope(2.5), pos: [25, 5, -5], rot: [0.003, 0.005, 0.002], delay: 0.3 },
            { create: () => createCapsule(2), pos: [45, -15, 15], rot: [0.004, 0.003, 0.005], delay: 0.7 },
            { create: () => createMedicalCross(2), pos: [25, 0, 20], rot: [0.003, 0.004, 0.003], delay: 1.0 },
        ];

        elementConfigs.forEach(cfg => {
            const obj = cfg.create();
            obj.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
            obj.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            obj.scale.set(0, 0, 0);
            floatingGroup.add(obj);

            gsap.to(obj.scale, {
                x: 1, y: 1, z: 1,
                duration: 2.5,
                ease: "power3.out",
                delay: 0.8 + cfg.delay
            });

            floatingElements.push({
                mesh: obj,
                basePos: { x: cfg.pos[0], y: cfg.pos[1], z: cfg.pos[2] },
                rot: cfg.rot,
                phase: Math.random() * Math.PI * 2
            });
        });

        // Position entire group to the right
        dnaGroup.position.x = 14;
        dnaGroup.rotation.z = Math.PI / 12;

        // --- Studio Lighting (Crucial for Shadows and Frosted Glass) ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
        scene.add(ambientLight);

        // Main Spotlight (Casts crisp, soft shadows through the glass)
        const spotLight = new THREE.SpotLight(0xffffff, 5);
        spotLight.position.set(15, 25, 25);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024; // Lower res shadows
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.bias = -0.0001;
        scene.add(spotLight);

        // Colored Rim Lights for the frosted edges
        const rimCyan = new THREE.PointLight(0x06b6d4, 8, 50); 
        rimCyan.position.set(20, 5, -15); 
        scene.add(rimCyan);
        
        const rimMagenta = new THREE.PointLight(0xc026d3, 8, 50); 
        rimMagenta.position.set(0, -10, 10); 
        scene.add(rimMagenta);

        // --- Render Loop ---
        clock = new THREE.Clock();
        let mouseX = 0; let mouseY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);
            const time = clock.getElapsedTime();

            // Organic, fluid rotation (Only starts getting noticeable after assembly)
            dnaGroup.rotation.y += 0.002;
            dnaGroup.position.y = Math.sin(time * 0.8) * 1.5;

            // Floating Elements Animation
            floatingElements.forEach(el => {
                el.phase += 0.01;
                el.mesh.position.y = el.basePos.y + Math.sin(el.phase) * 1.5;
                el.mesh.rotation.x += el.rot[0];
                el.mesh.rotation.y += el.rot[1];
                el.mesh.rotation.z += el.rot[2];
            });

            // Mouse Parallax
            gsap.to(dnaGroup.rotation, {
                x: mouseY * 0.15,
                duration: 1,
                ease: "power2.out"
            });
            gsap.to(floatingGroup.rotation, {
                x: mouseY * 0.1,
                y: mouseX * 0.1,
                duration: 1,
                ease: "power2.out"
            });

            renderer.render(scene, camera);
        }
        animate();

        // Responsive
        window.addEventListener('resize', () => {
            let width = container.clientWidth || window.innerWidth;
            let height = container.clientHeight || window.innerHeight;
            
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            
            if (window.innerWidth < 768) {
                // Mobile (Stacked): Center it but push it deep into the background so text is readable
                dnaGroup.position.x = 0; 
                dnaGroup.position.z = -30;
            } else if (window.innerWidth < 1024) {
                // Tablet (Side-by-side)
                dnaGroup.position.x = 0; 
                dnaGroup.position.z = -15;
            } else {
                // Desktop: DNA perfectly aligns on the middle split line
                dnaGroup.position.x = 4; // Shifted slightly given the 60% width container
                dnaGroup.position.z = 0;
            }
        });
        window.dispatchEvent(new Event('resize'));
    }
    // --- 5. GSAP Horizon Scroll (Who We Are) ---
    const horizonSection = document.querySelector('.who-horizon-section');
    const horizonTrack = document.getElementById('horizon-track');

    if (horizonSection && horizonTrack) {
        
        // 1. The Main Horizontal Scroll
        // We move it by -66.66% because there are 3 panels (100% / 3 = 33.33%. To see all 3, we move 2 widths over).
        const horizonTl = gsap.timeline({
            scrollTrigger: {
                trigger: horizonSection,
                pin: true,
                start: "top top",
                // The 'end' value controls how long the user has to scroll. 
                // "+=3000" means it takes 3000px of scrolling to get through the 3 panels. Very smooth.
                end: "+=3000", 
                scrub: 1, // Smooth scrubbing
            }
        });

        horizonTl.to(horizonTrack, {
            xPercent: -66.666, 
            ease: "none"
        });

        // 2. The Internal Image Parallax
        // Make the images pan subtly inside their masks while the whole section moves
        const parallaxImages = gsap.utils.toArray('.parallax-img');
        
        parallaxImages.forEach((img) => {
            gsap.to(img, {
                xPercent: -15, // Pans the image slightly to the left as the slide moves right
                ease: "none",
                scrollTrigger: {
                    trigger: horizonSection,
                    start: "top top",
                    end: "+=3000",
                    scrub: 1
                }
            });
        });
        
        // 3. Subtle floating animations for the glass details
        const glassDetails = gsap.utils.toArray('.floating-detail-glass');
        glassDetails.forEach((glass, i) => {
            gsap.to(glass, {
                y: -20,
                duration: 2 + (i * 0.5),
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1
            });
        });
    }

    // --- 6. GSAP Bento Parallax & Hover Effects ---
    const bentoImages = gsap.utils.toArray('.bento-img');
    bentoImages.forEach(img => {
        gsap.to(img, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // --- 7. GSAP Bento Box Reveal ---
    
    gsap.set(".g-mv-reveal", { autoAlpha: 1 });
    
    gsap.from(".g-mv-reveal", {
        scrollTrigger: { 
            trigger: ".mv-bento-section", 
            start: "top 80%" 
        },
        y: 50, 
        opacity: 0, 
        duration: 1.2, 
        stagger: 0.15, 
        ease: "power3.out",
        clearProps: "filter"
    });

    // --- 7. GSAP Who We Help Reveal & Touch Interaction ---
    gsap.set(".g-wwh-reveal", { autoAlpha: 1 });
    gsap.from(".g-wwh-reveal", {
        scrollTrigger: { trigger: ".wwh-premium-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out", clearProps: "filter"
    });

    const wwhPillars = document.querySelectorAll('.wwh-pillar');
    
    wwhPillars.forEach(pillar => {
        // Mobile tap support
        pillar.addEventListener('click', () => {
            wwhPillars.forEach(p => p.classList.remove('active'));
            pillar.classList.add('active');
        });
        
        // Desktop hover logic (removes active class from others instantly to prevent glitching)
        pillar.addEventListener('mouseenter', () => {
            if(window.innerWidth > 1024) {
                wwhPillars.forEach(p => p.classList.remove('active'));
                pillar.classList.add('active');
            }
        });
    });

    // --- 8. GSAP Our Approach (Clinical Timeline) ---
    
    // 1. Entrance Reveal for Header
    gsap.set(".g-app-reveal", { autoAlpha: 1 });
    gsap.from(".g-app-reveal", {
        scrollTrigger: { 
            trigger: ".approach-light-section", 
            start: "top 80%",
            toggleActions: "play reverse play reverse"
        },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, ease: "power3.out", clearProps: "filter"
    });

    // 2. Card Entrances (Directional slide-in, replays on scroll)
    const appCards = gsap.utils.toArray('.approach-card.g-app-card');
    appCards.forEach((card, i) => {
        const row = card.closest('.timeline-row');
        const isLeft = row && row.classList.contains('row-left');
        
        gsap.set(card, { autoAlpha: 1 });
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play reverse play reverse"
            },
            x: isLeft ? -60 : 60,
            y: 30,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // 3. Image parallax inside approach cards
    const approachImages = gsap.utils.toArray('.approach-card .card-img-zone img');
    approachImages.forEach(img => {
        gsap.to(img, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
                trigger: img.closest('.timeline-row'),
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // 4. Completion Badge Entrance
    const completionBadge = document.querySelector('.timeline-completion');
    if (completionBadge) {
        gsap.set(completionBadge, { autoAlpha: 1 });
        gsap.from(completionBadge, {
            scrollTrigger: { 
                trigger: completionBadge, 
                start: "top 85%",
                toggleActions: "play reverse play reverse"
            },
            y: 30, opacity: 0, scale: 0.8,
            duration: 1.2, ease: "back.out(1.7)"
        });
    }

    // 5. Floating deco parallax on scroll
    const decoRings = gsap.utils.toArray('.deco-ring');
    decoRings.forEach((ring, i) => {
        gsap.to(ring, {
            y: (i % 2 === 0) ? -80 : 80,
            ease: "none",
            scrollTrigger: {
                trigger: ".approach-light-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // 6. Confetti Burst Function
    let confettiFired = false;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function fireConfetti() {
        if (confettiFired) return;
        confettiFired = true;

        const container = document.getElementById('confetti-container');
        if (!container) return;

        const total = 300;
        const colors = [
            '#5e2bc4', '#06b6d4', '#c026d3', '#0ea5e9', 
            '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6'
        ];

        for (let i = 0; i < total; i++) {
            const piece = document.createElement('div');
            piece.classList.add('confetti-piece');
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.width = randomBetween(5, 10) + 'px';
            piece.style.height = randomBetween(8, 16) + 'px';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            container.appendChild(piece);

            // Burst outward from center
            gsap.set(piece, { 
                x: 0, y: 0, opacity: 1, 
                scale: randomBetween(0.5, 1.2),
                rotation: randomBetween(0, 360)
            });

            gsap.to(piece, {
                x: randomBetween(-200, 200),
                y: randomBetween(-250, 80),
                rotation: randomBetween(-720, 720),
                opacity: 0,
                scale: 0,
                duration: randomBetween(1.5, 7),
                ease: "power2.out",
                delay: randomBetween(0, 0.3),
                onComplete: () => piece.remove()
            });
        }
    }

    function resetConfetti() {
        confettiFired = false;
        const container = document.getElementById('confetti-container');
        if (container) container.innerHTML = '';
    }

    // 7. The Dynamic Spine Tracker (Position-based dot + badge activation)
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineDots = document.querySelectorAll('.timeline-dot');
    const timelineWrapper = document.querySelector('.timeline-master-wrapper');
    const completionEl = document.querySelector('.timeline-completion');
    
    if (timelineProgress && timelineWrapper) {
        gsap.to(timelineProgress, {
            height: "100%",
            ease: "none",
            scrollTrigger: {
                trigger: timelineWrapper,
                start: "top 50%",
                end: "bottom 50%",
                scrub: 0.3,
                
                onUpdate: (self) => {
                    const progress = self.progress;
                    const wrapperRect = timelineWrapper.getBoundingClientRect();
                    const wrapperHeight = wrapperRect.height;
                    
                    // Activate dots based on real DOM position
                    timelineDots.forEach((dot) => {
                        const dotRect = dot.getBoundingClientRect();
                        const dotCenter = dotRect.top + dotRect.height / 2;
                        const dotOffsetInWrapper = dotCenter - wrapperRect.top;
                        const dotPosition = dotOffsetInWrapper / wrapperHeight;
                        
                        if (progress >= dotPosition) {
                            dot.classList.add('is-active');
                        } else {
                            dot.classList.remove('is-active');
                        }
                    });

                    // Activate completion badge when line reaches the icon center
                    if (completionEl) {
                        const iconEl = completionEl.querySelector('.completion-icon');
                        if (iconEl) {
                            const iconRect = iconEl.getBoundingClientRect();
                            const iconCenter = iconRect.top + (iconRect.height / 2) - wrapperRect.top;
                            const badgePosition = iconCenter / wrapperHeight;

                            if (progress >= badgePosition) {
                                if (!completionEl.classList.contains('is-reached')) {
                                    completionEl.classList.add('is-reached');
                                    fireConfetti();
                                }
                            } else {
                                completionEl.classList.remove('is-reached');
                                resetConfetti();
                            }
                        }
                    }
                }
            }
        });
    }

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


    // --- 9. GSAP Cinematic Infinite Drag Faculty Carousel ---
    
    gsap.set(".g-fac-reveal", { autoAlpha: 1 });
    gsap.from(".g-fac-reveal", {
        scrollTrigger: { trigger: ".faculty-filmstrip-section", start: "top 75%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    const track = document.getElementById('faculty-track');
    const wrapper = document.querySelector('.filmstrip-track-wrapper');
    
    if(track && wrapper) {
        const cards = Array.from(track.children);
        
        // 1. Clone cards to create the seamless loop illusion
        cards.forEach(card => {
            let clone = card.cloneNode(true);
            track.appendChild(clone);
        });

        const allCards = Array.from(track.children);

        // 2. Physics Variables
        let targetX = 0;
        let currentX = 0;
        let isDragging = false;
        let startX = 0;
        let dragStartX = 0;
        let autoScrollSpeed = 1; // Constant slow movement
        let trackWidth = 0;

        function updateMeasurements() {
            // The real width is exactly half the total width because we cloned it once
            trackWidth = track.scrollWidth / 2;
        }
        
        // Let images load before measuring
        setTimeout(updateMeasurements, 500);
        window.addEventListener('resize', updateMeasurements);

        // 3. Mouse Events
        wrapper.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            dragStartX = targetX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            targetX = dragStartX + (dx * 1.5); // 1.5 adds slight drag momentum
        });

        window.addEventListener('mouseup', () => isDragging = false);
        window.addEventListener('mouseleave', () => isDragging = false);

        // 4. Touch Events for Mobile
        wrapper.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            dragStartX = targetX;
            autoScrollSpeed = 0; // Pause auto-scroll on touch
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const dx = e.touches[0].clientX - startX;
            targetX = dragStartX + (dx * 1.5);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
            autoScrollSpeed = 1; // Resume auto-scroll
        });

        // Pause auto-scroll when hovering on desktop
        wrapper.addEventListener('mouseenter', () => autoScrollSpeed = 0);
        wrapper.addEventListener('mouseleave', () => autoScrollSpeed = 1);

        // 5. The Render Loop
        function animateCarousel() {
            if (!isDragging) {
                targetX -= autoScrollSpeed; // Auto move left
            }

            // LERP (Linear Interpolation) for buttery smoothness
            currentX += (targetX - currentX) * 0.08;

            // The Seamless Loop Logic
            if (currentX <= -trackWidth) {
                currentX += trackWidth;
                targetX += trackWidth;
            } else if (currentX > 0) {
                currentX -= trackWidth;
                targetX -= trackWidth;
            }

            // Apply transform natively via GSAP
            gsap.set(track, { x: currentX });

            // Mobile auto-reveal logic
            if (window.innerWidth <= 1024) {
                const screenCenter = window.innerWidth / 2;
                allCards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenter = rect.left + rect.width / 2;
                    // Trigger if the center of the card is near the center of the screen
                    if (cardCenter > screenCenter - (rect.width * 0.55) && cardCenter < screenCenter + (rect.width * 0.55)) {
                        card.classList.add('mobile-active');
                    } else {
                        card.classList.remove('mobile-active');
                    }
                });
            } else {
                allCards.forEach(card => card.classList.remove('mobile-active'));
            }

            requestAnimationFrame(animateCarousel);
        }
        
        // Start engine
        animateCarousel();
    }

    // --- 10. Dynamic DOM Wrapper for CSS Grid Interpolation ---
    document.querySelectorAll('.fac-hidden-details').forEach(details => {
        // Prevent duplicate wrapping on hot-reloads
        if(details.querySelector('.fac-hidden-inner')) return;
        
        const inner = document.createElement('div');
        inner.className = 'fac-hidden-inner';
        
        while (details.firstChild) {
            inner.appendChild(details.firstChild);
        }
        details.appendChild(inner);
    });

    // --- 10. GSAP Light Theme Placements & Data-Driven Cycling ---

    // 1. Section Entrance Reveal
    gsap.set(".g-place-reveal", { autoAlpha: 1 });
    gsap.from(".g-place-reveal", {
        scrollTrigger: { trigger: ".placement-light-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out"
    });

    // 2. Faculty Data Pool (Replaces Alumni Pool for Fade-in Grid)
    const facultyPool = [
        // Batch 1 (Matches initial HTML)
        { name: "Dr. Anand", role: "Chief Director â€” Sciences", badge: "15+ Years", icon: '<i class="fa-solid fa-microscope"></i>', desc: "Mentored <strong>200+ Rank Holders</strong> in Biology & Competitive Exams", img: "https://images.unsplash.com/photo-1594824432258-f9b8c2be6d3a?auto=format&fit=crop&q=80&w=500" },
        { name: "Prof. Samuel John", role: "Lead Pharmacist Educator", badge: "M.Pharm", icon: '<i class="fa-solid fa-capsules"></i>', desc: "Ex-State Board Examiner â€” <strong>High-Yield Topic Specialist</strong>", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500" },
        { name: "Dr. Meera Menon", role: "Head of Nursing Dept.", badge: "AIIMS Topper", icon: '<i class="fa-solid fa-hospital"></i>', desc: "Trained <strong>300+ Nurses</strong> for AIIMS, JIPMER & Central Govt.", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500" },
        // Batch 2
        { name: "Gabriel", role: "Full Stack AI & Digital", badge: "Tech & Growth", icon: '<i class="fa-solid fa-laptop-code"></i>', desc: "Architecting the Eduooz digital ecosystem and platform growth", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500" },
        { name: "Sarah Thomas", role: "Lab Technology & Global", badge: "DHA Specialist", icon: '<i class="fa-solid fa-globe"></i>', desc: "Guiding students through international testing formats & placements", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=500" },
        { name: "Dr. Rajesh Kumar", role: "Anatomy Expert", badge: "MBBS, MD", icon: '<i class="fa-solid fa-bone"></i>', desc: "Breaking down complex anatomical concepts with practical ease", img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=500" },
        // Batch 3
        { name: "Anita Desai", role: "Senior Nursing Instructor", badge: "10+ Years", icon: '<i class="fa-solid fa-syringe"></i>', desc: "Specializes in clinical scenarios and emergency care questions", img: "https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?auto=format&fit=crop&q=80&w=500" },
        { name: "Vikram Singh", role: "Head of Pharmacology", badge: "M.Sc Pharma", icon: '<i class="fa-solid fa-flask"></i>', desc: "Mastering drug classifications and mechanism of actions", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=500" },
        { name: "Elena Fernandez", role: "PROMETRIC Guide", badge: "Global Trainer", icon: '<i class="fa-solid fa-plane"></i>', desc: "Preparing students for Middle Eastern licensing board exams", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=500" }
    ];

    let currentFacultyBatch = 0; // Tracks which group of 3 is currently displayed

    function generateFacultyCardHTML(fac) {
        return `
            <div class="prismatic-card">
                <div class="card-glare-light"></div>
                <div class="card-content-3d">
                    <div class="alumni-img-box">
                        <img src="${fac.img}" alt="${fac.name}">
                        <div class="rank-badge">${fac.badge}</div>
                    </div>
                    <div class="alumni-info">
                        <h3>${fac.name}</h3>
                        <p class="exam-name">${fac.role}</p>
                        <div class="placement-dest">
                            <span class="dest-icon">${fac.icon}</span>
                            <span>${fac.desc}</span>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    const cardWrappers = document.querySelectorAll('.alumni-card-wrapper');

    function bindTiltPhysics(wrapper) {
        const card = wrapper.querySelector('.prismatic-card');
        if (!card) return;

        // Use fresh clone to remove old listeners
        const freshWrapper = wrapper;

        freshWrapper.addEventListener('mousemove', (e) => {
            const rect = freshWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Reduced tilt: Max 6 degrees for subtlety
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;
            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });

        freshWrapper.addEventListener('mouseleave', () => {
            card.style.transform = `rotateX(0deg) rotateY(0deg)`;
            card.style.transition = `transform 0.6s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.6s ease`;
            setTimeout(() => {
                card.style.transition = `transform 0.15s ease, box-shadow 0.15s ease`;
            }, 600);
        });
    }

    // Bind initial tilt physics
    cardWrappers.forEach(bindTiltPhysics);

    // 3. Cycling Engine
    function cycleFaculty() {
        const totalBatches = Math.ceil(facultyPool.length / 3);
        currentFacultyBatch = (currentFacultyBatch + 1) % totalBatches;
        const batch = facultyPool.slice(currentFacultyBatch * 3, currentFacultyBatch * 3 + 3);

        // Phase 1: Fade Out + Jump Up (staggered cascade)
        cardWrappers.forEach((wrapper, i) => {
            setTimeout(() => {
                wrapper.classList.add('cycling-out');
            }, i * 150); // 150ms stagger for smooth cascade
        });

        // Phase 2: Swap content after fade-out fully completes
        setTimeout(() => {
            cardWrappers.forEach((wrapper, i) => {
                if (batch[i]) {
                    wrapper.innerHTML = generateFacultyCardHTML(batch[i]);
                    const img = wrapper.querySelector('img');
                    if (img) img.loading = 'eager';
                }
                // Instantly set the "waiting below" position
                wrapper.classList.remove('cycling-out');
                wrapper.classList.add('cycling-in');
            });

            // Phase 3: Jump Reveal from Below (staggered bounce)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    cardWrappers.forEach((wrapper, i) => {
                        setTimeout(() => {
                            wrapper.classList.remove('cycling-in');
                            // Re-bind 3D tilt physics to the fresh DOM
                            bindTiltPhysics(wrapper);
                        }, i * 150);
                    });
                });
            });
        }, 800); // Synced with 0.7s CSS transition + buffer
    }

    // Start cycling every 5 seconds
    setInterval(cycleFaculty, 5000);

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
    // --- 12. GSAP FAQ Reveal & Dynamic Accordion ---
    gsap.set(".g-faq-reveal", { autoAlpha: 1 });
    gsap.from(".g-faq-reveal", {
        scrollTrigger: { trigger: ".faq-elite-section", start: "top 80%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1, stagger: 0.15, ease: "power3.out"
    });

    // Accordion Logic
    const faqWrapper = document.getElementById('faq-accordion');
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqWrapper && faqItems.length > 0) {
        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');
            
            button.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });

                // Toggle the clicked item
                if (!isActive) {
                    item.classList.add('active');
                    faqWrapper.classList.add('has-active'); // Triggers Focus Mode Dimming
                } else {
                    faqWrapper.classList.remove('has-active'); // Removes Dimming if all are closed
                }
            });
        });
    }
    // --- 9. GSAP Cinematic Footer Reveal ---
    function initFooterAnimation() {
        let mmFooter = gsap.matchMedia();
        
        mmFooter.add("(min-width: 1025px)", () => {
            gsap.from(".luxury-footer-inner", {
                scrollTrigger: {
                    trigger: ".luxury-footer-wrapper",
                    start: "top bottom",
                    end: "bottom bottom",
                    scrub: true
                },
                yPercent: -20,
                scale: 0.95,
                opacity: 0.5,
                ease: "none"
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
