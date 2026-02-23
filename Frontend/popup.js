document.addEventListener("DOMContentLoaded", function () {
  const resultDiv = document.getElementById("result");
  const loadingDiv = document.getElementById("loading");
  const historyDiv = document.getElementById("history");

  // Show loading state
  loadingDiv.style.display = "block";

  // Get current status from background script
  chrome.runtime.sendMessage({ action: "getCurrentStatus" }, (response) => {
    loadingDiv.style.display = "none";

    if (response?.error) {
      resultDiv.innerHTML = `
        <div class="error">
          ❌ Error checking URL<br>
          <small>${response.error}</small>
        </div>
      `;
      return;
    }

    const verdict = response.isPhishing ? "❌ Phishing" : "✅ Safe";
    const verdictClass = response.isPhishing ? "phishing" : "safe";

    resultDiv.innerHTML = `
      <div class="${verdictClass}">
        <strong>${verdict}</strong><br>
        <small>${response.url}</small>
      </div>
    `;
  });

  // Load scan history
  function loadHistory() {
    chrome.runtime.sendMessage({ action: "getHistory" }, (history) => {
      historyDiv.innerHTML = "";
      history.forEach((entry) => {
        const el = document.createElement("div");
        el.className = `history-entry ${entry.isPhishing ? 'phishing' : 'safe'}`;
        el.innerHTML = `
          <div>
            <strong>${entry.isPhishing ? '❌ Phishing' : '✅ Safe'}</strong>
            <a href="https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(entry.url)}" 
               target="_blank" 
               class="report-link">Report</a>
          </div>
          <div class="url">${entry.url}</div>
          <div class="time">Scanned at: ${entry.timestamp}</div>
        `;
        historyDiv.appendChild(el);
      });
    });
  }

  // Initial history load
  loadHistory();

  // Refresh history every 5 seconds
  setInterval(loadHistory, 5000);

  // --- FILE SCANNING LOGIC ---
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileScanStatus = document.getElementById("fileScanStatus");

  // Trigger file selection when button is clicked
  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => fileInput.click());
  }

  // Handle file selection and upload
  if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      fileScanStatus.innerHTML = "⏳ Scanning file...";
      fileScanStatus.style.color = "#666";

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("https://phishshield-backend.onrender.com/api/scan-file", {
          method: "POST",
          headers: {
            "x-api-key": "phishshield-ext-key-2026"
            // Note: Don't set Content-Type manually when using FormData
          },
          body: formData,
        });

        if (!response.ok) throw new Error("File scan failed");

        const data = await response.json();

        if (data.isMalicious) {
          fileScanStatus.innerHTML = `❌ Malware Detected (${data.filename})`;
          fileScanStatus.style.color = "#ff4444";
          fileScanStatus.style.fontWeight = "bold";
        } else {
          fileScanStatus.innerHTML = `✅ Clean File (${data.filename})`;
          fileScanStatus.style.color = "#4CAF50";
          fileScanStatus.style.fontWeight = "bold";
        }

        // Refresh the local history to show it immediately if needed
        loadHistory();

      } catch (error) {
        console.error(error);
        fileScanStatus.innerHTML = "❌ Error uploading file.";
        fileScanStatus.style.color = "#ff4444";
      }

      // Clear the input so the same file can be uploaded again if needed
      fileInput.value = "";
    });
  }
});
