/**
 * Katla Intel - Dynamic Research Listing
 * Loads published research from API with tag filtering
 */
(function() {
  'use strict';

  var allResearch = [];
  var activeTag = 'all';

  function initResearch() {
    var grid = document.getElementById('research-grid');
    var filterBar = document.getElementById('research-filters');
    if (!grid) return;

    showSkeletons(grid);

    KatlaAPI.research.list()
      .then(function(response) {
        allResearch = response.data || [];

        buildFilterBar(filterBar, allResearch);
        renderGrid(grid, allResearch);
      })
      .catch(function(err) {
        console.error('Error loading research:', err);
        grid.innerHTML = '<p style="text-align:center; color:var(--color-text-secondary); font-size:var(--font-size-md); padding:var(--space-3xl) 0; grid-column:1/-1;">Unable to load research. Please try again later.</p>';
      });
  }

  function buildFilterBar(container, items) {
    if (!container) return;

    var tagSet = {};
    items.forEach(function(item) {
      if (item.tags && item.tags.length) {
        item.tags.forEach(function(tag) {
          tagSet[tag] = true;
        });
      }
    });

    var tags = Object.keys(tagSet).sort();
    if (tags.length === 0) {
      container.style.display = 'none';
      return;
    }

    var html = '<button class="filter-bar__btn filter-bar__btn--active" data-tag="all">All</button>';
    tags.forEach(function(tag) {
      html += '<button class="filter-bar__btn" data-tag="' + escapeAttr(tag) + '">' + escapeHTML(tag) + '</button>';
    });
    container.innerHTML = html;

    container.addEventListener('click', function(e) {
      var btn = e.target.closest('.filter-bar__btn');
      if (!btn) return;

      container.querySelectorAll('.filter-bar__btn').forEach(function(b) {
        b.classList.remove('filter-bar__btn--active');
      });
      btn.classList.add('filter-bar__btn--active');

      activeTag = btn.getAttribute('data-tag');
      var grid = document.getElementById('research-grid');
      var filtered = activeTag === 'all' ? allResearch : allResearch.filter(function(item) {
        return item.tags && item.tags.indexOf(activeTag) !== -1;
      });
      renderGrid(grid, filtered);
    });
  }

  function renderGrid(grid, items) {
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<p style="text-align:center; color:var(--color-text-secondary); font-size:var(--font-size-md); padding:var(--space-3xl) 0; grid-column:1/-1;">No research found for this category.</p>';
      return;
    }

    items.forEach(function(item) {
      grid.appendChild(buildResearchCard(item));
    });

    // Trigger reveal animations
    setTimeout(function() {
      grid.querySelectorAll('[data-reveal]').forEach(function(el) {
        el.classList.add('is-revealed');
      });
    }, 50);
  }

  function buildResearchCard(item) {
    var card = document.createElement('article');
    card.className = 'card card--blog';
    card.setAttribute('data-reveal', 'fade-up');

    // Image or gradient placeholder
    var imageHTML;
    if (item.featuredImage) {
      imageHTML = '<div class="card__image"><img src="' + escapeAttr(item.featuredImage) + '" alt="' + escapeAttr(item.title) + '" loading="lazy"></div>';
    } else {
      imageHTML = '<div class="card__image"><div class="placeholder-image" style="min-height:200px;">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' +
        '</div></div>';
    }

    // Authors
    var authorsHTML = '';
    if (item.authors && item.authors.length) {
      authorsHTML = '<span>' + escapeHTML(item.authors.join(', ')) + '</span>';
    }

    // Date
    var dateHTML = '';
    if (item.publishedAt) {
      var d = new Date(item.publishedAt);
      dateHTML = '<span>' + formatDate(d) + '</span>';
    }

    // Tags
    var tagsHTML = '';
    if (item.tags && item.tags.length) {
      tagsHTML = '<div style="display:flex; flex-wrap:wrap; gap:var(--space-xs); margin-bottom:var(--space-md);">';
      item.tags.forEach(function(tag) {
        tagsHTML += '<span class="badge badge--blue">' + escapeHTML(tag) + '</span>';
      });
      tagsHTML += '</div>';
    }

    // Abstract (truncated)
    var abstract = item.abstract || '';
    if (abstract.length > 180) {
      abstract = abstract.substring(0, 180) + '...';
    }

    // Actions
    var actionsHTML = '<div style="display:flex; flex-wrap:wrap; gap:var(--space-sm); align-items:center; margin-top:auto;">';
    actionsHTML += '<a href="/research-post?slug=' + encodeURIComponent(item.slug) + '" class="card__link">Read More <span aria-hidden="true">&rarr;</span></a>';
    if (item.pdfUrl) {
      actionsHTML += '<a href="' + escapeAttr(item.pdfUrl) + '" class="btn btn--secondary btn--small" target="_blank" rel="noopener noreferrer">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> PDF</a>';
    }
    actionsHTML += '</div>';

    card.innerHTML = imageHTML +
      '<div class="card__body">' +
        '<div class="card__meta">' + authorsHTML + dateHTML + '</div>' +
        tagsHTML +
        '<h3 class="card__title" style="margin-bottom:var(--space-sm);">' + escapeHTML(item.title) + '</h3>' +
        '<p class="card__description" style="margin-bottom:var(--space-md);">' + escapeHTML(abstract) + '</p>' +
        actionsHTML +
      '</div>';

    return card;
  }

  function showSkeletons(grid) {
    var html = '';
    for (var i = 0; i < 6; i++) {
      html += '<div class="card card--blog skeleton-card" style="animation:skeleton-pulse 1.5s ease-in-out infinite;">' +
        '<div class="card__image"><div style="height:200px; background:var(--color-bg);"></div></div>' +
        '<div class="card__body">' +
          '<div style="height:0.75rem; width:40%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:1.25rem; width:80%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:0.75rem; width:100%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-xs);"></div>' +
          '<div style="height:0.75rem; width:60%; background:var(--color-bg); border-radius:var(--radius-sm);"></div>' +
        '</div>' +
      '</div>';
    }
    grid.innerHTML = html;

    if (!document.getElementById('skeleton-styles')) {
      var style = document.createElement('style');
      style.id = 'skeleton-styles';
      style.textContent = '@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:.5}}';
      document.head.appendChild(style);
    }
  }

  function formatDate(date) {
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
  }

  function escapeHTML(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  document.addEventListener('DOMContentLoaded', initResearch);
})();
