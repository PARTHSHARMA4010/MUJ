import subprocess, sys, time
from pyngrok import ngrok, conf
import shutil


conf.get_default().auth_token = "2tAbObTvZpTiW1TEvyKx4FkP8vc_4tkvXreqAfBdEhtfmzRJP"

uvicorn_cmd = [sys.executable, "-m", "uvicorn", "main_api:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info"]
print("Starting uvicorn:", " ".join(uvicorn_cmd))
proc = subprocess.Popen(uvicorn_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# allow server to boot
time.sleep(3)

public_tunnel = ngrok.connect(addr=8000, bind_tls=True)
public_url = public_tunnel.public_url
print("Public URL (ngrok):", public_url)
print("Open docs at:", public_url + "/docs")

t0 = time.time()
while time.time() - t0 < 10:
    line = proc.stdout.readline()
    if line:
        print(line, end='')
print("Server started. Use /analyze for human+audio, /analyze_debris for debris detection.")
print("Ngrok logs:")
for log in ngrok.get_ngrok_process().proc.stdout:
    print(log, end='')

proc