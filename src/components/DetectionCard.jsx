export default function DetectionCard({ detection }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{detection.name}</p>
          <p className="text-xs text-slate-500">{detection.id}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs ${detection.recognized ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-400/15 text-rose-300"}`}>
          {detection.confidence}%
        </span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full ${detection.recognized ? "bg-emerald-400" : "bg-rose-400"}`} style={{ width: `${detection.confidence}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">Similarity {detection.similarity.toFixed(2)}</p>
    </div>
  );
}
