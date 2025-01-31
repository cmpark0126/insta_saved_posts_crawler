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

## 6. download posts list as an excel file after crawling is complete

![6_1_download_posts](assets/6_1_download_posts.png)
![6_2_downloaded_posts](assets/6_2_downloaded_posts.png)

-   after crawling is complete, the posts list will be downloaded as an excel file.

---

## Known Issues

### 1. Error: could not establish connection. receiving end does not exist. message
- **If you encounter this error, please refresh the Instagram page. If the extension is installed after entering the page, it may not be properly integrated into the page, causing it to malfunction.**

### 2. Crawling Stops at the End of the Page, and not saving posts
- **While scrolling for crawling, you may encounter an issue where it stops without saving the crawled posts when reaching the end of the page. In this case, (1) try scrolling up and down manually, and a post save popup should appear shortly. This is due to the Chrome extension freezing after the last action, preventing it from proceeding to the next step. (2) If that doesn't work, please use the "Save Manually" option. This will save the content you have crawled so far.**

---

# Question?

-   cmpark0126@gmail.com 