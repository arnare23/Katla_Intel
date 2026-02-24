(function() {
  'use strict';

  var AdminUtils = {};

  AdminUtils.slugify = function(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  AdminUtils.formatDate = function(timestamp) {
    if (!timestamp) return 'N/A';
    var date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  AdminUtils.formatDateTime = function(timestamp) {
    if (!timestamp) return 'N/A';
    var date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'N/A';
    }
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  AdminUtils.truncate = function(text, length) {
    if (!text) return '';
    length = length || 100;
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
  };

  AdminUtils.estimateReadTime = function(html) {
    if (!html) return 1;
    var text = html.replace(/<[^>]*>/g, '');
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.ceil(words / 200);
    return minutes < 1 ? 1 : minutes;
  };

  AdminUtils.escapeHtml = function(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  };

  AdminUtils.showToast = function(message, type) {
    type = type || 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'admin-toast admin-toast--' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
      toast.classList.add('admin-toast--exit');
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  };

  AdminUtils.confirm = function(title, message) {
    return new Promise(function(resolve) {
      var modal = document.getElementById('confirmModal');
      var titleEl = document.getElementById('confirmTitle');
      var messageEl = document.getElementById('confirmMessage');
      var cancelBtn = document.getElementById('confirmCancel');
      var okBtn = document.getElementById('confirmOk');

      titleEl.textContent = title;
      messageEl.textContent = message;
      modal.hidden = false;

      function cleanup() {
        modal.hidden = true;
        cancelBtn.removeEventListener('click', onCancel);
        okBtn.removeEventListener('click', onOk);
        modal.querySelector('.admin-modal__backdrop').removeEventListener('click', onCancel);
      }

      function onCancel() { cleanup(); resolve(false); }
      function onOk() { cleanup(); resolve(true); }

      cancelBtn.addEventListener('click', onCancel);
      okBtn.addEventListener('click', onOk);
      modal.querySelector('.admin-modal__backdrop').addEventListener('click', onCancel);
    });
  };

  AdminUtils.setLoading = function(container, loading) {
    if (loading) {
      container.innerHTML = '<div class="admin-loading"><span class="admin-spinner"></span> Loading...</div>';
    }
  };

  AdminUtils.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  window.AdminUtils = AdminUtils;
})();
