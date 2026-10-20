(function () {
  "use strict";

  // Progressively enhances any ".combobox" wrapper into an ARIA 1.2 combobox:
  // a text input (role="combobox") paired with a listbox popup, built from
  // markup rather than a native <select> so automation has to drive it like a
  // real custom dropdown — open it, navigate options, commit a selection.

  function createCombobox(root) {
    var input = root.querySelector(".combobox-input");
    var listbox = root.querySelector(".combobox-listbox");
    var options = Array.prototype.slice.call(listbox.querySelectorAll('[role="option"]'));
    var activeIndex = -1;
    var value = root.getAttribute("data-value") || "";

    function labelFor(val) {
      var match = options.filter(function (opt) {
        return opt.getAttribute("data-value") === val;
      })[0];
      return match ? match.textContent : "";
    }

    function visibleOptions() {
      return options.filter(function (opt) {
        return !opt.hidden;
      });
    }

    function filterOptions(query) {
      var q = query.trim().toLowerCase();
      options.forEach(function (opt) {
        opt.hidden = Boolean(q) && opt.textContent.toLowerCase().indexOf(q) === -1;
      });
    }

    function open() {
      listbox.hidden = false;
      input.setAttribute("aria-expanded", "true");
    }

    function close() {
      listbox.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      activeIndex = -1;
      options.forEach(function (opt) {
        opt.classList.remove("is-active");
      });
    }

    function setActive(index) {
      var visible = visibleOptions();
      options.forEach(function (opt) {
        opt.classList.remove("is-active");
      });
      if (index < 0 || index >= visible.length) return;
      activeIndex = index;
      var opt = visible[index];
      opt.classList.add("is-active");
      input.setAttribute("aria-activedescendant", opt.id);
      opt.scrollIntoView({ block: "nearest" });
    }

    function commit(opt) {
      value = opt.getAttribute("data-value");
      input.value = opt.textContent;
      close();
      root.setAttribute("data-value", value);
      root.dispatchEvent(new CustomEvent("combobox:change", { detail: { value: value } }));
    }

    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        commit(opt);
        input.focus();
      });
    });

    input.addEventListener("focus", function () {
      filterOptions("");
      open();
      var currentOptIndex = visibleOptions().findIndex(function (opt) {
        return opt.getAttribute("data-value") === value;
      });
      if (currentOptIndex !== -1) setActive(currentOptIndex);
    });

    input.addEventListener("input", function () {
      filterOptions(input.value);
      open();
      setActive(0);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (listbox.hidden) {
          filterOptions("");
          open();
        }
        setActive(Math.min(activeIndex + 1, visibleOptions().length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (listbox.hidden) {
          filterOptions("");
          open();
        }
        setActive(Math.max(activeIndex - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        var visible = visibleOptions();
        if (activeIndex >= 0 && visible[activeIndex]) {
          commit(visible[activeIndex]);
        }
      } else if (event.key === "Escape") {
        input.value = labelFor(value);
        close();
      } else if (event.key === "Tab") {
        close();
      }
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) close();
    });

    input.value = labelFor(value);

    root.htlCombobox = {
      getValue: function () {
        return value;
      },
      setValue: function (val) {
        value = val;
        input.value = labelFor(val);
        root.setAttribute("data-value", val);
      }
    };
  }

  Array.prototype.forEach.call(document.querySelectorAll(".combobox"), createCombobox);
})();
