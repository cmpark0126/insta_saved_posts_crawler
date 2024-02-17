document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startButton').addEventListener('click', () => {
      // Query the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Send a message to the active tab to start scrolling and capturing HTML
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "scrollAndCapture"
        }, (response) => {
          if (response && response.html) {
            // Display the captured HTML in the popup
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