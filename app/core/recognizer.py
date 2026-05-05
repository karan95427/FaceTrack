import os
import site

import onnxruntime as ort
from insightface.app import FaceAnalysis

_DLL_DIRECTORIES = []


def _add_nvidia_dll_directories():
    if os.name != "nt":
        return

    dll_dirs = []

    for site_dir in site.getsitepackages():
        nvidia_dir = os.path.join(site_dir, "nvidia")
        for relative_dir in (
            os.path.join("cuda_runtime", "bin"),
            os.path.join("cublas", "bin"),
            os.path.join("cudnn", "bin"),
            os.path.join("cufft", "bin"),
            os.path.join("curand", "bin"),
            os.path.join("nvjitlink", "bin"),
        ):
            dll_dir = os.path.join(nvidia_dir, relative_dir)
            if os.path.isdir(dll_dir):
                dll_dirs.append(dll_dir)
                _DLL_DIRECTORIES.append(os.add_dll_directory(dll_dir))

    if dll_dirs:
        os.environ["PATH"] = os.pathsep.join(dll_dirs + [os.environ.get("PATH", "")])


_add_nvidia_dll_directories()


class FaceRecognizer:
    def __init__(self):
        ort.preload_dlls(directory="")
        self.app = FaceAnalysis(
            name="buffalo_l",
            providers=["CUDAExecutionProvider", "CPUExecutionProvider"],
        )
        self.app.prepare(ctx_id=0, det_size=(800, 800))

    def get_faces(self, frame):
        return self.app.get(frame)
