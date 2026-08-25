(function () {
  const form = document.getElementById('support-form');
  const successMessage = document.getElementById('form-success-message');
  const errorMessage = document.getElementById('form-error-message');

  const fullNameInput = document.getElementById('full-name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const topicSelect = document.getElementById('topic');
  const messageTextarea = document.getElementById('message');

  const fields = [
    {
      errorEl: document.getElementById('full-name-error'),
      isValid: () => fullNameInput.value.trim().length > 0,
    },
    {
      errorEl: document.getElementById('email-error'),
      isValid: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim()),
    },
    {
      errorEl: document.getElementById('password-error'),
      isValid: () => passwordInput.value.length >= 8,
    },
    {
      errorEl: document.getElementById('topic-error'),
      isValid: () => topicSelect.value !== '',
    },
    {
      errorEl: document.getElementById('message-error'),
      isValid: () => messageTextarea.value.trim().length > 0,
    },
    {
      errorEl: document.getElementById('urgency-error'),
      isValid: () => form.querySelector('input[name="urgency"]:checked') !== null,
    },
  ];

  function hideBanners() {
    successMessage.hidden = true;
    errorMessage.hidden = true;
  }

  function clearFieldErrors() {
    fields.forEach((field) => {
      field.errorEl.hidden = true;
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideBanners();
    clearFieldErrors();

    let firstInvalid = null;
    let hasError = false;

    fields.forEach((field) => {
      if (!field.isValid()) {
        field.errorEl.hidden = false;
        hasError = true;
        if (!firstInvalid) firstInvalid = field.errorEl;
      }
    });

    if (hasError) {
      errorMessage.textContent = 'Please fix the highlighted fields and try again.';
      errorMessage.hidden = false;
      return;
    }

    successMessage.hidden = false;
  });

  form.addEventListener('reset', function () {
    hideBanners();
    clearFieldErrors();
  });
})();
