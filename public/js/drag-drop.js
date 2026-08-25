(function () {
  var INITIAL_CARDS = [
    { id: 1, text: 'Write a locator strategy doc', column: 'todo' },
    { id: 2, text: 'Set up CI pipeline', column: 'todo' },
    { id: 3, text: 'Review flaky test report', column: 'todo' },
    { id: 4, text: 'Automate the checkout flow', column: 'in-progress' },
    { id: 5, text: 'Add visual regression checks', column: 'in-progress' },
    { id: 6, text: 'Migrate to Playwright', column: 'done' },
    { id: 7, text: 'Retire old Selenium suite', column: 'done' }
  ];

  var board = document.querySelector('.kanban-board');
  var resetBtn = document.querySelector('[data-testid="kanban-reset"]');

  var cards = [];

  function cloneInitialCards() {
    return INITIAL_CARDS.map(function (c) {
      return { id: c.id, text: c.text, column: c.column };
    });
  }

  function createCardElement(card) {
    var el = document.createElement('div');
    el.className = 'kanban-card';
    el.setAttribute('draggable', 'true');
    el.setAttribute('data-testid', 'kanban-card-' + card.id);
    el.setAttribute('data-card-id', String(card.id));
    el.textContent = card.text;

    el.addEventListener('dragstart', function (e) {
      e.dataTransfer.setData('text/plain', String(card.id));
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });

    el.addEventListener('dragend', function () {
      el.classList.remove('dragging');
    });

    return el;
  }

  function render() {
    var dropzones = board.querySelectorAll('[data-dropzone]');
    dropzones.forEach(function (zone) {
      zone.innerHTML = '';
      var column = zone.getAttribute('data-column');
      cards
        .filter(function (c) {
          return c.column === column;
        })
        .forEach(function (card) {
          zone.appendChild(createCardElement(card));
        });
    });
  }

  function setupDropzones() {
    var dropzones = board.querySelectorAll('[data-dropzone]');
    dropzones.forEach(function (zone) {
      zone.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        zone.classList.add('drag-over');
      });

      zone.addEventListener('dragleave', function () {
        zone.classList.remove('drag-over');
      });

      zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        var cardId = parseInt(e.dataTransfer.getData('text/plain'), 10);
        var column = zone.getAttribute('data-column');
        var card = cards.find(function (c) {
          return c.id === cardId;
        });
        if (card) {
          card.column = column;
          render();
        }
      });
    });
  }

  resetBtn.addEventListener('click', function () {
    cards = cloneInitialCards();
    render();
  });

  cards = cloneInitialCards();
  setupDropzones();
  render();
})();
