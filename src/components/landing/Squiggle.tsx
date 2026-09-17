"use client";

import { motion } from "framer-motion";

type Props = {
  className?: string;
  /**
   * When given, the draw-on waits for `true` instead of firing on viewport
   * entry. The hero needs this: it is in view from the first paint but hidden
   * behind the intro, so `whileInView` would draw it before anyone can see it.
   */
  play?: boolean;
  /** Seconds to wait once `play` flips, so the curtain can clear it first. */
  delay?: number;
};

/** The hand-drawn ink loop from the reference deck. Decorative. */
function Squiggle({ className = "", play, delay = 0 }: Props) {
  const gated = play !== undefined;

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
        animate={gated ? { pathLength: play ? 1 : 0 } : undefined}
        whileInView={gated ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.0, ease: "easeInOut", delay: play ? delay : 0 }}
      />
    </svg>
  );
}

export default Squiggle;
