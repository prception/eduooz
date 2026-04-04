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
        delay: 0.5 
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

    // --- 4. Three.js: Frosted Glass DNA with Assembly Animation ---
    const container = document.getElementById('cinematic-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0514, 0.015); 
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 0, 45);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // Perfect Frosted Glass Material
    const frostedGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.95,
        opacity: 1,
        metalness: 0.1,
        roughness: 0.5, 
        ior: 1.45,
        thickness: 2.5, 
        clearcoat: 0.8, 
        clearcoatRoughness: 0.2
    });

    const glowMatCyan = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 2 });
    const glowMatMagenta = new THREE.MeshStandardMaterial({ color: 0xc026d3, emissive: 0xc026d3, emissiveIntensity: 2 });

    const numNodes = 100;
    const radius = 5.5;
    const heightStep = 0.65;
    
    const sphereGeo = new THREE.SphereGeometry(1.1, 32, 32);
    const connectionGeo = new THREE.CylinderGeometry(0.2, 0.2, radius * 2, 16);

    const dnaPieces = [];

    for (let i = 0; i < numNodes; i++) {
        const angle = i * 0.18;
        const targetY = (i - numNodes / 2) * heightStep;

        const targetX1 = Math.cos(angle) * radius; 
        const targetZ1 = Math.sin(angle) * radius;
        const targetX2 = Math.cos(angle + Math.PI) * radius; 
        const targetZ2 = Math.sin(angle + Math.PI) * radius;

        const node1 = new THREE.Mesh(sphereGeo, frostedGlassMat);
        node1.castShadow = true; node1.receiveShadow = true;
        dnaGroup.add(node1);
        
        const node2 = new THREE.Mesh(sphereGeo, frostedGlassMat);
        node2.castShadow = true; node2.receiveShadow = true;
        dnaGroup.add(node2);

        dnaPieces.push({ mesh: node1, tX: targetX1, tY: targetY, tZ: targetZ1, delay: i * 0.02 });
        dnaPieces.push({ mesh: node2, tX: targetX2, tY: targetY, tZ: targetZ2, delay: i * 0.02 });

        if (i % 3 === 0) {
            const rung = new THREE.Mesh(connectionGeo, i % 2 === 0 ? glowMatCyan : glowMatMagenta);
            rung.castShadow = true; rung.receiveShadow = true;
            dnaGroup.add(rung);
            
            dnaPieces.push({ 
                mesh: rung, 
                tX: 0, tY: targetY, tZ: 0, 
                tRotY: -angle, tRotZ: Math.PI / 2,
                delay: i * 0.02 + 0.5, 
                isRung: true 
            });
        }
    }

    // Assembly Animation
    dnaPieces.forEach(piece => {
        const explodeRadius = 60;
        piece.mesh.position.set(
            (Math.random() - 0.5) * explodeRadius,
            (Math.random() - 0.5) * explodeRadius - 20, 
            (Math.random() - 0.5) * explodeRadius
        );
        piece.mesh.scale.set(0, 0, 0); 

        if (piece.isRung) {
            piece.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        }

        gsap.to(piece.mesh.position, {
            x: piece.tX, y: piece.tY, z: piece.tZ,
            duration: 2.5, ease: "expo.out", delay: 1.5 + piece.delay 
        });

        gsap.to(piece.mesh.scale, {
            x: 1, y: 1, z: 1,
            duration: 2, ease: "back.out(1.5)", delay: 1.5 + piece.delay
        });

        if (piece.isRung) {
            gsap.to(piece.mesh.rotation, {
                x: 0, y: piece.tRotY, z: piece.tRotZ,
                duration: 2.5, ease: "expo.out", delay: 1.5 + piece.delay
            });
        }
    });

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); 
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 5);
    spotLight.position.set(15, 25, 25);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048; 
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.bias = -0.0001;
    scene.add(spotLight);

    const rimCyan = new THREE.PointLight(0x06b6d4, 8, 50); 
    rimCyan.position.set(20, 5, -15); 
    scene.add(rimCyan);
    
    const rimMagenta = new THREE.PointLight(0xc026d3, 8, 50); 
    rimMagenta.position.set(0, -10, 10); 
    scene.add(rimMagenta);

    // Render Loop
    const clock = new THREE.Clock();
    let mouseX = 0; let mouseY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        const time = clock.getElapsedTime();

        dnaGroup.rotation.y += 0.002;
        dnaGroup.position.y = Math.sin(time * 0.8) * 1.5;

        gsap.to(dnaGroup.rotation, {
            x: mouseY * 0.15,
            duration: 1,
            ease: "power2.out"
        });

        renderer.render(scene, camera);
    }
    animate();

    // Responsive Positioning
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (window.innerWidth < 768) {
            dnaGroup.position.x = 0; 
            dnaGroup.position.z = -30;
        } else if (window.innerWidth < 1024) {
            dnaGroup.position.x = 8; 
            dnaGroup.position.z = -15;
        } else {
            dnaGroup.position.x = 14; 
            dnaGroup.position.z = 0;
        }
    });
    window.dispatchEvent(new Event('resize'));
});