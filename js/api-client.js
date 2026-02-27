/**
 * Katla Intel - API Client
 * Public API layer. Exposes window.KatlaAPI.
 */
(function() {
  'use strict';

  var API_BASE = '/api/v1';

  function request(method, path, body) {
    var headers = { 'Content-Type': 'application/json' };

    var opts = { method: method, headers: headers };
    if (body) {
      opts.body = JSON.stringify(body);
    }

    return fetch(API_BASE + path, opts).then(function(res) {
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
      }
    },

    enquiries: {
      submit: function(data) {
        return request('POST', '/enquiries', data);
      }
    },

    caseStudies: {
      list: function(params) {
        var qs = buildQuery(params);
        return request('GET', '/case-studies' + qs);
      },
      getBySlug: function(slug) {
        return request('GET', '/case-studies/' + encodeURIComponent(slug));
      }
    },

    jobs: {
      list: function() {
        return request('GET', '/jobs');
      }
    },

    research: {
      list: function() {
        return request('GET', '/research');
      },
      getBySlug: function(slug) {
        return request('GET', '/research/' + encodeURIComponent(slug));
      }
    },

    subscribers: {
      subscribe: function(email, source, turnstileToken) {
        var body = { email: email, source: source || 'blog' };
        if (turnstileToken) body['cf-turnstile-response'] = turnstileToken;
        return request('POST', '/subscribers', body);
      }
    }
  };
})();
