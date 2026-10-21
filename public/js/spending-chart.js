(function () {
  "use strict";

  // Canvas has no DOM for what it draws — a bar's pixels aren't inspectable
  // nodes. The caller is expected to also render the same data points into a
  // real HTML table (see store-account.js) so assertions target that data
  // instead of pixels.

  function render(canvas, dataPoints) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var padding = 32;

    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length === 0) {
      ctx.fillStyle = "#667085";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No spending yet", width / 2, height / 2);
      return;
    }

    var maxValue = Math.max.apply(
      null,
      dataPoints.map(function (d) {
        return d.value;
      })
    );
    maxValue = maxValue === 0 ? 1 : maxValue;

    var chartWidth = width - padding * 2;
    var chartHeight = height - padding * 2;
    var barGap = 16;
    var barWidth = (chartWidth - barGap * (dataPoints.length - 1)) / dataPoints.length;

    ctx.strokeStyle = "#e2e5ea";
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    dataPoints.forEach(function (point, index) {
      var barHeight = (point.value / maxValue) * chartHeight;
      var x = padding + index * (barWidth + barGap);
      var y = height - padding - barHeight;

      ctx.fillStyle = "#0d9488";
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#667085";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(point.label, x + barWidth / 2, height - padding + 14);
      ctx.fillText("$" + point.value.toFixed(0), x + barWidth / 2, Math.max(10, y - 6));
    });
  }

  window.SpendingChart = { render: render };
})();
