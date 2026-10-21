(function () {
  "use strict";

  var missingStateEl = document.querySelector('[data-testid="order-confirmation-missing-state"]');
  var contentEl = document.querySelector('[data-testid="order-confirmation-content"]');
  var orderNumberEl = document.querySelector('[data-testid="order-confirmation-order-number"]');
  var timestampEl = document.querySelector('[data-testid="order-confirmation-timestamp"]');
  var itemsEl = document.querySelector('[data-testid="order-confirmation-items"]');
  var subtotalEl = document.querySelector('[data-testid="order-confirmation-subtotal"]');
  var taxEl = document.querySelector('[data-testid="order-confirmation-tax"]');
  var shippingEl = document.querySelector('[data-testid="order-confirmation-shipping"]');
  var totalEl = document.querySelector('[data-testid="order-confirmation-total"]');
  var addressEl = document.querySelector('[data-testid="order-confirmation-shipping-address"]');

  var raw = window.sessionStorage.getItem("htl-last-order");
  var order = null;

  try {
    order = raw ? JSON.parse(raw) : null;
  } catch (err) {
    order = null;
  }

  if (!order) {
    missingStateEl.hidden = false;
    contentEl.hidden = true;
    return;
  }

  missingStateEl.hidden = true;
  contentEl.hidden = false;

  orderNumberEl.textContent = order.orderNumber;
  timestampEl.textContent = new Date(order.createdAt).toLocaleString();

  itemsEl.innerHTML = "";
  order.items.forEach(function (item) {
    var row = document.createElement("div");
    row.className = "order-confirmation-item";
    row.setAttribute("data-testid", "order-confirmation-item-" + item.productId);
    row.textContent = item.quantity + " x " + item.name;

    var lineTotal = document.createElement("span");
    lineTotal.textContent = "$" + item.lineTotal.toFixed(2);
    row.appendChild(lineTotal);

    itemsEl.appendChild(row);
  });

  subtotalEl.textContent = "$" + order.subtotal.toFixed(2);
  taxEl.textContent = "$" + order.tax.toFixed(2);
  shippingEl.textContent = order.shippingFee === 0 ? "Free" : "$" + order.shippingFee.toFixed(2);
  totalEl.textContent = "$" + order.total.toFixed(2);

  var addr = order.shippingAddress;
  var addressParts = [addr.fullName, addr.addressLine1, addr.addressLine2, addr.city + ", " + addr.state + " " + addr.postalCode, addr.country].filter(Boolean);
  addressEl.textContent = addressParts.join(", ");
})();
