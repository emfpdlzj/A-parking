import os
import asyncio
import numpy as np
import cv2
import random
from datetime import datetime

from app.cache import roi_cache
from app.redis_pub import redis_pub
from app.state import get_building_state, set_building_state
from app.model_tools.yolo_car_detector import YoloCarDetector
from app.detect import point_in_polygon

# 영상 파일 경로 상수
BASE_DIR = os.path.dirname(__file__)
PALDAL_VIDEO_PATH = os.path.join(BASE_DIR, "paldal1.mp4")

# YOLO 모델 전역 로드
yolo_detector = YoloCarDetector("yolo11n.pt")
print("YOLO 모델 로딩 성공\n")


def get_base_probability_by_hour(hour):
    # 시간대별 기본 점유 확률 계산
    # 00~06시  심야 시간
    # 06~09시  서서히 증가
    # 09~17시 낮 피크 시간
    # 17~20시 퇴근 시간대
    # 20~24시 저녁 시간
    if 0 <= hour < 6:
        return 0.1
    elif 6 <= hour < 9:
        return 0.4
    elif 9 <= hour < 17:
        return 0.95
    elif 17 <= hour < 20:
        return 0.6
    else:
        return 0.3


def get_change_probability_by_hour(hour):
    # 시간대별 상태 변경 비율 계산
    # 심야에는 거의 안 바뀜
    # 출퇴근 시간에는 변화 빈도 증가
    if 0 <= hour < 6:
        return 0.03
    elif 6 <= hour < 9:
        return 0.20
    elif 9 <= hour < 17:
        return 0.12
    elif 17 <= hour < 20:
        return 0.15
    else:
        return 0.07


def get_current_probs():
    # 현재 시각 기준으로 base_p와 change_prob 계산
    now = datetime.now()
    hour = now.hour
    base_p = get_base_probability_by_hour(hour)
    change_prob = get_change_probability_by_hour(hour)
    return base_p, change_prob


# paldal 카메라 1 (1~16번 실제 slot)
async def get_paldal_cam1_real_slots(frame, roi_slots):
    # YOLO 검출 수행
    detections = yolo_detector.infer_frame(frame)
    # print(f"[paldal] YOLO detection 개수 : {len(detections)}")

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


# paldal 카메라 2 (17~70 mock, 시간대별 혼잡도 패턴 적용)
def make_paldal_cam2_mock_slots(old_state):
    # 현재 시각 기준으로 기본 점유 확률과 변경 비율 계산
    base_p, change_prob = get_current_probs()

    new_state: dict[int, int] = {}

    for slot in range(17, 71):
        prev = old_state.get(slot, 0)

        if random.random() < change_prob:
            # 일부 슬롯에 대해서만 새 점유 상태 생성
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

    old_state = get_building_state("paldal")

    while True:
        ret, frame = cap.read()
         if not ret:
                    print("paldal video end, restart!")
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # 영상 처음으로
                    continue

        real16 = await get_paldal_cam1_real_slots(frame, cam1_slots)
        mock54 = make_paldal_cam2_mock_slots(old_state)

        new_state = {**real16, **mock54}

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
        old_state = new_state

        await asyncio.sleep(1)


# 다른 건물 mock 70칸 루프 (시간대별 혼잡도 패턴 적용)
async def process_mock_building(building):
    print(f"streaming start for {building}")

    old_state = get_building_state(building)

    while True:

        base_p, change_prob = get_current_probs()

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

        if diff:
            packet = {"buildingId": building, "results": diff}
            await redis_pub.publish_packet(building, packet)

        set_building_state(building, new_state)
        old_state = new_state

        await asyncio.sleep(1)


# 모든 건물 워커 시작
async def start_all_building_workers():
    asyncio.create_task(process_paldal_building())

    for b in ["library", "yulgok", "yeonam"]:
        asyncio.create_task(process_mock_building(b))
