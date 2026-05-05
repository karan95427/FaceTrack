from insightface.app import FaceAnalysis

class FaceRecognizer:
    def __init__(self):
        self.app = FaceAnalysis(name="buffalo_l")
        self.app.prepare(ctx_id=0)  # CPU = -1 if GPU fails

    def get_faces(self, frame):
        return self.app.get(frame)