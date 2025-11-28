import cv2

cap = cv2.VideoCapture("test.mp4")
ret, frame = cap.read()
cv2.imwrite("palda_frame.jpg", frame)
