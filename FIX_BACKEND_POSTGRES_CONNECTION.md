# Fix Backend PostgreSQL Connection Error

## Error
```
OSError: Multiple exceptions: [Errno 10061] Connect call failed ('::1', 5433, 0, 0), [Errno 10061] Connect call failed ('127.0.0.1', 5433)
```

The backend is trying to connect to PostgreSQL on **port 5433**, but it's failing.

## Quick Fix

### Step 1: Check Your DATABASE_URL

Open `surfsense_backend/.env` and check the `DATABASE_URL`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/surfsense
```

**The port in your DATABASE_URL is 5433.** PostgreSQL typically runs on port **5432** by default.

### Step 2: Fix the Port

**Option A: Change DATABASE_URL to use port 5432 (if PostgreSQL is on 5432):**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense
```

**Option B: If PostgreSQL is actually on port 5433, make sure it's running:**
```powershell
netstat -an | findstr ":5433"
```

### Step 3: Check if PostgreSQL is Running

Check both ports:
```powershell
# Check port 5432 (default)
netstat -an | findstr ":5432"

# Check port 5433
netstat -an | findstr ":5433"
```

### Step 4: Start PostgreSQL

**If using Docker:**
```powershell
docker compose up -d postgres
```

**If using local PostgreSQL:**
```powershell
# Check what PostgreSQL services are installed
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start the service (adjust name as needed)
net start postgresql-x64-16
```

### Step 5: Verify Database Exists

If PostgreSQL is running but database doesn't exist:

**Docker:**
```powershell
docker compose exec postgres psql -U postgres -c "CREATE DATABASE surfsense;"
```

**Local PostgreSQL:**
```powershell
psql -U postgres
CREATE DATABASE surfsense;
\q
```

### Step 6: Restart Backend

After fixing DATABASE_URL and ensuring PostgreSQL is running:

```powershell
cd surfsense_backend
uv run main.py --reload
```

## Common Issues

### Issue 1: Wrong Port in DATABASE_URL

**Symptom:** Error shows port 5433 but PostgreSQL is on 5432

**Fix:** Change DATABASE_URL to use correct port:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense
```

### Issue 2: PostgreSQL Not Running

**Symptom:** `netstat` shows no listening on port 5432 or 5433

**Fix:** Start PostgreSQL (see Step 4 above)

### Issue 3: Database Doesn't Exist

**Symptom:** Connection succeeds but database error

**Fix:** Create database (see Step 5 above)

### Issue 4: Wrong Credentials

**Symptom:** Authentication failed

**Fix:** Update DATABASE_URL with correct username/password:
```env
DATABASE_URL=postgresql+asyncpg://YOUR_USER:YOUR_PASSWORD@localhost:5432/surfsense
```

## Verify It's Fixed

After fixing, restart the backend. You should see:
```
INFO:     Connecting to database: postgresql+asyncpg://postgres:****@localhost:5432/surfsense
INFO:     Database tables and extensions created successfully
INFO:     Application startup complete.
```

Instead of the connection error.

## Using Docker Compose (Recommended)

If you're using Docker Compose, make sure your `.env` matches the docker-compose.yml:

```yaml
# docker-compose.yml should have:
postgres:
  ports:
    - "5432:5432"  # or "5433:5432" if you want external port 5433
```

Then your DATABASE_URL should match:
```env
# If docker-compose exposes 5432
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/surfsense

# If docker-compose exposes 5433
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/surfsense
```

