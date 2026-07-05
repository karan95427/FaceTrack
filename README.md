# FaceAI Command Center – Real-Time Face Recognition & Attendance Platform

FaceAI Command Center is a production-oriented real-time face recognition platform that combines deep learning, vector search, and modern web technologies to identify enrolled users from live webcam streams.

Instead of relying on traditional face recognition approaches, the system uses InsightFace embeddings, FAISS vector search, and a multi-angle enrollment pipeline to improve recognition robustness across different poses and lighting conditions.

---

# Features

## Multi-Angle Face Enrollment

Users enroll by capturing multiple guided face poses:

- Straight
- Left
- Right
- Up
- Down

The enrollment pipeline validates:

- Face visibility
- Detection confidence
- Stability
- Face size
- Single-face requirement

before generating embeddings.

---

## Real-Time Face Recognition

The system performs:

- Live webcam detection
- Face embedding generation
- Vector similarity search
- Identity matching
- Confidence scoring

in real time.

---

## Vector Search with FAISS

Instead of comparing faces sequentially, the system:

- Generates normalized InsightFace embeddings
- Stores them inside a FAISS vector index
- Performs fast cosine similarity search
- Returns the closest matching identities

This enables scalable face recognition as the number of enrolled users grows.

---

## Intelligent Recognition Pipeline

Recognition combines:

- Face Detection
- Embedding Generation
- FAISS Vector Retrieval
- Similarity Thresholding
- Confidence Scoring

to improve recognition accuracy.

---

## Interactive Dashboard

React dashboard provides:

- Live webcam feed
- Detection history
- Confidence scores
- Recognition statistics
- Enrollment workflow
- Real-time recognition status

---

# Tech Stack

## Frontend

- React 19
- Vite 7
- Tailwind CSS
- Framer Motion
- React Router

## Backend

- FastAPI
- Python

## AI / Computer Vision

- InsightFace (buffalo_l)
- ONNX Runtime
- OpenCV
- FAISS
- NumPy

## Database

- PostgreSQL (optional metadata storage)

---

# System Architecture

```
                    Webcam
                      │
                      ▼
              Face Detection
                 (InsightFace)
                      │
                      ▼
            Face Embedding Generation
                      │
                      ▼
             Embedding Normalization
                      │
                      ▼
               FAISS Vector Search
                      │
                      ▼
          Cosine Similarity Matching
                      │
                      ▼
          Identity + Confidence Score
                      │
                      ▼
            Live Dashboard Results
```

---

# Project Structure

```text
FaceAI/
│
├── app/
│   ├── api/
│   ├── core/
│   ├── services/
│   ├── database/
│   └── main.py
│
├── src/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── components/
│
├── data/
│   ├── faiss.index
│   └── labels.pkl
│
└── README.md
```

---

# Application Workflow

### 1. Multi-Angle Enrollment

The user captures multiple guided face poses.

↓

### 2. Face Validation

The system validates:

- Detection confidence
- Face size
- Stability
- Single face

↓

### 3. Embedding Generation

InsightFace generates high-dimensional face embeddings.

↓

### 4. Vector Storage

Normalized embeddings are stored inside FAISS.

↓

### 5. Live Recognition

Incoming webcam frames generate new embeddings.

↓

### 6. Vector Search

FAISS retrieves the closest enrolled identity.

↓

### 7. Recognition

The system returns:

- Person name
- Similarity score
- Confidence
- Detection metadata

---

# REST API

### POST /enroll

Enroll a new user from multiple captured images.

### POST /recognize

Recognize a face from a single uploaded image.

### POST /recognize/live

Real-time recognition endpoint used by the frontend dashboard.

---

# Performance Features

- Multi-angle enrollment
- Cosine similarity search
- High-speed FAISS retrieval
- GPU acceleration support through ONNX Runtime
- Persistent vector database
- Modular FastAPI architecture

---

# Key Learnings

This project provided practical experience with:

- Face Recognition Systems
- Deep Face Embeddings
- Vector Databases
- FAISS Similarity Search
- InsightFace
- OpenCV
- FastAPI
- Real-Time Computer Vision
- Backend System Design

---

# Future Improvements

- Face anti-spoofing
- Face mask detection
- Multi-camera support
- Face tracking
- Unknown visitor alerts
- Role-based authentication
- Attendance analytics
- Docker deployment
- Cloud deployment

---

# Results

- Built a real-time AI face recognition platform using InsightFace and FAISS.
- Improved recognition robustness through multi-angle enrollment.
- Designed a modular FastAPI backend for maintainability.
- Developed a responsive React dashboard for enrollment and live recognition.
- Enabled scalable identity matching using vector similarity search.

---

# Author

**Karan Shihire**

AI Engineer | Computer Vision | Vector Search | FastAPI
