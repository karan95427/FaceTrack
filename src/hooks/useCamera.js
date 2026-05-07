import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera({ autoStart = false } = {}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraState, setCameraState] = useState("idle");
  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraState("idle");
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera API is not supported in this browser.");
      setCameraState("error");
      return false;
    }

    try {
      setCameraState("requesting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setError("");
      setCameraState("ready");
      return true;
    } catch (err) {
      setError(err?.message || "Camera permission was denied.");
      setCameraState("error");
      return false;
    }
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.88);
  }, []);

  const captureFrameFile = useCallback(
    async ({ maxWidth = 640, quality = 0.78, filename = "frame.jpg" } = {}) => {
      const video = videoRef.current;
      if (!video || !video.videoWidth || !video.videoHeight) {
        return null;
      }

      const scale = Math.min(1, maxWidth / video.videoWidth);
      const width = Math.max(1, Math.round(video.videoWidth * scale));
      const height = Math.max(1, Math.round(video.videoHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (!blob) {
        return null;
      }

      return new File([blob], filename, { type: "image/jpeg" });
    },
    []
  );

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }

    return () => stopCamera();
  }, [autoStart, startCamera, stopCamera]);

  return { videoRef, cameraState, error, startCamera, stopCamera, captureFrame, captureFrameFile };
}
