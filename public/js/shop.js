(function () {
  "use strict";

  var searchInput = document.querySelector('[data-testid="shop-search-input"]');
  var categoryComboboxRoot = document.querySelector('[data-testid="shop-category-combobox"]');
  var sortSelect = document.querySelector('[data-testid="shop-sort-select"]');
  var priceSliderRoot = document.querySelector('[data-testid="shop-price-slider"]');
  var inStockOnlyCheckbox = document.querySelector('[data-testid="shop-in-stock-only-checkbox"]');
  var loadingEl = document.querySelector('[data-testid="shop-loading"]');
  var infiniteLoadingEl = document.querySelector('[data-testid="shop-infinite-loading-indicator"]');
  var endOfResultsEl = document.querySelector('[data-testid="shop-end-of-results"]');
  var emptyStateEl = document.querySelector('[data-testid="shop-empty-state"]');
  var grid = document.querySelector('[data-testid="product-grid"]');
  var sentinel = document.querySelector('[data-testid="shop-load-more-sentinel"]');
  var toastRegion = document.querySelector('[data-testid="shop-toast-region"]');

  var PAGE_SIZE = 8;

  var qtyByProductId = {};
  var searchDebounceTimer = null;
  var toastTimer = null;

  var currentPage = 1;
  var hasMore = true;
  var isLoading = false;

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

  // Shared with context-menu.js so wishlist actions can show a toast too.
  window.htlShowToast = showToast;

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

    var heart = document.createElement("span");
    heart.className = "product-card-wishlist-heart";
    heart.setAttribute("data-testid", "product-wishlist-heart-" + product.id);
    heart.setAttribute("aria-hidden", "true");
    heart.textContent = window.Wishlist.isWishlisted(product.id) ? "♥" : "♡";
    heart.hidden = !window.Wishlist.isWishlisted(product.id);
    card.appendChild(heart);

    var menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "product-card-menu-btn";
    menuBtn.setAttribute("data-testid", "product-menu-button-" + product.id);
    menuBtn.setAttribute("aria-label", "More actions for " + product.name);
    menuBtn.textContent = "⋮";
    card.appendChild(menuBtn);

    window.ContextMenu.attachContextMenu(card, function () {
      return { id: product.id, name: product.name };
    });
    window.ContextMenu.attachMenuButton(menuBtn, function () {
      return { id: product.id, name: product.name };
    });
    window.addEventListener("wishlist:updated", function (event) {
      if (event.detail.productId === product.id) {
        heart.textContent = event.detail.wishlisted ? "♥" : "♡";
        heart.hidden = !event.detail.wishlisted;
      }
    });

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

  function buildParams(page) {
    var sortValue = sortSelect.value.split("-");
    return new URLSearchParams({
      q: searchInput.value,
      category: categoryComboboxRoot.htlCombobox.getValue(),
      sortBy: sortValue[0],
      sortDir: sortValue[1],
      inStockOnly: inStockOnlyCheckbox.checked ? "true" : "false",
      maxPrice: String(priceSliderRoot.htlSlider.getValue()),
      page: String(page),
      pageSize: String(PAGE_SIZE)
    });
  }

  function loadPage(reset) {
    if (isLoading) return;
    if (reset) {
      currentPage = 1;
      hasMore = true;
      grid.innerHTML = "";
    }
    if (!hasMore) return;

    isLoading = true;
    if (reset) {
      loadingEl.hidden = false;
      grid.hidden = true;
      emptyStateEl.hidden = true;
      endOfResultsEl.hidden = true;
    } else {
      infiniteLoadingEl.hidden = false;
    }

    fetch("/api/products?" + buildParams(currentPage).toString())
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        isLoading = false;
        loadingEl.hidden = true;
        infiniteLoadingEl.hidden = true;

        if (reset && json.data.length === 0) {
          emptyStateEl.hidden = false;
          grid.hidden = true;
          hasMore = false;
          return;
        }

        grid.hidden = false;
        json.data.forEach(function (product) {
          grid.appendChild(renderProduct(product));
        });

        var loadedSoFar = currentPage * PAGE_SIZE;
        if (json.data.length < PAGE_SIZE || loadedSoFar >= json.total) {
          hasMore = false;
          endOfResultsEl.hidden = false;
        } else {
          currentPage += 1;
        }

        // The IntersectionObserver callback only fires on a change in intersection
        // state. If the sentinel was already on-screen before this page loaded and
        // the newly appended content doesn't push it out of view (e.g. a tall
        // viewport with few results), nothing would re-trigger the next load. Check
        // directly and keep loading until the sentinel actually leaves the viewport.
        if (hasMore) {
          var rect = sentinel.getBoundingClientRect();
          var stillVisible = rect.top < window.innerHeight && rect.bottom > 0;
          if (stillVisible) loadPage(false);
        }
      })
      .catch(function (err) {
        console.error("Failed to load products", err);
        isLoading = false;
        loadingEl.hidden = true;
        infiniteLoadingEl.hidden = true;
      });
  }

  searchInput.addEventListener("input", function () {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function () {
      loadPage(true);
    }, 300);
  });
  categoryComboboxRoot.addEventListener("combobox:change", function () {
    loadPage(true);
  });
  sortSelect.addEventListener("change", function () {
    loadPage(true);
  });
  priceSliderRoot.addEventListener("slider:change", function () {
    loadPage(true);
  });
  inStockOnlyCheckbox.addEventListener("change", function () {
    loadPage(true);
  });

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      loadPage(false);
    }
  });
  observer.observe(sentinel);

  loadPage(true);
})();
