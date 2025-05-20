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

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(filteredPosts);
//   let arr = request.filtered;
//   console.log(arr);
//   // filteredPosts = arr;
//   // let i = 0;
//   // let postArr = posts;
//   // postArr.filter((post, index) => {
//   //   if (i !== index) {
//   //     posts[index].remove();
//   //     return false;
//   //   } else {
//   //     i++;
//   //   }
//   // });
// });

const interval = setInterval(() => {
  const parent = document.querySelector(".scaffold-finite-scroll__content");

  if (parent) {
    console.log("Target element found:", parent);
    clearInterval(interval); // Stop checking once found

    const callback = (mutationList, observer) => {
      setTimeout(() => {
        posts = document.querySelectorAll("li.artdeco-card");
        filteredPosts = [];
        posts.forEach((post, i) => {
          const p = {
            index: i,
            text: textIncludesKeyword(post.textContent),
          };
          filteredPosts.push(p);
        });
        chrome.runtime.sendMessage({
          arr: filteredPosts,
        });
      }, "500");
    };

    observer = new MutationObserver(callback);

    const config = { childList: true };

    observer.observe(parent, config);

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      console.log("filtered posts:", filteredPosts);
      let arr = request.filtered;
      filteredPosts = arr;
      let i = 0;
      let postArr = Array.from(posts);
      //console.log(posts);
      try {
        postArr = postArr.filter((post, index = 0) => {
          if (i >= arr.length || arr[i].index !== index) {
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
