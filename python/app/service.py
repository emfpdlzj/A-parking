import numpy as np
from app.cache import roi_cache
from app.diff import calc_diff, build_diff_packet
from app.detect import make_snapshot_from_detections
from app.redis_pub import redis_pub
from app.state import get_last_state, set_last_state
from app.state_global import yolo_detector


async def run_once(building, cam, frame_np):
    roi = await roi_cache.load(building)
    slots = roi["slots"]

    det = yolo_detector.infer_frame(frame_np)

    cur = make_snapshot_from_detections(det, slots)
    prev = get_last_state(building, cam)

    diff_results = calc_diff(prev, cur)
    set_last_state(building, cam, cur)

    if diff_results:
        packet = build_diff_packet(building, diff_results)
        await redis_pub.publish_packet(building, packet)
