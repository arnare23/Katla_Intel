/**
 * Katla Group - Dynamic Careers
 * Loads published job listings from Firestore
 */
(function() {
  'use strict';

  function initCareers() {
    var container = document.getElementById('positions-list');
    if (!container || !window.db) return;

    showSkeletons(container);

    window.db.collection('jobs')
      .where('status', '==', 'published')
      .orderBy('order')
      .get()
      .then(function(snapshot) {
        container.innerHTML = '';

        if (snapshot.empty) {
          container.innerHTML = '<div class="positions-empty" data-reveal="fade-up">' +
            '<p style="text-align:center; color:var(--color-text-secondary); font-size:var(--font-size-md); padding:var(--space-3xl) 0;">No open positions at the moment. Check back soon!</p>' +
            '</div>';
          revealNewElements(container);
          return;
        }

        snapshot.forEach(function(doc) {
          var job = doc.data();
          container.appendChild(buildJobCard(job));
        });

        revealNewElements(container);
      })
      .catch(function(err) {
        console.error('Error loading jobs:', err);
        container.innerHTML = '<div class="positions-empty">' +
          '<p style="text-align:center; color:var(--color-text-secondary); font-size:var(--font-size-md); padding:var(--space-3xl) 0;">Unable to load positions. Please try again later.</p>' +
          '</div>';
      });
  }

  function buildJobCard(job) {
    var article = document.createElement('article');
    article.className = 'card card--job';
    article.setAttribute('data-reveal', 'fade-up');

    var typeBadgeClass = job.type === 'Full-time' ? 'badge--blue' : 'badge--blue';
    var tagsHTML = '<span class="badge ' + typeBadgeClass + '">' + escapeHTML(job.type) + '</span>';
    tagsHTML += '<span class="badge badge--gray">' + escapeHTML(job.location) + '</span>';
    tagsHTML += '<span class="badge badge--gray">' + escapeHTML(job.department) + '</span>';

    var reqHTML = '';
    if (job.requirements && job.requirements.length) {
      reqHTML = '<div>' +
        '<p class="text-small" style="font-weight:var(--font-weight-semibold); margin-bottom:var(--space-sm); color:var(--color-text-primary);">Requirements</p>' +
        '<ul style="list-style:disc; padding-left:var(--space-lg); display:flex; flex-direction:column; gap:var(--space-xs);">';
      job.requirements.forEach(function(req) {
        reqHTML += '<li class="text-small" style="color:var(--color-text-secondary);">' + escapeHTML(req) + '</li>';
      });
      reqHTML += '</ul></div>';
    }

    var desc = job.shortDescription || '';

    article.innerHTML =
      '<div class="card__header">' +
        '<h3 class="card__title">' + escapeHTML(job.title) + '</h3>' +
        '<div class="card__tags">' + tagsHTML + '</div>' +
      '</div>' +
      '<p class="card__description">' + escapeHTML(desc) + '</p>' +
      reqHTML +
      '<div class="card__footer">' +
        '<a href="mailto:careers@katlagroup.com?subject=Application: ' + encodeURIComponent(job.title) + '" class="btn btn--primary btn--small">Apply Now &rarr;</a>' +
      '</div>';

    return article;
  }

  function showSkeletons(container) {
    var html = '';
    for (var i = 0; i < 3; i++) {
      html += '<div class="card card--job skeleton-card" style="animation:skeleton-pulse 1.5s ease-in-out infinite;">' +
        '<div class="card__header">' +
          '<div style="height:1.5rem; width:60%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="display:flex; gap:var(--space-sm);">' +
            '<div style="height:1.5rem; width:5rem; background:var(--color-bg); border-radius:var(--radius-full);"></div>' +
            '<div style="height:1.5rem; width:4rem; background:var(--color-bg); border-radius:var(--radius-full);"></div>' +
          '</div>' +
        '</div>' +
        '<div style="height:1rem; width:90%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
        '<div style="height:1rem; width:70%; background:var(--color-bg); border-radius:var(--radius-sm);"></div>' +
      '</div>';
    }
    container.innerHTML = html;

    if (!document.getElementById('skeleton-styles')) {
      var style = document.createElement('style');
      style.id = 'skeleton-styles';
      style.textContent = '@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.5}}';
      document.head.appendChild(style);
    }
  }

  function revealNewElements(container) {
    container.querySelectorAll('[data-reveal]').forEach(function(el) {
      setTimeout(function() {
        el.classList.add('is-revealed');
      }, 50);
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', initCareers);
})();
