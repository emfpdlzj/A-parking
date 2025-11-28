# app/main.py
import os
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.service import run_once
from app.model_tools.yolo_car_detector import YoloCarDetector

# yolo 초기화 코드
yolo_detector = None
app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    global yolo_detector
    yolo_detector = YoloCarDetector(model_path="yolo11n.pt")


@app.get("/infer")
async def infer(
    buildingId: int = Query(..., ge=1),
    cameraId: int = Query(..., ge=1),
    publish: bool = Query(True),
) -> dict:
    # 한 사이클 실행 후 패킷 반환
    try:
        packet = await run_once(
            building_id=buildingId,
            camera_id=cameraId,
            publish=publish,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"내부 처리 실패: {e}")

    return packet
