from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Read extracted text from PDF
with open("uploads/extracted_text.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Split into chunks
chunks = [text[i:i+500] for i in range(0, len(text), 500)]

# Create embeddings
embeddings = model.encode(chunks)

# Create FAISS index
index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(np.array(embeddings, dtype="float32"))

# Save index
faiss.write_index(index, "vectorstore/faiss.index")

# Save chunks
with open("vectorstore/chunks.pkl", "wb") as f:
    pickle.dump(chunks, f)

print("FAISS Index Created")
print("Vectors:", index.ntotal)