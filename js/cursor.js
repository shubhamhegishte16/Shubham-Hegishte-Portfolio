/* ===================================================
   CURSOR.JS — Custom magnetic cursor with trail
   =================================================== */

(function() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let dotX   = 0, dotY   = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Smooth lag for ring
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    dotX  += (mouseX - dotX)  * 0.35;
    dotY  += (mouseY - dotY)  * 0.35;

    dot.style.left  = dotX  + 'px';
    dot.style.top   = dotY  + 'px';
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    raf = requestAnimationFrame(animate);
  }
  animate();

  // Hover effects
  const hoverEls = document.querySelectorAll('a, button, .nav-item, .project-card, .contact-link');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(0.4)';
      ring.style.width     = '54px';
      ring.style.height    = '54px';
      ring.style.borderColor = 'var(--neon-cyan)';
      ring.style.background  = 'rgba(34,211,238,0.06)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(1)';
      ring.style.width     = '36px';
      ring.style.height    = '36px';
      ring.style.borderColor = 'var(--neon-purple)';
      ring.style.background  = 'transparent';
    });
  });

  // Click burst
  document.addEventListener('click', (e) => {
    createClickRipple(e.clientX, e.clientY);
  });

  function createClickRipple(x, y) {
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.cssText = `
      position: fixed;
      left: ${x}px; top: ${y}px;
      width: 20px; height: 20px;
      margin-left: -10px; margin-top: -10px;
      pointer-events: none;
    `;
    document.body.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  }
})();
