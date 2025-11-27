from ultralytics import YOLO

model = YOLO("yolo11n.pt")
model.train(
    data="parking.yaml",  # train/val 이미지 경로와 클래스 정의
    epochs=50,
    imgsz=640,
    device=0,
)