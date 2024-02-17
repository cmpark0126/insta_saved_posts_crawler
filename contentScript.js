function scrollAndCaptureHTML(callback) {
    let scrolls = 0;
    let lastScrollHeight = 0;
  
    const intervalId = setInterval(() => {
      console.log(`Scrolling ${scrolls} times...`);

      window.scrollTo(0, document.body.scrollHeight);
      const currentScrollHeight = document.body.scrollHeight;
  
      // 스크롤이 더 이상 변화가 없다면, 끝난 것으로 간주
      if (lastScrollHeight === currentScrollHeight) {
        console.log("Scrolling finished.");
        clearInterval(intervalId);
        chrome.runtime.sendMessage({ action: "asyncJobCompleted", result: result });
        callback(document.documentElement.outerHTML);
    } else {
        lastScrollHeight = currentScrollHeight;
        scrolls++;
      }
    }, 5000);
  }

  async function performAsyncJob() {
    // 여기에 비동기 작업을 구현합니다. 예를 들어, setTimeout을 사용한 비동기 작업 시뮬레이션
    console.log("Performing async job in content script...");
    return new Promise((resolve) => {
      scrollAndCaptureHTML((html) => {
        resolve(html);
        });
    });

  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollAndCapture") {
      performAsyncJob().then((result) => {
        // 비동기 작업 완료 후 결과를 background.js로 보냅니다.
        chrome.runtime.sendMessage({ action: "asyncJobCompleted", result: result });
      });

      console.log("Scrolling and capturing started.");

      return true; // 비동기 응답을 위해 true를 반환
    }
  });
  