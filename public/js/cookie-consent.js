(function () {
  "use strict";

  var STORAGE_KEY = "htl-cookie-consent";

  if (window.localStorage.getItem(STORAGE_KEY)) return;

  var banner = document.createElement("div");
  banner.className = "cookie-consent-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.setAttribute("data-testid", "cookie-consent-banner");

  var text = document.createElement("p");
  text.className = "cookie-consent-text";
  text.textContent = "This practice store uses cookies to keep you signed in and remember your cart.";
  banner.appendChild(text);

  var actions = document.createElement("div");
  actions.className = "cookie-consent-actions";

  var rejectBtn = document.createElement("button");
  rejectBtn.type = "button";
  rejectBtn.className = "btn btn-secondary";
  rejectBtn.setAttribute("data-testid", "cookie-consent-reject");
  rejectBtn.textContent = "Reject";

  var acceptBtn = document.createElement("button");
  acceptBtn.type = "button";
  acceptBtn.className = "btn";
  acceptBtn.setAttribute("data-testid", "cookie-consent-accept");
  acceptBtn.textContent = "Accept";

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    banner.remove();
  }

  rejectBtn.addEventListener("click", dismiss);
  acceptBtn.addEventListener("click", dismiss);

  actions.appendChild(rejectBtn);
  actions.appendChild(acceptBtn);
  banner.appendChild(actions);

  document.body.appendChild(banner);
})();
