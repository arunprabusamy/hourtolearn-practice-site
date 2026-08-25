(function () {
  // ---------------------------------------------------------------------
  // 1. Show after delay
  // ---------------------------------------------------------------------
  var delayShowBtn = document.querySelector('[data-testid="delay-show-btn"]');
  var delayedElement = document.querySelector('[data-testid="delayed-element"]');

  delayShowBtn.addEventListener('click', function () {
    delayedElement.hidden = true;
    setTimeout(function () {
      delayedElement.hidden = false;
    }, 2000);
  });

  // ---------------------------------------------------------------------
  // 2. Load items from server
  // ---------------------------------------------------------------------
  var loadItemsBtn = document.querySelector('[data-testid="load-items-btn"]');
  var itemsLoading = document.querySelector('[data-testid="items-loading"]');
  var itemList = document.querySelector('[data-testid="dynamic-item-list"]');

  loadItemsBtn.addEventListener('click', function () {
    itemList.innerHTML = '';
    itemsLoading.hidden = false;
    loadItemsBtn.disabled = true;

    fetch('/api/items?delay=800')
      .then(function (res) {
        return res.json();
      })
      .then(function (json) {
        (json.items || []).forEach(function (item) {
          var li = document.createElement('li');
          li.setAttribute('data-testid', 'dynamic-item-' + item.id);
          li.textContent = item.title;
          itemList.appendChild(li);
        });
      })
      .catch(function (err) {
        console.error('Failed to load items', err);
      })
      .finally(function () {
        itemsLoading.hidden = true;
        loadItemsBtn.disabled = false;
      });
  });

  // ---------------------------------------------------------------------
  // 3. Disappearing element
  // ---------------------------------------------------------------------
  var disappearBtn = document.querySelector('[data-testid="disappear-btn"]');
  var disappearingSlot = document.querySelector('.disappearing-slot');

  disappearBtn.addEventListener('click', function () {
    var existing = disappearingSlot.querySelector('[data-testid="disappearing-element"]');
    if (existing) {
      existing.remove();
    }

    var el = document.createElement('div');
    el.className = 'disappearing-element';
    el.setAttribute('data-testid', 'disappearing-element');
    el.textContent = 'This message will disappear in a few seconds.';
    disappearingSlot.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) {
        el.remove();
      }
    }, 3000);
  });
})();
