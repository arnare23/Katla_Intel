/**
 * Shared UI Components — Navbar & Footer
 * Injected synchronously into #navbar-root and #footer-root placeholders.
 * Reads window.NAV_SECTIONS for dropdown menu data.
 * Language-aware: uses KatlaI18n.t() for all labels, re-renders on langchange.
 */
(function () {
  var t = window.KatlaI18n ? window.KatlaI18n.t.bind(window.KatlaI18n) : function (k, fb) { return fb || k; };
  var getLang = window.KatlaI18n ? window.KatlaI18n.getLang.bind(window.KatlaI18n) : function () { return 'en'; };

  var navItems = [
    { i18nKey: 'nav.home', label: 'Home', href: '/' },
    { i18nKey: 'nav.about', label: 'About', href: '/pages/about/' },
    { i18nKey: 'nav.services', label: 'Services', href: '/pages/services/' },
    { i18nKey: 'nav.caseStudies', label: 'Case Studies', href: '/pages/case-studies/' },
    { i18nKey: 'nav.blog', label: 'Blog', href: '/pages/blog/' },
    { i18nKey: 'nav.research', label: 'Research', href: '/pages/research/' },
    { i18nKey: 'nav.careers', label: 'Careers', href: '/pages/careers/' },
    { i18nKey: 'nav.contact', label: 'Contact', href: '/pages/contact/', isCta: true }
  ];

  function buildNavAndFooter() {
    var sections = window.NAV_SECTIONS || {};
    var lang = getLang();

    /* ── Desktop Menu Items ────────────────────────── */
    var menuHTML = '';
    navItems.forEach(function (item) {
      var pageSections = sections[item.href];
      var hasDropdown = pageSections && pageSections.length > 0;

      var liClass = 'navbar__item';
      if (hasDropdown) liClass += ' navbar__item--has-dropdown';

      var linkClass = 'navbar__link';
      if (item.isCta) linkClass += ' navbar__cta btn btn--primary btn--small';

      var label = t(item.i18nKey, item.label);

      menuHTML += '<li class="' + liClass + '">';
      menuHTML += '<a href="' + item.href + '" class="' + linkClass + '">' + label + '</a>';

      if (hasDropdown) {
        var dropdownClass = 'navbar__dropdown';
        if (pageSections.length > 5) dropdownClass += ' navbar__dropdown--wide';
        menuHTML += '<div class="' + dropdownClass + '">';
        pageSections.forEach(function (sec) {
          var secLabel = sec.i18nKey ? t(sec.i18nKey, sec.name) : sec.name;
          menuHTML += '<a href="' + item.href + '#' + sec.id + '" class="navbar__dropdown-link">' + secLabel + '</a>';
        });
        menuHTML += '</div>';
      }

      menuHTML += '</li>';
    });

    // Language toggle (desktop)
    var enActive = lang === 'en' ? ' navbar__lang-option--active' : '';
    var isActive = lang === 'is' ? ' navbar__lang-option--active' : '';
    menuHTML += '<li class="navbar__item navbar__item--lang">' +
      '<button class="navbar__lang-toggle" id="langToggle" aria-label="' + t('lang.switchTo', 'Switch language') + '">' +
        '<span class="navbar__lang-option' + enActive + '" data-lang="en">En</span>' +
        '<span class="navbar__lang-separator">/</span>' +
        '<span class="navbar__lang-option' + isActive + '" data-lang="is">Is</span>' +
      '</button>' +
    '</li>';

    /* ── Mobile Menu Items ─────────────────────────── */
    var mobileHTML = '';

    // Mobile language toggle at top
    mobileHTML += '<div class="navbar__mobile-lang">' +
      '<button class="navbar__lang-toggle navbar__lang-toggle--mobile" id="langToggleMobile" aria-label="' + t('lang.switchTo', 'Switch language') + '">' +
        '<span class="navbar__lang-option' + enActive + '" data-lang="en">En</span>' +
        '<span class="navbar__lang-separator">/</span>' +
        '<span class="navbar__lang-option' + isActive + '" data-lang="is">Is</span>' +
      '</button>' +
    '</div>';

    navItems.forEach(function (item) {
      var pageSections = sections[item.href];
      var hasDropdown = pageSections && pageSections.length > 0;
      var label = t(item.i18nKey, item.label);

      if (hasDropdown) {
        mobileHTML += '<div class="navbar__mobile-group">';
        mobileHTML += '<div class="navbar__mobile-header">';
        mobileHTML += '<a href="' + item.href + '" class="navbar__mobile-link">' + label + '</a>';
        mobileHTML += '<button class="navbar__mobile-toggle" aria-label="Expand ' + label + ' sections" aria-expanded="false">';
        mobileHTML += '<svg class="navbar__mobile-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
        mobileHTML += '</button>';
        mobileHTML += '</div>';
        mobileHTML += '<div class="navbar__mobile-dropdown">';
        pageSections.forEach(function (sec) {
          var secLabel = sec.i18nKey ? t(sec.i18nKey, sec.name) : sec.name;
          mobileHTML += '<a href="' + item.href + '#' + sec.id + '" class="navbar__mobile-sublink">' + secLabel + '</a>';
        });
        mobileHTML += '</div>';
        mobileHTML += '</div>';
      } else {
        var linkClass = 'navbar__mobile-link';
        if (item.isCta) linkClass += ' navbar__mobile-cta btn btn--primary btn--full-width';
        mobileHTML += '<a href="' + item.href + '" class="' + linkClass + '">' + label + '</a>';
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
    if (navbarRoot) {
      navbarRoot.innerHTML = navbarHTML;
    }

    /* ── Footer ────────────────────────────────────── */
    var footerHTML =
      '<footer class="footer">' +
        '<div class="container">' +
          '<div class="footer__grid">' +
            '<div class="footer__brand">' +
              '<a href="/" class="footer__logo">' +
                '<img src="/assets/images/logo.svg" alt="Katla Intel" />' +
              '</a>' +
              '<p class="footer__description">' + t('footer.description', 'Custom neural network solutions that help businesses automate workflows, extract insights, and make smarter decisions.') + '</p>' +
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
              '<h4 class="footer__heading">' + t('footer.heading.services', 'Services') + '</h4>' +
              '<ul class="footer__links">' +
                '<li><a href="/pages/services/#service-forecasting" class="footer__link">' + t('footer.link.forecasting', 'Forecasting Models') + '</a></li>' +
                '<li><a href="/pages/services/#service-clustering" class="footer__link">' + t('footer.link.clustering', 'Clustering & Classification') + '</a></li>' +
                '<li><a href="/pages/services/#service-computer-vision" class="footer__link">' + t('footer.link.computerVision', 'Computer Vision') + '</a></li>' +
                '<li><a href="/pages/services/#service-control" class="footer__link">' + t('footer.link.control', 'Control Models') + '</a></li>' +
                '<li><a href="/pages/services/#service-mixed" class="footer__link">' + t('footer.link.mixed', 'Mixed Models') + '</a></li>' +
                '<li><a href="/pages/services/#service-automation" class="footer__link">' + t('footer.link.automation', 'Workflow Automation') + '</a></li>' +
              '</ul>' +
            '</div>' +
            '<div class="footer__column">' +
              '<h4 class="footer__heading">' + t('footer.heading.company', 'Company') + '</h4>' +
              '<ul class="footer__links">' +
                '<li><a href="/pages/about/" class="footer__link">' + t('footer.link.aboutUs', 'About Us') + '</a></li>' +
                '<li><a href="/pages/case-studies/" class="footer__link">' + t('footer.link.caseStudies', 'Case Studies') + '</a></li>' +
                '<li><a href="/pages/blog/" class="footer__link">' + t('footer.link.blog', 'Blog') + '</a></li>' +
                '<li><a href="/pages/research/" class="footer__link">' + t('footer.link.research', 'Research') + '</a></li>' +
                '<li><a href="/pages/careers/" class="footer__link">' + t('footer.link.careers', 'Careers') + '</a></li>' +
                '<li><a href="/pages/contact/" class="footer__link">' + t('footer.link.contact', 'Contact') + '</a></li>' +
              '</ul>' +
            '</div>' +
            '<div class="footer__column">' +
              '<h4 class="footer__heading">' + t('footer.heading.contact', 'Contact') + '</h4>' +
              '<ul class="footer__links">' +
                '<li><a href="mailto:info@katlaintel.is" class="footer__link">info@katlaintel.is</a></li>' +
                '<li><span class="footer__link">' + t('footer.location', 'Reykjavik, Iceland') + '</span></li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
          '<div class="footer__bottom">' +
            '<div class="footer__bottom-links">' +
              '<a href="#" class="footer__bottom-link">' + t('footer.privacy', 'Privacy Policy') + '</a>' +
              '<a href="#" class="footer__bottom-link">' + t('footer.terms', 'Terms of Service') + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';

    var footerRoot = document.getElementById('footer-root');
    if (footerRoot) {
      footerRoot.innerHTML = footerHTML;
    }

    // Bind language toggle click handlers
    initLangToggles();
  }

  function initLangToggles() {
    var toggles = document.querySelectorAll('#langToggle, #langToggleMobile');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = getLang();
        var next = current === 'en' ? 'is' : 'en';
        if (window.KatlaI18n) window.KatlaI18n.setLang(next);
      });
    });
  }

  // Initial build
  buildNavAndFooter();

  // Re-render on language change
  window.addEventListener('langchange', function () {
    buildNavAndFooter();
    // Re-initialize navbar behaviors after re-render
    if (window.reinitNavbar) window.reinitNavbar();
  });
})();
