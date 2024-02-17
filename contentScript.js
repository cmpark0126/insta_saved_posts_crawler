const TIME = 1000; // 1 second
let backendServerUrl = ""; // e.g., "http://127.0.0.1:8000/items/"
let user = "";
let token = "";

async function sendDataToServer(data) {
    let response = null;

    chrome.runtime.sendMessage(
        {
            action: "sendDataToServer",
            url: `${backendServerUrl}`,
            req: {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json", // 수락 가능한 응답 타입 지정
                    Authorization: `${token}`,
                },
                body: JSON.stringify({
                    url: `${data.url}`,
                    content: `${data.content}`,
                    thumbnail: `${data.thumbnail}`,
                    user: `${user}`,
                }),
            },
        },
        (returned) => {
            response = returned.inner;
        }
    );

    // NOTE: if send request directly from content script,
    // it will be blocked by CORS policy or make http to https automatically

    // const response = await fetch(`${backendServerUrl}`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //         accept: "application/json", // 수락 가능한 응답 타입 지정
    //         Authorization: `${token}`,
    //     },
    //     body: JSON.stringify({
    //         url: `${data.url}`,
    //         content: `${data.content}`,
    //         thumbnail: `${data.thumbnail}`,
    //         user: `${user}`,
    //     }),
    // });

    const responseData = await response.json().catch((error) => {
        console.error("Error:", error);
    });

    console.log("Response data:", responseData.detail);
    if (responseData.detail === "Item already exists") {
        return Promise.resolve(false); // Item already exists
    } else if (responseData.detail === "Item created") {
        return Promise.resolve(true); // Item created
    } else {
        console.error("unexpected response:", responseData);
        return Promise.resolve(false);
    }
    // console.log("Data to send:", data.url);
    // return Promise.resolve(true);
}

async function crawlPostLinks() {
    let numUpdated = 0;

    const postsContainerXPath =
        "/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/section/main/div/div/div[3]/article/div[1]/div";
    const postsContainer = document
        .evaluate(
            postsContainerXPath,
            document,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        )
        .snapshotItem(0);
    const postBuckets = document.evaluate(
        "./div",
        postsContainer,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    for (let i = 0; i < postBuckets.snapshotLength; i++) {
        let postBucket = postBuckets.snapshotItem(i);
        let posts = document.evaluate(
            "./div",
            postBucket,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
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

                    // if updated, has_updated will be true
                    hasUpdated = await sendDataToServer({
                        url: postLink.href,
                        content: postInner.alt,
                        thumbnail: postInner.src,
                    });

                    if (hasUpdated) {
                        numUpdated++;
                    }
                }
            }
        }
    }

    return numUpdated;
}

async function scrollAndCaptureHTML(callback) {
    let numAllUpdated = 0;
    let numHasDiff = 0;
    let skipByNoNewPosts = 0;
    const maxSkipNoNewPosts = 10; // 새로운 게시물이 없을 때 스크롤을 중지하는 최대 시도 횟수

    // 변화 감지를 위한 observer 생성
    const observer = new MutationObserver(async (mutations, obs) => {
        const numUpdated = await crawlPostLinks();
        console.log(`${numUpdated} posts has updated`);

        if (numUpdated == 0 && skipByNoNewPosts >= maxSkipNoNewPosts) {
            console.log("No new posts found and max skip reached.");
            console.log(
                `Scrolling finished. ${numAllUpdated} posts has updated.`
            );
            obs.disconnect(); // Observer를 중지합니다.
            callback(numAllUpdated); // 콜백 함수 호출
            return;
        } else if (numUpdated == 0) {
            skipByNoNewPosts++;
            console.log(
                `No new posts found. Retry ${skipByNoNewPosts} / ${maxSkipNoNewPosts}.`
            );
        } else {
            numHasDiff++;
            skipByNoNewPosts = 0;
            numAllUpdated += numUpdated;
            console.log("New posts found. Reset skip count.");
            console.log(
                `Total ${numHasDiff} times new posts found. Total ${numAllUpdated} posts has updated.`
            );
        }

        attempts = 0; // 시도 횟수를 초기화하고 계속 스크롤합니다.
        setTimeout(() => window.scrollTo(0, document.body.scrollHeight), TIME);
    });

    // 문서 전체에 대한 변화 감지 시작
    observer.observe(document, {
        childList: true,
        subtree: true,
    });

    console.log("observer started");

    // 초기 스크롤 시작
    window.scrollTo(0, document.body.scrollHeight);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrollAndCapture") {
        backendServerUrl = request.url;
        user = request.user;
        token = request.token;
        console.log("Set backendServerUrl:", backendServerUrl);
        console.log("Set user:", user);
        console.log("Set token:", token);

        scrollAndCaptureHTML((num) => {
            sendResponse({ num: num });
            chrome.runtime.sendMessage(
                {
                    action: "asyncJobCompleted",
                    result: `${num} posts has updated`,
                },
                (response) => {
                    console.log(
                        "message received from sendResponse: " +
                            response.message
                    );
                }
            );
        }).catch((error) => {
            console.error("Error:", error);
            sendResponse({ error: error });
        });

        console.log("Scrolling and capturing started.");

        return true; // 비동기 응답을 위해 true를 반환
    }
});
