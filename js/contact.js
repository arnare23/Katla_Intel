/**
 * Katla Intel - Contact Form + FAQ Accordion
 * Form validation with API submission and accordion behavior
 */
(function() {
  'use strict';

  // --- FORM VALIDATION + API SUBMIT ---
  function initForm() {
    var form = document.querySelector('.form');
    if (!form) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    var submitBtnText = submitBtn ? submitBtn.textContent : KatlaI18n.t('js.sendMessage', 'Send Message');

    var rules = {
      name:    { required: true, minLength: 2, message: function() { return KatlaI18n.t('js.validation.name', 'Please enter your name (at least 2 characters)'); } },
      email:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: function() { return KatlaI18n.t('js.validation.email', 'Please enter a valid email address'); } },
      service: { required: true, message: function() { return KatlaI18n.t('js.validation.service', 'Please select a service'); } },
      message: { required: true, minLength: 10, message: function() { return KatlaI18n.t('js.validation.message', 'Please describe your project (at least 10 characters)'); } }
    };

    function validateField(name, value) {
      var rule = rules[name];
      if (!rule) return '';
      var msg = typeof rule.message === 'function' ? rule.message() : rule.message;
      if (rule.required && (!value || value.trim() === '')) return msg;
      if (rule.minLength && value.trim().length < rule.minLength) return msg;
      if (rule.pattern && !rule.pattern.test(value)) return msg;
      return '';
    }

    function showError(group, message) {
      group.classList.add('form__group--error');
      var errorEl = group.querySelector('.form__error');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(group) {
      group.classList.remove('form__group--error');
      var errorEl = group.querySelector('.form__error');
      if (errorEl) errorEl.textContent = '';
    }

    // Blur validation
    form.querySelectorAll('.form__input, .form__select, .form__textarea').forEach(function(field) {
      field.addEventListener('blur', function() {
        var group = this.closest('.form__group');
        var name = this.getAttribute('name');
        var error = validateField(name, this.value);
        if (error) {
          showError(group, error);
        } else {
          clearError(group);
        }
      });

      // Clear error on input
      field.addEventListener('input', function() {
        var group = this.closest('.form__group');
        if (group.classList.contains('form__group--error')) {
          clearError(group);
        }
      });
    });

    // Submit
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var isValid = true;
      var firstError = null;

      Object.keys(rules).forEach(function(name) {
        var field = form.querySelector('[name="' + name + '"]');
        if (!field) return;
        var error = validateField(name, field.value);
        var group = field.closest('.form__group');
        if (error) {
          showError(group, error);
          if (!firstError) firstError = field;
          isValid = false;
        } else {
          clearError(group);
        }
      });

      if (!isValid) {
        if (firstError) firstError.focus();
        return;
      }

      // Disable button, show loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = KatlaI18n.t('js.sending', 'Sending...');
      }

      // Gather form data
      var data = {
        name: form.querySelector('[name="name"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        company: (form.querySelector('[name="company"]') && form.querySelector('[name="company"]').value.trim()) || '',
        service: form.querySelector('[name="service"]').value,
        message: form.querySelector('[name="message"]').value.trim(),
        'cf-turnstile-response': (form.querySelector('[name="cf-turnstile-response"]') && form.querySelector('[name="cf-turnstile-response"]').value) || ''
      };

      // Submit to API
      KatlaAPI.enquiries.submit(data)
        .then(function() {
          // Success - hide form, show success message
          form.style.display = 'none';
          var successEl = document.querySelector('.form__success');
          if (successEl) successEl.style.display = 'block';
        })
        .catch(function(err) {
          console.error('Error submitting form:', err);
          showFormError(form, submitBtn, submitBtnText);
          if (typeof turnstile !== 'undefined') {
            turnstile.reset();
          }
        });
    });
  }

  function showFormError(form, submitBtn, submitBtnText) {
    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtnText;
    }

    // Show inline error
    var existingError = form.querySelector('.form__submit-error');
    if (!existingError) {
      existingError = document.createElement('div');
      existingError.className = 'form__submit-error';
      existingError.setAttribute('role', 'alert');
      existingError.style.cssText = 'padding:var(--space-md); background-color:#fef2f2; border:1px solid var(--color-error); border-radius:var(--radius-md); color:var(--color-error); font-size:var(--font-size-sm); text-align:center; margin-top:var(--space-md);';
      form.appendChild(existingError);
    }
    existingError.textContent = KatlaI18n.t('js.formError', 'Something went wrong. Please try again or email us directly at hello@katlaintel.is');
    existingError.style.display = 'block';
  }

  // --- FAQ ACCORDION ---
  function initAccordion() {
    document.querySelectorAll('.accordion__trigger').forEach(function(trigger) {
      trigger.addEventListener('click', function() {
        var item = this.closest('.accordion__item');
        var isOpen = item.classList.contains('accordion__item--open');

        // Close all
        document.querySelectorAll('.accordion__item--open').forEach(function(open) {
          open.classList.remove('accordion__item--open');
          open.querySelector('.accordion__trigger').setAttribute('aria-expanded', 'false');
        });

        // Toggle clicked
        if (!isOpen) {
          item.classList.add('accordion__item--open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // skeleton.js loads this script after all sections are already in the DOM,
  // so DOMContentLoaded has already fired — run immediately.
  initForm();
  initAccordion();
})();
