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
    libgl1-mesa-glx \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency list and install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application script and YOLO model
COPY app.py .
RUN wget -q https://huggingface.co/hantian/yolo-doclaynet/resolve/main/yolov8n-doclaynet.pt -O yolov8n-doclaynet.pt

# Create folders for input/output (you can also mount volumes here)
RUN mkdir -p /app/input /app/output

# Run app.py when container starts
CMD ["python", "app.py"]
