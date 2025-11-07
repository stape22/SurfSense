#!/usr/bin/env python3
"""Test database connection with different passwords."""

import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Load .env file
BASE_DIR = Path(__file__).resolve().parent
env_file = BASE_DIR / ".env"
print(f"Loading .env from: {env_file}")
load_dotenv(env_file, override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"\nDATABASE_URL from .env: {DATABASE_URL}")

# Extract password from URL
if DATABASE_URL:
    # Parse the URL to extract password
    parts = DATABASE_URL.split("@")[0].split("://")[1].split(":")
    if len(parts) >= 2:
        user = parts[0]
        password = parts[1]
        print(f"Extracted user: {user}")
        print(f"Extracted password: {password}")

# Test connection
async def test_connection():
    try:
        import asyncpg
        
        # Try with password from .env
        if DATABASE_URL:
            # Convert asyncpg URL format
            db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
            print(f"\nTesting connection with URL: {db_url.split('@')[0]}@...")
            
            conn = await asyncpg.connect(
                host="localhost",
                port=5432,
                user="postgres",
                password=password if 'password' in locals() else "postgres",
                database="surfsense"
            )
            print("✅ SUCCESS: Connection successful!")
            await conn.close()
            return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_connection())
    sys.exit(0 if result else 1)

