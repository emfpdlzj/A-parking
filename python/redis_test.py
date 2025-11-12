import asyncio
import json
import aioredis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")


async def main():
    redis = await aioredis.from_url(REDIS_URL, decode_responses=True)

    # Express 팀이 구독 중인 채널명
    channel = "parking-status-1"

    # 테스트용 메시지
    message = {
        "type": "occupancy_diff",
        "buildingId": 1,
        "cameraId": 2,
        "ts": "2025-11-12T15:00:00Z",
        "seq": 1,
        "results": [{"slot": 12, "occupied": 1}, {"slot": 13, "occupied": 0}],
        "summary": {"changed": 2, "total": 100},
    }

    # Redis publish
    await redis.publish(channel, json.dumps(message))
    print(f"Published to {channel}")

    await redis.close()


if __name__ == "__main__":
    asyncio.run(main())
