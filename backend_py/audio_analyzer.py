# Write audio_analyzer module
from pydub import AudioSegment
import webrtcvad
from typing import List, Dict

# Config
SAMPLE_RATE = 16000
VAD_FRAME_MS = 30
SPEECH_RATIO_THRESHOLD = 0.3
VAD_AGGRESSIVENESS = 2

def _bytes_from_audio(video_path: str):
    """
    Extract audio via pydub, return raw PCM bytes (16-bit little-endian mono, SAMPLE_RATE Hz)
    """
    audio = AudioSegment.from_file(video_path)
    audio = audio.set_frame_rate(SAMPLE_RATE).set_channels(1).set_sample_width(2)
    return audio.raw_data

def _frames_from_bytes(raw_bytes: bytes, sample_rate: int, frame_ms: int):
    n = int(sample_rate * (frame_ms / 1000.0) * 2)
    offset = 0
    while offset + n <= len(raw_bytes):
        yield raw_bytes[offset:offset+n]
        offset += n

def analyze_audio_for_timestamps(video_path: str, timestamps: List[float], window_sec: float = 2.0):
    """
    For each timestamp (seconds), analyze +/- window_sec/2 using webrtcvad
    Returns list of dicts: {"timestamp": t, "speech_ratio": r, "label": "human"/"not_human"}
    """
    raw_bytes = _bytes_from_audio(video_path)
    sr = SAMPLE_RATE
    vad = webrtcvad.Vad(VAD_AGGRESSIVENESS)
    results = []
    for t in timestamps:
        start_time = max(0.0, t - window_sec/2.0)
        start_byte = int(start_time * sr) * 2
        end_byte = int((start_time + window_sec) * sr) * 2
        window = raw_bytes[start_byte:end_byte]
        if len(window) < 2:
            results.append({"timestamp": t, "speech_ratio": 0.0, "label": "not_human"})
            continue
        frames = list(_frames_from_bytes(window, sr, VAD_FRAME_MS))
        if not frames:
            results.append({"timestamp": t, "speech_ratio": 0.0, "label": "not_human"})
            continue
        speech_frames = sum(1 for f in frames if vad.is_speech(f, sr))
        ratio = speech_frames / len(frames)
        label = "human" if ratio >= SPEECH_RATIO_THRESHOLD else "not_human"
        results.append({"timestamp": t, "speech_ratio": round(ratio,3), "label": label})
    return results

# quick local test helper
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        v = sys.argv[1]
        ts = [float(x) for x in sys.argv[2:]]
        print(analyze_audio_for_timestamps(v, ts))
