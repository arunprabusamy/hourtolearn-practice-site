(function () {
  "use strict";

  var STORAGE_KEY = "htl-shop-cart";
  var MAX_QTY = 10;

  function getCart() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function getItemCount(cart) {
    return (cart || getCart()).reduce(function (sum, item) {
      return sum + item.quantity;
    }, 0);
  }

  function saveCart(cart) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(
      new CustomEvent("cart:updated", { detail: { count: getItemCount(cart) } })
    );
  }

  function addItem(product, quantity) {
    var cart = getCart();
    var existing = cart.find(function (item) {
      return item.productId === product.id;
    });

    if (existing) {
      existing.quantity = Math.min(MAX_QTY, existing.quantity + quantity);
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        emoji: product.emoji,
        imageBg: product.imageBg,
        quantity: Math.min(MAX_QTY, quantity)
      });
    }

    saveCart(cart);
    return cart;
  }

  function updateQuantity(productId, quantity) {
    var cart = getCart();
    if (quantity <= 0) {
      cart = cart.filter(function (item) {
        return item.productId !== productId;
      });
    } else {
      var existing = cart.find(function (item) {
        return item.productId === productId;
      });
      if (existing) {
        existing.quantity = Math.min(MAX_QTY, quantity);
      }
    }
    saveCart(cart);
    return cart;
  }

  function removeItem(productId) {
    var cart = getCart().filter(function (item) {
      return item.productId !== productId;
    });
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    saveCart([]);
  }

  window.CartStore = {
    MAX_QTY: MAX_QTY,
    getCart: getCart,
    saveCart: saveCart,
    addItem: addItem,
    updateQuantity: updateQuantity,
    removeItem: removeItem,
    clearCart: clearCart,
    getItemCount: getItemCount
  };
})();
