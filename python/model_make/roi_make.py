import cv2
import json

rois = []
drawing = False
ix, iy = -1, -1


def draw_roi(event, x, y, flags, param):
    global ix, iy, drawing, rois

    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y

    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False
        rois.append({"x1": ix, "y1": iy, "x2": x, "y2": y})
        print("ROI saved:", rois[-1])


image = cv2.imread("frame1.jpg")
cv2.namedWindow("ROI Selector")
cv2.setMouseCallback("ROI Selector", draw_roi)

while True:
    cv2.imshow("ROI Selector", image)
    if cv2.waitKey(1) & 0xFF == ord("q"):  # q 누르면 종료
        break

cv2.destroyAllWindows()

with open("roi1.json", "w") as f:
    json.dump(rois, f, indent=4)
