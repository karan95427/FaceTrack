from unicodedata import name

import numpy as np
from scipy.datasets import face

class EnrollmentService:
    def __init__(self, recognizer, vector_db):
        self.recognizer = recognizer
        self.db = vector_db

    def enroll(self, name, images):
        embeddings = []

        for img in images:
            faces = self.recognizer.get_faces(img)

            if len(faces) == 0:
                continue

            face = max(faces, key=lambda f: f.bbox[2] * f.bbox[3])

    # 🔥 FILTER BAD FACES
            if face.det_score < 0.6:
                continue

            emb = face.embedding
            emb = emb / np.linalg.norm(emb)   # normalize
            embeddings.append(emb)

        if len(embeddings) == 0:
            return False, "No face detected"

        # 🔥 critical step
        for emb in embeddings:
            self.db.add(emb, name)
            self.db.save()

        return True, f"{name} enrolled"