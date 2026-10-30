(function () {
  "use strict";

  var statusEl = document.querySelector('[data-testid="live-feed-status"]');
  var listEl = document.querySelector('[data-testid="live-feed-list"]');
  var MAX_ITEMS = 20;
  var itemCount = 0;

  function setStatus(text, status) {
    statusEl.textContent = text;
    statusEl.setAttribute("data-status", status);
  }

  function formatMessage(data) {
    if (data.type === "price-tick") {
      var sign = data.changePercent >= 0 ? "+" : "";
      return data.productName + ": $" + data.price.toFixed(2) + " (" + sign + data.changePercent.toFixed(2) + "%)";
    }
    return data.message;
  }

  function prependItem(data) {
    itemCount += 1;
    var li = document.createElement("li");
    li.setAttribute("data-testid", "live-feed-item-" + itemCount);
    li.textContent = formatMessage(data);
    listEl.insertBefore(li, listEl.firstChild);

    while (listEl.children.length > MAX_ITEMS) {
      listEl.removeChild(listEl.lastChild);
    }
  }

  var protocol = location.protocol === "https:" ? "wss://" : "ws://";
  var socket = new WebSocket(protocol + location.host + "/ws/live-feed");

  setStatus("Connecting...", "connecting");

  socket.addEventListener("open", function () {
    setStatus("Connected", "open");
  });

  socket.addEventListener("close", function () {
    setStatus("Disconnected", "closed");
  });

  socket.addEventListener("error", function () {
    setStatus("Connection error", "error");
  });

  socket.addEventListener("message", function (event) {
    try {
      var data = JSON.parse(event.data);
      prependItem(data);
    } catch (err) {
      // Ignore malformed payloads.
    }
  });
})();
