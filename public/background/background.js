let postArr = [];
let includeArr = [];
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
    } else if (request.arr) {
                                                                         // console.log(senderTabId);
      postArr = request.arr;
      let tempArr = postArr;
      console.log("3", tempArr);
      tempArr = includeFilter(tempArr, senderTabId);
      console.log("4", tempArr);
    }
    return false;
  });
} catch (error) {
  console.log("error in onMessage in background.js: " + error);
}
