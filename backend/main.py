from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
import requests
import faiss
import numpy as np
import pickle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load embedding model once at startup
model = SentenceTransformer("all-MiniLM-L6-v2")


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def home():
    return {"message": "Sovereign AI Backend Running"}


@app.post("/chat")
def chat(req: ChatRequest):

    user_message = req.message.strip().lower()

    # Greetings
    greetings = ["hi", "hello", "hey", "hii"]

    if user_message in greetings:
        return {
            "response": "Hello! How can I help you today?"
        }

    try:
        # Load FAISS index
        index = faiss.read_index("vectorstore/faiss.index")

        # Load document chunks
        with open("vectorstore/chunks.pkl", "rb") as f:
            chunks = pickle.load(f)

        # Create embedding
        query_embedding = model.encode([req.message])

        # Search top 3 chunks
        D, I = index.search(
            np.array(query_embedding, dtype="float32"),
            k=3
        )

        best_distance = float(D[0][0])

        # If document is relevant -> Use RAG
        if best_distance < 1.0:

            context = ""

            for idx in I[0]:
                context += chunks[idx] + "\n\n"

            prompt = f"""
You are a document assistant.

Answer using ONLY the document context below.

Context:
{context}

Question:
{req.message}

Answer:
"""

            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": "qwen3:4b",
                    "prompt": prompt,
                    "stream": False
                }
            )

            result = response.json()

            return {
                "response": result["response"]
            }

    except Exception:
        pass

    # General AI Chat
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "qwen3:4b",
            "prompt": req.message,
            "stream": False
        }
    )

    result = response.json()

    return {
        "response": result["response"]
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text from PDF
    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:
        extracted = page.extract_text()

        if extracted:
            text += extracted + "\n"

    # Save extracted text
    with open("uploads/extracted_text.txt", "w", encoding="utf-8") as f:
        f.write(text)

    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "characters": len(text),
        "preview": text[:500]
    }