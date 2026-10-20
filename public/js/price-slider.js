(function () {
  "use strict";

  // A non-native slider: value comes from pixel position while dragging, or
  // from Arrow/Home/End keys — there's no underlying <input type="range">.

  function createSlider(root) {
    var min = parseFloat(root.getAttribute("data-min")) || 0;
    var max = parseFloat(root.getAttribute("data-max")) || 100;
    var step = parseFloat(root.getAttribute("data-step")) || 1;
    var value = parseFloat(root.getAttribute("data-value"));
    if (isNaN(value)) value = max;

    var track = root.querySelector(".price-slider-track");
    var fill = root.querySelector(".price-slider-fill");
    var thumb = root.querySelector(".price-slider-thumb");
    var testid = root.getAttribute("data-testid");
    var valueLabel = testid ? document.querySelector('[data-testid="' + testid + '-value"]') : null;

    function render() {
      var pct = ((value - min) / (max - min)) * 100;
      fill.style.width = pct + "%";
      thumb.style.left = pct + "%";
      track.setAttribute("aria-valuenow", String(value));
      if (valueLabel) valueLabel.textContent = "$" + value;
    }

    function setValue(newValue, fire) {
      newValue = Math.round(newValue / step) * step;
      value = Math.max(min, Math.min(max, newValue));
      render();
      if (fire !== false) {
        root.dispatchEvent(new CustomEvent("slider:change", { detail: { value: value } }));
      }
    }

    function valueFromClientX(clientX) {
      var rect = track.getBoundingClientRect();
      var pct = (clientX - rect.left) / rect.width;
      pct = Math.max(0, Math.min(1, pct));
      return min + pct * (max - min);
    }

    var dragging = false;

    function onPointerMove(event) {
      if (!dragging) return;
      setValue(valueFromClientX(event.clientX));
    }

    function onPointerUp() {
      dragging = false;
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
    }

    track.addEventListener("pointerdown", function (event) {
      dragging = true;
      setValue(valueFromClientX(event.clientX));
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    });

    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        setValue(value + step);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        setValue(value - step);
      } else if (event.key === "Home") {
        event.preventDefault();
        setValue(min);
      } else if (event.key === "End") {
        event.preventDefault();
        setValue(max);
      }
    });

    render();

    root.htlSlider = {
      getValue: function () {
        return value;
      },
      setValue: setValue
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll(".price-slider"), createSlider);
})();
