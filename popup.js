document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('crawlButton').addEventListener('click', () => {
      // Query the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Send a message to the content script
        chrome.tabs.sendMessage(tabs[0].id, { action: "getHTML" }, (response) => {
          if (response) {
            // Display the HTML in the popup
            document.getElementById('htmlContent').textContent = response.html;
          } else {
            // Handle any errors
            if (chrome.runtime.lastError) {
              document.getElementById('htmlContent').textContent = `Error: ${chrome.runtime.lastError.message}`;
            } else {
              document.getElementById('htmlContent').textContent = 'Error getting HTML.';
            }
          }
        });
      });
    });
  });