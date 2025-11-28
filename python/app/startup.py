from app.cache import roi_cache
from app.model_tools.yolo_car_detector import YoloCarDetector
from app.stream_worker import start_stream_worker
from app.state_global import set_yolo_detector


async def initialize_all():
    # 1) ROI 캐싱
    for building in ["paldal", "library", "yulgok", "yeonam"]:
        await roi_cache.load(building)

    # 2) YOLO 모델 로드
    yolo = YoloCarDetector("yolo11n.pt")
    set_yolo_detector(yolo)

    print("모든 초기화 완료. 스트림 작업 시작.")

    # 3) 스트림 자동 시작
    await start_stream_worker()
