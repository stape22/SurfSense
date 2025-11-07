# Browser Extension Save Test - Step by Step

## Prerequisites Check

Before testing, make sure:

1. ✅ **Backend is running** on `http://localhost:8000`
2. ✅ **Frontend is running** on `http://localhost:3000`
3. ✅ **Celery worker is running** (needed to process documents)
4. ✅ **Extension is built and loaded** in Chrome

## Step-by-Step Test

### Step 1: Build and Load Extension

1. **Build the extension:**
   ```bash
   cd surfsense_browser_extension
   pnpm dev
   ```
   Wait for it to finish building (look for "Build complete" or similar)

2. **Load extension in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Navigate to: `D:\Projects\SurfSense\surfsense_browser_extension\build\chrome-mv3-dev`
   - Click "Select Folder"

3. **Verify extension loaded:**
   - You should see "SurfSense" extension in the list
   - Make sure it's enabled (toggle should be ON)

### Step 2: Configure Extension

1. **Get your API Key (JWT token):**
   - Open `http://localhost:3000` in a new tab
   - Login with your credentials
   - Press `F12` to open DevTools
   - Go to **Console** tab
   - Type: `localStorage.getItem('surfsense_bearer_token')`
   - Copy the token (long string)

2. **Enter API Key in Extension:**
   - Click the SurfSense extension icon in Chrome toolbar
   - Paste the token into "API Key" field
   - Click "Connect"
   - You should see search spaces listed

3. **Select a Search Space:**
   - Use the dropdown to select your test search space
   - Make sure it's selected (you should see the space name)

### Step 3: Capture and Save a Page

1. **Navigate to a test page:**
   - Open a new tab
   - Go to: `https://en.wikipedia.org/wiki/Test`
   - Wait for page to fully load

2. **Open Extension Popup:**
   - Click the SurfSense extension icon
   - You should see:
     - Selected search space name
     - "Save Snapshot" button
     - "Save to SurfSense" button
     - Number of captured pages (should show "0" initially)

3. **Capture the Page (IMPORTANT - Do this FIRST):**
   - Click **"Save Snapshot"** button
   - You should see a toast: "Snapshot saved" with page title
   - The page count should increase (e.g., "1 page captured")

4. **Save to SurfSense:**
   - Click **"Save to SurfSense"** button
   - You should see toast: "Save job running"
   - Then: "Save Job Started"

### Step 4: Verify in Dashboard

1. **Check Dashboard:**
   - Go to `http://localhost:3000`
   - Navigate to your search space
   - Go to "Documents" tab
   - Look for a new document with:
     - **Type:** "EXTENSION" (not "File")
     - **Title:** Should contain the Wikipedia page title
     - **Created At:** Should be recent (just now)

2. **If document appears:**
   - ✅ **SUCCESS!** Extension is working
   - Click on the document to view details

3. **If document doesn't appear:**
   - Continue to troubleshooting below

## Troubleshooting

### Issue 1: Extension Shows "No captured pages"

**Symptom:** After clicking "Save Snapshot", the page count stays at 0

**Solution:**
- Make sure you're on the actual page (not extension popup) when clicking "Save Snapshot"
- Check browser console (F12) for errors
- Try refreshing the page and capturing again
- Check if extension has proper permissions (should have "activeTab" permission)

### Issue 2: "Save to SurfSense" Button Does Nothing

**Symptom:** Clicking "Save to SurfSense" shows no response or error

**Check:**
1. Open extension popup
2. Press `F12` (DevTools should open)
3. Go to **Console** tab
4. Click "Save to SurfSense" again
5. Look for error messages

**Common errors:**
- `No captured pages found` → You didn't click "Save Snapshot" first
- `Not authenticated` → API key is missing or invalid
- `No search space selected` → Select a search space from dropdown
- `Failed to fetch` → Backend is not running or URL is wrong

### Issue 3: API Call Fails

**Symptom:** Network tab shows failed request to `/api/v1/documents`

**Check:**
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Save to SurfSense"
4. Look for POST request to `/api/v1/documents`

**If request shows 401 (Unauthorized):**
- Token expired or invalid
- Get new token from `localStorage.getItem('surfsense_bearer_token')`
- Re-enter in extension

**If request shows 400 (Bad Request):**
- Check the response body for error details
- Common: Missing `pageContent` or invalid metadata

**If request shows 500 (Server Error):**
- Check backend terminal for errors
- Check Celery worker terminal for processing errors

### Issue 4: Document Saved but Not Appearing

**Symptom:** Extension shows "Save Job Started" but document doesn't appear in dashboard

**Check:**
1. **Backend logs:**
   - Check backend terminal for: `"Documents processed successfully"`
   - Look for any errors

2. **Celery worker:**
   - Check Celery worker terminal
   - Should see: `process_extension_document` task starting
   - Look for errors or exceptions

3. **Database:**
   ```sql
   SELECT id, title, document_type, created_at 
   FROM documents 
   WHERE document_type = 'EXTENSION' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   - If documents exist but not showing, might be a frontend filtering issue

4. **Task logs:**
   ```sql
   SELECT level, message, log_metadata, created_at 
   FROM logs 
   WHERE source = 'document_processor' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```
   - Check for errors in processing

### Issue 5: Extension Console Errors

**Check Extension Background Script:**
1. Go to `chrome://extensions/`
2. Find SurfSense extension
3. Click "service worker" or "background page" link
4. Check console for errors

**Common errors:**
- `PLASMO_PUBLIC_BACKEND_URL is not set` → Check `.env` file in extension directory
- `Failed to fetch` → Backend URL incorrect or backend not running
- Syntax errors → Rebuild extension

## Debug Commands

### Check Extension Storage
Open browser console on any page:
```javascript
chrome.storage.local.get(null, console.log)
```

### Check Webhistory Specifically
```javascript
chrome.storage.local.get('webhistory', (data) => {
  console.log('Webhistory:', data);
  if (data.webhistory && data.webhistory[0]) {
    console.log('First tab history:', data.webhistory[0].tabHistory);
  }
});
```

### Check Search Space ID
```javascript
chrome.storage.local.get('search_space_id', console.log)
```

### Check Token
```javascript
chrome.storage.local.get('token', console.log)
```

## Expected Behavior

When working correctly:

1. ✅ Extension popup opens without errors
2. ✅ Search spaces load and can be selected
3. ✅ "Save Snapshot" captures current page
4. ✅ Page count increases after snapshot
5. ✅ "Save to SurfSense" sends data to backend
6. ✅ Backend returns "Documents processed successfully"
7. ✅ Celery worker processes the document
8. ✅ Document appears in dashboard as type "EXTENSION"
9. ✅ Document has correct title, URL, and content

## Still Not Working?

If you've tried all the above:

1. **Check all services are running:**
   - Backend: `http://localhost:8000/` should show API info
   - Frontend: `http://localhost:3000` should load
   - Celery: Check terminal for worker process

2. **Rebuild extension:**
   ```bash
   cd surfsense_browser_extension
   rm -rf build .plasmo node_modules/.cache
   pnpm dev
   ```

3. **Check extension logs:**
   - Background script console (via chrome://extensions/)
   - Popup console (F12 when popup is open)
   - Content script console (F12 on any page)

4. **Share error details:**
   - Screenshot of console errors
   - Network tab showing API request/response
   - Backend terminal errors
   - Celery worker terminal errors

