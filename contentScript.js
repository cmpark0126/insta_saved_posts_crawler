// Listen for a message from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getHTML") {
      // Send the HTML of the current page back to the popup
      sendResponse({ html: document.documentElement.outerHTML });
    }
  });