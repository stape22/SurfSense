# Quick Browser Extension Test Guide

## Test Setup (Do This First)

### Known Test Values:
- **Test URL**: `https://en.wikipedia.org/wiki/Artificial_intelligence`
- **Expected Title**: Contains "Artificial intelligence" or "Wikipedia"
- **Document Type**: `EXTENSION`
- **Backend URL**: `http://localhost:8000`
- **Frontend URL**: `http://localhost:3000`

---

## Quick Test Steps

### 1. Open Extension
- Click SurfSense extension icon
- **✅ PASS**: Popup opens
- **❌ FAIL**: No popup

### 2. Login
- Enter your email/password
- Click Login
- **✅ PASS**: See search space dropdown
- **❌ FAIL**: Login error

### 3. Select Search Space
- Choose a search space from dropdown
- **✅ PASS**: Search space name appears selected
- **❌ FAIL**: No search spaces (create one at localhost:3000/dashboard first)

### 4. Navigate to Test Page
- Open new tab
- Go to: `https://en.wikipedia.org/wiki/Artificial_intelligence`
- Wait for page to load
- **✅ PASS**: Wikipedia page loads
- **❌ FAIL**: Page doesn't load

### 5. Capture Snapshot
- Click extension icon
- Click "Save Snapshot" or similar button
- **✅ PASS**: See "Snapshot saved" message
- **❌ FAIL**: Error message

### 6. Send to Backend
- In extension popup, click "Save" or "Send to SurfSense"
- **✅ PASS**: See "Save Job Started" message
- **❌ FAIL**: Error saving

### 7. Verify in API (30 seconds wait)
- Open: `http://localhost:8000/docs`
- Find: `GET /api/v1/documents`
- Click "Try it out"
- Add your auth token (get from browser DevTools → Application → Local Storage)
- Click "Execute"
- **✅ PASS**: See document with `document_type: "EXTENSION"` and URL matching test URL
- **❌ FAIL**: No document found or wrong type

### 8. Verify in Dashboard
- Go to: `http://localhost:3000/dashboard`
- Open your search space
- Go to Documents
- **✅ PASS**: See document titled "Artificial intelligence - Wikipedia" with type "EXTENSION"
- **❌ FAIL**: Document not found

---

## Success = All 8 Steps Pass ✅

## Failure = Any Step Fails ❌

---

## Quick Troubleshooting

**Extension not working?**
- Check `chrome://extensions/` - is it enabled?
- Check browser console (F12) for errors

**Can't login?**
- Verify backend running: `http://localhost:8000/`
- Check network tab for API errors

**No search spaces?**
- Create one at `http://localhost:3000/dashboard`
- Refresh extension

**Document not appearing?**
- Wait 30 seconds (processing time)
- Check Celery worker is running
- Verify in API first (`/api/v1/documents`)

