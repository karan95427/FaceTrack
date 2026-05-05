import faiss
import numpy as np
import pickle
import os

class VectorDB:
    def __init__(self, dim=512):
        self.dim = dim
        self.index = faiss.IndexFlatIP(dim)
        self.labels = []

        if os.path.exists("data/faiss.index") and os.path.exists("data/labels.pkl"):
            self.load()

    def add(self, embedding, label):
        if self.index is None:
            dim = embedding.shape[0]
            self.index = faiss.IndexFlatIP(dim)

        self.index.add(embedding.reshape(1, -1))

        self.labels.append(label)

    def save(self):
        faiss.write_index(self.index, "data/faiss.index")
        with open("data/labels.pkl", "wb") as f:
            pickle.dump(self.labels, f)

    def load(self):
        if os.path.exists("data/faiss.index"):
            self.index = faiss.read_index("data/faiss.index")
        if os.path.exists("data/labels.pkl"):
            with open("data/labels.pkl", "rb") as f:
               self.labels = pickle.load(f)