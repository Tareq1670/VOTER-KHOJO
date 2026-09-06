"use client";

import { motion } from "framer-motion";

export function MorphingInfinity({ className = "size-24", strokeWidth = 2.5 }) {
  return (
    <svg
      viewBox="0 0 100 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <motion.path
        d="M25 15 C 38 15, 38 45, 25 45 C 12 45, 12 15, 25 15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        animate={{ pathLength: [0, 1, 1, 0], opacity: [1, 1, 0, 0] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.4, 0.6, 1],
        }}
      />
      <motion.path
        d="M75 15 C 62 15, 62 45, 75 45 C 88 45, 88 15, 75 15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0, 1, 1] }}
        transition={{
          duration: 2.4,
          ease: "easeInOut",
          repeat: Infinity,
          times: [0, 0.4, 0.6, 1],
        }}
      />
    </svg>
  );
}
