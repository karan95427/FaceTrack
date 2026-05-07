import { Camera, Loader2, VideoOff } from "lucide-react";

export default function CameraFeed({ videoRef, state, error, onStart, children, fullscreen = false }) {
  const inactive = state !== "ready";

  return (
    <div className={`relative overflow-hidden rounded-lg border border-white/10 bg-black ${fullscreen ? "h-[calc(100vh-73px)]" : "aspect-video"}`}>
      <video ref={videoRef} className="camera-video h-full w-full object-cover" playsInline muted />
      <div className="pointer-events-none absolute inset-0 scan-grid opacity-40" />
      {children}

      {inactive && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/78 p-6 text-center backdrop-blur-sm">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-lg border border-cyanx/30 bg-cyanx/10">
              {state === "requesting" ? <Loader2 className="h-6 w-6 animate-spin text-cyanx" /> : <Camera className="h-6 w-6 text-cyanx" />}
            </div>
            <h2 className="text-xl font-semibold text-white">Camera Access</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{error || "Allow camera permission to start AI-guided face capture and live recognition."}</p>
            <button
              type="button"
              onClick={onStart}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-cyanx px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              {state === "error" ? <VideoOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              Enable Camera
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
