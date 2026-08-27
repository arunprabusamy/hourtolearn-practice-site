(function () {
  var state = {
    q: '',
    sortBy: 'name',
    sortDir: 'asc',
    page: 1,
    pageSize: 5,
    total: 0,
    selected: new Set()
  };

  var searchInput = document.querySelector('[data-testid="table-search-input"]');
  var tbody = document.querySelector('[data-testid="table-body"]');
  var selectAllCheckbox = document.querySelector('[data-testid="table-select-all"]');
  var deleteSelectedBtn = document.querySelector('[data-testid="table-delete-selected"]');
  var prevBtn = document.querySelector('[data-testid="table-prev-page"]');
  var nextBtn = document.querySelector('[data-testid="table-next-page"]');
  var pageInfo = document.querySelector('[data-testid="table-page-info"]');
  var sortHeaders = document.querySelectorAll('[data-sort-key]');
  var addUserForm = document.querySelector('[data-testid="add-user-form"]');
  var addUserNameInput = document.querySelector('[data-testid="add-user-name-input"]');
  var addUserEmailInput = document.querySelector('[data-testid="add-user-email-input"]');
  var addUserRoleSelect = document.querySelector('[data-testid="add-user-role-select"]');
  var addUserAgeInput = document.querySelector('[data-testid="add-user-age-input"]');
  var addUserErrorMessage = document.querySelector('[data-testid="add-user-error-message"]');

  var searchDebounceTimer = null;

  function totalPages() {
    return Math.max(1, Math.ceil(state.total / state.pageSize));
  }

  function updateSortIndicators() {
    sortHeaders.forEach(function (th) {
      var key = th.getAttribute('data-sort-key');
      var indicator = th.querySelector('[data-sort-indicator]');
      if (!indicator) return;
      if (key === state.sortBy) {
        indicator.textContent = state.sortDir === 'asc' ? '▲' : '▼';
      } else {
        indicator.textContent = '';
      }
    });
  }

  function updateDeleteButtonState() {
    deleteSelectedBtn.disabled = state.selected.size === 0;
  }

  function updateSelectAllState(rows) {
    if (rows.length === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
      return;
    }
    var selectedOnPage = rows.filter(function (u) {
      return state.selected.has(u.id);
    }).length;
    selectAllCheckbox.checked = selectedOnPage === rows.length;
    selectAllCheckbox.indeterminate = selectedOnPage > 0 && selectedOnPage < rows.length;
  }

  function renderRows(rows) {
    tbody.innerHTML = '';
    rows.forEach(function (user) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-testid', 'table-row-' + user.id);

      var selectTd = document.createElement('td');
      selectTd.className = 'cell-select';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('data-testid', 'table-row-checkbox-' + user.id);
      checkbox.setAttribute('aria-label', 'Select row for ' + user.name);
      checkbox.checked = state.selected.has(user.id);
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          state.selected.add(user.id);
        } else {
          state.selected.delete(user.id);
        }
        updateDeleteButtonState();
        updateSelectAllState(rows);
      });
      selectTd.appendChild(checkbox);
      tr.appendChild(selectTd);

      var nameTd = document.createElement('td');
      nameTd.className = 'cell-name';
      nameTd.textContent = user.name;
      tr.appendChild(nameTd);

      var emailTd = document.createElement('td');
      emailTd.className = 'cell-email';
      emailTd.textContent = user.email;
      tr.appendChild(emailTd);

      var roleTd = document.createElement('td');
      roleTd.className = 'cell-role';
      roleTd.textContent = user.role;
      tr.appendChild(roleTd);

      var ageTd = document.createElement('td');
      ageTd.className = 'cell-age';
      ageTd.textContent = user.age;
      tr.appendChild(ageTd);

      tbody.appendChild(tr);
    });
  }

  function fetchAndRender() {
    var params = new URLSearchParams({
      q: state.q,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
      page: String(state.page),
      pageSize: String(state.pageSize)
    });

    fetch('/api/users?' + params.toString())
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        state.total = json.total;
        renderRows(json.data);
        updateSortIndicators();
        updateSelectAllState(json.data);
        updateDeleteButtonState();
        pageInfo.textContent = 'Page ' + state.page + ' of ' + totalPages();
        prevBtn.disabled = state.page <= 1;
        nextBtn.disabled = state.page >= totalPages();
      })
      .catch(function (err) {
        console.error('Failed to load users', err);
      });
  }

  searchInput.addEventListener('input', function () {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(function () {
      state.q = searchInput.value;
      state.page = 1;
      fetchAndRender();
    }, 300);
  });

  sortHeaders.forEach(function (th) {
    th.addEventListener('click', function () {
      var key = th.getAttribute('data-sort-key');
      if (state.sortBy === key) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = key;
        state.sortDir = 'asc';
      }
      state.page = 1;
      fetchAndRender();
    });
  });

  selectAllCheckbox.addEventListener('change', function () {
    var rowCheckboxes = tbody.querySelectorAll('input[type="checkbox"]');
    rowCheckboxes.forEach(function (cb) {
      var testid = cb.getAttribute('data-testid') || '';
      var id = parseInt(testid.replace('table-row-checkbox-', ''), 10);
      cb.checked = selectAllCheckbox.checked;
      if (selectAllCheckbox.checked) {
        state.selected.add(id);
      } else {
        state.selected.delete(id);
      }
    });
    updateDeleteButtonState();
  });

  deleteSelectedBtn.addEventListener('click', function () {
    state.selected.forEach(function (id) {
      var row = tbody.querySelector('[data-testid="table-row-' + id + '"]');
      if (row) {
        row.remove();
      }
    });
    state.selected.clear();
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
    updateDeleteButtonState();
  });

  prevBtn.addEventListener('click', function () {
    if (state.page > 1) {
      state.page -= 1;
      fetchAndRender();
    }
  });

  nextBtn.addEventListener('click', function () {
    if (state.page < totalPages()) {
      state.page += 1;
      fetchAndRender();
    }
  });

  addUserForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addUserErrorMessage.hidden = true;

    var name = addUserNameInput.value.trim();
    var email = addUserEmailInput.value.trim();
    var age = parseInt(addUserAgeInput.value, 10);

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        role: addUserRoleSelect.value,
        age: isNaN(age) ? undefined : age
      })
    })
      .then(function (res) {
        return res.json().then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          addUserErrorMessage.textContent = result.json.message || 'Failed to add user';
          addUserErrorMessage.hidden = false;
          return;
        }

        addUserForm.reset();
        state.q = '';
        state.page = 1;
        searchInput.value = '';
        fetchAndRender();
      })
      .catch(function (err) {
        console.error('Failed to add user', err);
        addUserErrorMessage.textContent = 'Failed to add user';
        addUserErrorMessage.hidden = false;
      });
  });

  fetchAndRender();
})();
