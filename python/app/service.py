from typing import Dict

from app.cache import roi_cache
from app.state import get_last_state, set_last_state
from app.detect import make_mock_snapshot
from app.diff import calc_diff, build_diff_packet
from app.redis_pub import redis_pub


_seq_map: Dict[int, int] = {}


async def run_once(building: str, camera_id: int, publish: bool = True) -> dict:
    roi = await roi_cache.load(building)
    slots = roi.get("slots", [])

    # 1) 영상 프레임 읽기 (test.mp4엣 읽음)
    ret, frame = camera_capture.read()
    if not ret:
        raise ValueError("프레임 캡처 실패")

    # 2) YOLO 기반 스냅샷 생성
    from app.detect import make_snapshot_from_yolo
    from app.main import yolo_detector

    cur_state = make_snapshot_from_yolo(
        frame=frame,
        roi_slots=slots,
        yolo_detector=yolo_detector,
    )

    # 3) diff 계산
    prev_state = get_last_state(building, camera_id)
    diff_results = calc_diff(prev_state, cur_state)

    # 4) 패킷 생성
    packet = build_diff_packet(building=building, diff_results=diff_results)

    # 5) 상태 저장
    set_last_state(building, camera_id, cur_state)

    # 6) Redis 전송
    if publish and diff_results:
        await redis_pub.publish_packet(building, packet)

    return packet
