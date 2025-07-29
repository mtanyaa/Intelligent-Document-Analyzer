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

# Upgrade pip and setuptools
RUN pip install --upgrade pip setuptools

# Pre-install typing-extensions to satisfy torch dependency
RUN pip install typing-extensions==4.12.2

# Install PyTorch CPU versions with fallback to PyPI for missing dependencies
RUN pip install --no-cache-dir torch==2.2.0 torchvision==0.17.0 torchaudio==2.2.0 \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple

# Copy and install remaining Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download and cache the SentenceTransformer model
RUN wget -q https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/config.json -O all-MiniLM-L12-v2/config.json && \
    wget -q https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/pytorch_model.bin -O all-MiniLM-L12-v2/pytorch_model.bin && \
    wget -q https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/tokenizer.json -O all-MiniLM-L12-v2/tokenizer.json && \
    wget -q https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/tokenizer_config.json -O all-MiniLM-L12-v2/tokenizer_config.json && \
    wget -q https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2/resolve/main/sentence_bert_config.json -O all-MiniLM-L12-v2/sentence_bert_config.json && \
    mv all-MiniLM-L12-v2 /app/all-MiniLM-L12-v2


# Copy application script and download YOLO model
COPY app.py .
RUN wget -q https://huggingface.co/hantian/yolo-doclaynet/resolve/main/yolov8n-doclaynet.pt -O yolov8n-doclaynet.pt

# Create folders for input/output
RUN mkdir -p /app/input /app/output

# Run the app
CMD ["python", "app.py"]
