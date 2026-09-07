"use client";

import { motion } from "framer-motion";

/** The hand-drawn ink loop from the reference deck. Decorative. */
function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 90"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <motion.path
        d="M4 84C22 58 44 26 74 12c18-8 34-2 32 14-2 14-20 22-30 14-9-7-4-22 10-26 16-5 30 3 40 14"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </svg>
  );
}

export default Squiggle;
