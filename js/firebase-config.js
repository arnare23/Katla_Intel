/**
 * Katla Group - Firebase Configuration
 * Shared initialization for Firestore, Auth, and Storage
 */
(function() {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyBIUl_cZ2wPVtaqphCNkE0ckGRgu2XEALc',
    authDomain: 'katlagroupehf.firebaseapp.com',
    projectId: 'katlagroupehf',
    storageBucket: 'katlagroupehf.firebasestorage.app',
    messagingSenderId: '201972647351',
    appId: '1:201972647351:web:b1c797a893899049585432',
    measurementId: 'G-8LHDYCTRMM'
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.firestore();

  if (firebase.storage) {
    window.storage = firebase.storage();
  }

  if (firebase.auth) {
    window.auth = firebase.auth();
  }
})();
