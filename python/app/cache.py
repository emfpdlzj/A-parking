import os
import aiohttp  # 비동기 http

# 기본설정
EXPRESS_API_URL = os.getenv("EXPRESS_API_URL", "http://localhost:8080")


class ROICache:
    def __init__(self):
        self.memory_cache = {}

    async def fetch_from_express(self, building):
        # GET /api/buildings/{building}/slots/polygons
        url = f"{EXPRESS_API_URL}/api/buildings/{building}/slots/polygons"
        async with aiohttp.ClientSession() as sess:
            async with sess.get(url) as resp:
                resp.raise_for_status()  # 200대 status 아닐경우 오류
                data = await resp.json()
                return data

    async def load(self, building, force=False):
        # 1) 메모리에 이미 있으면 바로 리턴
        if not force and building in self.memory_cache:
            return self.memory_cache[building]

        # 2) 무조건 HTTP로 Express에서 새로 가져오기
        data = await self.fetch_from_express(building)

        # 3) 메모리에만 저장
        self.memory_cache[building] = data
        print(f"Express로부터 ROI load & cache: building {building}")

        return data

roi_cache = ROICache()
