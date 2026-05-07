import { useEffect, useMemo, useRef, useState } from "react";
import { recognizeLiveFrame } from "../services/faceApi.js";

export function useFaceDetection({ enabled, captureFrameFile }) {
  const [detections, setDetections] = useState([]);
  const [history, setHistory] = useState([]);
  const [fps, setFps] = useState(0);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const stableNamesRef = useRef(new Map());
  const inFlightRef = useRef(false);
  const historyRef = useRef(new Map());

  useEffect(() => {
    if (!enabled || !captureFrameFile) {
      setStatus("idle");
      setDetections([]);
      return undefined;
    }

    let cancelled = false;
    setStatus("connecting");

    const poll = async () => {
      if (cancelled || inFlightRef.current) {
        return;
      }

      try {
        inFlightRef.current = true;
        const startedAt = performance.now();
        const frame = await captureFrameFile();

        if (!frame) {
          setStatus("waiting-camera");
          return;
        }

        const { detections: rawDetections } = await recognizeLiveFrame(frame);
        if (cancelled) {
          return;
        }

        const now = performance.now();
        const stabilized = rawDetections.map((face) => {
          const previous = stableNamesRef.current.get(face.id);
          const nextName = previous && previous.name !== face.name && now - previous.changedAt < 1800 ? previous.name : face.name;
          const recognized = face.recognized && nextName !== "Unknown";
          stableNamesRef.current.set(face.id, { name: nextName, changedAt: previous?.name === nextName ? previous.changedAt : now });
          return { ...face, name: nextName, recognized };
        });

        setDetections(stabilized);
        setStatus("connected");
        setError("");
        setFps(Math.round(1000 / Math.max(1, performance.now() - startedAt)));

        const recognized = stabilized.filter((face) => face.recognized);
        if (recognized.length) {
          setHistory((current) => {
            const nextEvents = [];

            recognized.forEach((face) => {
              const previousSeenAt = historyRef.current.get(face.id) || 0;
              if (now - previousSeenAt < 2500) {
                return;
              }

              historyRef.current.set(face.id, now);
              nextEvents.push({
                id: `${face.id}-${Math.round(now)}`,
                name: face.name,
                confidence: face.confidence,
                time: new Date().toLocaleTimeString()
              });
            });

            if (!nextEvents.length) {
              return current;
            }

            return [...nextEvents, ...current].slice(0, 12);
          });
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setError(err?.message || "Live recognition failed.");
        }
      } finally {
        inFlightRef.current = false;
      }
    };

    poll();
    const intervalId = window.setInterval(poll, 450);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      inFlightRef.current = false;
    };
  }, [captureFrameFile, enabled]);

  const stats = useMemo(
    () => ({
      totalFaces: detections.length,
      recognized: detections.filter((face) => face.recognized).length,
      unknown: detections.filter((face) => !face.recognized).length,
      fps
    }),
    [detections, fps]
  );

  return { detections, history, stats, status, error };
}
