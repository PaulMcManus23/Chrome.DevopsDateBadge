// VARIABLES ****************************************************************************************************************************************
const dateFieldName = "Committed Date"; // shown on the card
const redThreshold = 20; // number of days to show the badge as red from
const orangeThreshold = 10; // number of days to show the badge as orange from

const dateSplitter = "/"; // could be - or . depending on your culture formatting
const datePartYearIndex = 2; // AU is DD/MM/YYYY = index 2, US is MM/DD/YYYY = index of 2
const datePartMonthIndex = 1; // AU is DD/MM/YYYY = index 1, US is MM/DD/YYYY = index of 0
const datePartDayIndex = 0; // AU is DD/MM/YYYY = index 0, US is MM/DD/YYYY = index of 1

// css colours for the different levels
const greenColour = "green";
const redColour = "red";
const orangeColour = "orange";

// ****************************************************************************************************************************************

function execute () {
   const hubMode = document.querySelectorAll("div.kanban-board-column").length !== 0;

   // Get all the divs on the page
   var committedDateDivs = getCommittedDateDivs(hubMode);
   // console.log(committedDateDivs.length);

   var today = new Date();

   // Loop though all the divs
   for(var i = 0; i < committedDateDivs.length; i++){
      var committedDate = committedDateDivs[i];

      if (committedDate.innerText) {
         processBadge(committedDate, today, hubMode);
      }
   }
}

function getCommittedDateDivs(hubMode) {

   if (hubMode) {
      var fields = document.querySelectorAll('div.kanban-board-column div.field-container div.label.text-ellipsis');
      var committedDateDivs = [];

      fields.forEach(element => {
         if (element.innerText === dateFieldName) {
            committedDateDivs.push(element.nextSibling);
         }
      });
      return committedDateDivs;
   } else {
      return document.querySelectorAll('div.additional-field[field*="' + dateFieldName.replace(/\s/g, '') + '"] .field-inner-element');
   }
}

function processBadge(committedDate, today, hubMode) {

   var existingBadge = null;
   if (committedDate.nextSibling && committedDate.nextSibling.className === "sensei-date-badge") {
      existingBadge = committedDate.nextSibling;
   }

   var parts = committedDate.innerText.split(dateSplitter);
   var date = new Date(parseInt(parts[datePartYearIndex], 10), parseInt(parts[datePartMonthIndex], 10) - 1, parseInt(parts[datePartDayIndex], 10));
   var differenceInTime = date.getTime() - today.getTime();
   var differenceinDays = 0 - (differenceInTime / (1000 * 3600 * 24));

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
   icon.style.color = greenColour;
   icon.style.marginRight = "2px";

   if (differenceinDays > redThreshold) {
      icon.style.color = redColour;
   } else if (differenceinDays > orangeThreshold) {
      icon.style.color = orangeColour;
   }

   daysOldNode.append(icon);
   daysOldNode.append(differenceinDays.toFixed());

   committedDate.after(daysOldNode);
}

setInterval(() => {
   execute();
}, 5000);