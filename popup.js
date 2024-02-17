document.getElementById('crawlButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getHTML" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(`Error: ${chrome.runtime.lastError.message}`);
          return;
        }
  
        if (response && response.html) {
          console.log('HTML of the page:', response.html);
          // 여기에 HTML 코드를 처리하는 로직을 추가하세요.
        }
      });
    });
  });
  