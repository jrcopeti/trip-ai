"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Opacity as well as pathLength: an undrawn path is a zero-length dash, and with
// round caps that still paints a dot at each end — the "three dots" seen on a
// phone where the draw-on never started. Invisible until it starts drawing.
const loop: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  drawn: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.0,
      ease: "easeInOut",
      delay: 0.3,
      opacity: { duration: 0.01, delay: 0.3 },
    },
  },
};

const head: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  drawn: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: EASE,
      delay: 1.25,
      opacity: { duration: 0.01, delay: 1.25 },
    },
  },
};

/**
 * A hand-drawn ink loop that drops into a downward arrow: "it's below". The
 * landing's `Squiggle` in the same hand — the loop first, then the head.
 * Decorative.
 *
 * Draws on mount, not on entering the viewport. It hangs from the
 * `/saved-trips` search, so it is on screen at load at every width, and an
 * in-view trigger on its paths never fired on a real phone (Chrome there; it
 * could not be reproduced in emulation), leaving it as three dots. Mounting is
 * what starts the landing's squiggle, which that phone did draw.
 */
function SquiggleArrow({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      aria-hidden
      data-squiggle-arrow
      viewBox="0 0 64 136"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none ${className}`}
      initial="hidden"
      animate="drawn"
    >
      <motion.path
        d="M36 4C14 14 10 38 28 44C44 49 52 30 38 24C24 18 12 34 18 58C23 80 32 100 32 126"
        variants={loop}
      />
      <motion.path d="M20 114L32 128L44 114" variants={head} />
    </motion.svg>
  );
}

export default SquiggleArrow;
