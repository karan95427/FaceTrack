import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { estimateEnrollmentQuality, recognizeLiveFrame } from "../services/faceApi.js";
import { saveEnrollmentProfile } from "../services/enrollmentService.js";

export const poses = ["Look Straight", "Turn Left", "Turn Right", "Look Up", "Look Down", "Smile", "Blink"];

export function useEnrollmentFlow({ captureFrame, captureFrameFile }) {
  const [name, setName] = useState("");
  const [started, setStarted] = useState(false);
  const [poseIndex, setPoseIndex] = useState(0);
  const [captures, setCaptures] = useState([]);
  const [face, setFace] = useState(null);
  const [quality, setQuality] = useState({ ok: true, message: "Ready", score: 100 });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const inFlightRef = useRef(false);
  const stableStartRef = useRef(null);

  const progress = useMemo(() => Math.round((captures.length / poses.length) * 100), [captures.length]);
  const canCapture = started && captures.length === poseIndex && !saving && !result;
  const canFinish = started && captures.length === poses.length && !saving && !result;

  const start = useCallback(() => {
    setStarted(true);
    setPoseIndex(0);
    setCaptures([]);
    setResult(null);
    setError("");
    setWarning("");
    setQuality({ ok: false, message: "Finding Face", score: 0 });
    setFace(null);
    stableStartRef.current = null;
  }, []);

  useEffect(() => {
    if (!started || result) {
      return;
    }

    stableStartRef.current = null;
    setQuality((current) =>
      poseIndex === 0 && captures.length === 0 && current.message === "Finding Face"
        ? current
        : { ok: false, message: "Hold Position", score: 0 }
    );
  }, [captures.length, poseIndex, result, started]);

  useEffect(() => {
    if (!started || result || !captureFrameFile) return undefined;

    let cancelled = false;
    let timerId = null;

    const poll = async () => {
      if (cancelled || inFlightRef.current) return;

      try {
        inFlightRef.current = true;
        const frame = await captureFrameFile({ maxWidth: 640 });
        if (!frame || cancelled) {
          scheduleNext();
          return;
        }

        const { detections } = await recognizeLiveFrame(frame);
        if (cancelled) return;

        const nextFace = detections.length > 0 
          ? detections.reduce((p, c) => (p.box.w * p.box.h > c.box.w * c.box.h ? p : c))
          : null;

        setFace(nextFace);
        if (!nextFace) {
          stableStartRef.current = null;
          setQuality({ ok: false, message: "Face Not Detected", score: 0 });
        } else {
          const now = performance.now();
          if (stableStartRef.current == null) {
            stableStartRef.current = now;
          }

          const nextQuality = estimateEnrollmentQuality({
            poseIndex,
            elapsedStableMs: now - stableStartRef.current,
            face: nextFace,
          });

          if (!nextQuality.ok && nextQuality.message !== "Hold Position") {
            stableStartRef.current = now;
          }

          setQuality(nextQuality);
        }
        setError("");
      } catch (err) {
        // Silently ignore detection errors in simplified mode
      } finally {
        inFlightRef.current = false;
        scheduleNext();
      }
    };

    const scheduleNext = () => {
      if (!cancelled) {
        timerId = setTimeout(poll, 400);
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [started, result, captureFrameFile, poseIndex]);

  const captureCurrentPose = useCallback(() => {
    if (!canCapture) {
      return false;
    }

    const image = captureFrame?.();
    if (!image) {
      setError("Camera frame is not available yet.");
      return false;
    }

    setError("");
    setCaptures((current) => [...current, { pose: poses[poseIndex], image, quality: quality.score }]);
    stableStartRef.current = null;

    if (poseIndex < poses.length - 1) {
      setPoseIndex((current) => Math.min(current + 1, poses.length - 1));
    }

    return true;
  }, [canCapture, captureFrame, poseIndex, quality.score]);

  const finishEnrollment = useCallback(() => {
    if (!canFinish) {
      return;
    }

    setError("");
    setSaving(true);
    saveEnrollmentProfile({ name, captures })
      .then((data) => {
        setResult({
          message: "Enrollment Successful",
          captureCount: data.captureCount,
          embeddingGenerated: data.embeddingGenerated,
          embeddingCount: data.embeddingCount,
          dbSynced: data.dbSynced
        });
        setWarning(data.warning || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setSaving(false));
  }, [canFinish, captures, name]);

  return {
    name,
    setName,
    started,
    start,
    pose: poses[poseIndex],
    poseIndex,
    totalPoses: poses.length,
    captures,
    face,
    quality,
    progress,
    saving,
    result,
    error,
    warning,
    canCapture,
    canFinish,
    captureCurrentPose,
    finishEnrollment
  };
}
