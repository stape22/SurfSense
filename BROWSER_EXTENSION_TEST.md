# Browser Extension Test Plan

## Prerequisites
- ✅ Browser extension installed and loaded
- ✅ Backend API running on `http://localhost:8000`
- ✅ Frontend running on `http://localhost:3000`
- ✅ User account created and logged in
- ✅ At least one Search Space created

## Test Variables (Known Values for Verification)

### Test URL
- **URL**: `https://en.wikipedia.org/wiki/Artificial_intelligence`
- **Expected Title**: "Artificial intelligence - Wikipedia"
- **Expected Content**: Should contain text about AI, machine learning, etc.

### Test Search Space
- **Name**: "Test Search Space" (or use existing one)
- **ID**: Will be retrieved from extension storage

### Expected Document Metadata
- **document_type**: `EXTENSION`
- **VisitedWebPageURL**: Should match the test URL
- **VisitedWebPageTitle**: Should contain "Artificial intelligence" or "Wikipedia"

---

## Step-by-Step Test Procedure

### Step 1: Verify Extension is Loaded
1. Open Chrome/Edge browser
2. Click the extension icon in the toolbar
3. **Expected Result**: Extension popup opens
4. **Verification**: You should see the SurfSense extension interface

**✅ PASS**: Extension popup opens  
**❌ FAIL**: No popup or error message

---

### Step 2: Login to Extension
1. In the extension popup, enter your credentials:
   - **Email**: (your registered email)
   - **Password**: (your password)
2. Click "Login" or "Sign In"
3. **Expected Result**: Success message and redirect to main interface
4. **Verification**: You should see a search space selector dropdown

**✅ PASS**: Login successful, search space selector appears  
**❌ FAIL**: Login fails or no search space selector

---

### Step 3: Select Search Space
1. Click the search space dropdown
2. Select a search space (create one if needed via web interface)
3. **Expected Result**: Selected search space name appears in dropdown
4. **Verification**: The dropdown shows your selected search space

**✅ PASS**: Search space selected and displayed  
**❌ FAIL**: No search spaces available or selection fails

**Note**: If no search spaces exist:
- Go to `http://localhost:3000/dashboard`
- Create a new search space named "Test Search Space"
- Return to extension and refresh

---

### Step 4: Navigate to Test Page
1. Open a new tab in your browser
2. Navigate to: `https://en.wikipedia.org/wiki/Artificial_intelligence`
3. Wait for page to fully load (5-10 seconds)
4. **Expected Result**: Wikipedia page about AI loads completely
5. **Verification**: Page title should be "Artificial intelligence - Wikipedia"

**✅ PASS**: Page loads successfully  
**❌ FAIL**: Page doesn't load or times out

---

### Step 5: Capture Current Page Snapshot
1. Click the SurfSense extension icon again
2. In the extension popup, look for a "Save Snapshot" or "Capture" button
3. Click the button to save the current page
4. **Expected Result**: Success toast notification appears
5. **Verification**: Message should say "Snapshot saved" or "Captured: Artificial intelligence - Wikipedia"

**✅ PASS**: Snapshot saved successfully with success message  
**❌ FAIL**: Error message or no response

---

### Step 6: Send Data to Backend
1. In the extension popup, look for a "Save" or "Send to SurfSense" button
2. Click the button to send captured data to backend
3. **Expected Result**: Success message "Save Job Started" or "Snapshot Saved Successfully"
4. **Verification**: Toast notification confirms save operation

**✅ PASS**: Data sent successfully  
**❌ FAIL**: Error message appears

---

### Step 7: Verify Data in Backend (API Check)
1. Open a new tab
2. Navigate to: `http://localhost:8000/docs`
3. Find the endpoint: `GET /api/v1/documents`
4. Click "Try it out"
5. Enter your authentication token (get from browser DevTools → Application → Local Storage → token)
6. Click "Execute"
7. **Expected Result**: JSON response containing documents
8. **Verification**: Look for a document with:
   - `document_type: "EXTENSION"`
   - `title` containing "Artificial intelligence" or "Wikipedia"
   - `metadata.VisitedWebPageURL` matching the test URL

**✅ PASS**: Document found in API response  
**❌ FAIL**: No document found or wrong document_type

---

### Step 8: Verify Data in Frontend Dashboard
1. Navigate to: `http://localhost:3000/dashboard`
2. Go to your selected search space
3. Click on "Documents" or navigate to documents list
4. **Expected Result**: List of documents including the saved page
5. **Verification**: Find document with:
   - Title containing "Artificial intelligence" or "Wikipedia"
   - Type: "EXTENSION"
   - URL matching the test URL

**✅ PASS**: Document visible in dashboard  
**❌ FAIL**: Document not found in dashboard

---

### Step 9: Verify Document Content
1. Click on the saved document in the dashboard
2. **Expected Result**: Document details page opens
3. **Verification**: Check that:
   - Document title is correct
   - URL metadata matches test URL
   - Content contains text about artificial intelligence
   - Document type is "EXTENSION"

**✅ PASS**: Document content is correct and complete  
**❌ FAIL**: Missing content or incorrect metadata

---

### Step 10: Test Search Functionality
1. In the dashboard, use the search function
2. Search for: "machine learning" or "neural networks"
3. **Expected Result**: Search results include the saved Wikipedia page
4. **Verification**: The document appears in search results

**✅ PASS**: Document found in search results  
**❌ FAIL**: Document not found in search

---

## Verification Checklist

After completing all steps, verify:

- [ ] Extension popup opens correctly
- [ ] Login works in extension
- [ ] Search space can be selected
- [ ] Snapshot capture works
- [ ] Data sends to backend successfully
- [ ] Document appears in API (`/api/v1/documents`)
- [ ] Document appears in frontend dashboard
- [ ] Document content is correct
- [ ] Document metadata is accurate
- [ ] Document is searchable

---

## Troubleshooting

### Extension Not Loading
- Check if extension is enabled in `chrome://extensions/`
- Verify extension is loaded from `build/chrome-mv3-prod` directory
- Check browser console for errors (F12 → Console)

### Login Fails
- Verify backend is running: `http://localhost:8000/`
- Check network tab in DevTools for API errors
- Verify credentials are correct

### Search Space Not Available
- Create a search space via web dashboard first
- Refresh extension popup
- Check backend API: `GET /api/v1/search-spaces/`

### Data Not Saving
- Check browser console (F12 → Console) for errors
- Verify backend is accessible: `http://localhost:8000/docs`
- Check network tab for failed API requests
- Verify authentication token is valid

### Document Not Appearing
- Wait 10-30 seconds for processing
- Check Celery worker is running
- Check backend logs for processing errors
- Verify document_type is "EXTENSION" in API response

---

## Expected API Response Format

When checking `/api/v1/documents`, you should see:

```json
{
  "items": [
    {
      "id": 123,
      "title": "Artificial intelligence - Wikipedia",
      "document_type": "EXTENSION",
      "metadata": {
        "VisitedWebPageURL": "https://en.wikipedia.org/wiki/Artificial_intelligence",
        "VisitedWebPageTitle": "Artificial intelligence - Wikipedia",
        "BrowsingSessionId": "...",
        "VisitedWebPageDateWithTimeInISOString": "2025-11-06T...",
        "VisitedWebPageReffererURL": "...",
        "VisitedWebPageVisitDurationInMilliseconds": "..."
      },
      "search_space_id": 1,
      "created_at": "2025-11-06T..."
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10,
  "pages": 1
}
```

---

## Success Criteria

**Test is considered PASSED if:**
1. ✅ Extension captures the Wikipedia page successfully
2. ✅ Data is sent to backend without errors
3. ✅ Document appears in API response with correct `document_type: "EXTENSION"`
4. ✅ Document appears in frontend dashboard
5. ✅ Document content and metadata are accurate
6. ✅ Document is searchable

**Test is considered FAILED if:**
- Any step fails with an error
- Document doesn't appear in backend or frontend
- Document metadata is incorrect
- Document type is not "EXTENSION"

---

## Notes

- The extension uses local storage to track browsing history
- Documents are processed asynchronously by Celery workers
- Processing may take 10-30 seconds depending on content size
- Check Celery worker logs if documents don't appear after saving

