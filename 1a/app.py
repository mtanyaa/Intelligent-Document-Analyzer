import os
import cv2
import json
import numpy as np
import re
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
from ultralytics import YOLO
from glob import glob
import torch
import unicodedata


INPUT_DIR = "/app/input"
OUTPUT_DIR = "/app/output"
MODEL_PATH = "/app/yolov8n-doclaynet.pt"

os.makedirs(OUTPUT_DIR, exist_ok=True)

if not os.path.exists(MODEL_PATH):
    print(f"Downloading YOLO model to {MODEL_PATH}")
    model_dir = os.path.dirname(MODEL_PATH)
    os.makedirs(model_dir, exist_ok=True)
    os.system(f"wget -q --show-progress https://huggingface.co/hantian/yolo-doclaynet/resolve/main/yolov8n-doclaynet.pt -O {MODEL_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Failed to download YOLO model at {MODEL_PATH}")

model = YOLO(MODEL_PATH)

selected_files = sorted(glob(os.path.join(INPUT_DIR, "*.pdf")))
if not selected_files:
    print(f" No PDF files found in {INPUT_DIR}. Exiting.")
    exit()

def is_valid_heading(text, is_title=False):
    if not text:
        return False
    text = text.strip()

    if not is_title and len(text.split()) > 15:
        return False

    footer_patterns = [
        r"^page\s+\d+",
        r"^\d+\s+of\s+\d+",
        r"^(version|copyright)\s+",
        r"^\d{1,2}/\d{1,2}/\d{2,4}$",
        r"^(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(st|nd|rd|th)?,\s+\d{4}$",
        r"^\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}$",
    ]
    if any(re.match(pattern, text.lower()) for pattern in footer_patterns):
        return False

    if not re.search(r"[a-zA-Z]", text) and not re.match(r"^[IVXLCDMivxlcdm]+\.?\s*|\d+\.?\s*|[A-Za-z]\.?", text):
        return False

    return True

def clean_text(text):
    if not isinstance(text, str):
        return ""
    return unicodedata.normalize("NFKD", text).encode("utf-8", "ignore").decode("utf-8")

for PDF_PATH in selected_files:
    try:
        print(f"\n Processing: {PDF_PATH}")
        pages = convert_from_path(PDF_PATH, dpi=300)

        results = []
        box_heights = []
        document_title = None

        for page_idx, pil_img in enumerate(pages, start=1):
            img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            det = model(img)[0]
            sorted_boxes = sorted(det.boxes, key=lambda b: b.xyxy[0][1])

            for box in sorted_boxes:
                cls = int(box.cls[0])
                label = model.names[cls].lower()

                if label not in ("title", "section-header"):
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                crop = img[y1:y2, x1:x2]
                text = pytesseract.image_to_string(crop, config="--psm 6").strip()
                text = clean_text(text)

                is_current_box_potential_title = False
                if page_idx == 1 and document_title is None:
                    if label == "title":
                        is_current_box_potential_title = True
                    elif not results and y1 < img.shape[0] * 0.2:
                        is_current_box_potential_title = True

                if is_valid_heading(text, is_title=is_current_box_potential_title):
                    box_height = y2 - y1
                    if is_current_box_potential_title:
                        document_title = text
                    else:
                        results.append({
                            "page": page_idx,
                            "text": text,
                            "box_height": box_height,
                            "y_pos": y1
                        })
                        box_heights.append(box_height)

        if document_title is None and results:
            document_title = results[0]["text"]
            box_heights.pop(0)
            results.pop(0)
        elif document_title is None:
            document_title = "Untitled Document"

        if box_heights:
            h1_threshold, h2_threshold, h3_threshold = np.percentile(box_heights, [80, 60, 40])

            for result in results:
                height = result["box_height"]
                if height >= h1_threshold:
                    result["level"] = "H1"
                elif height >= h2_threshold:
                    result["level"] = "H2"
                elif height >= h3_threshold:
                    result["level"] = "H3"
                else:
                    result["level"] = "H4"
                del result["box_height"]
                del result["y_pos"]

        output = {
            "title": clean_text(document_title),
            "outline": [
                {
                    "page": r["page"],
                    "text": clean_text(r["text"]),
                    "level": r["level"]
                } for r in results
            ]
        }

        pdf_filename = os.path.basename(PDF_PATH)
        out_json_filename = f"{os.path.splitext(pdf_filename)[0]}.json"
        out_json_path = os.path.join(OUTPUT_DIR, out_json_filename)

        with open(out_json_path, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f" Saved: {out_json_path}")

    except Exception as e:
        print(f" Failed to process {PDF_PATH}: {e}")
