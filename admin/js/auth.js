(function() {
  'use strict';

  var AdminAuth = {};

  AdminAuth.init = function() {
    var loginView = document.getElementById('loginView');
    var appShell = document.getElementById('appShell');
    var loginForm = document.getElementById('loginForm');
    var loginError = document.getElementById('loginError');

    // Listen to auth state
    KatlaAPI.auth.onAuthChange(function(isLoggedIn) {
      if (isLoggedIn) {
        loginView.hidden = true;
        appShell.hidden = false;
        if (window.AdminApp && window.AdminApp.init) {
          window.AdminApp.init();
        }
      } else {
        loginView.hidden = false;
        appShell.hidden = true;
      }
    });

    // Login form handler
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value.trim();
      var password = document.getElementById('loginPassword').value;
      var btn = document.getElementById('loginBtn');
      var btnText = btn.querySelector('.btn__text');
      var btnLoader = btn.querySelector('.btn__loader');

      if (!email || !password) {
        loginError.textContent = 'Please enter both email and password.';
        loginError.hidden = false;
        return;
      }

      loginError.hidden = true;
      btn.disabled = true;
      btnText.hidden = true;
      btnLoader.hidden = false;

      KatlaAPI.auth.login(email, password)
        .then(function() {
          // onAuthChange will handle the UI switch
        })
        .catch(function(err) {
          var msg = 'Login failed. Please check your credentials.';
          if (err.message) {
            msg = err.message;
          }
          loginError.textContent = msg;
          loginError.hidden = false;
          btn.disabled = false;
          btnText.hidden = false;
          btnLoader.hidden = true;
        });
    });
  };

  AdminAuth.logout = function() {
    KatlaAPI.auth.logout();
  };

  window.AdminAuth = AdminAuth;
})();
