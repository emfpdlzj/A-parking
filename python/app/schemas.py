# app/schemas.py
from pydantic import BaseModel
from typing import List


class SlotResult(BaseModel):
    slot: int
    occupied: int  # 0 or 1


class OccupancyPacket(BaseModel):
    type: str = "occupancy_diff"
    buildingId: int  # 건물 id
    cameraId: int  # 카메라 id
    ts: str
    seq: int
    results: List[SlotResult]  # List로 결과 저장
    summary: dict  # 요약 (변경 슬롯 수 등 )
