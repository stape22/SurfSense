# Fix "Failed to fetch" Error

## Quick Diagnosis

Open your browser console (F12 → Console) and look for:
- "Registration attempt:" or "Login attempt:" logs
- Check what `backendUrl` shows

## Solution Based on What You See

### If backendUrl shows "NOT SET" or undefined:

**You're running a production build without environment variables set.**

#### Option 1: Run in Development Mode (Recommended)

1. Stop the current frontend server (Ctrl+C)
2. Create `surfsense_web/.env` file:
   ```
   NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
   NEXT_PUBLIC_ETL_SERVICE=DOCLING
   ```
3. Run in development mode:
   ```powershell
   cd surfsense_web
   $env:PORT='4000'; pnpm run dev
   ```

#### Option 2: Rebuild Production with Environment Variables

1. Create `surfsense_web/.env` file (same as above)
2. Rebuild:
   ```powershell
   cd surfsense_web
   pnpm run build
   $env:PORT='4000'; pnpm start
   ```

### If backendUrl shows a URL but still fails:

**The backend isn't running or isn't accessible.**

1. Check if backend is running:
   ```powershell
   netstat -an | findstr ":8000"
   ```

2. If not running, start it:
   ```powershell
   cd surfsense_backend
   uv run main.py --reload
   ```

3. Test backend directly:
   - Open browser to: http://localhost:8000/
   - Should see JSON response

## Using the Startup Scripts

The easiest way is to use the provided startup scripts which handle environment variables:

```powershell
# From project root
.\start-dev-simple.ps1
```

This automatically sets PORT=4000 and uses the correct backend URL.

## Why This Happens

- **Production builds** (`.next/static/chunks`) embed environment variables at BUILD time
- **Development mode** (`pnpm run dev`) reads environment variables at RUNTIME
- If you built with `pnpm run build` without env vars, they're missing from the build

## Verify It's Fixed

After fixing, check browser console:
- Should see: `backendUrl: "http://localhost:8000"` (not "NOT SET")
- Should see: `Attempting registration at: http://localhost:8000/auth/register`

