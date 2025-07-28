# Persona-Driven Document Intelligence with YOLO, OCR, and Semantic Filtering

## Architecture

![Screenshot 2025-07-28 214624](https://github.com/user-attachments/assets/3123eb2f-0549-4633-b689-60de832903b6)


## Overview

This project builds an intelligent document analyst system that extracts and prioritizes the most relevant sections from a collection of PDF documents based on a specified **persona** and their **job-to-be-done**. It leverages deep learning (YOLOv8), Optical Character Recognition (Tesseract OCR), and semantic similarity (Sentence Transformers) to produce structured, meaningful outputs automatically in a fully containerized environment.

Designed to generalize well across diverse domains (e.g., research papers, financial reports, educational content) and varied user personas, the solution processes multiple PDFs efficiently on CPU-only environments.

##  Approach

The system follows these main steps:

1. **PDF Conversion to Images**  
   Converts each page of input PDFs to images using [`pdf2image`], enabling visual analysis.

2. **Heading Detection with YOLOv8**  
   Uses a pretrained YOLOv8 model (DocLayNet weights) to detect likely titles and section headings (`title` and `section-header` classes) on each page image.

3. **Text Extraction via OCR**  
   Applies Tesseract OCR on the detected regions to extract textual content.

4. **Heuristic Filtering**  
   Filters out non-heading text such as footers, dates, and page numbers using regex and length-based rules.

5. **Contextual Text Aggregation**  
   Gathers surrounding OCR text spans near headings to provide richer context for semantic analysis.

6. **Embedding and Semantic Filtering**  
   Generates embeddings for section headings and the persona's job-to-be-done using the `all-MiniLM-L12-v2` Sentence Transformer. Calculates cosine similarity to rank and select the most relevant sections.

7. **Structured Output Generation**  
   Produces a JSON file summarizing metadata, extracted sections, importance rankings, and refined text snippets matching the challenge output specification.

##  Technologies & Libraries Used

- **Python 3.10** — Base language for scripting
- **Ultralytics YOLOv8** — State-of-the-art object detection model tailored for document layout analysis
- **Tesseract OCR** — Optical Character Recognition system for text extraction
- **pdf2image** — Converts PDF pages into high-resolution images
- **OpenCV (opencv-python-headless)** — Image processing utilities
- **Sentence Transformers** — Pretrained Transformer models for semantic text embedding and similarity
- **NumPy** — Numerical operations (percentiles, arrays)
- **Pillow (PIL)** — Image handling
- **poppler-utils** — System package necessary for `pdf2image`

## Directory Structure

```
.
├── app.py                     # Main application script
├── Dockerfile                 # Docker build instructions
├── requirements.txt           # Python dependencies
├── README.md                  # This file
└── input/                     # (Mounted) PDFs + input_config.json
└── output/                    # (Mounted) JSON outputs and intermediate files
```

- `/app/input/` — Place your input PDFs and a configuration JSON here.
- `/app/output/` — Output JSON files will be saved here after container run.

## Input Specification

Place your PDF files in the `/app/input/` folder.

Provide a JSON file named `input_config.json` in the same folder with the following structure:

```json
{
  "persona": "PhD Researcher in Computational Biology",
  "job_to_be_done": "Prepare a comprehensive literature review focusing on methodologies, datasets, and performance benchmarks"
}
```

- The `persona` describes the user role or expertise.
- The `job_to_be_done` specifies the concrete task or goal for document analysis.

## Setup and Usage Instructions

### Prerequisites

- Docker installed (at least version 20.10 recommended)
- Your input PDFs and `input_config.json` ready in an `input/` folder on your host

### 1. Build the Docker Image

From the project root directory containing the Dockerfile:

```bash
docker build --platform linux/amd64 -t mysolutionname:somerandomidentifier .
```

### 2. Prepare Input and Output Folders

Make sure you have two local folders in the project directory:

```bash
mkdir -p input output
```

Place PDFs and `input_config.json` inside `input/`.

### 3. Run the Docker Container

Run with volumes mapped for input and output, and no network as required by constraints:

```bash
docker run --rm \
  -v $(pwd)/input:/app/input \
  -v $(pwd)/output:/app/output \
  --network none \
  mysolutionname:somerandomidentifier
```

### 4. Review Output

- For each PDF (e.g., `report.pdf`), a JSON file (e.g., `report_headings_plus_text.json`) will be created in `output/intermediate/`.
- The **final filtered, ranked output** is available as `semantic_filtered_output.json` in `/app/output/`.


## Important Notes

- **CPU-only Execution:** The solution is configured to run purely on CPU.
- **Model Size Constraints:** All models used are under 1 GB in size and bundled within the Docker image.
- **Processing Time:** Efficient use of YOLO and semantic models enables processing of typical document collections (3-5 PDFs) in under 60 seconds on standard CPUs.
- **No Internet Access at Runtime:** All necessary files and models are baked into the Docker image; your container will not attempt any external downloads or network communication.
- **No Interactive/Input Prompts:** All inputs must be provided via the mounted `/app/input/` folder.

## Troubleshooting

- Ensure your PDFs are valid and not corrupted.
- Check that `input_config.json` is present and well-formed.
- Review container logs for any error messages. Use `docker logs` if running in detached mode.
- If models fail to load, make sure the Docker build completed successfully without errors.
- If facing unexpected output, verify your inputs and try with sample PDFs to test functionality.

## References

- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)  
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)  
- [Sentence Transformers](https://www.sbert.net/)  
- [pdf2image](https://pypi.org/project/pdf2image/)  





