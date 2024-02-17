const TIME = 1000; // 1 second

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

    console.log("Response data:", responseData.detail);
    if (responseData.detail === "Item already exists") {
        return Promise.resolve(false); // Item already exists
    } else if (responseData.detail === "Item created") {
        return Promise.resolve(true); // Item created
    } else {
        console.error("unexpected response:", responseData);
        throw new Error("unexpected response");
    }
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
    let lastScrollHeight = 0;
    let attempts = 0;
    let skipByNoNewPosts = 0;
    let countOfLoad = 0;
    let numAllUpdated = 0;
    const maxAttempts = 10; // 최대 시도 횟수를 정의하여 무한 스크롤을 방지합니다.
    const maxSkipNoNewPosts = 5; // 새로운 게시물이 없을 때 스크롤을 중지하는 최대 시도 횟수

    // 변화 감지를 위한 observer 생성
    const observer = new MutationObserver(async (mutations, obs) => {
        const currentScrollHeight = document.body.scrollHeight;

        if (
            lastScrollHeight === currentScrollHeight &&
            attempts < maxAttempts
        ) {
            attempts++;
            setTimeout(
                () => window.scrollTo(0, document.body.scrollHeight),
                TIME
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
                console.log(
                    `No new posts found. Count up ${skipByNoNewPosts} / ${maxSkipNoNewPosts}.`
                );
                skipByNoNewPosts++;
            } else {
                console.log("New posts found. Reset skip count.");
                skipByNoNewPosts = 0;
            }

            numAllUpdated += numUpdated;

            attempts = 0; // 시도 횟수를 초기화하고 계속 스크롤합니다.
            setTimeout(
                () => window.scrollTo(0, document.body.scrollHeight),
                TIME
            );
            console.log(`Scrolling attempt ${attempts}/${maxAttempts}.`);

            lastScrollHeight = currentScrollHeight;
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
        }).catch((error) => {
            console.error("Error:", error);
            sendResponse({ error: error });
        });

        console.log("Scrolling and capturing started.");

        return true; // 비동기 응답을 위해 true를 반환
    }
});
