# 모든 테스트용 로직 삭제
from fastapi import FastAPI
from app.startup import initialize_all

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    await initialize_all()
