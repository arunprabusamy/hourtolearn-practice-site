(function () {
  "use strict";

  function renderBadge(navCartLink) {
    var badge = navCartLink.querySelector('[data-testid="cart-count-badge"]');
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "badge";
      badge.setAttribute("data-testid", "cart-count-badge");
      navCartLink.appendChild(badge);
    }
    var count = window.CartStore.getItemCount();
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }

  function attach(navCartLink) {
    renderBadge(navCartLink);
    window.addEventListener("cart:updated", function () {
      renderBadge(navCartLink);
    });
    window.addEventListener("storage", function (event) {
      if (event.key === "htl-shop-cart") {
        renderBadge(navCartLink);
      }
    });
  }

  var storeNavContainer = document.getElementById("store-nav-container");
  if (!storeNavContainer) return;

  var existing = storeNavContainer.querySelector('[data-testid="nav-cart"]');
  if (existing) {
    attach(existing);
    return;
  }

  var observer = new MutationObserver(function () {
    var navCartLink = storeNavContainer.querySelector('[data-testid="nav-cart"]');
    if (navCartLink) {
      observer.disconnect();
      attach(navCartLink);
    }
  });

  observer.observe(storeNavContainer, { childList: true, subtree: true });
})();
