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

## Our Sample Output
To decrease the perceived "font size" when displaying JSON in a Markdown README, you can't directly control the font size. However, you can use a smaller code block format (if available on the specific Markdown renderer, though not standard) or, more commonly, **shorten the lines of text to make it appear less dense**.

Given that you want it to appear "as it is" in structure, the best approach is still a standard JSON code block. The primary way to make it *look* smaller without actually changing the font size in Markdown is to reduce the amount of content shown, or to format it more compactly.

Since you've provided the full JSON and asked to display it "as is," here's how you'd put it in your README, keeping the standard Markdown code block format. This format is what GitHub and most Markdown renderers use for displaying code and it's the most appropriate. The font size is determined by the browser/viewer, not by Markdown itself.

````markdown
```json
{
  "metadata": {
    "input_documents": [
      "South of France - Cities.pdf",
      "South of France - Things to Do.pdf"
    ],
    "persona": "Travel Agent",
    "job_to_be_done": "Plan a trip to Franch",
    "processing_timestamp": "2025-07-28T17:43:40.214667"
  },
  "extracted_sections": [
    {
      "document": "South of France - Cities.pdf",
      "section_title": "Comprehensive Guide to Major Cities in the South of France",
      "importance_rank": 1,
      "page_number": 8
    },
    {
      "document": "South of France - Cities.pdf",
      "section_title": "Aix-en-Provence: A City of Art and Culture",
      "importance_rank": 2,
      "page_number": 1
    },
    {
      "document": "South of France - Cities.pdf",
      "section_title": "Marseille: The Oldest City in France",
      "importance_rank": 3,
      "page_number": 3
    },
    {
      "document": "South of France - Cities.pdf",
      "section_title": "Travel Tips",
      "importance_rank": 4,
      "page_number": 2
    },
    {
      "document": "South of France - Things to Do.pdf",
      "section_title": "Antibes: Visit Marineland for marine shows and an aquarium.",
      "importance_rank": 1,
      "page_number": 9
    },
    {
      "document": "South of France - Things to Do.pdf",
      "section_title": "Aix-en-Provence: Visit Thermes Sextius for thermal baths and massages.",
      "importance_rank": 2,
      "page_number": 7
    },
    {
      "document": "South of France - Things to Do.pdf",
      "section_title": "Beach Hopping",
      "importance_rank": 3,
      "page_number": 2
    },
    {
      "document": "South of France - Things to Do.pdf",
      "section_title": "Coastal Adventures",
      "importance_rank": 4,
      "page_number": 2
    },
    {
      "document": "South of France - Things to Do.pdf",
      "section_title": "Hiking and Biking",
      "importance_rank": 5,
      "page_number": 4
    }
  ],
  "subsection_analysis": [
    {
      "document": "South of France - Cities.pdf",
      "refined_text": "Aix-en-Provence: A City of Art and Culture Aix-en-Provence: A City of Art and Culture",
      "page_number": 8
    },
    {
      "document": "South of France - Cities.pdf",
      "refined_text": "Comprehensive Guide to Major Cities in the South of France Comprehensive Guide to Major Cities in the South of France",
      "page_number": 1
    },
    {
      "document": "South of France - Cities.pdf",
      "refined_text": "Marseille: The Oldest City in France Marseille: The Oldest City in France",
      "page_number": 3
    },
    {
      "document": "South of France - Cities.pdf",
      "refined_text": "Travel Tips Travel Tips e Best Time to Visit: The best time to visit the South of France is during the spring (April to June) and fall (September to October) when the weather is pleasant, and the tourist crowds are smaller. e Transportation: The region is well-connected by an extensive network of trains, buses, and flights. Renting a car is also a great option for exploring the countryside and smaller towns. e Language: While French is the official language, English is widely spoken in tourist areas. Learning a few basic French phrases can enhance your travel experience.",
      "page_number": 2
    },
    {
      "document": "South of France - Cities.pdf",
      "refined_text": "Nice: The Jewel of the French Riviera Nice: The Jewel of the French Riviera",
      "page_number": 5
    },
    {
      "document": "South of France - Things to Do.pdf",
      "refined_text": "e Antibes: Visit Marineland for marine shows and an aquarium. e Antibes: Visit Marineland for marine shows and an aquarium. e Fréjus: Cool off at Aqualand water park. e Villeneuve-Loubet: Enjoy quirky attractions at Le Village des Fous. e Monteux: Spend a day at Parc Spirou, a theme park based on the famous comic book character. e La Palmyre: Explore the La Palmyre Zoo, home to a wide variety of animals. e Cap d'Agde: Have fun at Luna Park, an amusement park with rides and games. e Toulouse: Visit the Cité de l'Espace, a space-themed science museum with interactive exhibits.",
      "page_number": 9
    },
    {
      "document": "South of France - Things to Do.pdf",
      "refined_text": "e Aix-en-Provence: Visit Thermes Sextius for thermal baths and massages. e Aix-en-Provence: Visit Thermes Sextius for thermal baths and massages. e Bordeaux: Enjoy vinotherapy treatments at Les Sources de Caudalie. e Vichy: Experience hydrotherapy and mud baths at Spa Vichy Célestins. e Evian-les-Bains: Relax at the Evian Resort, known for its mineral-rich waters. e Saint-Raphaël: Visit the Thalasso Spa for seawater treatments and relaxation. e Biarritz: Enjoy the luxurious spas and wellness centers in this coastal town. e Cannes: Indulge in a pampering session at one of the many high-end spas.",
      "page_number": 7
    },
    {
      "document": "South of France - Things to Do.pdf",
      "refined_text": "Beach Hopping Beach Hopping e Nice: Visit the sandy shores and enjoy the vibrant Promenade des Anglais. e Antibes: Relax on the pebbled beaches and explore the charming old town. e Saint-Tropez: Experience the exclusive beach clubs and glamorous atmosphere. e Marseille to Cassis: Explore the stunning limestone cliffs and hidden coves of Calanques National Park. e les d'Hyéres: Discover pristine beaches and excellent snorkeling opportunities on islands like Porquerolles and Port-Cros. e Cannes: Enjoy the sandy beaches and luxury beach clubs along the Boulevard de la Croisette. e Menton: Visit the serene beaches and beautiful gardens in this charming town near the Italian border.",
      "page_number": 2
    },
    {
      "document": "South of France - Things to Do.pdf",
      "refined_text": "Coastal Adventures Coastal Adventures The South of France is renowned for its beautiful coastline along the Mediterranean Sea. Here are some activities to enjoy by the sea:",
      "page_number": 2
    },
    {
      "document": "South of France - Things to Do.pdf",
      "refined_text": "Hiking and Biking Hiking and Biking e Verdon Gorge: Known as the \"Grand Canyon of Europe,\" offering spectacular hiking trails. e Luberon Regional Park: Explore picturesque villages and rolling hills, famous for lavender fields and vineyards. e Pyrenees National Park: Enjoy challenging hikes and stunning mountain scenery. e Mercantour National Park: Discover diverse wildlife and beautiful alpine landscapes. e Camargue: Explore the unique wetlands on horseback or by bike. e Mont Ventoux: Challenge yourself with a hike or bike ride up this iconic mountain. e Gorges du Tarn: Hike through dramatic gorges and enjoy breathtaking views.",
      "page_number": 4
    }
  ]
}
````


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





