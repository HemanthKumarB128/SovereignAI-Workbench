from pypdf import PdfReader

reader = PdfReader("uploads/RESUME_HEMANTH.pdf")

text = ""

for page in reader.pages:
    text += page.extract_text() + "\n"

with open("uploads/extracted_text.txt", "w", encoding="utf-8") as f:
    f.write(text)

print("Text extracted successfully!")