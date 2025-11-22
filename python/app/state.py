# app/state.py
from typing import Dict

# building_id 별로 {slot_id: occupied} 저장
_last_state: Dict[int, Dict[int, int]] = {}


def get_last_state(building_id: int) -> Dict[int, int]:
    # 이전 상태를 복사 없이 그대로 반환
    return _last_state.get(building_id, {})


def set_last_state(building_id: int, snapshot: Dict[int, int]) -> None:
    # 현재 스냅샷을 그대로 저장
    _last_state[building_id] = snapshot
