# insta_saved_posts_crawler

This project provides functionality to crawl and save Instagram saved posts.

## 1. Download repository as a zip file

![1_download](assets/1_download.png)

---

## 2. unzip downloaded zip file like below

![2_unzip](assets/2_unzip.png)

---

## 3. install chrome extension by loading unziped directory

### 3-1. access to `chrome://extensions/`

![3_1_chrome](assets/3_1_chrome.png)

### 3-2. enable developer mode

![3_2_dev](assets/3_2_dev.png)

### 3-3. install chrome extension

![3_3_install](assets/3_3_install.png)

### 3-4. pin `Instagram Saved Posts Crawler` extension to top of the chrome

![3_4_pin](assets/3_4_pin.png)

---

## 4. move to https://www.instagram.com/<user_id>/saved/all-posts/

![4_1_instagram](assets/4_1_instagram.png)

-   you need to replace <user_id> to your instagram user id
  -   may you need to login to your instagram account
-   may you need to reload the page to apply the extension

---

## 5. set maximum number of posts you want to capture and click start

![set](assets/5_1_set.png)

-   **Do not switch Chrome tabs during crawling. It may cause the crawling to stop.**
-   **If crawling ends before reaching the max value due to scrolling or internet issues, pressing the Start button again will resume crawling while keeping the previously saved data.**
-   **If you want to save intermediate results during crawling, press the SaveManually button to save the current results.**
-   **If the download window does not appear after scrolling is complete, please press the SaveManually button to save the results collected so far.**

---

## Known Issues

### 1. Error: could not establish connection. receiving end does not exist. message
- **한국어**: 이 에러가 발생하면 인스타그램 페이지를 새로고침하세요. 페이지 진입 후에 확장 프로그램이 설치되면 페이지에 확장 프로그램이 제대로 이식되지 않아 제대로 동작하지 않습니다.
- **English**: If you encounter this error, please refresh the Instagram page. If the extension is installed after entering the page, it may not be properly integrated into the page, causing it to malfunction.

### 2. Crawling Stops at the End of the Page, and not saving posts
- **한국어**: 크롤링을 위해 스크롤이 진행되다가 페이지 맨 끝에 다다르면 포스트를 크롤링한 내용이 저장되지 않고 멈추는 현상이 발생할 수 있습니다. 이때는 (1) 아래위로 수동으로 스크롤을 하면 곧 포스트 저장 팝업이 뜰겁니다. 크롬의 확장 프로그램이 마지막 액션 이후에 freeze되는 현상으로 인해 다음 단계로 넘어가지 않는 문제입니다. (2) 그래도 안 되면 save manually를 사용하세요. 그럼 지금까지 크롤링 한 내용이 저장될 겁니다.
- **English**: While scrolling for crawling, you may encounter an issue where it stops without saving the crawled posts when reaching the end of the page. In this case, (1) try scrolling up and down manually, and a post save popup should appear shortly. This is due to the Chrome extension freezing after the last action, preventing it from proceeding to the next step. (2) If that doesn't work, please use the "Save Manually" option. This will save the content you have crawled so far.

---

# Question?

-   cmpark0126@gmail.com
