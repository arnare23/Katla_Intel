/**
 * Katla Intel - Coming Soon Background
 * Animated floating gradient orbs on canvas
 */
(function () {
  'use strict';

  var canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var width, height;
  var orbs = [];
  var animId;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Design system colors
  var colors = [
    { r: 37, g: 99, b: 235 },   // --color-accent #2563eb
    { r: 29, g: 78, b: 216 },   // --color-accent-hover #1d4ed8
    { r: 219, g: 234, b: 254 }, // --color-accent-light #dbeafe
    { r: 99, g: 102, b: 241 },  // indigo accent
    { r: 147, g: 197, b: 253 }, // sky blue
  ];

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createOrbs() {
    orbs = [];
    var count = Math.max(4, Math.min(8, Math.floor(width / 200)));

    for (var i = 0; i < count; i++) {
      var color = colors[i % colors.length];
      var minDim = Math.min(width, height);
      var baseRadius = minDim * 0.15 + Math.random() * minDim * 0.2;

      orbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: baseRadius,
        color: color,
        opacity: 0.04 + Math.random() * 0.06,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.0005 + Math.random() * 0.001,
        pulseAmount: 0.15 + Math.random() * 0.1,
      });
    }
  }

  function drawOrb(orb, time) {
    var pulse = 1 + Math.sin(time * orb.pulseSpeed + orb.phase) * orb.pulseAmount;
    var r = orb.radius * pulse;

    var gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
    gradient.addColorStop(0, 'rgba(' + orb.color.r + ',' + orb.color.g + ',' + orb.color.b + ',' + orb.opacity * 1.5 + ')');
    gradient.addColorStop(0.5, 'rgba(' + orb.color.r + ',' + orb.color.g + ',' + orb.color.b + ',' + orb.opacity * 0.5 + ')');
    gradient.addColorStop(1, 'rgba(' + orb.color.r + ',' + orb.color.g + ',' + orb.color.b + ',0)');

    ctx.beginPath();
    ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function update(time) {
    for (var i = 0; i < orbs.length; i++) {
      var orb = orbs[i];

      orb.x += orb.vx;
      orb.y += orb.vy;

      // Soft bounce off edges with padding
      var pad = orb.radius * 0.5;
      if (orb.x < -pad) orb.vx = Math.abs(orb.vx);
      if (orb.x > width + pad) orb.vx = -Math.abs(orb.vx);
      if (orb.y < -pad) orb.vy = Math.abs(orb.vy);
      if (orb.y > height + pad) orb.vy = -Math.abs(orb.vy);
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // Subtle base gradient
    var bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(0.5, '#fafbff');
    bg.addColorStop(1, '#f5f7ff');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    for (var i = 0; i < orbs.length; i++) {
      drawOrb(orbs[i], time);
    }
  }

  function loop(time) {
    update(time);
    draw(time);
    animId = requestAnimationFrame(loop);
  }

  function init() {
    resize();
    createOrbs();

    if (prefersReducedMotion) {
      // Draw a single static frame
      draw(0);
      return;
    }

    animId = requestAnimationFrame(loop);
  }

  // Debounced resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      createOrbs();
    }, 150);
  });

  // Visibility API — pause when tab is hidden
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!prefersReducedMotion) {
      animId = requestAnimationFrame(loop);
    }
  });

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
