/* ===================================================
   PARTICLES.JS — Three.js starfield + floating shapes
   =================================================== */

(function () {
    const canvas = document.getElementById('bgCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    // === STAR FIELD ===
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        starPos[i * 3 + 0] = (Math.random() - 0.5) * 300;
        starPos[i * 3 + 1] = (Math.random() - 0.5) * 300;
        starPos[i * 3 + 2] = (Math.random() - 0.5) * 300;
        starSizes[i] = Math.random() * 2 + 0.5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
        color: 0x8855ff,
        size: 0.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Second star layer (cyan)
    const starGeo2 = new THREE.BufferGeometry();
    const starPos2 = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
        starPos2[i * 3 + 0] = (Math.random() - 0.5) * 200;
        starPos2[i * 3 + 1] = (Math.random() - 0.5) * 200;
        starPos2[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    starGeo2.setAttribute('position', new THREE.BufferAttribute(starPos2, 3));
    const starMat2 = new THREE.PointsMaterial({ color: 0x22d3ee, size: 0.3, transparent: true, opacity: 0.4 });
    const stars2 = new THREE.Points(starGeo2, starMat2);
    scene.add(stars2);

    // === FLOATING GEOMETRIC SHAPES ===
    const shapes = [];
    const shapeMats = [
        new THREE.MeshPhongMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.25 }),
        new THREE.MeshPhongMaterial({ color: 0x06b6d4, wireframe: true, transparent: true, opacity: 0.20 }),
        new THREE.MeshPhongMaterial({ color: 0xf472b6, wireframe: true, transparent: true, opacity: 0.15 }),
    ];

    const shapeGeos = [
        new THREE.OctahedronGeometry(8, 0),
        new THREE.IcosahedronGeometry(7, 0),
        new THREE.TetrahedronGeometry(9, 0),
        new THREE.OctahedronGeometry(5, 0),
        new THREE.IcosahedronGeometry(4, 0),
    ];

    for (let i = 0; i < 8; i++) {
        const geo = shapeGeos[i % shapeGeos.length];
        const mat = shapeMats[i % shapeMats.length];
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(
            (Math.random() - 0.5) * 120,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 60 - 20
        );
        mesh.userData = {
            rotX: (Math.random() - 0.5) * 0.006,
            rotY: (Math.random() - 0.5) * 0.006,
            floatY: Math.random() * Math.PI * 2,
            floatSpeed: 0.005 + Math.random() * 0.01,
            floatAmp: 2 + Math.random() * 4,
            baseY: mesh.position.y,
        };
        scene.add(mesh);
        shapes.push(mesh);
    }

    // Ambient light
    scene.add(new THREE.AmbientLight(0x8855ff, 0.5));
    const pLight = new THREE.PointLight(0x22d3ee, 1, 200);
    pLight.position.set(0, 50, 50);
    scene.add(pLight);

    // Mouse parallax
    let mouseNX = 0, mouseNY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseNX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseNY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.004;

        // Rotate stars
        stars.rotation.y += 0.0003;
        stars2.rotation.y -= 0.0002;
        stars.rotation.x += 0.0001;

        // Parallax camera
        camera.position.x += (mouseNX * 8 - camera.position.x) * 0.04;
        camera.position.y += (-mouseNY * 5 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        // Float shapes
        shapes.forEach(m => {
            m.rotation.x += m.userData.rotX;
            m.rotation.y += m.userData.rotY;
            m.userData.floatY += m.userData.floatSpeed;
            m.position.y = m.userData.baseY + Math.sin(m.userData.floatY) * m.userData.floatAmp;
        });

        // Pulse star opacity
        starMat.opacity = 0.4 + Math.sin(t) * 0.2;

        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
})();
