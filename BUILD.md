# DevOps Date Badge Chrome Extension

A Chrome extension that displays age badges on Azure DevOps boards, showing how many days old items are based on configured date fields.

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

The build performs these steps:
- Type checks the TypeScript codebase
- Transpiles `src/content.ts` to root `content.js`
- Builds popup assets with Vite
- Packages a complete loadable extension into `dist/`

3. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist` directory

This also works in Edge using `edge://extensions/`.

### Development

Start popup development server:
```bash
npm run dev
```

Type check only:
```bash
npm run typecheck
```

Run unit tests:
```bash
npm test
```

## Features

- **Multiple Field Configurations**: Configure multiple date fields to work across different boards simultaneously
- **Shared Date Format and Colors**: Common format/colors across all field configurations
- **Per-Field Thresholds**: Each field defines its own orange/red thresholds
- **React + Tailwind + TypeScript**: Modern, typed settings UI and content logic
- **Backward Compatible**: Automatically converts old single-field settings to multi-field format

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool
- **TypeScript**: Type safety for popup and content logic
- **Tailwind CSS**: Styling
- **Chrome Extensions API**: Browser integration

## Project Structure

```
src/
├── main.tsx           # React app entry point
├── App.tsx            # Main settings component
├── content.ts         # Content script source
├── components/        # React components
│   └── FieldConfig.tsx
├── utils/            # Utility functions
│   └── dateFormat.ts
├── index.css         # Tailwind CSS imports

content.js            # Generated from src/content.ts
popup.html            # Popup host page
manifest.json         # Extension manifest
service_worker.js     # Background worker

dist/                # Packaged extension output (generated)
```

## Build Output

After running `npm run build`, `dist/` is a fully loadable unpacked extension folder.
