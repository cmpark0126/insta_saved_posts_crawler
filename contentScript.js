// Load ExcelJS library
// const ExcelJS = require("lib/exceljs.min.js");

// Set the crawling interval (1 second)
const TIME = 1000; 
let setOfUrls = new Set(); // Set to store collected URLs
let ListOfPosts = new Array(); // List to store collected posts

function crawlPostLinks() {
    // console.log("Starting crawlPostLinks");

    let numCaptured = 0;

    const postsContainerXPath =
        "/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div/div/div[3]/article/div[1]/div";
    const postsContainer = document
        .evaluate(
            postsContainerXPath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        )
        .snapshotItem(0);

    // console.log("postsContainer:", postsContainer);

    // postsContainer가 null인지 확인
    if (!postsContainer) {
        console.error("Posts container not found. Please check the XPath.");
        return numCaptured; // 0을 반환하여 수집된 게시물이 없음을 나타냄
    }

    // console.log("Posts container found. Proceeding to capture links.");

    const postBuckets = document.evaluate(
        "./div",
        postsContainer,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );

    // console.log(`Total post buckets found: ${postBuckets.snapshotLength}`);

    for (let i = 0; i < postBuckets.snapshotLength; i++) {
        let postBucket = postBuckets.snapshotItem(i);
        let posts = document.evaluate(
            "./div",
            postBucket,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        // console.log(`Posts found in bucket ${i}: ${posts.snapshotLength}`);

        for (let j = 0; j < posts.snapshotLength; j++) {
            let post = posts.snapshotItem(j);
            let postLink = document.evaluate(
                "./a",
                post,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            ).singleNodeValue;
            if (postLink) {
                // console.log(postLink.href);

                let postInner = document.evaluate(
                    "./div/div/img",
                    postLink,
                    null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE,
                    null
                ).singleNodeValue;
                if (postInner) {
                    // console.log(postInner.alt);
                    // console.log(postInner.src);

                    if (setOfUrls.has(postLink.href)) {
                        // console.log(
                        //     `post of ${postLink.href} has already been captured.`
                        // );
                        continue;
                    }
                    setOfUrls.add(postLink.href);

                    ListOfPosts.push([
                        postLink.href,
                        postInner.alt,
                        postInner.src,
                    ]);

                    // console.log(`Captured post: ${postLink.href}`);
                    numCaptured++;
                }
            } else {
                console.warn("Post link not found.");
            }
        }
    }

    console.log(`Total posts captured in this run: ${numCaptured}`);
    return numCaptured;
}

async function scrollAndCaptureHTML(callback, maxPostsToCapture = 1000) {
    let numAllUpdated = ListOfPosts.length; // 이미 캡쳐된 게시물 수
    let numHasDiff = 0;
    let skipByNoNewPosts = 0;
    const maxSkipNoNewPosts = 10; // 새로운 게시물이 없을 때 스크롤을 중지하는 최대 시도 횟수

    // 변화 감지를 위한 observer 생성
    const observer = new MutationObserver(async (mutations, obs) => {
        let numCaptured = crawlPostLinks();
        console.log(`${numCaptured} posts has captured.`);
        numAllUpdated += numCaptured;
        if (numAllUpdated >= maxPostsToCapture) {
            console.log(
                `Max posts to capture reached: ${numAllUpdated} / ${maxPostsToCapture}.`
            );
            obs.disconnect(); // Observer를 중지합니다.
            callback(numAllUpdated); // 콜백 함수 호출
            return;
        }

        if (numCaptured == 0) {
            if (skipByNoNewPosts >= maxSkipNoNewPosts) {
                console.log("No new posts found and max skip reached.");
                console.log(
                    `Scrolling finished. ${numAllUpdated} posts has updated.`
                );
                obs.disconnect(); // Observer를 중지합니다.
                callback(numAllUpdated); // 콜백 함수 호출
                return;
            } else {
                skipByNoNewPosts++;
                console.log(
                    `No new posts found. Retry ${skipByNoNewPosts} / ${maxSkipNoNewPosts}.`
                );
            }
        } else {
            numHasDiff++;
            skipByNoNewPosts = 0;
            console.log("New posts found. Reset skip count.");
            console.log(
                `Total ${numHasDiff} times new posts found. Total ${numAllUpdated} posts has updated.`
            );
        }

        setTimeout(
            () =>
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                }),
            TIME
        );
    });

    // 문서 전체에 대한 변화 감지 시작
    observer.observe(document, {
        childList: true,
        subtree: true,
    });

    console.log("observer started");

    // 초기 스크롤 시작
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
    });
}

function saveExcelAndNotify(num) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("My Sheet");

    worksheet.columns = [
        { header: "url", key: "url" },
        { header: "content", key: "content" },
        { header: "thumbnail", key: "thumbnail" },
    ];
    worksheet.addRows(ListOfPosts);

    workbook.xlsx.writeBuffer().then(function (buffer) {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "posts.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    chrome.runtime.sendMessage(
        {
            action: "asyncJobCompleted",
            result: `${num} posts has crawled and saved into posts.xlsx.`,
        },
        (response) => {
            console.log(
                "message received from sendResponse: " + response.message
            );
        }
    );
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollAndCapture") {
        console.log(
            `scrollAndCaptureHTML: maxPostsToCapture=${request.maxPostsToCapture}`
        );

        scrollAndCaptureHTML((num) => {
            sendResponse({ num: num });
            saveExcelAndNotify(num);
        }, request.maxPostsToCapture).catch((error) => {
            console.error("Error:", error);
            sendResponse({ error: error });
        });

        console.log("Scrolling and capturing started.");

        return true; // 비동기 응답을 위해 true를 반환
    }

    if (request.action === "saveExcelManually") {
        console.log(
            `scrollAndCaptureHTML: maxPostsToCapture=${request.maxPostsToCapture}`
        );

        let num = ListOfPosts.length;
        sendResponse({ num: num });
        saveExcelAndNotify(num);

        console.log("Scrolling and capturing started.");

        return true; // 비동기 응답을 위해 true를 반환
    }
});
