document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. GSAP UI Premium Entrances ---
    const tl = gsap.timeline();

    gsap.set([".g-reveal", ".g-visual"], { autoAlpha: 1 });

    tl.from(".g-reveal", {
        y: 50, opacity: 0, filter: "blur(15px)", 
        duration: 1.2, stagger: 0.15, ease: "power3.out", delay: 0.2
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
            const navbar = document.getElementById("navbar");
            ScrollTrigger.create({
                start: 500, // Trigger when scrolled 500px down
                onEnter: () => navbar.classList.add("light-mode"),
                onLeaveBack: () => navbar.classList.remove("light-mode")
            });



    // --- 2. Three.js: Frosted Glass DNA with Assembly Animation ---
    const container = document.getElementById('cinematic-canvas');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0514, 0.015); // Adds depth to the shadows
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 0, 45);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Enable Hyper-Realistic Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
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

    // Position entire group to the right
    dnaGroup.position.x = 14;
    dnaGroup.rotation.z = Math.PI / 12;

    // --- 3. Studio Lighting (Crucial for Shadows and Frosted Glass) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);

    // Main Spotlight (Casts crisp, soft shadows through the glass)
    const spotLight = new THREE.SpotLight(0xffffff, 5);
    spotLight.position.set(15, 25, 25);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048; // High res shadows
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    // Colored Rim Lights for the frosted edges
    const rimCyan = new THREE.PointLight(0x06b6d4, 8, 50); 
    rimCyan.position.set(20, 5, -15); 
    scene.add(rimCyan);
    
    const rimMagenta = new THREE.PointLight(0xc026d3, 8, 50); 
    rimMagenta.position.set(0, -10, 10); 
    scene.add(rimMagenta);

    // --- 4. Render Loop ---
    const clock = new THREE.Clock();
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

        // Mouse Parallax
        gsap.to(dnaGroup.rotation, {
            x: mouseY * 0.15,
            duration: 1,
            ease: "power2.out"
        });

        renderer.render(scene, camera);
    }
    animate();

    // Responsive
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if(window.innerWidth < 1024) {
            dnaGroup.position.x = 0; dnaGroup.position.z = -20;
        } else {
            dnaGroup.position.x = 14; dnaGroup.position.z = 0;
        }
    });
    window.dispatchEvent(new Event('resize'));
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
            trigger: ".trust-section-contained",
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

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        ease: "power3.out"
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
        duration: 1, stagger: 0.15, ease: "power3.out"
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
        duration: 1.2, stagger: 0.15, ease: "power3.out"
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

    // Initialization: Force the 3rd child in the DOM to be the initially active, centered card
    if (playlistTrack && playlistTrack.children.length > 2) {
        playlistCards.forEach(c => c.classList.remove('active'));
        playlistTrack.children[2].classList.add('active');
        
        // Sync the main portal
        const initialImg = playlistTrack.children[2].getAttribute('data-img');
        const initialTitle = playlistTrack.children[2].getAttribute('data-title');
        const initialDesc = playlistTrack.children[2].getAttribute('data-desc');
        const initialStats = playlistTrack.children[2].getAttribute('data-stats');
        const initialUrl = playlistTrack.children[2].getAttribute('data-url');
        
        if (activeVidImg) activeVidImg.src = initialImg;
        if (activeVidTitle) activeVidTitle.innerText = initialTitle;
        if (activeVidDesc) activeVidDesc.innerText = initialDesc;
        const statsEl = document.getElementById('active-vid-stats');
        if (statsEl && initialStats) statsEl.innerText = initialStats;
        const linkEl = document.querySelector('.yt-badge');
        if (linkEl && initialUrl) linkEl.href = initialUrl;
    }

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

    // Trigger background fetch for all localized cards on load
    playlistCards.forEach(card => fetchYTMetadataRealtime(card));

    let mainPortalSyncTL = null;
    
    const syncMainPortal = (card) => {
        if (!card) return;
        
        // Enforce DOM level Active CSS swapping
        playlistCards.forEach(c => c.classList.remove('active'));
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

    playlistCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if(window.lastDragDist > 10) { e.preventDefault(); return; }
            if(isAnimating) return;

            const index = Array.from(playlistTrack.children).indexOf(card);
            if (index === 2 && card.classList.contains('active')) return;

            syncMainPortal(card);

            const dist = index - 2;
            if (dist !== 0) {
                isAnimating = true;
                if (dist > 0) {
                    gsap.to(playlistTrack, { x: -280 * dist, duration: 0.5, ease: "power2.out", onComplete: () => {
                        for(let i=0; i<dist; i++) playlistTrack.appendChild(playlistTrack.firstElementChild);
                        gsap.set(playlistTrack, { x: 0 });
                        isAnimating = false;
                    }});
                } else {
                    const absDist = Math.abs(dist);
                    for(let i=0; i<absDist; i++) playlistTrack.prepend(playlistTrack.lastElementChild);
                    gsap.set(playlistTrack, { x: -280 * absDist });
                    gsap.to(playlistTrack, { x: 0, duration: 0.5, ease: "power2.out", onComplete: () => isAnimating = false });
                }
            }
        });
    });

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

    // --- 8. Seamless Infinite Grab & Swipe Logic ---
    let isDragging = false;
    let startX = 0;
    const cardWidth = 280; 

    const pointerDown = (e) => {
        if (isAnimating || !playlistTrack) return;
        isDragging = true;
        window.lastDragDist = 0;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        playlistTrack.style.cursor = 'grabbing';
        if (autoSlideInterval) clearInterval(autoSlideInterval);
    };

    const pointerMove = (e) => {
        if (!isDragging || isAnimating) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        let walk = x - startX;
        
        // True infinite loop DOM manipulation during active Drag
        if (walk <= -cardWidth) {
            playlistTrack.appendChild(playlistTrack.firstElementChild);
            startX -= cardWidth; walk += cardWidth;
            syncMainPortal(playlistTrack.children[2]);
        } else if (walk >= cardWidth) {
            playlistTrack.prepend(playlistTrack.lastElementChild);
            startX += cardWidth; walk -= cardWidth;
            syncMainPortal(playlistTrack.children[2]);
        }
        
        window.lastDragDist += Math.abs(walk); // Ensure clicks disable gracefully
        gsap.set(playlistTrack, { x: walk });
    };

    const pointerUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        playlistTrack.style.cursor = 'grab';

        const endX = e.type.includes('mouse') ? e.pageX : (e.changedTouches ? e.changedTouches[0].clientX : startX);
        const walk = endX - startX;

        if (walk < -50 && !isAnimating) {
            isAnimating = true;
            gsap.to(playlistTrack, { x: -cardWidth, duration: 0.35, ease: "power2.out", onComplete: () => {
                playlistTrack.appendChild(playlistTrack.firstElementChild);
                gsap.set(playlistTrack, { x: 0 });
                syncMainPortal(playlistTrack.children[2]);
                isAnimating = false;
            }});
        } else if (walk > 50 && !isAnimating) {
            isAnimating = true;
            gsap.to(playlistTrack, { x: cardWidth, duration: 0.35, ease: "power2.out", onComplete: () => {
                playlistTrack.prepend(playlistTrack.lastElementChild);
                gsap.set(playlistTrack, { x: 0 });
                syncMainPortal(playlistTrack.children[2]);
                isAnimating = false;
            }});
        } else {
            // Snap back to precise center if lazy swipe
            gsap.to(playlistTrack, { x: 0, duration: 0.3, ease: "power2.out" });
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
    gsap.from(".g-course-rev", {
        scrollTrigger: {
            trigger: ".luxury-courses-section",
            start: "top 75%"
        },
        y: 50, opacity: 0, filter: "blur(10px)", 
        duration: 1, stagger: 0.15, ease: "power3.out"
    });

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
        // Pin the section for 400vh to allow a long, smooth scrub through the cards
        const spatialTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".why-spatial-section",
                pin: true,
                scrub: 1, // Smooth dragging effect linked to scrollbar
                start: "top top",
                end: "+=400%" // User scrolls for 4 screen heights to finish the animation
            }
        });

        // The Fly-Through Sequence
        // Transition 1: Card 1 leaves, Card 2 enters
        spatialTl.to(".z-card-1", { scale: 2, opacity: 0, filter: "blur(20px)", duration: 1 })
                 .fromTo(".z-card-2", { scale: 0.3, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");
                 
        // Transition 2: Card 2 leaves, Card 3 enters
        spatialTl.to(".z-card-2", { scale: 2, opacity: 0, filter: "blur(20px)", duration: 1 })
                 .fromTo(".z-card-3", { scale: 0.3, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");

        // Transition 3: Card 3 leaves, Card 4 enters
        spatialTl.to(".z-card-3", { scale: 2, opacity: 0, filter: "blur(20px)", duration: 1 })
                 .fromTo(".z-card-4", { scale: 0.3, opacity: 0, filter: "blur(20px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1 }, "<");
                 
        // Hold Card 4 for a moment before unpinning
        spatialTl.to(".z-card-4", { scale: 1.05, duration: 0.5 });
    });

    // --- 8. Three.js: The Background Astrolabe (Gyroscope) ---
    const gyroContainer = document.getElementById('gyro-canvas');
    if(gyroContainer) {
        const gyroScene = new THREE.Scene();
        
        const gyroCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        gyroCamera.position.set(0, 0, 25);

        const gyroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        gyroRenderer.setSize(window.innerWidth, window.innerHeight);
        gyroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gyroContainer.appendChild(gyroRenderer.domElement);

        const gyroGroup = new THREE.Group();
        gyroScene.add(gyroGroup);

        // Premium Glass Material for the Rings
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff, transmission: 0.9, opacity: 1, metalness: 0.1, roughness: 0.3,
            ior: 1.5, thickness: 1.0, clearcoat: 0.8, clearcoatRoughness: 0.1
        });

        // Create 3 interlocking rings to form the Astrolabe
        const ringGeo1 = new THREE.TorusGeometry(8, 0.15, 16, 100);
        const ringGeo2 = new THREE.TorusGeometry(6.5, 0.2, 16, 100);
        const ringGeo3 = new THREE.TorusGeometry(5, 0.3, 16, 100);

        const meshRing1 = new THREE.Mesh(ringGeo1, ringMat);
        const meshRing2 = new THREE.Mesh(ringGeo2, ringMat);
        const meshRing3 = new THREE.Mesh(ringGeo3, ringMat);

        // Rotate them differently to create the gyroscope shape
        meshRing1.rotation.x = Math.PI / 2;
        meshRing2.rotation.y = Math.PI / 3;
        meshRing3.rotation.z = Math.PI / 4;

        gyroGroup.add(meshRing1, meshRing2, meshRing3);

        // A glowing core in the center representing the student/knowledge
        const coreGeo = new THREE.SphereGeometry(1.5, 32, 32);
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x4c127e, emissive: 0x4c127e, emissiveIntensity: 0.5 });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        gyroGroup.add(coreMesh);

        // Studio Lighting
        const gAmbient = new THREE.AmbientLight(0xffffff, 0.6); gyroScene.add(gAmbient);
        const gLight1 = new THREE.PointLight(0x06b6d4, 5, 50); gLight1.position.set(10, 10, 10); gyroScene.add(gLight1);
        const gLight2 = new THREE.PointLight(0xc026d3, 5, 50); gLight2.position.set(-10, -10, 10); gyroScene.add(gLight2);

        // Animate the Gyroscope
        const gClock = new THREE.Clock();
        function animateGyro() {
            requestAnimationFrame(animateGyro);
            const time = gClock.getElapsedTime();

            // Interlocking multi-axis rotation
            meshRing1.rotation.y = time * 0.2;
            meshRing1.rotation.z = Math.sin(time * 0.1) * 0.5;
            
            meshRing2.rotation.x = time * 0.3;
            meshRing2.rotation.z = Math.cos(time * 0.2) * 0.5;
            
            meshRing3.rotation.y = -time * 0.4;
            meshRing3.rotation.x = Math.sin(time * 0.3) * 0.5;

            // Core pulses slightly
            coreMesh.scale.setScalar(1 + Math.sin(time * 2) * 0.05);

            gyroRenderer.render(gyroScene, gyroCamera);
        }
        animateGyro();

        // Tie the master group rotation to the scrollbar for absolute immersion
        gsap.to(gyroGroup.rotation, {
            scrollTrigger: {
                trigger: ".why-spatial-section",
                start: "top top",
                end: "+=400%",
                scrub: 1
            },
            x: Math.PI * 2, // Does a full backflip as user scrolls through the 4 cards
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
});
