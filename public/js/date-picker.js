(function () {
  // --- Native date input -------------------------------------------------
  const nativeDateInput = document.getElementById('native-date');
  const nativeDateOutput = document.querySelector('[data-testid="native-date-output"]');

  nativeDateInput.addEventListener('change', function () {
    nativeDateOutput.textContent = nativeDateInput.value
      ? `Selected date: ${nativeDateInput.value}`
      : 'No date selected yet.';
  });

  // --- Native date input: custom calendar popup ---------------------------
  const nativePopup = document.getElementById('native-date-popup');
  const nativePopupTitle = document.getElementById('native-date-popup-title');
  const nativeDaysContainer = document.getElementById('native-date-days');
  const nativePrevMonthBtn = document.querySelector('[data-testid="native-date-prev-month"]');
  const nativeNextMonthBtn = document.querySelector('[data-testid="native-date-next-month"]');

  const nativeMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const nativeToday = new Date();
  let nativeViewYear = nativeToday.getFullYear();
  let nativeViewMonth = nativeToday.getMonth(); // 0-based

  function nativeToIso(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function openNativePopup() {
    if (nativeDateInput.value) {
      const parts = nativeDateInput.value.split('-').map(Number);
      if (parts.length === 3 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
        nativeViewYear = parts[0];
        nativeViewMonth = parts[1] - 1;
      }
    }
    nativePopup.hidden = false;
    renderNativeCalendar();
  }

  function closeNativePopup() {
    nativePopup.hidden = true;
  }

  function renderNativeCalendar() {
    nativePopupTitle.textContent = `${nativeMonthNames[nativeViewMonth]} ${nativeViewYear}`;
    nativeDaysContainer.innerHTML = '';

    const firstOfMonth = new Date(nativeViewYear, nativeViewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(nativeViewYear, nativeViewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(nativeViewYear, nativeViewMonth, 0).getDate();

    const cells = [];

    // Leading days from previous month
    for (let i = 0; i < startWeekday; i++) {
      const day = daysInPrevMonth - startWeekday + 1 + i;
      const prevMonthDate = new Date(nativeViewYear, nativeViewMonth - 1, day);
      cells.push({
        day,
        iso: nativeToIso(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), day),
        outside: true,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, iso: nativeToIso(nativeViewYear, nativeViewMonth, day), outside: false });
    }

    // Trailing days from next month to fill the last week
    while (cells.length % 7 !== 0) {
      const nextIndex = cells.length - (startWeekday + daysInMonth) + 1;
      const nextMonthDate = new Date(nativeViewYear, nativeViewMonth + 1, nextIndex);
      cells.push({
        day: nextMonthDate.getDate(),
        iso: nativeToIso(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextMonthDate.getDate()),
        outside: true,
      });
    }

    cells.forEach((cell) => {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'range-day';
      cellEl.textContent = String(cell.day);

      if (cell.outside) cellEl.classList.add('is-outside-month');
      if (cell.iso === nativeDateInput.value) cellEl.classList.add('is-selected-start');

      cellEl.addEventListener('click', function () {
        nativeDateInput.value = cell.iso;
        nativeDateInput.dispatchEvent(new Event('change', { bubbles: true }));
        closeNativePopup();
      });

      nativeDaysContainer.appendChild(cellEl);
    });
  }

  nativePrevMonthBtn.addEventListener('click', function () {
    nativeViewMonth -= 1;
    if (nativeViewMonth < 0) {
      nativeViewMonth = 11;
      nativeViewYear -= 1;
    }
    renderNativeCalendar();
  });

  nativeNextMonthBtn.addEventListener('click', function () {
    nativeViewMonth += 1;
    if (nativeViewMonth > 11) {
      nativeViewMonth = 0;
      nativeViewYear += 1;
    }
    renderNativeCalendar();
  });

  nativeDateInput.addEventListener('focus', openNativePopup);
  nativeDateInput.addEventListener('click', openNativePopup);

  document.addEventListener('click', function (event) {
    const clickedInsidePopup = nativePopup.contains(event.target);
    const clickedInput = event.target === nativeDateInput;
    if (!clickedInsidePopup && !clickedInput && !nativePopup.hidden) {
      closeNativePopup();
    }
  });

  // --- Custom date-range picker -------------------------------------------
  const fromInput = document.getElementById('range-from');
  const toInput = document.getElementById('range-to');
  const popup = document.getElementById('range-popup');
  const popupTitle = document.getElementById('range-popup-title');
  const daysContainer = document.getElementById('range-days');
  const hintEl = document.getElementById('range-hint');
  const prevMonthBtn = document.querySelector('[data-testid="range-prev-month"]');
  const nextMonthBtn = document.querySelector('[data-testid="range-next-month"]');
  const applyBtn = document.querySelector('[data-testid="range-apply"]');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0-based
  let rangeStart = null; // ISO string
  let rangeEnd = null; // ISO string

  function toIso(year, month, day) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function openPopup() {
    popup.hidden = false;
    renderCalendar();
  }

  function closePopup() {
    popup.hidden = true;
  }

  function renderCalendar() {
    popupTitle.textContent = `${monthNames[viewMonth]} ${viewYear}`;
    daysContainer.innerHTML = '';

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Leading days from previous month
    for (let i = 0; i < startWeekday; i++) {
      const day = daysInPrevMonth - startWeekday + 1 + i;
      const prevMonthDate = new Date(viewYear, viewMonth - 1, day);
      cells.push({
        day,
        iso: toIso(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), day),
        outside: true,
      });
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({ day, iso: toIso(viewYear, viewMonth, day), outside: false });
    }

    // Trailing days from next month to fill the last week
    while (cells.length % 7 !== 0) {
      const nextIndex = cells.length - (startWeekday + daysInMonth) + 1;
      const nextMonthDate = new Date(viewYear, viewMonth + 1, nextIndex);
      cells.push({
        day: nextMonthDate.getDate(),
        iso: toIso(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextMonthDate.getDate()),
        outside: true,
      });
    }

    cells.forEach((cell) => {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'range-day';
      cellEl.textContent = String(cell.day);
      cellEl.dataset.testid = `range-day-${cell.iso}`;
      cellEl.dataset.iso = cell.iso;

      if (cell.outside) cellEl.classList.add('is-outside-month');
      if (cell.iso === rangeStart) cellEl.classList.add('is-selected-start');
      if (cell.iso === rangeEnd) cellEl.classList.add('is-selected-end');
      if (rangeStart && rangeEnd && cell.iso > rangeStart && cell.iso < rangeEnd) {
        cellEl.classList.add('is-in-range');
      }

      cellEl.addEventListener('click', function (event) {
        event.stopPropagation();
        onDayClick(cell.iso);
      });

      daysContainer.appendChild(cellEl);
    });
  }

  function onDayClick(iso) {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // start a fresh selection
      rangeStart = iso;
      rangeEnd = null;
      hintEl.textContent = 'Now pick an end day.';
    } else if (iso < rangeStart) {
      // clicked before the current start -> becomes the new start
      rangeEnd = rangeStart;
      rangeStart = iso;
      hintEl.textContent = 'Range selected. Click Apply.';
    } else {
      rangeEnd = iso;
      hintEl.textContent = 'Range selected. Click Apply.';
    }
    renderCalendar();
  }

  prevMonthBtn.addEventListener('click', function () {
    viewMonth -= 1;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear -= 1;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', function () {
    viewMonth += 1;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear += 1;
    }
    renderCalendar();
  });

  applyBtn.addEventListener('click', function () {
    if (rangeStart) fromInput.value = rangeStart;
    if (rangeEnd) toInput.value = rangeEnd;
    closePopup();
  });

  [fromInput, toInput].forEach((input) => {
    input.addEventListener('focus', openPopup);
    input.addEventListener('click', openPopup);
  });

  document.addEventListener('click', function (event) {
    const clickedInsidePopup = popup.contains(event.target);
    const clickedInput = event.target === fromInput || event.target === toInput;
    if (!clickedInsidePopup && !clickedInput && !popup.hidden) {
      closePopup();
    }
  });
})();
