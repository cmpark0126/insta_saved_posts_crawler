function scrollAndCaptureHTML(callback) {
    let lastScrollHeight = 0;
    let attempts = 0;
    let countOfLoad = 0;
    const maxAttempts = 10; // 최대 시도 횟수를 정의하여 무한 스크롤을 방지합니다.

    // 변화 감지를 위한 observer 생성
    const observer = new MutationObserver((mutations, obs) => {
        const currentScrollHeight = document.body.scrollHeight;

        if (lastScrollHeight === currentScrollHeight && attempts < maxAttempts) {
            attempts++;
            setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1000);
            console.log(`Scrolling attempt ${attempts}/${maxAttempts}.`);
        } else if (attempts >= maxAttempts) {
            // 최대 시도 횟수에 도달했거나 더 이상 콘텐츠가 로드되지 않을 경우
            console.log("Scrolling finished or max attempts reached.");
            obs.disconnect(); // Observer를 중지합니다.
            callback(document.documentElement.outerHTML); // 콜백 함수 호출
        } else {
            countOfLoad++;
            console.log('countOfLoad: ' + countOfLoad);

            lastScrollHeight = currentScrollHeight;
            attempts = 0; // 시도 횟수를 초기화하고 계속 스크롤합니다.
            setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 1000);
            console.log(`Scrolling attempt ${attempts}/${maxAttempts}.`);
        }
    });

    // 문서 전체에 대한 변화 감지 시작
    observer.observe(document, {
        childList: true,
        subtree: true
    });

    console.log('observer started');

    // 초기 스크롤 시작
    window.scrollTo(0, document.body.scrollHeight);
}
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollAndCapture") {
      scrollAndCaptureHTML((html) => {
        sendResponse({ html: html });
        chrome.runtime.sendMessage({ action: "asyncJobCompleted", result: "HTML captured."}, (response) => {
            console.log('message received from sendResponse: ' + response.message);
        });
      });

      console.log("Scrolling and capturing started.");

      return true; // 비동기 응답을 위해 true를 반환
    }
  });
  