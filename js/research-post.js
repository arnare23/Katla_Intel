/**
 * Katla Group - Research Post Detail
 * Loads a single research post by slug from Firestore
 */
(function() {
  'use strict';

  function initResearchPost() {
    var contentEl = document.getElementById('research-post-content');
    if (!contentEl || !window.db) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');

    if (!slug) {
      showNotFound(contentEl);
      return;
    }

    showSkeleton(contentEl);

    window.db.collection('research')
      .where('slug', '==', slug)
      .where('status', '==', 'published')
      .limit(1)
      .get()
      .then(function(snapshot) {
        if (snapshot.empty) {
          showNotFound(contentEl);
          return;
        }

        var post = snapshot.docs[0].data();
        renderPost(contentEl, post);

        // Update page title
        if (post.title) {
          document.title = post.title + ' | Research | Katla Group';
        }
      })
      .catch(function(err) {
        console.error('Error loading research post:', err);
        contentEl.innerHTML = '<div class="container" style="text-align:center; padding:var(--space-4xl) 0;">' +
          '<h2>Error Loading Post</h2>' +
          '<p>Something went wrong. Please try again later.</p>' +
          '<a href="/research" class="btn btn--primary" style="margin-top:var(--space-xl);">&larr; Back to Research</a>' +
          '</div>';
      });
  }

  function renderPost(container, post) {
    // Date
    var dateStr = '';
    if (post.publishedAt) {
      var d = post.publishedAt.toDate ? post.publishedAt.toDate() : new Date(post.publishedAt);
      dateStr = formatDate(d);
    }

    // Authors
    var authorsStr = '';
    if (post.authors && post.authors.length) {
      authorsStr = post.authors.join(', ');
    }

    // Tags
    var tagsHTML = '';
    if (post.tags && post.tags.length) {
      tagsHTML = '<div style="display:flex; flex-wrap:wrap; gap:var(--space-sm); margin-top:var(--space-lg);">';
      post.tags.forEach(function(tag) {
        tagsHTML += '<span class="badge badge--blue">' + escapeHTML(tag) + '</span>';
      });
      tagsHTML += '</div>';
    }

    // PDF button
    var pdfHTML = '';
    if (post.pdfUrl) {
      pdfHTML = '<a href="' + escapeAttr(post.pdfUrl) + '" class="btn btn--secondary" target="_blank" rel="noopener noreferrer" style="margin-top:var(--space-lg);">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline; vertical-align:middle;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF</a>';
    }

    // Sanitize content
    var sanitizedContent = '';
    if (post.content) {
      if (typeof DOMPurify !== 'undefined') {
        sanitizedContent = DOMPurify.sanitize(post.content);
      } else {
        sanitizedContent = post.content;
      }
    }

    container.innerHTML =
      '<!-- Hero Header -->' +
      '<section class="page-header" style="margin-top:0; padding-top:var(--space-3xl);">' +
        '<div class="container">' +
          '<nav class="page-header__breadcrumb" aria-label="Breadcrumb">' +
            '<a href="/">Home</a>' +
            '<span aria-hidden="true">/</span>' +
            '<a href="/research">Research</a>' +
            '<span aria-hidden="true">/</span>' +
            '<span>' + escapeHTML(post.title) + '</span>' +
          '</nav>' +
          '<h1 class="page-header__title">' + escapeHTML(post.title) + '</h1>' +
          '<div style="display:flex; flex-wrap:wrap; justify-content:center; gap:var(--space-md); color:var(--color-text-muted); font-size:var(--font-size-sm); margin-top:var(--space-md);">' +
            (authorsStr ? '<span>' + escapeHTML(authorsStr) + '</span>' : '') +
            (dateStr ? '<span>' + escapeHTML(dateStr) + '</span>' : '') +
          '</div>' +
          tagsHTML +
          pdfHTML +
        '</div>' +
      '</section>' +

      '<!-- Abstract -->' +
      (post.abstract ? '<section class="section section--light"><div class="container container--narrow">' +
        '<blockquote style="border-left:4px solid var(--color-accent); padding:var(--space-lg) var(--space-xl); background:var(--color-bg-accent); border-radius:0 var(--radius-md) var(--radius-md) 0; margin:0;">' +
          '<p style="font-size:var(--font-size-md); color:var(--color-text-secondary); line-height:var(--line-height-relaxed); font-style:italic; margin:0;">' + escapeHTML(post.abstract) + '</p>' +
        '</blockquote>' +
      '</div></section>' : '') +

      '<!-- Content -->' +
      '<section class="section section--light" style="padding-top:0;">' +
        '<div class="container container--narrow">' +
          '<div class="research-content" style="font-size:var(--font-size-base); line-height:var(--line-height-relaxed); color:var(--color-text-secondary);">' +
            sanitizedContent +
          '</div>' +
        '</div>' +
      '</section>' +

      '<!-- Back -->' +
      '<section class="section section--gray" style="padding:var(--space-2xl) 0;">' +
        '<div class="container" style="text-align:center;">' +
          '<a href="/research" class="btn btn--ghost">&larr; Back to Research</a>' +
        '</div>' +
      '</section>';
  }

  function showNotFound(container) {
    container.innerHTML =
      '<section class="page-header" style="margin-top:0; padding-top:var(--space-3xl);">' +
        '<div class="container" style="text-align:center;">' +
          '<h1 class="page-header__title">Research Not Found</h1>' +
          '<p class="page-header__description">The research post you are looking for does not exist or has been removed.</p>' +
          '<a href="/research" class="btn btn--primary" style="margin-top:var(--space-xl);">&larr; Back to Research</a>' +
        '</div>' +
      '</section>';
  }

  function showSkeleton(container) {
    container.innerHTML =
      '<section class="page-header" style="margin-top:0; padding-top:var(--space-3xl);">' +
        '<div class="container" style="text-align:center;">' +
          '<div style="height:1rem; width:30%; background:var(--color-border); border-radius:var(--radius-sm); margin:0 auto var(--space-md);"></div>' +
          '<div style="height:2.5rem; width:70%; background:var(--color-border); border-radius:var(--radius-sm); margin:0 auto var(--space-md);"></div>' +
          '<div style="height:1rem; width:40%; background:var(--color-border); border-radius:var(--radius-sm); margin:0 auto;"></div>' +
        '</div>' +
      '</section>' +
      '<section class="section section--light">' +
        '<div class="container container--narrow" style="animation:skeleton-pulse 1.5s ease-in-out infinite;">' +
          '<div style="height:4rem; background:var(--color-bg); border-radius:var(--radius-md); margin-bottom:var(--space-xl);"></div>' +
          '<div style="height:1rem; width:100%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:1rem; width:95%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:1rem; width:80%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-xl);"></div>' +
          '<div style="height:1rem; width:100%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:1rem; width:90%; background:var(--color-bg); border-radius:var(--radius-sm); margin-bottom:var(--space-sm);"></div>' +
          '<div style="height:1rem; width:70%; background:var(--color-bg); border-radius:var(--radius-sm);"></div>' +
        '</div>' +
      '</section>';

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

  document.addEventListener('DOMContentLoaded', initResearchPost);
})();
