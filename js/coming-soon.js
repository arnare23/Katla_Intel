/**
 * Katla Intel - Coming Soon
 * Interactive particle field with mouse attraction, click bursts,
 * and interconnecting lines. Blue/grey/white palette on dark bg.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // --- Config ---
  var PARTICLE_COUNT = 120;
  var CONNECT_DIST = 140;
  var MOUSE_RADIUS = 200;
  var MOUSE_FORCE = 0.02;
  var BURST_COUNT = 30;
  var BASE_SPEED = 0.3;
  var FRICTION = 0.97;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- State ---
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W, H;
  var particles = [];
  var mouse = { x: -9999, y: -9999, active: false };
  var animId;

  // --- Colors (blue/grey/white palette) ---
  var palette = [
    [37, 99, 235],    // #2563eb
    [29, 78, 216],    // #1d4ed8
    [96, 165, 250],   // #60a5fa
    [147, 197, 253],  // #93c5fd
    [199, 210, 230],  // grey-blue
    [255, 255, 255],  // white
  ];

  // --- Utilities ---
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function dist(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // --- Resize ---
  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- Particle factory ---
  function createParticle(x, y, isBurst) {
    var c = palette[Math.floor(Math.random() * palette.length)];
    var speed = isBurst ? rand(1, 4) : rand(BASE_SPEED * 0.3, BASE_SPEED);
    var angle = Math.random() * Math.PI * 2;
    var size = isBurst ? rand(1.5, 3.5) : rand(1, 2.5);

    return {
      x: x !== undefined ? x : rand(0, W),
      y: y !== undefined ? y : rand(0, H),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: size,
      baseR: size,
      color: c,
      alpha: isBurst ? 1 : rand(0.3, 0.8),
      life: isBurst ? rand(40, 80) : -1, // -1 = immortal
      maxLife: isBurst ? 80 : -1,
      pulse: rand(0, Math.PI * 2),
      pulseSpeed: rand(0.01, 0.03),
    };
  }

  // --- Init particles ---
  function initParticles() {
    particles = [];
    var count = Math.min(PARTICLE_COUNT, Math.floor((W * H) / 8000));
    for (var i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  // --- Click burst ---
  function burst(x, y) {
    for (var i = 0; i < BURST_COUNT; i++) {
      particles.push(createParticle(x, y, true));
    }
  }

  // --- Update ---
  function update() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];

      // Pulse size
      p.pulse += p.pulseSpeed;
      p.r = p.baseR + Math.sin(p.pulse) * p.baseR * 0.3;

      // Mouse attraction
      if (mouse.active) {
        var d = dist(p, mouse);
        if (d < MOUSE_RADIUS && d > 1) {
          var force = (1 - d / MOUSE_RADIUS) * MOUSE_FORCE;
          p.vx += (mouse.x - p.x) / d * force;
          p.vy += (mouse.y - p.y) / d * force;
        }
      }

      // Apply velocity with friction
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap edges (immortal particles)
      if (p.life === -1) {
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }

      // Decay burst particles
      if (p.life > 0) {
        p.life--;
        p.alpha = (p.life / p.maxLife);
        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }
    }
  }

  // --- Draw ---
  function draw() {
    // Dark background with subtle gradient
    var bg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
    bg.addColorStop(0, '#0f1029');
    bg.addColorStop(1, '#06060f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var len = particles.length;

    // Connection lines
    ctx.lineWidth = 0.5;
    for (var i = 0; i < len; i++) {
      var a = particles[i];
      for (var j = i + 1; j < len; j++) {
        var b = particles[j];
        var d = dist(a, b);
        if (d < CONNECT_DIST) {
          var opacity = (1 - d / CONNECT_DIST) * 0.15 * Math.min(a.alpha, b.alpha);
          // Use the color of the brighter particle
          var c = a.alpha > b.alpha ? a.color : b.color;
          ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + opacity + ')';
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Glow line from mouse to nearby particles
    if (mouse.active) {
      for (var k = 0; k < len; k++) {
        var p = particles[k];
        var md = dist(p, mouse);
        if (md < MOUSE_RADIUS) {
          var mOpacity = (1 - md / MOUSE_RADIUS) * 0.25;
          ctx.strokeStyle = 'rgba(96, 165, 250,' + mOpacity + ')';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 0.5;
    }

    // Particles
    for (var n = 0; n < len; n++) {
      var pt = particles[n];
      var c2 = pt.color;

      // Outer glow
      var glow = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.r * 4);
      glow.addColorStop(0, 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',' + pt.alpha * 0.15 + ')');
      glow.addColorStop(1, 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = 'rgba(' + c2[0] + ',' + c2[1] + ',' + c2[2] + ',' + pt.alpha + ')';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouse glow
    if (mouse.active) {
      var mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS * 0.6);
      mg.addColorStop(0, 'rgba(37, 99, 235, 0.06)');
      mg.addColorStop(1, 'rgba(37, 99, 235, 0)');
      ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Loop ---
  function loop() {
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  // --- Events ---
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function onClick(e) {
    burst(e.clientX, e.clientY);
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
    }
  }

  function onTouchStart(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
      mouse.active = true;
      burst(e.touches[0].clientX, e.touches[0].clientY);
    }
  }

  function onTouchEnd() {
    mouse.active = false;
  }

  // --- Init ---
  function init() {
    resize();
    initParticles();

    if (reducedMotion) {
      draw();
      return;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    animId = requestAnimationFrame(loop);
  }

  // Debounced resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      initParticles();
    }, 150);
  });

  // Pause when hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!reducedMotion) {
      animId = requestAnimationFrame(loop);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
