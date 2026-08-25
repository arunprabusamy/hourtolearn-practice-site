(function () {
  const form = document.getElementById('login-form');
  const successEl = document.getElementById('login-success-message');
  const errorEl = document.getElementById('login-error-message');

  function hideMessages() {
    successEl.hidden = true;
    errorEl.hidden = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessages();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        successEl.textContent = data.message || 'Login successful';
        successEl.hidden = false;
        setTimeout(() => {
          window.location.href = '/account';
        }, 800);
      } else {
        errorEl.textContent = data.message || 'Login failed';
        errorEl.hidden = false;
      }
    } catch (err) {
      errorEl.textContent = 'Something went wrong. Please try again.';
      errorEl.hidden = false;
    }
  });
})();
