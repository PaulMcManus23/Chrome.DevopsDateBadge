# Azure Devops Date Badge - Chrome/Edge browser extension

Available in [MSEdge extension store](https://microsoftedge.microsoft.com/addons/detail/devops-date-diff-badge/pegeollldhaklallpoiepkeamihedefk)




Extension will need to be [side loaded](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading) into your browser.

## Side load (current workflow)

1. From the repo root, run:

```bash
npm install
npm run build
```

2. Open `chrome://extensions/` (or `edge://extensions/`) and enable Developer mode.
3. Click Load unpacked.
4. Select the `dist` folder.

`dist` now contains everything needed to load the extension:
- `manifest.json`
- `content.js`
- `service_worker.js`
- `lib/jquery.min.js`
- icons and popup assets


## Configuration

Toggle the extension so that it can be shown on the toolbar, then click on it to reveal the settings dialog.

NOTE: The default setting is for world date format, so if you have US dates going on in your DEVOPS you will probably want to change this straight away.
