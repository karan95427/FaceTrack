import { motion } from "framer-motion";
import { Camera, Play, Save, UserPlus } from "lucide-react";
import CameraFeed from "../components/CameraFeed.jsx";
import CaptureProgress from "../components/CaptureProgress.jsx";
import EnrollmentGuide from "../components/EnrollmentGuide.jsx";
import FaceOverlay from "../components/FaceOverlay.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { poses, useEnrollmentFlow } from "../hooks/useEnrollmentFlow.js";
import { useCamera } from "../hooks/useCamera.js";

export default function EnrollmentPage() {
  const camera = useCamera();
  const flow = useEnrollmentFlow({ 
    captureFrame: camera.captureFrame, 
    captureFrameFile: camera.captureFrameFile 
  });
  const canStart = flow.name.trim().length >= 2;

  const beginEnrollment = async () => {
    if (!canStart) return;
    const ready = camera.cameraState === "ready" || (await camera.startCamera());
    if (ready) flow.start();
  };

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_330px]">
      <section className="space-y-5">
        {!flow.started && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-5">
            <div className="mb-5 flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg border border-violetx/35 bg-violetx/15 text-violet-200 shadow-violet">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyanx">Smart Face Enrollment</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">AI-guided profile capture</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Enter a name, follow the guided poses, and manually capture each approved angle before saving the profile to the FastAPI backend.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-300">Person name</span>
                <input
                  value={flow.name}
                  onChange={(event) => flow.setName(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-cyanx focus:ring-4 focus:ring-cyanx/10"
                  placeholder="Enter full name"
                />
              </label>
              <button
                type="button"
                disabled={!canStart}
                onClick={beginEnrollment}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-cyanx px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play className="h-4 w-4" />
                Start Enrollment
              </button>
            </div>
          </motion.div>
        )}

        <CameraFeed videoRef={camera.videoRef} state={camera.cameraState} error={camera.error} onStart={camera.startCamera}>
          <FaceOverlay face={flow.face} quality={flow.quality} />
          {flow.started && (
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/65 p-3 backdrop-blur-md">
              <div className="flex w-full items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Current Pose</p>
                  <p className="text-lg font-semibold text-white">{flow.pose}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={flow.captureCurrentPose}
                    disabled={!flow.canCapture}
                    className="inline-flex items-center gap-2 rounded-md bg-cyanx px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyanx/20 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Camera className="h-4 w-4" />
                    Capture Pose
                  </button>
                  
                  {flow.canFinish && (
                    <button
                      type="button"
                      onClick={flow.finishEnrollment}
                      disabled={flow.saving}
                      className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-40"
                    >
                      <Save className="h-4 w-4" />
                      Finish Enrollment
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CameraFeed>

        {flow.started && (
          <EnrollmentGuide
            pose={flow.pose}
            quality={flow.quality}
            saving={flow.saving}
            result={flow.result}
            error={flow.error}
            warning={flow.warning}
            captureCount={flow.captures.length}
            totalPoses={flow.totalPoses}
          />
        )}
      </section>

      <Sidebar title="Enrollment Session">
        <CaptureProgress poses={poses} activeIndex={flow.poseIndex} captures={flow.captures} progress={flow.progress} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {flow.captures.length === 0 && <p className="col-span-2 rounded-lg border border-dashed border-white/10 p-4 text-sm text-slate-500">Approved captures will appear here after you press Capture Pose for each angle.</p>}
          {flow.captures.map((capture) => (
            <div key={capture.pose} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
              <img src={capture.image} alt={capture.pose} className="aspect-square w-full object-cover" />
              <div className="p-2">
                <p className="truncate text-xs font-semibold text-white">{capture.pose}</p>
                <p className="text-xs text-cyanx">Q {capture.quality}%</p>
              </div>
            </div>
          ))}
        </div>
      </Sidebar>
    </main>
  );
}
