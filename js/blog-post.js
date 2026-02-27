/**
 * Katla Intel - Blog Post Detail
 * Loads a single blog post by slug from API
 */
(function() {
  'use strict';

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    var locale = KatlaI18n.getLang() === 'is' ? 'is-IS' : 'en-US';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function getCategoryBadgeClass(category) {
    var map = {
      'Tutorial': 'badge--blue',
      'Automation': 'badge--blue',
      'Computer Vision': 'badge--green',
      'Strategy': 'badge--gray',
      'Engineering': 'badge--blue',
      'Industry Spotlight': 'badge--blue'
    };
    return map[category] || 'badge--blue';
  }

  function getSlug() {
    return new URLSearchParams(window.location.search).get('slug');
  }

  function showLoading() {
    var heroSection = document.getElementById('post-hero');
    var contentSection = document.getElementById('post-content');
    if (heroSection) {
      heroSection.innerHTML = '<div class="container" style="text-align:center;padding:var(--space-3xl) 0">' +
        '<div style="width:120px;height:24px;background:var(--color-bg-accent);border-radius:var(--radius-full);margin:0 auto var(--space-md)"></div>' +
        '<div style="width:60%;height:32px;background:var(--color-bg-accent);border-radius:var(--radius-sm);margin:0 auto var(--space-md)"></div>' +
        '<div style="width:40%;height:16px;background:var(--color-bg-accent);border-radius:var(--radius-sm);margin:0 auto"></div>' +
      '</div>';
    }
    if (contentSection) {
      contentSection.innerHTML = '<div class="container container--narrow" style="padding:var(--space-3xl) var(--space-lg)">' +
        '<div style="width:100%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:90%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:95%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:80%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-xl)"></div>' +
        '<div style="width:100%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:85%;height:16px;background:var(--color-bg);border-radius:var(--radius-sm)"></div>' +
      '</div>';
    }
  }

  function showNotFound() {
    var heroSection = document.getElementById('post-hero');
    var contentSection = document.getElementById('post-content');
    var relatedSection = document.getElementById('related-posts');
    if (heroSection) heroSection.innerHTML = '';
    if (relatedSection) relatedSection.style.display = 'none';
    if (contentSection) {
      contentSection.innerHTML = '<div class="container" style="text-align:center;padding:var(--space-5xl) var(--space-lg)">' +
        '<h2 style="margin-bottom:var(--space-md)">' + KatlaI18n.t('js.postNotFound', 'Post Not Found') + '</h2>' +
        '<p style="color:var(--color-text-secondary);margin-bottom:var(--space-xl)">' + KatlaI18n.t('js.postNotFoundDesc', 'The blog post you are looking for does not exist or has been removed.') + '</p>' +
        '<a href="/blog" class="btn btn--primary">' + KatlaI18n.t('js.backToBlog', 'Back to Blog') + '</a>' +
      '</div>';
    }
  }

  function renderPost(post) {
    var heroSection = document.getElementById('post-hero');
    var contentSection = document.getElementById('post-content');

    document.title = post.title + ' | Katla Intel Blog';

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.excerpt) {
      metaDesc.setAttribute('content', post.excerpt);
    }

    if (heroSection) {
      var bgStyle = '';
      if (post.featuredImage) {
        bgStyle = 'background-image:linear-gradient(to bottom,rgba(26,26,46,0.65),rgba(26,26,46,0.8)),url(' + post.featuredImage + ');background-size:cover;background-position:center;';
      } else {
        bgStyle = 'background:linear-gradient(135deg,var(--color-dark) 0%,var(--color-dark-lighter) 100%);';
      }

      heroSection.innerHTML = '<div style="' + bgStyle + 'padding:var(--space-5xl) 0 var(--space-3xl);margin-top:var(--navbar-height)">' +
        '<div class="container" style="text-align:center">' +
          '<nav class="page-header__breadcrumb" aria-label="Breadcrumb" style="margin-bottom:var(--space-lg)">' +
            '<a href="/" style="color:rgba(255,255,255,0.7)">' + KatlaI18n.t('js.breadcrumb.home', 'Home') + '</a>' +
            '<span aria-hidden="true" style="color:rgba(255,255,255,0.5)">/</span>' +
            '<a href="/blog" style="color:rgba(255,255,255,0.7)">' + KatlaI18n.t('js.breadcrumb.blog', 'Blog') + '</a>' +
            '<span aria-hidden="true" style="color:rgba(255,255,255,0.5)">/</span>' +
            '<span style="color:rgba(255,255,255,0.9)">' + DOMPurify.sanitize(post.title) + '</span>' +
          '</nav>' +
          '<span class="badge ' + getCategoryBadgeClass(post.category) + '" style="margin-bottom:var(--space-md)">' + DOMPurify.sanitize(post.category) + '</span>' +
          '<h1 style="font-size:var(--font-size-3xl);color:var(--color-white);margin-bottom:var(--space-lg);max-width:800px;margin-left:auto;margin-right:auto">' + DOMPurify.sanitize(post.title) + '</h1>' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:var(--space-md);font-size:var(--font-size-sm);color:rgba(255,255,255,0.7)">' +
            '<span>' + KatlaI18n.t('js.by', 'By') + ' ' + DOMPurify.sanitize(post.author || 'Katla Intel') + '</span>' +
            '<span>|</span>' +
            '<span>' + formatDate(post.publishedAt) + '</span>' +
            '<span>|</span>' +
            '<span>' + (post.readTime || 5) + ' ' + KatlaI18n.t('js.minRead', 'min read') + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (contentSection) {
      var tagsHTML = '';
      if (post.tags && post.tags.length > 0) {
        tagsHTML = '<div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);margin-top:var(--space-2xl);padding-top:var(--space-xl);border-top:1px solid var(--color-border)">';
        post.tags.forEach(function(tag) {
          tagsHTML += '<span class="badge badge--gray">' + DOMPurify.sanitize(tag) + '</span>';
        });
        tagsHTML += '</div>';
      }

      contentSection.innerHTML = '<div class="container container--narrow" style="padding:var(--space-3xl) var(--space-lg)">' +
        '<div class="blog-post-content" style="font-size:var(--font-size-md);line-height:var(--line-height-relaxed);color:var(--color-text-secondary)">' +
          DOMPurify.sanitize(post.content, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allowfullscreen', 'frameborder', 'src'] }) +
        '</div>' +
        tagsHTML +
        '<div style="margin-top:var(--space-2xl)">' +
          '<a href="/blog" class="btn btn--secondary">&larr; ' + KatlaI18n.t('js.backToBlog', 'Back to Blog') + '</a>' +
        '</div>' +
      '</div>';
    }
  }

  function renderRelatedPosts(posts) {
    var relatedSection = document.getElementById('related-posts');
    if (!relatedSection || posts.length === 0) {
      if (relatedSection) relatedSection.style.display = 'none';
      return;
    }

    var cardsHTML = '';
    posts.forEach(function(post) {
      var imageHTML;
      if (post.featuredImage) {
        imageHTML = '<img src="' + post.featuredImage + '" alt="' + DOMPurify.sanitize(post.title) + '" loading="lazy">';
      } else {
        imageHTML = '<div class="placeholder-image" style="min-height:200px;border-radius:0" aria-hidden="true">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '</div>';
      }

      cardsHTML += '<article class="card card--blog">' +
        '<div class="card__image">' + imageHTML + '</div>' +
        '<div class="card__body">' +
          '<span class="badge ' + getCategoryBadgeClass(post.category) + '">' + DOMPurify.sanitize(post.category) + '</span>' +
          '<h3 class="card__title">' + DOMPurify.sanitize(post.title) + '</h3>' +
          '<div class="card__meta">' +
            '<span>' + formatDate(post.publishedAt) + '</span>' +
            '<span>|</span>' +
            '<span>' + (post.readTime || 5) + ' ' + KatlaI18n.t('js.minRead', 'min read') + '</span>' +
          '</div>' +
          '<p class="card__description">' + DOMPurify.sanitize(post.excerpt) + '</p>' +
          '<a href="/blog-post?slug=' + encodeURIComponent(post.slug) + '" class="card__link">' + KatlaI18n.t('js.readMore', 'Read More') + ' &rarr;</a>' +
        '</div>' +
      '</article>';
    });

    relatedSection.innerHTML = '<div class="container">' +
      '<div class="section__header">' +
        '<h2 class="section__title">' + KatlaI18n.t('js.relatedArticles', 'Related Articles') + '</h2>' +
        '<p class="section__subtitle">' + KatlaI18n.t('js.relatedSubtitle', 'More posts you might find interesting') + '</p>' +
      '</div>' +
      '<div class="blog-grid" data-reveal-stagger>' + cardsHTML + '</div>' +
    '</div>';
    relatedSection.style.display = '';
  }

  function loadRelatedPosts(slug) {
    KatlaAPI.posts.related(slug)
      .then(function(response) {
        var posts = response.data || [];
        renderRelatedPosts(posts.slice(0, 3));
      })
      .catch(function(error) {
        console.error('Error loading related posts:', error);
      });
  }

  function loadPost() {
    var slug = getSlug();
    if (!slug) {
      showNotFound();
      return;
    }

    showLoading();

    KatlaAPI.posts.getBySlug(slug)
      .then(function(response) {
        var post = response.data;
        if (!post) {
          showNotFound();
          return;
        }
        renderPost(post);
        if (post.category) {
          loadRelatedPosts(post.slug);
        }
      })
      .catch(function(error) {
        console.error('Error loading post:', error);
        showNotFound();
      });
  }

  document.addEventListener('DOMContentLoaded', loadPost);
})();
