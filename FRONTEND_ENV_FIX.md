# Frontend Environment Variable Fix

## Problem
You're seeing "Failed to fetch" errors because the frontend can't connect to the backend. This is likely because the Next.js dev server needs to be restarted to pick up environment variables.

## Solution

### Step 1: Stop the Frontend Dev Server
1. Find the terminal window running `pnpm run dev` in the `surfsense_web` directory
2. Press `Ctrl+C` to stop it

### Step 2: Verify Environment Variables
Check that `surfsense_web/.env` contains:
```
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING
```

### Step 3: Restart the Frontend Dev Server
```powershell
cd surfsense_web
pnpm run dev
```

### Step 4: Clear Browser Cache (Optional)
If the issue persists:
1. Open your browser's Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

## Why This Happens
Next.js reads `NEXT_PUBLIC_*` environment variables when the dev server starts. If you:
- Created the `.env` file after starting the server
- Modified the `.env` file while the server was running
- Started the server before setting up environment variables

Then the server won't have the correct values and needs to be restarted.

## Verification
After restarting, check the browser console (F12). The improved error handling will now show:
- Whether the backend URL is configured
- Whether the backend is reachable
- More detailed error messages

If you still see errors, check:
1. Backend is running: `curl http://localhost:8000/`
2. Backend URL in browser console: Look for "Backend URL: undefined" or similar
3. Network tab in browser DevTools to see the actual request being made

