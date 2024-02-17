async function sendDataToServer(data) {
    const response = await fetch("http://127.0.0.1:8000/items/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json", // 수락 가능한 응답 타입 지정
            // TODO: 인증 헤더 추가
        },
        body: JSON.stringify({
            url: data.url,
            content: data.content,
            thumbnail: data.thumbnail,
        }),
    });

    const responseData = await response.json().catch((error) => {
        console.error("Error:", error);
    });

    if (responseData.detail === "Item already exists") {
        return false; // Item already exists
    } else if (responseData.detail === "Item created") {
        return true; // Item created
    } else {
        console.error("unexpected response:", responseData);
        throw new Error("unexpected response");
    }
}

function crawlPostLinks() {
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
                    if (
                        sendDataToServer({
                            url: postLink.href,
                            content: postInner.alt,
                            thumbnail: postInner.src,
                        })
                    ) {
                        numUpdated++;
                    }
                }
            }
        }
    }

    return numUpdated;
}

function scrollAndCaptureHTML(callback) {
    let lastScrollHeight = 0;
    let attempts = 0;
    let countOfLoad = 0;
    let numAllUpdated = 0;
    const maxAttempts = 10; // 최대 시도 횟수를 정의하여 무한 스크롤을 방지합니다.

    // 변화 감지를 위한 observer 생성
    const observer = new MutationObserver((mutations, obs) => {
        const currentScrollHeight = document.body.scrollHeight;

        if (
            lastScrollHeight === currentScrollHeight &&
            attempts < maxAttempts
        ) {
            attempts++;
            setTimeout(
                () => window.scrollTo(0, document.body.scrollHeight),
                1000
            );
            console.log(`Scrolling attempt ${attempts}/${maxAttempts}.`);
        } else if (attempts >= maxAttempts) {
            // 최대 시도 횟수에 도달했거나 더 이상 콘텐츠가 로드되지 않을 경우
            console.log("Scrolling finished or max attempts reached.");
            console.log(
                `Scrolling finished. ${numAllUpdated} posts has updated.`
            );
            obs.disconnect(); // Observer를 중지합니다.
            callback(numAllUpdated); // 콜백 함수 호출
        } else {
            countOfLoad++;
            console.log("countOfLoad: " + countOfLoad);

            const numUpdated = crawlPostLinks();
            console.log(`${numUpdated} posts has updated`);

            if (numUpdated == 0) {
                console.log("No new posts found.");
                console.log(
                    `Scrolling finished. ${numAllUpdated} posts has updated.`
                );
                obs.disconnect(); // Observer를 중지합니다.
                callback(numAllUpdated); // 콜백 함수 호출
                return;
            }
            numAllUpdated += numUpdated;

            lastScrollHeight = currentScrollHeight;
            attempts = 0; // 시도 횟수를 초기화하고 계속 스크롤합니다.
            setTimeout(
                () => window.scrollTo(0, document.body.scrollHeight),
                1000
            );
            console.log(`Scrolling attempt ${attempts}/${maxAttempts}.`);
        }
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
        });

        console.log("Scrolling and capturing started.");

        return true; // 비동기 응답을 위해 true를 반환
    }
});
