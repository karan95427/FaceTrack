from pathlib import Path

from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import numpy as np
import cv2

from app.core.database import EnrollmentMetadataStore
from app.core.recognizer import FaceRecognizer
from app.core.vector_db import VectorDB
from app.services.enrollment import EnrollmentService
from app.services.pipeline import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

dist_path = Path("dist")
assets_path = dist_path / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

if __name__ != "__main__":
    recognizer = FaceRecognizer()
    db = VectorDB()
    metadata_store = EnrollmentMetadataStore()
    enrollment = EnrollmentService(recognizer, db, metadata_store=metadata_store)
else:
    recognizer = None
    db = None
    metadata_store = None
    enrollment = None


@app.get("/")
def home():
    built_index = dist_path / "index.html"
    return FileResponse(built_index if built_index.exists() else "index.html")

@app.post("/enroll")
async def enroll(name: str = Form(...), files: list[UploadFile] = []):
    name = name.strip()
    if not name or name.lower() == "undefined":
        return {"success": False, "message": "Valid name is required"}

    images = []

    for file in files:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        images.append(img)

    success, message, details = enrollment.enroll(name, images)

    return {"success": success, "message": message, **details}

@app.post("/recognize")
async def recognize(file: UploadFile):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    faces = recognizer.get_faces(img)

    if len(faces) == 0:
        return {"result": "No face"}

    face=max(faces, key=lambda f: f.bbox[2] * f.bbox[3])
    if face.det_score < 0.6:
        return {"result": "Low quality face"}
    emb = face.embedding
    emb = emb / np.linalg.norm(emb)
    embedding = emb.astype("float32").reshape(1, -1)

    D, I = db.index.search(embedding, 1)

    score = float(D[0][0])   # 🔥 this is similarity
    idx = int(I[0][0])

    if idx >= len(db.labels):
        return {"match": "Error", "score": score}

    label = str(db.labels[idx]).strip()
    if not label or label.lower() == "undefined":
        return {"match": "Unknown", "score": score}

    THRESHOLD = 0.5   # cosine similarity threshold

    if score < THRESHOLD:
        return {
        "match": "Unknown",
        "score": score
     }

    return {
    "match": label,
    "score": score
    }


@app.post("/recognize/live")
async def recognize_live(file: UploadFile):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"success": False, "message": "Invalid image", "detections": []}

    height, width = img.shape[:2]
    faces = recognizer.get_faces(img)
    detections = []

    for idx, face in enumerate(faces):
        bbox = face.bbox.astype(float)
        x1, y1, x2, y2 = bbox
        box_width = max(0.0, x2 - x1)
        box_height = max(0.0, y2 - y1)

        if box_width <= 0 or box_height <= 0:
            continue

        similarity = 0.0
        label = "Unknown"

        if hasattr(db, "index") and db.index is not None and db.index.ntotal > 0:
            emb = face.embedding
            emb = emb / np.linalg.norm(emb)
            embedding = emb.astype("float32").reshape(1, -1)
            D, I = db.index.search(embedding, 1)

            similarity = float(D[0][0])
            match_idx = int(I[0][0])

            if 0 <= match_idx < len(db.labels):
                candidate = str(db.labels[match_idx]).strip()
                if candidate and candidate.lower() != "undefined" and similarity >= 0.5:
                    label = candidate

        detections.append(
            {
                "id": f"face-{idx + 1}",
                "name": label,
                "recognized": label != "Unknown",
                "confidence": round(max(0.0, min(1.0, similarity)) * 100),
                "similarity": similarity,
                "box": {
                    "x": ((x1 + x2) / 2) / width,
                    "y": ((y1 + y2) / 2) / height,
                    "w": box_width / width,
                    "h": box_height / height,
                },
                "pose": face.pose.tolist() if hasattr(face, "pose") and face.pose is not None else [0, 0, 0],
                "kps": face.kps.tolist() if hasattr(face, "kps") and face.kps is not None else [],
                "det_score": float(face.det_score) if hasattr(face, "det_score") else 0.0,
            }
        )

    return {
        "success": True,
        "detections": detections,
        "count": len(detections),
    }


if __name__ == "__main__":
    run_pipeline()
