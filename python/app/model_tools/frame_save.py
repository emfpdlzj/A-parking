import cv2

cap = cv2.VideoCapture("test.mp4")
if not cap.isOpened():
    print("비디오 파일을 열 수 없음.")
    exit(1)

ret, frame = cap.read()
if not ret:
    print("첫 번째 프레임을 읽지 못했음.")
    cap.release()
    exit(1)

cv2.imwrite("palda_frame.jpg", frame)
cap.release() #리소스 해제 