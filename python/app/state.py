from typing import Dict

# building 별로 {slot_id: occupied} 저장
_building_state: Dict[str, Dict[int, int]] = {}


def get_building_state(building: str) -> Dict[int, int]:
    # 이전 상태 반환
    return _building_state.get(building, {})


def set_building_state(building: str, snapshot: Dict[int, int]) -> None:
    # 현재 스냅샷 저장
    _building_state[building] = snapshot # 팔달의 카메라만사용. cameraid필요없음
