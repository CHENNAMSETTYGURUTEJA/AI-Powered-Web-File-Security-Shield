document.addEventListener('DOMContentLoaded', () => {
    // Get filename from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const file = urlParams.get('file');
    if (file) {
        document.getElementById('filename').textContent = file;
    }

    // Handle Close Button Click
    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.close();
        });
    }
});
