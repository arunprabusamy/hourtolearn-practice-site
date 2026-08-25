(function () {
  const fileInput = document.getElementById('file-input');
  const selectedFilesEl = document.getElementById('selected-files');
  const uploadBtn = document.querySelector('[data-testid="upload-submit-btn"]');
  const resultEl = document.getElementById('upload-result');

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  fileInput.addEventListener('change', () => {
    selectedFilesEl.innerHTML = '';
    const files = Array.from(fileInput.files || []);

    files.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = 'file-row';
      row.setAttribute('data-testid', `selected-file-${index}`);
      row.innerHTML = `
        <span class="file-row-name">${file.name}</span>
        <span class="file-row-size">${formatSize(file.size)}</span>
      `;
      selectedFilesEl.appendChild(row);
    });
  });

  uploadBtn.addEventListener('click', async () => {
    const files = Array.from(fileInput.files || []);
    resultEl.innerHTML = '';

    if (files.length === 0) {
      resultEl.innerHTML = '<div class="alert alert-error">Please choose at least one file.</div>';
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    try {
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const data = await res.json();

      const uploaded = data.files || [];
      uploaded.forEach((file, index) => {
        const row = document.createElement('div');
        row.className = 'file-row';
        row.setAttribute('data-testid', `uploaded-file-${index}`);
        row.innerHTML = `
          <span class="file-row-name">${file.filename}</span>
          <span class="file-row-size">${formatSize(file.size)}</span>
        `;
        resultEl.appendChild(row);
      });
    } catch (err) {
      resultEl.innerHTML = '<div class="alert alert-error">Upload failed. Please try again.</div>';
    }
  });
})();
