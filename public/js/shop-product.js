(function () {
  "use strict";

  var notFoundEl = document.querySelector('[data-testid="product-detail-not-found"]');
  var cardEl = document.querySelector('[data-testid="product-detail-card"]');
  var imageEl = document.querySelector('[data-testid="product-detail-image"]');
  var nameEl = document.querySelector('[data-testid="product-detail-name"]');
  var categoryEl = document.querySelector('[data-testid="product-detail-category"]');
  var priceEl = document.querySelector('[data-testid="product-detail-price"]');
  var ratingEl = document.querySelector('[data-testid="product-detail-rating"]');
  var stockBadgeEl = document.querySelector('[data-testid="product-detail-stock-badge"]');
  var descriptionEl = document.querySelector('[data-testid="product-detail-description"]');
  var decBtn = document.querySelector('[data-testid="product-detail-qty-decrement"]');
  var qtyInput = document.querySelector('[data-testid="product-detail-qty-input"]');
  var incBtn = document.querySelector('[data-testid="product-detail-qty-increment"]');
  var addBtn = document.querySelector('[data-testid="product-detail-add-to-cart"]');
  var toastRegion = document.querySelector('[data-testid="product-detail-toast-region"]');

  var currentProduct = null;
  var toastTimer = null;

  function showToast(message) {
    var existing = document.querySelector('[data-testid="product-detail-toast-message"]');
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-testid", "product-detail-toast-message");
    toast.textContent = message;
    toastRegion.appendChild(toast);

    toastTimer = setTimeout(function () {
      toast.remove();
      toastTimer = null;
    }, 3000);
  }

  function setQty(newQty) {
    newQty = Math.max(1, Math.min(10, newQty));
    qtyInput.value = String(newQty);
    decBtn.disabled = !currentProduct.inStock || newQty <= 1;
    incBtn.disabled = !currentProduct.inStock || newQty >= 10;
  }

  function renderProduct(product) {
    currentProduct = product;
    document.title = product.name + " · HourToLearn Practice Site";

    imageEl.style.background = product.imageBg;
    imageEl.textContent = product.emoji;
    nameEl.textContent = product.name;
    categoryEl.textContent = product.category;
    priceEl.textContent = "$" + product.price.toFixed(2);
    ratingEl.textContent = "Rating: " + product.rating.toFixed(1) + " / 5";
    stockBadgeEl.textContent = product.inStock ? "In stock" : "Out of stock";
    stockBadgeEl.className = "badge" + (product.inStock ? "" : " stock-badge-out");
    descriptionEl.textContent = product.description;

    qtyInput.disabled = !product.inStock;
    addBtn.disabled = !product.inStock;
    addBtn.textContent = product.inStock ? "Add to cart" : "Out of stock";
    setQty(1);

    notFoundEl.hidden = true;
    cardEl.hidden = false;
  }

  function showNotFound() {
    notFoundEl.hidden = false;
    cardEl.hidden = true;
  }

  decBtn.addEventListener("click", function () {
    setQty(parseInt(qtyInput.value, 10) - 1);
  });
  incBtn.addEventListener("click", function () {
    setQty(parseInt(qtyInput.value, 10) + 1);
  });
  qtyInput.addEventListener("change", function () {
    var parsed = parseInt(qtyInput.value, 10);
    setQty(isNaN(parsed) ? 1 : parsed);
  });

  addBtn.addEventListener("click", function () {
    var qty = parseInt(qtyInput.value, 10) || 1;
    window.CartStore.addItem(currentProduct, qty);
    showToast("Added " + qty + " x " + currentProduct.name + " to cart.");
    setQty(1);
  });

  var id = new URLSearchParams(window.location.search).get("id");
  var parsedId = parseInt(id, 10);

  if (!id || isNaN(parsedId)) {
    showNotFound();
  } else {
    fetch("/api/products/" + parsedId)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("not found");
        }
        return res.json();
      })
      .then(renderProduct)
      .catch(function () {
        showNotFound();
      });
  }
})();
