# Fix PostgreSQL Password Issue

The password `postgres` is not working for your PostgreSQL instance. Here are your options:

## Option 1: Reset PostgreSQL Password (Recommended)

### If PostgreSQL is running as a Windows Service:

1. **Stop PostgreSQL service:**
   ```powershell
   Stop-Service postgresql-x64-16  # Adjust version number if different
   ```

2. **Edit pg_hba.conf** (usually in `C:\Program Files\PostgreSQL\16\data\pg_hba.conf`):
   - Find the line with `host all all 127.0.0.1/32` 
   - Change `md5` or `scram-sha-256` to `trust`
   - Save the file

3. **Start PostgreSQL service:**
   ```powershell
   Start-Service postgresql-x64-16
   ```

4. **Connect and reset password:**
   ```powershell
   # Find psql.exe (usually in C:\Program Files\PostgreSQL\16\bin)
   & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d postgres
   
   # Then in psql:
   ALTER USER postgres WITH PASSWORD 'postgres';
   \q
   ```

5. **Change pg_hba.conf back:**
   - Change `trust` back to `md5` or `scram-sha-256`
   - Restart PostgreSQL service

## Option 2: Use Docker PostgreSQL (Easier)

This is the easiest option - start a fresh PostgreSQL container with a known password:

```powershell
# Stop any existing PostgreSQL containers
docker stop postgres-surfsense 2>$null

# Remove old container (optional - only if you want fresh start)
docker rm postgres-surfsense 2>$null

# Start new PostgreSQL container with password 'postgres'
docker run --name postgres-surfsense `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=surfsense `
  -p 5432:5432 `
  -d pgvector/pgvector:pg16

# Wait a few seconds for it to start
Start-Sleep -Seconds 5

# Verify it's running
docker ps | Select-String postgres
```

Then your `.env` file with `postgres:postgres@localhost:5432` will work!

## Option 3: Find Your Current Password

If you remember setting a password during PostgreSQL installation, update your `.env` file:

```powershell
cd D:\Projects\SurfSense\surfsense_backend
# Edit .env and change the password in DATABASE_URL
```

## Recommended: Use Docker

I recommend **Option 2 (Docker)** because:
- ✅ No need to remember/reset passwords
- ✅ Includes pgvector extension automatically  
- ✅ Easy to reset if needed
- ✅ Isolated from other PostgreSQL instances

