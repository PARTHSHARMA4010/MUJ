from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import os

# --- Load Your Custom AI Model ---
# This is the key! We load your 'best.pt' file right when the server starts.
# Make sure the path is correct relative to where you run 'uvicorn'.
model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
print(f"Attempting to load model from: {model_path}")

try:
    # Load your custom-trained YOLOv8 model
    model = YOLO(model_path)
    print("--- Model loaded successfully! ---")
except Exception as e:
    print(f"--- FATAL ERROR: Could not load model. ---")
    print(f"Error: {e}")
    # If the model fails to load, you might want to exit or handle it
    # For now, we'll just print the error.
    model = None
# ---------------------------------


# Create the FastAPI app instance
app = FastAPI(title="Thermal Person Detection API")

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# --- API Endpoints ---

@app.get("/")
def read_root():
    """
    A simple endpoint to check if the server is running.
    """
    return {"status": "ok", "message": "Welcome to the Drone Detection API!"}


@app.post("/detect/")
async def detect_persons(file: UploadFile = File(...)):
    """
    This is the new endpoint that processes an image.
    It receives an uploaded file, runs the AI model on it,
    and returns the detection results.
    """
    if not model:
        return {"error": "Model is not loaded. Check server logs."}

    # 1. Read the image file from the request
    image_data = await file.read()
    
    # 2. Convert the image data (bytes) into a format PIL (Image) can understand
    image = Image.open(io.BytesIO(image_data))
    
    # 3. Run the AI model on the image
    #    verbose=False makes it run quietly
    results = model(image, verbose=False)
    
    # 4. Process the results
    detections = []
    
    # results[0].boxes gives us all detected bounding boxes
    for box in results[0].boxes:
        # Get coordinates (top-left x, top-left y, bottom-right x, bottom-right y)
        xyxy = box.xyxy[0].tolist() 
        
        # Get the confidence score (how sure the model is)
        confidence = box.conf[0].item()
        
        # Get the class ID (it's '0' for 'person')
        class_id = int(box.cls[0].item())
        
        # Get the class name from the model's internal names list
        class_name = model.names[class_id]
        
        # Store our simplified detection result
        detections.append({
            "class_name": class_name,
            "confidence": round(confidence, 4),
            "bounding_box": {
                "x_min": round(xyxy[0], 2),
                "y_min": round(xyxy[1], 2),
                "x_max": round(xyxy[2], 2),
                "y_max": round(xyxy[3], 2),
            }
        })

    # 5. Return the list of all detections
    return {
        "filename": file.filename,
        "detections": detections
    }