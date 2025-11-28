import cv2
import json
from typing import List, Dict

# 설정
BUILDING_ID = "paldal"  # 건물 id 문자열 - paldal, library, yulgok, yeonam
FRAME_PATH = "paldal_frame.jpg"  # ROI를 지정할 이미지 경로
OUTPUT_PATH = "roi_paldal_cam1.json"  # 출력 roi json 경로

rois: List[Dict] = []
drawing = False
ix, iy = -1, -1
next_slot_id = 1


def draw_roi(event, x, y, flags, param):
    # 마우스 이벤트 처리 함수 정의
    global ix, iy, drawing, rois, next_slot_id

    if event == cv2.EVENT_LBUTTONDOWN:
        # 드래그 시작 좌표 저장
        drawing = True
        ix, iy = x, y

    elif event == cv2.EVENT_LBUTTONUP:
        # 드래그 종료 좌표에서 슬롯 하나 등록
        drawing = False

        x1, y1 = ix, iy
        x2, y2 = x, y

        # 좌표 정규화
        x_min, x_max = min(x1, x2), max(x1, x2)
        y_min, y_max = min(y1, y2), max(y1, y2)

        polygon = [
            [x_min, y_min],
            [x_max, y_min],
            [x_max, y_max],
            [x_min, y_max],
        ]

        roi_obj = {
            "slot": next_slot_id,
            "polygon": polygon,
        }
        rois.append(roi_obj)
        print("ROI saved:", roi_obj)

        # 이미지에 박스와 슬롯 번호 표시
        cv2.rectangle(image, (x_min, y_min), (x_max, y_max), (0, 255, 0), 1)
        cv2.putText(
            image,
            str(next_slot_id),
            (x_min, y_min - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 0),
            1,
            cv2.LINE_AA,
        )

        next_slot_id += 1


image = cv2.imread(FRAME_PATH)
if image is None:
    raise RuntimeError("이미지 열기 실패")

cv2.namedWindow("ROI Selector")
cv2.setMouseCallback("ROI Selector", draw_roi)

while True:
    cv2.imshow("ROI Selector", image)
    if cv2.waitKey(1) & 0xFF == ord("q"):  # q누르면 종료
        break

cv2.destroyAllWindows()

data = {
    "buildingId": BUILDING_ID,
    "slots": rois,
}

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("ROI JSON save", OUTPUT_PATH)
