# Debugging Chrome Extension

## Common Issues and Solutions

### 1. "Failed to process screenshot" Error

**Symptoms:**
- Upload succeeds but processing fails
- No phone numbers extracted

**Possible Causes:**
1. OCR fails to extract text
2. Network error when calling backend
3. Backend processing error

**How to Debug:**
1. Open Chrome DevTools (Right-click extension → Inspect popup)
2. Check the Console tab for errors
3. Look for these console logs:
   - "Starting OCR for screenshot:"
   - "OCR completed. Extracted text length:"
   - "Sending process request to:"
   - "Process response status:"

**Solutions:**
- If OCR fails: The image might be too blurry or have no text
- If network fails: Check if backend is running on Render
- If backend fails: Check Render logs for errors

### 2. CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" error in console
- Requests fail with CORS policy error

**Solution:**
- Backend must allow Chrome extension origins
- Check that CORS is configured correctly in backend/index.js

### 3. OCR Not Working

**Symptoms:**
- Processing takes too long or fails
- No text extracted from images

**Possible Causes:**
1. Tesseract.js not loading properly
2. Image file too large
3. Image format not supported

**Solutions:**
- Check Chrome DevTools Network tab for Tesseract worker files
- Try smaller images (< 5MB)
- Use PNG or JPG format

### 4. Extension Not Loading

**Symptoms:**
- Extension icon doesn't appear
- Popup won't open

**Solutions:**
1. Check if build was successful: `npm run build`
2. Verify manifest.json is in dist folder
3. Check for errors in chrome://extensions/ page
4. Reload the extension in Chrome

## Checking Render Backend Logs

1. Go to Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for these patterns:
   - `POST /api/screenshots/upload` - Upload successful
   - `POST /api/screenshots/:id/process` - Processing request
   - Error messages with stack traces

## Testing the Extension

1. Build the extension: `cd frontend && npm run build`
2. Load in Chrome: chrome://extensions/ → Load unpacked → select `frontend/dist`
3. Click extension icon
4. Upload a test image with phone numbers
5. Watch the console for errors
6. Check Render logs for backend errors

## Next Steps After Errors

1. Check console logs for specific error messages
2. Try uploading a different image
3. Check Render backend logs
4. Verify network requests in DevTools Network tab
5. Test with a simple image first (one with clear text)
