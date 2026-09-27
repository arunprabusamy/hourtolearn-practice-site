(function () {
  "use strict";

  var searchInput = document.querySelector('[data-testid="shop-search-input"]');
  var categorySelect = document.querySelector('[data-testid="shop-category-select"]');
  var sortSelect = document.querySelector('[data-testid="shop-sort-select"]');
  var inStockOnlyCheckbox = document.querySelector('[data-testid="shop-in-stock-only-checkbox"]');
  var loadingEl = document.querySelector('[data-testid="shop-loading"]');
  var emptyStateEl = document.querySelector('[data-testid="shop-empty-state"]');
  var grid = document.querySelector('[data-testid="product-grid"]');
  var toastRegion = document.querySelector('[data-testid="shop-toast-region"]');

  var qtyByProductId = {};
  var searchDebounceTimer = null;
  var toastTimer = null;

  function showToast(message) {
    var existing = document.querySelector('[data-testid="shop-toast-message"]');
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-testid", "shop-toast-message");
    toast.textContent = message;
    toastRegion.appendChild(toast);

    toastTimer = setTimeout(function () {
      toast.remove();
      toastTimer = null;
    }, 3000);
  }

  function renderProduct(product) {
    var qty = qtyByProductId[product.id] || 1;
    var card = document.createElement("div");
    card.className = "product-card";
    card.setAttribute("data-testid", "product-card-" + product.id);
    card.setAttribute("role", "listitem");

    var image = document.createElement("div");
    image.className = "product-image-placeholder";
    image.setAttribute("data-testid", "product-image-" + product.id);
    image.style.background = product.imageBg;
    image.textContent = product.emoji;
    card.appendChild(image);

    var name = document.createElement("a");
    name.className = "product-card-name";
    name.setAttribute("data-testid", "product-name-" + product.id);
    name.href = "/shop-product?id=" + product.id;
    name.textContent = product.name;
    card.appendChild(name);

    var categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.setAttribute("data-testid", "product-category-" + product.id);
    categoryBadge.textContent = product.category;
    card.appendChild(categoryBadge);

    var price = document.createElement("div");
    price.className = "product-card-price";
    price.setAttribute("data-testid", "product-price-" + product.id);
    price.textContent = "$" + product.price.toFixed(2);
    card.appendChild(price);

    var rating = document.createElement("div");
    rating.className = "product-card-rating";
    rating.setAttribute("data-testid", "product-rating-" + product.id);
    rating.textContent = "Rating: " + product.rating.toFixed(1) + " / 5";
    card.appendChild(rating);

    var stockBadge = document.createElement("span");
    stockBadge.className = "badge" + (product.inStock ? "" : " stock-badge-out");
    stockBadge.setAttribute("data-testid", "product-stock-badge-" + product.id);
    stockBadge.textContent = product.inStock ? "In stock" : "Out of stock";
    card.appendChild(stockBadge);

    var footer = document.createElement("div");
    footer.className = "product-card-footer";

    var stepper = document.createElement("div");
    stepper.className = "qty-stepper";

    var decBtn = document.createElement("button");
    decBtn.type = "button";
    decBtn.className = "btn btn-secondary qty-stepper-btn";
    decBtn.setAttribute("data-testid", "product-qty-decrement-" + product.id);
    decBtn.setAttribute("aria-label", "Decrease quantity for " + product.name);
    decBtn.textContent = "-";
    decBtn.disabled = !product.inStock || qty <= 1;

    var qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.className = "form-input qty-stepper-input";
    qtyInput.setAttribute("data-testid", "product-qty-input-" + product.id);
    qtyInput.setAttribute("aria-label", "Quantity for " + product.name);
    qtyInput.min = "1";
    qtyInput.max = "10";
    qtyInput.value = String(qty);
    qtyInput.disabled = !product.inStock;

    var incBtn = document.createElement("button");
    incBtn.type = "button";
    incBtn.className = "btn btn-secondary qty-stepper-btn";
    incBtn.setAttribute("data-testid", "product-qty-increment-" + product.id);
    incBtn.setAttribute("aria-label", "Increase quantity for " + product.name);
    incBtn.textContent = "+";
    incBtn.disabled = !product.inStock || qty >= 10;

    function setQty(newQty) {
      newQty = Math.max(1, Math.min(10, newQty));
      qtyByProductId[product.id] = newQty;
      qtyInput.value = String(newQty);
      decBtn.disabled = !product.inStock || newQty <= 1;
      incBtn.disabled = !product.inStock || newQty >= 10;
    }

    decBtn.addEventListener("click", function () {
      setQty((qtyByProductId[product.id] || 1) - 1);
    });
    incBtn.addEventListener("click", function () {
      setQty((qtyByProductId[product.id] || 1) + 1);
    });
    qtyInput.addEventListener("change", function () {
      var parsed = parseInt(qtyInput.value, 10);
      setQty(isNaN(parsed) ? 1 : parsed);
    });

    stepper.appendChild(decBtn);
    stepper.appendChild(qtyInput);
    stepper.appendChild(incBtn);
    footer.appendChild(stepper);

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn";
    addBtn.setAttribute("data-testid", "product-add-to-cart-" + product.id);
    addBtn.setAttribute("aria-label", product.inStock ? "Add " + product.name + " to cart" : product.name + " is out of stock");
    addBtn.textContent = product.inStock ? "Add to cart" : "Out of stock";
    addBtn.disabled = !product.inStock;
    addBtn.addEventListener("click", function () {
      var addQty = qtyByProductId[product.id] || 1;
      window.CartStore.addItem(product, addQty);
      showToast("Added " + addQty + " x " + product.name + " to cart.");
      setQty(1);
    });
    footer.appendChild(addBtn);

    card.appendChild(footer);
    return card;
  }

  function fetchAndRender() {
    var sortValue = sortSelect.value.split("-");
    var params = new URLSearchParams({
      q: searchInput.value,
      category: categorySelect.value,
      sortBy: sortValue[0],
      sortDir: sortValue[1],
      inStockOnly: inStockOnlyCheckbox.checked ? "true" : "false"
    });

    loadingEl.hidden = false;
    grid.hidden = true;
    emptyStateEl.hidden = true;

    fetch("/api/products?" + params.toString())
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        loadingEl.hidden = true;
        grid.innerHTML = "";

        if (json.data.length === 0) {
          emptyStateEl.hidden = false;
          grid.hidden = true;
          return;
        }

        grid.hidden = false;
        json.data.forEach(function (product) {
          grid.appendChild(renderProduct(product));
        });
      })
      .catch(function (err) {
        console.error("Failed to load products", err);
        loadingEl.hidden = true;
      });
  }

  searchInput.addEventListener("input", function () {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(fetchAndRender, 300);
  });
  categorySelect.addEventListener("change", fetchAndRender);
  sortSelect.addEventListener("change", fetchAndRender);
  inStockOnlyCheckbox.addEventListener("change", fetchAndRender);

  fetchAndRender();
})();
