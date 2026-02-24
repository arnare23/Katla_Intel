(function() {
  'use strict';

  var AdminJobs = {};
  var currentFilter = 'all';
  var DEPARTMENTS = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'research', label: 'Research' },
    { value: 'design', label: 'Design' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' }
  ];
  var JOB_TYPES = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  AdminJobs.renderList = function(container) {
    container.innerHTML = '';

    var header = '<div class="admin-page-header">' +
      '<h1 class="admin-page-header__title">Jobs</h1>' +
      '<div class="admin-page-header__actions">' +
        '<a href="#/jobs/new" class="btn btn--primary btn--small">+ New Job</a>' +
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
          '<thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>' +
          '<tbody id="jobsTableBody"><tr><td colspan="5" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr></tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

    container.innerHTML = header + table;

    container.querySelectorAll('.admin-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentFilter = btn.getAttribute('data-filter');
        AdminJobs.renderList(container);
      });
    });

    AdminJobs.loadList();
  };

  AdminJobs.loadList = function() {
    var tbody = document.getElementById('jobsTableBody');
    if (!tbody) return;

    var params = {};
    if (currentFilter !== 'all') {
      params.status = currentFilter;
    }

    KatlaAPI.jobs.adminList(params).then(function(response) {
      var jobs = response.data || [];
      if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No jobs found</td></tr>';
        return;
      }
      var rows = '';
      jobs.forEach(function(d) {
        var status = d.status || 'draft';
        rows += '<tr>' +
          '<td><strong>' + AdminUtils.escapeHtml(AdminUtils.truncate(d.title || 'Untitled', 50)) + '</strong></td>' +
          '<td>' + AdminUtils.escapeHtml(d.type || 'N/A') + '</td>' +
          '<td>' + AdminUtils.escapeHtml(d.location || 'N/A') + '</td>' +
          '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
          '<td class="admin-table__actions">' +
            '<a href="#/jobs/edit/' + d.id + '" class="admin-table__action-btn">Edit</a>' +
            '<button class="admin-table__action-btn admin-table__action-btn--danger" data-delete="' + d.id + '">Delete</button>' +
          '</td>' +
        '</tr>';
      });
      tbody.innerHTML = rows;

      tbody.querySelectorAll('[data-delete]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var docId = btn.getAttribute('data-delete');
          AdminUtils.confirm('Delete Job', 'Are you sure? This cannot be undone.').then(function(ok) {
            if (ok) {
              KatlaAPI.jobs.delete(docId).then(function() {
                AdminUtils.showToast('Job deleted');
                AdminJobs.loadList();
              }).catch(function(err) { AdminUtils.showToast('Error: ' + err.message, 'error'); });
            }
          });
        });
      });
    }).catch(function(err) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">Error: ' + AdminUtils.escapeHtml(err.message) + '</td></tr>';
    });
  };

  AdminJobs.renderForm = function(container, id) {
    container.innerHTML = '';
    var isEdit = !!id;

    var html = '<a href="#/jobs" class="admin-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Jobs</a>' +
      '<div class="admin-page-header"><h1 class="admin-page-header__title">' + (isEdit ? 'Edit Job' : 'New Job') + '</h1></div>' +
      '<form id="jobForm" class="admin-form">' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label admin-form__label--required" for="jobTitle">Title</label>' +
          '<input type="text" id="jobTitle" class="admin-form__input" placeholder="Job title" required>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="jobDepartment">Department</label>' +
            '<select id="jobDepartment" class="admin-form__select" required>' +
              '<option value="">Select department</option>' +
              DEPARTMENTS.map(function(d) { return '<option value="' + d.value + '">' + d.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label admin-form__label--required" for="jobType">Type</label>' +
            '<select id="jobType" class="admin-form__select" required>' +
              '<option value="">Select type</option>' +
              JOB_TYPES.map(function(t) { return '<option value="' + t.value + '">' + t.label + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label admin-form__label--required" for="jobLocation">Location</label>' +
          '<input type="text" id="jobLocation" class="admin-form__input" placeholder="e.g. Reykjavik, Iceland / Remote" required>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label" for="jobShortDesc">Short Description</label>' +
          '<textarea id="jobShortDesc" class="admin-form__textarea" rows="3" placeholder="Brief description shown in listings"></textarea>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Requirements</label>' +
          '<div class="admin-list-input" id="jobRequirementsContainer">' +
            '<div class="admin-list-input__items" id="jobRequirements"></div>' +
            '<button type="button" class="admin-list-input__add" id="jobAddRequirement">+ Add Requirement</button>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__group">' +
          '<label class="admin-form__label">Full Description</label>' +
          '<div class="admin-editor" id="jobEditorContainer"></div>' +
        '</div>' +
        '<div class="admin-form__row">' +
          '<div class="admin-form__group">' +
            '<label class="admin-form__label" for="jobOrder">Display Order</label>' +
            '<input type="number" id="jobOrder" class="admin-form__input" value="0" min="0">' +
          '</div>' +
          '<div class="admin-form__group" style="display:flex;align-items:center;padding-top:var(--space-xl)">' +
            '<div class="admin-toggle">' +
              '<input type="checkbox" id="jobStatus" class="admin-toggle__input">' +
              '<label for="jobStatus" class="admin-toggle__switch"></label>' +
              '<span class="admin-toggle__label" id="jobStatusLabel">Draft</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-form__actions">' +
          '<button type="submit" id="jobSaveBtn" class="btn btn--primary">Save Job</button>' +
          '<a href="#/jobs" class="btn btn--ghost">Cancel</a>' +
        '</div>' +
      '</form>';

    container.innerHTML = html;
    AdminEditor.init('jobEditorContainer');

    // Status toggle
    document.getElementById('jobStatus').addEventListener('change', function() {
      document.getElementById('jobStatusLabel').textContent = this.checked ? 'Published' : 'Draft';
    });

    // Requirements list
    var requirements = [];
    function renderRequirements() {
      var el = document.getElementById('jobRequirements');
      el.innerHTML = requirements.map(function(r, i) {
        return '<div class="admin-list-input__item">' +
          '<input type="text" class="admin-form__input" value="' + AdminUtils.escapeHtml(r) + '" data-req-idx="' + i + '">' +
          '<button type="button" class="admin-list-input__remove" data-req-remove="' + i + '">x</button>' +
        '</div>';
      }).join('');
      el.querySelectorAll('[data-req-idx]').forEach(function(input) {
        input.addEventListener('input', function() {
          requirements[parseInt(input.getAttribute('data-req-idx'))] = input.value;
        });
      });
      el.querySelectorAll('[data-req-remove]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          requirements.splice(parseInt(btn.getAttribute('data-req-remove')), 1);
          renderRequirements();
        });
      });
    }
    document.getElementById('jobAddRequirement').addEventListener('click', function() {
      requirements.push('');
      renderRequirements();
      var items = document.querySelectorAll('#jobRequirements .admin-form__input');
      if (items.length) items[items.length - 1].focus();
    });

    // Load if editing
    if (isEdit) {
      KatlaAPI.jobs.get(id).then(function(response) {
        var d = response.data;
        if (!d) { AdminUtils.showToast('Not found', 'error'); AdminRouter.navigate('/jobs'); return; }
        document.getElementById('jobTitle').value = d.title || '';
        document.getElementById('jobDepartment').value = d.department || '';
        document.getElementById('jobType').value = d.type || '';
        document.getElementById('jobLocation').value = d.location || '';
        document.getElementById('jobShortDesc').value = d.shortDescription || '';
        document.getElementById('jobOrder').value = d.order || 0;
        document.getElementById('jobStatus').checked = d.status === 'published';
        document.getElementById('jobStatusLabel').textContent = d.status === 'published' ? 'Published' : 'Draft';
        if (d.content) AdminEditor.setContent(d.content);
        if (d.requirements && d.requirements.length) { requirements = d.requirements.slice(); renderRequirements(); }
      }).catch(function(err) {
        AdminUtils.showToast('Error: ' + err.message, 'error');
        AdminRouter.navigate('/jobs');
      });
    }

    // Submit
    document.getElementById('jobForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var title = document.getElementById('jobTitle').value.trim();
      var department = document.getElementById('jobDepartment').value;
      var type = document.getElementById('jobType').value;
      var location = document.getElementById('jobLocation').value.trim();

      if (!title) { AdminUtils.showToast('Title is required', 'error'); return; }
      if (!department) { AdminUtils.showToast('Department is required', 'error'); return; }
      if (!type) { AdminUtils.showToast('Type is required', 'error'); return; }
      if (!location) { AdminUtils.showToast('Location is required', 'error'); return; }

      var saveBtn = document.getElementById('jobSaveBtn');
      saveBtn.disabled = true; saveBtn.textContent = 'Saving...';

      var data = {
        title: title,
        department: department,
        type: type,
        location: location,
        shortDescription: document.getElementById('jobShortDesc').value.trim(),
        requirements: requirements.filter(function(r) { return r.trim(); }),
        content: DOMPurify.sanitize(AdminEditor.getContent()),
        order: parseInt(document.getElementById('jobOrder').value) || 0,
        status: document.getElementById('jobStatus').checked ? 'published' : 'draft'
      };

      var promise;
      if (isEdit) {
        promise = KatlaAPI.jobs.update(id, data);
      } else {
        promise = KatlaAPI.jobs.create(data);
      }

      promise.then(function() {
        AdminUtils.showToast(isEdit ? 'Job updated' : 'Job created');
        AdminRouter.navigate('/jobs');
      }).catch(function(err) {
        AdminUtils.showToast('Error: ' + err.message, 'error');
        saveBtn.disabled = false; saveBtn.textContent = 'Save Job';
      });
    });
  };

  window.AdminJobs = AdminJobs;
})();
