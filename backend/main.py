from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import pytesseract
from PIL import Image
import requests
import io
import os
from dotenv import load_dotenv

load_dotenv()

# Update this path to match your Tesseract installation
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = FastAPI()

# -----------------------------
# Allow Next.js frontend
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# ROUTE 1: Extract text from file
# -----------------------------
@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_bytes = await file.read()
    content_type = file.content_type

    # --- PDF Extraction ---
    if content_type == "application/pdf":
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text() or ""
                text += page_text + "\n"
        return {"text": text}

    # --- IMAGE OCR ---
    elif content_type.startswith("image/"):
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return {"text": text}

    else:
        return {"error": "Unsupported file type"}


# -----------------------------
# ROUTE 2: Analyze text using Gemini API
# -----------------------------
@app.post("/analyze")
async def analyze(payload: dict):
    text = payload.get("text", "")

    if not text.strip():
        return {"error": "Empty text received"}

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {"error": "Gemini API key missing in environment variables"}

    prompt = f"""
Give a short, simple summary of the content below.
Explain what is going on in 5 lines maximum.
Use easy words so anyone can understand.

Text:
{text}
"""

    # Gemini API endpoint with current stable model (Gemini 2.5 Flash)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"

    try:
        response = requests.post(
            url,
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            },
            headers={"Content-Type": "application/json"},
            timeout=30
        )

        # Check if request was successful
        if response.status_code != 200:
            return {
                "error": f"Gemini API error: {response.status_code}",
                "details": response.text
            }

        data = response.json()

        # Extract the result safely
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                result = candidate["content"]["parts"][0]["text"]
                return {"analysis": result}
        
        # If we couldn't extract the result, return the raw response for debugging
        return {
            "error": "Unexpected API response format",
            "raw": data
        }

    except requests.exceptions.Timeout:
        return {"error": "Request to Gemini API timed out"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"Error processing response: {str(e)}"}