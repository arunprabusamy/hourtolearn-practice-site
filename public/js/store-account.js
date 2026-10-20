(function () {
  "use strict";

  var loginRequiredEl = document.querySelector('[data-testid="store-account-login-required-state"]');
  var contentEl = document.querySelector('[data-testid="store-account-content"]');
  var welcomeEl = document.querySelector('[data-testid="store-account-welcome"]');
  var chartCanvas = document.querySelector('[data-testid="spending-chart"]');
  var chartDataBody = document.querySelector('[data-testid="spending-chart-data-body"]');
  var orderListEl = document.querySelector('[data-testid="order-history-list"]');
  var logoutBtn = document.querySelector('[data-testid="store-account-logout-button"]');
  var toastRegion = document.querySelector('[data-testid="store-account-toast-region"]');

  var toastTimer = null;

  function showToast(message) {
    var existing = document.querySelector('[data-testid="store-account-toast-message"]');
    if (existing) existing.remove();
    if (toastTimer) clearTimeout(toastTimer);

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-testid", "store-account-toast-message");
    toast.textContent = message;
    toastRegion.appendChild(toast);

    toastTimer = setTimeout(function () {
      toast.remove();
      toastTimer = null;
    }, 3000);
  }

  function monthLabel(dateString) {
    var d = new Date(dateString);
    return d.toLocaleString("en-US", { month: "short", year: "2-digit" });
  }

  function buildMonthlySpend(orders) {
    var totals = {};
    orders.forEach(function (order) {
      var label = monthLabel(order.createdAt);
      totals[label] = (totals[label] || 0) + order.total;
    });

    var sortedOrders = orders.slice().sort(function (a, b) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    var seen = {};
    var points = [];
    sortedOrders.forEach(function (order) {
      var label = monthLabel(order.createdAt);
      if (!seen[label]) {
        seen[label] = true;
        points.push({ label: label, value: Math.round(totals[label] * 100) / 100 });
      }
    });
    return points;
  }

  function renderChart(orders) {
    var points = buildMonthlySpend(orders);
    window.SpendingChart.render(chartCanvas, points);

    chartDataBody.innerHTML = "";
    points.forEach(function (point) {
      var tr = document.createElement("tr");
      var monthTd = document.createElement("td");
      monthTd.textContent = point.label;
      var totalTd = document.createElement("td");
      totalTd.textContent = "$" + point.value.toFixed(2);
      tr.appendChild(monthTd);
      tr.appendChild(totalTd);
      chartDataBody.appendChild(tr);
    });
  }

  function renderOrderHistory(orders) {
    orderListEl.innerHTML = "";

    if (orders.length === 0) {
      var empty = document.createElement("p");
      empty.className = "form-hint";
      empty.textContent = "No past orders yet.";
      orderListEl.appendChild(empty);
      return;
    }

    orders.forEach(function (order) {
      var row = document.createElement("div");
      row.className = "order-history-row";
      row.setAttribute("data-testid", "order-history-row-" + order.id);

      var header = document.createElement("div");
      header.className = "order-history-row-header";
      header.textContent = order.orderNumber + " — " + new Date(order.createdAt).toLocaleDateString();
      row.appendChild(header);

      var items = document.createElement("div");
      items.className = "order-history-row-items";
      items.textContent = order.items
        .map(function (item) {
          return item.quantity + " x " + item.name;
        })
        .join(", ");
      row.appendChild(items);

      var total = document.createElement("div");
      total.className = "order-history-row-total";
      total.setAttribute("data-testid", "order-history-total-" + order.id);
      total.textContent = "$" + order.total.toFixed(2);
      row.appendChild(total);

      var reorderBtn = document.createElement("button");
      reorderBtn.type = "button";
      reorderBtn.className = "btn btn-secondary order-history-reorder-btn";
      reorderBtn.setAttribute("data-testid", "order-history-reorder-" + order.id);
      reorderBtn.textContent = "Reorder";
      reorderBtn.addEventListener("click", function () {
        order.items.forEach(function (item) {
          window.CartStore.addItem(
            { id: item.productId, name: item.name, price: item.unitPrice, emoji: "🛍️", imageBg: "#eef2ff" },
            item.quantity
          );
        });
        showToast("Added items from " + order.orderNumber + " to your cart.");
      });
      row.appendChild(reorderBtn);

      orderListEl.appendChild(row);
    });
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

      welcomeEl.textContent = "Signed in as " + session.username + ".";
      contentEl.hidden = false;

      return fetch("/api/orders")
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          var orders = json.data || [];
          renderChart(orders);
          renderOrderHistory(orders);
        });
    })
    .catch(function () {
      loginRequiredEl.hidden = false;
    });

  logoutBtn.addEventListener("click", function () {
    fetch("/api/store/logout", { method: "POST" }).then(function () {
      window.location.href = "/shop";
    });
  });
})();
