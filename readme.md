# Azure Devops Date Badge - Chrome/Edge browser extension

Extension will need to be [side loaded](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) into your browser. 


## Configuration

Update the variables at the top of the content.js... for now.

```
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
```
