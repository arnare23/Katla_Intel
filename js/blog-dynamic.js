/**
 * Katla Group - Blog Dynamic Loading
 * Loads blog posts from API with filtering, pagination, and newsletter subscription
 */
(function() {
  'use strict';

  var POSTS_PER_PAGE = 9;
  var currentCategory = 'all';
  var currentOffset = 0;
  var isLoading = false;
  var hasMore = true;

  var placeholderSVG = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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

  function createSkeletonCard() {
    return '<article class="card card--blog">' +
      '<div class="card__image">' +
        '<div style="min-height:200px;background:linear-gradient(90deg,var(--color-bg) 25%,var(--color-bg-accent) 50%,var(--color-bg) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:0"></div>' +
      '</div>' +
      '<div class="card__body">' +
        '<div style="width:80px;height:22px;background:var(--color-bg);border-radius:var(--radius-full);margin-bottom:var(--space-sm)"></div>' +
        '<div style="width:90%;height:20px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-sm)"></div>' +
        '<div style="width:60%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-sm)"></div>' +
        '<div style="width:100%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-xs)"></div>' +
        '<div style="width:70%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm)"></div>' +
      '</div>' +
    '</article>';
  }

  function createFeaturedSkeleton() {
    return '<div class="featured-post">' +
      '<div class="featured-post__image">' +
        '<div style="min-height:100%;background:linear-gradient(90deg,var(--color-bg) 25%,var(--color-bg-accent) 50%,var(--color-bg) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:0"></div>' +
      '</div>' +
      '<div class="featured-post__content" style="padding:var(--space-xl)">' +
        '<div style="width:120px;height:22px;background:var(--color-bg);border-radius:var(--radius-full);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:60%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:90%;height:24px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-md)"></div>' +
        '<div style="width:100%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm);margin-bottom:var(--space-xs)"></div>' +
        '<div style="width:80%;height:14px;background:var(--color-bg);border-radius:var(--radius-sm)"></div>' +
      '</div>' +
    '</div>';
  }

  function renderFeaturedPost(post) {
    var container = document.getElementById('featured-post-container');
    if (!container) return;

    var imageHTML;
    if (post.featuredImage) {
      imageHTML = '<img src="' + post.featuredImage + '" alt="' + post.title + '" loading="eager">';
    } else {
      imageHTML = '<div class="placeholder-image" style="min-height:100%;border-radius:0" aria-hidden="true">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="7.5 4.21 12 6.81 16.5 4.21"/><polyline points="7.5 19.79 7.5 14.6 3 12"/><polyline points="21 12 16.5 14.6 16.5 19.79"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' +
      '</div>';
    }

    var html = '<div class="featured-post" data-reveal="fade-up">' +
      '<div class="featured-post__image">' + imageHTML + '</div>' +
      '<div class="featured-post__content">' +
        '<span class="badge ' + getCategoryBadgeClass(post.category) + '">' + post.category + '</span>' +
        '<div class="featured-post__meta">' +
          '<span>' + formatDate(post.publishedAt) + '</span>' +
          '<span>|</span>' +
          '<span>' + (post.readTime || 5) + ' min read</span>' +
          '<span>|</span>' +
          '<span>By ' + (post.author || 'Katla Group') + '</span>' +
        '</div>' +
        '<h2 class="featured-post__title">' + DOMPurify.sanitize(post.title) + '</h2>' +
        '<p class="featured-post__excerpt">' + DOMPurify.sanitize(post.excerpt) + '</p>' +
        '<a href="/blog-post?slug=' + encodeURIComponent(post.slug) + '" class="card__link">Read Article &rarr;</a>' +
      '</div>' +
    '</div>';

    container.innerHTML = html;
  }

  function renderBlogCard(post) {
    var imageHTML;
    if (post.featuredImage) {
      imageHTML = '<img src="' + post.featuredImage + '" alt="' + DOMPurify.sanitize(post.title) + '" loading="lazy">';
    } else {
      imageHTML = '<div class="placeholder-image" style="min-height:200px;border-radius:0" aria-hidden="true">' + placeholderSVG + '</div>';
    }

    return '<article class="card card--blog">' +
      '<div class="card__image">' + imageHTML + '</div>' +
      '<div class="card__body">' +
        '<span class="badge ' + getCategoryBadgeClass(post.category) + '">' + DOMPurify.sanitize(post.category) + '</span>' +
        '<h3 class="card__title">' + DOMPurify.sanitize(post.title) + '</h3>' +
        '<div class="card__meta">' +
          '<span>' + formatDate(post.publishedAt) + '</span>' +
          '<span>|</span>' +
          '<span>' + (post.readTime || 5) + ' min read</span>' +
        '</div>' +
        '<p class="card__description">' + DOMPurify.sanitize(post.excerpt) + '</p>' +
        '<a href="/blog-post?slug=' + encodeURIComponent(post.slug) + '" class="card__link">Read More &rarr;</a>' +
      '</div>' +
    '</article>';
  }

  function showLoadingGrid() {
    var grid = document.getElementById('blog-grid-container');
    if (!grid) return;
    var skeletons = '';
    for (var i = 0; i < 6; i++) {
      skeletons += createSkeletonCard();
    }
    grid.innerHTML = skeletons;
  }

  function loadFeaturedPost() {
    var container = document.getElementById('featured-post-container');
    if (!container) return;

    container.innerHTML = createFeaturedSkeleton();

    KatlaAPI.posts.list({ featured: true, limit: 1 })
      .then(function(response) {
        if (response.data && response.data.length > 0) {
          renderFeaturedPost(response.data[0]);
        } else {
          return KatlaAPI.posts.list({ limit: 1 })
            .then(function(fallbackResponse) {
              if (fallbackResponse.data && fallbackResponse.data.length > 0) {
                renderFeaturedPost(fallbackResponse.data[0]);
              }
            });
        }
      })
      .catch(function(error) {
        console.error('Error loading featured post:', error);
      });
  }

  function loadPosts(append) {
    if (isLoading) return;
    isLoading = true;

    var grid = document.getElementById('blog-grid-container');
    var loadMoreBtn = document.getElementById('load-more-btn');
    if (!grid) return;

    if (!append) {
      showLoadingGrid();
      currentOffset = 0;
      hasMore = true;
    }

    if (loadMoreBtn) {
      loadMoreBtn.textContent = 'Loading...';
      loadMoreBtn.disabled = true;
    }

    var params = {
      limit: POSTS_PER_PAGE,
      offset: currentOffset
    };

    if (currentCategory !== 'all') {
      params.category = currentCategory;
    }

    KatlaAPI.posts.list(params)
      .then(function(response) {
        if (!append) {
          grid.innerHTML = '';
        }

        var posts = response.data || [];
        var total = response.total || 0;

        if (posts.length === 0 && !append) {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl) 0">' +
            '<p style="font-size:var(--font-size-md);color:var(--color-text-muted)">No posts found in this category.</p>' +
          '</div>';
          hasMore = false;
        } else {
          posts.forEach(function(post) {
            grid.insertAdjacentHTML('beforeend', renderBlogCard(post));
          });

          currentOffset += posts.length;
          hasMore = currentOffset < total;
        }

        if (loadMoreBtn) {
          loadMoreBtn.style.display = hasMore ? '' : 'none';
          loadMoreBtn.textContent = 'Load More Articles';
          loadMoreBtn.disabled = false;
        }

        isLoading = false;

        if (typeof initStaggerForNew === 'function') {
          initStaggerForNew();
        }
      })
      .catch(function(error) {
        console.error('Error loading posts:', error);
        isLoading = false;
        if (loadMoreBtn) {
          loadMoreBtn.textContent = 'Load More Articles';
          loadMoreBtn.disabled = false;
        }
      });
  }

  function initFilters() {
    var filterBtns = document.querySelectorAll('.filter-bar__btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        filterBtns.forEach(function(b) { b.classList.remove('filter-bar__btn--active'); });
        btn.classList.add('filter-bar__btn--active');

        var category = btn.getAttribute('data-category');
        currentCategory = category || 'all';
        loadPosts(false);
      });
    });
  }

  function initLoadMore() {
    var loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function() {
        if (hasMore && !isLoading) {
          loadPosts(true);
        }
      });
    }
  }

  function initNewsletter() {
    var form = document.querySelector('.newsletter__form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var emailInput = form.querySelector('.newsletter__input');
      var submitBtn = form.querySelector('.btn');
      if (!emailInput || !emailInput.value) return;

      var email = emailInput.value.trim();
      if (!email) return;

      submitBtn.textContent = 'Subscribing...';
      submitBtn.disabled = true;

      KatlaAPI.subscribers.subscribe(email, 'blog')
      .then(function() {
        emailInput.value = '';
        submitBtn.textContent = 'Subscribed!';
        setTimeout(function() {
          submitBtn.textContent = 'Subscribe';
          submitBtn.disabled = false;
        }, 3000);
      })
      .catch(function(error) {
        console.error('Newsletter subscription error:', error);
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.disabled = false;
        setTimeout(function() {
          submitBtn.textContent = 'Subscribe';
        }, 3000);
      });
    });
  }

  // Inject shimmer keyframe animation
  function injectShimmerStyle() {
    if (document.getElementById('shimmer-style')) return;
    var style = document.createElement('style');
    style.id = 'shimmer-style';
    style.textContent = '@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}';
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectShimmerStyle();
    loadFeaturedPost();
    initFilters();
    initLoadMore();
    initNewsletter();
    loadPosts(false);
  });
})();
