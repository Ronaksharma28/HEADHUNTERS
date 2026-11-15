import re
from pathlib import Path
from typing import List, Dict
from pypdf import PdfReader

PDF_DIR = Path(__file__).resolve().parent.parent / "data" / "pdfs"

STOPWORDS = {
    "what", "when", "where", "which", "that", "this", "with", "from", "have",
    "does", "how", "why", "about", "into", "their", "there", "these", "those",
    "would", "could", "should", "explain", "tell", "give", "between", "nasa"
}

class PDFKnowledgeBase:
    def __init__(self, pdf_dir: Path = PDF_DIR):
        self.pdf_dir = pdf_dir
        self.pages: List[Dict[str, str | int]] = []
        self.files_summary: List[Dict[str, str | int]] = []
        self.load_all_pdfs()

    def load_all_pdfs(self) -> None:
        self.pages.clear()
        self.files_summary.clear()
        if not self.pdf_dir.exists():
            print(f"⚠️ PDF directory not found: {self.pdf_dir}", flush=True)
            return

        for pdf_path in sorted(self.pdf_dir.glob("*.pdf")):
            try:
                reader = PdfReader(str(pdf_path))
                page_count = len(reader.pages)
                for idx, page in enumerate(reader.pages, start=1):
                    raw_text = page.extract_text() or ""
                    clean_text = re.sub(r"\s+", " ", raw_text).strip()
                    if clean_text:
                        self.pages.append({
                            "file": pdf_path.name,
                            "page": idx,
                            "text": clean_text,
                            "lower": clean_text.lower(),
                        })
                self.files_summary.append({"file": pdf_path.name, "pages": page_count})
            except Exception as err:
                print(f"⚠️ Failed to read {pdf_path.name}: {err}", flush=True)

        print(
            f"✅ Indexed {len(self.pages)} pages across {len(self.files_summary)} NASA PDFs.",
            flush=True,
        )

    def search(self, query: str, top_k: int = 8) -> str:
        if not self.pages:
            return "No PDF documents are currently loaded in backend/data/pdfs/."

        tokens = [
            t for t in re.findall(r"[a-z0-9\-]+", query.lower())
            if len(t) >= 3 and t not in STOPWORDS
        ]

        scored = []
        for entry in self.pages:
            text_lower = entry["lower"]
            file_lower = str(entry["file"]).lower()
            score = 0
            for tok in tokens:
                if tok in file_lower:
                    score += 6  # Boost when query names the experiment (e.g., saffire, sofie, daft)
                occurrences = text_lower.count(tok)
                if occurrences:
                    score += min(occurrences, 5) * 2
            if score > 0:
                scored.append((score, entry))

        scored.sort(key=lambda item: item[0], reverse=True)
        selected = [item[1] for item in scored[:top_k]]

        # Fallback for broad questions: return Page 1 executive summaries across loaded PDFs
        if not selected:
            selected = [p for p in self.pages if p["page"] == 1][:top_k]

        chunks = [
            f"[Document: {p['file']} | Page {p['page']}]\n{p['text']}"
            for p in selected
        ]
        return "\n\n---\n\n".join(chunks)

kb = PDFKnowledgeBase()