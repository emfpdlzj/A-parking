from typing import Dict

from app.cache import roi_cache
from app.state import get_last_state, set_last_state
from app.detect import make_mock_snapshot
from app.diff import calc_diff, build_diff_packet
from app.redis_pub import redis_pub


_seq_map: Dict[int, int] = {}


async def run_once(building: str, camera_id: int, publish: bool = True) -> dict:
    # ROI 로드
    roi = await roi_cache.load(building)
    slots = roi.get("slots", [])
    if not slots:
        raise ValueError("ROI slots 비어있음")

    # 이전 상태 / 현재 상태 생성
    prev_state = get_last_state(building, camera_id)
    cur_state = make_mock_snapshot(slots)

    # diff 계산
    diff_results = calc_diff(prev_state, cur_state)

    # 상태 업데이트
    set_last_state(building, camera_id, cur_state)

    # 패킷 생성
    packet = build_diff_packet(
        building=building,
        diff_results=diff_results,
    )

    # 변경 있을 때만 redis publish
    if publish and diff_results:
        await redis_pub.publish_packet(building, packet)

    return packet