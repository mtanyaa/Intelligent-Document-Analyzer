import os
import cv2
import json
import numpy as np
import re
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
from ultralytics import YOLO
from sentence_transformers import SentenceTransformer, util
from datetime import datetime
from pathlib import Path
import unicodedata

INPUT_PDF_DIR = "/app/input"
INTERMEDIATE_DIR = "/app/output/intermediate"
FINAL_OUTPUT_PATH = "/app/output/semantic_filtered_output.json"
os.makedirs(INTERMEDIATE_DIR, exist_ok=True)

with open(os.path.join(INPUT_PDF_DIR, "input_config.json"), "r", encoding="utf-8") as f:
    config = json.load(f)
persona = config["persona"]
job_to_be_done = config["job_to_be_done"]

YOLO_MODEL_PATH = "/app/yolov8n-doclaynet.pt"
SENTENCE_MODEL_PATH = "/app/all-MiniLM-L12-v2"
yolo_model = YOLO(YOLO_MODEL_PATH)
sem_model = SentenceTransformer(SENTENCE_MODEL_PATH)

def is_valid_heading(text, is_title=False):
    if not text: return False
    text = text.strip()
    if not is_title and len(text.split()) > 15: return False
    footer_patterns = [
        r"^page\\s+\\d+", r"^\\d+\\s+of\\s+\\d+", r"^(version|copyright)\\s+",
        r"^\\d{1,2}/\\d{1,2}/\\d{2,4}$",
        r"^(january|february|march|april|may|june|july|august|september|october|november|december)\\s+\\d{1,2}(st|nd|rd|th)?,\\s+\\d{4}$",
        r"^\\d{1,2}\\s+(january|february|march|april|may|june|july|august|september|october|november|december)\\s+\\d{4}$",
    ]
    if any(re.match(pattern, text.lower()) for pattern in footer_patterns): return False
    if not re.search(r"[a-zA-Z]", text) and not re.match(r"^[IVXLCDMivxlcdm]+\\.?\\s*|\\d+\\.?\\s*|[A-Za-z]\\.?\\s*", text): return False
    return True

def clean_text(text):
    if not isinstance(text, str):
        return ""
    return unicodedata.normalize("NFKD", text).encode("utf-8", "ignore").decode("utf-8")

for pdf_path in sorted(Path(INPUT_PDF_DIR).glob("*.pdf")):
    try:
        if pdf_path.name == "input_config.json": continue
        pages = convert_from_path(str(pdf_path), dpi=300)
        results = []
        title = None

        for page_idx, pil_img in enumerate(pages, start=1):
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            det = yolo_model(img)[0]
            ocr_data = pytesseract.image_to_data(img, config="--psm 6", output_type=pytesseract.Output.DICT)

            words_with_pos = [
                dict(
                    text=ocr_data["text"][i].strip(),
                    x=ocr_data["left"][i],
                    y=ocr_data["top"][i],
                    w=ocr_data["width"][i],
                    h=ocr_data["height"][i]
                )
                for i in range(len(ocr_data["text"])) if ocr_data["text"][i].strip()
            ]

            heading_boxes = []
            for box in det.boxes:
                cls = int(box.cls[0])
                label = yolo_model.names[cls].lower()
                if label not in ("title", "section-header"): continue
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                crop = img[y1:y2, x1:x2]
                crop_text = pytesseract.image_to_string(crop, config="--psm 6").strip()
                crop_text = clean_text(crop_text)
                is_title = page_idx == 1 and title is None and label == "title"
                if is_valid_heading(crop_text, is_title=is_title):
                    if is_title:
                        title = crop_text
                    else:
                        heading_boxes.append({
                            "text": crop_text,
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "y": y1
                        })

            heading_boxes.sort(key=lambda b: b["y"])

            for idx, heading in enumerate(heading_boxes):
                y_start = heading["y"]
                y_end = heading_boxes[idx + 1]["y"] if idx + 1 < len(heading_boxes) else img.shape[0]
                span_text = " ".join(w["text"] for w in words_with_pos if y_start <= w["y"] < y_end)
                heading["page"] = page_idx
                heading["raw_page_text"] = clean_text(f"{heading['text']}\n{span_text}")
                del heading["y"]
                results.append(heading)

        if title is None:
            title = results[0]["text"] if results else "Untitled Document"

        output = {
            "title": clean_text(title),
            "outline": results
        }
        out_path = os.path.join(INTERMEDIATE_DIR, f"{pdf_path.stem}_headings_plus_text.json")
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to process {pdf_path}: {e}")

metadata = {
    "input_documents": [],
    "persona": persona,
    "job_to_be_done": job_to_be_done,
    "processing_timestamp": datetime.now().isoformat()
}
extracted_sections = []
subsection_analysis = []

job_embedding = sem_model.encode(job_to_be_done, convert_to_tensor=True)

for file_path in Path(INTERMEDIATE_DIR).glob("*_headings_plus_text.json"):
    with open(file_path, "r", encoding="utf-8") as f:
        input_data = json.load(f)

    input_filename = file_path.name.replace("_headings_plus_text.json", ".pdf")
    metadata["input_documents"].append(input_filename)

    sections = [
        (section, section.get("text", "").strip().lower(), section.get("raw_page_text", "").strip())
        for section in input_data.get("outline", [])
        if section.get("text", "").strip() and section.get("raw_page_text", "").strip() and len(section.get("raw_page_text", "").split()) >= 10
    ]

    if not sections:
        continue

    headings = [title for _, title, _ in sections]
    heading_embeddings = sem_model.encode(headings, convert_to_tensor=True, show_progress_bar=False)

    candidate_sections = []
    similarities = []
    for (section, title, raw_text), heading_emb in zip(sections, heading_embeddings):
        similarity = float(util.cos_sim(job_embedding, heading_emb)[0][0])
        similarities.append(similarity)
        candidate_sections.append((similarity, section, raw_text))

    max_similarity = max(similarities) if similarities else 0.0
    normalized_similarities = [s / max_similarity if max_similarity > 0 else s for s in similarities]
    SIMILARITY_THRESHOLD = max(0.6, min(np.percentile(normalized_similarities, 75), 0.8))
    candidate_sections = [
        (score, section, text)
        for (score, section, text), norm_score in zip(candidate_sections, normalized_similarities)
        if norm_score >= SIMILARITY_THRESHOLD
    ]
    candidate_sections.sort(reverse=True, key=lambda x: x[0])

    for rank, (score, section, refined_text) in enumerate(candidate_sections[:5], start=1):
        extracted_sections.append({
            "document": input_filename,
            "section_title": clean_text(section["text"]),
            "importance_rank": rank,
            "page_number": section["page"]
        })
        subsection_analysis.append({
            "document": input_filename,
            "refined_text": clean_text(refined_text.replace("\n", " ").strip()),
            "page_number": section["page"]
        })

final_output = {
    "metadata": metadata,
    "extracted_sections": extracted_sections,
    "subsection_analysis": subsection_analysis
}
with open(FINAL_OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(final_output, f, indent=2, ensure_ascii=False)
