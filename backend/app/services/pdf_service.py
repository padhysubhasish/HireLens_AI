import re

import fitz  # PyMuPDF


class PDFExtractionError(Exception):
    """Raised for corrupted PDFs, empty PDFs, or scanned/image-only PDFs."""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise PDFExtractionError("The uploaded file could not be opened. It may be corrupted.") from exc

    try:
        raw_text_parts = [page.get_text() for page in doc]
    finally:
        doc.close()

    raw_text = "\n".join(raw_text_parts)
    cleaned = _clean_text(raw_text)

    if len(cleaned) < 30:
        raise PDFExtractionError(
            "We could not extract readable text from this PDF. "
            "Please upload a text-based PDF (scanned/image-only PDFs are not supported)."
        )

    return cleaned


def _clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def guess_candidate_name(resume_text: str, fallback: str = "Candidate") -> str:
    """Best-effort guess: the first non-empty line that looks like a name."""
    for line in resume_text.splitlines()[:5]:
        line = line.strip()
        if 2 <= len(line.split()) <= 4 and len(line) < 60 and not any(ch.isdigit() for ch in line):
            return line
    return fallback
