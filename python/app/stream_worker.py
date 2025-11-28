# app/stream_worker.py
import asyncio
import cv2
import numpy as np

from app.service import run_once
from app.state_global import yolo_detector


async def start_stream_worker():
    # 팔달관 카메라 1대만 yolo
    stream_configs = [
        ("paldal", 1, "cam1.mp4"),
    ]

    for building, cam, video_path in stream_configs:
        asyncio.create_task(process_stream(building, cam, video_path))


async def process_stream(building, cam, video_path):
    cap = cv2.VideoCapture(video_path)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_np = np.asarray(frame)
        await run_once(building, cam, frame_np)

        # TTL 1초
        await asyncio.sleep(1)
