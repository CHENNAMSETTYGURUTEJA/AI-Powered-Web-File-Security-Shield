/**
 * PhishShield Status Sync Content Script
 * This script runs on the dashboard page and provides the extension's clientId
 * to the dashboard so it can accurately reflect the connection status.
 */

// Function to check if we are on the Shield AI dashboard
function isShieldDashboard() {
    return document.title.includes("web-dashboard") || 
           !!document.querySelector('h1')?.textContent?.includes("Security Shield");
}

function syncClientId() {
    if (!isShieldDashboard()) return;

    if (!chrome.runtime?.id) {
        console.warn("[PhishShield] Extension context invalidated.");
        return;
    }

    try {
        console.log("[PhishShield] Dashboard detected, syncing clientId...");
        chrome.runtime.sendMessage({ action: "getClientId" }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("[PhishShield] Sync error:", chrome.runtime.lastError.message);
                return;
            }

            if (response && response.clientId) {
                console.log("[PhishShield] Synced clientId:", response.clientId);
                
                // Send to the page via window.postMessage
                window.postMessage({
                    type: "PHISHSHIELD_SYNC",
                    clientId: response.clientId
                }, "*");
                
                // Store in localStorage as fallback
                localStorage.setItem('phishshield_extension_id', response.clientId);
            }
        });
    } catch (e) {
        console.error("[PhishShield] Sync exception:", e);
    }
}

// Initial sync
syncClientId();

// Listen for query or config from dashboard
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "PHISHSHIELD_QUERY_SYNC") {
        syncClientId();
    } else if (event.data && event.data.type === "PHISHSHIELD_CONFIG_SYNC") {
        // Sync the API URL from the dashboard to the extension
        if (chrome.runtime?.id && event.data.apiUrl) {
            chrome.runtime.sendMessage({ 
                action: "updateConfig", 
                apiUrl: event.data.apiUrl 
            });
        }
    }
});
