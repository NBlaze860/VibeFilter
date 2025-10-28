/* 
 * ⚠️ TEMPORARY FIX FOR SERVICE WORKER LIFECYCLE ISSUE
 * 
 * PROBLEM: In Manifest V3, service workers terminate after ~30 seconds of inactivity.
 * When terminated, all in-memory state (filter arrays) is lost, causing filtering to stop.
 * Opening the popup reloads filters, which is why filtering resumes.
 * 
 * SOLUTION: Load filters from chrome.storage on every message to survive worker restarts.
 * 
 * TODO: Refactor to use proper storage-backed state management or move filtering to content script.
 */

let originalPosts = []; // Complete history of all posts
let newPosts = []; // Latest batch only
let includeArr = [];
let notIncludeArr = [];
let eitherOrArr = [];
let senderTabId = null;

// TEMPORARY FIX: Load filters from storage to survive service worker restarts
async function loadFiltersFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['includeFilters', 'notIncludeFilters', 'eitherOrFilters'], (result) => {
      includeArr = result.includeFilters || [];
      notIncludeArr = result.notIncludeFilters || [];
      eitherOrArr = result.eitherOrFilters || [];
      console.log(`📂 Loaded filters from storage: include=${includeArr.length}, notInclude=${notIncludeArr.length}, eitherOr=${eitherOrArr.length}`);
      resolve();
    });
  });
}
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
    console.error("[VibeFilter ERROR] eitherOrFilter failed:", error);
    return arr; // Return original array on error
  }
};

try {
  console.log("🚀 Background script initialized");
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    // TEMPORARY FIX: Make listener async to load filters before processing
    (async () => {
      try {
        senderTabId = sender.tab ? sender.tab.id : senderTabId; //tab id of current tab
        
        // TEMPORARY FIX: Always load filters from storage before processing (survives worker restart)
        await loadFiltersFromStorage();
      
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
        console.error("[VibeFilter ERROR] Failed to send new posts response:", error);
      }
      return false;
    }
    
    // Check if filters actually changed by comparing with current arrays
    let hasFiltersActuallyChanged = false;
    
    if (request.include && JSON.stringify(request.include) !== JSON.stringify(includeArr)) {
      includeArr = request.include;
      hasFiltersActuallyChanged = true;
      console.log(`🔧 Include filters changed: [${includeArr.join(', ')}]`);
    }
    
    if (request.notInclude && JSON.stringify(request.notInclude) !== JSON.stringify(notIncludeArr)) {
      notIncludeArr = request.notInclude;
      hasFiltersActuallyChanged = true;
      console.log(`🔧 NotInclude filters changed: [${notIncludeArr.join(', ')}]`);
    }
    
    if (request.eitherOr && JSON.stringify(request.eitherOr) !== JSON.stringify(eitherOrArr)) {
      eitherOrArr = request.eitherOr;
      hasFiltersActuallyChanged = true;
      console.log(`🔧 EitherOr filters changed: [${eitherOrArr.join(', ')}]`);
    }
    
    // Only re-filter all posts if filters actually changed
    if (hasFiltersActuallyChanged) {
      console.log(`🔄 Filter change detected - re-filtering all ${originalPosts.length} posts`);
      let tempArr = originalPosts.slice(); // Start with all original posts
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
        console.error("[VibeFilter ERROR] Failed to send filter change response:", error);
      }
      return false;
    }
    } catch (error) {
      console.error("[VibeFilter ERROR] Message listener failed:", error);
    //return true tells the browser: "Wait, I'll respond later." Without it, the browser thinks you're done and closes the channel too early.
    //false	Sending response immediately.	"I've responded. You can close the message channel now."
      return false;
    }
    })(); // End async IIFE
    
    return false;
  });
} catch (error) {
  console.error("[VibeFilter ERROR] Background script initialization failed:", error);
}
