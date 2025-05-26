let postArr = [];
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
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    senderTabId = sender.tab ? sender.tab.id : senderTabId; //tab id of current tab
    let tempArr = postArr;  // current posts stored in temp array that will be used by all the if conditions so that there is no need of creating separate temp for each and then merging their results.
    if (request.include) { //checks if the popup sent include filters
      let temp = request.include;
      includeArr = temp;
      tempArr = includeFilter(tempArr, senderTabId);  //function to filter the current array for include filters
      console.log("include:", includeArr, tempArr);
    }
    if (request.notInclude) { //checks if the popup sent notInclude filters
      let temp = request.notInclude;
      notIncludeArr = temp;
      tempArr = notIncludeFilter(tempArr, senderTabId);  //function to filter the current array for notInclude filters
      console.log("notInclude:", notIncludeArr, tempArr);
    }
    if (request.eitherOr) { //checks if the popup sent either or filters
      let temp = request.eitherOr;
      eitherOrArr = temp;
      tempArr = eitherOrFilter(tempArr, senderTabId);  //function to filter the current array for eitherOr filters
      console.log("either or:", eitherOrArr, tempArr);
    }
    if (request.arr) {  // checks if the content script sent new post array(it sends the array only when dom changes)
      postArr = request.arr;  //updates the new post array
      tempArr = postArr;
      console.log("tempArr:", tempArr);
      //runs all the filter functions on the updated array 
      if (includeArr.length) tempArr = includeFilter(tempArr, senderTabId); 
      if (notIncludeArr.length) tempArr = notIncludeFilter(tempArr, senderTabId);
      if (eitherOrArr.length) tempArr = eitherOrFilter(tempArr, senderTabId);
    }
    try {
      //console.log("final tempArr:", tempArr);
      console.log(senderTabId);
      if (senderTabId && postArr.length) {
        console.log("ye hai postArr aur tempArr", postArr, tempArr);
        chrome.tabs.sendMessage(senderTabId, { //sends the filtered array to the content script of that particular tab (likedIn search tab)
          filtered: tempArr,  
        });
      }
    } catch (error) {
      console.log("error in notIncludeFilter sendMessage: " + error);
    }
    return false; //return true tells the browser: “Wait, I’ll respond later.” Without it, the browser thinks you're done and closes the channel too early.
    //false	Sending response immediately.	"I’ve responded. You can close the message channel now."
  });
} catch (error) {
  console.log("error in onMessage in background.js: " + error);
}
