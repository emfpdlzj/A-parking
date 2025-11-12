# app/ws_client.py 
import os, json, asyncio
import aioredis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# 숫자→문자 building 키 매핑 (임시: 환경변수/상수로 관리)
BUILDING_KEY = {
    1: os.getenv("BUILDING_MAP_1", "paldal"),
    2: os.getenv("BUILDING_MAP_2", "library"),
    3: os.getenv("BUILDING_MAP_3", "yulgok"),
    4: os.getenv("BUILDING_MAP_4", "yeonam"),
}


async def publish_slots(building_id_num: int, slots: list[dict]):
    """
    slots: [{"id": 12, "occupied": 1}, ...]
    """
    bkey = BUILDING_KEY[building_id_num]
    channel = f"parking-status-{bkey}"
    payload = {"buildingId": bkey, "slots": slots}

    redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    try:
        await redis.publish(channel, json.dumps(payload))
        print(f" Redis PUBLISH {channel} -> {len(slots)} slots")
    finally:
        await redis.close()
