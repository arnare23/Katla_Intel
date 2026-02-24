(function() {
  'use strict';

  var AdminRouter = {};
  var routes = [];
  var currentRoute = null;

  AdminRouter.addRoute = function(pattern, handler) {
    var paramNames = [];
    var regexStr = pattern.replace(/:([a-zA-Z0-9_]+)/g, function(match, name) {
      paramNames.push(name);
      return '([^/]+)';
    });
    routes.push({
      pattern: pattern,
      regex: new RegExp('^' + regexStr + '$'),
      paramNames: paramNames,
      handler: handler
    });
  };

  AdminRouter.navigate = function(hash) {
    window.location.hash = hash;
  };

  AdminRouter.resolve = function() {
    var hash = window.location.hash.replace('#', '') || '/dashboard';
    currentRoute = hash;

    for (var i = 0; i < routes.length; i++) {
      var route = routes[i];
      var match = hash.match(route.regex);
      if (match) {
        var params = {};
        for (var j = 0; j < route.paramNames.length; j++) {
          params[route.paramNames[j]] = decodeURIComponent(match[j + 1]);
        }
        route.handler(params);
        return;
      }
    }

    // fallback to dashboard
    AdminRouter.navigate('/dashboard');
  };

  AdminRouter.getCurrentRoute = function() {
    return currentRoute || '/dashboard';
  };

  AdminRouter.init = function() {
    window.addEventListener('hashchange', function() {
      AdminRouter.resolve();
    });
  };

  AdminRouter.start = function() {
    AdminRouter.resolve();
  };

  window.AdminRouter = AdminRouter;
})();
