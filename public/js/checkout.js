(function () {
  "use strict";

  // NOTE: kept in sync by hand with the equivalent constants in server.js
  var TAX_RATE = 0.08;
  var SHIPPING_FLAT_RATE = 5.99;
  var FREE_SHIPPING_THRESHOLD = 75;

  var PROGRESS_KEY = "htl-checkout-progress";
  var MAX_PAYMENT_RETRIES = 3;
  var RETRY_DELAY_MS = 1200;

  var emptyStateEl = document.querySelector('[data-testid="checkout-empty-cart-state"]');
  var loginRequiredEl = document.querySelector('[data-testid="checkout-login-required-state"]');

  var stepShippingEl = document.querySelector('[data-testid="checkout-step-shipping"]');
  var stepVerifyEl = document.querySelector('[data-testid="checkout-step-verify"]');
  var stepPaymentEl = document.querySelector('[data-testid="checkout-step-payment"]');

  var wizardStepShipping = document.querySelector('[data-testid="checkout-wizard-step-shipping"]');
  var wizardStepVerify = document.querySelector('[data-testid="checkout-wizard-step-verify"]');
  var wizardStepPayment = document.querySelector('[data-testid="checkout-wizard-step-payment"]');

  // --- Step 1: shipping ---
  var form = document.querySelector('[data-testid="checkout-shipping-form"]');
  var formErrorEl = document.querySelector('[data-testid="checkout-form-error"]');

  var fullNameInput = document.querySelector('[data-testid="checkout-fullname-input"]');
  var address1Input = document.querySelector('[data-testid="checkout-address1-input"]');
  var address2Input = document.querySelector('[data-testid="checkout-address2-input"]');
  var cityInput = document.querySelector('[data-testid="checkout-city-input"]');
  var stateInput = document.querySelector('[data-testid="checkout-state-input"]');
  var postalInput = document.querySelector('[data-testid="checkout-postal-input"]');
  var countryComboboxRoot = document.querySelector('[data-testid="checkout-country-combobox"]');
  var countryInput = document.querySelector('[data-testid="checkout-country-input"]');

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
      inputEl: countryInput,
      errorEl: document.querySelector('[data-testid="checkout-country-error"]'),
      isValid: function () {
        return countryComboboxRoot.htlCombobox.getValue() !== "";
      }
    }
  ];

  // --- Step 2: verify ---
  var otpErrorEl = document.querySelector('[data-testid="checkout-otp-error"]');
  var otpSandboxHintEl = document.querySelector('[data-testid="otp-sandbox-hint"]');
  var otpSandboxCodeEl = document.querySelector('[data-testid="otp-sandbox-code"]');
  var sendOtpBtn = document.querySelector('[data-testid="checkout-send-otp-button"]');
  var otpForm = document.querySelector('[data-testid="checkout-otp-form"]');
  var otpInput = document.querySelector('[data-testid="checkout-otp-input"]');
  var resendOtpBtn = document.querySelector('[data-testid="checkout-resend-otp-button"]');
  var backToShippingBtn = document.querySelector('[data-testid="checkout-back-to-shipping-button"]');

  // --- Step 3: payment & review ---
  var reviewItemsEl = document.querySelector('[data-testid="checkout-review-items"]');
  var subtotalEl = document.querySelector('[data-testid="checkout-subtotal"]');
  var taxEstimateEl = document.querySelector('[data-testid="checkout-tax-estimate"]');
  var shippingEstimateEl = document.querySelector('[data-testid="checkout-shipping-estimate"]');
  var totalEstimateEl = document.querySelector('[data-testid="checkout-total-estimate"]');
  var paymentFrame = document.querySelector('[data-testid="payment-widget-frame"]');
  var paymentErrorEl = document.querySelector('[data-testid="checkout-payment-error"]');
  var paymentRetryingEl = document.querySelector('[data-testid="checkout-payment-retrying-indicator"]');
  var paymentConfirmedEl = document.querySelector('[data-testid="checkout-payment-confirmed-message"]');
  var backToVerifyBtn = document.querySelector('[data-testid="checkout-back-to-verify-button"]');
  var placeOrderBtn = document.querySelector('[data-testid="checkout-place-order-button"]');
  var placingIndicatorEl = document.querySelector('[data-testid="checkout-placing-order-indicator"]');
  var orderErrorEl = document.querySelector('[data-testid="checkout-order-error"]');

  var paymentConfirmed = false;

  function loadProgress() {
    try {
      var raw = window.sessionStorage.getItem(PROGRESS_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : { step: "shipping", shipping: {} };
    } catch (err) {
      return { step: "shipping", shipping: {} };
    }
  }

  var progress = loadProgress();

  function saveProgress() {
    window.sessionStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  function showStep(step) {
    progress.step = step;
    saveProgress();

    stepShippingEl.hidden = step !== "shipping";
    stepVerifyEl.hidden = step !== "verify";
    stepPaymentEl.hidden = step !== "payment";

    [wizardStepShipping, wizardStepVerify, wizardStepPayment].forEach(function (el) {
      el.classList.remove("is-current", "is-complete");
    });
    if (step === "shipping") {
      wizardStepShipping.classList.add("is-current");
    } else if (step === "verify") {
      wizardStepShipping.classList.add("is-complete");
      wizardStepVerify.classList.add("is-current");
    } else {
      wizardStepShipping.classList.add("is-complete");
      wizardStepVerify.classList.add("is-complete");
      wizardStepPayment.classList.add("is-current");
    }
  }

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

  function populateShippingForm(shipping) {
    shipping = shipping || {};
    fullNameInput.value = shipping.fullName || "";
    address1Input.value = shipping.addressLine1 || "";
    address2Input.value = shipping.addressLine2 || "";
    cityInput.value = shipping.city || "";
    stateInput.value = shipping.state || "";
    postalInput.value = shipping.postalCode || "";
    if (shipping.country) {
      countryComboboxRoot.htlCombobox.setValue(shipping.country);
    }
  }

  var cart = window.CartStore.getCart();

  if (cart.length === 0) {
    emptyStateEl.hidden = false;
    return;
  }

  fetch("/api/store/session")
    .then(function (res) {
      return res.json();
    })
    .then(function (session) {
      if (!session.loggedIn) {
        loginRequiredEl.hidden = false;
        return;
      }
      init();
    })
    .catch(function () {
      loginRequiredEl.hidden = false;
    });

  function init() {
    populateShippingForm(progress.shipping);
    renderReview(cart);
    showStep(progress.step || "shipping");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearFieldErrors();

      if (!validateClientSide()) {
        formErrorEl.textContent = "Please fix the highlighted fields.";
        formErrorEl.hidden = false;
        return;
      }

      progress.shipping = {
        fullName: fullNameInput.value.trim(),
        addressLine1: address1Input.value.trim(),
        addressLine2: address2Input.value.trim(),
        city: cityInput.value.trim(),
        state: stateInput.value.trim(),
        postalCode: postalInput.value.trim(),
        country: countryComboboxRoot.htlCombobox.getValue()
      };
      showStep("verify");
    });

    backToShippingBtn.addEventListener("click", function () {
      showStep("shipping");
    });

    sendOtpBtn.addEventListener("click", sendOtp);
    resendOtpBtn.addEventListener("click", sendOtp);

    otpForm.addEventListener("submit", function (event) {
      event.preventDefault();
      otpErrorEl.hidden = true;

      fetch("/api/checkout/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: otpInput.value.trim() })
      })
        .then(function (res) {
          return res.json().then(function (json) {
            return { ok: res.ok, json: json };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            otpErrorEl.textContent = result.json.message || "Incorrect code.";
            otpErrorEl.hidden = false;
            return;
          }
          otpInput.value = "";
          resetPaymentStep();
          showStep("payment");
        })
        .catch(function () {
          otpErrorEl.textContent = "Something went wrong. Please try again.";
          otpErrorEl.hidden = false;
        });
    });

    backToVerifyBtn.addEventListener("click", function () {
      showStep("verify");
    });

    window.addEventListener("message", function (event) {
      if (!paymentFrame.contentWindow || event.source !== paymentFrame.contentWindow) return;
      if (!event.data || event.data.type !== "payment-widget:card-submitted") return;
      chargeCard(event.data.cardNumber, 1);
    });

    placeOrderBtn.addEventListener("click", placeOrder);
  }

  function sendOtp() {
    otpErrorEl.hidden = true;
    fetch("/api/checkout/send-otp", { method: "POST" })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          otpErrorEl.textContent = result.json.message || "Could not send a code. Please sign in again.";
          otpErrorEl.hidden = false;
          return;
        }
        otpSandboxCodeEl.textContent = result.json.code;
        otpSandboxHintEl.hidden = false;
        otpForm.hidden = false;
        otpInput.focus();
      })
      .catch(function () {
        otpErrorEl.textContent = "Something went wrong. Please try again.";
        otpErrorEl.hidden = false;
      });
  }

  function resetPaymentStep() {
    paymentConfirmed = false;
    placeOrderBtn.disabled = true;
    paymentErrorEl.hidden = true;
    paymentConfirmedEl.hidden = true;
    paymentRetryingEl.hidden = true;
    orderErrorEl.hidden = true;
    if (paymentFrame.contentWindow) {
      paymentFrame.contentWindow.postMessage({ type: "payment-widget:reset" }, "*");
    }
  }

  function chargeCard(cardNumber, attemptNumber) {
    paymentErrorEl.hidden = true;
    paymentConfirmedEl.hidden = true;
    paymentRetryingEl.hidden = false;
    paymentRetryingEl.textContent = attemptNumber === 1 ? "Processing payment..." : "Payment processor busy — retrying (attempt " + attemptNumber + " of " + MAX_PAYMENT_RETRIES + ")...";

    fetch("/api/payment/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardNumber: cardNumber })
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { status: res.status, json: json };
        });
      })
      .then(function (result) {
        if (result.status === 200) {
          paymentRetryingEl.hidden = true;
          paymentConfirmedEl.hidden = false;
          paymentConfirmed = true;
          placeOrderBtn.disabled = false;
          return;
        }

        if (result.status === 503 && attemptNumber < MAX_PAYMENT_RETRIES) {
          setTimeout(function () {
            chargeCard(cardNumber, attemptNumber + 1);
          }, RETRY_DELAY_MS);
          return;
        }

        if (result.status === 401) {
          window.location.href = "/store-login?next=/checkout";
          return;
        }

        paymentRetryingEl.hidden = true;
        paymentErrorEl.textContent = result.json.message || "Payment failed. Please try again.";
        paymentErrorEl.hidden = false;
        if (paymentFrame.contentWindow) {
          paymentFrame.contentWindow.postMessage({ type: "payment-widget:reset" }, "*");
        }
      })
      .catch(function () {
        paymentRetryingEl.hidden = true;
        paymentErrorEl.textContent = "Something went wrong talking to the payment processor.";
        paymentErrorEl.hidden = false;
      });
  }

  function placeOrder() {
    if (!paymentConfirmed) return;
    orderErrorEl.hidden = true;

    var currentCart = window.CartStore.getCart();
    var items = currentCart.map(function (item) {
      return { productId: item.productId, quantity: item.quantity };
    });

    placeOrderBtn.disabled = true;
    placingIndicatorEl.hidden = false;

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items, shipping: progress.shipping })
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (result) {
        placingIndicatorEl.hidden = true;

        if (!result.ok) {
          placeOrderBtn.disabled = false;
          orderErrorEl.textContent = result.json.message || "Failed to place order.";
          orderErrorEl.hidden = false;
          return;
        }

        window.sessionStorage.removeItem(PROGRESS_KEY);
        window.sessionStorage.setItem("htl-last-order", JSON.stringify(result.json));
        window.CartStore.clearCart();
        window.location.href = "/order-confirmation";
      })
      .catch(function () {
        placeOrderBtn.disabled = false;
        placingIndicatorEl.hidden = true;
        orderErrorEl.textContent = "Failed to place order. Please try again.";
        orderErrorEl.hidden = false;
      });
  }
})();
