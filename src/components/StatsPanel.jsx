import { Activity, Eye, Gauge, UserX } from "lucide-react";

export default function StatsPanel({ stats }) {
  const items = [
    { label: "FPS", value: stats.fps, icon: Gauge },
    { label: "Faces", value: stats.totalFaces, icon: Eye },
    { label: "Known", value: stats.recognized, icon: Activity },
    { label: "Unknown", value: stats.unknown, icon: UserX }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="glass rounded-lg p-4">
          <Icon className="mb-3 h-5 w-5 text-cyanx" />
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
