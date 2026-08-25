(function () {
  "use strict";

  var today = new Date();
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth(); // 0-based

  // In-memory event store: { "YYYY-MM-DD": [{ id, text }] }
  var eventsByDate = {};
  var nextEventId = 1;
  var selectedDate = null; // ISO date string currently showing the add-event form

  var monthLabelEl = document.querySelector('[data-testid="calendar-month-label"]');
  var gridEl = document.querySelector('[data-testid="calendar-grid"]');
  var prevBtn = document.querySelector('[data-testid="calendar-prev-month"]');
  var nextBtn = document.querySelector('[data-testid="calendar-next-month"]');

  var monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function toISODate(year, month, day) {
    return year + "-" + pad2(month + 1) + "-" + pad2(day);
  }

  function isSameDate(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function renderCalendar() {
    monthLabelEl.textContent = monthNames[viewMonth] + " " + viewYear;
    gridEl.innerHTML = "";

    var firstOfMonth = new Date(viewYear, viewMonth, 1);
    var startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    var daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    var totalCells = 42; // 6 rows x 7 cols, keeps grid stable
    var cellDate = new Date(viewYear, viewMonth, 1 - startWeekday);

    for (var i = 0; i < totalCells; i++) {
      var year = cellDate.getFullYear();
      var month = cellDate.getMonth();
      var day = cellDate.getDate();
      var isoDate = toISODate(year, month, day);
      var isOutside = month !== viewMonth;

      var dayCell = document.createElement("div");
      dayCell.className = "calendar-day" + (isOutside ? " calendar-day-outside" : "");
      if (isSameDate(cellDate, today)) {
        dayCell.classList.add("calendar-day-today");
      }
      if (isoDate === selectedDate) {
        dayCell.classList.add("calendar-day-selected");
      }
      dayCell.setAttribute("data-testid", "calendar-day-" + isoDate);
      dayCell.setAttribute("role", "button");
      dayCell.setAttribute("tabindex", "0");
      dayCell.setAttribute("aria-label", "Add event on " + isoDate);

      var numberEl = document.createElement("div");
      numberEl.className = "calendar-day-number";
      numberEl.textContent = String(day);
      dayCell.appendChild(numberEl);

      var eventsWrap = document.createElement("div");
      eventsWrap.className = "calendar-day-events";
      var dayEvents = eventsByDate[isoDate] || [];
      dayEvents.forEach(function (evt) {
        eventsWrap.appendChild(buildEventChip(evt));
      });
      dayCell.appendChild(eventsWrap);

      dayCell.addEventListener("click", function (clickedIso) {
        return function () {
          selectDay(clickedIso);
        };
      }(isoDate));

      dayCell.addEventListener("keydown", function (clickedIso) {
        return function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectDay(clickedIso);
          }
        };
      }(isoDate));

      gridEl.appendChild(dayCell);

      cellDate.setDate(cellDate.getDate() + 1);
    }

    renderEventForm();
  }

  function buildEventChip(evt) {
    var chip = document.createElement("div");
    chip.className = "calendar-event-chip";

    var textEl = document.createElement("span");
    textEl.className = "calendar-event-chip-text";
    textEl.textContent = evt.text;
    chip.appendChild(textEl);

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "calendar-event-delete";
    deleteBtn.setAttribute("data-testid", "calendar-event-delete-" + evt.id);
    deleteBtn.setAttribute("aria-label", "Delete event " + evt.text);
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      deleteEvent(evt.id);
    });
    chip.appendChild(deleteBtn);

    return chip;
  }

  function selectDay(isoDate) {
    selectedDate = selectedDate === isoDate ? null : isoDate;
    renderCalendar();
  }

  function deleteEvent(id) {
    Object.keys(eventsByDate).forEach(function (isoDate) {
      eventsByDate[isoDate] = eventsByDate[isoDate].filter(function (evt) {
        return evt.id !== id;
      });
      if (eventsByDate[isoDate].length === 0) {
        delete eventsByDate[isoDate];
      }
    });
    renderCalendar();
  }

  function renderEventForm() {
    var existingForm = document.querySelector(".calendar-event-form");
    if (existingForm) {
      existingForm.remove();
    }

    if (!selectedDate) {
      return;
    }

    var card = gridEl.closest(".card");

    var formWrap = document.createElement("div");
    formWrap.className = "calendar-event-form";

    var title = document.createElement("p");
    title.className = "calendar-event-form-title";
    title.textContent = "Add event for " + selectedDate;
    formWrap.appendChild(title);

    var row = document.createElement("div");
    row.className = "calendar-event-form-row";

    var input = document.createElement("input");
    input.type = "text";
    input.className = "form-input";
    input.setAttribute("data-testid", "calendar-event-input");
    input.setAttribute("aria-label", "Event text");
    input.setAttribute("placeholder", "Short event description");
    row.appendChild(input);

    var saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn";
    saveBtn.setAttribute("data-testid", "calendar-event-save");
    saveBtn.textContent = "Save event";
    row.appendChild(saveBtn);

    formWrap.appendChild(row);
    card.appendChild(formWrap);

    input.focus();

    function saveEvent() {
      var text = input.value.trim();
      if (!text) {
        return;
      }
      if (!eventsByDate[selectedDate]) {
        eventsByDate[selectedDate] = [];
      }
      eventsByDate[selectedDate].push({ id: nextEventId++, text: text });
      selectedDate = null;
      renderCalendar();
    }

    saveBtn.addEventListener("click", saveEvent);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEvent();
      }
    });
  }

  prevBtn.addEventListener("click", function () {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    selectedDate = null;
    renderCalendar();
  });

  nextBtn.addEventListener("click", function () {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    selectedDate = null;
    renderCalendar();
  });

  renderCalendar();
}());
