/* ===================================================
   PHYSICS.JS — Matter.js real physics simulation
   =================================================== */

(function () {
    const { Engine, Render, Runner, Bodies, Body, World, Events, Mouse, MouseConstraint } = Matter;

    // ─── Skills physics zone ───────────────────────────────────────────────────
    const container = document.getElementById('skillsPhysicsZone');
    const canvas = document.getElementById('skillsCanvas');

    let engine, world, runner, render;
    let initialized = false;

    const SKILLS = [
        { label: 'HTML', color: '#e34c26' },
        { label: 'CSS', color: '#264de4' },
        { label: 'JS', color: '#f0db4f' },
        { label: 'React', color: '#61dafb' },
        { label: 'Python', color: '#3776ab' },
        { label: 'Node', color: '#68a063' },
        { label: '3D', color: '#a855f7' },
        { label: 'GSAP', color: '#88ce02' },
        { label: 'Git', color: '#f05033' },
        { label: 'API', color: '#22d3ee' },
    ];

    function initPhysics() {
        if (initialized) return;
        initialized = true;

        const W = container.offsetWidth;
        const H = container.offsetHeight;

        engine = Engine.create({ gravity: { y: 1.5 } });
        world = engine.world;

        render = Render.create({
            canvas: canvas,
            engine: engine,
            options: {
                width: W,
                height: H,
                wireframes: false,
                background: 'transparent',
            },
        });

        // Walls
        const wallOpts = { isStatic: true, render: { fillStyle: 'transparent', strokeStyle: 'transparent' } };
        const ground = Bodies.rectangle(W / 2, H + 25, W, 50, wallOpts);
        const left = Bodies.rectangle(-25, H / 2, 50, H, wallOpts);
        const right = Bodies.rectangle(W + 25, H / 2, 50, H, wallOpts);
        World.add(world, [ground, left, right]);

        // Mouse interaction
        const mouse = Mouse.create(canvas);
        const mc = MouseConstraint.create(engine, {
            mouse,
            constraint: { stiffness: 0.2, render: { visible: false } },
        });
        World.add(world, mc);
        render.mouse = mouse;

        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);

        // Custom render on top (labels)
        Events.on(render, 'afterRender', function () {
            const ctx = render.context;
            world.bodies.forEach(body => {
                if (body.label && body.label !== 'Rectangle Body' && body.isStatic === false) {
                    ctx.save();
                    ctx.translate(body.position.x, body.position.y);
                    ctx.rotate(body.angle);
                    ctx.font = 'bold 11px JetBrains Mono, monospace';
                    ctx.fillStyle = '#0a0f1e';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(body.label, 0, 0);
                    ctx.restore();
                }
            });
        });

        // Hide hint after first drop
        const hint = container.querySelector('.physics-hint');

        // Click to drop ball
        container.addEventListener('click', (e) => {
            hint.style.opacity = '0';
            const rect = container.getBoundingClientRect();
            dropBall(e.clientX - rect.left, 20);
        });
    }

    let dropIdx = 0;
    function dropBall(x, y) {
        const skill = SKILLS[dropIdx % SKILLS.length];
        dropIdx++;

        const radius = 28 + Math.random() * 14;
        const ball = Bodies.circle(x, y, radius, {
            restitution: 0.6,
            friction: 0.3,
            frictionAir: 0.01,
            label: skill.label,
            render: {
                fillStyle: skill.color,
                strokeStyle: 'rgba(255,255,255,0.3)',
                lineWidth: 1.5,
            },
        });

        // Random slight velocity
        Body.setVelocity(ball, {
            x: (Math.random() - 0.5) * 6,
            y: -2,
        });

        World.add(world, ball);
    }

    // Auto-drop some balls when tab opens
    window.dropInitialBalls = function () {
        if (!initialized) initPhysics();
        setTimeout(() => { const W = container.offsetWidth; dropBall(W * 0.2, 20); }, 200);
        setTimeout(() => { const W = container.offsetWidth; dropBall(W * 0.5, 20); }, 500);
        setTimeout(() => { const W = container.offsetWidth; dropBall(W * 0.8, 20); }, 800);
        setTimeout(() => { const W = container.offsetWidth; dropBall(W * 0.35, 20); }, 1100);
        setTimeout(() => { const W = container.offsetWidth; dropBall(W * 0.65, 20); }, 1400);
    };

    // Also observe when skills section becomes visible
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !initialized) {
            initPhysics();
            setTimeout(window.dropInitialBalls, 300);
        }
    }, { threshold: 0.3 });

    if (container) observer.observe(container);

    // Handle resize
    window.addEventListener('resize', () => {
        if (!render) return;
        const W = container.offsetWidth;
        const H = container.offsetHeight;
        render.options.width = W;
        render.options.height = H;
        render.canvas.width = W;
        render.canvas.height = H;
    });

    // Expose for app.js
    window._physicsInitialized = function () { return initialized; };
    window._initPhysics = initPhysics;
})();
