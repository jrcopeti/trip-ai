"use client";

import { motion } from "framer-motion";

/**
 * The app's loading mark, wherever something is being waited on, in the
 * system's hand: the ink loop from the landing's
 * `Squiggle`, drawn on, carried along and drawn off, over and over — so it reads
 * as "still working" rather than a one-off flourish. Decorative; the page next
 * to it says what is happening.
 *
 * `pathLength`/`pathOffset` are SVG attribute animations, not transforms, so
 * `MotionConfig`'s reduced-motion setting leaves them running. That is
 * deliberate: it is the only sign the wait is not stuck.
 */
function SquiggleLoader({ className = "" }: { className?: string }) {
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
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: [0, 1, 1], pathOffset: [0, 0, 1] }}
        transition={{
          duration: 2.4,
          times: [0, 0.5, 1],
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.2,
        }}
      />
    </svg>
  );
}

export default SquiggleLoader;
