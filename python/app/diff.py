# app/diff.py
from datetime import datetime, timezone
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


def build_diff_packet(
    building_id: int,
    camera_id: int,
    seq: int,
    diff_results: List[dict],
    total_slots: int,
) -> Dict[str, object]:
    ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    packet = {
        "type": "occupancy_diff",
        "buildingId": building_id,
        "cameraId": camera_id,
        "ts": ts,
        "seq": seq,
        "results": diff_results,
        "summary": {
            "changed": len(diff_results),
            "total": total_slots,
        },
    }
    return packet
