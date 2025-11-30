import os
import asyncio
import numpy as np
import cv2
import random

from app.cache import roi_cache
from app.redis_pub import redis_pub
from app.state import get_building_state, set_building_state
from app.model_tools.yolo_car_detector import YoloCarDetector
from app.detect import point_in_polygon


# 영상 파일 경로 상수
BASE_DIR = os.path.dirname(__file__)
PALDAL_VIDEO_PATH = os.path.join(BASE_DIR, "paldal1.mp4")

# YOLO 모델 전역 로드
print("YOLO 모델 로딩 시작\n")
yolo_detector = YoloCarDetector("yolo11n.pt")
print("YOLO 모델 로딩 성공\n")


def get_base_probability(tick: int) -> float:
    # tick에 따른 기본 점유 확률 계산
    phase = tick % 90

    if phase < 30:
        return 0.2  # 한가한 구간
    elif phase < 60:
        return 0.5  # 보통 구간
    else:
        return 0.8  # 혼잡 구간


# paldal 카메라 1 (1~16번 실제 slot)
async def get_paldal_cam1_real_slots(frame, roi_slots):
    # YOLO 검출 수행
    detections = yolo_detector.infer_frame(frame)
    print(f"[paldal] YOLO detection 개수 : {len(detections)}")

    # 슬롯 초기 상태 설정
    slot_state = {slot["id"]: 0 for slot in roi_slots}

    # bbox 중심점 기준으로 폴리곤 포함 여부 검사
    for det in detections:
        cx = det["x"] + det["w"] / 2
        cy = det["y"] + det["h"] / 2

        for slot in roi_slots:
            if point_in_polygon(cx, cy, slot["polygon"]):
                slot_state[slot["id"]] = 1
                break

    return slot_state


# paldal 카메라 2 (17~70 mock, 시간에 따른 혼잡도 패턴 적용)
def make_paldal_cam2_mock_slots(old_state: dict, tick: int) -> dict:
    # tick에 따른 기본 점유 확률 계산
    base_p = get_base_probability(tick)
    # 상태 변경 시도 비율 설정
    change_prob = 0.15

    new_state: dict[int, int] = {}

    for slot in range(17, 71):
        prev = old_state.get(slot, 0)

        if random.random() < change_prob:
            # 일부 슬롯에 대해서만 새 상태 생성
            new_state[slot] = 1 if random.random() < base_p else 0
        else:
            # 나머지는 이전 상태 유지
            new_state[slot] = prev

    return new_state


# 카메라 2대 -> paldal 전체(1~70) 병합
async def process_paldal_building():
    print("paldal.mp4 streaming start")

    roi = await roi_cache.load("paldal")
    cam1_slots = roi["slots"][:16]

    cap = cv2.VideoCapture(PALDAL_VIDEO_PATH)

    if not cap.isOpened():
        print(f"paldal 영상 열기 실패 경로: {PALDAL_VIDEO_PATH}")
        return

    tick = 0
    old_state = get_building_state("paldal")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("paldal video end")
            break

        tick += 1

        frame_np = np.asarray(frame)

        real16 = await get_paldal_cam1_real_slots(frame_np, cam1_slots)
        mock54 = make_paldal_cam2_mock_slots(old_state, tick)

        new_state = {**real16, **mock54}

        diff = []
        for slot_id, occ in new_state.items():
            if old_state.get(slot_id) != occ:
                diff.append({"id": slot_id, "occupied": bool(occ)})

        print(f"[paldal] tick={tick}, diff 개수={len(diff)}")

        if diff:
            packet = {
                "buildingId": "paldal",
                "results": diff,
            }
            await redis_pub.publish_packet("paldal", packet)

        set_building_state("paldal", new_state)
        old_state = new_state

        await asyncio.sleep(1)


# 다른 건물 mock 70칸 루프 (시간에 따른 혼잡도 패턴 적용)
async def process_mock_building(building: str):
    print(f"streaming start for {building}")

    tick = 0
    old_state = get_building_state(building)

    while True:
        tick += 1

        base_p = get_base_probability(tick)
        change_prob = 0.15

        new_state: dict[int, int] = {}

        for i in range(1, 71):
            prev = old_state.get(i, 0)

            if random.random() < change_prob:
                new_state[i] = 1 if random.random() < base_p else 0
            else:
                new_state[i] = prev

        diff = []
        for slot_id, occ in new_state.items():
            if old_state.get(slot_id) != occ:
                diff.append({"id": slot_id, "occupied": bool(occ)})

        print(f"[{building}] tick={tick}, base_p={base_p}, diff 개수={len(diff)}")

        if diff:
            packet = {"buildingId": building, "results": diff}
            await redis_pub.publish_packet(building, packet)

        set_building_state(building, new_state)
        old_state = new_state

        await asyncio.sleep(1)


# 모든 건물 워커 시작
async def start_all_building_workers():
    print("모든 건물 스트림 시작")
    asyncio.create_task(process_paldal_building())

    for b in ["library", "yulgok", "yeonam"]:
        asyncio.create_task(process_mock_building(b))
