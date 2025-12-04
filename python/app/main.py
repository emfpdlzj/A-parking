# main.py
import asyncio

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.cache import roi_cache
from app.building_worker import start_all_building_workers

app = FastAPI()

ALLOWED_ORIGINS = [
    "http://localhost:8081",  # Express 개발 환경
    "http://127.0.0.1:8081",
]

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # 요청 처리
    response = await call_next(request)

    # 보안 헤더 추가
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response


async def initialize_all():
    # 1) ROI 초기 캐싱
    for building in ["paldal", "library", "yulgok", "yeonam"]:
        await roi_cache.load(building)
        print(f"ROI cached for building: {building}")

    print("캐싱 완료. redis 시작")

    # 2) 건물별 스트림 워커 시작
    asyncio.create_task(start_all_building_workers())


@app.on_event("startup")
async def startup_event():
    await initialize_all()
