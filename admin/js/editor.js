(function() {
  'use strict';

  var AdminEditor = {};
  var quillInstance = null;

  AdminEditor.init = function(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return null;

    container.innerHTML = '';
    var editorDiv = document.createElement('div');
    editorDiv.id = containerId + '-quill';
    container.appendChild(editorDiv);

    quillInstance = new Quill(editorDiv, {
      theme: 'snow',
      placeholder: 'Write your content here...',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ],
          handlers: {
            'image': function() {
              AdminEditor.handleImageUpload();
            }
          }
        }
      }
    });

    return quillInstance;
  };

  AdminEditor.handleImageUpload = function() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = function() {
      var file = input.files[0];
      if (!file) return;

      AdminUtils.showToast('Uploading image...', 'success');
      AdminStorage.uploadImage(file).then(function(url) {
        var range = quillInstance.getSelection(true);
        quillInstance.insertEmbed(range.index, 'image', url);
        quillInstance.setSelection(range.index + 1);
        AdminUtils.showToast('Image uploaded');
      }).catch(function(err) {
        AdminUtils.showToast('Image upload failed: ' + err.message, 'error');
      });
    };
  };

  AdminEditor.getContent = function() {
    if (!quillInstance) return '';
    return quillInstance.root.innerHTML;
  };

  AdminEditor.setContent = function(html) {
    if (!quillInstance) return;
    if (html) {
      quillInstance.root.innerHTML = html;
    } else {
      quillInstance.setText('');
    }
  };

  AdminEditor.destroy = function() {
    quillInstance = null;
  };

  window.AdminEditor = AdminEditor;
})();
