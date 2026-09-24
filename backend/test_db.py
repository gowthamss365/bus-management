import asyncio
from database import engine

async def test():
    try:
        async with engine.begin() as conn:
            print('Connected successfully!')
    except Exception as e:
        print('Connection failed:', e)

asyncio.run(test())
