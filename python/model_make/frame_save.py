import cv2

cap = cv2.VideoCapture("parking1.mp4")
ret, frame = cap.read()
cv2.imwrite("frame.jpg", frame)
