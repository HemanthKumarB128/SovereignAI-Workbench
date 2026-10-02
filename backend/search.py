from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import pickle

model = SentenceTransformer("all-MiniLM-L6-v2")

index = faiss.read_index("vectorstore/faiss.index")

with open("vectorstore/chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

query = input("Ask: ")

query_embedding = model.encode([query])

D, I = index.search(
    np.array(query_embedding, dtype="float32"),
    k=3
)

print("\nTop Results:\n")

for idx in I[0]:
    print(chunks[idx])
    print("-" * 50)