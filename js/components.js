/**
 * Shared UI Components — Navbar & Footer
 * Injected synchronously into #navbar-root and #footer-root placeholders.
 * Reads window.NAV_SECTIONS for dropdown menu data.
 */
(function () {
  var sections = window.NAV_SECTIONS || {};

  var navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/pages/about/' },
    { label: 'Services', href: '/pages/services/' },
    { label: 'Case Studies', href: '/pages/case-studies/' },
    { label: 'Blog', href: '/pages/blog/' },
    { label: 'Research', href: '/pages/research/' },
    { label: 'Careers', href: '/pages/careers/' },
    { label: 'Contact', href: '/pages/contact/', isCta: true }
  ];

  /* ── Desktop Menu Items ────────────────────────── */
  var menuHTML = '';
  navItems.forEach(function (item) {
    var pageSections = sections[item.href];
    var hasDropdown = pageSections && pageSections.length > 0;

    var liClass = 'navbar__item';
    if (hasDropdown) liClass += ' navbar__item--has-dropdown';

    var linkClass = 'navbar__link';
    if (item.isCta) linkClass += ' navbar__cta btn btn--primary btn--small';

    menuHTML += '<li class="' + liClass + '">';
    menuHTML += '<a href="' + item.href + '" class="' + linkClass + '">' + item.label + '</a>';

    if (hasDropdown) {
      var dropdownClass = 'navbar__dropdown';
      if (pageSections.length > 5) dropdownClass += ' navbar__dropdown--wide';
      menuHTML += '<div class="' + dropdownClass + '">';
      pageSections.forEach(function (sec) {
        menuHTML += '<a href="' + item.href + '#' + sec.id + '" class="navbar__dropdown-link">' + sec.name + '</a>';
      });
      menuHTML += '</div>';
    }

    menuHTML += '</li>';
  });

  /* ── Mobile Menu Items ─────────────────────────── */
  var mobileHTML = '';
  navItems.forEach(function (item) {
    var pageSections = sections[item.href];
    var hasDropdown = pageSections && pageSections.length > 0;

    if (hasDropdown) {
      mobileHTML += '<div class="navbar__mobile-group">';
      mobileHTML += '<div class="navbar__mobile-header">';
      mobileHTML += '<a href="' + item.href + '" class="navbar__mobile-link">' + item.label + '</a>';
      mobileHTML += '<button class="navbar__mobile-toggle" aria-label="Expand ' + item.label + ' sections" aria-expanded="false">';
      mobileHTML += '<svg class="navbar__mobile-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
      mobileHTML += '</button>';
      mobileHTML += '</div>';
      mobileHTML += '<div class="navbar__mobile-dropdown">';
      pageSections.forEach(function (sec) {
        mobileHTML += '<a href="' + item.href + '#' + sec.id + '" class="navbar__mobile-sublink">' + sec.name + '</a>';
      });
      mobileHTML += '</div>';
      mobileHTML += '</div>';
    } else {
      var linkClass = 'navbar__mobile-link';
      if (item.isCta) linkClass += ' navbar__mobile-cta btn btn--primary btn--full-width';
      mobileHTML += '<a href="' + item.href + '" class="' + linkClass + '">' + item.label + '</a>';
    }
  });

  /* ── Navbar Assembly ───────────────────────────── */
  var navbarHTML =
    '<nav class="navbar" id="navbar">' +
      '<div class="navbar__inner">' +
        '<a href="/" class="navbar__logo">' +
          '<img src="/assets/images/logo.svg" alt="Katla Intel" />' +
          '<span>Katla Intel</span>' +
        '</a>' +
        '<ul class="navbar__menu" id="navMenu">' + menuHTML + '</ul>' +
        '<button class="navbar__hamburger" id="navToggle" aria-label="Toggle navigation" aria-expanded="false">' +
          '<span class="navbar__hamburger-line"></span>' +
          '<span class="navbar__hamburger-line"></span>' +
          '<span class="navbar__hamburger-line"></span>' +
        '</button>' +
        '<div class="navbar__mobile-menu" id="navMobileMenu">' + mobileHTML + '</div>' +
        '<div class="navbar__overlay" id="navOverlay"></div>' +
      '</div>' +
    '</nav>';

  var navbarRoot = document.getElementById('navbar-root');
  if (navbarRoot && navbarRoot.children.length === 0) {
    navbarRoot.innerHTML = navbarHTML;
  }

  /* ── Footer (unchanged) ────────────────────────── */
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
              '<li><a href="/pages/services/#service-forecasting" class="footer__link">Forecasting Models</a></li>' +
              '<li><a href="/pages/services/#service-clustering" class="footer__link">Clustering & Classification</a></li>' +
              '<li><a href="/pages/services/#service-computer-vision" class="footer__link">Computer Vision</a></li>' +
              '<li><a href="/pages/services/#service-control" class="footer__link">Control Models</a></li>' +
              '<li><a href="/pages/services/#service-mixed" class="footer__link">Mixed Models</a></li>' +
              '<li><a href="/pages/services/#service-automation" class="footer__link">Workflow Automation</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer__column">' +
            '<h4 class="footer__heading">Company</h4>' +
            '<ul class="footer__links">' +
              '<li><a href="/pages/about/" class="footer__link">About Us</a></li>' +
              '<li><a href="/pages/case-studies/" class="footer__link">Case Studies</a></li>' +
              '<li><a href="/pages/blog/" class="footer__link">Blog</a></li>' +
              '<li><a href="/pages/research/" class="footer__link">Research</a></li>' +
              '<li><a href="/pages/careers/" class="footer__link">Careers</a></li>' +
              '<li><a href="/pages/contact/" class="footer__link">Contact</a></li>' +
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
