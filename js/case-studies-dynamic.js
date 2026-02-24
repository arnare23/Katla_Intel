/**
 * Katla Group - Case Studies Dynamic Loading
 * Loads case studies from Firestore with category filtering
 */
(function() {
  'use strict';

  var currentFilter = 'all';
  var isLoading = false;

  var categoryMap = {
    'all': 'All',
    'deep-learning': 'Deep Learning',
    'automation': 'Automation',
    'file-management': 'File Management',
    'consulting': 'Consulting'
  };

  function formatDate(timestamp) {
    if (!timestamp) return '';
    var date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getCategoryBadgeClass(category) {
    var map = {
      'Deep Learning': 'badge--blue',
      'Automation': 'badge--blue',
      'File Management': 'badge--gray',
      'Consulting': 'badge--green'
    };
    return map[category] || 'badge--blue';
  }

  function createSkeletonCard() {
    return '<article class="card card--case-study">' +
      '<div class="card__image">' +
        '<div style="min-height:220px;background:linear-gradient(90deg,var(--color-bg) 25%,var(--color-bg-accent) 50%,var(--color-bg) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:0"></div>' +
      '</div>' +
      '<div class="card__body" style="padding:var(--space-xl)">' +
        '<div style="width:100px;height:22px;background:var(--color-bg);border-radius:var(--radius-full);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:85%;height:22px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-sm)"></div>' +
        '<div style="width:50%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:100%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-xs)"></div>' +
        '<div style="width:90%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="display:flex;gap:var(--space-sm)">' +
          '<div style="width:100px;height:28px;background:var(--color-bg-accent);border-radius:var(--radius-full)"></div>' +
          '<div style="width:80px;height:28px;background:var(--color-bg-accent);border-radius:var(--radius-full)"></div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function renderCaseStudyCard(study) {
    var imageHTML;
    if (study.featuredImage) {
      imageHTML = '<img src="' + study.featuredImage + '" alt="' + DOMPurify.sanitize(study.title) + '" loading="lazy" style="height:220px;width:100%;object-fit:cover">';
    } else {
      imageHTML = '<div class="placeholder-image" style="min-height:220px;border-radius:0;" aria-hidden="true">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
          '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="12" cy="12" r="2.5"/>' +
          '<line x1="12" y1="7" x2="12" y2="9.5"/><line x1="7" y1="12" x2="9.5" y2="12"/><line x1="14.5" y1="12" x2="17" y2="12"/>' +
        '</svg>' +
      '</div>';
    }

    var metricsHTML = '';
    if (study.metrics && study.metrics.length > 0) {
      metricsHTML = '<div class="card--case-study__metrics" style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-md)">';
      study.metrics.forEach(function(metric) {
        metricsHTML += '<span class="metric-badge">' + DOMPurify.sanitize(metric.value + ' ' + metric.label) + '</span>';
      });
      metricsHTML += '</div>';
    }

    return '<article class="card card--case-study" data-reveal="fade-up">' +
      '<div class="card__image">' + imageHTML + '</div>' +
      '<div class="card__body" style="padding:var(--space-xl)">' +
        '<span class="badge ' + getCategoryBadgeClass(study.category) + '">' + DOMPurify.sanitize(study.category) + '</span>' +
        '<h3 class="card__title" style="margin-top:var(--space-md)">' +
          '<a href="/case-study?slug=' + encodeURIComponent(study.slug) + '" style="color:inherit;text-decoration:none">' +
            DOMPurify.sanitize(study.title) +
          '</a>' +
        '</h3>' +
        '<p class="card__meta">' + DOMPurify.sanitize(study.client || '') + '</p>' +
        '<p class="card__description">' + DOMPurify.sanitize(study.description) + '</p>' +
        metricsHTML +
      '</div>' +
    '</article>';
  }

  function showLoadingGrid() {
    var grid = document.getElementById('case-studies-container');
    if (!grid) return;
    var skeletons = '';
    for (var i = 0; i < 4; i++) {
      skeletons += createSkeletonCard();
    }
    grid.innerHTML = skeletons;
  }

  function loadCaseStudies() {
    if (isLoading) return;
    isLoading = true;

    var grid = document.getElementById('case-studies-container');
    if (!grid) return;

    showLoadingGrid();

    if (typeof window.db === 'undefined') {
      isLoading = false;
      return;
    }

    var query;
    if (currentFilter === 'all') {
      query = window.db.collection('caseStudies')
        .where('status', '==', 'published')
        .orderBy('order', 'asc');
    } else {
      var categoryName = categoryMap[currentFilter] || currentFilter;
      query = window.db.collection('caseStudies')
        .where('status', '==', 'published')
        .where('category', '==', categoryName)
        .orderBy('order', 'asc');
    }

    query.get()
      .then(function(snapshot) {
        grid.innerHTML = '';

        if (snapshot.empty) {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl) 0">' +
            '<p style="font-size:var(--font-size-md);color:var(--color-text-muted)">No case studies found in this category.</p>' +
          '</div>';
        } else {
          snapshot.forEach(function(doc) {
            var study = doc.data();
            grid.insertAdjacentHTML('beforeend', renderCaseStudyCard(study));
          });
        }

        isLoading = false;
      })
      .catch(function(error) {
        console.error('Error loading case studies:', error);
        isLoading = false;
      });
  }

  function initFilters() {
    var filterBtns = document.querySelectorAll('.filter-bar__btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('filter-bar__btn--active'); });
        btn.classList.add('filter-bar__btn--active');

        currentFilter = btn.getAttribute('data-filter') || 'all';
        loadCaseStudies();
      });
    });
  }

  function injectShimmerStyle() {
    if (document.getElementById('shimmer-style')) return;
    var style = document.createElement('style');
    style.id = 'shimmer-style';
    style.textContent = '@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectShimmerStyle();
    initFilters();
    loadCaseStudies();
  });
})();
