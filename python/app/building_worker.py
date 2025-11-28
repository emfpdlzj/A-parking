import asyncio
import numpy as np
import cv2
import random

from app.cache import roi_cache
from app.redis_pub import redis_pub
from app.state import get_building_state, set_building_state
from app.yolo_engine import yolo_detector
from app.utils.geometry import point_in_polygon


# paldal 카메라 1 (16개 실제 slot)
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


# paldal 전체(1~70) 병합
async def process_paldal_building():
    print("[PALDAL] Streaming start")

    roi = await roi_cache.load("paldal")
    cam1_slots = roi["slots"][:16]  # paldal cam1 슬롯
    cap = cv2.VideoCapture("paldal1.mp4")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_np = np.asarray(frame)

        # 실제 16개
        real16 = await get_paldal_cam1_real_slots(frame_np, cam1_slots)

        # mock 54개
        mock54 = await get_paldal_cam2_mock_slots()

        # 병합
        new_state = {**real16, **mock54}

        old_state = get_building_state("paldal")

        diff = []
        for slot_id, occ in new_state.items():
            if old_state.get(slot_id) != occ:
                diff.append({"id": slot_id, "occupied": bool(occ)})

        if diff:
            packet = {"buildingId": "paldal", "slots": diff}
            await redis_pub.publish_packet("paldal", packet)

        set_building_state("paldal", new_state)

        await asyncio.sleep(1)
