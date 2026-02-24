(function() {
  'use strict';

  var AdminPosts = {};
  var currentFilter = 'all';
  var CATEGORIES = [
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'automation', label: 'Automation' },
    { value: 'computer-vision', label: 'Computer Vision' },
    { value: 'strategy', label: 'Strategy' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'industry-spotlight', label: 'Industry Spotlight' }
  ];

  AdminPosts.renderList = function(container) {
    container.innerHTML = '';

    var header = '<div class="admin-page-header">' +
      '<h1 class="admin-page-header__title">Blog Posts</h1>' +
      '<div class="admin-page-header__actions">' +
        '<a href="#/posts/new" class="btn btn--primary btn--small">+ New Post</a>' +
      '</div>' +
    '</div>';

    var table = '<div class="admin-table-wrapper">' +
      '<div class="admin-table-toolbar">' +
        '<div class="admin-table-toolbar__filters">' +
          '<button class="admin-filter-btn ' + (currentFilter === 'all' ? 'admin-filter-btn--active' : '') + '" data-filter="all">All</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'draft' ? 'admin-filter-btn--active' : '') + '" data-filter="draft">Draft</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'published' ? 'admin-filter-btn--active' : '') + '" data-filter="published">Published</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-table-scroll">' +
        '<table class="admin-table">' +
          '<thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>' +
          '<tbody id="postsTableBody"><tr><td colspan="5" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

    container.innerHTML = header + table;

    container.querySelectorAll('.admin-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentFilter = btn.getAttribute('data-filter');
        AdminPosts.renderList(container);
      });
    });

    AdminPosts.loadList();
  };

  AdminPosts.loadList = function() {
    var tbody = document.getElementById('postsTableBody');
    if (!tbody) return;

    var params = {};
    if (currentFilter !== 'all') {
      params.status = currentFilter;
    }

    KatlaAPI.posts.adminList(params).then(function(response) {
      var posts = response.data || [];
      if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No posts found</td></tr>';
        return;
      }
      var rows = '';
      posts.forEach(function(d) {
        var status = d.status || 'draft';
        rows += '<tr>' +
          '<td><strong>' + AdminUtils.escapeHtml(AdminUtils.truncate(d.title || 'Untitled', 50)) + '</strong></td>' +
          '<td>' + AdminUtils.escapeHtml(d.category || 'N/A') + '</td>' +
          '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
          '<td>' + AdminUtils.formatDate(d.createdAt) + '</td>' +
          '<td class="admin-table__actions">' +
            '<a href="#/posts/edit/' + d.id + '" class="admin-table__action-btn">Edit</a>' +
            '<button class="admin-table__action-btn admin-table__action-btn--danger" data-delete="' + d.id + '">Delete</button>' +
          '</td>' +
        '</tr>';
      });
      tbody.innerHTML = rows;

      tbody.querySelectorAll('[data-delete]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var docId = btn.getAttribute('data-delete');
          AdminUtils.confirm('Delete Post', 'Are you sure you want to delete this post? This cannot be undone.').then(function(ok) {
            if (ok) {
              KatlaAPI.posts.delete(docId).then(function() {
                AdminUtils.showToast('Post deleted');
                AdminPosts.loadList();
              }).catch(function(err) {
                AdminUtils.showToast('Error: ' + err.message, 'error');
              });
            }
          });
        });
      });
    }).catch(function(err) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">Error: ' + AdminUtils.escapeHtml(err.message) + '</td></tr>';
    });
  };

  AdminPosts.renderForm = function(container, id) {
    container.innerHTML = '';
    var isEdit = !!id;
    var formTitle = isEdit ? 'Edit Post' : 'New Post';

    var html = '<a href="#/posts" class="admin-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Posts</a>' +
      '<div class="admin-page-header"><h1 class="admin-page-header__title">' + formTitle + '</h1></div>' +
      '<form id="postForm" class="admin-form">' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="postTitle">Title</label>' +
            '<input type="text" id="postTitle" class="admin-form__input" placeholder="Enter post title" required>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="postSlug">Slug</label>' +
            '<input type="text" id="postSlug" class="admin-form__input" placeholder="auto-generated-slug">' +
            '<p class="admin-form__hint">Auto-generated from title. Edit to customize.</p>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="postCategory">Category</label>' +
            '<select id="postCategory" class="admin-form__select" required>' +
              '<option value="">Select category</option>' +
              CATEGORIES.map(function(c) { return '<option value="' + c.value + '">' + c.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="postAuthor">Author</label>' +
            '<input type="text" id="postAuthor" class="admin-form__input" placeholder="Author name">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Tags</label>' +
          '<div class="admin-tag-input-wrapper">' +
            '<div class="admin-tags" id="postTagsDisplay"></div>' +
            '<div class="admin-tag-input-row">' +
              '<input type="text" id="postTagInput" class="admin-form__input" placeholder="Add a tag and press Enter">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Featured Image</label>' +
          '<div class="admin-upload" id="postImageUpload">' +
            '<div class="admin-upload__preview" id="postImagePreview" hidden></div>' +
            '<div class="admin-upload__dropzone" id="postImageDropzone">' +
              '<div class="admin-upload__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>' +
              '<p class="admin-upload__text"><strong>Click to upload</strong> or drag and drop</p>' +
            '</div>' +
            '<input type="file" id="postImageFile" class="admin-upload__input" accept="image/*">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label" for="postExcerpt">Excerpt</label>' +
          '<textarea id="postExcerpt" class="admin-form__textarea" rows="3" placeholder="Short excerpt for previews"></textarea>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Content</label>' +
          '<div class="admin-editor" id="postEditorContainer"></div>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="postReadTime">Read Time (min)</label>' +
            '<input type="number" id="postReadTime" class="admin-form__input" value="1" min="1" readonly>' +
            '<p class="admin-form__hint">Auto-estimated from content</p>' +
          '</div>' +
          '<div class="admin-form__group" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-md);padding-top:var(--space-xl)">' +
            '<div class="admin-toggle">' +
              '<input type="checkbox" id="postStatus" class="admin-toggle__input">' +
              '<label for="postStatus" class="admin-toggle__switch"></label>' +
              '<span class="admin-toggle__label" id="postStatusLabel">Draft</span>' +
            '</div>' +
            '<label class="admin-checkbox">' +
              '<input type="checkbox" id="postFeatured" class="admin-checkbox__input">' +
              '<span class="admin-checkbox__label">Featured post</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__actions">' +
          '<button type="submit" id="postSaveBtn" class="btn btn--primary">Save Post</button>' +
          '<a href="#/posts" class="btn btn--ghost">Cancel</a>' +
        '</div>' +
      '</form>';

    container.innerHTML = html;

    // Init editor
    AdminEditor.init('postEditorContainer');

    // Tag state
    var tags = [];

    function renderTags() {
      var display = document.getElementById('postTagsDisplay');
      display.innerHTML = tags.map(function(tag, i) {
        return '<span class="admin-tag">' + AdminUtils.escapeHtml(tag) + '<button type="button" class="admin-tag__remove" data-tag-index="' + i + '">x</button></span>';
      }).join('');
      display.querySelectorAll('.admin-tag__remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          tags.splice(parseInt(btn.getAttribute('data-tag-index')), 1);
          renderTags();
        });
      });
    }

    document.getElementById('postTagInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val && tags.indexOf(val) === -1) {
          tags.push(val);
          renderTags();
        }
        this.value = '';
      }
    });

    // Auto slug
    document.getElementById('postTitle').addEventListener('input', function() {
      var slugEl = document.getElementById('postSlug');
      if (!slugEl.dataset.manual) {
        slugEl.value = AdminUtils.slugify(this.value);
      }
    });
    document.getElementById('postSlug').addEventListener('input', function() {
      this.dataset.manual = 'true';
    });

    // Status toggle label
    document.getElementById('postStatus').addEventListener('change', function() {
      document.getElementById('postStatusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    // Image upload
    var imageUrl = '';
    var dropzone = document.getElementById('postImageDropzone');
    var fileInput = document.getElementById('postImageFile');

    dropzone.addEventListener('click', function() { fileInput.click(); });
    dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('admin-upload__dropzone--active'); });
    dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('admin-upload__dropzone--active'); });
    dropzone.addEventListener('drop', function(e) {
      e.preventDefault();
      dropzone.classList.remove('admin-upload__dropzone--active');
      if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function() {
      if (this.files.length) handleImageFile(this.files[0]);
    });

    function handleImageFile(file) {
      AdminUtils.showToast('Uploading image...');
      AdminStorage.uploadImage(file).then(function(url) {
        imageUrl = url;
        showImagePreview(url);
        AdminUtils.showToast('Image uploaded');
      }).catch(function(err) {
        AdminUtils.showToast('Upload failed: ' + err.message, 'error');
      });
    }

    function showImagePreview(url) {
      var preview = document.getElementById('postImagePreview');
      preview.innerHTML = '<img src="' + url + '" alt="Preview"><button type="button" class="admin-upload__preview-remove">x</button>';
      preview.hidden = false;
      document.getElementById('postImageDropzone').hidden = true;
      preview.querySelector('.admin-upload__preview-remove').addEventListener('click', function() {
        imageUrl = '';
        preview.hidden = true;
        preview.innerHTML = '';
        document.getElementById('postImageDropzone').hidden = false;
      });
    }

    // Auto read time
    var editorContainer = document.getElementById('postEditorContainer');
    if (editorContainer) {
      var observer = new MutationObserver(function() {
        var content = AdminEditor.getContent();
        document.getElementById('postReadTime').value = AdminUtils.estimateReadTime(content);
      });
      var qlEditor = editorContainer.querySelector('.ql-editor');
      if (qlEditor) {
        observer.observe(qlEditor, { childList: true, subtree: true, characterData: true });
      }
    }

    // Load existing data if editing
    if (isEdit) {
      KatlaAPI.posts.get(id).then(function(response) {
        var d = response.data;
        if (!d) {
          AdminUtils.showToast('Post not found', 'error');
          AdminRouter.navigate('/posts');
          return;
        }
        document.getElementById('postTitle').value = d.title || '';
        document.getElementById('postSlug').value = d.slug || '';
        document.getElementById('postSlug').dataset.manual = 'true';
        document.getElementById('postCategory').value = d.category || '';
        document.getElementById('postAuthor').value = d.author || '';
        document.getElementById('postExcerpt').value = d.excerpt || '';
        document.getElementById('postReadTime').value = d.readTime || 1;
        document.getElementById('postStatus').checked = d.status === 'published';
        document.getElementById('postStatusLabel').textContent = d.status === 'published' ? 'Published' : 'Draft';
        document.getElementById('postFeatured').checked = !!d.featured;
        if (d.content) AdminEditor.setContent(d.content);
        if (d.tags && d.tags.length) { tags = d.tags.slice(); renderTags(); }
        if (d.featuredImage) { imageUrl = d.featuredImage; showImagePreview(imageUrl); }
      }).catch(function(err) {
        AdminUtils.showToast('Error loading post: ' + err.message, 'error');
        AdminRouter.navigate('/posts');
      });
    }

    // Submit
    document.getElementById('postForm').addEventListener('submit', function(e) {
      e.preventDefault();

      var title = document.getElementById('postTitle').value.trim();
      var category = document.getElementById('postCategory').value;

      if (!title) {
        AdminUtils.showToast('Title is required', 'error');
        return;
      }
      if (!category) {
        AdminUtils.showToast('Category is required', 'error');
        return;
      }

      var saveBtn = document.getElementById('postSaveBtn');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      var content = AdminEditor.getContent();
      var data = {
        title: title,
        slug: document.getElementById('postSlug').value.trim() || AdminUtils.slugify(title),
        category: category,
        author: document.getElementById('postAuthor').value.trim(),
        tags: tags,
        featuredImage: imageUrl,
        excerpt: document.getElementById('postExcerpt').value.trim(),
        content: DOMPurify.sanitize(content),
        readTime: parseInt(document.getElementById('postReadTime').value) || 1,
        status: document.getElementById('postStatus').checked ? 'published' : 'draft',
        featured: document.getElementById('postFeatured').checked
      };

      var promise;
      if (isEdit) {
        promise = KatlaAPI.posts.update(id, data);
      } else {
        promise = KatlaAPI.posts.create(data);
      }

      promise.then(function() {
        AdminUtils.showToast(isEdit ? 'Post updated' : 'Post created');
        AdminRouter.navigate('/posts');
      }).catch(function(err) {
        AdminUtils.showToast('Error: ' + err.message, 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Post';
      });
    });
  };

  window.AdminPosts = AdminPosts;
})();
