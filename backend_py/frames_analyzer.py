
import cv2
from ultralytics import YOLO
import tempfile
import os

# Config - change if needed
YOLO_MODEL_PATH = "yolov8n.pt"
PERSON_CLASS_ID = 0
DEFAULT_FRAME_SKIP = 3

# Load model lazily to avoid repeated downloads
_model = None
def _get_model():
    global _model
    if _model is None:
        _model = YOLO(YOLO_MODEL_PATH)
    return _model

def analyze_frames(video_path: str, frame_skip: int = DEFAULT_FRAME_SKIP, merge_close: float = 1.0):
    """
    Returns list of timestamps (seconds) where a person was detected.
    """
    model = _get_model()
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Unable to open video: " + str(video_path))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    idx = 0
    timestamps = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % frame_skip == 0:
            results = model(frame)
            boxes = results[0].boxes
            if boxes is not None and len(boxes) > 0:
                classes = boxes.cls.cpu().numpy()
                if (classes == PERSON_CLASS_ID).any():
                    timestamps.append(idx / fps)
        idx += 1
    cap.release()
    # merge nearby timestamps
    merged = []
    for t in timestamps:
        if not merged or t - merged[-1] > merge_close:
            merged.append(t)
    return merged

# small helper for quick local tests (optional)
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        path = sys.argv[1]
        print("Analyzing frames in:", path)
        print("Timestamps:", analyze_frames(path))
