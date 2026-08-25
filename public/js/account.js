(function () {
  const welcomeEl = document.querySelector('[data-testid="account-welcome"]');
  const logoutBtn = document.querySelector('[data-testid="logout-button"]');

  async function loadSession() {
    try {
      const res = await fetch('/api/session');
      const data = await res.json();

      if (!data.loggedIn) {
        window.location.href = '/login';
        return;
      }

      welcomeEl.textContent = `Welcome, ${data.user}!`;
    } catch (err) {
      window.location.href = '/login';
    }
  }

  logoutBtn.addEventListener('click', async () => {
    try {
      await fetch('/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  });

  loadSession();
})();
