(function() {
  'use strict';

  var AdminCaseStudies = {};
  var currentFilter = 'all';
  var CATEGORIES = [
    { value: 'deep-learning', label: 'Deep Learning' },
    { value: 'automation', label: 'Automation' },
    { value: 'file-management', label: 'File Management' },
    { value: 'consulting', label: 'Consulting' }
  ];

  AdminCaseStudies.renderList = function(container) {
    container.innerHTML = '';

    var header = '<div class="admin-page-header">' +
      '<h1 class="admin-page-header__title">Case Studies</h1>' +
      '<div class="admin-page-header__actions">' +
        '<a href="#/case-studies/new" class="btn btn--primary btn--small">+ New Case Study</a>' +
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
          '<thead><tr><th>Title</th><th>Client</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody id="caseStudiesTableBody"><tr><td colspan="5" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

    container.innerHTML = header + table;

    container.querySelectorAll('.admin-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentFilter = btn.getAttribute('data-filter');
        AdminCaseStudies.renderList(container);
      });
    });

    AdminCaseStudies.loadList();
  };

  AdminCaseStudies.loadList = function() {
    var tbody = document.getElementById('caseStudiesTableBody');
    if (!tbody) return;

    var query = window.db.collection('caseStudies').orderBy('createdAt', 'desc');
    if (currentFilter !== 'all') {
      query = query.where('status', '==', currentFilter);
    }

    query.get().then(function(snapshot) {
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No case studies found</td></tr>';
        return;
      }
      var rows = '';
      snapshot.forEach(function(doc) {
        var d = doc.data();
        var status = d.status || 'draft';
        rows += '<tr>' +
          '<td><strong>' + AdminUtils.escapeHtml(AdminUtils.truncate(d.title || 'Untitled', 50)) + '</strong></td>' +
          '<td>' + AdminUtils.escapeHtml(d.client || 'N/A') + '</td>' +
          '<td>' + AdminUtils.escapeHtml(d.category || 'N/A') + '</td>' +
          '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
          '<td class="admin-table__actions">' +
            '<a href="#/case-studies/edit/' + doc.id + '" class="admin-table__action-btn">Edit</a>' +
            '<button class="admin-table__action-btn admin-table__action-btn--danger" data-delete="' + doc.id + '">Delete</button>' +
          '</td>' +
        '</tr>';
      });
      tbody.innerHTML = rows;

      tbody.querySelectorAll('[data-delete]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var docId = btn.getAttribute('data-delete');
          AdminUtils.confirm('Delete Case Study', 'Are you sure? This cannot be undone.').then(function(ok) {
            if (ok) {
              window.db.collection('caseStudies').doc(docId).delete().then(function() {
                AdminUtils.showToast('Case study deleted');
                AdminCaseStudies.loadList();
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

  AdminCaseStudies.renderForm = function(container, id) {
    container.innerHTML = '';
    var isEdit = !!id;

    var html = '<a href="#/case-studies" class="admin-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Case Studies</a>' +
      '<div class="admin-page-header"><h1 class="admin-page-header__title">' + (isEdit ? 'Edit Case Study' : 'New Case Study') + '</h1></div>' +
      '<form id="caseStudyForm" class="admin-form">' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="csTitle">Title</label>' +
            '<input type="text" id="csTitle" class="admin-form__input" placeholder="Case study title" required>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="csSlug">Slug</label>' +
            '<input type="text" id="csSlug" class="admin-form__input" placeholder="auto-generated-slug">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="csClient">Client</label>' +
            '<input type="text" id="csClient" class="admin-form__input" placeholder="Client name" required>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="csCategory">Category</label>' +
            '<select id="csCategory" class="admin-form__select" required>' +
              '<option value="">Select category</option>' +
              CATEGORIES.map(function(c) { return '<option value="' + c.value + '">' + c.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label" for="csDescription">Description</label>' +
          '<textarea id="csDescription" class="admin-form__textarea" rows="3" placeholder="Brief description of the case study"></textarea>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Featured Image</label>' +
          '<div class="admin-upload" id="csImageUpload">' +
            '<div class="admin-upload__preview" id="csImagePreview" hidden></div>' +
            '<div class="admin-upload__dropzone" id="csImageDropzone">' +
              '<div class="admin-upload__icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>' +
              '<p class="admin-upload__text"><strong>Click to upload</strong> or drag and drop</p>' +
            '</div>' +
            '<input type="file" id="csImageFile" class="admin-upload__input" accept="image/*">' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Metrics</label>' +
          '<div class="admin-metrics-builder" id="csMetrics"></div>' +
          '<button type="button" class="admin-list-input__add" id="csAddMetric" style="margin-top:var(--space-sm)">+ Add Metric</button>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Technologies</label>' +
          '<div class="admin-tag-input-wrapper">' +
            '<div class="admin-tags" id="csTechDisplay"></div>' +
            '<div class="admin-tag-input-row">' +
              '<input type="text" id="csTechInput" class="admin-form__input" placeholder="Add technology and press Enter">' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Content</label>' +
          '<div class="admin-editor" id="csEditorContainer"></div>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="csOrder">Display Order</label>' +
            '<input type="number" id="csOrder" class="admin-form__input" value="0" min="0">' +
          '</div>' +
          '<div class="admin-form__group" style="display:flex;flex-direction:column;justify-content:center;gap:var(--space-md);padding-top:var(--space-xl)">' +
            '<div class="admin-toggle">' +
              '<input type="checkbox" id="csStatus" class="admin-toggle__input">' +
              '<label for="csStatus" class="admin-toggle__switch"></label>' +
              '<span class="admin-toggle__label" id="csStatusLabel">Draft</span>' +
            '</div>' +
            '<label class="admin-checkbox">' +
              '<input type="checkbox" id="csFeatured" class="admin-checkbox__input">' +
              '<span class="admin-checkbox__label">Featured case study</span>' +
            '</label>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__actions">' +
          '<button type="submit" id="csSaveBtn" class="btn btn--primary">Save Case Study</button>' +
          '<a href="#/case-studies" class="btn btn--ghost">Cancel</a>' +
        '</div>' +
      '</form>';

    container.innerHTML = html;
    AdminEditor.init('csEditorContainer');

    // Auto slug
    document.getElementById('csTitle').addEventListener('input', function() {
      var slugEl = document.getElementById('csSlug');
      if (!slugEl.dataset.manual) { slugEl.value = AdminUtils.slugify(this.value); }
    });
    document.getElementById('csSlug').addEventListener('input', function() { this.dataset.manual = 'true'; });

    // Status toggle
    document.getElementById('csStatus').addEventListener('change', function() {
      document.getElementById('csStatusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    // Image upload
    var imageUrl = '';
    var dropzone = document.getElementById('csImageDropzone');
    var fileInput = document.getElementById('csImageFile');
    dropzone.addEventListener('click', function() { fileInput.click(); });
    dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('admin-upload__dropzone--active'); });
    dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('admin-upload__dropzone--active'); });
    dropzone.addEventListener('drop', function(e) {
      e.preventDefault(); dropzone.classList.remove('admin-upload__dropzone--active');
      if (e.dataTransfer.files.length) handleImage(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function() { if (this.files.length) handleImage(this.files[0]); });

    function handleImage(file) {
      AdminUtils.showToast('Uploading image...');
      AdminStorage.uploadImage(file).then(function(url) {
        imageUrl = url; showPreview(url); AdminUtils.showToast('Image uploaded');
      }).catch(function(err) { AdminUtils.showToast('Upload failed: ' + err.message, 'error'); });
    }

    function showPreview(url) {
      var preview = document.getElementById('csImagePreview');
      preview.innerHTML = '<img src="' + url + '" alt="Preview"><button type="button" class="admin-upload__preview-remove">x</button>';
      preview.hidden = false;
      document.getElementById('csImageDropzone').hidden = true;
      preview.querySelector('.admin-upload__preview-remove').addEventListener('click', function() {
        imageUrl = ''; preview.hidden = true; preview.innerHTML = '';
        document.getElementById('csImageDropzone').hidden = false;
      });
    }

    // Metrics builder
    var metrics = [];
    function renderMetrics() {
      var el = document.getElementById('csMetrics');
      el.innerHTML = metrics.map(function(m, i) {
        return '<div class="admin-metrics-builder__item">' +
          '<input type="text" class="admin-form__input" placeholder="Value (e.g. 98.5%)" value="' + AdminUtils.escapeHtml(m.value) + '" data-metric-idx="' + i + '" data-metric-field="value">' +
          '<input type="text" class="admin-form__input" placeholder="Label (e.g. Accuracy)" value="' + AdminUtils.escapeHtml(m.label) + '" data-metric-idx="' + i + '" data-metric-field="label">' +
          '<button type="button" class="admin-list-input__remove" data-metric-remove="' + i + '">x</button>' +
        '</div>';
      }).join('');
      el.querySelectorAll('[data-metric-field]').forEach(function(input) {
        input.addEventListener('input', function() {
          var idx = parseInt(input.getAttribute('data-metric-idx'));
          var field = input.getAttribute('data-metric-field');
          metrics[idx][field] = input.value;
        });
      });
      el.querySelectorAll('[data-metric-remove]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          metrics.splice(parseInt(btn.getAttribute('data-metric-remove')), 1);
          renderMetrics();
        });
      });
    }
    document.getElementById('csAddMetric').addEventListener('click', function() {
      metrics.push({ value: '', label: '' });
      renderMetrics();
    });

    // Technologies
    var techs = [];
    function renderTechs() {
      var display = document.getElementById('csTechDisplay');
      display.innerHTML = techs.map(function(t, i) {
        return '<span class="admin-tag">' + AdminUtils.escapeHtml(t) + '<button type="button" class="admin-tag__remove" data-tech-idx="' + i + '">x</button></span>';
      }).join('');
      display.querySelectorAll('.admin-tag__remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
          techs.splice(parseInt(btn.getAttribute('data-tech-idx')), 1);
          renderTechs();
        });
      });
    }
    document.getElementById('csTechInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var val = this.value.trim();
        if (val && techs.indexOf(val) === -1) { techs.push(val); renderTechs(); }
        this.value = '';
      }
    });

    // Load data if editing
    if (isEdit) {
      window.db.collection('caseStudies').doc(id).get().then(function(doc) {
        if (!doc.exists) { AdminUtils.showToast('Not found', 'error'); AdminRouter.navigate('/case-studies'); return; }
        var d = doc.data();
        document.getElementById('csTitle').value = d.title || '';
        document.getElementById('csSlug').value = d.slug || '';
        document.getElementById('csSlug').dataset.manual = 'true';
        document.getElementById('csClient').value = d.client || '';
        document.getElementById('csCategory').value = d.category || '';
        document.getElementById('csDescription').value = d.description || '';
        document.getElementById('csOrder').value = d.order || 0;
        document.getElementById('csStatus').checked = d.status === 'published';
        document.getElementById('csStatusLabel').textContent = d.status === 'published' ? 'Published' : 'Draft';
        document.getElementById('csFeatured').checked = !!d.featured;
        if (d.content) AdminEditor.setContent(d.content);
        if (d.metrics && d.metrics.length) { metrics = d.metrics.slice(); renderMetrics(); }
        if (d.technologies && d.technologies.length) { techs = d.technologies.slice(); renderTechs(); }
        if (d.featuredImage) { imageUrl = d.featuredImage; showPreview(imageUrl); }
      });
    }

    // Submit
    document.getElementById('caseStudyForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var title = document.getElementById('csTitle').value.trim();
      var client = document.getElementById('csClient').value.trim();
      var category = document.getElementById('csCategory').value;

      if (!title) { AdminUtils.showToast('Title is required', 'error'); return; }
      if (!client) { AdminUtils.showToast('Client is required', 'error'); return; }
      if (!category) { AdminUtils.showToast('Category is required', 'error'); return; }

      var saveBtn = document.getElementById('csSaveBtn');
      saveBtn.disabled = true; saveBtn.textContent = 'Saving...';

      var data = {
        title: title,
        slug: document.getElementById('csSlug').value.trim() || AdminUtils.slugify(title),
        client: client,
        category: category,
        description: document.getElementById('csDescription').value.trim(),
        featuredImage: imageUrl,
        metrics: metrics.filter(function(m) { return m.value && m.label; }),
        technologies: techs,
        content: DOMPurify.sanitize(AdminEditor.getContent()),
        order: parseInt(document.getElementById('csOrder').value) || 0,
        status: document.getElementById('csStatus').checked ? 'published' : 'draft',
        featured: document.getElementById('csFeatured').checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      var promise;
      if (isEdit) {
        promise = window.db.collection('caseStudies').doc(id).update(data);
      } else {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        promise = window.db.collection('caseStudies').add(data);
      }

      promise.then(function() {
        AdminUtils.showToast(isEdit ? 'Case study updated' : 'Case study created');
        AdminRouter.navigate('/case-studies');
      }).catch(function(err) {
        AdminUtils.showToast('Error: ' + err.message, 'error');
        saveBtn.disabled = false; saveBtn.textContent = 'Save Case Study';
      });
    });
  };

  window.AdminCaseStudies = AdminCaseStudies;
})();
