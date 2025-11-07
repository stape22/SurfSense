# Quick Extension Diagnostic

## Most Common Issue: Two-Step Process

The extension requires **TWO steps** that many users miss:

1. **FIRST:** Click "Save Snapshot" (captures the page)
2. **THEN:** Click "Save to SurfSense" (sends to backend)

If you skip step 1, there's nothing to save!

## Quick Check

### 1. Is Extension Built and Loaded?

- Go to `chrome://extensions/`
- Find "SurfSense" extension
- Is it enabled? (toggle should be ON)
- Does it show any errors? (red error badge)

### 2. Is API Key Set?

- Click extension icon
- Do you see search spaces, or an API key form?
- If API key form: Enter your JWT token from `localStorage.getItem('surfsense_bearer_token')`

### 3. Is Search Space Selected?

- In extension popup, check the dropdown
- Is a search space selected? (should show name, not empty)

### 4. Test the Flow

1. Open Wikipedia: `https://en.wikipedia.org/wiki/Test`
2. Open extension popup
3. Click **"Save Snapshot"** ← IMPORTANT: Do this first!
4. Should see toast: "Snapshot saved"
5. Click **"Save to SurfSense"**
6. Should see toast: "Save Job Started"

### 5. Check Console for Errors

**Extension Popup Console:**
- Right-click extension icon → "Inspect popup"
- Go to Console tab
- Click "Save to SurfSense"
- Look for errors

**Background Script Console:**
- Go to `chrome://extensions/`
- Find SurfSense extension
- Click "service worker" or "background page"
- Check console for errors

**Network Tab:**
- Open DevTools (F12) on any page
- Go to Network tab
- Click "Save to SurfSense" in extension
- Look for POST request to `/api/v1/documents`
- Check status code and response

## Common Error Messages

| Error Message | Meaning | Solution |
|--------------|---------|----------|
| "No captured pages found" | Didn't click "Save Snapshot" first | Click "Save Snapshot" before "Save to SurfSense" |
| "Not authenticated" | API key missing/invalid | Re-enter JWT token from web dashboard |
| "No search space selected" | Dropdown is empty | Select a search space from dropdown |
| "Failed to fetch" | Backend not running or wrong URL | Check backend is running on port 8000 |
| 401 Unauthorized | Token expired | Get new token and re-enter |
| 400 Bad Request | Invalid data format | Check console for details |

## Quick Fixes

### Extension Not Loading?
```bash
cd surfsense_browser_extension
pnpm dev
# Wait for build to complete
# Then reload extension in chrome://extensions/
```

### API Key Issues?
1. Go to `http://localhost:3000`
2. Login
3. Open Console (F12)
4. Run: `localStorage.getItem('surfsense_bearer_token')`
5. Copy the token
6. Paste in extension API key field

### Backend Not Responding?
- Check backend is running: `http://localhost:8000/`
- Check Celery worker is running (should see process in terminal)
- Check `.env` file has correct `DATABASE_URL`

## Still Stuck?

Share these details:
1. Screenshot of extension popup
2. Console errors (from popup and background script)
3. Network tab showing API request (if any)
4. Backend terminal output
5. What happens when you click "Save Snapshot" and "Save to SurfSense"

