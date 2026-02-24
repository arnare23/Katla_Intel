(function() {
  'use strict';

  var AdminStorage = {};

  AdminStorage.uploadImage = function(file) {
    if (!file) return Promise.reject(new Error('No file provided'));
    if (!window.storage) return Promise.reject(new Error('Firebase Storage not initialized'));

    var ext = file.name.split('.').pop().toLowerCase();
    var allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (allowed.indexOf(ext) === -1) {
      return Promise.reject(new Error('Invalid image format. Allowed: ' + allowed.join(', ')));
    }

    var filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var ref = window.storage.ref('images/' + filename);

    return ref.put(file).then(function(snapshot) {
      return snapshot.ref.getDownloadURL();
    });
  };

  AdminStorage.uploadPDF = function(file) {
    if (!file) return Promise.reject(new Error('No file provided'));
    if (!window.storage) return Promise.reject(new Error('Firebase Storage not initialized'));

    var ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      return Promise.reject(new Error('Only PDF files are allowed'));
    }

    var filename = Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var ref = window.storage.ref('pdfs/' + filename);

    return ref.put(file).then(function(snapshot) {
      return snapshot.ref.getDownloadURL();
    });
  };

  AdminStorage.deleteFile = function(url) {
    if (!url || !window.storage) return Promise.resolve();
    try {
      var ref = window.storage.refFromURL(url);
      return ref.delete().catch(function() {
        /* file might already be deleted */
      });
    } catch (e) {
      return Promise.resolve();
    }
  };

  window.AdminStorage = AdminStorage;
})();
