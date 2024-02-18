// NOTE: to aboid duplicated posts, we use Set instead of Array.
let posts = new Array();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "saveDataOnBackground") {
        posts.push(message.post);
        console.log(
            `post of ${message.post.url} added to the set in background script.`
        );
    }

    if (message.action === "saveExcelOnBackground") {
        // Save posts to Excel file.
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(posts);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const buf = XLSX.write(wb, { type: "array" });
        const blob = new Blob([buf], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const fileName = "posts.xlsx";
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();

        // create notification
        chrome.notifications.create("", {
            type: "basic",
            iconUrl: "images/icon48.png",
            title: "Instagram Crawler",
            message: `Total ${posts.size} posts saved to ${fileName}.`,
            priority: 2,
        });

        posts.clear();
    }
});
