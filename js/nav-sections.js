/**
 * Unified Page Registry
 * Single source of truth for page sections, nav dropdowns, and scripts.
 * Section order here drives both the page layout AND the nav dropdown menus.
 */
window.PAGE_REGISTRY = {
  '/': {
    sections: [
      { url: '/pages/home/sections/hero.html' },
      { url: '/pages/home/sections/clients.html' },
      { url: '/pages/home/sections/services-overview.html' },
      { url: '/pages/home/sections/featured-case-study.html' },
      { url: '/pages/home/sections/about-preview.html' },
      { url: '/pages/home/sections/stats.html' },
      { url: '/pages/home/sections/cta.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/about/': {
    sections: [
      { url: '/pages/about/sections/header.html' },
      { url: '/pages/about/sections/mission.html', nav: { id: 'mission', name: 'Our Mission', i18nKey: 'navsec.about.mission' } },
      { url: '/pages/about/sections/story.html', nav: { id: 'story', name: 'Our Story', i18nKey: 'navsec.about.story' } },
      { url: '/pages/about/sections/values.html', nav: { id: 'values', name: 'Our Values', i18nKey: 'navsec.about.values' } },
      { url: '/pages/about/sections/team.html', nav: { id: 'team', name: 'Meet the Founders', i18nKey: 'navsec.about.team' } },
      { url: '/pages/about/sections/approach.html', nav: { id: 'approach', name: 'How We Work', i18nKey: 'navsec.about.approach' } }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/services/': {
    sections: [
      { url: '/pages/services/sections/header.html' },
      { url: '/pages/services/sections/overview.html', nav: { id: 'services-overview', name: 'Our Services', i18nKey: 'navsec.services.overview' } },
      { url: '/pages/services/sections/forecasting.html', nav: { id: 'service-forecasting', name: 'Forecasting Models', i18nKey: 'navsec.services.forecasting' } },
      { url: '/pages/services/sections/clustering.html', nav: { id: 'service-clustering', name: 'Clustering & Classification', i18nKey: 'navsec.services.clustering' } },
      { url: '/pages/services/sections/computer-vision.html', nav: { id: 'service-computer-vision', name: 'Computer Vision', i18nKey: 'navsec.services.computerVision' } },
      { url: '/pages/services/sections/control.html', nav: { id: 'service-control', name: 'Control Models', i18nKey: 'navsec.services.control' } },
      { url: '/pages/services/sections/mixed.html', nav: { id: 'service-mixed', name: 'Mixed Models', i18nKey: 'navsec.services.mixed' } },
      { url: '/pages/services/sections/automation.html', nav: { id: 'service-automation', name: 'Workflow Automation', i18nKey: 'navsec.services.automation' } },
      { url: '/pages/services/sections/file-management.html', nav: { id: 'service-file-management', name: 'File Management', i18nKey: 'navsec.services.fileManagement' } },
      { url: '/pages/services/sections/consulting.html', nav: { id: 'service-consulting', name: 'Neural Network Consulting', i18nKey: 'navsec.services.consulting' } },
      { url: '/pages/services/sections/chatbot.html', nav: { id: 'service-chatbot', name: 'AI Chatbot Creation', i18nKey: 'navsec.services.chatbot' } },
      { url: '/pages/services/sections/process.html' },
      { url: '/pages/services/sections/related-case-studies.html' },
      { url: '/pages/services/sections/cta.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/contact/': {
    sections: [
      { url: '/pages/contact/sections/header.html' },
      { url: '/pages/contact/sections/contact-form.html', nav: { id: 'contact', name: 'Send a Message', i18nKey: 'navsec.contact.form' } },
      { url: '/pages/contact/sections/faq.html', nav: { id: 'faq', name: 'FAQ', i18nKey: 'navsec.contact.faq' } }
    ],
    scripts: ['/js/main.js', '/js/animations.js', '/js/contact.js']
  },

  '/pages/blog/': {
    sections: [
      { url: '/pages/blog/sections/header.html' },
      { url: '/pages/blog/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/blog-post/': {
    sections: [
      { url: '/pages/blog-post/sections/header.html' },
      { url: '/pages/blog-post/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/research/': {
    sections: [
      { url: '/pages/research/sections/header.html' },
      { url: '/pages/research/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/research-post/': {
    sections: [
      { url: '/pages/research-post/sections/header.html' },
      { url: '/pages/research-post/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/careers/': {
    sections: [
      { url: '/pages/careers/sections/header.html' },
      { url: '/pages/careers/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/case-studies/': {
    sections: [
      { url: '/pages/case-studies/sections/header.html' },
      { url: '/pages/case-studies/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  },

  '/pages/case-study/': {
    sections: [
      { url: '/pages/case-study/sections/header.html' },
      { url: '/pages/case-study/sections/coming-soon.html' }
    ],
    scripts: ['/js/main.js', '/js/animations.js']
  }
};

/* Derive NAV_SECTIONS for backward compatibility with components.js */
window.NAV_SECTIONS = {};
Object.keys(window.PAGE_REGISTRY).forEach(function(path) {
  var navItems = [];
  window.PAGE_REGISTRY[path].sections.forEach(function(sec) {
    if (sec.nav) navItems.push(sec.nav);
  });
  if (navItems.length) window.NAV_SECTIONS[path] = navItems;
});

/* Helper for skeleton.js to derive PAGE_CONFIG from the registry */
window.getPageConfig = function(pagePath) {
  var entry = window.PAGE_REGISTRY[pagePath];
  if (!entry) return null;
  return {
    sections: entry.sections.map(function(s) { return s.url; }),
    scripts: entry.scripts || []
  };
};
