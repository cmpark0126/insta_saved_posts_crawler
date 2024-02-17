chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getHTML") {
      const html = document.documentElement.outerHTML;
      sendResponse({ html: html });
    }
  });