# COCO pretrained YOLO11 사용
# FastAPI에서 frame을 넘김 -> YOLO에서 차량검출 후 좌표 리스트 반환
from typing import Any, Dict, List

import numpy as np
from ultralytics import YOLO


class YoloCarDetector:
    def __init__(self, model_path: str = "yolo11n.pt"):
        # 모델 로드
        self.model = YOLO(model_path)
        # car_class_ids: COCO 데이터셋의 클래스 id 중 car에 해당하는 것만 추출
        self.car_class_ids = {2}

    def infer_frame(
        self,
        frame: np.ndarray,
        conf_threshold: float = 0.5,  # 필터링용 정확도 임계값
    ) -> List[Dict[str, Any]]:  # 출력용 bbox 리스트
        results = self.model(frame, verbose=False)

        # 반환할 최종 bbox 리스트
        detections: List[Dict[str, Any]] = []

        if not results:
            return detections

        # 1장의 이미지에 대해 results[0] 사용
        res = results[0]
        boxes = res.boxes

        # 감지된 bbox가 전혀 없는 경우
        if boxes is None:
            return detections

        # YOLO 결과를 (center_x, center_y, width, height) 형식으로 반환.
        xywh = boxes.xywh.cpu().numpy()
        # 각 bbox의 confidence score (0~1)
        confs = boxes.conf.cpu().numpy()
        clss = boxes.cls.cpu().numpy().astype(int)

        # 각 bbox에 대해 반복
        for (cx, cy, w, h), conf, cls_id in zip(xywh, confs, clss):
            # 1. confidence threshold 필터
            if conf < conf_threshold:
                continue

            # 2. 클래스 필터 (car만 사용)
            if cls_id not in self.car_class_ids:
                continue

            # yolo 기준 좌표를 프로젝트 용으로 변환
            x = float(cx - w / 2.0)
            y = float(cy - h / 2.0)

            # 반환 형식에 맞춤
            detections.append(
                {
                    "x": x,
                    "y": y,
                    "w": float(w),
                    "h": float(h),
                    "cls": "car",
                    "conf": float(conf),
                }
            )

        return detections
