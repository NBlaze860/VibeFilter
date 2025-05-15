let postArr = [];
let includeArr = [];
let notIncludeArr = [];
let eitherOrArr = [];
let senderTabId = null;
const includeFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      //  console.log(includeArr);
      for (let i = 0; i < includeArr.length; i++) {
        //console.log(!p.text.includes(includeArr[i]));
        if (!p.text.includes(includeArr[i])) {
          return false;
        }
      }
      return true;
    });
    try {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          filtered: arr,
        });
      }
    } catch (error) {
      console.log("error in includeFilter sendMessage: " + error);
    }
    return arr;
  } catch (error) {
    console.log("error in includeFilter function: " + error);
  }
};

const notIncludeFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      for (let i = 0; i < notIncludeArr.length; i++) {
        if (p.text.includes(notIncludeArr[i])) {
          return false;
        }
      }
      return true;
    });
    try {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          filtered: arr,
        });
      }
    } catch (error) {
      console.log("error in notIncludeFilter sendMessage: " + error);
    }
  } catch (error) {
    console.log("error in notIncludeFilter" + error);
  }
};

const eitherOrFilter = (arr, tabId) => {
  try {
    arr = arr.filter((p, index) => {
      let bool = false;
      for (let i = 0; i < eitherOrArr.length; i++) {
        if (p.text.includes(eitherOrArr[i])) {
          bool = true;
        }
      }
      return bool;
    });
    try {
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          filtered: arr,
        });
      }
    } catch (error) {
      console.log("error in eitheOrFilter sendMessage: " + error);
    }
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
    senderTabId = sender.tab ? sender.tab.id : senderTabId;
    if (request.inc) {
      // console.log(senderTabId);
      const temp = request.inc.toLowerCase();
      includeArr.push(temp);
      let tempArr = postArr;
      //console.log("1" ,tempArr);
      setTimeout(() => {
        // console.log(senderTabId);
        tempArr = includeFilter(tempArr, senderTabId);
        //console.log("2" ,tempArr);
      }, 500);
    }
    if (request.notInc) {
      let temp = request.notInc.toLowerCase();
      notIncludeArr.push(temp);
      let tempArr = postArr;
      tempArr = notIncludeFilter(tempArr, senderTabId);
    }
    if (request.eitherOr) {
      let temp = request.eitherOr.toLowerCase();
      eitherOrArr.push(temp);
      let tempArr = postArr;
      tempArr = eitherOrFilter(tempArr, senderTabId);
    }
    if (request.arr) {
      // console.log(senderTabId);
      postArr = request.arr;
      let tempArr = postArr;
      console.log("3", tempArr);
      
      if(includeArr.length) tempArr = includeFilter(tempArr, senderTabId);
      if(notIncludeArr.length) tempArr = notIncludeFilter(tempArr, senderTabId);
      if(eitherOrArr.length) tempArr = eitherOrFilter(tempArr, senderTabId);
      console.log("4", tempArr);
    }
    return false;
  });
} catch (error) {
  console.log("error in onMessage in background.js: " + error);
}
