# app/detect.py
from typing import List, Dict, Any, Set
from datetime import datetime, timezone
import random


# 유틸: 점이 폴리곤 내부에 있는지 (ray casting)
def point_in_polygon(px: float, py: float, polygon: List[List[float]]) -> bool:
    inside = False
    n = len(polygon)
    for i in range(n):
        x1, y1 = polygon[i]
        x2, y2 = polygon[(i + 1) % n]
        if (y1 > py) != (y2 > py):
            x_cross = (x2 - x1) * (py - y1) / (y2 - y1 + 1e-12) + x1
            if px < x_cross:
                inside = not inside
    return inside


# YOLO 모의검출 (임시)
def yolo_infer_mock() -> List[Dict[str, Any]]:
    """테스트용 랜덤 bbox 생성"""
    boxes = []
    for _ in range(random.randint(1, 3)):
        boxes.append(
            {
                "x": random.randint(100, 300),
                "y": random.randint(200, 400),
                "w": 40,
                "h": 30,
                "cls": "car",
                "conf": round(random.uniform(0.8, 0.95), 2),
            }
        )
    return boxes


# 매핑: bbox 중심점이 어떤 슬롯에 속하는지
def map_detections_to_slots(
    detections: List[Dict[str, Any]], roi_slots: List[Dict[str, Any]]
) -> Set[int]:
    occupied_slots: Set[int] = set()

    for det in detections:
        cx = det["x"] + det["w"] / 2.0
        cy = det["y"] + det["h"] / 2.0
        for slot_obj in roi_slots:
            slot_id = int(slot_obj["slot"])
            if point_in_polygon(cx, cy, slot_obj["polygon"]):
                occupied_slots.add(slot_id)
                break
    return occupied_slots


# occupancy_diff 패킷 생성
def build_packet(
    building_id: int,
    camera_id: int,
    seq: int,
    occupied_slots: Set[int],
    total_slots: int,
) -> Dict[str, Any]:
    ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    results = [{"slot": s, "occupied": 1} for s in sorted(occupied_slots)]

    return {
        "type": "occupancy_diff",
        "buildingId": building_id,
        "cameraId": camera_id,
        "ts": ts,
        "seq": seq,
        "results": results,
        "summary": {"changed": len(results), "total": total_slots},
    }


# mock 용 ROI 안에 들어있는 slot 리스트 기준으로 랜덤 점유 상태를 만드는 함수
def make_mock_snapshot(roi_slots: List[dict]) -> Dict[int, int]:
    # ROI 슬롯 리스트를 받아서 {slot_id: 0 또는 1} 형태로 상태 생성
    state: Dict[int, int] = {}

    for slot_obj in roi_slots:
        slot_id = int(slot_obj["slot"])
        # 예시로 30% 확률로 occupied 설정
        occupied = 1 if random.random() < 0.3 else 0
        state[slot_id] = occupied

    return state
