# Quick Test: Verify Extension Save is Working

## After the Fix

The backend code has been fixed. The backend should auto-reload. Now test:

### Step 1: Verify Backend Reloaded
1. Check the backend terminal (where `uv run main.py --reload` is running)
2. You should see: `INFO: Detected file change...` or similar reload message
3. If not, restart the backend

### Step 2: Test Saving a Page
1. Open: `https://en.wikipedia.org/wiki/Artificial_intelligence`
2. Click extension icon
3. Click **"Save Current Page"** (yellow button)
4. You should see: "Snapshot saved" and counter shows "1"
5. Click **"Save to SurfSense"** (green button)
6. You should see: "Save Job Started"

### Step 3: Check Backend Logs
In the backend terminal, you should see:
```
INFO: POST /api/v1/documents
INFO: 200 OK
```

### Step 4: Check Celery Worker Logs
In the Celery worker terminal, you should see:
```
[INFO] Task process_extension_document[...] received
[INFO] Starting processing of extension document from Artificial intelligence - Wikipedia
[INFO] Successfully processed extension document: ...
```

### Step 5: Wait and Check Dashboard
1. Wait 30-60 seconds (processing time)
2. Go to: `http://localhost:3000/dashboard`
3. Open your "Test" search space
4. Go to Documents
5. **Expected**: Document titled "Artificial intelligence - Wikipedia" should appear

## If Still Not Working

### Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Click "Save to SurfSense"
4. Look for any red errors

### Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Save to SurfSense"
4. Find request to `localhost:8000/api/v1/documents`
5. Check:
   - Status: Should be 200 or 201
   - Request Payload: Should have `document_type: "EXTENSION"`
   - Response: Should be `{"message": "Documents processed successfully"}`

### Check Search Space ID
The extension might be using the wrong search space ID. To find your search space ID:

```powershell
docker exec postgres-surfsense psql -U postgres -d surfsense -c "SELECT id, name FROM searchspaces;"
```

Then verify the extension is using the correct ID.

