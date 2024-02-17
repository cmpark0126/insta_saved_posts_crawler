document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('startButton').addEventListener('click', function() {
      // 현재 활성화된 탭에 메시지를 보내 비동기 작업을 실행하라고 요청합니다.
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "scrollAndCapture"});
      });
    });
  });