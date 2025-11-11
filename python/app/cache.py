import os
import json
import aiohttp
import aioredis
from typing import Dict, Any

# 기본설정
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:8081")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Redis key 패턴: roi:building:{id}
ROI_KEY_TEMPLATE = "roi:building:{}"


class ROICache:
    def __init__(self):
        self.redis = None
        self.memory_cache: Dict[int, Dict[str, Any]] = {}

    async def connect(self):
        # Redis 연결
        if not self.redis:
            self.redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
            print("ROI cache 위한 Redis 연결")

    async def fetch_from_express(self, building_id: int) -> Dict[str, Any]:
        # 캐시 : GET /api/buildings/{id}/slots/polygons
        url = f"{EXPRESS_API_URL}/api/buildings/{building_id}/slots/polygons"
        async with aiohttp.ClientSession() as sess:
            async with sess.get(url) as resp:
                resp.raise_for_status()
                data = await resp.json()
                if "version" not in data:
                    data["version"] = "v1"
                return data

    async def load(self, building_id: int, force: bool = False) -> Dict[str, Any]:
        # 캐시 로드 : 메모리 ->Redis ->Express 순으로 점근
        # 메모리에 이미 있으면 바로 리턴
        if not force and building_id in self.memory_cache:
            return self.memory_cache[building_id]

        await self.connect()
        redis_key = ROI_KEY_TEMPLATE.format(building_id)

        # Redis 캐시 확인
        cached = await self.redis.get(redis_key)
        if cached and not force:
            data = json.loads(cached)
            self.memory_cache[building_id] = data
            print(f"Redis로부터 ROI: building {building_id})")
            return data

        # Redis에도 없으면 Express에서
        data = await self.fetch_from_express(building_id)

        # Redis + 메모리에 저장
        await self.redis.set(redis_key, json.dumps(data))
        self.memory_cache[building_id] = data
        print(f"Express로부터 ROI cache: building {building_id}")
        return data

    def get_memory(self, building_id: int):
        # 메모리에 있는 캐시 바로 접근
        return self.memory_cache.get(building_id)


# FastAPI에서 ROI 불러올 때 호출
# 메모리에 이미 올라와 있는 ROI를 그냥 읽어오기만 -> 굳이 await 필요 없음.
roi_cache = ROICache()
