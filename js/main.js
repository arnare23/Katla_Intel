/**
 * Katla Intel - Main JavaScript
 * Core: navbar behavior, smooth scroll, active nav links
 */
(function() {
  'use strict';

  // Enable JS-dependent styles
  document.documentElement.classList.add('js-enabled');

  // Throttle utility
  function throttle(fn, wait) {
    var last = 0;
    return function() {
      var now = Date.now();
      if (now - last >= wait) {
        last = now;
        fn.apply(this, arguments);
      }
    };
  }

  // Navbar
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!navbar || !toggle || !menu) return;

    // Hamburger toggle
    toggle.addEventListener('click', function() {
      var isOpen = navbar.classList.toggle('navbar--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Scroll shadow
    window.addEventListener('scroll', throttle(function() {
      navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
    }, 16));

    // Close on Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navbar.classList.contains('navbar--open')) {
        navbar.classList.remove('navbar--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on nav link click (mobile)
    menu.querySelectorAll('.navbar__link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (navbar.classList.contains('navbar--open')) {
          navbar.classList.remove('navbar--open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    // Close on mobile menu link click
    var mobileMenu = document.getElementById('navMobileMenu');
    if (mobileMenu) {
      mobileMenu.querySelectorAll('.navbar__mobile-link').forEach(function(link) {
        link.addEventListener('click', function() {
          if (navbar.classList.contains('navbar--open')) {
            navbar.classList.remove('navbar--open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
        });
      });
    }

    // Close on click outside menu (mobile overlay)
    document.addEventListener('click', function(e) {
      if (navbar.classList.contains('navbar--open') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        navbar.classList.remove('navbar--open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var navHeight = document.getElementById('navbar').offsetHeight;
          var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });
    });
  }

  // Active nav link based on current page
  function initActiveNavLink() {
    var currentPath = window.location.pathname;
    // Normalize: strip trailing slash unless root
    if (currentPath !== '/' && currentPath.endsWith('/')) {
      currentPath = currentPath.slice(0, -1);
    }

    // Desktop links
    document.querySelectorAll('.navbar__link').forEach(function(link) {
      var linkPath = new URL(link.href).pathname;
      if (linkPath !== '/' && linkPath.endsWith('/')) {
        linkPath = linkPath.slice(0, -1);
      }
      if (currentPath === linkPath) {
        link.classList.add('navbar__link--active');
      }
    });

    // Mobile links
    document.querySelectorAll('.navbar__mobile-link').forEach(function(link) {
      var linkPath = new URL(link.href).pathname;
      if (linkPath !== '/' && linkPath.endsWith('/')) {
        linkPath = linkPath.slice(0, -1);
      }
      if (currentPath === linkPath) {
        link.classList.add('navbar__mobile-link--active');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initNavbar();
    initSmoothScroll();
    initActiveNavLink();
  });
})();
