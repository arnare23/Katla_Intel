/**
 * Katla Group - API Client
 * Replaces Firebase as the data layer. Exposes window.KatlaAPI.
 */
(function() {
  'use strict';

  var API_BASE = '/api/v1';

  // Helper: get stored token
  function getToken() {
    return localStorage.getItem('katla_admin_token');
  }

  // Helper: make fetch request with proper headers
  function request(method, path, body, isFormData) {
    var headers = {};
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    var opts = { method: method, headers: headers };
    if (body) {
      opts.body = isFormData ? body : JSON.stringify(body);
    }

    return fetch(API_BASE + path, opts).then(function(res) {
      if (res.status === 401) {
        localStorage.removeItem('katla_admin_token');
        window.dispatchEvent(new Event('katla-auth-change'));
      }
      if (!res.ok) {
        return res.json().then(function(err) {
          throw new Error(err.error || 'Request failed');
        });
      }
      if (res.status === 204) return null;
      return res.json();
    });
  }

  function buildQuery(params) {
    if (!params) return '';
    var parts = [];
    Object.keys(params).forEach(function(key) {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
      }
    });
    return parts.length ? '?' + parts.join('&') : '';
  }

  window.KatlaAPI = {
    auth: {
      login: function(email, password) {
        return request('POST', '/auth/login', { email: email, password: password })
          .then(function(data) {
            localStorage.setItem('katla_admin_token', data.token);
            window.dispatchEvent(new Event('katla-auth-change'));
            return data;
          });
      },
      logout: function() {
        localStorage.removeItem('katla_admin_token');
        window.dispatchEvent(new Event('katla-auth-change'));
      },
      isLoggedIn: function() {
        return !!getToken();
      },
      getToken: getToken,
      onAuthChange: function(callback) {
        // Check token on load
        callback(!!getToken());
        // Listen for storage changes (cross-tab)
        window.addEventListener('storage', function(e) {
          if (e.key === 'katla_admin_token') {
            callback(!!e.newValue);
          }
        });
        // Listen for same-tab auth events
        window.addEventListener('katla-auth-change', function() {
          callback(!!getToken());
        });
      }
    },

    posts: {
      list: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/posts' + qs);
      },
      getBySlug: function(slug) {
        return request('GET', '/posts/' + encodeURIComponent(slug));
      },
      related: function(slug) {
        return request('GET', '/posts/' + encodeURIComponent(slug) + '/related');
      },
      // Admin
      adminList: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/admin/posts' + qs);
      },
      get: function(id) {
        return request('GET', '/admin/posts/' + id);
      },
      create: function(data) {
        return request('POST', '/admin/posts', data);
      },
      update: function(id, data) {
        return request('PUT', '/admin/posts/' + id, data);
      },
      delete: function(id) {
        return request('DELETE', '/admin/posts/' + id);
      }
    },

    enquiries: {
      submit: function(data) {
        return request('POST', '/enquiries', data);
      },
      // Admin
      list: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/admin/enquiries' + qs);
      },
      get: function(id) {
        return request('GET', '/admin/enquiries/' + id);
      },
      update: function(id, data) {
        return request('PUT', '/admin/enquiries/' + id, data);
      },
      delete: function(id) {
        return request('DELETE', '/admin/enquiries/' + id);
      }
    },

    caseStudies: {
      list: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/case-studies' + qs);
      },
      getBySlug: function(slug) {
        return request('GET', '/case-studies/' + encodeURIComponent(slug));
      },
      // Admin
      adminList: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/admin/case-studies' + qs);
      },
      get: function(id) {
        return request('GET', '/admin/case-studies/' + id);
      },
      create: function(data) {
        return request('POST', '/admin/case-studies', data);
      },
      update: function(id, data) {
        return request('PUT', '/admin/case-studies/' + id, data);
      },
      delete: function(id) {
        return request('DELETE', '/admin/case-studies/' + id);
      }
    },

    jobs: {
      list: function() {
        return request('GET', '/jobs');
      },
      // Admin
      adminList: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/admin/jobs' + qs);
      },
      get: function(id) {
        return request('GET', '/admin/jobs/' + id);
      },
      create: function(data) {
        return request('POST', '/admin/jobs', data);
      },
      update: function(id, data) {
        return request('PUT', '/admin/jobs/' + id, data);
      },
      delete: function(id) {
        return request('DELETE', '/admin/jobs/' + id);
      }
    },

    research: {
      list: function() {
        return request('GET', '/research');
      },
      getBySlug: function(slug) {
        return request('GET', '/research/' + encodeURIComponent(slug));
      },
      // Admin
      adminList: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/admin/research' + qs);
      },
      get: function(id) {
        return request('GET', '/admin/research/' + id);
      },
      create: function(data) {
        return request('POST', '/admin/research', data);
      },
      update: function(id, data) {
        return request('PUT', '/admin/research/' + id, data);
      },
      delete: function(id) {
        return request('DELETE', '/admin/research/' + id);
      }
    },

    subscribers: {
      subscribe: function(email, source) {
        return request('POST', '/subscribers', { email: email, source: source || 'blog' });
      },
      // Admin
      list: function() {
        return request('GET', '/admin/subscribers');
      },
      delete: function(id) {
        return request('DELETE', '/admin/subscribers/' + id);
      }
    },

    upload: {
      image: function(file) {
        var formData = new FormData();
        formData.append('file', file);
        return request('POST', '/admin/upload/image', formData, true);
      },
      pdf: function(file) {
        var formData = new FormData();
        formData.append('file', file);
        return request('POST', '/admin/upload/pdf', formData, true);
      },
      delete: function(key) {
        return request('DELETE', '/admin/upload', { key: key });
      }
    },

    stats: {
      dashboard: function() {
        return request('GET', '/admin/stats');
      }
    }
  };
})();
