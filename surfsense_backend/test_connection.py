import asyncio
import asyncpg

async def test():
    try:
        conn = await asyncpg.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='postgres',
            database='surfsense'
        )
        print('SUCCESS: Connected to PostgreSQL!')
        await conn.close()
        return True
    except Exception as e:
        print(f'FAILED: {e}')
        return False

if __name__ == "__main__":
    result = asyncio.run(test())
    exit(0 if result else 1)

