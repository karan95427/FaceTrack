import cv2

from app.core.camera import Camera
from app.core.matcher import match_face
from app.core.recognizer import FaceRecognizer
from app.core.vector_db import VectorDB


def run_pipeline(width=1280, height=720):
    camera = Camera(0)
    recognizer = FaceRecognizer()
    vector_db = VectorDB()
    vector_db.load()

    frame_count = 0

    while True:
        frame = camera.get_frame()
        if frame is None:
            break

        frame = cv2.resize(frame, (width, height))
        frame_count += 1

        # Run face detection less often to keep the camera pipeline responsive.
        if frame_count % 3 != 0:
            continue

        faces = recognizer.get_faces(frame)

        for face in faces:
            bbox = face.bbox.astype(int)
            embedding = face.embedding
            name, similarity = match_face(vector_db, embedding)

            x1, y1, x2, y2 = bbox
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            text = f"{name} ({similarity:.2f})"
            cv2.putText(
                frame,
                text,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )

        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()
