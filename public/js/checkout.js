(function () {
  "use strict";

  // NOTE: kept in sync by hand with the equivalent constants in server.js
  var TAX_RATE = 0.08;
  var SHIPPING_FLAT_RATE = 5.99;
  var FREE_SHIPPING_THRESHOLD = 75;

  var emptyStateEl = document.querySelector('[data-testid="checkout-empty-cart-state"]');
  var contentEl = document.querySelector('[data-testid="checkout-content"]');
  var form = document.querySelector('[data-testid="checkout-shipping-form"]');
  var formErrorEl = document.querySelector('[data-testid="checkout-form-error"]');
  var placeOrderBtn = document.querySelector('[data-testid="checkout-place-order-button"]');
  var placingIndicatorEl = document.querySelector('[data-testid="checkout-placing-order-indicator"]');

  var reviewItemsEl = document.querySelector('[data-testid="checkout-review-items"]');
  var subtotalEl = document.querySelector('[data-testid="checkout-subtotal"]');
  var taxEstimateEl = document.querySelector('[data-testid="checkout-tax-estimate"]');
  var shippingEstimateEl = document.querySelector('[data-testid="checkout-shipping-estimate"]');
  var totalEstimateEl = document.querySelector('[data-testid="checkout-total-estimate"]');

  var fullNameInput = document.querySelector('[data-testid="checkout-fullname-input"]');
  var address1Input = document.querySelector('[data-testid="checkout-address1-input"]');
  var address2Input = document.querySelector('[data-testid="checkout-address2-input"]');
  var cityInput = document.querySelector('[data-testid="checkout-city-input"]');
  var stateInput = document.querySelector('[data-testid="checkout-state-input"]');
  var postalInput = document.querySelector('[data-testid="checkout-postal-input"]');
  var countrySelect = document.querySelector('[data-testid="checkout-country-select"]');

  var fields = [
    {
      key: "fullName",
      inputEl: fullNameInput,
      errorEl: document.querySelector('[data-testid="checkout-fullname-error"]'),
      isValid: function () {
        return fullNameInput.value.trim().length > 0;
      }
    },
    {
      key: "addressLine1",
      inputEl: address1Input,
      errorEl: document.querySelector('[data-testid="checkout-address1-error"]'),
      isValid: function () {
        return address1Input.value.trim().length > 0;
      }
    },
    {
      key: "city",
      inputEl: cityInput,
      errorEl: document.querySelector('[data-testid="checkout-city-error"]'),
      isValid: function () {
        return cityInput.value.trim().length > 0;
      }
    },
    {
      key: "state",
      inputEl: stateInput,
      errorEl: document.querySelector('[data-testid="checkout-state-error"]'),
      isValid: function () {
        return stateInput.value.trim().length > 0;
      }
    },
    {
      key: "postalCode",
      inputEl: postalInput,
      errorEl: document.querySelector('[data-testid="checkout-postal-error"]'),
      isValid: function () {
        return postalInput.value.trim().length >= 3;
      }
    },
    {
      key: "country",
      inputEl: countrySelect,
      errorEl: document.querySelector('[data-testid="checkout-country-error"]'),
      isValid: function () {
        return countrySelect.value !== "";
      }
    }
  ];

  function clearFieldErrors() {
    fields.forEach(function (field) {
      field.errorEl.hidden = true;
      field.inputEl.setAttribute("aria-invalid", "false");
    });
    formErrorEl.hidden = true;
  }

  function validateClientSide() {
    var hasError = false;
    fields.forEach(function (field) {
      var valid = field.isValid();
      field.inputEl.setAttribute("aria-invalid", String(!valid));
      field.errorEl.hidden = valid;
      if (!valid) hasError = true;
    });
    return !hasError;
  }

  function showServerErrors(errorJson) {
    formErrorEl.textContent = errorJson.message || "Failed to place order.";
    formErrorEl.hidden = false;

    if (Array.isArray(errorJson.missingFields)) {
      fields.forEach(function (field) {
        if (errorJson.missingFields.indexOf(field.key) !== -1) {
          field.errorEl.hidden = false;
          field.inputEl.setAttribute("aria-invalid", "true");
        }
      });
    }
  }

  function computeEstimate(cart) {
    var subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
    var tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    var shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
    var total = Math.round((subtotal + tax + shippingFee) * 100) / 100;
    return { subtotal: subtotal, tax: tax, shippingFee: shippingFee, total: total };
  }

  function renderReview(cart) {
    reviewItemsEl.innerHTML = "";
    cart.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "checkout-review-item";
      row.setAttribute("data-testid", "checkout-review-item-" + item.productId);
      row.textContent = item.quantity + " x " + item.name;

      var price = document.createElement("span");
      price.textContent = "$" + (item.price * item.quantity).toFixed(2);
      row.appendChild(price);

      reviewItemsEl.appendChild(row);
    });

    var estimate = computeEstimate(cart);
    subtotalEl.textContent = "$" + estimate.subtotal.toFixed(2);
    taxEstimateEl.textContent = "$" + estimate.tax.toFixed(2);
    shippingEstimateEl.textContent = estimate.shippingFee === 0 ? "Free" : "$" + estimate.shippingFee.toFixed(2);
    totalEstimateEl.textContent = "$" + estimate.total.toFixed(2);
  }

  var cart = window.CartStore.getCart();

  if (cart.length === 0) {
    emptyStateEl.hidden = false;
    contentEl.hidden = true;
    return;
  }

  emptyStateEl.hidden = true;
  contentEl.hidden = false;
  renderReview(cart);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearFieldErrors();

    if (!validateClientSide()) {
      formErrorEl.textContent = "Please fix the highlighted fields.";
      formErrorEl.hidden = false;
      return;
    }

    var shipping = {
      fullName: fullNameInput.value.trim(),
      addressLine1: address1Input.value.trim(),
      addressLine2: address2Input.value.trim(),
      city: cityInput.value.trim(),
      state: stateInput.value.trim(),
      postalCode: postalInput.value.trim(),
      country: countrySelect.value
    };

    var currentCart = window.CartStore.getCart();
    var items = currentCart.map(function (item) {
      return { productId: item.productId, quantity: item.quantity };
    });

    placeOrderBtn.disabled = true;
    placingIndicatorEl.hidden = false;

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items, shipping: shipping })
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (result) {
        placeOrderBtn.disabled = false;
        placingIndicatorEl.hidden = true;

        if (!result.ok) {
          showServerErrors(result.json);
          return;
        }

        window.sessionStorage.setItem("htl-last-order", JSON.stringify(result.json));
        window.CartStore.clearCart();
        window.location.href = "/order-confirmation";
      })
      .catch(function (err) {
        console.error("Failed to place order", err);
        placeOrderBtn.disabled = false;
        placingIndicatorEl.hidden = true;
        formErrorEl.textContent = "Failed to place order. Please try again.";
        formErrorEl.hidden = false;
      });
  });
})();
