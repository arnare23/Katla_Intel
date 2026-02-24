/**
 * Katla Group - Case Study Detail
 * Loads a single case study by slug from API
 */
(function() {
  'use strict';

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
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

  function getSlug() {
    return new URLSearchParams(window.location.search).get('slug');
  }

  function showLoading() {
    var heroSection = document.getElementById('study-hero');
    var contentSection = document.getElementById('study-content');
    if (heroSection) {
      heroSection.innerHTML = '<div style="background:linear-gradient(135deg,var(--color-dark) 0%,var(--color-dark-lighter) 100%);padding:var(--space-5xl) 0 var(--space-3xl);margin-top:var(--navbar-height)">' +
        '<div class="container" style="text-align:center">' +
          '<div style="width:120px;height:24px;background:rgba(255,255,255,0.1);border-radius:var(--radius-full);margin:0 auto var(--space-md)"></div>' +
          '<div style="width:60%;height:36px;background:rgba(255,255,255,0.1);border-radius:var(--radius-sm);margin:0 auto var(--space-md)"></div>' +
          '<div style="width:30%;height:16px;background:rgba(255,255,255,0.1);border-radius:var(--radius-sm);margin:0 auto"></div>' +
        '</div>' +
      '</div>';
    }
    if (contentSection) {
      contentSection.innerHTML = '<div class="container container--narrow" style="padding:var(--space-3xl) var(--space-lg)">' +
        '<div style="width:100%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:90%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:95%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:80%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm)"></div>' +
      '</div>';
    }
  }

  function showNotFound() {
    var heroSection = document.getElementById('study-hero');
    var contentSection = document.getElementById('study-content');
    var metricsSection = document.getElementById('study-metrics');
    var techSection = document.getElementById('study-technologies');
    var ctaSection = document.getElementById('study-cta');
    if (heroSection) heroSection.innerHTML = '';
    if (metricsSection) metricsSection.style.display = 'none';
    if (techSection) techSection.style.display = 'none';
    if (ctaSection) ctaSection.style.display = 'none';
    if (contentSection) {
      contentSection.innerHTML = '<div class="container" style="text-align:center;padding:var(--space-5xl) var(--space-lg)">' +
        '<h2 style="margin-bottom:var(--space-md)">Case Study Not Found</h2>' +
        '<p style="color:var(--color-text-secondary);margin-bottom:var(--space-xl)">The case study you are looking for does not exist or has been removed.</p>' +
        '<a href="/case-studies" class="btn btn--primary">Back to Case Studies</a>' +
      '</div>';
    }
  }

  function renderStudy(study) {
    var heroSection = document.getElementById('study-hero');
    var contentSection = document.getElementById('study-content');
    var metricsSection = document.getElementById('study-metrics');
    var techSection = document.getElementById('study-technologies');

    document.title = study.title + ' | Katla Group Case Studies';

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && study.description) {
      metaDesc.setAttribute('content', study.description);
    }

    // Hero
    if (heroSection) {
      var bgStyle = '';
      if (study.featuredImage) {
        bgStyle = 'background-image:linear-gradient(to bottom,rgba(26,26,46,0.65),rgba(26,26,46,0.8)),url(' + study.featuredImage + ');background-size:cover;background-position:center;';
      } else {
        bgStyle = 'background:linear-gradient(135deg,var(--color-dark) 0%,var(--color-dark-lighter) 100%);';
      }

      heroSection.innerHTML = '<div style="' + bgStyle + 'padding:var(--space-5xl) 0 var(--space-3xl);margin-top:var(--navbar-height)">' +
        '<div class="container" style="text-align:center">' +
          '<nav class="page-header__breadcrumb" aria-label="Breadcrumb" style="margin-bottom:var(--space-lg)">' +
            '<a href="/" style="color:rgba(255,255,255,0.7)">Home</a>' +
            '<span aria-hidden="true" style="color:rgba(255,255,255,0.5)">/</span>' +
            '<a href="/case-studies" style="color:rgba(255,255,255,0.7)">Case Studies</a>' +
            '<span aria-hidden="true" style="color:rgba(255,255,255,0.5)">/</span>' +
            '<span style="color:rgba(255,255,255,0.9)">' + DOMPurify.sanitize(study.title) + '</span>' +
          '</nav>' +
          '<span class="badge ' + getCategoryBadgeClass(study.category) + '" style="margin-bottom:var(--space-md)">' + DOMPurify.sanitize(study.category) + '</span>' +
          '<h1 style="font-size:var(--font-size-3xl);color:var(--color-white);margin-bottom:var(--space-md);max-width:800px;margin-left:auto;margin-right:auto">' + DOMPurify.sanitize(study.title) + '</h1>' +
          '<p style="font-size:var(--font-size-md);color:rgba(255,255,255,0.7)">' + DOMPurify.sanitize(study.client || '') + '</p>' +
        '</div>' +
      '</div>';
    }

    // Metrics
    if (metricsSection && study.metrics && study.metrics.length > 0) {
      var metricsHTML = '<div class="container">' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--space-xl);text-align:center">';
      study.metrics.forEach(function(metric) {
        metricsHTML += '<div style="padding:var(--space-lg)">' +
          '<div style="font-size:var(--font-size-2xl);font-weight:var(--font-weight-bold);color:var(--color-accent);margin-bottom:var(--space-xs)">' + DOMPurify.sanitize(metric.value) + '</div>' +
          '<div style="font-size:var(--font-size-sm);color:var(--color-text-secondary)">' + DOMPurify.sanitize(metric.label) + '</div>' +
        '</div>';
      });
      metricsHTML += '</div></div>';
      metricsSection.innerHTML = metricsHTML;
      metricsSection.style.display = '';
    } else if (metricsSection) {
      metricsSection.style.display = 'none';
    }

    // Content
    if (contentSection) {
      contentSection.innerHTML = '<div class="container container--narrow" style="padding:var(--space-3xl) var(--space-lg)">' +
        '<div class="case-study-content" style="font-size:var(--font-size-md);line-height:var(--line-height-relaxed);color:var(--color-text-secondary)">' +
          DOMPurify.sanitize(study.content, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allowfullscreen', 'frameborder', 'src'] }) +
        '</div>' +
        '<div style="margin-top:var(--space-2xl)">' +
          '<a href="/case-studies" class="btn btn--secondary">&larr; Back to Case Studies</a>' +
        '</div>' +
      '</div>';
    }

    // Technologies
    if (techSection && study.technologies && study.technologies.length > 0) {
      var techHTML = '<div class="container" style="text-align:center">' +
        '<h2 style="font-size:var(--font-size-xl);margin-bottom:var(--space-xl)">Technologies Used</h2>' +
        '<div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);justify-content:center">';
      study.technologies.forEach(function(tech) {
        techHTML += '<span class="badge badge--blue">' + DOMPurify.sanitize(tech) + '</span>';
      });
      techHTML += '</div></div>';
      techSection.innerHTML = techHTML;
      techSection.style.display = '';
    } else if (techSection) {
      techSection.style.display = 'none';
    }
  }

  function loadStudy() {
    var slug = getSlug();
    if (!slug) {
      showNotFound();
      return;
    }

    showLoading();

    KatlaAPI.caseStudies.getBySlug(slug)
      .then(function(response) {
        var study = response.data;
        if (!study) {
          showNotFound();
          return;
        }
        renderStudy(study);
      })
      .catch(function(error) {
        console.error('Error loading case study:', error);
        showNotFound();
      });
  }

  document.addEventListener('DOMContentLoaded', loadStudy);
})();
