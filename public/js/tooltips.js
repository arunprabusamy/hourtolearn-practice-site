(function () {
  "use strict";

  // --- Click-triggered popover ---
  var clickTrigger = document.getElementById("click-tooltip-trigger");
  var clickText = document.getElementById("click-tooltip-text");

  function openPopover() {
    clickText.hidden = false;
    clickTrigger.setAttribute("aria-expanded", "true");
  }

  function closePopover() {
    clickText.hidden = true;
    clickTrigger.setAttribute("aria-expanded", "false");
  }

  clickTrigger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (clickText.hidden) {
      openPopover();
    } else {
      closePopover();
    }
  });

  document.addEventListener("click", function (e) {
    if (!clickText.hidden && !clickText.contains(e.target) && e.target !== clickTrigger) {
      closePopover();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !clickText.hidden) {
      closePopover();
    }
  });
}());
