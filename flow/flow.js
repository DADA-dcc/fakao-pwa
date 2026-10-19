/* FLOW — 动态流动效果演示
   1) 全屏粒子流场（Canvas 2D + Perlin 噪声 + 鼠标涡旋）
   2) 液态波纹（多层正弦波）
   3) 卡片聚光灯 / 滚动显现 / 导航状态
*/
(() => {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ================= Perlin 噪声（2D，经典实现） ================= */
  const GRADS = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
  const perm = new Uint8Array(512);
  (function buildPerm() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let seed = 20261019;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 255; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();

  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const gdot = (h, dx, dy) => { const g = GRADS[h & 7]; return g[0] * dx + g[1] * dy; };

  function noise2(x, y) {
    const X = Math.floor(x), Y = Math.floor(y);
    const fx = x - X, fy = y - Y;
    const xi = X & 255, yi = Y & 255;
    const u = fade(fx), v = fade(fy);
    const aa = perm[perm[xi] + yi], ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi], bb = perm[perm[xi + 1] + yi + 1];
    return lerp(
      lerp(gdot(aa, fx, fy), gdot(ba, fx - 1, fy), u),
      lerp(gdot(ab, fx, fy - 1), gdot(bb, fx - 1, fy - 1), u),
      v
    );
  }

  /* ================= 粒子流场 ================= */
  const canvas = document.getElementById("flow-canvas");
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  const FIELD_SCALE = 0.0015;
  const MOUSE_R = 170;
  let W = 1, H = 1;
  let particles = [];
  let fieldT = 0;

  function spawn() {
    const hue = Math.random() < 0.62
      ? 248 + Math.random() * 52   // 紫罗兰
      : 182 + Math.random() * 36;  // 青
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      px: 0, py: 0,
      life: (Math.random() * 260) | 0,
      maxLife: 260 + Math.random() * 480,
      speed: 0.55 + Math.random() * 1.35,
      width: 0.5 + Math.random() * 1.1,
      hue,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.max(240, Math.min(850, Math.round((W * H) / 2100)));
    while (particles.length < target) particles.push(spawn());
    particles.length = target;
    ctx.fillStyle = "#08080c";
    ctx.fillRect(0, 0, W, H);
  }

  function drawField() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(8, 8, 12, 0.06)";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    const t1 = fieldT * 0.00055, t2 = fieldT * 0.00042;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.px = p.x; p.py = p.y;

      // 鼠标排斥 + 涡旋
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_R * MOUSE_R && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = 1 - d / MOUSE_R;
        const ff = f * f * 3.4;
        p.x += (dx / d) * ff - (dy / d) * ff * 0.55;
        p.y += (dy / d) * ff + (dx / d) * ff * 0.55;
      }

      const angle = noise2(p.x * FIELD_SCALE + t1, p.y * FIELD_SCALE - t2) * Math.PI * 2.6;
      p.x += Math.cos(angle) * p.speed * 1.15;
      p.y += Math.sin(angle) * p.speed * 1.15;

      p.life += 1;
      if (p.life > p.maxLife || p.x < -30 || p.x > W + 30 || p.y < -30 || p.y > H + 30) {
        Object.assign(p, spawn());
        continue;
      }

      const alpha = 0.045 + 0.185 * Math.sin(Math.PI * Math.min(1, p.life / p.maxLife));
      ctx.strokeStyle = "hsla(" + p.hue + ", 92%, 66%, " + alpha.toFixed(3) + ")";
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }

  function frame() {
    fieldT += 1;
    drawField();
    requestAnimationFrame(frame);
  }

  function staticField() {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#08080c";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (const p of particles) {
      const angle = noise2(p.x * FIELD_SCALE, p.y * FIELD_SCALE) * Math.PI * 2.6;
      const len = 14 + Math.random() * 26;
      ctx.strokeStyle = "hsla(" + p.hue + ", 92%, 66%, 0.12)";
      ctx.lineWidth = p.width;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(angle) * len, p.y + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  /* ================= 液态波纹 ================= */
  function initLiquid() {
    const c = document.getElementById("liquid-canvas");
    if (!c) return;
    const lctx = c.getContext("2d");
    const host = c.parentElement;
    let lw = 1, lh = 1, lt = 0, visible = false;

    // 由远及近（先画高处=远处的波，再画低处=近处的波）
    const waves = [
      { amp: 10, freq: 0.021, speed: 2.1, off: 0.50, c1: "rgba(34,211,238,0.20)", c2: "rgba(124,58,237,0.16)" },
      { amp: 13, freq: 0.014, speed: 1.5, off: 0.60, c1: "rgba(124,58,237,0.26)", c2: "rgba(34,211,238,0.20)" },
      { amp: 16, freq: 0.010, speed: 1.0, off: 0.72, c1: "rgba(124,58,237,0.40)", c2: "rgba(99,102,241,0.28)" },
    ];

    function lresize() {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      lw = Math.max(1, r.width); lh = Math.max(1, r.height);
      c.width = Math.round(lw * dpr);
      c.height = Math.round(lh * dpr);
      c.style.width = lw + "px";
      c.style.height = lh + "px";
      lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawLiquid() {
      lctx.clearRect(0, 0, lw, lh);
      for (const w of waves) {
        const base = lh * w.off;
        lctx.beginPath();
        lctx.moveTo(0, lh + 2);
        for (let x = 0; x <= lw; x += 4) {
          const y = base
            + Math.sin(x * w.freq + lt * w.speed) * w.amp
            + Math.sin(x * w.freq * 2.3 - lt * w.speed * 1.6) * w.amp * 0.45;
          lctx.lineTo(x, y);
        }
        lctx.lineTo(lw, lh + 2);
        lctx.closePath();
        const g = lctx.createLinearGradient(0, base - w.amp * 2, lw, lh);
        g.addColorStop(0, w.c1);
        g.addColorStop(1, w.c2);
        lctx.fillStyle = g;
        lctx.fill();
      }
    }

    function lframe() {
      requestAnimationFrame(lframe);
      if (!visible) return;
      lt += 0.014;
      drawLiquid();
    }

    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.05 }).observe(host);

    window.addEventListener("resize", lresize, { passive: true });
    lresize();

    if (prefersReduced) { lt = 1.2; drawLiquid(); }
    else lframe();
  }

  /* ================= UI：导航 / 显现 / 聚光灯 ================= */
  function initUI() {
    const nav = document.querySelector(".nav");
    if (nav) {
      const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        for (const en of entries) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        }
      }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("in"));
    }

    document.querySelectorAll(".spotlight").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });

    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ================= 启动 ================= */
  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  document.addEventListener("mouseleave", () => {
    mouse.x = -9999; mouse.y = -9999;
  });

  window.addEventListener("resize", () => {
    resize();
    if (prefersReduced) staticField();
  }, { passive: true });

  resize();
  if (prefersReduced) staticField();
  else requestAnimationFrame(frame);

  initLiquid();
  initUI();
})();
