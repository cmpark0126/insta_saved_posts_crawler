function scrollAndCaptureHTML(callback) {
    let scrolls = 0;
    let lastScrollHeight = 0;
  
    const intervalId = setInterval(() => {
      window.scrollTo(0, document.body.scrollHeight);
      const currentScrollHeight = document.body.scrollHeight;
  
      // 스크롤이 더 이상 변화가 없다면, 끝난 것으로 간주
      if (lastScrollHeight === currentScrollHeight) {
        clearInterval(intervalId);
        callback(document.documentElement.outerHTML);
      } else {
        lastScrollHeight = currentScrollHeight;
        scrolls++;
      }
    }, 5000);
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollAndCapture") {
      scrollAndCaptureHTML((html) => {
        sendResponse({ html: html });
      }, request.scrollDelay, request.maxScrolls);
      return true; // 비동기 응답을 위해 true를 반환
    }
  });
  