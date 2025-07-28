# syntax=docker/dockerfile:1
FROM python:3.10-slim

# -- 1. Install system dependencies for OCR and PDF conversion --
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgl1-mesa-glx \
    wget \
    && rm -rf /var/lib/apt/lists/*

# -- 2. Set work directory --
WORKDIR /app

# -- 3. Copy requirements and install python dependencies --
COPY requirements.txt ./
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# -- 4. Download and unpack models at build time (NO downloads at runtime) --

# YOLO model (DocLayNet)
RUN wget -q --show-progress https://huggingface.co/hantian/yolo-doclaynet/resolve/main/yolov8n-doclaynet.pt -O /app/yolov8n-doclaynet.pt

# SentenceTransformer model - use the sentence-transformers library's CLI to download
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L12-v2').save('/app/all-MiniLM-L12-v2')"

# -- 5. Copy application code --
COPY app.py .

# -- 6. Ensure input/output directories are present (they'll be mounted at runtime anyway) --
RUN mkdir -p /app/input /app/output /app/output/intermediate

# -- 7. Entrypoint --
ENTRYPOINT ["python", "app.py"]

