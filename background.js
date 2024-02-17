chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "asyncJobCompleted") {
      // contentScript로부터 비동기 작업 완료 메시지를 받으면 알림을 생성합니다.
      chrome.notifications.create('', {
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Async Job Notification',
        message: message.result,
        priority: 2
      });
    }
  });
  