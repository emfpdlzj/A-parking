from typing import Dict

from app.cache import roi_cache
from app.state import get_last_state, set_last_state
from app.detect import make_mock_snapshot
from app.diff import calc_diff, build_diff_packet
from app.ws_client import redis_pub


_seq_map: Dict[int, int] = {}


def next_seq(camera_id: int) -> int:
    # 카메라별 시퀀스 번호 증가 함수 정의
    cur = _seq_map.get(camera_id, 0)
    cur += 1
    _seq_map[camera_id] = cur
    return cur


async def run_once(building_id: int, camera_id: int, publish: bool = True) -> dict:
    # buildingId에 대한 ROI 로드
    roi = await roi_cache.load(building_id)
    slots = roi.get("slots", [])
    total_slots = len(slots)
    if total_slots == 0:
        # ROI가 비어있는 경우 예외 발생
        raise ValueError("ROI slots 비어있음")

    # 직전 상태와 현재 목업 스냅샷 생성
    prev_state = get_last_state(building_id)
    cur_state = make_mock_snapshot(slots)

    # diff 계산
    diff_results = calc_diff(prev_state, cur_state)

    # 시퀀스 번호 계산
    seq = next_seq(camera_id)

    # occupancy_diff 패킷 생성
    packet = build_diff_packet(
        building_id=building_id,
        camera_id=camera_id,
        seq=seq,
        diff_results=diff_results,
        total_slots=total_slots,
    )

    # 현재 상태를 직전 상태로 저장
    set_last_state(building_id, cur_state)

    # 변경 사항이 있을 때만 publish 수행
    if publish and diff_results:
        await redis_pub.publish_packet(building_id, packet)

    # 로컬 확인용으로 패킷 반환
    return packet