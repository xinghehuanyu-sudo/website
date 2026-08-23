/**
 * WYX LAB — Intro Animation + Interactive Particle Background
 * ============================================================
 * 1. Intro overlay: dim tech animation → curtain reveal
 * 2. Global canvas: particle field that reacts to mouse movement
 *    - particles drift toward cursor and form a soft nebula
 *    - connection lines brighten near the cursor
 */
(function () {
  'use strict';

  const rnd = (min, max) => Math.random() * (max - min) + min;
  const isMobile = () =>
    (navigator.maxTouchPoints > 0 || 'ontouchstart' in window) &&
    window.innerWidth <= 768;
  const prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const systemDarkQuery = window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;
  const introSeenKey = 'wyx-intro-seen';
  const deepSpacePoster = '/deepspace/deep-space-poster.webp?v=20260823-deepspace';
  const deepSpaceAssets = [
    '/deepspace/galaxy_base.webp?v=20260823-flow',
    '/deepspace/flowmask.webp?v=20260823-flow',
    '/deepspace/galaxy_layer_2.webp?v=20260823-flow',
    '/deepspace/galaxy_layer_1.webp?v=20260823-flow',
    '/deepspace/galaxy_layer_0.webp?v=20260823-flow'
  ];
  let themeCoverObserver;

  /**
   * Resolve the visual color mode from every source that can make the page
   * dark: Butterfly, Dark Reader, or the operating-system preference.
   */
  function hasDarkRenderedBackground() {
    const elements = [document.body, document.documentElement].filter(Boolean);

    return elements.some(element => {
      const color = window.getComputedStyle(element).backgroundColor;
      const channels = color.match(/[\d.]+/g);
      if (!channels || channels.length < 3) return false;

      const [red, green, blue, alpha = 1] = channels.map(Number);
      if (alpha === 0) return false;

      const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
      return luminance < 110;
    });
  }

  function isDarkCoverMode() {
    const html = document.documentElement;

    if (html.getAttribute('data-darkreader-scheme') === 'dark') return true;

    const butterflyTheme = html.getAttribute('data-theme');
    if (butterflyTheme === 'dark') return true;
    if (butterflyTheme === 'light') return hasDarkRenderedBackground();

    return Boolean(systemDarkQuery && systemDarkQuery.matches) || hasDarkRenderedBackground();
  }

  /** Keep the static poster in place while WebGL loads, or as its fallback. */
  function syncThemeCover() {
    const header = document.getElementById('page-header');
    if (!header || header.classList.contains('not-top-img')) return;

    const dark = isDarkCoverMode();
    header.setAttribute('data-cover-theme', dark ? 'dark' : 'light');
    header.style.setProperty('background-image', `url("${deepSpacePoster}")`, 'important');
  }

  function initThemeCoverSync() {
    syncThemeCover();

    if (themeCoverObserver) return;
    themeCoverObserver = new MutationObserver(syncThemeCover);
    themeCoverObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-darkreader-scheme']
    });

    if (systemDarkQuery) {
      if (typeof systemDarkQuery.addEventListener === 'function') {
        systemDarkQuery.addEventListener('change', syncThemeCover);
      } else if (typeof systemDarkQuery.addListener === 'function') {
        systemDarkQuery.addListener(syncThemeCover);
      }
    }

    window.addEventListener('load', syncThemeCover, { once: true });
    window.addEventListener('pageshow', syncThemeCover);
  }

  function loadCoverImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  function compileCoverShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || 'Unable to compile the deep-space cover shader.');
    }

    return shader;
  }

  /**
   * Recreates the Wallpaper Engine scene's flow-mask animation in WebGL.
   * The CSS background remains visible if WebGL is unavailable or motion is reduced.
   */
  async function initDeepSpaceCover() {
    const header = document.getElementById('page-header');
    if (!header || header.classList.contains('not-top-img') || header.querySelector('.deep-space-cover')) return;
    if (prefersReducedMotion) {
      header.classList.add('deep-space-static');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'deep-space-cover';
    canvas.setAttribute('aria-hidden', 'true');
    header.insertBefore(canvas, header.firstChild);

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      powerPreference: 'low-power'
    });

    if (!gl) {
      canvas.remove();
      header.classList.add('deep-space-static');
      return;
    }

    const vertexSource = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;

      uniform sampler2D uBase;
      uniform sampler2D uFlowMask;
      uniform sampler2D uLayer2;
      uniform sampler2D uLayer1;
      uniform sampler2D uLayer0;
      uniform vec2 uUvScale;
      uniform vec2 uUvCenter;
      uniform float uTime;
      varying vec2 vTexCoord;

      vec4 flowLayer(sampler2D layer, vec2 uv, vec2 flow, float speed, float phase) {
        float cycleA = fract(uTime * speed + phase);
        float cycleB = fract(uTime * speed + phase + 0.5);
        float blend = 2.0 * abs(cycleA - 0.5);
        vec2 flowAmount = flow * 0.10;
        return mix(
          texture2D(layer, uv + flowAmount * cycleA),
          texture2D(layer, uv + flowAmount * cycleB),
          blend
        );
      }

      vec4 alphaOver(vec4 below, vec4 above) {
        return vec4(mix(below.rgb, above.rgb, above.a), max(below.a, above.a));
      }

      void main() {
        vec2 uv = (vTexCoord - vec2(0.5)) * uUvScale + uUvCenter;
        vec2 flow = (texture2D(uFlowMask, uv).rg - vec2(0.5)) * 2.0;
        vec4 color = texture2D(uBase, uv);

        color = alphaOver(color, flowLayer(uLayer2, uv, flow, 0.010, 0.00));
        color = alphaOver(color, flowLayer(uLayer1, uv, flow, 0.020, 0.17));
        color = alphaOver(color, flowLayer(uLayer0, uv, flow, 0.040, 0.33));

        float pulse = 0.985 + 0.025 * sin(uTime * 0.48 + uv.x * 3.0);
        gl_FragColor = vec4(color.rgb * pulse, 1.0);
      }
    `;

    let program;
    try {
      const vertexShader = compileCoverShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = compileCoverShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'Unable to link the deep-space cover shader.');
      }
    } catch (error) {
      console.warn('[WYX LAB] Dynamic cover fallback:', error);
      canvas.remove();
      header.classList.add('deep-space-static');
      return;
    }

    let images;
    try {
      images = await Promise.all(deepSpaceAssets.map(loadCoverImage));
    } catch (error) {
      console.warn('[WYX LAB] Dynamic cover assets could not be loaded:', error);
      canvas.remove();
      header.classList.add('deep-space-static');
      return;
    }

    if (!canvas.isConnected) return;

    gl.useProgram(program);
    const vertices = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
      -1,  1, 0, 1,
       1, -1, 1, 0,
       1,  1, 1, 1
    ]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
    const position = gl.getAttribLocation(program, 'aPosition');
    const texCoord = gl.getAttribLocation(program, 'aTexCoord');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(texCoord);
    gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    ['uBase', 'uFlowMask', 'uLayer2', 'uLayer1', 'uLayer0'].forEach((name, index) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[index]);
      gl.uniform1i(gl.getUniformLocation(program, name), index);
    });

    const uvScaleLocation = gl.getUniformLocation(program, 'uUvScale');
    const uvCenterLocation = gl.getUniformLocation(program, 'uUvCenter');
    const timeLocation = gl.getUniformLocation(program, 'uTime');
    const sourceAspect = 16 / 9;
    const sceneOverscan = 1 / 1.1;

    function resizeCover() {
      const rect = header.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, rect.width <= 768 ? 1 : 1.5);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      const coverAspect = rect.width / Math.max(rect.height, 1);
      const scaleX = coverAspect < sourceAspect ? coverAspect / sourceAspect : 1;
      const scaleY = coverAspect > sourceAspect ? sourceAspect / coverAspect : 1;
      gl.uniform2f(uvScaleLocation, scaleX * sceneOverscan, scaleY * sceneOverscan);
      gl.uniform2f(uvCenterLocation, rect.width <= 768 ? 0.54 : 0.5, 0.5);
    }

    resizeCover();
    const resizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(resizeCover)
      : null;
    if (resizeObserver) resizeObserver.observe(header);
    else window.addEventListener('resize', resizeCover);

    const startedAt = performance.now();
    let previousFrame = 0;
    function drawCover(now) {
      if (!canvas.isConnected) {
        if (resizeObserver) resizeObserver.disconnect();
        else window.removeEventListener('resize', resizeCover);
        return;
      }

      requestAnimationFrame(drawCover);
      if (document.hidden || now - previousFrame < 33) return;
      previousFrame = now;
      gl.uniform1f(timeLocation, (now - startedAt) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    }
    requestAnimationFrame(drawCover);
  }

  function hasSeenIntro() {
    try {
      return window.localStorage.getItem(introSeenKey) === 'true';
    } catch (_) {
      return false;
    }
  }

  function markIntroSeen() {
    try {
      window.localStorage.setItem(introSeenKey, 'true');
    } catch (_) {
      // Storage can be disabled; in that case, keep the animation functional.
    }
  }

  /* ============================================================
     1. INTRO OVERLAY
  ============================================================ */
  function buildIntro() {
    if (document.getElementById('wyx-intro')) return;
    /* Only play once per browser; always respect reduced-motion preferences. */
    if (prefersReducedMotion || hasSeenIntro()) return;
    markIntroSeen();

    const mobile = isMobile();

    const overlay = document.createElement('div');
    overlay.id = 'wyx-intro';
    overlay.innerHTML = `
      <canvas id="intro-canvas"></canvas>

      <div class="intro-curtain-l"></div>
      <div class="intro-curtain-r"></div>

      <div class="intro-hex-ring intro-ring-1"></div>
      <div class="intro-hex-ring intro-ring-2"></div>
      <div class="intro-hex-ring intro-ring-3"></div>

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

    /* Lock page scroll during the intro (html + body for iOS) */
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    /* iOS: prevent touch scroll on the overlay itself */
    overlay.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

    initIntroBurst(document.getElementById('intro-canvas'));

    const phrases = ['记录学习和生活的点滴', 'Personal Lab & Blog', 'wyxlab.top'];
    typeWriter(document.getElementById('intro-typed'), phrases[Math.floor(rnd(0, phrases.length))]);
    animatePercent(document.getElementById('intro-pct'), mobile ? 1400 : 2200);

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.add('reveal');
      html.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      setTimeout(() => {
        overlay.classList.add('gone');
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 400);
      }, 950);
    };
    /* Tap anywhere to skip */
    overlay.addEventListener('click', dismiss);
    /* Mobile: shorter auto-dismiss */
    setTimeout(dismiss, mobile ? 2600 : 4200);
  }

  /* Dimmed particle burst — center-out, low opacity */
  function initIntroBurst(canvas) {
    const ctx = canvas.getContext('2d');
    const mobile = isMobile();

    let W, H, cx, cy, particles, frame;
    const COUNT = mobile ? 30 : 80;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cx = W / 2; cy = H / 2;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 200));

    const spawn = () => ({
      x: cx, y: cy,
      vx: rnd(-2, 2), vy: rnd(-2, 2),
      r: rnd(0.8, 1.8),
      alpha: rnd(0.15, 0.45),   // much dimmer
      color: Math.random() > 0.5 ? '#49b1f5' : '#8ec9ff',  // soft blues
      life: rnd(50, 140)
    });

    particles = Array.from({ length: COUNT }, spawn);

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.985; p.vy *= 0.985;
        if (--p.life < 0) Object.assign(p, spawn());
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 140) * p.alpha;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    tick();

    const obs = new MutationObserver(() => {
      if (!document.getElementById('wyx-intro')) {
        cancelAnimationFrame(frame);
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true });
  }

  function typeWriter(el, text) {
    let i = 0;
    setTimeout(() => {
      const t = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(t);
      }, 80);
    }, 1300);
  }

  function animatePercent(el, duration) {
    setTimeout(() => {
      let pct = 0;
      const t = setInterval(() => {
        el.textContent = pct + '%';
        if (++pct > 100) clearInterval(t);
      }, duration / 100);
    }, 1500);
  }

  /* ============================================================
     2. INTERACTIVE PARTICLE BACKGROUND
     Behaviour:
       - Particles drift slowly on their own
       - Within mouseRadius: pulled gently toward cursor (gravity)
       - Very close to cursor: slight scatter to avoid crowding
       - Connection lines: opacity scales with proximity to mouse
  ============================================================ */
  function initParticles() {
    if (document.getElementById('particle-canvas')) return;
    /* Respect "reduce motion" system setting: skip particles */
    if (prefersReducedMotion) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');
    const mobile = isMobile();
    let W, H;
    let animationFrame = null;
    const mouse = { x: -9999, y: -9999, active: false };

    /* Tune these to taste */
    const CFG = {
      count:       mobile
        ? Math.min(Math.floor(window.innerWidth / 24), 28)
        : Math.min(Math.floor(window.innerWidth / 14), 84),
      baseSpeed:   0.38,
      maxSpeed:    2.2,
      connectDist: mobile ? 80 : 120,        // max line distance
      mouseRadius: mobile ? 0 : 180,         // no cursor interaction on touch
      gravity:     0.018,      // pull strength toward cursor
      scatter:     40,         // inner radius where scatter takes over
      scatterForce:0.06,
      /* colors as [r,g,b] */
      dotColor:    [73, 177, 245],   // butterfly blue
      lineColor:   [143, 201, 255],  // light sky blue
      /* opacity range: dim far from mouse, brighter near */
      dotOpacityMin:  0.22,
      dotOpacityMax:  0.60,
      lineOpacityMin: 0.05,
      lineOpacityMax: 0.28,
    };
    const connectDistSq = CFG.connectDist * CFG.connectDist;

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 200));

    const dots = Array.from({ length: CFG.count }, () => ({
      x:  rnd(0, W),
      y:  rnd(0, H),
      vx: rnd(-CFG.baseSpeed, CFG.baseSpeed),
      vy: rnd(-CFG.baseSpeed, CFG.baseSpeed),
      r:  rnd(0.9, 1.9),
      /* each dot has a slight hue offset */
      hue: rnd(-20, 20),
    }));

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });

    /* smooth lerp target so the "nebula" follows cursor with lag */
    const target = { x: W / 2, y: H / 2 };
    const LERP = 0.055;

    function draw() {
      if (document.hidden) {
        animationFrame = null;
        return;
      }

      /* lerp target toward mouse when active */
      if (mouse.active) {
        target.x += (mouse.x - target.x) * LERP;
        target.y += (mouse.y - target.y) * LERP;
      }

      ctx.clearRect(0, 0, W, H);

      const themeMult = isDark() ? 1.0 : 0.8;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        /* ---- physics ---- */
        const dx = target.x - d.x;
        const dy = target.y - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < CFG.mouseRadius) {
          if (dist > CFG.scatter) {
            /* gravity: pull toward cursor */
            const f = CFG.gravity * (1 - dist / CFG.mouseRadius);
            d.vx += (dx / dist) * f;
            d.vy += (dy / dist) * f;
          } else {
            /* too close: gentle scatter outward */
            d.vx -= (dx / dist) * CFG.scatterForce;
            d.vy -= (dy / dist) * CFG.scatterForce;
          }
        }

        /* speed cap */
        const spd = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
        if (spd > CFG.maxSpeed) {
          d.vx = d.vx / spd * CFG.maxSpeed;
          d.vy = d.vy / spd * CFG.maxSpeed;
        }
        /* drift friction */
        d.vx *= 0.992;
        d.vy *= 0.992;

        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = W; else if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; else if (d.y > H) d.y = 0;

        /* ---- opacity based on distance to cursor ---- */
        const proximity = mouse.active
          ? Math.max(0, 1 - dist / CFG.mouseRadius)
          : 0;
        const dotAlpha = (CFG.dotOpacityMin + proximity * (CFG.dotOpacityMax - CFG.dotOpacityMin)) * themeMult;

        /* ---- draw dot ---- */
        const [r, g, b] = CFG.dotColor;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${dotAlpha})`;
        ctx.fill();

        /* ---- draw lines ---- */
        for (let j = i + 1; j < dots.length; j++) {
          const e2 = dots[j];
          const ex = d.x - e2.x, ey = d.y - e2.y;
          const lineDistSq = ex * ex + ey * ey;
          if (lineDistSq >= connectDistSq) continue;
          const lineDist = Math.sqrt(lineDistSq);

          /* line brightness also influenced by cursor proximity */
          const distRatio = 1 - lineDist / CFG.connectDist;

          /* midpoint proximity to mouse */
          const mx2 = (d.x + e2.x) / 2 - (mouse.active ? mouse.x : -9999);
          const my2 = (d.y + e2.y) / 2 - (mouse.active ? mouse.y : -9999);
          const midDist = Math.sqrt(mx2 * mx2 + my2 * my2);
          const midProx = mouse.active ? Math.max(0, 1 - midDist / CFG.mouseRadius) : 0;

          const lineAlpha = (CFG.lineOpacityMin + midProx * (CFG.lineOpacityMax - CFG.lineOpacityMin))
                            * distRatio * themeMult;

          const [lr, lg, lb] = CFG.lineColor;
          ctx.strokeStyle = `rgba(${lr},${lg},${lb},${lineAlpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(e2.x, e2.y);
          ctx.stroke();
        }
      }

      animationFrame = requestAnimationFrame(draw);
    }
    draw();

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && animationFrame === null) draw();
    });
  }

  /* ============================================================
     3. FALLING PARTICLES
     Quiet, slow-moving accents that sit behind content.
  ============================================================ */
  function initFallingParticles() {
    if (document.getElementById('falling-particles') || prefersReducedMotion) return;

    const layer = document.createElement('div');
    layer.id = 'falling-particles';
    layer.setAttribute('aria-hidden', 'true');

    const count = isMobile() ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('i');
      const size = rnd(2, 5);
      const duration = rnd(14, 25);
      particle.style.cssText = `
        left: ${rnd(0, 100)}%;
        width: ${size}px;
        height: ${size}px;
        opacity: ${rnd(0.18, 0.42)};
        animation-duration: ${duration}s;
        animation-delay: -${rnd(0, duration)}s;
      `;
      layer.appendChild(particle);
    }

    document.body.insertBefore(layer, document.body.firstChild);
  }

  function initPostCardLinks() {
    document.querySelectorAll('#recent-posts .recent-post-item[data-url]').forEach(card => {
      if (card.dataset.cardLinkReady) return;
      card.dataset.cardLinkReady = 'true';

      const openPost = event => {
        if (event.target.closest('a, button, input, textarea, select, [role="button"]')) return;
        if (window.getSelection().toString()) return;
        window.pjax ? window.pjax.loadUrl(card.dataset.url) : (window.location.href = card.dataset.url);
      };

      card.addEventListener('click', openPost);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          window.pjax ? window.pjax.loadUrl(card.dataset.url) : (window.location.href = card.dataset.url);
        }
      });
    });
  }

  function initNavActions() {
    const proxyAction = (buttonId, targetId) => {
      const button = document.getElementById(buttonId);
      if (!button || button.dataset.navActionReady) return;

      button.dataset.navActionReady = 'true';
      button.addEventListener('click', () => {
        const target = document.getElementById(targetId);
        if (target) target.click();
      });
    };

    proxyAction('nav-darkmode-button', 'darkmode');
    proxyAction('nav-readmode-button', 'readmode');
  }

  /* ============================================================
     BOOT
  ============================================================ */
  function boot() {
    initThemeCoverSync();
    initDeepSpaceCover();
    buildIntro();
    initParticles();
    initFallingParticles();
    initPostCardLinks();
    initNavActions();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('pjax:complete', () => {
    syncThemeCover();
    initDeepSpaceCover();
    if (!document.getElementById('particle-canvas')) initParticles();
    initPostCardLinks();
    initNavActions();
  });

})();
