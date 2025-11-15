# redis_test.py
import asyncio
import json
import os

import redis.asyncio as redis


REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


async def main():
    r = await redis.from_url(REDIS_URL, decode_responses=True)

    channel = "parking-status-1"

    message = {
        "type": "occupancy_diff",
        "buildingId": 1,
        "cameraId": 2,
        "ts": "2025-10-14T12:30:10Z",
        "seq": 1,
        "results": [
            {"slot": 12, "occupied": 1},
            {"slot": 13, "occupied": 0},
        ],
        "summary": {"changed": 2, "total": 100},
    }

    await r.publish(channel, json.dumps(message))
    print("published test message")

    await r.close()


if __name__ == "__main__":
    asyncio.run(main())
