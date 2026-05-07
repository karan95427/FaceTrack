import numpy as np


class EnrollmentService:
    def __init__(self, recognizer, vector_db, metadata_store=None):
        self.recognizer = recognizer
        self.db = vector_db
        self.metadata_store = metadata_store

    def enroll(self, name, images):
        embeddings = []

        for img in images:
            faces = self.recognizer.get_faces(img)

            if len(faces) == 0:
                continue

            face = max(faces, key=lambda detected: detected.bbox[2] * detected.bbox[3])
            if face.det_score < 0.6:
                continue

            emb = face.embedding
            emb = emb / np.linalg.norm(emb)
            embeddings.append(emb)

        if len(embeddings) == 0:
            return False, "No face detected", {"db_synced": False, "warning": "", "embedding_count": 0}

        for emb in embeddings:
            self.db.add(emb, name)

        self.db.save()

        db_synced = False
        warning = ""
        if self.metadata_store:
            try:
                db_synced, warning = self.metadata_store.record_enrollment(
                    name=name,
                    capture_count=len(images),
                    embedding_count=len(embeddings),
                )
            except Exception as exc:
                warning = str(exc)

        return True, f"{name} enrolled", {"db_synced": db_synced, "warning": warning, "embedding_count": len(embeddings)}
