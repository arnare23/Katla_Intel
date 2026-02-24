(function() {
  'use strict';

  var AdminStorage = {};

  AdminStorage.uploadImage = function(file) {
    if (!file) return Promise.reject(new Error('No file provided'));

    var ext = file.name.split('.').pop().toLowerCase();
    var allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (allowed.indexOf(ext) === -1) {
      return Promise.reject(new Error('Invalid image format. Allowed: ' + allowed.join(', ')));
    }

    return KatlaAPI.upload.image(file).then(function(response) {
      return response.url || response.data && response.data.url;
    });
  };

  AdminStorage.uploadPDF = function(file) {
    if (!file) return Promise.reject(new Error('No file provided'));

    var ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf') {
      return Promise.reject(new Error('Only PDF files are allowed'));
    }

    return KatlaAPI.upload.pdf(file).then(function(response) {
      return response.url || response.data && response.data.url;
    });
  };

  AdminStorage.deleteFile = function(url) {
    if (!url) return Promise.resolve();
    try {
      // Extract the key from the URL for the API
      var key = url;
      // If it's a full URL, try to extract the path/key portion
      if (url.indexOf('/') !== -1) {
        var urlParts = url.split('/');
        key = urlParts.slice(-2).join('/');
      }
      return KatlaAPI.upload.delete(key).catch(function() {
        /* file might already be deleted */
      });
    } catch (e) {
      return Promise.resolve();
    }
  };

  window.AdminStorage = AdminStorage;
})();
