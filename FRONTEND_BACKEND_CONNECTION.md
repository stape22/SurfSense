# Frontend-Backend Connection Troubleshooting

## Issue: "Failed to fetch" Error

If you're seeing "Failed to fetch" errors in the console, follow these steps:

### 1. Check Backend is Running

```powershell
# Check if backend is running on port 8000
netstat -an | findstr ":8000"
```

You should see something like:
```
TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING
```

If not, start the backend:
```powershell
cd surfsense_backend
uv run main.py --reload
```

### 2. Verify Backend URL Environment Variable

The frontend needs `NEXT_PUBLIC_FASTAPI_BACKEND_URL` to be set.

**For Development (using startup scripts):**
The scripts automatically set this, but you can verify by checking the browser console. Look for log messages showing the backend URL.

**For Manual Development:**
Create or edit `surfsense_web/.env`:
```
NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=DOCLING
```

**Important:** After setting environment variables, you MUST restart the frontend server.

### 3. Check Browser Console

Open browser DevTools (F12) and check the Console tab. You should see:
- "Login attempt:" or "Registration attempt:" logs showing the backend URL
- If backend URL shows "NOT SET", the environment variable isn't configured

### 4. Test Backend Connection

Open a new browser tab and go to:
```
http://localhost:8000/
```

You should see:
```json
{
  "message": "SurfSense API is running",
  "version": "0.0.8",
  "docs": "/docs",
  "api": "/api/v1",
  "health": "/verify-token"
}
```

If this doesn't work, the backend isn't running or isn't accessible.

### 5. Rebuild Frontend (if using production build)

If you're running a production build and changed environment variables, rebuild:

```powershell
cd surfsense_web
pnpm run build
pnpm start
```

Or for development:
```powershell
cd surfsense_web
pnpm run dev
```

### 6. Check CORS Settings

The backend should have CORS enabled. Check `surfsense_backend/app/app.py` - it should have:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Common Issues:

1. **Backend not running**: Start it with `uv run main.py --reload`
2. **Environment variable not set**: Create `.env` file in `surfsense_web/`
3. **Frontend not restarted**: Restart after setting environment variables
4. **Wrong port**: Backend should be on 8000, frontend on 4000
5. **Production build**: Rebuild if you changed environment variables

### Quick Fix:

1. Stop frontend (Ctrl+C)
2. Create/update `surfsense_web/.env` with:
   ```
   NEXT_PUBLIC_FASTAPI_BACKEND_URL=http://localhost:8000
   ```
3. Restart frontend:
   ```powershell
   cd surfsense_web
   $env:PORT='4000'; pnpm run dev
   ```

