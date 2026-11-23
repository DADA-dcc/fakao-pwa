
    (function () {
      var section = document.getElementById('heroGlow');
      var canvas = document.getElementById('heroGlowCanvas');
      if (!section || !canvas) return;
      var ctx = canvas.getContext('2d');
      var CYCLE = 4.8; // 与 #095 原卡一致：4.8 秒一轮，无缝循环
      var BLOBS = [
        { c: '#1d4ed8', x: 0.64, y: 0.20, r: 0.46, ax: 0.10, ay: 0.16, ph: 0.0 },
        { c: '#0e7490', x: 0.48, y: 0.84, r: 0.38, ax: 0.09, ay: 0.14, ph: 2.1 },
        { c: '#b45309', x: 0.86, y: 0.72, r: 0.36, ax: 0.08, ay: 0.14, ph: 4.2 },
        { c: '#4338ca', x: 0.28, y: 0.16, r: 0.34, ax: 0.08, ay: 0.16, ph: 1.0 }
      ];
      var W = 0, H = 0, dpr = 1;

      function resize() {
        var rect = section.getBoundingClientRect();
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, Math.round(rect.width));
        H = Math.max(1, Math.round(rect.height));
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }

      function draw(u) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = '#071426';
        ctx.fillRect(0, 0, W, H);
        var a = 2 * Math.PI * u / CYCLE;
        for (var i = 0; i < BLOBS.length; i++) {
          var b = BLOBS[i];
          var cx = (b.x + b.ax * Math.cos(a + b.ph)) * W;
          var cy = (b.y + b.ay * Math.sin(a + b.ph)) * H;
          var rad = b.r * Math.max(W, H);
          var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
          g.addColorStop(0, b.c);
          g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = 0.62;
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 1;
        }
      }

      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resize();
      if (reduce) {
        draw(0.8);
      } else {
        // P2-10：仅当 Hero 在视口内且页面可见时跑 rAF；不可见时 cancelAnimationFrame 停帧，恢复时接续相位
        var t0 = performance.now();
        var rafId = 0;
        var pausedAt = 0;
        var inView = true;   // IO 首次回调前按可见处理，避免首屏空白
        var loop = function () {
          rafId = 0;
          draw(((performance.now() - t0) / 1000) % CYCLE);
          rafId = requestAnimationFrame(loop);
        };
        var syncHeroLoop = function () {
          var shouldRun = inView && document.visibilityState !== 'hidden';
          if (shouldRun && !rafId) {
            if (pausedAt) { t0 += performance.now() - pausedAt; pausedAt = 0; }
            rafId = requestAnimationFrame(loop);
          } else if (!shouldRun && rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
            pausedAt = performance.now();
          }
        };
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
              if (entries[i].target === section) inView = entries[i].isIntersecting;
            }
            syncHeroLoop();
          }, { threshold: 0 }).observe(section);
        }
        document.addEventListener('visibilitychange', syncHeroLoop);
        syncHeroLoop();
      }

      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { resize(); if (reduce) draw(0.8); }, 120);
      });

      var btn = document.getElementById('heroStartBtn');
      if (btn) btn.addEventListener('click', function () {
        var target = document.getElementById('questionCard');
        if (!target) return;
        var header = document.querySelector('header');
        var y = target.getBoundingClientRect().top + window.scrollY - ((header ? header.offsetHeight : 0) + 12);
        window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      });
    })();
  