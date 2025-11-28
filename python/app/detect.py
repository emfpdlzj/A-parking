from typing import List, Dict, Any, Set
import random


def point_in_polygon(px: float, py: float, polygon: List[List[float]]) -> bool:
    # 폴리곤 내부 포인트 포함 여부 판단
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


def map_detections_to_slots(
    detections: List[Dict[str, Any]],
    roi_slots: List[Dict[str, Any]],
) -> Set[int]:
    # 검출 결과를 슬롯 id 집합으로 매핑
    occupied_slots: Set[int] = set()

    for det in detections:
        cx = det["x"] + det["w"] / 2.0
        cy = det["y"] + det["h"] / 2.0

        for slot_obj in roi_slots:
            # ROI JSON 키 이름 통일
            slot_id_raw = slot_obj.get("slot", slot_obj.get("id"))
            if slot_id_raw is None:
                continue

            slot_id = int(slot_id_raw)
            polygon = slot_obj["polygon"]

            if point_in_polygon(cx, cy, polygon):
                occupied_slots.add(slot_id)
                break

    return occupied_slots


def make_snapshot_from_detections(
    detections: List[Dict[str, Any]],
    roi_slots: List[Dict[str, Any]],
) -> Dict[int, int]:
    # 검출 결과와 ROI를 이용해 슬롯별 점유 상태 스냅샷 생성
    # 반환 형식: {slot_id: occupied(0 또는 1)}
    state: Dict[int, int] = {}

    # 모든 슬롯을 기본값 0으로 초기화
    for slot_obj in roi_slots:
        slot_id_raw = slot_obj.get("slot", slot_obj.get("id"))
        if slot_id_raw is None:
            continue
        slot_id = int(slot_id_raw)
        state[slot_id] = 0

    # 점유 슬롯 집합 계산
    occupied_slots = map_detections_to_slots(detections, roi_slots)

    # 점유 상태 설정
    for slot_id in occupied_slots:
        state[slot_id] = 1

    return state


def make_mock_snapshot(roi_slots: List[dict]) -> Dict[int, int]:
    # ROI 슬롯 리스트를 기반으로 랜덤 점유 상태 생성
    state: Dict[int, int] = {}

    for slot_obj in roi_slots:
        slot_id_raw = slot_obj.get("slot", slot_obj.get("id"))
        if slot_id_raw is None:
            continue
        slot_id = int(slot_id_raw)
        occupied = 1 if random.random() < 0.3 else 0
        state[slot_id] = occupied

    return state
