# express 연동 전 frame 1장으로 yolo 반환값 테스트 용 코드, 검출결과 시각화에 사용
# 유틸메모: python test_yolo.py --image paldal_frame.jpg --show
# 해당 코드는 생성형 ai 도움을 받았습니다.
import cv2
from yolo_car_detector import YoloCarDetector

IMAGE_PATH = "paldal_frame.jpg"  # 테스트할 이미지 경로
MODEL_PATH = "yolo11n.pt"  # YOLO 모델 경로 또는 이름
CONF_THRESHOLD = 0.10  # confidence threshold
SHOW_RESULT = True  # True이면 bbox 시각화 창 띄움


def draw_boxes(frame, detections):  # 디버깅용: 검출된 bbox를 프레임 위에 그림
    for det in detections:
        x = int(det["x"])
        y = int(det["y"])
        w = int(det["w"])
        h = int(det["h"])
        conf = det["conf"]

        # 좌상단, 우하단 좌표 계산
        pt1 = (x, y)
        pt2 = (x + w, y + h)

        cv2.rectangle(frame, pt1, pt2, (0, 255, 0), 2)  # 사각형 그리기

        # confidence 텍스트 표시 (yolo 검출결과 처럼)
        label = f"car {conf:.2f}"
        cv2.putText(
            frame,
            label,
            (x, y - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            1,
            cv2.LINE_AA,
        )

    return frame


def main():
    # 1) 테스트 이미지 로드
    frame = cv2.imread(IMAGE_PATH)
    if frame is None:
        print("[ERROR] Failed to load image: {IMAGE_PATH)")
        return

    # 2) YoloCarDetector 초기화
    detector = YoloCarDetector(model_path=MODEL_PATH)

    # 3) 프레임에서 차량 bbox 검출
    detections = detector.infer_frame(frame, conf_threshold=CONF_THRESHOLD)

    # 결과 출력
    print("Detections:")
    for det in detections:
        print(det)

    # 4) 옵션: 결과 이미지 시각화
    if SHOW_RESULT:
        frame_with_boxes = draw_boxes(frame.copy(), detections)
        cv2.imshow("YOLO Car Detection", frame_with_boxes)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
