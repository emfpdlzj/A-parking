from datetime import datetime, timezone
from typing import Dict, List


def calc_diff(prev_state: Dict[int, int], cur_state: Dict[int, int]):
    changed = []
    for slot_id, occ in cur_state.items():
        if prev_state.get(slot_id) != occ:
            changed.append({
                "id": slot_id,
                "occupied": bool(occ)
            })
    return changed


def build_diff_packet(building: str, diff_results: List[dict]):
    return {
        "buildingId": building,
        "slots": diff_results
    }