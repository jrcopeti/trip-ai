"use client";

import { MotionConfig } from "framer-motion";

/**
 * Reduced-motion handling for the whole landing page.
 *
 * `reducedMotion="user"` defers to the OS setting inside Framer Motion itself:
 * transform and layout animations are skipped (they jump straight to their target)
 * while opacity and colour animations still run.
 *
 * This must be done here rather than by branching on `useReducedMotion()` in each
 * component. That hook returns `null` on the server and the real value on the
 * client, so any branch that changes what gets *rendered* produces a hydration
 * mismatch — and React does not patch attribute mismatches. The server's
 * `opacity: 0` would survive into the DOM with no animation left to clear it,
 * leaving the page blank for exactly the users who asked for less motion.
 */
function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export default MotionProvider;
