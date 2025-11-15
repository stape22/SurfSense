# Development Log

This file tracks all development actions, changes, and decisions made during the project.

## Format
- **Date**: YYYY-MM-DD HH:MM
- **Action**: What was done
- **Files Changed**: List of files modified
- **Reason**: Why this change was made
- **Notes**: Any additional context

---

## 2024-12-19 - Fix Account Persistence and Registration Flow

### Investigation
**Time**: Initial investigation
**Findings**:
- Users report accounts disappearing after logout
- Registration flow redirects to login instead of auto-logging in
- No clear error messages when login fails
- Need to verify database persistence

**Files Examined**:
- `surfsense_web/app/(home)/register/page.tsx` - Registration form
- `surfsense_web/app/(home)/login/LocalLoginForm.tsx` - Login form
- `surfsense_backend/app/users.py` - User management
- `surfsense_backend/app/app.py` - Backend app setup
- `surfsense_browser_extension/routes/pages/ApiKeyForm.tsx` - Extension auth

**Decision**: Implement comprehensive fix including auto-login, better error handling, and database verification.

---

### Implementation - Auto-login After Registration
**Time**: 2024-12-19
**Action**: Modified registration flow to automatically log users in after successful registration
**Files Changed**:
- `surfsense_web/app/(home)/register/page.tsx`
**Changes**:
- After successful registration, immediately call login endpoint with same credentials
- Store token in localStorage via auth callback flow
- Redirect to dashboard instead of login page
- Added fallback to login page if auto-login fails
- Added console logging for debugging registration/login flow
**Reason**: Users were getting confused when redirected to login after registration, and some accounts appeared to not persist

---

### Implementation - Improved Registration Error Handling
**Time**: 2024-12-19
**Action**: Enhanced error messages and logging in registration form
**Files Changed**:
- `surfsense_web/app/(home)/register/page.tsx`
**Changes**:
- Added specific error handling for "email already exists" errors
- Added console logging for registration failures
- Improved error messages to be more user-friendly
- Added logging of registration attempts with email (for debugging)
**Reason**: Better error feedback helps users understand what went wrong and helps debug account persistence issues

---

### Implementation - Improved Login Error Messages
**Time**: 2024-12-19
**Action**: Enhanced login form to distinguish between account not found and wrong password
**Files Changed**:
- `surfsense_web/app/(home)/login/LocalLoginForm.tsx`
- `surfsense_web/lib/auth-errors.ts`
**Changes**:
- Added detection for "account not found" vs "wrong password" errors
- Added ACCOUNT_NOT_FOUND error code to auth-errors utility
- Improved error messages to suggest registration when account doesn't exist
- Added console logging for login failures
- Better distinction between 401 (wrong password) and account not found scenarios
**Reason**: Users need clear feedback about whether their account exists or if they entered wrong credentials

---

### Implementation - Backend User Creation Logging
**Time**: 2024-12-19
**Action**: Added logging to track user registration in backend
**Files Changed**:
- `surfsense_backend/app/users.py`
**Changes**:
- Added logging import and logger setup
- Enhanced `on_after_register` method with detailed logging
- Logs user ID, email, is_active, and is_verified status
- Maintains existing print statement for backward compatibility
**Reason**: Need to verify that user accounts are actually being created and persisted to database

---

### Implementation - Account Verification Endpoint
**Time**: 2024-12-19
**Action**: Created custom users route for account verification
**Files Changed**:
- `surfsense_backend/app/routes/users_routes.py` (new file)
- `surfsense_backend/app/routes/__init__.py`
- `surfsense_backend/app/app.py`
**Changes**:
- Created new users_routes.py with `/users/check-email` endpoint
- Endpoint allows authenticated users to check if an email exists
- Returns email existence status, is_active, and is_verified flags
- Added proper error handling and logging
- Integrated router into app.py
**Reason**: Provides debugging tool to verify if accounts exist in database

---

### Implementation - Browser Extension Token Sync Improvements
**Time**: 2024-12-19
**Action**: Enhanced browser extension API key form with better instructions
**Files Changed**:
- `surfsense_browser_extension/routes/pages/ApiKeyForm.tsx`
**Changes**:
- Added detailed instructions on how to get API key from web dashboard
- Added link to dashboard API key page
- Clarified that API key is the same as JWT token from web login
- Improved UI with step-by-step instructions
**Reason**: Users need clear instructions on how to sync their web app authentication with browser extension

---

### Implementation - Change Frontend Port from 3000 to 4000
**Time**: 2024-12-19
**Action**: Changed default frontend port to avoid conflict with other applications
**Files Changed**:
- `docker-compose.yml`
- `surfsense_web/Dockerfile`
- `surfsense_browser_extension/routes/pages/ApiKeyForm.tsx`
- `start-dev-simple.ps1`
- `start-dev.ps1`
**Changes**:
- Updated docker-compose.yml default FRONTEND_PORT from 3000 to 4000
- Updated Dockerfile to use PORT environment variable with fallback
- Updated browser extension fallback URL from localhost:3000 to localhost:4000
- Updated PowerShell startup scripts to set PORT=4000 and display correct port
- Updated port check in start-dev.ps1 to check for 4000 instead of 3000
**Reason**: User has other applications running on ports 3000 and 3001, changed to port 4000 to avoid conflicts

---

### Implementation - Improve Error Handling for Failed Fetch Requests
**Time**: 2024-12-19
**Action**: Added better error handling for network/fetch errors in registration and login forms
**Files Changed**:
- `surfsense_web/app/(home)/register/page.tsx`
- `surfsense_web/app/(home)/login/LocalLoginForm.tsx`
**Changes**:
- Added validation to check if NEXT_PUBLIC_FASTAPI_BACKEND_URL is configured before making fetch requests
- Added try-catch around fetch calls to catch network errors
- Improved error messages to indicate connection issues vs other errors
- Added specific handling for TypeError fetch errors
- Better error logging for debugging connection issues
**Reason**: Users were getting generic "Failed to fetch" errors without clear indication of what went wrong (backend not running, URL not configured, etc.)

---

### Implementation - Enhanced Debugging for Fetch Errors
**Time**: 2024-12-19
**Action**: Added detailed console logging and improved error messages for fetch failures
**Files Changed**:
- `surfsense_web/app/(home)/register/page.tsx`
- `surfsense_web/app/(home)/login/LocalLoginForm.tsx`
- `FRONTEND_BACKEND_CONNECTION.md` (new troubleshooting guide)
**Changes**:
- Added console.log statements to show backend URL being used
- Enhanced error messages with step-by-step troubleshooting instructions
- Improved TypeError detection for fetch errors
- Created troubleshooting guide document
- Better error messages that guide users to check backend status
**Reason**: Users still experiencing "Failed to fetch" errors need better debugging information to identify root cause

---

### Implementation - Production Build Environment Variable Detection
**Time**: 2024-12-19
**Action**: Enhanced error messages to distinguish between development and production build issues
**Files Changed**:
- `surfsense_web/app/(home)/register/page.tsx`
- `surfsense_web/app/(home)/login/LocalLoginForm.tsx`
- `FIX_FETCH_ERROR.md` (new troubleshooting guide)
**Changes**:
- Added more detailed error messages explaining difference between dev and production builds
- Enhanced console logging to show if env var is undefined vs empty string
- Created comprehensive troubleshooting guide for "Failed to fetch" errors
- Better guidance on when to rebuild vs restart dev server
**Reason**: Production builds require env vars at build time, users need clear instructions on how to fix

---

### Implementation - Improve Celery Database Connection Error Handling
**Time**: 2024-12-19
**Action**: Added better error handling and logging for Celery worker database connection failures
**Files Changed**:
- `surfsense_backend/app/tasks/celery_tasks/schedule_checker_task.py`
- `surfsense_backend/app/config/__init__.py`
**Changes**:
- Added validation to check if DATABASE_URL is configured before creating connections
- Enhanced error logging to show masked database URL and connection details
- Added specific handling for ConnectionRefusedError with helpful messages
- Added warning in config if DATABASE_URL is not set
- Better error messages guiding users to check PostgreSQL status
**Reason**: Celery worker was failing silently with connection errors, needed better diagnostics

---

### Implementation - Improve Backend Database Connection Error Handling
**Time**: 2024-12-19
**Action**: Added better error handling for database connection failures during backend startup
**Files Changed**:
- `surfsense_backend/app/db.py`
- `surfsense_backend/app/app.py`
**Changes**:
- Enhanced create_db_and_tables() to log database URL (with masked password) before connecting
- Added specific handling for OSError (connection failures) with port detection
- Added detailed troubleshooting steps in error messages
- Improved error messages to show which port is being used
- Added error handling in lifespan to prevent silent failures
- Better logging for database initialization success/failure
**Reason**: Backend was failing to start with unclear error messages when PostgreSQL wasn't running or wrong port was configured

---

### Implementation - Fix PostgreSQL Connection Error (Stopped Container)
**Time**: 2025-11-15
**Action**: Fixed backend startup failure caused by stopped PostgreSQL Docker container
**Files Changed**:
- `DEVLOG.md` (this entry)
**Problem**:
- Backend server failed to start with error: `Failed to connect to PostgreSQL on port 5433`
- Error: `[Errno 10061] Connect call failed ('::1', 5433, 0, 0), [Errno 10061] Connect call failed ('127.0.0.1', 5433)`
- PostgreSQL Docker container (`postgres-surfsense` / `surfsense-db-1`) was stopped
- Backend `.env` file correctly configured to use `localhost:5433`
**Root Cause**:
- PostgreSQL Docker container was not running
- Container needed to be started with correct port mapping (5433 host -> 5432 container)
**Solution**:
1. Started PostgreSQL container using `docker compose up -d db` with `POSTGRES_PORT=5433` environment variable
2. Verified container is running and port 5433 is listening
3. Backend can now connect successfully
**Prevention Tips**:
- Check PostgreSQL container status before starting backend: `docker ps | findstr postgres` or `docker compose ps db`
- Verify port is listening: `netstat -an | findstr ":5433"`
- If container is stopped, start it with: `POSTGRES_PORT=5433 docker compose up -d db`
- Ensure `.env` file DATABASE_URL matches the port configured in docker-compose.yml
**Reason**: Users need clear troubleshooting steps when PostgreSQL connection fails, especially when the container is stopped

---

