export function getApiBase() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "http://127.0.0.1:8000";
  }

  const { protocol, hostname, port } = window.location;
  if (port === "8000") {
    return "";
  }

  return `${protocol}//${hostname}:8000`;
}
