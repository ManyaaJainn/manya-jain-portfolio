import sys
from pypdf import PdfReader

try:
    reader = PdfReader("c:/Users/anshm/Documents/manya-jain-portfolio/assets/Manya_Jain_Resume.pdf")
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    print(text)
except Exception as e:
    print(f"Error: {e}")
