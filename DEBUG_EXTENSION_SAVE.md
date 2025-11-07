# Debugging Extension Save Issues

## Quick Checklist

1. **Check if webhistory has data**
   - Open extension popup
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `chrome.storage.local.get('webhistory', console.log)`
   - Check if `webhistory.webhistory` has entries with `tabHistory` arrays

2. **Check if search space is selected**
   - In extension popup, make sure a search space is selected
   - Check storage: `chrome.storage.local.get('search_space_id', console.log)`

3. **Check API call**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click "Save to SurfSense" in extension
   - Look for POST request to `/api/v1/documents`
   - Check response status and body

4. **Check backend logs**
   - Look at backend terminal for errors
   - Check Celery worker terminal for task processing errors

5. **Check if page was captured**
   - Before saving, click "Save Snapshot" button in extension
   - This should show a toast "Snapshot saved"
   - Then click "Save to SurfSense"

## Common Issues

### Issue 1: No webhistory data
**Symptom**: `webhistory.webhistory` is empty or `tabHistory` arrays are empty

**Solution**: 
- Make sure you clicked "Save Snapshot" first
- Navigate to the page you want to save
- Click "Save Snapshot" button in extension
- Then click "Save to SurfSense"

### Issue 2: API returns 401 (Unauthorized)
**Symptom**: Network tab shows 401 error

**Solution**:
- Check if token is valid: `chrome.storage.local.get('token', console.log)`
- Re-enter API key in extension settings
- Make sure backend is running

### Issue 3: API returns 400 (Bad Request)
**Symptom**: Network tab shows 400 error with validation details

**Solution**:
- Check the error message in Network tab response
- Common issues:
  - Missing `pageContent` field
  - Invalid metadata format
  - Missing search_space_id

### Issue 4: API succeeds but documents don't appear
**Symptom**: API returns 200 but no documents in dashboard

**Solution**:
- Check Celery worker is running
- Check Celery worker logs for errors
- Check database: `SELECT COUNT(*) FROM documents WHERE document_type = 'EXTENSION';`
- Check logs table: `SELECT * FROM logs WHERE source = 'document_processor' ORDER BY created_at DESC LIMIT 5;`

## Step-by-Step Test

1. **Open Wikipedia page** (e.g., https://en.wikipedia.org/wiki/Test)

2. **Open extension popup**

3. **Select a search space** (dropdown should show your spaces)

4. **Click "Save Snapshot"** button
   - Should see toast: "Snapshot saved"
   - Should see: "Captured: [Page Title]"

5. **Click "Save to SurfSense"** button
   - Should see toast: "Save job running"
   - Then: "Save Job Started"

6. **Check browser console** (F12 → Console)
   - Look for any errors
   - Check for "toSend" log with document data

7. **Check Network tab** (F12 → Network)
   - Find POST request to `/api/v1/documents`
   - Check status code (should be 200)
   - Check response body

8. **Check backend terminal**
   - Should see: "INFO: POST /api/v1/documents"
   - Should see: "Documents processed successfully"

9. **Check Celery worker terminal**
   - Should see task starting: "process_extension_document"
   - Should see task completion or errors

10. **Check frontend dashboard**
    - Go to your search space
    - Check Documents tab
    - Should see the Wikipedia page document

## Debug Commands

### Check extension storage
```javascript
// In browser console (on any page)
chrome.storage.local.get(null, console.log)
```

### Check webhistory specifically
```javascript
chrome.storage.local.get('webhistory', (data) => {
  console.log('Webhistory:', data);
  if (data.webhistory && data.webhistory[0]) {
    console.log('First tab history:', data.webhistory[0].tabHistory);
  }
});
```

### Check search space ID
```javascript
chrome.storage.local.get('search_space_id', console.log)
```

### Check token
```javascript
chrome.storage.local.get('token', console.log)
```

## Backend Database Checks

### Check if documents were created
```sql
SELECT id, title, document_type, created_at 
FROM documents 
WHERE document_type = 'EXTENSION' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check task logs
```sql
SELECT level, message, log_metadata, created_at 
FROM logs 
WHERE source = 'document_processor' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check for errors
```sql
SELECT level, message, log_metadata, created_at 
FROM logs 
WHERE level = 'ERROR' 
ORDER BY created_at DESC 
LIMIT 10;
```

