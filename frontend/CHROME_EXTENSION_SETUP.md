# Chrome Extension Setup Guide

## Prerequisites
- Node.js installed on your system
- Chrome browser
- Your backend deployed on Render (https://leadcapture-module.onrender.com)

## Step-by-Step Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Build the Extension
```bash
npm run build
```
This will create a `dist` folder with all the extension files.

### 3. Update API URL in Config
Make sure your `frontend/src/config.js` has your Render backend URL:
```javascript
export const API_BASE_URL = 'https://leadcapture-module.onrender.com';
```

### 4. Build Again After Config Change
```bash
npm run build
```

### 5. Load Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`

2. Enable "Developer mode" (toggle in top-right corner)

3. Click "Load unpacked" button

4. Navigate to the `frontend/dist` folder and select it

5. The extension should now appear in your extensions list

### 6. Access Your Extension
- Click the extension icon in the Chrome toolbar
- The popup window will open with your dashboard

## Extension Features

- **Upload Screenshots**: Upload images containing phone numbers
- **View Phone Numbers**: See all extracted phone numbers
- **Export Data**: Export phone numbers to Excel
- **Statistics Dashboard**: View processing statistics

## Troubleshooting

### Extension not loading?
- Check if the `dist` folder was created after `npm run build`
- Verify `manifest.json` is in the `dist` folder
- Check the browser console for errors (Right-click extension → Inspect popup)

### API not working?
- Verify your Render backend is running
- Check the API URL in `config.js`
- Ensure CORS is properly configured on the backend

### Build errors?
- Delete `node_modules` and run `npm install` again
- Make sure you're in the `frontend` directory

## Files Created

- `manifest.json` - Extension configuration
- Updated `vite.config.js` - Build configuration for extension
- Updated `index.html` - Popup HTML with dimensions

## Notes

- The extension popup is set to 900x700 pixels
- All API calls go to your Render backend
- Data is stored in your MongoDB database on Render
- Screenshots are processed using OCR technology
