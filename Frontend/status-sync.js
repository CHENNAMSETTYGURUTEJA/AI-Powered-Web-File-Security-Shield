/**
 * PhishShield Status Sync Content Script
 * This script runs on the dashboard page and provides the extension's clientId
 * to the dashboard so it can accurately reflect the connection status.
 */

console.log("[PhishShield] Status sync script loaded");

// Function to send clientId to the dashboard page
function syncClientId() {
    // Safety check: is the extension context still valid?
    if (!chrome.runtime?.id) {
        console.warn("[PhishShield] Extension context invalidated. Please refresh the page.");
        return;
    }

    try {
        chrome.runtime.sendMessage({ action: "getClientId" }, (response) => {
            // Check for lastError (context invalidated is common here)
            if (chrome.runtime.lastError) {
                const errorMsg = chrome.runtime.lastError.message || "";
                if (errorMsg.includes("context invalidated")) {
                    console.log("[PhishShield] Extension reloaded. Logic suspended for this tab instance.");
                } else {
                    console.warn("[PhishShield] Messaging error:", errorMsg);
                }
                return;
            }

            if (response && response.clientId) {
                console.log("[PhishShield] Successfully synced clientId:", response.clientId);
                
                // Send to the page via window.postMessage
                window.postMessage({
                    type: "PHISHSHIELD_SYNC",
                    clientId: response.clientId
                }, "*");
                
                console.log("[PhishShield] Dispatched PHISHSHIELD_SYNC event to dashboard");
                
                // Also store in localStorage as a fallback for the dashboard
                localStorage.setItem('phishshield_extension_id', response.clientId);
            } else {
                console.warn("[PhishShield] Received empty clientId from background script");
            }
        });
    } catch (e) {
        // Catch immediate errors (like calling sendMessage when completely disconnected)
        if (e.message.includes("context invalidated")) {
            console.log("[PhishShield] Context invalidated - catching error for stability.");
        } else {
            console.error("[PhishShield] Unexpected error in syncClientId:", e);
        }
    }
}

// Sync on load
syncClientId();

// Continously re-sync every 3 seconds to ensure the dashboard picks it up 
// even if the first event was missed (timing issues)
setInterval(syncClientId, 3000);

// Also sync when the page asks for it
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "PHISHSHIELD_QUERY_SYNC") {
        console.log("[PhishShield] Received sync request from dashboard");
        syncClientId();
    }
});

