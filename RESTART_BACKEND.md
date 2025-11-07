# Backend Restart Instructions

The backend needs to be completely restarted to pick up the new database password.

## Steps to Restart:

1. **Stop the backend completely:**
   - In the backend terminal window, press `Ctrl+C`
   - Wait for it to fully stop
   - If it doesn't stop, close the terminal window

2. **Verify port 8000 is free:**
   ```powershell
   netstat -an | findstr ":8000"
   ```
   (Should show nothing, or no LISTENING)

3. **Restart the backend:**
   ```powershell
   cd D:\Projects\SurfSense\surfsense_backend
   uv run main.py --reload
   ```

4. **Or use the startup script:**
   ```powershell
   cd D:\Projects\SurfSense
   .\start-dev-simple.ps1
   ```

## Current Database Configuration:
- **URL**: `postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense`
- **Password**: `postgres` (confirmed working)

The backend should now connect successfully to PostgreSQL!

