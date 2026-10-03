"use client";

import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  /** Stagger in seconds. */
  delay?: number;
  className?: string;
};

/**
 * Shared scroll reveal so every section enters the same way.
 *
 * Deliberately unconditional: reduced motion is handled by MotionProvider, which
 * lets the opacity fade run and skips the y movement. Branching here on
 * `useReducedMotion()` would change the rendered output between server and client
 * and strand the element at opacity 0.
 */
function Reveal({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default Reveal;
