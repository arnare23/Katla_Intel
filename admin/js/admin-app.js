(function() {
  'use strict';

  var AdminApp = {};
  var initialized = false;

  var NAV_ITEMS = [
    {
      label: 'Dashboard',
      hash: '/dashboard',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
    },
    {
      label: 'Enquiries',
      hash: '/enquiries',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
      badge: true
    },
    {
      label: 'Blog Posts',
      hash: '/posts',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    },
    {
      label: 'Case Studies',
      hash: '/case-studies',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
    },
    {
      label: 'Jobs',
      hash: '/jobs',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
    },
    {
      label: 'Research',
      hash: '/research',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>'
    }
  ];

  AdminApp.init = function() {
    if (initialized) {
      AdminRouter.resolve();
      return;
    }
    initialized = true;

    AdminApp.renderSidebar();
    AdminApp.setupLogout();
    AdminApp.setupMobileSidebar();
    AdminApp.registerRoutes();
    AdminRouter.init();
    AdminRouter.start();
    AdminApp.updateEnquiryBadge();
  };

  AdminApp.renderSidebar = function() {
    var nav = document.getElementById('sidebarNav');
    if (!nav) return;

    var html = '';
    NAV_ITEMS.forEach(function(item) {
      html += '<a href="#' + item.hash + '" class="admin-sidebar__link" data-nav="' + item.hash + '">' +
        item.icon +
        '<span>' + item.label + '</span>' +
        (item.badge ? '<span class="admin-sidebar__badge" id="enquiryBadge" hidden>0</span>' : '') +
      '</a>';
    });
    nav.innerHTML = html;
  };

  AdminApp.updateSidebarActive = function() {
    var current = AdminRouter.getCurrentRoute();
    var links = document.querySelectorAll('.admin-sidebar__link');
    links.forEach(function(link) {
      var navPath = link.getAttribute('data-nav');
      var isActive = current === navPath || current.indexOf(navPath + '/') === 0;
      link.classList.toggle('admin-sidebar__link--active', isActive);
    });
  };

  AdminApp.updateEnquiryBadge = function() {
    var badge = document.getElementById('enquiryBadge');
    if (!badge) return;

    window.db.collection('enquiries')
      .where('status', '==', 'new')
      .get()
      .then(function(snapshot) {
        var count = snapshot.size;
        if (count > 0) {
          badge.textContent = count > 99 ? '99+' : count;
          badge.hidden = false;
        } else {
          badge.hidden = true;
        }
      })
      .catch(function() {
        badge.hidden = true;
      });
  };

  AdminApp.setupLogout = function() {
    var sidebarLogout = document.getElementById('sidebarLogout');
    var mobileLogout = document.getElementById('mobileLogout');

    function doLogout() {
      AdminAuth.logout();
    }

    if (sidebarLogout) sidebarLogout.addEventListener('click', doLogout);
    if (mobileLogout) mobileLogout.addEventListener('click', doLogout);
  };

  AdminApp.setupMobileSidebar = function() {
    var toggle = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('adminSidebar');
    var overlay = document.getElementById('sidebarOverlay');

    function openSidebar() {
      sidebar.classList.add('admin-sidebar--open');
      overlay.classList.add('admin-sidebar-overlay--visible');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function closeSidebar() {
      sidebar.classList.remove('admin-sidebar--open');
      overlay.classList.remove('admin-sidebar-overlay--visible');
      toggle.setAttribute('aria-expanded', 'false');
    }

    if (toggle) toggle.addEventListener('click', function() {
      var isOpen = sidebar.classList.contains('admin-sidebar--open');
      isOpen ? closeSidebar() : openSidebar();
    });

    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Close on nav click (mobile)
    document.querySelectorAll('.admin-sidebar__link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (window.innerWidth < 768) closeSidebar();
      });
    });
  };

  AdminApp.registerRoutes = function() {
    var mainView = document.getElementById('mainView');

    // Dashboard
    AdminRouter.addRoute('/dashboard', function() {
      AdminApp.updateSidebarActive();
      AdminApp.renderDashboard(mainView);
    });

    // Enquiries
    AdminRouter.addRoute('/enquiries', function() {
      AdminApp.updateSidebarActive();
      AdminEnquiries.renderList(mainView);
    });
    AdminRouter.addRoute('/enquiries/:id', function(params) {
      AdminApp.updateSidebarActive();
      AdminEnquiries.renderDetail(mainView, params.id);
    });

    // Posts
    AdminRouter.addRoute('/posts', function() {
      AdminApp.updateSidebarActive();
      AdminPosts.renderList(mainView);
    });
    AdminRouter.addRoute('/posts/new', function() {
      AdminApp.updateSidebarActive();
      AdminPosts.renderForm(mainView);
    });
    AdminRouter.addRoute('/posts/edit/:id', function(params) {
      AdminApp.updateSidebarActive();
      AdminPosts.renderForm(mainView, params.id);
    });

    // Case Studies
    AdminRouter.addRoute('/case-studies', function() {
      AdminApp.updateSidebarActive();
      AdminCaseStudies.renderList(mainView);
    });
    AdminRouter.addRoute('/case-studies/new', function() {
      AdminApp.updateSidebarActive();
      AdminCaseStudies.renderForm(mainView);
    });
    AdminRouter.addRoute('/case-studies/edit/:id', function(params) {
      AdminApp.updateSidebarActive();
      AdminCaseStudies.renderForm(mainView, params.id);
    });

    // Jobs
    AdminRouter.addRoute('/jobs', function() {
      AdminApp.updateSidebarActive();
      AdminJobs.renderList(mainView);
    });
    AdminRouter.addRoute('/jobs/new', function() {
      AdminApp.updateSidebarActive();
      AdminJobs.renderForm(mainView);
    });
    AdminRouter.addRoute('/jobs/edit/:id', function(params) {
      AdminApp.updateSidebarActive();
      AdminJobs.renderForm(mainView, params.id);
    });

    // Research
    AdminRouter.addRoute('/research', function() {
      AdminApp.updateSidebarActive();
      AdminResearch.renderList(mainView);
    });
    AdminRouter.addRoute('/research/new', function() {
      AdminApp.updateSidebarActive();
      AdminResearch.renderForm(mainView);
    });
    AdminRouter.addRoute('/research/edit/:id', function(params) {
      AdminApp.updateSidebarActive();
      AdminResearch.renderForm(mainView, params.id);
    });
  };

  AdminApp.renderDashboard = function(container) {
    container.innerHTML = '<div class="admin-page-header"><h1 class="admin-page-header__title">Dashboard</h1></div>' +
      '<div class="admin-stats" id="dashboardStats">' +
        '<div class="admin-stat-card"><div class="admin-stat-card__icon admin-stat-card__icon--blue"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div class="admin-stat-card__value" id="statEnquiries"><span class="admin-spinner"></span></div><div class="admin-stat-card__label">Unread Enquiries</div></div>' +
        '<div class="admin-stat-card"><div class="admin-stat-card__icon admin-stat-card__icon--green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div><div class="admin-stat-card__value" id="statPosts"><span class="admin-spinner"></span></div><div class="admin-stat-card__label">Published Posts</div></div>' +
        '<div class="admin-stat-card"><div class="admin-stat-card__icon admin-stat-card__icon--purple"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div><div class="admin-stat-card__value" id="statCaseStudies"><span class="admin-spinner"></span></div><div class="admin-stat-card__label">Published Case Studies</div></div>' +
        '<div class="admin-stat-card"><div class="admin-stat-card__icon admin-stat-card__icon--orange"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg></div><div class="admin-stat-card__value" id="statJobs"><span class="admin-spinner"></span></div><div class="admin-stat-card__label">Open Jobs</div></div>' +
      '</div>' +
      '<div class="admin-table-wrapper">' +
        '<div class="admin-table-toolbar"><strong style="font-size:var(--font-size-sm)">Recent Enquiries</strong></div>' +
        '<div class="admin-table-scroll">' +
          '<table class="admin-table">' +
            '<thead><tr><th>Name</th><th>Email</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>' +
            '<tbody id="dashRecentEnquiries"><tr><td colspan="5" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr></tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    // Load stats
    AdminApp.loadDashboardStats();
    AdminApp.loadRecentEnquiries();
  };

  AdminApp.loadDashboardStats = function() {
    // Unread enquiries
    window.db.collection('enquiries').where('status', '==', 'new').get()
      .then(function(snap) {
        var el = document.getElementById('statEnquiries');
        if (el) el.textContent = snap.size;
      })
      .catch(function() {
        var el = document.getElementById('statEnquiries');
        if (el) el.textContent = '0';
      });

    // Published posts
    window.db.collection('posts').where('status', '==', 'published').get()
      .then(function(snap) {
        var el = document.getElementById('statPosts');
        if (el) el.textContent = snap.size;
      })
      .catch(function() {
        var el = document.getElementById('statPosts');
        if (el) el.textContent = '0';
      });

    // Published case studies
    window.db.collection('caseStudies').where('status', '==', 'published').get()
      .then(function(snap) {
        var el = document.getElementById('statCaseStudies');
        if (el) el.textContent = snap.size;
      })
      .catch(function() {
        var el = document.getElementById('statCaseStudies');
        if (el) el.textContent = '0';
      });

    // Open jobs
    window.db.collection('jobs').where('status', '==', 'published').get()
      .then(function(snap) {
        var el = document.getElementById('statJobs');
        if (el) el.textContent = snap.size;
      })
      .catch(function() {
        var el = document.getElementById('statJobs');
        if (el) el.textContent = '0';
      });
  };

  AdminApp.loadRecentEnquiries = function() {
    var tbody = document.getElementById('dashRecentEnquiries');
    if (!tbody) return;

    window.db.collection('enquiries').orderBy('createdAt', 'desc').limit(5).get()
      .then(function(snapshot) {
        if (snapshot.empty) {
          tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No enquiries yet</td></tr>';
          return;
        }
        var rows = '';
        snapshot.forEach(function(doc) {
          var d = doc.data();
          var status = d.status || 'new';
          var isUnread = status === 'new';
          rows += '<tr class="admin-table__row--clickable ' + (isUnread ? 'admin-table__row--unread' : '') + '" data-id="' + doc.id + '">' +
            '<td>' + AdminUtils.escapeHtml(d.name || 'Unknown') + '</td>' +
            '<td>' + AdminUtils.escapeHtml(d.email || '') + '</td>' +
            '<td>' + AdminUtils.escapeHtml(d.service || 'General') + '</td>' +
            '<td>' + AdminUtils.formatDate(d.createdAt) + '</td>' +
            '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
          '</tr>';
        });
        tbody.innerHTML = rows;

        tbody.querySelectorAll('.admin-table__row--clickable').forEach(function(row) {
          row.addEventListener('click', function() {
            AdminRouter.navigate('/enquiries/' + row.getAttribute('data-id'));
          });
        });
      })
      .catch(function(err) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">Error: ' + AdminUtils.escapeHtml(err.message) + '</td></tr>';
      });
  };

  window.AdminApp = AdminApp;

  // Bootstrap auth when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      AdminAuth.init();
    });
  } else {
    AdminAuth.init();
  }
})();
