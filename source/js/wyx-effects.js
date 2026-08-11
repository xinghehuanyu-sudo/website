/**
 * WYX LAB — Intro Animation + Global Particle Background
 * ========================================================
 * 1. Intro overlay: particle assembly + typewriter + progress bar
 * 2. Global canvas: star-field particle network that follows mouse
 */
(function () {
  'use strict';

  /* ============================================================
     UTIL
  ============================================================ */
  const qs = (s, p = document) => p.querySelector(s);
  const rnd = (min, max) => Math.random() * (max - min) + min;

  /* ============================================================
     1. INTRO OVERLAY
  ============================================================ */
  function buildIntro() {
    if (document.getElementById('wyx-intro')) return; // pjax guard

    const overlay = document.createElement('div');
    overlay.id = 'wyx-intro';
    overlay.innerHTML = `
      <canvas id="intro-canvas"></canvas>

      <!-- split-curtain panels -->
      <div class="intro-curtain-l"></div>
      <div class="intro-curtain-r"></div>

      <!-- rotating rings -->
      <div class="intro-hex-ring"></div>
      <div class="intro-hex-ring"></div>
      <div class="intro-hex-ring"></div>

      <!-- corner brackets -->
      <div class="intro-corner intro-corner-tl"></div>
      <div class="intro-corner intro-corner-tr"></div>
      <div class="intro-corner intro-corner-bl"></div>
      <div class="intro-corner intro-corner-br"></div>

      <div class="intro-content">
        <div class="intro-logo">
          <div class="intro-logo-glow"></div>
          <span class="logo-text">W</span><span class="logo-text">YX</span><span class="logo-text">&nbsp;LAB</span>
        </div>
        <div class="intro-subtitle"><span id="intro-typed"></span><span class="cursor"></span></div>
        <div class="intro-progress-wrap">
          <div class="intro-progress-label">
            <span>INITIALIZING</span><span id="intro-pct">0%</span>
          </div>
          <div class="intro-progress-track"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // --- mini particle burst inside intro canvas ---
    initIntroBurst(document.getElementById('intro-canvas'));

    // --- typewriter ---
    const phrases = ['记录学习和生活的点滴', 'Personal Lab & Blog', 'wyxlab.top'];
    typeWriter(document.getElementById('intro-typed'), phrases[Math.floor(rnd(0, phrases.length))]);

    // --- progress counter ---
    animatePercent(document.getElementById('intro-pct'), 2200);

    // --- curtain-reveal dismiss ---
    const dismiss = () => {
      // 1) fade out content, open curtains
      overlay.classList.add('reveal');
      document.body.style.overflow = '';
      // 2) after curtains finish sliding (0.9s), fade then remove
      setTimeout(() => {
        overlay.classList.add('gone');
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400);
      }, 950);
    };

    // progress bar: 1.5s delay + 2.2s fill = 3.7s, then 0.5s hold = 4.2s
    setTimeout(dismiss, 4200);
  }

  /* mini canvas burst */
  function initIntroBurst(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: rnd(-3, 3),
      vy: rnd(-3, 3),
      r: rnd(1, 2.5),
      alpha: rnd(0.4, 1),
      color: Math.random() > 0.5 ? '#00d4ff' : '#7b2ff7',
      life: rnd(60, 160)
    }));

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.life--;
        if (p.life < 0) {
          p.x = canvas.width / 2;
          p.y = canvas.height / 2;
          p.vx = rnd(-3, 3);
          p.vy = rnd(-3, 3);
          p.life = rnd(60, 160);
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 160) * p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    tick();

    // stop when overlay is gone
    const obs = new MutationObserver(() => {
      if (!document.getElementById('wyx-intro')) {
        cancelAnimationFrame(frame);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true });
  }

  /* typewriter helper */
  function typeWriter(el, text) {
    let i = 0;
    const speed = 80;
    const delay = 1300;
    setTimeout(() => {
      const t = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(t);
      }, speed);
    }, delay);
  }

  /* percent counter helper */
  function animatePercent(el, duration) {
    const start = 1500; // mirrors CSS animation-delay
    setTimeout(() => {
      let pct = 0;
      const step = duration / 100;
      const t = setInterval(() => {
        el.textContent = pct + '%';
        if (++pct > 100) clearInterval(t);
      }, step);
    }, start);
  }

  /* ============================================================
     2. GLOBAL PARTICLE NETWORK
  ============================================================ */
  function initParticles() {
    if (document.getElementById('particle-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, mouse = { x: -9999, y: -9999 };

    const CONFIG = {
      count: Math.min(Math.floor(window.innerWidth / 9), 130),
      maxDist: 130,
      speed: 0.5,
      radius: 1.8,
      color: {
        particle: [0, 212, 255],   // #00d4ff
        line:     [123, 47, 247],  // #7b2ff7
      },
      mouseRadius: 120,
    };

    /* --- dark / light adaptive opacity --- */
    function getOpacity() {
      return document.documentElement.getAttribute('data-theme') === 'dark'
        ? 0.55 : 0.30;
    }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    /* --- particles --- */
    const dots = Array.from({ length: CONFIG.count }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      vx: rnd(-CONFIG.speed, CONFIG.speed),
      vy: rnd(-CONFIG.speed, CONFIG.speed),
      r: rnd(0.8, CONFIG.radius),
    }));

    /* --- mouse tracking --- */
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999;
    });

    /* --- draw loop --- */
    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const base = getOpacity();

      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];

        // move
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
        if (a.y < 0) a.y = H; if (a.y > H) a.y = 0;

        // mouse repel (gentle)
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const md = Math.sqrt(dx * dx + dy * dy);
        if (md < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - md) / CONFIG.mouseRadius * 0.04;
          a.vx += dx / md * force;
          a.vy += dy / md * force;
          // clamp speed
          const spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
          if (spd > CONFIG.speed * 3) {
            a.vx = a.vx / spd * CONFIG.speed * 3;
            a.vy = a.vy / spd * CONFIG.speed * 3;
          }
        }

        // draw dot
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        const [pr, pg, pb] = CONFIG.color.particle;
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${base * 1.4})`;
        ctx.fill();

        // draw connections
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const ex = a.x - b.x, ey = a.y - b.y;
          const dist = Math.sqrt(ex * ex + ey * ey);
          if (dist < CONFIG.maxDist) {
            const alpha = base * (1 - dist / CONFIG.maxDist) * 0.7;
            const [lr, lg, lb] = CONFIG.color.line;
            ctx.strokeStyle = `rgba(${lr},${lg},${lb},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }
    draw();
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    buildIntro();
    initParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* re-init particles on pjax navigation (intro only shown on first load) */
  document.addEventListener('pjax:complete', () => {
    if (!document.getElementById('particle-canvas')) initParticles();
  });

})();
