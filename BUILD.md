# DevOps Date Badge Chrome Extension

A Chrome extension that displays age badges on Azure DevOps boards, showing how many days old items are based on configured date fields.

## Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

This build now packages a complete extension into `dist/` (manifest, background/content scripts, icons, and popup assets).

3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` directory

### Development

For development with hot reload:
```bash
npm run dev
```

This will start a Vite dev server. Changes to React components will hot-reload (but extension reloading may still be required for manifest/content script changes).

## Features

- **Multiple Field Configurations**: Configure multiple date fields to work across different boards simultaneously
- **Flexible Date Formats**: Supports various date formats (dd/mm/yyyy, yyyy-mm-dd, etc.)
- **Color-Coded Thresholds**: Customize colors and day thresholds for visual age indicators
- **React + Tailwind CSS**: Modern, responsive settings UI
- **Backward Compatible**: Automatically converts old single-field settings to multi-field format

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Chrome Extensions API**: Browser integration

## Project Structure

```
src/
├── main.jsx           # React app entry point
├── App.jsx            # Main settings component
├── components/        # React components
│   └── FieldConfig.jsx
├── utils/            # Utility functions
│   └── dateFormat.js
├── index.css         # Tailwind CSS imports
└── popup.html        # HTML template for popup

dist/               # Build output (generated)
```

## Build Output

After running `npm run build`, `dist/` is a fully loadable unpacked extension folder.
