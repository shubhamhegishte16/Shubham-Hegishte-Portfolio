/* ===================================================
   APP.JS — Main orchestrator
   Tab switching, Typed.js, GSAP, counters, tilt, etc.
   =================================================== */

// ── Page Loader ─────────────────────────────────────────────────────────────
const loader = document.createElement('div');
loader.className = 'page-loader';
document.body.prepend(loader);
let loadPct = 0;
const loadInterval = setInterval(() => {
    loadPct += 15;
    loader.style.width = Math.min(loadPct, 90) + '%';
    if (loadPct >= 90) clearInterval(loadInterval);
}, 100);
window.addEventListener('load', () => {
    loader.style.width = '100%';
    setTimeout(() => { loader.style.opacity = '0'; }, 400);
    initHero();
});

// ── Typed.js ─────────────────────────────────────────────────────────────────
function initTyped() {
    new Typed('#typed-text', {
        strings: [
            'build cool stuff.',
            'love physics engines.',
            'make animations.',
            'drink too much chai.',
            'ship projects fast.',
            'learn every day.',
        ],
        typeSpeed: 60,
        backSpeed: 35,
        backDelay: 1800,
        loop: true,
        cursorChar: '|',
    });
}

// ── Hero init ────────────────────────────────────────────────────────────────
function initHero() {
    const heroLeft = document.querySelector('.hero-left');
    if (heroLeft) {
        heroLeft.classList.add('animated');
    }
    initTyped();
    initCounters();
}

// ── Tab Switching ────────────────────────────────────────────────────────────
function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // Update sections
    document.querySelectorAll('.tab-section').forEach(sec => {
        sec.classList.remove('active');
    });

    const target = document.getElementById('tab-' + tabName);
    if (target) {
        target.classList.add('active');
        // Re-trigger animation
        target.style.animation = 'none';
        target.offsetHeight; // reflow
        target.style.animation = '';

        // Special per-tab logic
        if (tabName === 'skills') {
            setTimeout(() => {
                window.dropInitialBalls && window.dropInitialBalls();
                animateSkillBars();
            }, 200);
        }
        if (tabName === 'home') {
            initCounters();
        }
        if (tabName === 'projects') {
            initTiltCards();
        }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Nav click listeners
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => switchTab(item.dataset.tab));
});

// CTA buttons (from HTML onclick)
window.switchTab = switchTab;

// ── Counter Animation ────────────────────────────────────────────────────────
function initCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
        const target = parseInt(el.dataset.count);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current) + (el.parentElement.querySelector('.stat-label').textContent === '% Passion' ? '' : '+');
        }, 30);
    });
}

// ── Skill Bars Animation ─────────────────────────────────────────────────────
function animateSkillBars() {
    document.querySelectorAll('.skill-fill').forEach((bar, i) => {
        const width = bar.dataset.width || 0;
        setTimeout(() => {
            bar.style.width = width + '%';
        }, i * 100);
    });
}

// ── 3D Tilt Effect on Project Cards ─────────────────────────────────────────
function initTiltCards() {
    document.querySelectorAll('.project-card[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const rotX = -dy * 10;
            const rotY = dx * 10;
            card.style.transform = `
        perspective(800px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        translateY(-12px)
        scale(1.01)
      `;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        });

        // Make the whole card clickable — opens the primary link
        card.addEventListener('click', (e) => {
            // If the click already originated from an anchor tag, let it work normally
            if (e.target.closest('a')) return;
            const link = card.querySelector('.proj-link.primary');
            if (link && link.href && !link.href.endsWith('#')) {
                window.open(link.href, '_blank');
            }
        });
    });
}

// ── Navbar Scroll Shrink ──────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── GSAP Animations (project cards) ─────────────────────────────────────────
function gsapAnimateProjects() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from('.project-card', {
        opacity: 0,
        y: 60,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.4)',
    });

    gsap.from('.skill-category', {
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out',
    });
}

// ── Skills tab init (when re-entering) ───────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.tab === 'skills') {
        item.addEventListener('click', () => {
            setTimeout(animateSkillBars, 300);
        });
    }
    if (item.dataset.tab === 'projects') {
        item.addEventListener('click', () => {
            setTimeout(gsapAnimateProjects, 100);
            setTimeout(initTiltCards, 200);
        });
    }
});

// ── Particle burst on hero title hover ───────────────────────────────────────
const titleName = document.querySelector('.title-name');
if (titleName) {
    titleName.addEventListener('mouseenter', createParticleBurst);
}

function createParticleBurst() {
    const colors = ['#a855f7', '#22d3ee', '#f472b6', '#4ade80', '#f59e0b'];
    for (let i = 0; i < 16; i++) {
        const p = document.createElement('div');
        const angle = (i / 16) * Math.PI * 2;
        const dist = 40 + Math.random() * 60;
        p.style.cssText = `
      position: fixed;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: 50%; top: 50%;
      pointer-events: none;
      z-index: 9998;
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
      animation: particle-burst 0.7s ease forwards;
    `;
        document.body.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
    }
}

// ── Contact form submit ───────────────────────────────────────────────────────
window.handleFormSubmit = function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('.submit-btn');
    const successEl = document.getElementById('formSuccess');

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending... ✈️';

    // Simulate send
    setTimeout(() => {
        btn.querySelector('.btn-text').textContent = 'Sent! ✅';
        successEl.classList.add('show');
        e.target.reset();

        setTimeout(() => {
            btn.disabled = false;
            btn.querySelector('.btn-text').textContent = 'Send Message 🚀';
            successEl.classList.remove('show');
        }, 4000);
    }, 1500);
};

// ── Init on home by default ──────────────────────────────────────────────────
(function () {
    // Ensure home is shown on load
    initTiltCards();
    gsapAnimateProjects();

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const tabs = ['home', 'projects', 'skills', 'about', 'contact'];
        const numKey = parseInt(e.key);
        if (numKey >= 1 && numKey <= tabs.length) {
            switchTab(tabs[numKey - 1]);
        }
    });
})();
