import os, tempfile, requests, json, shutil
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import frames_analyzer
import audio_analyzer
import debris_analyzer
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


class AnalyzeRequest(BaseModel):
    video_url: str
    lat: float
    lon: float

def download_to_temp(url: str, timeout: int = 180, min_size_bytes: int = 2000) -> str:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tmp_path = tmp.name
    tmp.close()
    try:
        with requests.get(url, stream=True, timeout=timeout) as r:
            r.raise_for_status()
            with open(tmp_path, "wb") as f:
                shutil.copyfileobj(r.raw, f)
    except requests.exceptions.RequestException as e:
        if os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except: pass
        raise HTTPException(status_code=400, detail=f"Video download failed: {e}")
    try:
        size = os.path.getsize(tmp_path)
    except Exception:
        size = 0
    if size < min_size_bytes:
        if os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except: pass
        raise HTTPException(status_code=400, detail=f"Downloaded file too small ({size} bytes). Check the video URL or permissions.")
    return tmp_path

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    try:
        tmp = download_to_temp(req.video_url)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download: {e}")
    try:
        timestamps = frames_analyzer.analyze_frames(tmp, frame_skip=3)
        audio_results = audio_analyzer.analyze_audio_for_timestamps(tmp, timestamps)
        human_detected = any(r["label"] == "human" for r in audio_results)
        combined = {
            "human_detected": human_detected,
            "lat": req.lat,
            "lon": req.lon,
            "timestamps": timestamps,
            "audio_analysis": audio_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {e}")
    finally:
        if os.path.exists(tmp):
            try: os.remove(tmp)
            except: pass
    return combined

@app.post("/analyze_debris")
def analyze_debris(req: AnalyzeRequest):
    """
    New route: detect debris objects in the video.
    Returns:
      {
        "debris_detected": bool,
        "lat": ...,
        "lon": ...,
        "detections": [ { "timestamp": 1.23, "detections": [ {xyxy, conf, cls}, ... ] }, ... ]
      }
    """
    try:
        tmp = download_to_temp(req.video_url)
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download: {e}")
    try:
        debris_results = debris_analyzer.detect_debris_in_video(tmp, frame_skip=2, min_confidence=0.25)
        debris_detected = len(debris_results) > 0
        out = {
            "debris_detected": debris_detected,
            "lat": req.lat,
            "lon": req.lon,
            "detections": debris_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debris detection error: {e}")
    finally:
        if os.path.exists(tmp):
            try: os.remove(tmp)
            except: pass
    return out

@app.get("/")
def health():
    return {"status": "ok"}


