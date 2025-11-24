document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggleBtn');
    const statusText = document.getElementById('statusText');

    function updateUI(active) {
        if (active) {
            statusText.textContent = "ACTIVE";
            statusText.className = "status-text active";
            btn.textContent = "Disable";
        } else {
            statusText.textContent = "DISABLED";
            statusText.className = "status-text";
            btn.textContent = "Enable";
        }
    }

    chrome.runtime.sendMessage({ cmd: "GET_STATUS" }, (response) => {
        updateUI(response.enabled);
    });

    btn.addEventListener('click', () => {
        const isActive = statusText.classList.contains('active');
        chrome.runtime.sendMessage({ cmd: "TOGGLE", value: !isActive }, (response) => {
            updateUI(response.status);
        });
    });
});
