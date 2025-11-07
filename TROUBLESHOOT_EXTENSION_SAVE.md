# Troubleshooting: Browser Extension Not Saving Documents

## Problem
Extension shows "Save Job Started" but documents don't appear in the dashboard.

## Quick Checks

### 1. Verify Celery Worker is Running
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "python"} | Where-Object {$_.CommandLine -like "*celery*worker*"}
```
✅ Should show at least one Celery worker process

### 2. Check Backend API Logs
Look at the terminal where you started the backend (`uv run main.py --reload`). When you click "Save to SurfSense", you should see:
- A POST request to `/api/v1/documents`
- Response: `{"message": "Documents processed successfully"}`

### 3. Check Celery Worker Logs
Look at the terminal where Celery worker is running. You should see:
- Task received: `process_extension_document`
- Task processing messages
- Success or error messages

### 4. Check Browser Console
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Click "Save to SurfSense" in extension
4. Look for any red errors

### 5. Check Network Requests
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Click "Save to SurfSense" in extension
4. Look for request to `http://localhost:8000/api/v1/documents`
5. Check:
   - Status code (should be 200 or 201)
   - Request payload (should have `document_type: "EXTENSION"`)
   - Response body

## Common Issues

### Issue 1: Celery Worker Not Processing Tasks

**Symptoms:**
- Backend receives request successfully
- No errors in backend logs
- Documents never appear

**Solution:**
1. Check Celery worker is running (see step 1 above)
2. Restart Celery worker:
   ```powershell
   # Stop existing workers
   Get-Process | Where-Object {$_.CommandLine -like "*celery*worker*"} | Stop-Process -Force
   
   # Start new worker
   cd D:\Projects\SurfSense\surfsense_backend
   uv run celery -A celery_worker.celery_app worker --loglevel=info --concurrency=1 --pool=solo
   ```

### Issue 2: Authentication Token Invalid

**Symptoms:**
- Network request returns 401 Unauthorized
- Extension shows error

**Solution:**
1. Get fresh token from web dashboard (see HOW_TO_GET_API_KEY.md)
2. Update token in extension storage:
   - Open extension popup
   - Re-enter API key (JWT token)

### Issue 3: Wrong Search Space ID

**Symptoms:**
- Request succeeds but document goes to wrong space
- Or 404 error

**Solution:**
1. Verify search space ID in extension matches your "Test" space
2. Check search space ID in database:
   ```sql
   SELECT id, name FROM searchspaces;
   ```
3. Update extension to use correct search space ID

### Issue 4: Data Format Mismatch

**Symptoms:**
- Backend returns 422 Validation Error
- Error mentions "content" or "metadata" fields

**Solution:**
The extension should send:
```json
{
  "document_type": "EXTENSION",
  "content": [
    {
      "metadata": {
        "BrowsingSessionId": "...",
        "VisitedWebPageURL": "...",
        "VisitedWebPageTitle": "...",
        "VisitedWebPageDateWithTimeInISOString": "...",
        "VisitedWebPageReffererURL": "...",
        "VisitedWebPageVisitDurationInMilliseconds": "..."
      },
      "pageContent": "..."
    }
  ],
  "search_space_id": 1
}
```

### Issue 5: Document Processing Fails Silently

**Symptoms:**
- Task is queued but never completes
- No errors visible

**Solution:**
1. Check Celery worker logs for errors
2. Check database for failed tasks:
   ```sql
   SELECT * FROM logs WHERE level = 'ERROR' ORDER BY created_at DESC LIMIT 10;
   ```
3. Verify Redis is running and accessible

## Step-by-Step Debugging

### Step 1: Test API Endpoint Directly

Use curl or PowerShell to test the endpoint:

```powershell
# Get your JWT token first (from browser localStorage)
$token = "YOUR_JWT_TOKEN_HERE"
$searchSpaceId = 1  # Replace with your actual search space ID

$body = @{
    document_type = "EXTENSION"
    content = @(
        @{
            metadata = @{
                BrowsingSessionId = "test-session-123"
                VisitedWebPageURL = "https://en.wikipedia.org/wiki/Artificial_intelligence"
                VisitedWebPageTitle = "Artificial intelligence - Wikipedia"
                VisitedWebPageDateWithTimeInISOString = (Get-Date).ToUniversalTime().ToString("o")
                VisitedWebPageReffererURL = "START"
                VisitedWebPageVisitDurationInMilliseconds = "5000"
            }
            pageContent = "# Test Document`nThis is a test document from PowerShell."
        }
    )
    search_space_id = $searchSpaceId
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/documents" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

**Expected Response:**
```json
{
  "message": "Documents processed successfully"
}
```

### Step 2: Check if Document Was Created

Wait 10-30 seconds, then check:

```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

# Get documents
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/documents?search_space_id=1" `
    -Method GET `
    -Headers $headers
```

### Step 3: Check Celery Task Status

Look at Celery worker terminal output. You should see:
```
[INFO] Task process_extension_document[...] received
[INFO] Starting processing of extension document from ...
[INFO] Successfully processed extension document: ...
```

### Step 4: Check Database Directly

```powershell
# Connect to PostgreSQL
docker exec -it postgres-surfsense psql -U postgres -d surfsense

# Check documents
SELECT id, title, document_type, created_at FROM documents WHERE document_type = 'EXTENSION' ORDER BY created_at DESC LIMIT 5;

# Check logs
SELECT level, message, created_at FROM logs WHERE task_name = 'process_extension_document' ORDER BY created_at DESC LIMIT 10;
```

## Verification Checklist

After trying to save a page:

- [ ] Backend receives POST request to `/api/v1/documents`
- [ ] Backend returns success response
- [ ] Celery worker receives task
- [ ] Celery worker processes task without errors
- [ ] Document appears in database
- [ ] Document appears in frontend dashboard

## Still Not Working?

1. **Check all service logs:**
   - Backend server logs
   - Celery worker logs
   - Celery beat logs

2. **Verify all services are running:**
   - Backend: `http://localhost:8000/`
   - Redis: `docker ps | findstr redis`
   - PostgreSQL: `docker ps | findstr postgres`
   - Celery worker: Check processes

3. **Check extension storage:**
   - Open extension popup
   - Open DevTools (F12) → Application → Local Storage
   - Verify `token` and `search_space_id` are set correctly

4. **Try rebuilding extension:**
   ```powershell
   cd D:\Projects\SurfSense\surfsense_browser_extension
   pnpm build
   ```
   Then reload extension in browser

