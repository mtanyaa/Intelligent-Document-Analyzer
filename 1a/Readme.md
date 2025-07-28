# PDF Document Heading Extraction with YOLO, OCR, and Docker

## Overview

This project automates the extraction of section headings and titles from PDF documents using deep learning (YOLOv8), Optical Character Recognition (Tesseract OCR), and image processing—all efficiently containerized via Docker.

Given a directory of PDF files, it processes each, detects the title and section headings, assigns hierarchical heading levels (H1–H4) based on detected bounding box sizes, and outputs one structured JSON per PDF file.

## Approach

**Key Steps:**
1. **PDF-to-Image Conversion**: Each PDF is converted into per-page images using [pdf2image], enabling downstream visual processing.
2. **Heading Detection (YOLOv8)**: Each image is processed by a YOLOv8 model (pre-trained on document layouts) to detect probable `title` and `section-header` regions.
3. **OCR Extraction (Tesseract)**: For each detected heading region, the text is extracted using Tesseract OCR.
4. **Text Heuristics**: Heuristics filter out non-heading text (like footers, dates, page numbers).
5. **Heading Hierarchy Assignment**: Detected headings are classified into levels (H1, H2, etc.) based on bounding box heights using percentile thresholds.
6. **JSON Output**: For each PDF, a JSON is created summarizing document title and outline in the specified format.

## Libraries & Dependencies

- **Python 3.10+**
- [`opencv-python-headless`] — Efficient image manipulation.
- [`pytesseract`] — Wrapper for Tesseract OCR.
- [`Pillow`] — Image loading.
- [`pdf2image`] — Converts PDF pages to images.
- [`ultralytics`] — Easier YOLOv8 inference.
- **Tesseract-OCR** — System OCR engine.
- **Poppler-utils** — Required for PDF conversion.
- **numpy** — For percentile calculations, array handling.

See `requirements.txt` for Python libraries.

## 🗃 Directory Structure

```
.
├── app.py            # Main application script
├── Dockerfile        # Docker build instructions
├── requirements.txt  # Python dependencies
└── README.md         # (this file)
```
- **/app/input/**: (Mounted) Input directory for PDF files.
- **/app/output/**: (Mounted) Output directory for results.

##  Setup Instructions

### 1. **Prerequisites**

- Docker installed on your system.
- Your PDF files placed in a local `input/` directory.
- (Output results will appear in a local `output/` directory.)

### 2. **Build the Docker Image**

```sh
docker build --platform linux/amd64 -t mysolutionname:somerandomidentifier .
```

### 3. **Prepare Input/Output Folders**

On your host system:
- Place all PDFs you want to process into an `input/` folder in your current directory.
- Create an empty `output/` folder (results will be saved here).

### 4. **Run the Container**

```sh
docker run --rm \
  -v $(pwd)/input:/app/input \
  -v $(pwd)/output:/app/output \
  --network none \
  mysolutionname:somerandomidentifier
```

- `--rm` — cleans up the container after finishing.
- `-v` — mounts the `input` and `output` directories so data is exchanged with your host.

### 5. **Review Output**

For every `filename.pdf` in `input/`, you’ll get a corresponding `filename.json` in `output/` with this structure:

```json
{
  "title": "Document Title",
  "outline": [
    {"page": 1, "text": "First Main Heading", "level": "H1"},
    {"page": 1, "text": "Subsection", "level": "H2"},
    ...
  ]
}
```

## Troubleshooting

- Make sure your input PDFs are valid.
- The Docker container must be built for `linux/amd64` (which is required for compatibility).
- Container logs will display any errors encountered during processing.
- No model weights or output data should be placed in your repository; the model is downloaded at build/runtime.

## ℹNotes

- **No input/output or model files** are included in this repository.
- All output is non-interactive. Once the container exits, check the `output/` directory for results.
- If a PDF cannot be processed, the script will continue with the next file and log the error.

##  References

- [YOLOv8: ultralytics/yolov8](https://github.com/ultralytics/ultralytics)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [pdf2image documentation](https://pypi.org/project/pdf2image/)
