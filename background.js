chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendDataToServer") {
        console.log("Sending data to server...");
        fetch(message.url, message.req).then((response) => {
            console.log("Response:", response);

            // const responseData = await response.json().catch((error) => {
            //     console.error("Error:", error);
            // });

            // console.log("Response data:", responseData.detail);
            // if (responseData.detail === "Item already exists") {
            //     return Promise.resolve(false); // Item already exists
            // } else if (responseData.detail === "Item created") {
            //     return Promise.resolve(true); // Item created
            // } else {
            //     console.error("unexpected response:", responseData);
            //     return Promise.resolve(false);
            // }

            sendResponse({
                message: response,
            });
        });

        return true; // 비동기 응답을 위해 true를 반환
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
