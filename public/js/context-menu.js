(function () {
  "use strict";

  var WISHLIST_KEY = "htl-shop-wishlist";

  function getWishlist() {
    try {
      var raw = window.localStorage.getItem(WISHLIST_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveWishlist(list) {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  }

  function isWishlisted(productId) {
    return getWishlist().indexOf(productId) !== -1;
  }

  function toggleWishlist(productId) {
    var list = getWishlist();
    var idx = list.indexOf(productId);
    if (idx === -1) {
      list.push(productId);
    } else {
      list.splice(idx, 1);
    }
    saveWishlist(list);
    return idx === -1; // true if the product is now wishlisted
  }

  window.Wishlist = {
    isWishlisted: isWishlisted,
    toggle: toggleWishlist
  };

  var activeMenu = null;

  function closeMenu() {
    if (activeMenu) {
      activeMenu.remove();
      activeMenu = null;
    }
  }

  // Reachable by right-click (contextmenu event) and by a visible "⋮" button,
  // so keyboard/touch users have a way in too — not mouse-only.
  function openMenu(x, y, productId, productName, returnFocusTo) {
    closeMenu();

    var menu = document.createElement("div");
    menu.className = "context-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("data-testid", "product-context-menu-" + productId);
    menu.style.left = x + "px";
    menu.style.top = y + "px";

    var wishlisted = isWishlisted(productId);
    var item = document.createElement("button");
    item.type = "button";
    item.className = "context-menu-item";
    item.setAttribute("role", "menuitem");
    item.setAttribute("data-testid", "context-menu-wishlist-" + productId);
    item.textContent = wishlisted ? "Remove from wishlist" : "Add to wishlist";

    item.addEventListener("click", function () {
      var nowWishlisted = toggleWishlist(productId);
      closeMenu();
      if (returnFocusTo) returnFocusTo.focus();
      window.dispatchEvent(
        new CustomEvent("wishlist:updated", { detail: { productId: productId, wishlisted: nowWishlisted } })
      );
      if (typeof window.htlShowToast === "function") {
        window.htlShowToast(nowWishlisted ? "Added " + productName + " to wishlist." : "Removed " + productName + " from wishlist.");
      }
    });

    menu.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        if (returnFocusTo) returnFocusTo.focus();
      }
    });

    menu.appendChild(item);
    document.body.appendChild(menu);

    var menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = Math.max(4, window.innerWidth - menuRect.width - 4) + "px";
    }
    if (menuRect.bottom > window.innerHeight) {
      menu.style.top = Math.max(4, window.innerHeight - menuRect.height - 4) + "px";
    }

    activeMenu = menu;
    item.focus();
  }

  document.addEventListener("click", function (event) {
    if (activeMenu && !activeMenu.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  function attachContextMenu(target, getProductMeta) {
    target.addEventListener("contextmenu", function (event) {
      event.preventDefault();
      var meta = getProductMeta();
      openMenu(event.clientX, event.clientY, meta.id, meta.name, target);
    });
  }

  function attachMenuButton(button, getProductMeta) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      var rect = button.getBoundingClientRect();
      var meta = getProductMeta();
      openMenu(rect.left, rect.bottom + 4, meta.id, meta.name, button);
    });
  }

  window.ContextMenu = {
    attachContextMenu: attachContextMenu,
    attachMenuButton: attachMenuButton
  };
})();
