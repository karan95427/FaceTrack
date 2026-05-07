import { getApiBase } from "./apiBase.js";

const API_BASE = getApiBase();
const enrolledNames = ["Aarav", "Karan", "Maya", "Riya"];

export function estimateEnrollmentQuality({ poseIndex, elapsedStableMs, face }) {
  if (!face) {
    return { ok: false, message: "Face Not Detected", score: 0 };
  }

  const count = face.count ?? 1;
  if (count > 1) {
    return { ok: false, message: "Single Face Only", score: 35 };
  }

  const box = face.box || {};
  if (box.w < 0.18) {
    return { ok: false, message: "Move Closer", score: 48 };
  }

  if (face.det_score < 0.5) {
    return { ok: false, message: "Low Detection Quality", score: 55 };
  }

  // Pose validation using pitch, yaw, roll
  const [pitch, yaw, roll] = face.pose || [0, 0, 0];
  
  const poseRequirements = [
    { name: "Look Straight", check: () => Math.abs(yaw) < 15 && Math.abs(pitch) < 15 },
    { name: "Turn Left", check: () => yaw > 18 },
    { name: "Turn Right", check: () => yaw < -18 },
    { name: "Look Up", check: () => pitch < -15 },
    { name: "Look Down", check: () => pitch > 15 },
    { name: "Smile", check: () => true },
    { name: "Blink", check: () => true },
  ];

  const currentReq = poseRequirements[poseIndex] || { check: () => true };
  const poseMatch = currentReq.check();

  if (!poseMatch) {
    const messages = [
      Math.abs(yaw) > 15 ? "Face not straight" : "Center your face",
      "Turn further left", 
      "Turn further right", 
      "Look further up", 
      "Look further down", 
      "Smile now", 
      "Blink now"
    ];
    return { ok: false, message: messages[poseIndex] || "Adjust Position", score: 66 };
  }

  if (elapsedStableMs < 800) {
    return { ok: false, message: "Hold Position", score: 82 };
  }

  return { ok: true, message: "Perfect", score: 98 };
}

export async function recognizeLiveFrame(file) {
  const form = new FormData();
  form.append("file", file, file.name || "frame.jpg");

  const response = await fetch(`${API_BASE}/recognize/live`, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    throw new Error("Live recognition service is unavailable.");
  }

  const data = await response.json();
  return {
    detections: Array.isArray(data.detections) ? data.detections : [],
    count: Number.isFinite(data.count) ? data.count : 0
  };
}
