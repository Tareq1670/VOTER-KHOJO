"use client";

import { motion } from "framer-motion";

// Lightweight, dependency-free column chart. `data` is an array of
// `{ key, label, count }`. Bars grow in smoothly with framer-motion.
export default function BarChart({
  data = [],
  height = 140,
  accentClass = "brand-gradient",
}) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {data.map((d, i) => {
          const pct = d.count === 0 ? 2 : Math.max((d.count / max) * 100, 6);
          const barHeight = Math.round((pct * height) / 100);
          return (
            <div
              key={d.key}
              className="relative flex h-full flex-1 items-end justify-center"
              title={`${d.label} — ${d.count} বার`}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeight }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.03,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`w-full max-w-10 rounded-t-md ${accentClass} ${
                  d.count === 0 ? "opacity-25" : ""
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1.5 sm:gap-2">
        {data.map((d) => (
          <span
            key={d.key}
            className="flex-1 truncate text-center text-[10px] text-ink-500"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}