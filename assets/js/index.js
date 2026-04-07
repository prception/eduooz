document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. GSAP UI Premium Entrances ---
    const tl = gsap.timeline();

    gsap.set([".g-reveal", ".g-visual"], { autoAlpha: 1 });

    tl.from(".g-reveal", {
        y: 50, opacity: 0, filter: "blur(15px)", 
        duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2,
        clearProps: "filter"
    })
    .from(".main-glass-card", {
        y: 100, opacity: 0, rotationX: 15, scale: 0.9,
        duration: 1.5, ease: "power4.out"
    }, "-=1")
    .from(".floating-glass-badge", {
        x: (i) => i % 2 === 0 ? -50 : 50, opacity: 0,
        duration: 1.2, stagger: 0.2, ease: "back.out(1.2)"
    }, "-=1");

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
            start: 500, // Trigger when scrolled 500px down
            onEnter: () => navbar.classList.add("light-mode"),
            onLeaveBack: () => navbar.classList.remove("light-mode")
        });
    }

    if (document.getElementById("navbar")) {
        initNavbarScroll();
    } else {
        window.addEventListener('headerLoaded', initNavbarScroll);
    }



    // --- 2. Three.js: Floating Healthcare Elements Backgroundy5t7yg7 ---
    const container = document.getElementById('cinematic-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0514, 0.012);
    
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 40);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Master group for all floating elements
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    // --- MATERIALS ---
    // Frosted Glass Material (Premium look)
    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92, opacity: 1,
        metalness: 0.05, roughness: 0.45,
        ior: 1.45, thickness: 2.0,
        clearcoat: 0.9, clearcoatRoughness: 0.15
    });

    // Emissive glow materials for accents
    const glowCyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 });
    const glowMagenta = new THREE.MeshStandardMaterial({ color: 0xc026d3, emissive: 0xc026d3, emissiveIntensity: 1.5, transparent: true, opacity: 0.9 });
    const glowGreen = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 });

    // --- HELPER: Create healthcare 3D objects ---
    const floatingElements = [];

    // 1. MEDICAL CROSS (Nursing)
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

    // 2. PILL CAPSULE (Pharmacist)
    function createCapsule(scale) {
        const group = new THREE.Group();
        const r = 0.4 * scale;
        const h = 0.5 * scale;

        // 1. Top Half (Glowing Magenta)
        const topGroup = new THREE.Group();
        const sphereGeo = new THREE.SphereGeometry(r, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2);
        const cylGeo = new THREE.CylinderGeometry(r, r, h, 24);
        
        const topCap = new THREE.Mesh(sphereGeo, glowMagenta);
        topCap.position.y = h / 2;
        
        const topBody = new THREE.Mesh(cylGeo, glowMagenta);
        topGroup.add(topCap, topBody);
        topGroup.position.y = h / 2;

        // 2. Bottom Half (Frosted Glass)
        const botGroup = new THREE.Group();
        const botCap = new THREE.Mesh(sphereGeo, frostedGlassMat);
        botCap.rotation.x = Math.PI;
        botCap.position.y = -h / 2;
        
        const botBody = new THREE.Mesh(cylGeo, frostedGlassMat);
        botGroup.add(botCap, botBody);
        botGroup.position.y = -h / 2;

        // 3. Middle Joining Ring
        // const ringGeo = new THREE.TorusGeometry(r + 0.02 * scale, 0.03 * scale, 16, 32);
        // const ring = new THREE.Mesh(ringGeo, frostedGlassMat);
        // ring.rotation.x = Math.PI / 2;

        group.add(topGroup, botGroup);
        return group;
    }

    // 3. TEST TUBE (Lab Technician)
    function createTestTube(scale) {
        const group = new THREE.Group();
        const tubeGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 1.6 * scale, 16, 1, true);
        const tube = new THREE.Mesh(tubeGeo, frostedGlassMat);
        const capGeo = new THREE.SphereGeometry(0.18 * scale, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        const cap = new THREE.Mesh(capGeo, frostedGlassMat);
        cap.position.y = -0.8 * scale;
        const liquidGeo = new THREE.CylinderGeometry(0.14 * scale, 0.14 * scale, 0.6 * scale, 16);
        const liquid = new THREE.Mesh(liquidGeo, glowGreen);
        liquid.position.y = -0.4 * scale;
        const rimGeo = new THREE.TorusGeometry(0.2 * scale, 0.04 * scale, 8, 24);
        const rim = new THREE.Mesh(rimGeo, glowCyan);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.8 * scale;
        group.add(tube, cap, liquid, rim);
        return group;
    }

    // 4. STETHOSCOPE (Nursing)
    function createStethoscope(scale) {
        const group = new THREE.Group();
        const tr = 0.05 * scale; // Tube radius
        
        // 1. EAR PIECES & TOP POSTS
        // Left Ear
        const earGeo = new THREE.SphereGeometry(0.12 * scale, 16, 16);
        const postGeo = new THREE.CylinderGeometry(tr, tr, 0.15 * scale, 16);
        
        const leftEar = new THREE.Mesh(earGeo, glowCyan);
        leftEar.position.set(-0.5 * scale, 0.8 * scale, 0);
        
        const leftPost = new THREE.Mesh(postGeo, frostedGlassMat);
        leftPost.position.set(-0.625 * scale, 0.8 * scale, 0);
        leftPost.rotation.z = Math.PI / 2;

        // Right Ear
        const rightEar = new THREE.Mesh(earGeo, glowCyan);
        rightEar.position.set(-0.1 * scale, 0.8 * scale, 0);

        const rightPost = new THREE.Mesh(postGeo, frostedGlassMat);
        rightPost.position.set(-0.025 * scale, 0.8 * scale, 0);
        rightPost.rotation.z = Math.PI / 2;

        // 2. UPPER HEADSET U-SHAPE
        const upperVertGeo = new THREE.CylinderGeometry(tr, tr, 0.6 * scale, 16);
        
        // Left vertical
        const leftVert = new THREE.Mesh(upperVertGeo, frostedGlassMat);
        leftVert.position.set(-0.7 * scale, 0.5 * scale, 0);
        
        // Right vertical
        const rightVert = new THREE.Mesh(upperVertGeo, frostedGlassMat);
        rightVert.position.set(0.1 * scale, 0.5 * scale, 0);

        // Center U-Torus (Radius 0.4, spans x=-0.7 to x=0.1)
        const upperTorusGeo = new THREE.TorusGeometry(0.4 * scale, tr, 16, 32, Math.PI);
        const upperTorus = new THREE.Mesh(upperTorusGeo, frostedGlassMat);
        upperTorus.position.set(-0.3 * scale, 0.2 * scale, 0);
        upperTorus.rotation.z = Math.PI; // Face downward

        // 3. MAIN LOWER TUBE LOOP
        // Straight down from center of U-Torus (x=-0.3)
        const lowerLeftVertGeo = new THREE.CylinderGeometry(tr, tr, 0.8 * scale, 16);
        const lowerLeftVert = new THREE.Mesh(lowerLeftVertGeo, frostedGlassMat);
        lowerLeftVert.position.set(-0.3 * scale, -0.6 * scale, 0);

        // Lower hooking Torus (Radius 0.4, spans x=-0.3 to x=0.5)
        const lowerTorusGeo = new THREE.TorusGeometry(0.4 * scale, tr, 16, 32, Math.PI);
        const lowerTorus = new THREE.Mesh(lowerTorusGeo, frostedGlassMat);
        lowerTorus.position.set(0.1 * scale, -1.0 * scale, 0);
        lowerTorus.rotation.z = Math.PI; // Face downward to create the bottom hook loop

        // Straight up to chestpiece (x=0.5)
        const lowerRightVertGeo = new THREE.CylinderGeometry(tr, tr, 1.2 * scale, 16);
        const lowerRightVert = new THREE.Mesh(lowerRightVertGeo, frostedGlassMat);
        lowerRightVert.position.set(0.5 * scale, -0.4 * scale, 0);

        // 4. CHEST PIECE
        // Iconic hollow ring facing forward
        const chestGeo = new THREE.TorusGeometry(0.18 * scale, 0.07 * scale, 16, 32);
        const chest = new THREE.Mesh(chestGeo, glowMagenta);
        chest.position.set(0.5 * scale, 0.2 * scale, 0);

        // Add all distinct perfect parts to the main group
        group.add(
            leftEar, leftPost, rightEar, rightPost,
            leftVert, rightVert, upperTorus,
            lowerLeftVert, lowerTorus, lowerRightVert,
            chest
        );
        
        // Re-center alignment for natural floating bounding box
        group.position.x = 0.1 * scale;
        group.position.y = 0.3 * scale;
        
        return group;
    }

    // --- SPAWN FLOATING ELEMENTS ---
    // 8 elements only — clean, spaced out, premium
    const elementConfigs = [
        // Left side (behind hero text) — subtle
        { create: () => createMedicalCross(3.0), pos: [-20, 10, -10], drift: [0.10, 0.07, 0.04], rot: [0.002, 0.004, 0.005], delay: 0.2 },
        { create: () => createCapsule(2.2), pos: [-16, -8, -12], drift: [0.08, 0.12, 0.05], rot: [0.003, 0.002, 0.005], delay: 0.6 },

        // Center — bridging the two sides
        { create: () => createTestTube(1.8), pos: [-3, 13, -16], drift: [0.06, 0.05, 0.07], rot: [0.003, 0.003, 0.002], delay: 0.4 },
        { create: () => createStethoscope(2.0), pos: [4, -1, -14], drift: [0.07, 0.09, 0.04], rot: [0.002, 0.005, 0.003], delay: 0.8 },

        // Right side (behind phone mockup) — slightly larger
        { create: () => createStethoscope(2.4), pos: [20, 8, -8], drift: [0.09, 0.06, 0.05], rot: [0.003, 0.005, 0.002], delay: 0.3 },
        { create: () => createCapsule(2.0), pos: [34, -6, -10], drift: [0.07, 0.10, 0.06], rot: [0.004, 0.003, 0.005], delay: 0.7 },
        { create: () => createMedicalCross(1.6), pos: [34, 7, -14], drift: [0.10, 0.08, 0.04], rot: [0.003, 0.004, 0.003], delay: 1.0 },
        { create: () => createTestTube(2.0), pos: [22, 14, -12], drift: [0.05, 0.07, 0.08], rot: [0.002, 0.003, 0.004], delay: 0.5 },
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
            baseRot: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
            drift: cfg.drift,
            rot: cfg.rot,
            phase: Math.random() * Math.PI * 2
        });
    });

    // --- STUDIO LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 4);
    spotLight.position.set(10, 20, 25);
    spotLight.angle = Math.PI / 3;
    spotLight.penumbra = 0.6;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    scene.add(spotLight);

    const rimCyan = new THREE.PointLight(0x06b6d4, 6, 60);
    rimCyan.position.set(25, 5, -10);
    scene.add(rimCyan);

    const rimMagenta = new THREE.PointLight(0xc026d3, 6, 60);
    rimMagenta.position.set(-20, -8, 10);
    scene.add(rimMagenta);

    const rimPurple = new THREE.PointLight(0x5b21b6, 4, 50);
    rimPurple.position.set(0, 15, -20);
    scene.add(rimPurple);

    // --- RENDER LOOP ---
    const clock = new THREE.Clock();
    let mouseX = 0, mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Animate each floating element with elegant organic motion (sway and float instead of spinning)
        floatingElements.forEach(el => {
            const t = time + el.phase;
            el.mesh.position.x = el.basePos.x + Math.sin(t * el.drift[0]) * 2.0;
            el.mesh.position.y = el.basePos.y + Math.sin(t * el.drift[1] + 1.5) * 2.5;
            el.mesh.position.z = el.basePos.z + Math.sin(t * el.drift[2] + 0.8) * 1.0;
            
            // Sway slightly around its base rotation instead of endless spinning
            el.mesh.rotation.x = el.baseRot.x + Math.sin(t * el.rot[0] * 150) * 0.2;
            el.mesh.rotation.y = el.baseRot.y + Math.sin(t * el.rot[1] * 150) * 0.3;
            el.mesh.rotation.z = el.baseRot.z + Math.cos(t * el.rot[2] * 150) * 0.15;
        });

        // Mouse parallax on entire floating group
        // gsap.to(floatingGroup.rotation, {
        //     x: mouseY * 0.08,
        //     y: mouseX * 0.06,
        //     duration: 1.5,
        //     ease: "power2.out"
        // });

        // Subtle camera breathing
        camera.position.y = Math.sin(time * 0.3) * 0.5;

        renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (window.innerWidth < 768) {
            camera.position.z = 50; // Pull camera back on mobile for wider view
            camera.fov = 55;
        } else if (window.innerWidth < 1024) {
            camera.position.z = 45;
            camera.fov = 52;
        } else {
            camera.position.z = 40;
            camera.fov = 50;
        }
        camera.updateProjectionMatrix();
    });
    window.dispatchEvent(new Event('resize'));

    // --- 4.5. GSAP Hero Entrance Sequence ---
    const seqTl = gsap.timeline({ delay: 0.5 }); 

    // Phase 1: Shrink → scale-up + fade-up with bounce
    seqTl.to(".hero-mockup-img", {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.4,
        ease: "back.out(1.7)"
    }, 0);

    // Phase 2: Reveal orbit container + ring path scales in
    seqTl.set(".orbit-container", { visibility: "visible" }, 1.2);
    seqTl.fromTo(".orbit-ring-path", 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.4)" },
    1.2);

    // Phase 3: Nodes burst out from center with stagger
    const r = window.innerWidth < 768 ? 120 : 250;
    const nodeSize = window.innerWidth < 768 ? 45 : 60; // Half of node width

    // Position nodes evenly on the circle (120° apart)
    const n1X = 0,                           n1Y = -r;                          // Top
    const n2X = r * Math.cos(Math.PI / 6),   n2Y = r * Math.sin(Math.PI / 6);   // Bottom-right
    const n3X = -r * Math.cos(Math.PI / 6),  n3Y = r * Math.sin(Math.PI / 6);   // Bottom-left

    seqTl.to("#node-nursing", { x: n1X - nodeSize, y: n1Y - nodeSize, scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" }, 1.6)
         .to("#node-pharma",  { x: n2X - nodeSize, y: n2Y - nodeSize, scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" }, 1.8)
         .to("#node-lab",     { x: n3X - nodeSize, y: n3Y - nodeSize, scale: 1, opacity: 1, duration: 1, ease: "back.out(2)" }, 2.0);

    // Phase 4: Infinite orbit rotation with dynamic Z-Index wrapping
    const proxy = { angle: 0 };
    const nodesInfo = [
        { id: "#node-nursing", offset: -Math.PI / 2 },
        { id: "#node-pharma",  offset: Math.PI / 6 },
        { id: "#node-lab",     offset: 5 * Math.PI / 6 }
    ];

    seqTl.to(proxy, {
        angle: Math.PI * 2,
        duration: 30,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
            nodesInfo.forEach(node => {
                const currentAngle = proxy.angle + node.offset;
                const nodeX = r * Math.cos(currentAngle) - nodeSize;
                // Pure Y value before subtracting nodeSize
                const pureY = r * Math.sin(currentAngle);
                const nodeY = pureY - nodeSize;
                
                // When pureY is negative (top half of the orbit), push it behind the phone
                const isBehind = pureY < -40; // -40 offset so it tucks behind perfectly
                
                gsap.set(node.id, { 
                    x: nodeX, 
                    y: nodeY,
                    zIndex: isBehind ? 10 : 30 
                });
            });
        }
    }, 3.0);

    // --- 5. GSAP ScrollTrigger: Contained Trust Panel ---
    gsap.registerPlugin(ScrollTrigger);

    // Fade and float the glass panel up
    gsap.from(".trust-glass-panel", {
        scrollTrigger: {
            trigger: ".trust-section-contained",
            start: "top 85%", 
            toggleActions: "play none none reverse"
        },
        y: 60,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out"
    });

    // Animate the counters
    const counters = document.querySelectorAll(".counter");
    
    counters.forEach(counter => {
        ScrollTrigger.create({
            trigger: ".trust-glass-panel",
            start: "top 85%",
            onEnter: () => {
                const target = +counter.getAttribute("data-target");
                const countObj = { val: 0 };
                
                gsap.to(countObj, {
                    val: target,
                    duration: 2.5,
                    ease: "power2.out", 
                    onUpdate: () => {
                        counter.innerText = Math.floor(countObj.val);
                    }
                });
            },
            once: true 
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. GSAP Scroll Trigger for Section Entrance ---
    gsap.registerPlugin(ScrollTrigger);

    gsap.set([".g-course-up", ".g-course-fade"], { autoAlpha: 1 });

    const courseTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".courses-premium",
            start: "top 75%",
            toggleActions: "play none none reverse"
        }
    });

    courseTl.from(".g-course-up", {
        y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out"
    })
    .from(".g-course-fade", {
        opacity: 0, scale: 0.95, duration: 1.5, ease: "power2.out"
    }, "-=1");

    // --- 2. Three.js: Holographic Subject Morphing Engine ---
    const container = document.getElementById('course-canvas');
    if(!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 15);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Ultra-Premium Crystal Glass Material
    const crystalMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, transmission: 1.0, opacity: 1, metalness: 0.1, roughness: 0.15,
        ior: 1.52, thickness: 2.5, clearcoat: 1.0, clearcoatRoughness: 0.1
    });

    // Object Group Container
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // --- Create the 4 Course Holograms ---
    const holograms = {};

    // 1. Nursing: 3D Medical Cross
    const crossGroup = new THREE.Group();
    const boxV = new THREE.BoxGeometry(1.2, 4, 1.2);
    const boxH = new THREE.BoxGeometry(4, 1.2, 1.2);
    const meshV = new THREE.Mesh(boxV, crystalMat);
    const meshH = new THREE.Mesh(boxH, crystalMat);
    crossGroup.add(meshV); crossGroup.add(meshH);
    holograms['nursing'] = crossGroup;

    // 2. Pharmacy: 3D Pill Capsule
    const capsuleGeo = new THREE.CapsuleGeometry(1.2, 2.5, 32, 32);
    const capsule = new THREE.Mesh(capsuleGeo, crystalMat);
    holograms['pharmacy'] = capsule;

    // 3. Lab Tech: Atom/Molecule Rings
    const atomGroup = new THREE.Group();
    const ringGeo = new THREE.TorusGeometry(2, 0.2, 16, 100);
    const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const ring1 = new THREE.Mesh(ringGeo, crystalMat); ring1.rotation.x = Math.PI/2;
    const ring2 = new THREE.Mesh(ringGeo, crystalMat); ring2.rotation.y = Math.PI/3; ring2.rotation.x = Math.PI/4;
    const ring3 = new THREE.Mesh(ringGeo, crystalMat); ring3.rotation.y = -Math.PI/3; ring3.rotation.x = Math.PI/4;
    const core = new THREE.Mesh(coreGeo, new THREE.MeshStandardMaterial({color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2}));
    atomGroup.add(ring1, ring2, ring3, core);
    holograms['lab'] = atomGroup;

    // 4. International: Glass Globe Wireframe
    const globeGeo = new THREE.IcosahedronGeometry(2.5, 2);
    const globeMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, wireframe: true, transmission: 1, thickness: 2 });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    const innerGlobe = new THREE.Mesh(new THREE.SphereGeometry(1.5, 32, 32), crystalMat);
    const globeGroup = new THREE.Group();
    globeGroup.add(globe, innerGlobe);
    holograms['international'] = globeGroup;

    // Add all to scene, scale to 0 to hide them initially
    Object.values(holograms).forEach(obj => {
        obj.scale.set(0, 0, 0);
        objectsGroup.add(obj);
    });

    // Start with Nursing
    holograms['nursing'].scale.set(1, 1, 1);
    let currentObject = holograms['nursing'];

    // --- Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); scene.add(ambientLight);
    const spotLight = new THREE.SpotLight(0xffffff, 8); spotLight.position.set(10, 20, 10); scene.add(spotLight);
    
    // Dynamic Rim Lights (These will change color based on the course)
    const rimLight1 = new THREE.PointLight(0x06b6d4, 10, 50); rimLight1.position.set(10, 5, -10); scene.add(rimLight1);
    const rimLight2 = new THREE.PointLight(0xc026d3, 10, 50); rimLight2.position.set(-10, -5, 10); scene.add(rimLight2);

    // --- 3. UI Interaction & GSAP Morphing ---
    const courseItems = document.querySelectorAll('.course-item');
    const hologramBase = document.querySelector('.hologram-base');
    
    // Colors for each course to change the lighting mood
    const courseColors = {
        'nursing': { c1: 0x06b6d4, c2: 0xc026d3, base: 'rgba(6, 182, 212, 0.2)' },      // Cyan/Magenta
        'pharmacy': { c1: 0x10b981, c2: 0x3b82f6, base: 'rgba(16, 185, 129, 0.2)' },    // Green/Blue
        'lab': { c1: 0xf59e0b, c2: 0xef4444, base: 'rgba(245, 158, 11, 0.2)' },         // Amber/Red
        'international': { c1: 0x6366f1, c2: 0x8b5cf6, base: 'rgba(99, 102, 241, 0.2)' } // Indigo/Purple
    };

    courseItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Remove active class from all, add to current
            courseItems.forEach(c => c.classList.remove('active'));
            item.classList.add('active');

            const targetKey = item.getAttribute('data-course');
            const targetObject = holograms[targetKey];
            const colors = courseColors[targetKey];

            if (currentObject !== targetObject) {
                // Morph Out Old Object
                gsap.to(currentObject.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: "back.in(1.2)" });
                gsap.to(currentObject.rotation, { y: "+=1", duration: 0.6 });

                // Morph In New Object
                gsap.to(targetObject.scale, { x: 1, y: 1, z: 1, duration: 0.8, ease: "elastic.out(1, 0.7)", delay: 0.3 });
                gsap.to(targetObject.rotation, { y: "-=1", duration: 0.8, delay: 0.3 });

                // Animate Lighting Colors
                gsap.to(rimLight1.color, { r: (colors.c1 >> 16 & 255)/255, g: (colors.c1 >> 8 & 255)/255, b: (colors.c1 & 255)/255, duration: 1 });
                gsap.to(rimLight2.color, { r: (colors.c2 >> 16 & 255)/255, g: (colors.c2 >> 8 & 255)/255, b: (colors.c2 & 255)/255, duration: 1 });
                
                // Update HTML Base Glow
                hologramBase.style.background = `radial-gradient(ellipse at center, ${colors.base} 0%, transparent 70%)`;

                currentObject = targetObject;
            }
        });
    });

    // --- 4. Render Loop ---
    const clock = new THREE.Clock();
    
    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        // Continuous elegant rotation for whichever object is active
        if(currentObject) {
            currentObject.rotation.y += 0.005;
            currentObject.rotation.x = Math.sin(time * 0.5) * 0.1;
            currentObject.position.y = Math.sin(time * 1.5) * 0.2; // Gentle floating
        }

        renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
        if(!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    });

    // --- 6. GSAP Hybrid About Section Reveal ---
    
    gsap.set(".g-about-wrapper", { autoAlpha: 1 });
    gsap.set(".g-about-up", { autoAlpha: 1 });

    // The Timeline for the section entrance
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".about-hybrid-premium",
            start: "top 75%",
            toggleActions: "play none none reverse"
        }
    });

    // Form the Massive Glass Card
    aboutTl.from(".g-about-wrapper", {
        scale: 0.95,
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power4.out"
    })
    // Fade in text elements, milestones & CTAs
    .from(".g-about-up", {
        y: 20,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        clearProps: "filter"
    }, "-=0.4")
    // Reveal staggered image stack inside the card
    .from(".stack-main", {
        scale: 0.9,
        opacity: 0,
        x: -20,
        duration: 0.7,
        ease: "power4.out"
    }, "-=0.4")
    .from(".stack-accent", {
        scale: 0.9,
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: "power3.out"
    }, "-=0.5")
    // Fade in the orbital ring & badges
    .from([".orbital-ring", ".year-badge", ".rotating-badge"], {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.5)"
    }, "-=0.4");

    // Independent Parallax effect for the main image
    gsap.to(".stack-main img", {
        scrollTrigger: {
            trigger: ".about-hybrid-premium",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        y: "15%",
        ease: "none"
    });

    // --- 6. GSAP Why Eduooz Reveal & Stacking ---
    gsap.set(".g-why-reveal", { autoAlpha: 1 });

    // Pin the sidebar while cards scroll
    ScrollTrigger.create({
        trigger: ".why-container",
        start: "top top",
        end: "bottom bottom",
        pin: ".why-sticky-sidebar",
        pinSpacing: false
    });

    // Reveal Sidebar Text
    gsap.from(".g-why-reveal", {
        scrollTrigger: {
            trigger: ".why-premium-section",
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        y: 40, opacity: 0, filter: "blur(10px)", 
        duration: 1, stagger: 0.15, ease: "power3.out", clearProps: "filter"
    });

    // Animate Cards Sliding up individually as you scroll
    const whyCards = document.querySelectorAll(".why-glass-card");
    whyCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%", // Triggers when each card enters the bottom 15% of screen
                toggleActions: "play none none reverse"
            },
            y: 80, opacity: 0, scale: 0.95,
            duration: 1.2, ease: "back.out(1.2)"
        });
    });

    // --- 7. Liquid Spotlight Hover Interaction ---
    // This tracks the mouse position relative to each card and updates CSS variables
    document.querySelectorAll('.spotlight-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position inside the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set CSS variables dynamically
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
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
                
                const statsStr = `${viewsStr} • ${dateStr}`;
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

    // --- 8. GSAP Cinematic Courses & Cursor Portal ---

    // Scroll Reveal for Courses
    gsap.set(".g-course-rev", { autoAlpha: 1 });
    gsap.fromTo(".g-course-rev", 
        { y: 50, opacity: 0, filter: "blur(15px)" },
        {
            scrollTrigger: {
                trigger: ".stack-courses-section",
                start: "top 75%"
            },
            y: 0, opacity: 1, filter: "blur(0px)", 
            duration: 1.2, stagger: 0.15, ease: "power3.out",
            clearProps: "filter" // Remove filter after animation to prevent text rendering artifacts
        }
    );

    // Hover & Accordion Logic
    const courseRows = document.querySelectorAll('.course-row');
    
    courseRows.forEach(row => {
        // Click to expand Accordion
        row.addEventListener('click', () => {
            // Close others
            courseRows.forEach(r => {
                if(r !== row) r.classList.remove('active');
            });
            // Toggle clicked
            row.classList.toggle('active');
        });
    });

    // Floating Cursor Portal Logic
    const portal = document.querySelector('.cursor-portal');
    const trackList = document.querySelector('.course-track-list');
    const portalImages = document.querySelectorAll('.portal-img');

    if (portal && trackList && window.innerWidth > 1024) {
        // GSAP quickTo for highly performant mouse trailing (Spring physics)
        const xTo = gsap.quickTo(portal, "x", {duration: 0.6, ease: "power3"});
        const yTo = gsap.quickTo(portal, "y", {duration: 0.6, ease: "power3"});

        // 1. Move portal on mousemove anywhere over the track list
        trackList.addEventListener("mousemove", (e) => {
            // Center the portal on the cursor (320px wide, 450px high -> offset by half)
            xTo(e.clientX - 160);
            yTo(e.clientY - 225);
        });

        // 2. Show portal when entering the list area
        trackList.addEventListener("mouseenter", () => {
            gsap.to(portal, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.5)" });
        });

        // 3. Hide portal when leaving the list area
        trackList.addEventListener("mouseleave", () => {
            gsap.to(portal, { scale: 0.5, opacity: 0, duration: 0.4, ease: "power2.in" });
        });

        // 4. Swap images dynamically based on which row is hovered
        courseRows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                const targetImgId = row.getAttribute('data-image');
                
                // Remove active class from all images
                portalImages.forEach(img => img.classList.remove('active'));
                
                // Add active class to the specific target image
                const activeImg = document.getElementById(targetImgId);
                if(activeImg) activeImg.classList.add('active');
            });
        });
    }
    // --- 7. GSAP Z-Axis Spatial Scroll (Why Eduooz) ---
    let mmSpatial = gsap.matchMedia();
    
    mmSpatial.add("(min-width: 320px)", () => {
        // Shortened scroll: each card transition = ~1 screen height of scroll
        const spatialTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".why-spatial-section",
                pin: true,
                scrub: 0.8,
                start: "top top",
                end: "+=200%" // 3 transitions across 2 screen heights = snappy
            }
        });

        // The Fly-Through Sequence
        // Transition 1: Card 1 leaves, Card 2 enters
        spatialTl.to(".z-card-1", { scale: 1.8, opacity: 0, filter: "blur(15px)", duration: 1 })
                 .fromTo(".z-card-2", { scale: 0.4, opacity: 0, filter: "blur(15px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");
                 
        // Transition 2: Card 2 leaves, Card 3 enters
        spatialTl.to(".z-card-2", { scale: 1.8, opacity: 0, filter: "blur(15px)", duration: 1 })
                 .fromTo(".z-card-3", { scale: 0.4, opacity: 0, filter: "blur(15px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");

        // Transition 3: Card 3 leaves, Card 4 enters
        spatialTl.to(".z-card-3", { scale: 1.8, opacity: 0, filter: "blur(15px)", duration: 1 })
                 .fromTo(".z-card-4", { scale: 0.4, opacity: 0, filter: "blur(15px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");
                 
        // Hold Card 4 briefly to prevent instant unpin
        spatialTl.to(".z-card-4", { scale: 1.02, duration: 0.3 });
    });

    // --- 8. Three.js: Enhanced Background Astrolabe (Gyroscope) ---
    const gyroContainer = document.getElementById('gyro-canvas');
    if(gyroContainer) {
        const gyroScene = new THREE.Scene();
        
        const gyroCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        gyroCamera.position.set(0, 0, 22);

        const gyroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "default" });
        gyroRenderer.setSize(window.innerWidth, window.innerHeight);
        gyroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        gyroContainer.appendChild(gyroRenderer.domElement);

        const gyroGroup = new THREE.Group();
        gyroScene.add(gyroGroup);

        // --- Generate Bright Environment for Frosted Glass ---
        // Without this, glass materials have nothing to refract and look dark
        const pmremGenerator = new THREE.PMREMGenerator(gyroRenderer);
        pmremGenerator.compileEquirectangularShader();
        const envScene = new THREE.Scene();
        envScene.background = new THREE.Color(0xe8e0f0); // Soft lavender-white
        // Brand-colored fill lights inside the env
        const envL1 = new THREE.PointLight(0xd4b3ff, 15, 100); envL1.position.set(10, 10, 10);
        const envL2 = new THREE.PointLight(0x7dd3fc, 15, 100); envL2.position.set(-10, -10, 10);
        const envL3 = new THREE.PointLight(0xffffff, 10, 100); envL3.position.set(0, 0, -10);
        envScene.add(envL1, envL2, envL3);
        const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
        gyroScene.environment = envTexture;
        pmremGenerator.dispose();

        // --- Premium Frosted Glass Ring Materials ---
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0xd4b3ff, transmission: 0.9, opacity: 1, metalness: 0.0, roughness: 0.4,
            ior: 1.5, thickness: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.1,
            envMapIntensity: 1.5, transparent: true
        });

        const ringMatAccent = new THREE.MeshPhysicalMaterial({
            color: 0x7dd3fc, transmission: 0.85, opacity: 1, metalness: 0.0, roughness: 0.35,
            ior: 1.5, thickness: 0.8, clearcoat: 1.0, clearcoatRoughness: 0.1,
            envMapIntensity: 1.5, transparent: true
        });

        // --- Main Interlocking Rings (thicker tubes for visibility) ---
        const meshRing1 = new THREE.Mesh(new THREE.TorusGeometry(7, 0.25, 24, 120), ringMat);
        const meshRing2 = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.3, 24, 120), ringMat);
        const meshRing3 = new THREE.Mesh(new THREE.TorusGeometry(4, 0.35, 24, 120), ringMatAccent);
        
        meshRing1.rotation.x = Math.PI / 2;
        meshRing2.rotation.y = Math.PI / 3;
        meshRing3.rotation.z = Math.PI / 4;
        gyroGroup.add(meshRing1, meshRing2, meshRing3);

        // --- Decorative Outer Rings ---
        const outerRingMat = new THREE.MeshPhysicalMaterial({
            color: 0xe0c3ff, transmission: 0.85, opacity: 0.8, metalness: 0.0, roughness: 0.45,
            clearcoat: 0.8, envMapIntensity: 1.2, transparent: true
        });
        const outerRing1 = new THREE.Mesh(new THREE.TorusGeometry(9, 0.08, 16, 150), outerRingMat);
        const outerRing2 = new THREE.Mesh(new THREE.TorusGeometry(10, 0.06, 16, 150), outerRingMat);
        outerRing1.rotation.x = Math.PI / 2.5;
        outerRing1.rotation.z = 0.3;
        outerRing2.rotation.x = Math.PI / 1.8;
        outerRing2.rotation.y = 0.6;
        gyroGroup.add(outerRing1, outerRing2);

        // --- Floating Particles Field ---
        const particlesCount = 200;
        const particlesGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particlesCount * 3);
        for(let i = 0; i < particlesCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMat = new THREE.PointsMaterial({
            color: 0xb97aff, size: 0.08, transparent: true, opacity: 0.6, sizeAttenuation: true
        });
        const particles = new THREE.Points(particlesGeo, particlesMat);
        gyroGroup.add(particles);

        // --- Glowing Core ---
        const coreGeo = new THREE.SphereGeometry(1.8, 64, 64);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.8,
            transparent: true, opacity: 0.9
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        gyroGroup.add(coreMesh);

        // Inner glow shell
        const glowGeo = new THREE.SphereGeometry(2.4, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0xa78bfa, transparent: true, opacity: 0.12
        });
        const glowMesh = new THREE.Mesh(glowGeo, glowMat);
        gyroGroup.add(glowMesh);

        // --- Rich Studio Lighting ---
        gyroScene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const gLight1 = new THREE.PointLight(0x06b6d4, 6, 50); gLight1.position.set(12, 8, 12);
        const gLight2 = new THREE.PointLight(0xc026d3, 6, 50); gLight2.position.set(-12, -8, 10);
        const gLight3 = new THREE.PointLight(0x7c3aed, 4, 40); gLight3.position.set(0, 12, -10);
        const gLight4 = new THREE.PointLight(0xfbbf24, 2, 40); gLight4.position.set(8, -10, 8);
        gyroScene.add(gLight1, gLight2, gLight3, gLight4);

        // --- Animation Loop ---
        const gClock = new THREE.Clock();
        function animateGyro() {
            requestAnimationFrame(animateGyro);
            const time = gClock.getElapsedTime();

            // Multi-axis rotation with varied speeds
            meshRing1.rotation.y = time * 0.15;
            meshRing1.rotation.z = Math.sin(time * 0.08) * 0.4;
            
            meshRing2.rotation.x = time * 0.25;
            meshRing2.rotation.z = Math.cos(time * 0.15) * 0.5;
            
            meshRing3.rotation.y = -time * 0.3;
            meshRing3.rotation.x = Math.sin(time * 0.2) * 0.6;

            // Outer rings drift slowly
            outerRing1.rotation.z = time * 0.05;
            outerRing1.rotation.y = Math.sin(time * 0.03) * 0.2;
            outerRing2.rotation.z = -time * 0.04;
            outerRing2.rotation.x = Math.cos(time * 0.04) * 0.15;

            // Particles gentle drift
            particles.rotation.y = time * 0.02;
            particles.rotation.x = Math.sin(time * 0.01) * 0.1;

            // Core breathes
            const coreScale = 1 + Math.sin(time * 1.5) * 0.08;
            coreMesh.scale.setScalar(coreScale);
            glowMesh.scale.setScalar(coreScale * 1.2);
            coreMat.emissiveIntensity = 0.6 + Math.sin(time * 2) * 0.3;

            gyroRenderer.render(gyroScene, gyroCamera);
        }
        animateGyro();

        // Scroll-synced rotation (matches the shorter 200% scroll)
        gsap.to(gyroGroup.rotation, {
            scrollTrigger: {
                trigger: ".why-spatial-section",
                start: "top top",
                end: "+=250%",
                scrub: 1
            },
            x: Math.PI * 2,
            y: Math.PI,
            ease: "none"
        });

        window.addEventListener('resize', () => {
            gyroCamera.aspect = window.innerWidth / window.innerHeight;
            gyroCamera.updateProjectionMatrix();
            gyroRenderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // --- 5. GSAP Z-Axis Stacking Cards (Courses Section) ---
    
    // Apply depth effect only on desktop where sticky height is defined
    let mmCards = gsap.matchMedia();
    
    mmCards.add("(min-width: 1025px)", () => {
        const wrappers = gsap.utils.toArray('.card-sticky-wrapper');
        
        wrappers.forEach((wrapper, index) => {
            // Don't apply the push-back animation to the last card
            if (index === wrappers.length - 1) return;
            
            const panel = wrapper.querySelector('.card-glass-panel');
            const nextWrapper = wrappers[index + 1];

            gsap.to(panel, {
                scale: 0.9,           // Shrink it into the background
                opacity: 0.4,         // Darken it
                y: -30,               // Shift it slightly up
                filter: "blur(8px)",  // Depth of field blur
                scrollTrigger: {
                    trigger: nextWrapper,
                    start: "top 85%", // Starts animating when the next card enters view
                    end: "top 25%",   // Finishes animating when next card is fully overlapping it
                    scrub: 1          // Tied smoothly to the scrollbar
                }
            });
        });
    });

    // Mobile specific blur-out effect when reaching the card's image
    mmCards.add("(max-width: 1024px)", () => {
        const wrappers = gsap.utils.toArray('.card-sticky-wrapper');
        
        wrappers.forEach((wrapper, index) => {
            if (index === wrappers.length - 1) return; // Skip last card
            
            const panel = wrapper.querySelector('.card-glass-panel');
            const imageEl = wrapper.querySelector('.liquid-image-mask');
            const nextWrapper = wrappers[index + 1];

            gsap.to(panel, {
                scale: 0.9,           // Push back effect
                y: -30,               // Shift up
                filter: "blur(10px)",
                opacity: 0.4,
                ease: "none",         // Linear ease is perfectly smooth for scroll scrubs
                scrollTrigger: {
                    trigger: imageEl,
                    start: "top 35%",     // Start when the top of the image hits the middle-bottom of screen
                    endTrigger: nextWrapper,
                    end: "top 25%",       // Spread out the animation until the next card reaches the top
                    scrub: 1.5            // High smoothing factor
                }
            });
        });
    });

    

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

    // --- Mobile Menu Toggle ---
    function initHeaderInteractions() {
        const menuToggle = document.getElementById('menu-toggle');
        const navLinksList = document.querySelector('.nav-links');
        const navItemsList = document.querySelectorAll('.nav-links a');

        if (menuToggle && navLinksList) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navLinksList.classList.toggle('active');
                document.body.style.overflow = navLinksList.classList.contains('active') ? 'hidden' : '';
            });

            navItemsList.forEach(item => {
                item.addEventListener('click', () => {
                    menuToggle.classList.remove('active');
                    navLinksList.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
        }
    }

    if (document.getElementById('menu-toggle')) {
        initHeaderInteractions();
    } else {
        window.addEventListener('headerLoaded', initHeaderInteractions);
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

    // --- 9. GSAP Cinematic Infinite Drag Faculty Carousel ---
    
    gsap.set(".g-fac-reveal", { autoAlpha: 1 });
    gsap.from(".g-fac-reveal", {
        scrollTrigger: { trigger: ".faculty-filmstrip-section", start: "top 75%" },
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1.2, stagger: 0.15, ease: "power3.out", clearProps: "filter"
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
        { name: "Dr. Anand", role: "Chief Director — Sciences", badge: "15+ Years", icon: '<i class="fa-solid fa-microscope"></i>', desc: "Mentored <strong>200+ Rank Holders</strong> in Biology & Competitive Exams", img: "https://images.unsplash.com/photo-1594824432258-f9b8c2be6d3a?auto=format&fit=crop&q=80&w=500" },
        { name: "Prof. Samuel John", role: "Lead Pharmacist Educator", badge: "M.Pharm", icon: '<i class="fa-solid fa-capsules"></i>', desc: "Ex-State Board Examiner — <strong>High-Yield Topic Specialist</strong>", img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=500" },
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
        y: 40, opacity: 0, filter: "blur(10px)", duration: 1, stagger: 0.15, ease: "power3.out", clearProps: "filter"
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

});