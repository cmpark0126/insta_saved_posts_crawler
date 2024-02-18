document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startButton").addEventListener("click", () => {
        const maxPostsToCapture =
            document.getElementById("maxPostsToCapture").value;

        // Query the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Send a message to the active tab to start scrolling and capturing HTML
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "scrollAndCapture",
                    maxPostsToCapture: maxPostsToCapture,
                },
                (response) => {
                    if (response && response.num) {
                        // Display the captured HTML in the popup
                        document.getElementById("numPosts").textContent =
                            response.num;
                    } else {
                        // Handle any errors
                        if (chrome.runtime.lastError) {
                            document.getElementById(
                                "numPosts"
                            ).textContent = `Error: ${chrome.runtime.lastError.message}`;
                        } else {
                            document.getElementById("numPosts").textContent =
                                "Error crawling posts.";
                        }
                    }
                }
            );
        });
    });

    document.getElementById("saveButton").addEventListener("click", () => {
        // Query the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            // Send a message to the active tab to start scrolling and capturing HTML
            chrome.tabs.sendMessage(
                tabs[0].id,
                {
                    action: "saveExcelManually",
                },
                (response) => {
                    if (response && response.num) {
                        // Display the captured HTML in the popup
                        document.getElementById("numPosts").textContent =
                            response.num;
                    } else {
                        // Handle any errors
                        if (chrome.runtime.lastError) {
                            document.getElementById(
                                "numPosts"
                            ).textContent = `Error: ${chrome.runtime.lastError.message}`;
                        } else {
                            document.getElementById("numPosts").textContent =
                                "Error save posts.";
                        }
                    }
                }
            );
        });
    });
});
