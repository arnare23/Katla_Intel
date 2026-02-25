/**
 * Katla Intel - Scroll Animations
 * IntersectionObserver reveals, stagger, counter animations
 */
(function() {
  'use strict';

  if (!('IntersectionObserver' in window)) return;

  // Process stagger parents first (add data-reveal + delays to children)
  function initStagger() {
    document.querySelectorAll('[data-reveal-stagger]').forEach(function(parent) {
      Array.from(parent.children).forEach(function(child, i) {
        if (!child.hasAttribute('data-reveal')) {
          child.setAttribute('data-reveal', 'fade-up');
        }
        child.setAttribute('data-reveal-delay', String(i * 100));
      });
    });
  }

  // Scroll reveal
  function initReveal() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-reveal-delay') || 0;
          el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-revealed');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(function(el) {
      observer.observe(el);
    });
  }

  // Counter animation
  function animateCounter(el) {
    var raw = el.getAttribute('data-counter');
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-counter-suffix') || '';
    var decimals = (raw.split('.')[1] || '').length;
    var duration = 2000;
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = (target * eased).toFixed(decimals);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-counter]').forEach(function(el) {
      counterObserver.observe(el);
    });
  }

  // Support both static loading (DOMContentLoaded) and dynamic loading
  // via skeleton.js (script appended after sections are injected)
  function init() {
    initStagger();
    initReveal();
    initCounters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
