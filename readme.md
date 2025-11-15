# AI Content Analyzer

A web app that extracts text from PDFs and images, then summarizes them using Google's Gemini AI.

## What it does

Upload a PDF or image, and the app will:
- Extract all the text from it
- Give you a quick summary of what it's about

Pretty straightforward. Useful for quickly understanding documents without reading the whole thing.

## Tech used

**Frontend:**
- Next.js 14
- React 18

**Backend:**
- FastAPI (Python)
- pdfplumber for PDFs
- Tesseract OCR for images
- Google Gemini API for the AI summaries

## What you need before starting

- Node.js (version 18 or newer)
- Python 3.8+
- Tesseract OCR - you can download it from [here](https://github.com/UB-Mannheim/tesseract/wiki)
- A Gemini API key - get one [here](https://aistudio.google.com/app/apikey)

## Setup

### Frontend

```bash
npm install
npm run dev
```

Runs on `http://localhost:3000`

### Backend

```bash
cd backend

# Make a virtual environment 
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install requirements
pip install -r requirements.txt
```

Create a `.env` file in the backend folder:

```
GEMINI_API_KEY=your_api_key_here
```

Update the Tesseract path in `backend/main.py` around line 13:

```python
# Windows
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Mac (with Homebrew)
pytesseract.pytesseract.tesseract_cmd = r"/usr/local/bin/tesseract"

# Linux
pytesseract.pytesseract.tesseract_cmd = r"/usr/bin/tesseract"
```

Start the server:

```bash
uvicorn main:app --reload
```

Runs on `http://127.0.0.1:8000`

## How to use

1. Go to `http://localhost:3000`
2. Drag and drop a file or click to upload (PDF or image)
3. Hit "Analyze Content"
4. Wait a bit - you'll see the extracted text and a summary

## File structure

```
├── app/
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
├── package.json
└── README.md
```

## API endpoints

**POST /extract** - Send a file, get back the extracted text

**POST /analyze** - Send text, get back a summary

## Supported files

PDFs (.pdf) and images (.png, .jpg, .jpeg)

## Common issues

**"Tesseract not found"**
Install Tesseract and fix the path in main.py

**"Gemini API error: 404"**
Make sure you're using gemini-2.5-flash (the older 1.5 models don't work anymore)

**Drag and drop doesn't work**
Use the updated page.jsx file

**CORS errors**
Check that the backend is running on port 8000

## Notes

- The Gemini API is free up to a certain limit, check Google's pricing if you're planning heavy usage
- OCR works best with clear, high-quality images
- Large PDFs might take a few seconds to process

That's about it. Clone it, set it up, and you're good to go.