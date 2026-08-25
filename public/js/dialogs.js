(function () {
  "use strict";

  // --- Custom modal dialog ---
  var openDialogBtn = document.getElementById("open-dialog-btn");
  var overlay = document.getElementById("custom-dialog-overlay");
  var confirmBtn = document.getElementById("dialog-confirm");
  var cancelBtn = document.getElementById("dialog-cancel");
  var dialogResultEl = document.querySelector('[data-testid="dialog-result"]');
  var lastTrigger = null;

  function openDialog() {
    lastTrigger = document.activeElement;
    overlay.hidden = false;
    confirmBtn.focus();
  }

  function closeDialog(action) {
    overlay.hidden = true;
    dialogResultEl.textContent = "Last action: " + action;
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus();
    }
  }

  openDialogBtn.addEventListener("click", openDialog);
  confirmBtn.addEventListener("click", function () {
    closeDialog("confirmed");
  });
  cancelBtn.addEventListener("click", function () {
    closeDialog("cancelled");
  });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) {
      closeDialog("cancelled");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) {
      closeDialog("cancelled");
    }
  });

  // --- Native browser dialogs ---
  var nativeAlertBtn = document.getElementById("native-alert-btn");
  var nativeConfirmBtn = document.getElementById("native-confirm-btn");
  var nativePromptBtn = document.getElementById("native-prompt-btn");
  var nativeResultEl = document.querySelector('[data-testid="native-dialog-result"]');

  nativeAlertBtn.addEventListener("click", function () {
    window.alert("This is a native alert dialog.");
    nativeResultEl.textContent = "alert() acknowledged";
  });

  nativeConfirmBtn.addEventListener("click", function () {
    var result = window.confirm("Do you want to proceed?");
    nativeResultEl.textContent = "confirm() returned: " + result;
  });

  nativePromptBtn.addEventListener("click", function () {
    var result = window.prompt("What is your favorite testing tool?", "Playwright");
    nativeResultEl.textContent = "prompt() returned: " + (result === null ? "null" : JSON.stringify(result));
  });

  // --- Auto-dismissing toast ---
  var showToastBtn = document.getElementById("show-toast-btn");
  var toastRegion = document.getElementById("toast-region");
  var toastTimer = null;

  showToastBtn.addEventListener("click", function () {
    var existing = document.querySelector('[data-testid="toast-message"]');
    if (existing) {
      existing.remove();
    }
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    toast.setAttribute("data-testid", "toast-message");
    toast.textContent = "Saved successfully.";
    toastRegion.appendChild(toast);

    toastTimer = setTimeout(function () {
      toast.remove();
      toastTimer = null;
    }, 3000);
  });
}());
