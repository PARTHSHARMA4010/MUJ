# Write debris_analyzer module currently no debris.pt was found, hence debris analyzer is not wroking well

import cv2, os, json, tempfile
from ultralytics import YOLO

# Config - change model path if you have custom debris weights
DEBRIS_MODEL_PATH = "yolov8_debris.pt"  # change to your debris-specific model file
FRAME_SKIP = 2        # process every 2nd frame by default (tune for speed/accuracy)
MERGE_CLOSE_SEC = 0.5 # merge detections within this many seconds

_model = None
def _get_model(model_path=DEBRIS_MODEL_PATH):
    global _model
    if _model is None:
        _model = YOLO(model_path)
    return _model

def _parse_boxes(result):
    """
    Given results[0].boxes from ultralytics, return list of dicts:
    { 'xyxy': [x1,y1,x2,y2], 'conf': float, 'cls': int }
    """
    boxes = result.boxes
    out = []
    if boxes is None or len(boxes) == 0:
        return out
    xyxy = boxes.xyxy.cpu().numpy()
    confs = boxes.conf.cpu().numpy()
    cls = boxes.cls.cpu().numpy().astype(int)
    for i in range(len(xyxy)):
        out.append({
            "xyxy": [float(x) for x in xyxy[i].tolist()],
            "conf": float(confs[i]),
            "cls": int(cls[i])
        })
    return out

def detect_debris_in_video(video_path: str, frame_skip: int = FRAME_SKIP, min_confidence: float = 0.25):
    """
    Scans the input video for debris-like detections using YOLO.
    Returns a list of detections with timestamps:
      [ { "timestamp": float, "detections": [ {xyxy, conf, cls}, ... ] }, ... ]
    If you have class->name mapping in your model, map cls to names on the client side.
    """
    model = _get_model()
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError(f"Unable to open video: {video_path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    idx = 0
    frames_detections = []
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if idx % frame_skip == 0:
            try:
                results = model(frame)
                parsed = _parse_boxes(results[0])
                # filter by conf threshold
                parsed = [p for p in parsed if p["conf"] >= min_confidence]
                if parsed:
                    frames_detections.append({"timestamp": round(idx / fps, 3), "detections": parsed})
            except Exception as e:
                # don't crash entire run on one frame error; log and continue
                print("yolo error on frame", idx, ":", e)
        idx += 1
    cap.release()
    # Optionally merge very-close timestamps into a single event
    merged = []
    for d in frames_detections:
        if not merged:
            merged.append(d)
        else:
            if d["timestamp"] - merged[-1]["timestamp"] <= MERGE_CLOSE_SEC:
                # merge lists
                merged[-1]["detections"].extend(d["detections"])
            else:
                merged.append(d)
    return merged

# quick CLI test helper
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        print(detect_debris_in_video(sys.argv[1]))
