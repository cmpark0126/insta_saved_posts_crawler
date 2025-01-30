chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "asyncJobCompleted") {
        console.log("Async job completed in background script."); // Log when async job is completed
        // Create a notification when receiving async job completion message from contentScript
        chrome.notifications.create("", {
            type: "basic",
            iconUrl: "images/icon48.png",
            title: "Instagram Crawler",
            message: message.result, // Message to display in the notification
            priority: 2,
        });
        const returnMessage = "complete creating notification."; // Message to return
        sendResponse({
            message: returnMessage, // Send response back
        });
    }
});
