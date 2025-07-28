# syntax=docker/dockerfile:1
FROM python:3.10-slim AS base

# Install system dependencies for OCR and image processing
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive \
    apt-get install -y --no-install-recommends \
    tesseract-ocr \
    poppler-utils \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

# Copy requirements first for layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application script into the image
COPY app.py .

# Download YOLO model at build time to avoid re-downloading at runtime (optional but optimal)
RUN wget -q --show-progress https://huggingface.co/hantian/yolo-doclaynet/resolve/main/yolov8n-doclaynet.pt -O yolov8n-doclaynet.pt

# Make sure /app/input and /app/output directories exist for Docker volume mount
RUN mkdir -p /app/input /app/output

# Set our entrypoint
ENTRYPOINT ["python", "app.py"]
