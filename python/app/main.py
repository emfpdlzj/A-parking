import asyncio

from fastapi import FastAPI, Request
from app.startup import initialize_all
from fastapi.middleware.cors import CORSMiddleware

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


@app.on_event("startup")
async def startup_event():
    await initialize_all()
