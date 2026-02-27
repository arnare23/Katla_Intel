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
    // Normalize a pathname: strip trailing slash and .html extension
    function normalizePath(p) {
      if (p !== '/' && p.endsWith('/')) {
        p = p.slice(0, -1);
      }
      if (p.endsWith('.html')) {
        p = p.slice(0, -5);
      }
      if (p.endsWith('/index')) {
        p = p.slice(0, -6);
      }
      return p;
    }

    var currentPath = normalizePath(window.location.pathname);

    // Desktop links
    document.querySelectorAll('.navbar__link').forEach(function(link) {
      var linkPath = normalizePath(new URL(link.href).pathname);
      if (currentPath === linkPath) {
        link.classList.add('navbar__link--active');
        var parentItem = link.closest('.navbar__item');
        if (parentItem) parentItem.classList.add('navbar__item--active');
      }
    });

    // Mobile links
    document.querySelectorAll('.navbar__mobile-link').forEach(function(link) {
      var linkPath = normalizePath(new URL(link.href).pathname);
      if (currentPath === linkPath) {
        link.classList.add('navbar__mobile-link--active');
        var parentGroup = link.closest('.navbar__mobile-group');
        if (parentGroup) parentGroup.classList.add('navbar__mobile-group--active');
      }
    });
  }

  // Dropdown menus
  function initDropdowns() {
    // --- Desktop hover with delay ---
    var items = document.querySelectorAll('.navbar__item--has-dropdown');
    items.forEach(function(item) {
      var showTimer = null;
      var hideTimer = null;

      item.addEventListener('mouseenter', function() {
        clearTimeout(hideTimer);
        showTimer = setTimeout(function() {
          item.classList.add('navbar__item--dropdown-open');
        }, 80);
      });

      item.addEventListener('mouseleave', function() {
        clearTimeout(showTimer);
        hideTimer = setTimeout(function() {
          item.classList.remove('navbar__item--dropdown-open');
        }, 200);
      });
    });

    // --- Same-page smooth scroll for dropdown links ---
    function normalizePath(p) {
      if (p !== '/' && p.endsWith('/')) p = p.slice(0, -1);
      if (p.endsWith('.html')) p = p.slice(0, -5);
      if (p.endsWith('/index')) p = p.slice(0, -6);
      return p;
    }

    var currentPath = normalizePath(window.location.pathname);

    document.querySelectorAll('.navbar__dropdown-link, .navbar__mobile-sublink').forEach(function(link) {
      link.addEventListener('click', function(e) {
        var url = new URL(link.href);
        var linkPath = normalizePath(url.pathname);

        if (linkPath === currentPath && url.hash) {
          e.preventDefault();
          var target = document.querySelector(url.hash);
          if (target) {
            var navHeight = document.getElementById('navbar').offsetHeight;
            var top = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: top, behavior: 'smooth' });
            history.replaceState(null, '', url.hash);
          }
        }

        // Close desktop dropdown (suppress hover temporarily)
        var parentItem = link.closest('.navbar__item--has-dropdown');
        if (parentItem) {
          parentItem.classList.remove('navbar__item--dropdown-open');
          parentItem.classList.add('navbar__item--dropdown-locked');
          parentItem.addEventListener('mouseleave', function unlock() {
            parentItem.classList.remove('navbar__item--dropdown-locked');
            parentItem.removeEventListener('mouseleave', unlock);
          });
        }

        // Close mobile menu if open
        var navbar = document.getElementById('navbar');
        var toggle = document.getElementById('navToggle');
        if (navbar && navbar.classList.contains('navbar--open')) {
          navbar.classList.remove('navbar--open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });

    // --- Mobile accordion toggle ---
    document.querySelectorAll('.navbar__mobile-toggle').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        var dropdown = btn.closest('.navbar__mobile-group').querySelector('.navbar__mobile-dropdown');
        if (dropdown) {
          dropdown.classList.toggle('is-open');
        }
      });
    });
  }

  // Support both static loading (DOMContentLoaded) and dynamic loading
  // via skeleton.js (script appended after sections are injected)
  function init() {
    initNavbar();
    initSmoothScroll();
    initActiveNavLink();
    initDropdowns();
  }

  // Expose for re-initialization after language change re-renders the navbar
  window.reinitNavbar = function () {
    initNavbar();
    initActiveNavLink();
    initDropdowns();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
