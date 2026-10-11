"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A hand-drawn ink loop that drops into a downward arrow: "it's below". The
 * landing's `Squiggle` in the same hand, drawing on when it scrolls into view —
 * the loop first, then the head. Decorative.
 */
function SquiggleArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 64 136"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none ${className}`}
    >
      <motion.path
        d="M36 4C14 14 10 38 28 44C44 49 52 30 38 24C24 18 12 34 18 58C23 80 32 100 32 126"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: "easeInOut" }}
      />
      <motion.path
        d="M20 114L32 128L44 114"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: EASE, delay: 0.95 }}
      />
    </svg>
  );
}

export default SquiggleArrow;
