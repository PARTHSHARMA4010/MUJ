# 🦅 *Eagle Eye: Drone-Based Survivor Detection*

Eagle Eye is an AI-powered, multi-sensor drone system designed to locate missing persons in disaster zones. By fusing sound and vision detection, it provides a reliable and autonomous solution for rescue teams to identify survivors trapped in rubble or debris.

Deployed Link - https://eagleeye-khaki.vercel.app/
---

## 📌 *Table of Contents*

- [🔍 Problem Statement](#-problem-statement)
- [💡 Our Solution](#-our-solution)
- [✨ Core Features](#-core-features)
- [🛠 Tech Stack & Architecture](#%EF%B8%8F-tech-stack--architecture)
- [🚀 Getting Started (Setup)](#-getting-started-setup)
- [📡 Backend Details (Google Colab)](#-backend-details-google-colab)
- [🌐 Application Modes](#-application-modes)
- [📸 Snapshots](#-snapshots)
- [📊 Impact and Scalability](#-impact-and-scalability)

---

## 🔍 *Problem Statement*

In the chaotic aftermath of disasters like earthquakes, survivors trapped in rubble may be impossible to see. Their cries for help often go unheard, and conventional search methods are slow, dangerous for rescue teams, and limited by complex terrain.

---

## 💡 *Our Solution*

Eagle Eye is an autonomous drone system developed to address this challenge. It integrates *high-sensitivity microphone arrays* and *advanced cameras (visual and thermal)* to detect human presence through both sound and visual cues.

Our core innovation is *AI Audio-Visual Fusion*, which analyzes multi-sensor data to confirm a survivor only when human-like sounds and visual evidence are correlated. This drastically reduces false positives from environmental noise, providing a reliable "eyes and ears in the sky" for rescue teams.

---

## ✨ *Core Features*

- 🎤 *Audio Localization* – Uses microphone arrays to detect and pinpoint human voice frequencies amidst debris noise.  
- 🤖 *AI Audio-Visual Fusion* – Combines sound detection (YAMNet) with visual confirmation (YOLOv8) to drastically reduce false positives.  
- 🗺 *GPS Mapping Dashboard* – Live Next.js dashboard marks survivor coordinates on a Google Map.  
- 🚨 *Real-Time Alerts* – Immediate “Possible Survivor Detected” messages with image/audio evidence.  
- 🌡 *Thermal Imaging* – Effective at night or in low-visibility conditions using thermal feeds.  
- 🔇 *AI Noise Filtering* – Distinguishes human sounds from environmental noise.  

---

## 🛠 *Tech Stack & Architecture*

| *Component* | *Technology* | *Purpose* |
|----------------|----------------|-------------|
| *Frontend* | Next.js, Google Maps API, WebSockets | Real-time rescue dashboard and survivor mapping |
| *Backend* | Python (Flask), WebRTC/RTSP | Manages live audio/video streams and AI model API |
| *AI / ML* | YOLOv8, YAMNet, FastReID, ChromaDB | Real-time object detection, sound classification, and feature extraction |
| *Database* | MongoDB | Stores coordinates, timestamps, and evidence |
| *Services* | ImageKit | Image storage and delivery |

---

## 🚀 *Getting Started (Setup)*

### *Prerequisites*
- Node.js (LTS version)
- npm or yarn

### *1. Clone the Repository*
```bash
git clone https://github.com/your-username/your-repo-name.git
2. Navigate to the Frontend Directory
bash
Copy code
cd frontend_infinite_loop
3. Install Dependencies
bash
Copy code
npm install
4. Create Your Environment File
Create a new file named .env in the /frontend_infinite_loop/ directory and add the following:

env
Copy code
# --- ImageKit API Keys ---
NEXT_PUBLIC_PUBLIC_KEY="public_2Zkndsl1hXOutn/SKRxpfp9E="
PRIVATE_KEY="private_4pVOwljbsMAkRv2+m86aK9QLcho="
NEXT_PUBLIC_URL_ENDPOINT="https://ik.imagekit.io/nwt5qjirj"

# --- Google Maps API Keys ---
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzoSyDn2Yk01bcG8OB27u6V8m5SmLqDv6NZLZI"
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="4ace6850c27cf729bf4797e8"

# --- Backend URL ---
NEXT_PUBLIC_COLAB_PUBLIC_URL="https://b6c60bee3e6d.ngrok-free.app"
5. Run the Development Server
bash
Copy code
npm run dev
Now open: http://localhost:3000

📡 Backend Details (Google Colab)
Our backend runs in a Google Colab environment to leverage free GPU access.

Code Location: /backend_py/ directory

Hosting: Uses ngrok to create a public URL for frontend-backend communication

⚠ Important Note:
Each time Colab restarts, the ngrok URL changes.
If the frontend shows CORS or fetch errors, update the .env file with the new URL.

🌐 Application Modes
🏠 Home Page – Main landing & dashboard view

🎯 Target Detection Mode – Fuses live video and audio to find survivors

📹 Demo CCTV Upload Page – Analyze pre-recorded disaster footage

🌡 Thermal Imaging Mode – For nighttime operations

👥 Crowd Management Mode – Monitors crowd density in relief zones