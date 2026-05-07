import { CheckCircle2, Circle } from "lucide-react";

export default function CaptureProgress({ poses, activeIndex, captures, progress }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Capture Progress</p>
        <span className="text-sm text-cyanx">{progress}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-cyanx to-violetx transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-5 space-y-3">
        {poses.map((pose, index) => {
          const done = index < captures.length;
          const active = index === activeIndex;
          return (
            <div key={pose} className={`flex items-center gap-3 rounded-md px-2 py-2 ${active ? "bg-cyanx/10 text-cyanx" : "text-slate-400"}`}>
              {done ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4" />}
              <span className="text-sm">{pose}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
