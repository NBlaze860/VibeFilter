console.log("starting content script...");

let posts = [];
let filteredPosts = [];

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
    console.log("Target element found:", parent);
    clearInterval(interval); // Stop checking once found

    const callback = (mutationList, observer) => {
      const currentURL = window.location.href;
      if (
        currentURL
          .toLowerCase()
          .includes("https://www.linkedin.com/search/results/content/")
      ) // to run the content script only when current tab is of the linkedIn post search 
        setTimeout(() => {
          try { //for the "show more results" button so that it gets clicked automatically without being clicked manually each time.
            const showMoreButton = document.querySelector(  
              ".scaffold-finite-scroll__load-button"
            );
            if (showMoreButton) {
              console.log("Button found:", showMoreButton);
              showMoreButton.click();
            }
          } catch (error) {
            console.log("error while finding show more button: " + error);
          }
          posts = document.querySelectorAll("li.artdeco-card"); // gets all the posts in the dom. When we scroll down to the bottom, 3 posts are added each time, each post is in a list "li" and these are all inside a div with a random class each time.
          filteredPosts = []; 
          posts.forEach((post, i) => {  //since posts is a NodeList with each node having a lot of data, we just need it's index and inner text.
            const p = {
              index: i,
              text: textIncludesKeyword(post.textContent),
            };
            filteredPosts.push(p);
          });
          chrome.runtime.sendMessage({  //sends message to background script.
            arr: filteredPosts, //sent to background script so that it can filter it and send it back.
          });
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
      console.log("current posts:", filteredPosts);
      console.log("filtered by background script: ", request.filtered);
      let arr = request.filtered; //the filtered array from background script.
      filteredPosts = arr;
      let i = 0;
      let postArr = Array.from(posts); //posts is a nodelist so cannot use .filter directly, need to convert it to array first.
      //console.log(posts);
      try {
        postArr = postArr.filter((post, index = 0) => {
          if (i >= arr.length || arr[i].index !== index) { //compares the current index of the posts array with the filtered list's current index and if not same, it removes element until the index are same or the filtered list is completely traversed.
            posts[index].remove();
            return false;
          } else {
            i++;
            return true;
          }
        });
        console.log("final posts: ", postArr);
      } catch (error) {
        console.log("error in content script onMessage: " + error);
      }
      console.log(postArr);
    });
  } else {
    console.log("Waiting for .scaffold-finite-scroll__content...");
  }
}, 500); // Check every 500ms
