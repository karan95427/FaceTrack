import { motion } from "framer-motion";

export default function FaceOverlay({ face, detections = [], quality }) {
  const boxes = detections.length ? detections : face ? [{ ...face, recognized: quality?.ok, name: quality?.message, confidence: quality?.score }] : [];

  return (
    <div className="pointer-events-none absolute inset-0">
      {!detections.length && (
        <div className="absolute left-1/2 top-1/2 h-[54%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyanx/60 shadow-glow" />
      )}
      {boxes.map((item) => {
        const color = item.recognized ? "border-emerald-400 text-emerald-300 bg-emerald-500/15" : "border-rose-400 text-rose-300 bg-rose-500/15";
        return (
          <motion.div
            key={item.id || item.name}
            className={`absolute rounded-md border-2 ${color}`}
            animate={{
              left: `${(item.box.x - item.box.w / 2) * 100}%`,
              top: `${(item.box.y - item.box.h / 2) * 100}%`,
              width: `${item.box.w * 100}%`,
              height: `${item.box.h * 100}%`
            }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
          >
            <div className={`absolute -top-9 left-0 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${color}`}>
              {item.name || item.message} {item.confidence ? `${item.confidence}%` : ""}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
