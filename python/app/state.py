from typing import Dict, Tuple

# (building, camera_id) 별로 {slot_id: occupied} 저장
_last_state: Dict[Tuple[str, int], Dict[int, int]] = {}


def get_last_state(building: str, camera_id: int) -> Dict[int, int]:
    # 이전 상태 반환
    return _last_state.get((building, camera_id), {})


def set_last_state(building: str, camera_id: int, snapshot: Dict[int, int]) -> None:
    # 현재 스냅샷 저장
    _last_state[(building, camera_id)] = snapshot