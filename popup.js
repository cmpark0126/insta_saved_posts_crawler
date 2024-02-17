document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('crawlButton').addEventListener('click', () => {
      // Query the current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Execute a script on the current tab
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => document.documentElement.outerHTML, // 이 함수는 현재 탭에서 실행됩니다.
        }, (results) => {
          // results[0].result에 HTML이 포함되어 있습니다.
          if (results && results[0]) {
            // Display the HTML in the popup
            document.getElementById('htmlContent').textContent = results[0].result;
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