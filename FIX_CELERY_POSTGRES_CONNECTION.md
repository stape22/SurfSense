# Fix Celery PostgreSQL Connection Error

## Error
```
ConnectionRefusedError: [WinError 1225] The remote computer refused the network connection
```

This means Celery worker cannot connect to PostgreSQL.

## Quick Fix

### Step 1: Check if PostgreSQL is Running

```powershell
# Check if PostgreSQL is running on port 5432
netstat -an | findstr ":5432"
```

You should see something like:
```
TCP    0.0.0.0:5432           0.0.0.0:0              LISTENING
```

### Step 2: Start PostgreSQL

**If using Docker:**
```powershell
# Start PostgreSQL container
docker compose up -d postgres
```

**If using local PostgreSQL installation:**
```powershell
# Windows Service
net start postgresql-x64-16  # Adjust version number as needed

# Or check services
services.msc
# Look for PostgreSQL service and start it
```

### Step 3: Verify DATABASE_URL

Check your `surfsense_backend/.env` file has:
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense
```

**Important:** Adjust the connection string if:
- PostgreSQL is on a different host (not localhost)
- PostgreSQL is on a different port (not 5432)
- You have different username/password
- Database name is different

### Step 4: Test Database Connection

```powershell
cd surfsense_backend
python test_db_connection.py
```

This should connect successfully. If it fails, fix the DATABASE_URL.

### Step 5: Restart Celery Worker

After PostgreSQL is running and DATABASE_URL is correct:

```powershell
cd surfsense_backend
uv run celery -A celery_worker.celery_app worker --loglevel=info
```

## Common Issues

### Issue 1: PostgreSQL Not Installed

Install PostgreSQL:
- Download from: https://www.postgresql.org/download/windows/
- Or use Docker: `docker compose up -d postgres`

### Issue 2: Wrong DATABASE_URL

The DATABASE_URL format is:
```
postgresql+asyncpg://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

Example:
```
postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense
```

### Issue 3: PostgreSQL Running on Different Port

If PostgreSQL is on port 5433 instead of 5432:
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/surfsense
```

### Issue 4: Database Doesn't Exist

Create the database:
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE surfsense;

# Exit
\q
```

Or use Docker:
```powershell
docker compose exec postgres psql -U postgres -c "CREATE DATABASE surfsense;"
```

## Verify It's Fixed

After fixing, Celery worker logs should show:
- ✅ `Connected to redis://localhost:6379/0`
- ✅ No more `ConnectionRefusedError` messages
- ✅ Tasks running successfully

The error should change from:
```
[ERROR] Error checking periodic schedules: [WinError 1225] The remote computer refused the network connection
```

To either:
- No errors (success)
- Or clearer error messages showing what's wrong

## Using Docker Compose (Recommended)

If you're using Docker Compose, make sure all services are up:

```powershell
docker compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Backend (port 8000)
- Frontend (port 4000)

Then start Celery separately:
```powershell
cd surfsense_backend
uv run celery -A celery_worker.celery_app worker --loglevel=info
```

