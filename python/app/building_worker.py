import asyncio
import numpy as np
import cv2
import random

from app.cache import roi_cache
from app.redis_pub import redis_pub
from app.state import get_building_state, set_building_state
from app.model_tools.yolo_car_detector import YoloCarDetector
from app.detect import point_in_polygon

# YOLO 모델 전역 로드
yolo_detector = YoloCarDetector("yolo11n.pt")


# paldal 카메라 1 (1~16번 실제 slot)
async def get_paldal_cam1_real_slots(frame, roi_slots):
    detections = yolo_detector.infer_frame(frame)

    slot_state = {slot["id"]: 0 for slot in roi_slots}

    for det in detections:
        cx = det["x"] + det["w"] / 2
        cy = det["y"] + det["h"] / 2

        for slot in roi_slots:
            if point_in_polygon(cx, cy, slot["polygon"]):
                slot_state[slot["id"]] = 1
                break

    return slot_state


# paldal 카메라 2 (17~70 mock)
async def get_paldal_cam2_mock_slots():
    return {slot: 1 if random.random() < 0.3 else 0 for slot in range(17, 71)}


# 카메라 2대 -> paldal 전체(1~70) 병합
async def process_paldal_building():
    print("[PALDAL] streaming start")

    roi = await roi_cache.load("paldal")
    cam1_slots = roi["slots"][:16]  # paldal cam1 슬롯
    cap = cv2.VideoCapture("paldal1.mp4")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("[PALDAL] video end")
            break

        frame_np = np.asarray(frame)

        real16 = await get_paldal_cam1_real_slots(frame_np, cam1_slots)
        mock54 = await get_paldal_cam2_mock_slots()

        new_state = {**real16, **mock54}

        old_state = get_building_state("paldal")

        diff = []
        for slot_id, occ in new_state.items():
            if old_state.get(slot_id) != occ:
                diff.append({"id": slot_id, "occupied": bool(occ)})

        if diff:
            packet = {
                "buildingId": "paldal",
                "results": diff,
            }

        await redis_pub.publish_packet("paldal", packet)

        set_building_state("paldal", new_state)

        await asyncio.sleep(1)


# 다른 건물 mock 70칸 루프
async def process_mock_building(building: str):
    print(f"[MOCK] streaming start for {building}")

    while True:
        new_state = {i: 1 if random.random() < 0.3 else 0 for i in range(1, 71)}

        old_state = get_building_state(building)

        diff = []
        for slot_id, occ in new_state.items():
            if old_state.get(slot_id) != occ:
                diff.append({"id": slot_id, "occupied": bool(occ)})

        if diff:
            packet = {"buildingId": building, "results": diff}
            await redis_pub.publish_packet(building, packet)

        set_building_state(building, new_state)

        await asyncio.sleep(1)  # TTL 1초


# 모든 건물 워커 시작
async def start_all_building_workers():
    asyncio.create_task(process_paldal_building())

    for b in ["library", "yulgok", "yeonam"]:
        asyncio.create_task(process_mock_building(b))
