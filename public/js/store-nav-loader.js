(function loadStoreNav() {
  const mount = document.getElementById('store-nav-container');
  if (!mount) return;

  fetch('/partials/store-nav.html')
    .then((res) => res.text())
    .then((html) => {
      mount.innerHTML = html;

      const currentPage = document.body.dataset.page || 'shop';
      const activeLink = mount.querySelector(`.store-nav-link[data-page="${currentPage}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
})();
