(function() {
  'use strict';

  var AdminEnquiries = {};
  var currentFilter = 'all';

  AdminEnquiries.renderList = function(container) {
    container.innerHTML = '';

    var header = '<div class="admin-page-header">' +
      '<h1 class="admin-page-header__title">Enquiries</h1>' +
    '</div>';

    var filterBar = '<div class="admin-table-wrapper">' +
      '<div class="admin-table-toolbar">' +
        '<div class="admin-table-toolbar__filters">' +
          '<button class="admin-filter-btn ' + (currentFilter === 'all' ? 'admin-filter-btn--active' : '') + '" data-filter="all">All</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'new' ? 'admin-filter-btn--active' : '') + '" data-filter="new">New</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'read' ? 'admin-filter-btn--active' : '') + '" data-filter="read">Read</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'replied' ? 'admin-filter-btn--active' : '') + '" data-filter="replied">Replied</button>' +
          '<button class="admin-filter-btn ' + (currentFilter === 'archived' ? 'admin-filter-btn--active' : '') + '" data-filter="archived">Archived</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-table-scroll">' +
        '<table class="admin-table">' +
          '<thead><tr>' +
            '<th>Name</th><th>Email</th><th>Service</th><th>Date</th><th>Status</th>' +
          '</tr></thead>' +
          '<tbody id="enquiriesTableBody">' +
            '<tr><td colspan="5" class="admin-loading"><span class="admin-spinner"></span> Loading...</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
    '</div>';

    container.innerHTML = header + filterBar;

    container.querySelectorAll('.admin-filter-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        currentFilter = btn.getAttribute('data-filter');
        AdminEnquiries.renderList(container);
      });
    });

    AdminEnquiries.loadEnquiries();
  };

  AdminEnquiries.loadEnquiries = function() {
    var tbody = document.getElementById('enquiriesTableBody');
    if (!tbody) return;

    var query = window.db.collection('enquiries').orderBy('createdAt', 'desc');

    if (currentFilter !== 'all') {
      query = query.where('status', '==', currentFilter);
    }

    query.get().then(function(snapshot) {
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">No enquiries found</td></tr>';
        return;
      }

      var rows = '';
      snapshot.forEach(function(doc) {
        var d = doc.data();
        var isUnread = !d.status || d.status === 'new';
        var status = d.status || 'new';
        rows += '<tr class="admin-table__row--clickable ' + (isUnread ? 'admin-table__row--unread' : '') + '" data-id="' + doc.id + '">' +
          '<td>' + AdminUtils.escapeHtml(d.name || 'Unknown') + '</td>' +
          '<td>' + AdminUtils.escapeHtml(d.email || '') + '</td>' +
          '<td>' + AdminUtils.escapeHtml(d.service || 'General') + '</td>' +
          '<td>' + AdminUtils.formatDate(d.createdAt) + '</td>' +
          '<td><span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span></td>' +
        '</tr>';
      });
      tbody.innerHTML = rows;

      tbody.querySelectorAll('.admin-table__row--clickable').forEach(function(row) {
        row.addEventListener('click', function() {
          AdminRouter.navigate('/enquiries/' + row.getAttribute('data-id'));
        });
      });
    }).catch(function(err) {
      tbody.innerHTML = '<tr><td colspan="5" class="admin-table__empty">Error loading enquiries: ' + AdminUtils.escapeHtml(err.message) + '</td></tr>';
    });
  };

  AdminEnquiries.renderDetail = function(container, id) {
    container.innerHTML = '';
    AdminUtils.setLoading(container, true);

    window.db.collection('enquiries').doc(id).get().then(function(doc) {
      if (!doc.exists) {
        container.innerHTML = '<div class="admin-empty"><p class="admin-empty__text">Enquiry not found</p></div>';
        return;
      }

      var d = doc.data();
      var status = d.status || 'new';

      var html = '<a href="#/enquiries" class="admin-back-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Enquiries</a>' +
        '<div class="admin-detail">' +
          '<div class="admin-detail__header">' +
            '<h2 class="admin-detail__title">' + AdminUtils.escapeHtml(d.name || 'Unknown') + '</h2>' +
            '<span class="admin-badge admin-badge--' + status + '">' + status.charAt(0).toUpperCase() + status.slice(1) + '</span>' +
          '</div>' +
          '<div class="admin-detail__body">' +
            '<div class="admin-detail__field">' +
              '<div class="admin-detail__field-label">Email</div>' +
              '<div class="admin-detail__field-value"><a href="mailto:' + AdminUtils.escapeHtml(d.email || '') + '">' + AdminUtils.escapeHtml(d.email || 'N/A') + '</a></div>' +
            '</div>' +
            (d.phone ? '<div class="admin-detail__field"><div class="admin-detail__field-label">Phone</div><div class="admin-detail__field-value">' + AdminUtils.escapeHtml(d.phone) + '</div></div>' : '') +
            '<div class="admin-detail__field">' +
              '<div class="admin-detail__field-label">Service Interest</div>' +
              '<div class="admin-detail__field-value">' + AdminUtils.escapeHtml(d.service || 'General') + '</div>' +
            '</div>' +
            (d.company ? '<div class="admin-detail__field"><div class="admin-detail__field-label">Company</div><div class="admin-detail__field-value">' + AdminUtils.escapeHtml(d.company) + '</div></div>' : '') +
            '<div class="admin-detail__field">' +
              '<div class="admin-detail__field-label">Date</div>' +
              '<div class="admin-detail__field-value">' + AdminUtils.formatDateTime(d.createdAt) + '</div>' +
            '</div>' +
            '<div class="admin-detail__field">' +
              '<div class="admin-detail__field-label">Message</div>' +
              '<div class="admin-detail__field-value">' + AdminUtils.escapeHtml(d.message || 'No message provided') + '</div>' +
            '</div>' +
            '<div class="admin-detail__status-actions">' +
              '<span style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-right:var(--space-sm);">Change status:</span>' +
              '<button class="btn btn--small ' + (status === 'new' ? 'btn--primary' : 'btn--ghost') + '" data-status="new">New</button>' +
              '<button class="btn btn--small ' + (status === 'read' ? 'btn--primary' : 'btn--ghost') + '" data-status="read">Read</button>' +
              '<button class="btn btn--small ' + (status === 'replied' ? 'btn--primary' : 'btn--ghost') + '" data-status="replied">Replied</button>' +
              '<button class="btn btn--small ' + (status === 'archived' ? 'btn--primary' : 'btn--ghost') + '" data-status="archived">Archived</button>' +
            '</div>' +
            '<div class="admin-detail__notes">' +
              '<h4 class="admin-detail__notes-title">Internal Notes</h4>' +
              '<textarea id="enquiryNotes" class="admin-form__textarea" rows="4" placeholder="Add internal notes...">' + AdminUtils.escapeHtml(d.notes || '') + '</textarea>' +
              '<div style="margin-top:var(--space-md)">' +
                '<button id="saveNotesBtn" class="btn btn--primary btn--small">Save Notes</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      container.innerHTML = html;

      // Status change
      container.querySelectorAll('[data-status]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var newStatus = btn.getAttribute('data-status');
          window.db.collection('enquiries').doc(id).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }).then(function() {
            AdminUtils.showToast('Status updated to ' + newStatus);
            AdminEnquiries.renderDetail(container, id);
            if (window.AdminApp && window.AdminApp.updateEnquiryBadge) {
              window.AdminApp.updateEnquiryBadge();
            }
          }).catch(function(err) {
            AdminUtils.showToast('Error: ' + err.message, 'error');
          });
        });
      });

      // Save notes
      document.getElementById('saveNotesBtn').addEventListener('click', function() {
        var notes = document.getElementById('enquiryNotes').value;
        window.db.collection('enquiries').doc(id).update({
          notes: notes,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
          AdminUtils.showToast('Notes saved');
        }).catch(function(err) {
          AdminUtils.showToast('Error: ' + err.message, 'error');
        });
      });

      // Auto mark as read
      if (status === 'new') {
        window.db.collection('enquiries').doc(id).update({
          status: 'read',
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function() {
          if (window.AdminApp && window.AdminApp.updateEnquiryBadge) {
            window.AdminApp.updateEnquiryBadge();
          }
        });
      }
    }).catch(function(err) {
      container.innerHTML = '<div class="admin-empty"><p class="admin-empty__text">Error: ' + AdminUtils.escapeHtml(err.message) + '</p></div>';
    });
  };

  window.AdminEnquiries = AdminEnquiries;
})();
