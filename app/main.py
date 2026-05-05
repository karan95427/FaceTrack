from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import FileResponse
import numpy as np
import cv2

from app.core.recognizer import FaceRecognizer
from app.core.vector_db import VectorDB
from app.services.enrollment import EnrollmentService
from app.services.pipeline import run_pipeline

app = FastAPI()

if __name__ != "__main__":
    recognizer = FaceRecognizer()
    db = VectorDB()
    enrollment = EnrollmentService(recognizer, db)
else:
    recognizer = None
    db = None
    enrollment = None


@app.get("/")
def home():
    return FileResponse("index.html")

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

    success, message = enrollment.enroll(name, images)

    return {"success": success, "message": message}

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


if __name__ == "__main__":
    run_pipeline()
