# main.py
import asyncio
from fastapi import FastAPI

from app.cache import roi_cache
from app.building_worker import start_all_building_workers

app = FastAPI()

async def initialize_all():
    # 1) ROI 초기 캐싱
    for building in ["paldal", "library", "yulgok", "yeonam"]:
        await roi_cache.load(building)
        print(f"ROI cached for building: {building}")

    # 2) 건물별 스트림 워커 시작
    asyncio.create_task(start_all_building_workers())


@app.on_event("startup")
async def startup_event():
    await initialize_all()
