# PostgreSQL Setup Guide for SurfSense

## Option 1: Using Docker (Easiest - Recommended)

If you have Docker installed, this is the simplest way to set up PostgreSQL with pgvector:

### Step 1: Start PostgreSQL with pgvector
```powershell
docker run --name postgres-surfsense `
  -e POSTGRES_PASSWORD=surfsense123 `
  -e POSTGRES_DB=surfsense `
  -p 5432:5432 `
  -d pgvector/pgvector:pg16
```

This creates a PostgreSQL container with:
- Password: `surfsense123` (you can change this)
- Database: `surfsense` (already created)
- pgvector extension: Already included

### Step 2: Update your .env file
Edit `surfsense_backend/.env`:
```
DATABASE_URL=postgresql+asyncpg://postgres:surfsense123@localhost:5432/surfsense
```

### Step 3: Verify it's running
```powershell
docker ps | Select-String postgres
```

---

## Option 2: Install PostgreSQL Locally

### Step 1: Download PostgreSQL
1. Go to: https://www.postgresql.org/download/windows/
2. Download the installer from EnterpriseDB
3. Run the installer

### Step 2: During Installation
- **Port**: Keep default (5432)
- **Password**: Set a password for the `postgres` superuser (remember this!)
- **Locale**: Default is fine

### Step 3: Install pgvector Extension

After PostgreSQL is installed, you need to add the pgvector extension:

**Option A: Using pre-built Windows binaries**
1. Download pgvector for Windows from: https://github.com/pgvector/pgvector/releases
2. Extract and copy `vector.dll` to PostgreSQL's `lib` folder (usually `C:\Program Files\PostgreSQL\16\lib`)
3. Copy `vector.control` and `vector--*.sql` to PostgreSQL's `share\extension` folder

**Option B: Using Docker (easier)**
Just use Option 1 above - it includes pgvector!

### Step 4: Create Database and Extension

Open **pgAdmin** (comes with PostgreSQL) or use **psql**:

**Using pgAdmin:**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `surfsense`
5. Click Save
6. Expand `surfsense` → Extensions
7. Right-click → Create → Extension
8. Name: `vector`
9. Click Save

**Using psql (Command Line):**
```powershell
# Find psql (usually in C:\Program Files\PostgreSQL\16\bin)
# Add to PATH or use full path
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres

# Then in psql:
CREATE DATABASE surfsense;
\c surfsense
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### Step 5: Update .env file
Edit `surfsense_backend/.env` with your password:
```
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@localhost:5432/surfsense
```

---

## Option 3: Find Existing PostgreSQL Password

If PostgreSQL is already running but you don't know the password:

### Method 1: Check pg_hba.conf
The password might be stored or you might be able to use trust authentication temporarily:

1. Find `pg_hba.conf` (usually in `C:\Program Files\PostgreSQL\16\data\`)
2. Temporarily change authentication method to `trust` for local connections
3. Connect without password, then reset password:
```sql
ALTER USER postgres WITH PASSWORD 'newpassword';
```

### Method 2: Reset Password via Windows Service
1. Stop PostgreSQL service
2. Edit `pg_hba.conf` to use `trust` authentication
3. Start PostgreSQL service
4. Connect and reset password
5. Change `pg_hba.conf` back to `md5` or `scram-sha-256`
6. Restart service

---

## Recommended: Docker Setup

**I recommend using Docker (Option 1)** because:
- ✅ Includes pgvector extension automatically
- ✅ Easy to start/stop/remove
- ✅ No complex Windows installation
- ✅ Isolated from other PostgreSQL instances
- ✅ Easy to reset if something goes wrong

### Quick Docker Commands:

**Start PostgreSQL:**
```powershell
docker start postgres-surfsense
```

**Stop PostgreSQL:**
```powershell
docker stop postgres-surfsense
```

**View logs:**
```powershell
docker logs postgres-surfsense
```

**Remove (if you want to start fresh):**
```powershell
docker stop postgres-surfsense
docker rm postgres-surfsense
```

---

## After PostgreSQL is Set Up

Once you have PostgreSQL running with the correct password:

1. **Update `.env` file** with your password
2. **Run migrations:**
   ```powershell
   cd D:\Projects\SurfSense\surfsense_backend
   uv run alembic upgrade head
   ```

3. **Verify database:**
   ```powershell
   # Using Docker
   docker exec -it postgres-surfsense psql -U postgres -d surfsense -c "\dx"
   
   # Should show vector extension installed
   ```

---

## Need Help?

If you're not sure which option to use:
- **Have Docker?** → Use Option 1 (Docker)
- **Want local install?** → Use Option 2
- **PostgreSQL already running?** → Use Option 3 to find/reset password

Let me know which option you'd like to use and I can help you through it!

