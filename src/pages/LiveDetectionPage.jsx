import { motion } from "framer-motion";
import { Radio, Server, Wifi } from "lucide-react";
import CameraFeed from "../components/CameraFeed.jsx";
import DetectionCard from "../components/DetectionCard.jsx";
import FaceOverlay from "../components/FaceOverlay.jsx";
import Sidebar from "../components/Sidebar.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import { useCamera } from "../hooks/useCamera.js";
import { useFaceDetection } from "../hooks/useFaceDetection.js";

export default function LiveDetectionPage() {
  const camera = useCamera({ autoStart: true });
  const { detections, history, stats, status, error } = useFaceDetection({
    enabled: camera.cameraState === "ready",
    captureFrameFile: camera.captureFrameFile
  });
  const streamLabel = status === "connected" ? "Backend Live" : status === "error" ? "Backend Error" : "Connecting";

  return (
    <main className="grid gap-0 lg:grid-cols-[1fr_360px]">
      <section className="relative">
        <CameraFeed videoRef={camera.videoRef} state={camera.cameraState} error={camera.error} onStart={camera.startCamera} fullscreen>
          <FaceOverlay detections={detections} />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <StatusPill icon={Radio} label="LIVE" tone="cyan" />
            <StatusPill icon={Wifi} label={streamLabel} tone={status === "error" ? "rose" : "violet"} />
            <StatusPill icon={Server} label="FAISS Ready" tone="slate" />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <StatsPanel stats={stats} />
          </div>
        </CameraFeed>
      </section>

      <Sidebar title="Detection Intelligence">
        {error && <p className="mb-4 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
        <div className="space-y-3">
          {detections.map((detection) => (
            <DetectionCard key={detection.id} detection={detection} />
          ))}
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-white">Detection History</h3>
          <div className="space-y-2">
            {history.length === 0 && <p className="rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">Recognition events will appear when faces stabilize.</p>}
            {history.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{event.name}</p>
                  <p className="text-xs text-slate-500">{event.time}</p>
                </div>
                <span className="text-sm text-cyanx">{event.confidence}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Sidebar>
    </main>
  );
}

function StatusPill({ icon: Icon, label, tone }) {
  const toneClass = {
    cyan: "border-cyanx/30 bg-cyanx/10 text-cyanx",
    violet: "border-violetx/30 bg-violetx/10 text-violet-200",
    slate: "border-white/10 bg-black/45 text-slate-300",
    rose: "border-rose-400/30 bg-rose-400/10 text-rose-200"
  }[tone];

  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${toneClass}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
