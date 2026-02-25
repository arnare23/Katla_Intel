/**
 * Shared UI Components — Navbar & Footer
 * Injected synchronously into #navbar-root and #footer-root placeholders.
 */
(function () {
  /* ── Navbar ─────────────────────────────────────── */
  var navbarHTML =
    '<nav class="navbar" id="navbar">' +
      '<div class="navbar__inner">' +
        '<a href="/" class="navbar__logo">' +
          '<img src="/assets/images/logo.svg" alt="Katla Intel" />' +
          '<span>Katla Intel</span>' +
        '</a>' +
        '<ul class="navbar__menu" id="navMenu">' +
          '<li><a href="/" class="navbar__link">Home</a></li>' +
          '<li><a href="/pages/about.html" class="navbar__link">About</a></li>' +
          '<li><a href="/pages/services.html" class="navbar__link">Services</a></li>' +
          '<li><a href="/pages/case-studies.html" class="navbar__link">Case Studies</a></li>' +
          '<li><a href="/pages/blog.html" class="navbar__link">Blog</a></li>' +
          '<li><a href="/pages/research.html" class="navbar__link">Research</a></li>' +
          '<li><a href="/pages/careers.html" class="navbar__link">Careers</a></li>' +
          '<li><a href="/pages/contact.html" class="navbar__link navbar__cta btn btn--primary btn--small">Contact</a></li>' +
        '</ul>' +
        '<button class="navbar__hamburger" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">' +
          '<span class="navbar__hamburger-line"></span>' +
          '<span class="navbar__hamburger-line"></span>' +
          '<span class="navbar__hamburger-line"></span>' +
        '</button>' +
        '<div class="navbar__mobile-menu" id="navMobileMenu">' +
          '<a href="/" class="navbar__mobile-link">Home</a>' +
          '<a href="/pages/about.html" class="navbar__mobile-link">About</a>' +
          '<a href="/pages/services.html" class="navbar__mobile-link">Services</a>' +
          '<a href="/pages/case-studies.html" class="navbar__mobile-link">Case Studies</a>' +
          '<a href="/pages/blog.html" class="navbar__mobile-link">Blog</a>' +
          '<a href="/pages/research.html" class="navbar__mobile-link">Research</a>' +
          '<a href="/pages/careers.html" class="navbar__mobile-link">Careers</a>' +
          '<a href="/pages/contact.html" class="navbar__mobile-link navbar__mobile-cta btn btn--primary btn--full-width">Contact</a>' +
        '</div>' +
        '<div class="navbar__overlay" id="navOverlay"></div>' +
      '</div>' +
    '</nav>';

  var navbarRoot = document.getElementById('navbar-root');
  if (navbarRoot && navbarRoot.children.length === 0) {
    navbarRoot.innerHTML = navbarHTML;
  }

  /* ── Footer ─────────────────────────────────────── */
  var footerHTML =
    '<footer class="footer">' +
      '<div class="container">' +
        '<div class="footer__grid">' +
          '<div class="footer__brand">' +
            '<a href="/" class="footer__logo">' +
              '<img src="/assets/images/logo.svg" alt="Katla Intel" />' +
            '</a>' +
            '<p class="footer__description">Custom neural network solutions that help businesses automate workflows, extract insights, and make smarter decisions.</p>' +
            '<div class="footer__social">' +
              '<a href="#" class="footer__social-link" aria-label="LinkedIn">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>' +
              '</a>' +
              '<a href="#" class="footer__social-link" aria-label="GitHub">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>' +
              '</a>' +
              '<a href="#" class="footer__social-link" aria-label="Twitter">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>' +
              '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer__column">' +
            '<h4 class="footer__heading">Services</h4>' +
            '<ul class="footer__links">' +
              '<li><a href="/pages/services.html#service-deep-learning" class="footer__link">Deep Learning Models</a></li>' +
              '<li><a href="/pages/services.html#service-automation" class="footer__link">Workflow Automation</a></li>' +
              '<li><a href="/pages/services.html#service-file-management" class="footer__link">File Management</a></li>' +
              '<li><a href="/pages/services.html#service-consulting" class="footer__link">Neural Network Consulting</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer__column">' +
            '<h4 class="footer__heading">Company</h4>' +
            '<ul class="footer__links">' +
              '<li><a href="/pages/about.html" class="footer__link">About Us</a></li>' +
              '<li><a href="/pages/case-studies.html" class="footer__link">Case Studies</a></li>' +
              '<li><a href="/pages/blog.html" class="footer__link">Blog</a></li>' +
              '<li><a href="/pages/research.html" class="footer__link">Research</a></li>' +
              '<li><a href="/pages/careers.html" class="footer__link">Careers</a></li>' +
              '<li><a href="/pages/contact.html" class="footer__link">Contact</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer__column">' +
            '<h4 class="footer__heading">Contact</h4>' +
            '<ul class="footer__links">' +
              '<li><a href="mailto:hello@katlaintel.is" class="footer__link">hello@katlaintel.is</a></li>' +
              '<li><span class="footer__link">Reykjavik, Iceland</span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer__bottom">' +
          '<div class="footer__bottom-links">' +
            '<a href="#" class="footer__bottom-link">Privacy Policy</a>' +
            '<a href="#" class="footer__bottom-link">Terms of Service</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';

  var footerRoot = document.getElementById('footer-root');
  if (footerRoot && footerRoot.children.length === 0) {
    footerRoot.innerHTML = footerHTML;
  }
})();
