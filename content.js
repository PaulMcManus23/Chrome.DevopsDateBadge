// CONSTANTS ****************************************************************************************************************************************
const MESSAGE_GETSETTINGS = "GetSettings";
const MESSAGE_SAVESETTINGS = "SaveSettings";

// ****************************************************************************************************************************************

function execute() {
  const hubMode = document.querySelectorAll("div.kanban-board-column").length !== 0;

  chrome.runtime.sendMessage({ message: MESSAGE_GETSETTINGS }, (settings) => {
    // Get all the divs on the page
    var committedDateDivs = getCommittedDateDivs(hubMode, settings);
    // console.log(committedDateDivs.length);

    var today = new Date();

    // Loop though all the divs
    for (var i = 0; i < committedDateDivs.length; i++) {
      var committedDate = committedDateDivs[i];

      if (committedDate.innerText) {
        processBadge(committedDate, today, hubMode, settings);
      }
    }
  });
}

function getCommittedDateDivs(hubMode, settings) {
  if (hubMode) {
    var fields = document.querySelectorAll(
      "div.kanban-board-column div.field-container div.label.text-ellipsis"
    );
    var committedDateDivs = [];

    fields.forEach((element) => {
      if (element.innerText === settings.dateFieldName) {
        committedDateDivs.push(element.nextSibling);
      }
    });
    return committedDateDivs;
  } else {
    return document.querySelectorAll(
      'div.additional-field[field*="' +
        settings.dateFieldName.replace(/\s/g, "") +
        '"] .field-inner-element'
    );
  }
}

function processBadge(committedDate, today, hubMode, settings) {
  var existingBadge = null;
  if (
    committedDate.nextSibling &&
    committedDate.nextSibling.className === "sensei-date-badge"
  ) {
    existingBadge = committedDate.nextSibling;
  }

  var parts = committedDate.innerText.split(settings.dateSplitter);
  var date = new Date(
    parseInt(parts[settings.datePartYearIndex], 10),
    parseInt(parts[settings.datePartMonthIndex], 10) - 1,
    parseInt(parts[settings.datePartDayIndex], 10)
  );
  var differenceInTime = date.getTime() - today.getTime();
  var differenceinDays = 0 - differenceInTime / (1000 * 3600 * 24);

  if (existingBadge && existingBadge.innerText === differenceinDays.toFixed()) {
    return;
  } else if (existingBadge) {
    committedDate.parentNode.removeChild(existingBadge);
  }

  var daysOldNode = document.createElement("div");
  daysOldNode.className = "sensei-date-badge";
  daysOldNode.title = "Days Old";
  daysOldNode.style.position = "absolute";
  daysOldNode.style.right = "5px";
  daysOldNode.style.width = "35px";
  if (!hubMode) {
    daysOldNode.style.marginTop = "-22px";
  }

  var icon = document.createElement("i");
  icon.className = "bowtie-icon bowtie-status-waiting";
  icon.style.color = settings.greenColour;
  icon.style.marginRight = "2px";

  if (differenceinDays > settings.redThreshold) {
    icon.style.color = settings.redColour;
  } else if (differenceinDays > settings.orangeThreshold) {
    icon.style.color = settings.orangeColour;
  }

  daysOldNode.append(icon);
  daysOldNode.append(differenceinDays.toFixed());

  committedDate.after(daysOldNode);
}

setInterval(() => {
  execute();
}, 5000);