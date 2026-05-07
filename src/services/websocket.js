export function createDetectionSocket({ url, onMessage, onStatus }) {
  if (!url) {
    onStatus?.("mock");
    return { close: () => {} };
  }

  const socket = new WebSocket(url);
  socket.addEventListener("open", () => onStatus?.("connected"));
  socket.addEventListener("message", (event) => onMessage?.(JSON.parse(event.data)));
  socket.addEventListener("close", () => onStatus?.("closed"));
  socket.addEventListener("error", () => onStatus?.("error"));

  return socket;
}
