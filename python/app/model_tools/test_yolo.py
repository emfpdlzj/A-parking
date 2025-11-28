# express 연동 전 frame 1장으로 yolo 반환값 테스트 용 코드
# 유틸메모: python test_yolo.py --image paldal_frame.jpg --show
import argparse
import cv2
from yolo_car_detector import YoloCarDetector


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
    # 해당 코드는 생성형 ai 도움을 받았습니다.
    # 커맨드라인 인자 parser 설정
    #   --image : 테스트할 이미지 경로 (필수인자)
    #   --model : 사용할 모델 경로 또는 이름 (기본: yolo11n.pt)
    #   --conf  : confidence threshold (기본: 0.5)
    #   --show  : 결과 이미지 창에 띄울지 여부 (옵션 플래그)
    parser = argparse.ArgumentParser(description="Test YOLO car detector")
    parser.add_argument(
        "--image",
        type=str,
        required=True,
        help="Path to test image (e.g., frame.jpg)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="yolo11n.pt",
        help="YOLO model path or name (default: yolo11n.pt)",
    )
    parser.add_argument(
        "--conf",
        type=float,
        default=0.10,
        help="Confidence threshold ",
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Show image with drawn bounding boxes",
    )

    args = parser.parse_args()

    # 1) 테스트 이미지 로드
    frame = cv2.imread(args.image)
    if frame is None:
        print(f"[ERROR] Failed to load image: {args.image}")
        return

    # 2) YoloCarDetector 초기화
    detector = YoloCarDetector(model_path=args.model)

    # 3) 프레임에서 차량 bbox 검출
    detections = detector.infer_frame(frame, conf_threshold=args.conf)

    # 결과 출력
    print("Detections:")
    for det in detections:
        print(det)

    # 4) 옵션: 결과 이미지 시각화
    if args.show:
        frame_with_boxes = draw_boxes(frame.copy(), detections)
        cv2.imshow("YOLO Car Detection", frame_with_boxes)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
