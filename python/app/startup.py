import asyncio
from app.cache import roi_cache
from app.building_worker import start_all_building_workers


async def initialize_all():
    # 1) ROI 초기 캐싱
    # 실제로는 paldal만 쓰지만, express맞춰서 4개 건물 모두 한 번씩 캐싱
    for building in ["paldal", "library", "yulgok", "yeonam"]:
        await roi_cache.load(building)
        print(f"ROI cached for building: {building}")

    print("캐싱 완료. redis 시작")

    # 2) 건물별 스트림 워커 시작
    asyncio.create_task(start_all_building_workers())
