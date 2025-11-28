import os
import json
from typing import Dict, Any
import aiohttp
import redis.asyncio as redis

# 기본설정
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:8080")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Redis key 패턴: roi:building:{key}
ROI_KEY_TEMPLATE = "roi:building:{}"


class ROICache:
    def __init__(self):
        self.redis = None
        # building 키 기준 메모리 캐시 ( 카메라 무관, 해당 로직 삭제 )
        self.memory_cache: Dict[str, Dict[str, Any]] = {}

    async def connect(self):
        # Redis 연결
        if not self.redis:
            self.redis = await redis.from_url(REDIS_URL, decode_responses=True)
            print("ROI cache 위한 Redis 연결")

    async def fetch_from_express(self, building: str) -> Dict[str, Any]:
        # GET /api/buildings/{key}/slots/polygons
        url = f"{EXPRESS_API_URL}/api/buildings/{building}/slots/polygons"
        async with aiohttp.ClientSession() as sess:
            async with sess.get(url) as resp:
                resp.raise_for_status()
                data = await resp.json()
                if "version" not in data:
                    data["version"] = "v1"
                return data

    async def load(self, building: str, force: bool = False) -> Dict[str, Any]:

        # 메모리에 이미 있으면 바로 리턴
        if not force and building in self.memory_cache:
            return self.memory_cache[building]

        await self.connect()
        redis_key = ROI_KEY_TEMPLATE.format(building)

        # Redis 캐시 확인
        cached = await self.redis.get(redis_key)
        if cached and not force:
            data = json.loads(cached)
            self.memory_cache[building] = data
            print(f"Redis로부터 ROI: building {building}")
            return data

        # Redis에도 없으면 Express에서
        data = await self.fetch_from_express(building)

        # Redis + 메모리에 저장
        await self.redis.set(redis_key, json.dumps(data))
        self.memory_cache[building] = data
        print(f"Express로부터 ROI cache: building {building}")
        return data

    def get_memory(self, building: str):
        # 메모리에 있는 캐시 바로 접근
        return self.memory_cache.get(building)


roi_cache = ROICache()
