/**
 * Debug Panel — Dev-mode floating overlay for site health diagnostics.
 * Self-contained IIFE. Only activates on localhost. Toggle with Ctrl+Shift+D.
 */
(function () {
  'use strict';

  /* ── Gate: localhost only ──────────────────────── */
  var host = window.location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;

  /* ── State ─────────────────────────────────────── */
  var capturedErrors = [];
  var capturedWarnings = [];
  var panelEl = null;
  var visible = false;
  var checks = {
    css: [],
    js: [],
    images: [],
    components: [],
    console: [],
    links: []
  };

  /* ── Console capture (must be early) ───────────── */
  var origError = console.error;
  var origWarn = console.warn;

  console.error = function () {
    var args = Array.prototype.slice.call(arguments);
    capturedErrors.push(args.map(String).join(' '));
    origError.apply(console, arguments);
  };

  console.warn = function () {
    var args = Array.prototype.slice.call(arguments);
    capturedWarnings.push(args.map(String).join(' '));
    origWarn.apply(console, arguments);
  };

  /* ── Resource error tracking ───────────────────── */
  var failedResources = [];
  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window && e.target.tagName) {
      failedResources.push({
        tag: e.target.tagName.toLowerCase(),
        src: e.target.src || e.target.href || '(unknown)'
      });
    }
  }, true);

  /* ── Styles ────────────────────────────────────── */
  function injectStyles() {
    var style = document.createElement('style');
    style.setAttribute('data-debug-panel', 'true');
    style.textContent =
      '#debug-panel {' +
        'position:fixed;bottom:12px;right:12px;z-index:999999;' +
        'width:350px;max-height:400px;overflow-y:auto;' +
        'background:rgba(26,26,46,0.96);color:#e0e0e0;' +
        'font-family:"SF Mono",SFMono-Regular,Consolas,"Liberation Mono",Menlo,monospace;' +
        'font-size:12px;line-height:1.5;border-radius:8px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.08);' +
        'display:none;' +
      '}' +
      '#debug-panel.dp-visible { display:block; }' +
      '#debug-panel * { box-sizing:border-box; }' +
      '.dp-header {' +
        'display:flex;justify-content:space-between;align-items:center;' +
        'padding:10px 12px;background:rgba(255,255,255,0.05);' +
        'border-bottom:1px solid rgba(255,255,255,0.08);' +
        'position:sticky;top:0;z-index:1;' +
        'border-radius:8px 8px 0 0;' +
      '}' +
      '.dp-header-title { font-weight:700;font-size:13px;color:#fff; }' +
      '.dp-close {' +
        'background:none;border:none;color:#888;font-size:16px;' +
        'cursor:pointer;padding:0 4px;line-height:1;' +
      '}' +
      '.dp-close:hover { color:#fff; }' +
      '.dp-summary {' +
        'padding:8px 12px;display:flex;gap:12px;' +
        'border-bottom:1px solid rgba(255,255,255,0.06);' +
        'font-weight:600;font-size:11px;' +
      '}' +
      '.dp-pass { color:#4ade80; }' +
      '.dp-fail { color:#f87171; }' +
      '.dp-warn { color:#fbbf24; }' +
      '.dp-section { padding:8px 12px;border-bottom:1px solid rgba(255,255,255,0.04); }' +
      '.dp-section:last-child { border-bottom:none; }' +
      '.dp-section-title {' +
        'font-weight:700;font-size:11px;text-transform:uppercase;' +
        'letter-spacing:0.5px;color:#94a3b8;margin-bottom:4px;' +
      '}' +
      '.dp-item { padding:2px 0;word-break:break-all; }' +
      '.dp-item--pass { color:#4ade80; }' +
      '.dp-item--pass::before { content:"\\2714 "; }' +
      '.dp-item--fail { color:#f87171; }' +
      '.dp-item--fail::before { content:"\\2718 "; }' +
      '.dp-item--warn { color:#fbbf24; }' +
      '.dp-item--warn::before { content:"\\26A0 "; }' +
      '.dp-none { color:#64748b;font-style:italic; }' +
      '#debug-panel::-webkit-scrollbar { width:6px; }' +
      '#debug-panel::-webkit-scrollbar-track { background:transparent; }' +
      '#debug-panel::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.15);border-radius:3px; }';
    document.head.appendChild(style);
  }

  /* ── Check: CSS loading ────────────────────────── */
  function checkCSS() {
    checks.css = [];
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    var loadedSheets = [];
    try {
      for (var s = 0; s < document.styleSheets.length; s++) {
        var sheet = document.styleSheets[s];
        if (sheet.href) loadedSheets.push(sheet.href);
      }
    } catch (e) { /* cross-origin may throw */ }

    for (var i = 0; i < links.length; i++) {
      var href = links[i].href || links[i].getAttribute('href');
      var loaded = false;
      for (var j = 0; j < loadedSheets.length; j++) {
        if (loadedSheets[j] === href || loadedSheets[j] === new URL(href, window.location.href).href) {
          loaded = true;
          break;
        }
      }
      var displayHref = shortenURL(href);
      checks.css.push({
        label: displayHref,
        status: loaded ? 'pass' : 'fail'
      });
    }
  }

  /* ── Check: JS loading ─────────────────────────── */
  function checkJS() {
    checks.js = [];
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src || scripts[i].getAttribute('src');
      var displaySrc = shortenURL(src);
      var failed = false;
      for (var f = 0; f < failedResources.length; f++) {
        if (failedResources[f].tag === 'script' && failedResources[f].src === src) {
          failed = true;
          break;
        }
      }
      checks.js.push({
        label: displaySrc,
        status: failed ? 'fail' : 'pass'
      });
    }
  }

  /* ── Check: Images ─────────────────────────────── */
  function checkImages() {
    checks.images = [];
    var imgs = document.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var src = img.src || img.getAttribute('src');
      if (!src) continue;
      var loaded = img.complete && img.naturalWidth > 0;
      if (!loaded) {
        checks.images.push({
          label: shortenURL(src),
          status: 'fail'
        });
      }
    }
  }

  /* ── Check: Components (navbar, footer) ────────── */
  function checkComponents() {
    checks.components = [];
    var navRoot = document.getElementById('navbar-root');
    var footerRoot = document.getElementById('footer-root');

    checks.components.push({
      label: '#navbar-root',
      status: navRoot && navRoot.children.length > 0 ? 'pass' : 'fail'
    });
    checks.components.push({
      label: '#footer-root',
      status: footerRoot && footerRoot.children.length > 0 ? 'pass' : 'fail'
    });
  }

  /* ── Check: Console errors ─────────────────────── */
  function checkConsole() {
    checks.console = [];
    for (var i = 0; i < capturedErrors.length; i++) {
      checks.console.push({
        label: truncate(capturedErrors[i], 120),
        status: 'fail'
      });
    }
    for (var j = 0; j < capturedWarnings.length; j++) {
      checks.console.push({
        label: truncate(capturedWarnings[j], 120),
        status: 'warn'
      });
    }
  }

  /* ── Check: Broken internal links ──────────────── */
  function checkLinks() {
    checks.links = [];
    var anchors = document.querySelectorAll('a[href]');
    var origin = window.location.origin;
    var checked = {};

    for (var i = 0; i < anchors.length; i++) {
      var href = anchors[i].href;
      if (!href) continue;

      // Only check internal links
      if (href.indexOf(origin) !== 0) continue;
      // Skip anchors, javascript:, mailto:, tel:
      var raw = anchors[i].getAttribute('href');
      if (!raw || raw.charAt(0) === '#' || raw.indexOf('mailto:') === 0 ||
          raw.indexOf('tel:') === 0 || raw.indexOf('javascript:') === 0) continue;

      // Deduplicate
      if (checked[href]) continue;
      checked[href] = true;

      // Use sync HEAD request to check (only on localhost so perf is fine)
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', href, false);
        xhr.send();
        if (xhr.status >= 400) {
          checks.links.push({
            label: shortenURL(href) + ' (' + xhr.status + ')',
            status: 'fail'
          });
        }
      } catch (e) {
        checks.links.push({
          label: shortenURL(href) + ' (network error)',
          status: 'warn'
        });
      }
    }
  }

  /* ── Helpers ───────────────────────────────────── */
  function shortenURL(url) {
    if (!url) return '(empty)';
    try {
      var u = new URL(url, window.location.href);
      return u.pathname + u.search;
    } catch (e) {
      return url;
    }
  }

  function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max) + '...';
  }

  function countByStatus(status) {
    var count = 0;
    var groups = ['css', 'js', 'images', 'components', 'console', 'links'];
    for (var g = 0; g < groups.length; g++) {
      var items = checks[groups[g]];
      for (var i = 0; i < items.length; i++) {
        if (items[i].status === status) count++;
      }
    }
    return count;
  }

  /* ── Run all checks ────────────────────────────── */
  function runChecks() {
    checkCSS();
    checkJS();
    checkImages();
    checkComponents();
    checkConsole();
    checkLinks();
  }

  /* ── Build panel DOM ───────────────────────────── */
  function buildPanel() {
    if (panelEl) {
      panelEl.parentNode.removeChild(panelEl);
    }

    runChecks();

    var passCount = countByStatus('pass');
    var failCount = countByStatus('fail');
    var warnCount = countByStatus('warn');

    panelEl = document.createElement('div');
    panelEl.id = 'debug-panel';
    panelEl.setAttribute('role', 'complementary');
    panelEl.setAttribute('aria-label', 'Debug panel');

    var html = '';

    // Header
    html += '<div class="dp-header">';
    html += '<span class="dp-header-title">Debug Panel</span>';
    html += '<button class="dp-close" aria-label="Close debug panel" id="dp-close-btn">&times;</button>';
    html += '</div>';

    // Summary
    html += '<div class="dp-summary">';
    html += '<span class="dp-pass">' + passCount + ' passed</span>';
    html += '<span class="dp-fail">' + failCount + ' failed</span>';
    html += '<span class="dp-warn">' + warnCount + ' warnings</span>';
    html += '</div>';

    // CSS Files
    html += renderSection('CSS Files', checks.css, true);

    // JS Files
    html += renderSection('JS Files', checks.js, true);

    // Images (failed only)
    html += renderSection('Images (Failed)', checks.images, false);

    // Components
    html += renderSection('Components', checks.components, true);

    // Console Errors
    html += renderSection('Console Errors', checks.console, false);

    // Broken Links
    html += renderSection('Broken Links', checks.links, false);

    panelEl.innerHTML = html;
    document.body.appendChild(panelEl);

    // Close button
    var closeBtn = document.getElementById('dp-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        hidePanel();
      });
    }

    if (visible) {
      panelEl.classList.add('dp-visible');
    }
  }

  function renderSection(title, items, showAll) {
    var html = '<div class="dp-section">';
    html += '<div class="dp-section-title">' + title + '</div>';
    if (items.length === 0) {
      html += '<div class="dp-none">None' + (showAll ? '' : ' detected') + '</div>';
    } else {
      for (var i = 0; i < items.length; i++) {
        html += '<div class="dp-item dp-item--' + items[i].status + '">' +
                escapeHTML(items[i].label) + '</div>';
      }
    }
    html += '</div>';
    return html;
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ── Show / Hide ───────────────────────────────── */
  function showPanel() {
    buildPanel();
    visible = true;
    if (panelEl) panelEl.classList.add('dp-visible');
  }

  function hidePanel() {
    visible = false;
    if (panelEl) panelEl.classList.remove('dp-visible');
  }

  function togglePanel() {
    if (visible) {
      hidePanel();
    } else {
      showPanel();
    }
  }

  /* ── Keyboard shortcut: Ctrl+Shift+D ───────────── */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      togglePanel();
    }
  });

  /* ── Initialize ────────────────────────────────── */
  function init() {
    injectStyles();
    // Pre-build but keep hidden so checks are ready
    buildPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run on full page load to catch late-loading resources
  window.addEventListener('load', function () {
    if (visible) {
      buildPanel();
    } else {
      // Silently update checks so they're fresh when panel is opened
      runChecks();
    }
  });

})();
