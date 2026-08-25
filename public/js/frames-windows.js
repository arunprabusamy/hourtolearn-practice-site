(function () {
  const popupBtn = document.querySelector('[data-testid="open-popup-btn"]');

  popupBtn.addEventListener('click', () => {
    window.open('/tooltips', 'popup', 'width=500,height=500');
  });
})();
