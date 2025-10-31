# 🔥 ThermalSaviour: AI-Powered Disaster Response Drone

**A 24-hour hackathon project for the Disaster Response theme (PS #8).**

Our project is a high-speed, AI-powered command center designed to find missing persons in disaster zones using autonomous drones equipped with thermal imaging.

We built a custom-trained YOLOv8 AI model that analyzes thermal video feeds to detect the heat signatures of trapped individuals, providing real-time alerts and GPS locations to rescue teams.

![A demo of the project]
*(Insert a screenshot or GIF of your React dashboard here!)*

---

## 🚀 The Problem

In a disaster like an earthquake or building collapse, the first few hours are critical for saving lives ("The Golden Hour"). Rescue teams are working against the clock, and visual searches are slow and ineffective, especially in the dark or with heavy debris.

## 💡 Our Solution

**ThermalSaviour** provides an intelligent "eye in the sky." We built a complete system that:
1.  **Ingests** thermal imagery from a drone (simulated for this hackathon).
2.  **Analyzes** the feed with a custom-trained YOLOv8 AI model that is *specifically optimized* to detect people in thermal (infrared) spectrums.
3.  **Exposes** this AI "brain" via a high-speed FastAPI backend.
4.  **Displays** real-time detections on a "Command Center" dashboard (built in React), plotting verified human heat signatures on a live map for rescue teams to act upon.

---

## ✨ Key Features

* **Custom-Trained AI Model:** We didn't use an "off-the-shelf" model. We fine-tuned a **YOLOv8-nano** model on a dataset of **15,000+ thermal images** to achieve high-accuracy, real-time "person" detection.
* **High-Speed API:** The backend is built with **FastAPI** (Python), capable of processing detection requests asynchronously and serving results as clean JSON.
* **Live Command Center:** The **React** frontend provides a dashboard with a file uploader for drone footage and a live `react-leaflet` map to visualize the exact GPS coordinates of survivors.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **AI Model** | `Python`, `YOLOv8`, `PyTorch`, `Roboflow`, `Google Colab` |
| **Backend** | `FastAPI`, `Uvicorn`, `python-multipart` |
| **Frontend** | `React.js`, `Axios` (for API calls), `react-leaflet` (for maps) |

---

## ⚙️ How It Works (System Architecture)

Our system is composed of two main services:

1.  **`drone-backend` (The AI Brain)**
    * A Python server built with **FastAPI**.
    * It loads our custom-trained **`best.pt`** model file.
    * It exposes a `/detect/` endpoint that accepts an image, runs the AI model on it, and returns JSON coordinates for any "person" detected.

2.  **`drone-frontend` (The Command Center)**
    * A modern **React** application.
    * Allows a user to upload a (simulated) thermal image from a drone.
    * Sends the image to the `/detect/` endpoint on the backend.
    * Receives the JSON response and plots a marker on a live map, showing the rescue team *exactly* where to go.

---

## 🏁 How to Run This Project

You will need two separate terminals to run the backend and frontend.

### 1. Backend (The AI Brain)

1.  Navigate to the `drone-backend` folder:
    ```bash
    cd drone-backend
    ```
2.  Activate the Python virtual environment:
    ```bash
    # On Windows (PowerShell)
    .\venv\Scripts\activate

    # On macOS/Linux
    source venv/bin/activate
    ```
3.  Install all required libraries:
    ```bash
    pip install -r requirements.txt
    ```
4.  Start the backend server:
    ```bash
    uvicorn main:app --reload
    ```
    ✅ **The backend is now running** at `http://127.0.0.1:8000`

### 2. Frontend (The Command Center)

1.  Open a **new terminal** and navigate to the `drone-frontend` folder:
    ```bash
    cd drone-frontend
    ```
2.  Install all required Node.js packages:
    ```bash
    npm install
    ```
3.  Start the frontend application:
    ```bash
    npm start
    ```
    ✅ **The frontend will automatically open** at `http://localhost:3000` in your browser. You can now use the app!

---

## 👥 Our Team

*(Add your team name and members here!)*
* [Your Name]
* [Teammate's Name]
* [Teammate's Name]