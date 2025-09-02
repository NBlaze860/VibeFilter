let originalPosts = []; // Complete history of all posts
let newPosts = []; // Latest batch only
let includeArr = [];
let notIncludeArr = [];
let eitherOrArr = [];
let senderTabId = null;
const includeFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      for (let i = 0; i < includeArr.length; i++) {
        if (!p.text.includes(includeArr[i])) {  //if the post doesnt have the any of the included keywords, then removes it. 
          return false;
        }
      }
      return true;
    });
    return arr;
  } catch (error) {
    console.log("error in includeFilter function: " + error);
  }
};

const notIncludeFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      for (let i = 0; i < notIncludeArr.length; i++) {
        if (p.text.includes(notIncludeArr[i])) {  //if a post has any of the notInclude keywords, it removes the post.
          return false;
        }
      }
      return true;
    });
    return arr;
  } catch (error) {
    console.log("error in notIncludeFilter" + error);
  }
};

const eitherOrFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      let bool = false;
      for (let i = 0; i < eitherOrArr.length; i++) {
        if (p.text.includes(eitherOrArr[i])) {  //if the post doesnt have any of the eitherOr keywords, remove it.
          bool = true;
        }
      }
      return bool;
    });
    return arr;
  } catch (error) {
    console.log("error in eitherOrFilter: " + error);
  }
};

try {
  console.log("🚀 Background script initialized");
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    senderTabId = sender.tab ? sender.tab.id : senderTabId; //tab id of current tab
    
    // Handle new posts from content script (DOM changes)
    if (request.newPosts) {
      console.log(`📥 Received ${request.newPosts.length} new posts`);
      // Append new posts to originalPosts
      originalPosts = originalPosts.concat(request.newPosts);
      newPosts = request.newPosts; // Store latest batch
      console.log(`📊 Total originalPosts: ${originalPosts.length}`);
      
      // Filter only the new posts
      let filteredNewPosts = newPosts;
      if (includeArr.length) filteredNewPosts = includeFilter(filteredNewPosts, senderTabId);
      if (notIncludeArr.length) filteredNewPosts = notIncludeFilter(filteredNewPosts, senderTabId);
      if (eitherOrArr.length) filteredNewPosts = eitherOrFilter(filteredNewPosts, senderTabId);
      
      console.log(`🎯 Filtered new posts: ${filteredNewPosts.length}/${newPosts.length}`);
      
      try {
        if (senderTabId) {
          chrome.tabs.sendMessage(senderTabId, {
            filtered: filteredNewPosts,
            hasFiltersChanged: false
          });
        }
      } catch (error) {
        console.log("error sending new posts response: " + error);
      }
      return false;
    }
    
    if (request.include) { //checks if the popup sent include filters
      let temp = request.include;
      includeArr = temp;
      console.log(`🔧 Include filters updated: [${includeArr.join(', ')}]`);
    }
    if (request.notInclude) { //checks if the popup sent notInclude filters
      let temp = request.notInclude;
      notIncludeArr = temp;
      console.log(`🔧 NotInclude filters updated: [${notIncludeArr.join(', ')}]`);
    }
    if (request.eitherOr) { //checks if the popup sent either or filters
      let temp = request.eitherOr;
      eitherOrArr = temp;
      console.log(`🔧 EitherOr filters updated: [${eitherOrArr.join(', ')}]`);
    }
    
    // Handle filter changes - need to re-filter all posts
    if (request.include || request.notInclude || request.eitherOr) {
      console.log(`🔄 Filter change detected - re-filtering all ${originalPosts.length} posts`);
      tempArr = originalPosts.slice(); // Start with all original posts
      if (includeArr.length) tempArr = includeFilter(tempArr, senderTabId);
      if (notIncludeArr.length) tempArr = notIncludeFilter(tempArr, senderTabId);
      if (eitherOrArr.length) tempArr = eitherOrFilter(tempArr, senderTabId);
      
      console.log(`🎯 Filter result: ${tempArr.length}/${originalPosts.length} posts passed`);
      
      try {
        if (senderTabId && originalPosts.length) {
          chrome.tabs.sendMessage(senderTabId, {
            filtered: tempArr,
            hasFiltersChanged: true
          });
        }
      } catch (error) {
        console.log("error sending filter change response: " + error);
      }
      return false;
    }
    

    return false; //return true tells the browser: “Wait, I’ll respond later.” Without it, the browser thinks you're done and closes the channel too early.
    //false	Sending response immediately.	"I’ve responded. You can close the message channel now."
  });
} catch (error) {
  console.log("error in onMessage in background.js: " + error);
}
