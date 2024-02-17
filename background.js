chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendDataToServer") {
        console.log("Sending data to server...");

        async function fetchData() {
            try {
                // fetch 요청을 수행하고 응답을 기다립니다.
                const response = await fetch(message.url, message.req);
                if (response.ok) {
                    console.log("Response is ok.");
                    sendResponse(true);
                } else {
                    const data = await response.json();

                    // NOTE: pocketbase 서버의 응답 형식을 따릅니다.
                    console.log("Error:", data);

                    if (data.data.url.code === "validation_not_unique") {
                        console.log("Value must be unique.");
                        sendResponse(false);
                    } else {
                        throw new Error(`Error: ${data} (${data.code})`);
                    }
                }
            } catch (error) {
                throw error;
            }
        }

        fetchData().catch((error) => {
            console.error("Error:", error);
            throw error;
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
