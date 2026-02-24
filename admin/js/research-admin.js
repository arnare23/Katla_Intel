(function() {
  'use strict';

  var AdminResearch = {};
  var currentFilter = 'all';

  AdminResearch.renderList = function(container) {
    container.innerHTML = '';

    var header = '<div class="admin-page-header">' +
      '<h1 class="admin-page-header__title">Research</h1>' +
      '<div class="admin-page-header__actions">' +
        '<a href="#/research/new" class="btn btn--primary btn--small">+ New Paper</a>' +
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
          '<thead><tr><th>Title</th><th>Authors</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody id="researchTableBody"><tr><td colspan="4" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

    container.innerHTML = header + table;

    container.querySelectorAll('.admin-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentFilter = btn.getAttribute('data-filter');
        AdminResearch.renderList(container);
      });
    });

    AdminResearch.loadList();
  };

  AdminResearch.loadList = function() {
    var tbody = document.getElementById('researchTableBody');
    if (!tbody) return;

    var query = window.db.collection('research').orderBy('createdAt', 'desc');
    if (currentFilter !== 'all') {
      query = query.where('status', '==', currentFilter);
    }

    query.get().then(function(snapshot) {
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="4" class="admin-table__empty">No research papers found</td></tr>';
        return;
      }
      var rows = '';
      snapshot.forEach(function(doc) {
        var d = doc.data();
        var status = d.status || 'draft';
        var authors = (d.authors || []).join(', ') || 'N/A';
        rows += '<tr>' +
          '<td><strong>' + AdminUtils.escapeHtml(AdminUtils.truncate(d.title || 'Untitled', 50)) + '</strong></td>' +
          '<td>' + AdminUtils.escapeHtml(AdminUtils.truncate(authors, 40)) + '</td>' +
          '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
          '<td class="admin-table__actions">' +
            '<a href="#/research/edit/' + doc.id + '" class="admin-table__action-btn">Edit</a>' +
            '<button class="admin-table__action-btn admin-table__action-btn--danger" data-delete="' + doc.id + '">Delete</button>' +
          '</td>' +
        '</tr>';
      });
      tbody.innerHTML = rows;

      tbody.querySelectorAll('[data-delete]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var docId = btn.getAttribute('data-delete');
          AdminUtils.confirm('Delete Paper', 'Are you sure? This cannot be undone.').then(function(ok) {
            if (ok) {
              window.db.collection('research').doc(docId).delete().then(function() {
                AdminUtils.showToast('Paper deleted');
                AdminResearch.loadList();
              }).catch(function(err) { AdminUtils.showToast('Error: ' + err.message, 'error'); });
            }
          });
        });
      });
    }).catch(function(err) {
      tbody.innerHTML = '<tr><td colspan="4" class="admin-table__empty">Error: ' + AdminUtils.escapeHtml(err.message) + '</td></tr>';
    });
  };

  AdminResearch.renderForm = function(container, id) {
    container.innerHTML = '';
    var isEdit = !!id;

    var html = '<a href="#/research" class="admin-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Research</a>' +
      '<div class="admin-page-header"><h1 class="admin-page-header__title">' + (isEdit ? 'Edit Paper' : 'New Paper') + '</h1></div>' +
      '<form id="researchForm" class="admin-form">' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="resTitle">Title</label>' +
            '<input type="text" id="resTitle" class="admin-form__input" placeholder="Paper title" required>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="resSlug">Slug</label>' +
            '<input type="text" id="resSlug" class="admin-form__input" placeholder="auto-generated-slug">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Authors</label>' +
          '<div class="admin-tag-input-wrapper">' +
            '<div class="admin-tags" id="resAuthorsDisplay"></div>' +
            '<div class="admin-tag-input-row">' +
              '<input type="text" id="resAuthorInput" class="admin-form__input" placeholder="Add author and press Enter">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Tags</label>' +
          '<div class="admin-tag-input-wrapper">' +
            '<div class="admin-tags" id="resTagsDisplay"></div>' +
            '<div class="admin-tag-input-row">' +
              '<input type="text" id="resTagInput" class="admin-form__input" placeholder="Add tag and press Enter">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label" for="resAbstract">Abstract</label>' +
          '<textarea id="resAbstract" class="admin-form__textarea" rows="5" placeholder="Paper abstract"></textarea>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Featured Image</label>' +
          '<div class="admin-upload" id="resImageUpload">' +
            '<div class="admin-upload__preview" id="resImagePreview" hidden></div>' +
            '<div class="admin-upload__dropzone" id="resImageDropzone">' +
              '<div class="admin-upload__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>' +
              '<p class="admin-upload__text"><strong>Click to upload</strong> image</p>' +
            '</div>' +
            '<input type="file" id="resImageFile" class="admin-upload__input" accept="image/*">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">PDF Document</label>' +
          '<div class="admin-upload" id="resPdfUpload">' +
            '<div id="resPdfPreview" hidden></div>' +
            '<div class="admin-upload__dropzone" id="resPdfDropzone">' +
              '<div class="admin-upload__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>' +
              '<p class="admin-upload__text"><strong>Click to upload</strong> PDF</p>' +
            '</div>' +
            '<input type="file" id="resPdfFile" class="admin-upload__input" accept=".pdf">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Content</label>' +
          '<div class="admin-editor" id="resEditorContainer"></div>' +
        '</div>' +
        '<div class="admin-form__group" style="display:flex;align-items:center;gap:var(--space-md)">' +
          '<div class="admin-toggle">' +
            '<input type="checkbox" id="resStatus" class="admin-toggle__input">' +
            '<label for="resStatus" class="admin-toggle__switch"></label>' +
            '<span class="admin-toggle__label" id="resStatusLabel">Draft</span>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__actions">' +
          '<button type="submit" id="resSaveBtn" class="btn btn--primary">Save Paper</button>' +
          '<a href="#/research" class="btn btn--ghost">Cancel</a>' +
        '</div>' +
      '</form>';

    container.innerHTML = html;
    AdminEditor.init('resEditorContainer');

    // Auto slug
    document.getElementById('resTitle').addEventListener('input', function() {
      var slugEl = document.getElementById('resSlug');
      if (!slugEl.dataset.manual) { slugEl.value = AdminUtils.slugify(this.value); }
    });
    document.getElementById('resSlug').addEventListener('input', function() { this.dataset.manual = 'true'; });

    // Status toggle
    document.getElementById('resStatus').addEventListener('change', function() {
      document.getElementById('resStatusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    // Authors
    var authors = [];
    function renderAuthors() {
      var display = document.getElementById('resAuthorsDisplay');
      display.innerHTML = authors.map(function(a, i) {
        return '<span class="admin-tag">' + AdminUtils.escapeHtml(a) + '<button type="button" class="admin-tag__remove" data-author-idx="' + i + '">x</button></span>';
      }).join('');
      display.querySelectorAll('.admin-tag__remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          authors.splice(parseInt(btn.getAttribute('data-author-idx')), 1);
          renderAuthors();
        });
      });
    }
    document.getElementById('resAuthorInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val && authors.indexOf(val) === -1) { authors.push(val); renderAuthors(); }
        this.value = '';
      }
    });

    // Tags
    var tags = [];
    function renderTags() {
      var display = document.getElementById('resTagsDisplay');
      display.innerHTML = tags.map(function(t, i) {
        return '<span class="admin-tag">' + AdminUtils.escapeHtml(t) + '<button type="button" class="admin-tag__remove" data-tag-idx="' + i + '">x</button></span>';
      }).join('');
      display.querySelectorAll('.admin-tag__remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          tags.splice(parseInt(btn.getAttribute('data-tag-idx')), 1);
          renderTags();
        });
      });
    }
    document.getElementById('resTagInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val && tags.indexOf(val) === -1) { tags.push(val); renderTags(); }
        this.value = '';
      }
    });

    // Image upload
    var imageUrl = '';
    var imgDropzone = document.getElementById('resImageDropzone');
    var imgFileInput = document.getElementById('resImageFile');
    imgDropzone.addEventListener('click', function() { imgFileInput.click(); });
    imgDropzone.addEventListener('dragover', function(e) { e.preventDefault(); imgDropzone.classList.add('admin-upload__dropzone--active'); });
    imgDropzone.addEventListener('dragleave', function() { imgDropzone.classList.remove('admin-upload__dropzone--active'); });
    imgDropzone.addEventListener('drop', function(e) {
      e.preventDefault(); imgDropzone.classList.remove('admin-upload__dropzone--active');
      if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
    });
    imgFileInput.addEventListener('change', function() { if (this.files.length) handleImageFile(this.files[0]); });

    function handleImageFile(file) {
      AdminUtils.showToast('Uploading image...');
      AdminStorage.uploadImage(file).then(function(url) {
        imageUrl = url; showImagePreview(url); AdminUtils.showToast('Image uploaded');
      }).catch(function(err) { AdminUtils.showToast('Upload failed: ' + err.message, 'error'); });
    }

    function showImagePreview(url) {
      var preview = document.getElementById('resImagePreview');
      preview.innerHTML = '<img src="' + url + '" alt="Preview"><button type="button" class="admin-upload__preview-remove">x</button>';
      preview.hidden = false;
      preview.classList.add('admin-upload__preview');
      document.getElementById('resImageDropzone').hidden = true;
      preview.querySelector('.admin-upload__preview-remove').addEventListener('click', function() {
        imageUrl = ''; preview.hidden = true; preview.innerHTML = '';
        document.getElementById('resImageDropzone').hidden = false;
      });
    }

    // PDF upload
    var pdfUrl = '';
    var pdfDropzone = document.getElementById('resPdfDropzone');
    var pdfFileInput = document.getElementById('resPdfFile');
    pdfDropzone.addEventListener('click', function() { pdfFileInput.click(); });
    pdfDropzone.addEventListener('dragover', function(e) { e.preventDefault(); pdfDropzone.classList.add('admin-upload__dropzone--active'); });
    pdfDropzone.addEventListener('dragleave', function() { pdfDropzone.classList.remove('admin-upload__dropzone--active'); });
    pdfDropzone.addEventListener('drop', function(e) {
      e.preventDefault(); pdfDropzone.classList.remove('admin-upload__dropzone--active');
      if (e.dataTransfer.files.length) handlePdfFile(e.dataTransfer.files[0]);
    });
    pdfFileInput.addEventListener('change', function() { if (this.files.length) handlePdfFile(this.files[0]); });

    function handlePdfFile(file) {
      AdminUtils.showToast('Uploading PDF...');
      AdminStorage.uploadPDF(file).then(function(url) {
        pdfUrl = url; showPdfPreview(url, file.name); AdminUtils.showToast('PDF uploaded');
      }).catch(function(err) { AdminUtils.showToast('Upload failed: ' + err.message, 'error'); });
    }

    function showPdfPreview(url, name) {
      var preview = document.getElementById('resPdfPreview');
      preview.innerHTML = '<div class="admin-upload__pdf-link">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' +
        '<a href="' + url + '" target="_blank" rel="noopener">' + AdminUtils.escapeHtml(name || 'document.pdf') + '</a>' +
        '<button type="button" class="admin-tag__remove" id="resPdfRemove">x</button>' +
      '</div>';
      preview.hidden = false;
      document.getElementById('resPdfDropzone').hidden = true;
      document.getElementById('resPdfRemove').addEventListener('click', function() {
        pdfUrl = ''; preview.hidden = true; preview.innerHTML = '';
        document.getElementById('resPdfDropzone').hidden = false;
      });
    }

    // Load if editing
    if (isEdit) {
      window.db.collection('research').doc(id).get().then(function(doc) {
        if (!doc.exists) { AdminUtils.showToast('Not found', 'error'); AdminRouter.navigate('/research'); return; }
        var d = doc.data();
        document.getElementById('resTitle').value = d.title || '';
        document.getElementById('resSlug').value = d.slug || '';
        document.getElementById('resSlug').dataset.manual = 'true';
        document.getElementById('resAbstract').value = d.abstract || '';
        document.getElementById('resStatus').checked = d.status === 'published';
        document.getElementById('resStatusLabel').textContent = d.status === 'published' ? 'Published' : 'Draft';
        if (d.content) AdminEditor.setContent(d.content);
        if (d.authors && d.authors.length) { authors = d.authors.slice(); renderAuthors(); }
        if (d.tags && d.tags.length) { tags = d.tags.slice(); renderTags(); }
        if (d.featuredImage) { imageUrl = d.featuredImage; showImagePreview(imageUrl); }
        if (d.pdfUrl) { pdfUrl = d.pdfUrl; showPdfPreview(pdfUrl, d.pdfName || 'document.pdf'); }
      });
    }

    // Submit
    document.getElementById('researchForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var title = document.getElementById('resTitle').value.trim();
      if (!title) { AdminUtils.showToast('Title is required', 'error'); return; }

      var saveBtn = document.getElementById('resSaveBtn');
      saveBtn.disabled = true; saveBtn.textContent = 'Saving...';

      var data = {
        title: title,
        slug: document.getElementById('resSlug').value.trim() || AdminUtils.slugify(title),
        authors: authors,
        tags: tags,
        abstract: document.getElementById('resAbstract').value.trim(),
        featuredImage: imageUrl,
        pdfUrl: pdfUrl,
        content: DOMPurify.sanitize(AdminEditor.getContent()),
        status: document.getElementById('resStatus').checked ? 'published' : 'draft',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      var promise;
      if (isEdit) {
        promise = window.db.collection('research').doc(id).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        promise = window.db.collection('research').add(data);
      }

      promise.then(function() {
        AdminUtils.showToast(isEdit ? 'Paper updated' : 'Paper created');
        AdminRouter.navigate('/research');
      }).catch(function(err) {
        AdminUtils.showToast('Error: ' + err.message, 'error');
        saveBtn.disabled = false; saveBtn.textContent = 'Save Paper';
      });
    });
  };

  window.AdminResearch = AdminResearch;
})();
