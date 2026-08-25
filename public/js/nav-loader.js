(function loadSidebar() {
  const mount = document.getElementById('sidebar-container');
  if (!mount) return;

  fetch('/partials/nav.html')
    .then((res) => res.text())
    .then((html) => {
      mount.innerHTML = html;

      const currentPage = document.body.dataset.page || 'index';
      const activeLink = mount.querySelector(`.sidebar-link[data-page="${currentPage}"]`);
      if (activeLink) activeLink.classList.add('active');
    });
})();
