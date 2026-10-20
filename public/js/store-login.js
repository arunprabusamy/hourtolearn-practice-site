(function () {
  "use strict";

  var form = document.querySelector('[data-testid="store-login-form"]');
  var errorEl = document.querySelector('[data-testid="store-login-error-message"]');
  var loadingEl = document.querySelector('[data-testid="store-login-loading-indicator"]');
  var usernameInput = document.querySelector('[data-testid="store-login-username"]');
  var passwordInput = document.querySelector('[data-testid="store-login-password"]');
  var submitBtn = document.querySelector('[data-testid="store-login-submit"]');

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    loadingEl.hidden = false;

    fetch("/api/store/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameInput.value.trim(), password: passwordInput.value })
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (result) {
        submitBtn.disabled = false;
        loadingEl.hidden = true;

        if (!result.ok) {
          errorEl.textContent = result.json.message || "Sign in failed.";
          errorEl.hidden = false;
          return;
        }

        var next = new URLSearchParams(window.location.search).get("next") || "/shop";
        window.location.href = next;
      })
      .catch(function () {
        submitBtn.disabled = false;
        loadingEl.hidden = true;
        errorEl.textContent = "Something went wrong. Please try again.";
        errorEl.hidden = false;
      });
  });
})();
