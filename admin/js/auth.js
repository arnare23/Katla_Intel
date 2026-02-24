(function() {
  'use strict';

  var AdminAuth = {};

  AdminAuth.init = function() {
    var loginView = document.getElementById('loginView');
    var appShell = document.getElementById('appShell');
    var loginForm = document.getElementById('loginForm');
    var loginError = document.getElementById('loginError');

    if (!window.auth) {
      loginError.textContent = 'Firebase Auth not initialized';
      loginError.hidden = false;
      return;
    }

    // Listen to auth state
    window.auth.onAuthStateChanged(function(user) {
      if (user) {
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

      window.auth.signInWithEmailAndPassword(email, password)
        .then(function() {
          // onAuthStateChanged will handle the UI switch
        })
        .catch(function(err) {
          var msg = 'Login failed. Please check your credentials.';
          if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            msg = 'Invalid email or password.';
          } else if (err.code === 'auth/too-many-requests') {
            msg = 'Too many failed attempts. Please try again later.';
          } else if (err.code === 'auth/invalid-email') {
            msg = 'Please enter a valid email address.';
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
    if (window.auth) {
      window.auth.signOut();
    }
  };

  window.AdminAuth = AdminAuth;
})();
