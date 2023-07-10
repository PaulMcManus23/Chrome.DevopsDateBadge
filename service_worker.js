const MESSAGE_GETSETTINGS = "GetSettings";
const MESSAGE_SAVESETTINGS = "SaveSettings";
const KEY_SETTINGS = "ddbSettings";
const DEFAULT_SETTINGS = {
  dateFieldName: "Committed Date",
  redThreshold: 20,
  orangeThreshold: 10,
  dateSplitter: "/",
  datePartYearIndex: 2,
  datePartMonthIndex: 1,
  datePartDayIndex: 0,
  greenColour: "green",
  redColour: "red",
  orangeColour: "orange",
};

//ensure defaults are set
chrome.runtime.onInstalled.addListener(() => {
  //clear out settings in case something went bad
  //chrome.storage.sync.clear();

  getFromStorage(KEY_SETTINGS).then((data) => {
    if (!data || Object.keys(data).length === 0) {
      console.log("Setting default values");

      //create and save default settings
      saveToStorage(KEY_SETTINGS, DEFAULT_SETTINGS);
    }
  });
});

// Listen for messages from content scripts
// message format
// {
//     message: message
//     data: payload
// }
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.message) {
    case MESSAGE_GETSETTINGS: {
      getFromStorage(KEY_SETTINGS).then((value) => {
        sendResponse(value);
      });
      break;
    }
    case MESSAGE_SAVESETTINGS: {
      saveToStorage(KEY_SETTINGS, request.data).then(() => {
        sendResponse({ message: "OK" });
      });
      break;
    }
    default:
      throw new Error("Bad message: " + JSON.stringify(request));
  }
  return true;
});

//Storage functions
function getFromStorage(key) {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(key, (data) => {
      resolve(data[key]);
    });
  });
}

function saveToStorage(key, value) {
  var storageValue = {};
  storageValue[key] = value;

  return new Promise(function (resolve, reject) {
    chrome.storage.sync.set(storageValue, () => {
      resolve();
    });
  });
}
