import numpy as np

SIMILARITY_THRESHOLD = 0.5   # tune later

def normalize(embedding):
    return embedding / np.linalg.norm(embedding)

def match_face(vector_db, embedding):
    embedding = normalize(embedding).reshape(1, -1)

    D, I = vector_db.index.search(embedding, k=1)

    similarity = float(D[0][0])
    idx = int(I[0][0])

    if similarity > SIMILARITY_THRESHOLD:
        return vector_db.labels[idx], similarity
    else:
        return "Unknown", similarity