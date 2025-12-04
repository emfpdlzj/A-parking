# building 별로 {slot_id: occupied} 저장
_building_state = {}


def get_building_state(building):
    # 이전 상태 반환
    return _building_state.get(building, {})


def set_building_state(building, snapshot):
    # 현재 스냅샷 저장
    _building_state[building] = snapshot
