(function () {
  "use strict";

  var emptyStateEl = document.querySelector('[data-testid="cart-empty-state"]');
  var contentEl = document.querySelector('[data-testid="cart-content"]');
  var rowsEl = document.querySelector('[data-testid="cart-table"]');
  var itemCountEl = document.querySelector('[data-testid="cart-item-count"]');
  var subtotalEl = document.querySelector('[data-testid="cart-subtotal-amount"]');

  function renderRow(item) {
    var row = document.createElement("div");
    row.className = "cart-row";
    row.setAttribute("data-testid", "cart-row-" + item.productId);

    var image = document.createElement("div");
    image.className = "product-image-placeholder";
    image.style.background = item.imageBg;
    image.textContent = item.emoji;
    row.appendChild(image);

    var name = document.createElement("a");
    name.className = "cart-row-name";
    name.href = "/shop-product?id=" + item.productId;
    name.textContent = item.name;
    row.appendChild(name);

    var unitPrice = document.createElement("div");
    unitPrice.className = "cart-row-unit-price";
    unitPrice.textContent = "$" + item.price.toFixed(2) + " each";
    row.appendChild(unitPrice);

    var stepper = document.createElement("div");
    stepper.className = "qty-stepper";

    var decBtn = document.createElement("button");
    decBtn.type = "button";
    decBtn.className = "btn btn-secondary qty-stepper-btn";
    decBtn.setAttribute("data-testid", "cart-qty-decrement-" + item.productId);
    decBtn.textContent = "-";
    decBtn.disabled = item.quantity <= 1;

    var qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.className = "form-input qty-stepper-input";
    qtyInput.setAttribute("data-testid", "cart-qty-input-" + item.productId);
    qtyInput.min = "1";
    qtyInput.max = "10";
    qtyInput.value = String(item.quantity);

    var incBtn = document.createElement("button");
    incBtn.type = "button";
    incBtn.className = "btn btn-secondary qty-stepper-btn";
    incBtn.setAttribute("data-testid", "cart-qty-increment-" + item.productId);
    incBtn.textContent = "+";
    incBtn.disabled = item.quantity >= 10;

    decBtn.addEventListener("click", function () {
      window.CartStore.updateQuantity(item.productId, item.quantity - 1);
      render();
    });
    incBtn.addEventListener("click", function () {
      window.CartStore.updateQuantity(item.productId, item.quantity + 1);
      render();
    });
    qtyInput.addEventListener("change", function () {
      var parsed = parseInt(qtyInput.value, 10);
      window.CartStore.updateQuantity(item.productId, isNaN(parsed) ? 1 : parsed);
      render();
    });

    stepper.appendChild(decBtn);
    stepper.appendChild(qtyInput);
    stepper.appendChild(incBtn);
    row.appendChild(stepper);

    var lineTotal = document.createElement("div");
    lineTotal.className = "cart-row-line-total";
    lineTotal.setAttribute("data-testid", "cart-line-total-" + item.productId);
    lineTotal.textContent = "$" + (item.price * item.quantity).toFixed(2);
    row.appendChild(lineTotal);

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn btn-danger";
    removeBtn.setAttribute("data-testid", "cart-remove-" + item.productId);
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
      window.CartStore.removeItem(item.productId);
      render();
    });
    row.appendChild(removeBtn);

    return row;
  }

  function render() {
    var cart = window.CartStore.getCart();

    if (cart.length === 0) {
      emptyStateEl.hidden = false;
      contentEl.hidden = true;
      return;
    }

    emptyStateEl.hidden = true;
    contentEl.hidden = false;

    rowsEl.innerHTML = "";
    cart.forEach(function (item) {
      rowsEl.appendChild(renderRow(item));
    });

    var itemCount = window.CartStore.getItemCount(cart);
    var subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);

    itemCountEl.textContent = String(itemCount);
    subtotalEl.textContent = "$" + subtotal.toFixed(2);
  }

  render();
})();
