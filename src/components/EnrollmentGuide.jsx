import { motion } from "framer-motion";
import { Brain, Camera, CheckCircle2, Loader2, Save, ShieldCheck, UserRoundCheck } from "lucide-react";

export default function EnrollmentGuide({ pose, saving, result, error, warning, captureCount, totalPoses }) {
  if (result) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-lg p-5">
        <CheckCircle2 className="mb-3 h-8 w-8 text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">{result.message}</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <Metric label="Captures" value={result.captureCount} />
          <Metric label="Embedding" value={result.embeddingGenerated ? `${result.embeddingCount || 0} vectors` : "Not Ready"} />
          <Metric label="Profile" value={result.dbSynced ? "Saved + Synced" : "Saved"} />
        </div>
        {warning && <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{warning}</p>}
      </motion.div>
    );
  }

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-cyanx/15 text-cyanx">
          <Brain className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">AI Prompt</p>
          <h2 className="text-2xl font-semibold text-white">{pose}</h2>
        </div>
      </div>
      
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <p className="text-lg font-medium text-slate-200">Please follow the instruction above.</p>
        <p className="mt-1 text-sm text-slate-400">Move your head as requested and click "Capture Pose" when you are ready.</p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">
        <p className="text-sm font-medium text-slate-400">
          Capture Progress: <span className="text-cyanx font-bold">{captureCount} of {totalPoses}</span>
        </p>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-cyanx">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving profile...
          </div>
        )}
      </div>
      {warning && <p className="mt-4 rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{warning}</p>}
      {error && <p className="mt-4 rounded-md border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</p>}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex justify-center text-cyanx">
        {label === "Profile" ? <UserRoundCheck className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
