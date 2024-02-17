chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendDataToServer") {
        console.log("Sending data to server...");
        console.log(message.url);
        console.log(message.req);
        fetch(message.url, message.req).then((response) => {
            sendResponse({
                inner: response,
            });
        });
    }

    if (message.action === "asyncJobCompleted") {
        console.log("Async job completed in background script.");

        // contentScript로부터 비동기 작업 완료 메시지를 받으면 알림을 생성합니다.
        chrome.notifications.create("", {
            type: "basic",
            iconUrl: "images/icon48.png",
            title: "Instagram Crawler",
            message: message.result,
            priority: 2,
        });

        const returnMessage = "complete creating notification.";
        sendResponse({
            message: returnMessage,
        });
    }
});
