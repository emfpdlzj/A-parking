# app/diff.py
from typing import Dict, List


def calc_diff(
    prev_state: Dict[int, int],
    cur_state: Dict[int, int],
) -> List[dict]:
    # prev_state, cur_state: {slot_id: occupied}
    changed: List[dict] = []

    for slot_id, occ in cur_state.items():
        if prev_state.get(slot_id) != occ:
            changed.append({"slot": slot_id, "occupied": occ})

    return changed
