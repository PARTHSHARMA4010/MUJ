🦅 Eagle Eye: Drone-Based Survivor Detection

A multi-sensor drone system using AI-driven sound and vision fusion to locate missing persons in disaster zones.

Project for MUJ HACKX 3.0 (PS 8: C-DAC) by Team Yogi

<p align="center">
<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
<img src="https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=yolo&logoColor=black" alt="YOLOv8" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
<img src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" />
</p>

📖 Table of Contents

About the Project

The Challenge

Our Solution

✨ Core Features

🔧 Tech Stack & Architecture

🚀 Getting Started (Setup)

Prerequisites

Frontend Installation

📡 Backend Details (Google Colab)

📟 Application Modes

Problem Statement

In the chaotic aftermath of disasters like earthquakes, survivors trapped in rubble may be impossible to see. Their cries for help often go unheard, and conventional search methods are slow, dangerous for rescue teams, and limited by complex terrain.

Our Solution

Eagle Eye is an autonomous drone system developed to address this challenge. It integrates high-sensitivity microphone arrays and advanced cameras (visual and thermal) to detect human presence through both sound and visual cues.

Our core innovation is AI Audio-Visual Fusion. The system doesn't just look for people or listen for cries; it does both simultaneously. An AI model analyzes multi-sensor data to confirm a survivor only when human-like sounds and visual evidence are correlated. This drastically reduces false positives from environmental noise, providing a reliable "eyes and ears in the sky" for rescue teams.

✨ Core Features

🎤 Audio Localization: Uses microphone arrays to detect and pinpoint human voice frequencies amidst debris noise.

🤖 AI Audio-Visual Fusion: Combines sound detection (e.g., YAMNet) with visual confirmation (e.g., YOLOv8) to dramatically reduce false positives and increase detection reliability.

🗺 GPS Mapping Dashboard: A live Next.js web app provides a real-time rescue dashboard. Confirmed survivor coordinates are instantly marked on a Google Map.

🚨 Real-Time Alert Workflow: The system triggers "Possible Survivor Detected" messages to the dashboard, complete with image/audio evidence.

🌡 Thermal Imaging: Integrates thermal video feeds for effective nighttime operations or detecting heat signatures in low-visibility conditions.

🔇 AI Noise Filtering: Advanced filtering to distinguish human sounds from environmental noise (wind, machinery, etc.).

🔧 Tech Stack & Architecture

This project is a multi-modal system with a distinct frontend, backend, and AI processing pipeline.

Component

Technology

Purpose

Frontend

Next.js

Provides the live rescue dashboard for command centers.



Google Maps API

Renders live GPS coordinates of detected survivors.



WebSockets

Receives real-time alerts and data from the backend.

Backend

Python (Flask)

Serves the AI models and handles data processing.



WebRTC / RTSP

Manages live video and audio streams from the drone.

AI / ML

YOLOv8

Real-time object detection for visual confirmation (people, body parts).



YAMNet

Audio classification to detect human voice patterns.



FastReID

Feature extraction for target matching.



Chroma DB

Vector database for storing and matching embeddings.

Database

MongoDB

Stores critical data (coordinates, timestamps, image evidence).

Services

ImageKit

Handles storage and delivery of image evidence.

🚀 Getting Started (Setup)

Prerequisites

Node.js (LTS version)

npm or yarn

Frontend Installation

Clone the repository:

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)


Navigate to the frontend directory:

cd frontend_infinite_loop


Install dependencies:

npm install


Create your Environment File:
Create a new file named .env in the /frontend_infinite_loop/ directory. Copy the contents below and paste in your new file.

# --- ImageKit API Keys ---
NEXT_PUBLIC_PUBLIC_KEY="public_2KZkndsBlblHX0utm/5KRxPfp9E="
PRIVATE_KEY="private_4pVOwljbsMAkRv2+m86aK9QLcho="
NEXT_PUBLIC_URL_ENDPOINT="[https://ik.imagekit.io/nwt5ajirj](https://ik.imagekit.io/nwt5ajirj)"

# --- Google Maps API Keys ---
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDn2Yk0lbcG8QB27u6V8m5SmLqDv6NZLZI"
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID="4acef850c27cf729bf4797e8"

# --- Backend URL ---
NEXT_PUBLIC_COLLAB_PUBLIC_URL="[https://b6c60bee3e6d.ngrok-free.app](https://b6c60bee3e6d.ngrok-free.app)"


Run the development server:

npm run dev


Open http://localhost:3000 in your browser.

📡 Backend Details (Google Colab)

Our backend, which runs the computationally intensive AI models (YOLO, YAMNet), is built to run in a Google Colab environment to leverage free GPU access.

Code: All backend Python scripts and notebooks are available in the /backend_py/ directory for review.

Hosting: The Colab notebook uses ngrok to create a public URL, allowing the Next.js frontend to communicate with it.

⚠ IMPORTANT NOTE:
The NEXT_PUBLIC_COLLAB_PUBLIC_URL in your .env file will change every time a new Colab session is started. Due to session timeouts, the backend may disconnect. If the frontend shows CORS errors or fails to fetch data, it is likely because the ngrok URL has expired and needs to be updated.

The Restricted Area Mode route is designed to work even if the backend is offline.

📟 Application Modes

The Eagle Eye platform provides several modes for rescue operations:

Home Page: The main landing and dashboard view.

Target Detection Mode: The primary operation mode, fusing live video and audio to find survivors.

Demo CCTV Upload Page: Allows uploading pre-recorded footage for analysis.

Thermal Imaging: Switches to the thermal camera feed for nighttime or low-visibility searches.

Crowd Management Mode: A secondary function for monitoring crowd density and flow in safe zones.