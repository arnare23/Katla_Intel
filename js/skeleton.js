/**
 * Katla Intel — Page Section Loader (Skeleton)
 *
 * Reads window.PAGE_CONFIG and dynamically fetches section HTML files
 * into <main id="main-content">, then loads page-specific scripts.
 *
 * Usage (in each page's index.html):
 *   <script>
 *     window.PAGE_CONFIG = {
 *       sections: ['/pages/about/sections/header.html', ...],
 *       scripts:  ['/js/main.js', '/js/animations.js']
 *     };
 *   </script>
 *   <script src="/js/skeleton.js"></script>
 */
(function () {
  'use strict';

  var config = window.PAGE_CONFIG;
  if (!config || !config.sections || !config.sections.length) return;

  var main = document.getElementById('main-content');
  if (!main) return;

  // Fetch all section HTML files in parallel, preserving order
  Promise.all(
    config.sections.map(function (url) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error('Failed to load section: ' + url);
        return res.text();
      });
    })
  )
    .then(function (htmlFragments) {
      main.innerHTML = htmlFragments.join('\n');

      // Load page-specific scripts sequentially (order matters)
      var scripts = config.scripts || [];
      return scripts.reduce(function (chain, src) {
        return chain.then(function () {
          return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = function () {
              reject(new Error('Failed to load script: ' + src));
            };
            document.body.appendChild(s);
          });
        });
      }, Promise.resolve());
    })
    .then(function () {
      // Scroll to hash target if URL has a hash
      if (window.location.hash) {
        var hashTarget = document.querySelector(window.location.hash);
        if (hashTarget) {
          // Small delay to let layout settle
          setTimeout(function() {
            var navHeight = (document.getElementById('navbar') || {}).offsetHeight || 0;
            var top = hashTarget.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }, 100);
        }
      }
    })
    .catch(function (err) {
      console.error('[skeleton]', err);
    });
})();
