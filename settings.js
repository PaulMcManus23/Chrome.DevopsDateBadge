const MESSAGE_GETSETTINGS = "GetSettings";
const MESSAGE_SAVESETTINGS = "SaveSettings";

document.addEventListener("DOMContentLoaded", function () {
  //get the current settings
  chrome.runtime.sendMessage({ message: MESSAGE_GETSETTINGS }, (settings) => {
    //load the settings into the UI

    document.getElementById("dateFieldName").value = settings.dateFieldName;

    console.log(
      encodeDateFormat(
        settings.dateSplitter,
        settings.datePartYearIndex,
        settings.datePartMonthIndex,
        settings.datePartDayIndex
      )
    );

    document.getElementById("formatSelect").value = encodeDateFormat(
      settings.dateSplitter,
      settings.datePartYearIndex,
      settings.datePartMonthIndex,
      settings.datePartDayIndex
    );

    document.getElementById("greenColour").value = settings.greenColour;
    document.getElementById("orangeThreshold").value = settings.orangeThreshold;
    document.getElementById("orangeColour").value = settings.orangeColour;
    document.getElementById("redThreshold").value = settings.redThreshold;
    document.getElementById("redColour").value = settings.redColour;
  });

  //attach to the cancel button
  document
    .getElementById("cancelButton")
    .addEventListener("click", function () {
      window.close();
    });

  //attach to the save button
  document.getElementById("saveButton").addEventListener("click", function () {
    var newSettings = {};

    newSettings.dateFieldName = document.getElementById("dateFieldName").value;
    newSettings.greenColour = document.getElementById("greenColour").value;
    newSettings.orangeThreshold = parseInt(
      document.getElementById("orangeThreshold").value,
      10
    );
    newSettings.orangeColour = document.getElementById("orangeColour").value;
    newSettings.redThreshold = parseInt(
      document.getElementById("redThreshold").value,
      10
    );
    newSettings.redColour = document.getElementById("redColour").value;

    //join the colour settings and the dateformat settings together
    newSettings = Object.assign(
      {},
      newSettings,
      decodeDateFormat(document.getElementById("formatSelect").value)
    );

    //send the settings to the backend to save to storage
    chrome.runtime.sendMessage(
      { message: MESSAGE_SAVESETTINGS, data: newSettings },
      () => {
        window.close();
      }
    );
  });
});

//generate dateformat string based on settings
function encodeDateFormat(
  dateSplitter,
  datePartYearIndex,
  datePartMonthIndex,
  datePartDayIndex
) {
  var dateFormatParts = ["", "", "", ""];
  dateFormatParts[datePartDayIndex] = "dd";
  dateFormatParts[datePartMonthIndex] = "mm";
  dateFormatParts[datePartYearIndex] = "yy";
  dateFormatParts.push(dateSplitter);

  return dateFormatParts.join("");
}

//get the settings from a dateformat string
function decodeDateFormat(format) {
  var decodedResult = {};
  decodedResult["dateSplitter"] = format.slice(-1);
  decodedResult["datePartYearIndex"] = (format.indexOf("yy") + 2) / 2 - 1;
  decodedResult["datePartMonthIndex"] = (format.indexOf("mm") + 2) / 2 - 1;
  decodedResult["datePartDayIndex"] = (format.indexOf("dd") + 2) / 2 - 1;

  return decodedResult;
}
