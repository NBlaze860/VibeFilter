console.log("🚀 Content script starting...");

let posts = [];
let filteredPosts = [];
let lastPost = null; // { index, text }

function textIncludesKeyword(rawText) {
  const normalizedText = rawText
    .toLowerCase()
    .replace(/\s+/g, " ") // replace all whitespace (including \n, \t) with a single space
    .trim();
  return normalizedText;
}

const interval = setInterval(() => { // interval because  the page takes time to load.
  const parent = document.querySelector(".scaffold-finite-scroll__content");  // the main element containing all the posts
  if (parent) { 
    console.log("✅ LinkedIn content container found - starting observer");
    clearInterval(interval); // Stop checking once found

    const callback = (mutationList, observer) => {
      const currentURL = window.location.href;
      if (
        currentURL
          .toLowerCase()
          .includes("https://www.linkedin.com/search/results/content/")
      ) // to run the content script only when current tab is of the linkedIn post search 
        setTimeout(() => {
          console.log("🔄 DOM change detected");
          
          try { //for the "show more results" button so that it gets clicked automatically without being clicked manually each time.
            const showMoreButton = document.querySelector(  
              ".scaffold-finite-scroll__load-button"
            );
            if (showMoreButton) {
              //showMoreButton.click();
            }
          } catch (error) {
            console.error("[VibeFilter ERROR] Show more button failed:", error);
          }
          posts = document.querySelectorAll("li.artdeco-card"); // gets all the posts in the dom. When we scroll down to the bottom, 3 posts are added each time, each post is in a list "li" and these are all inside a div with a random class each time.
          
          // Handle edge case: reset lastPost if invalid
          if (lastPost && lastPost.index >= posts.length) {
            console.log("📍 Resetting invalid lastPost");
            lastPost = null; // Reset if invalid
          }
          
          // Find lastIndex from lastPost
          let lastIndex = -1;
          if (lastPost && lastPost.index < posts.length) {
            const currentText = textIncludesKeyword(posts[lastPost.index].textContent);
            if (currentText === lastPost.text) {
              lastIndex = lastPost.index;
              console.log(`📍 Found lastPost at index ${lastIndex}, lastPost:${lastPost}`);
            } else {
              // Post content changed, reset tracking
              console.log("⚠️ Post content changed, resetting lastPost");
              lastPost = null;
            }
          }

          // Build newPosts (only new posts after lastIndex)
          let newPostsToSend = [];
          for (let i = lastIndex + 1; i < posts.length; i++) {
            newPostsToSend.push({
              index: i,
              text: textIncludesKeyword(posts[i].textContent)
            });
          }

          console.log(`📊 lastIndex: ${lastIndex}, Total posts: ${posts.length}, New posts: ${newPostsToSend.length}`);

          // Only send message if there are new posts
          if (newPostsToSend.length > 0) {
            console.log(`📤 Sending ${newPostsToSend.length} new posts to background`);
            chrome.runtime.sendMessage({  //sends message to background script.
              newPosts: newPostsToSend,
              totalPostsCount: posts.length
            });
          }
        }, "500");
    };

    observer = new MutationObserver(callback);  //observes mutation in browser DOM and when DOM changes, it runs the callback function.

    const config = { childList: true }; //observes and informs when new child nodes are added to the parent node.

    observer.observe(parent, config); //here it is made to observe the dom

    chrome.runtime.onMessage.addListener(function ( //receives message from background script
      request,
      sender,
      sendResponse
    ) {
      console.log(`📥 Received response: ${request.filtered.length} filtered posts, hasFiltersChanged: ${request.hasFiltersChanged}`);
      let arr = request.filtered; //the filtered array from background script.
      let hasFiltersChanged = request.hasFiltersChanged;
      
      let i = 0;
      let postArr = Array.from(posts); //posts is a nodelist so cannot use .filter directly, need to convert it to array first.
      
      try {
        if (hasFiltersChanged) {
          console.log("🔄 Processing all posts (filters changed)");
          // Process all posts (existing logic)
          postArr = postArr.filter((post, index) => {
            if (i >= arr.length || arr[i].index !== index) {
              posts[index].remove();
              return false;
            } else {
              i++;
              return true;
            }
          });
        } else {
          console.log(`🎯 Processing incremental posts from index ${lastPost ? lastPost.index + 1 : 0}`);
          // Process only from lastIndex + 1 to end
          let startIndex = lastPost ? lastPost.index + 1 : 0;
          
          for (let index = startIndex; index < postArr.length; index++) {
            if (i >= arr.length || arr[i].index !== index) {
              posts[index].remove();
              postArr[index] = null; // Mark as removed
            } else {
              i++;
            }
          }
          
          // Clean up null entries
          postArr = postArr.filter(post => post !== null);
        }
        
        // Update lastPost to track the last visible post
        if (posts.length > 0) {
          // Find the last visible post in the DOM
          let newLastIndex = posts.length - 1;
          while (newLastIndex >= 0 && !document.contains(posts[newLastIndex])) {
            newLastIndex--; // Skip removed posts
          }
          
          if (newLastIndex >= 0) {
            lastPost = {
              index: newLastIndex,
              text: textIncludesKeyword(posts[newLastIndex].textContent)
            };
            console.log(`📍 Updated lastPost to index ${newLastIndex}`);
          } else {
            // All posts were removed
            lastPost = null;
          }
        } else {
          lastPost = null;
        }
        
        console.log(`✅ Final visible posts: ${postArr.length}`);
      } catch (error) {
        console.error("[VibeFilter ERROR] Post filtering failed:", error);
      }
    });
  } else {
    console.log("⏳ Waiting for LinkedIn content container...");
  }
}, 500); // Check every 500ms
