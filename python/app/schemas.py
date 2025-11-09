# app/schemas.py
from pydantic import BaseModel
from typing import List


class SlotResult(BaseModel):
    slot: int
    occupied: int  # 0 or 1


class OccupancyPacket(BaseModel):
    type: str = "occupancy_diff"
    buildingId: int
    cameraId: int
    ts: str
    seq: int
    results: List[SlotResult]
    summary: dict
