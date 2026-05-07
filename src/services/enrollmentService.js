import { getApiBase } from "./apiBase.js";

const API_BASE = getApiBase();

export async function saveEnrollmentProfile({ name, captures }) {
  if (!name?.trim()) {
    throw new Error("A valid name is required.");
  }

  const form = new FormData();
  form.append("name", name.trim());

  captures.forEach((capture, index) => {
    form.append("files", dataUrlToFile(capture.image, `${name}-${capture.pose}-${index}.jpg`));
  });

  const response = await fetch(`${API_BASE}/enroll`, {
    method: "POST",
    body: form
  });

  if (!response.ok) {
    throw new Error("Enrollment service is unavailable.");
  }

  const data = await response.json();
  if (data.success === false) {
    throw new Error(data.message || "Enrollment failed.");
  }

  return {
    ...data,
    embeddingCount: Number(data.embedding_count || 0),
    embeddingGenerated: Number(data.embedding_count || 0) > 0,
    captureCount: captures.length,
    dbSynced: Boolean(data.db_synced),
    warning: data.warning || ""
  };
}

function dataUrlToFile(dataUrl, filename) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i += 1) {
    array[i] = bytes.charCodeAt(i);
  }

  return new File([array], filename, { type: mime });
}
