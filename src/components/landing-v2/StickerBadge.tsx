"use client";

import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  /** Short phrase set around the circle. Repeated to close the ring. */
  label: string;
  /** Glyph in the middle. Pass a rendered icon, e.g. `icon={<BsCompass />}`. */
  icon: ReactNode;
  /** Any Tailwind text-* color; fills the disc via currentColor. */
  tint?: string;
  /** Diameter in px. */
  size?: number;
  /** Seconds per full turn. Negative reverses. */
  spin?: number;
  className?: string;
};

/**
 * The signature element: a pastel disc with its label set around the rim,
 * turning slowly. Purely decorative, so it is hidden from assistive tech.
 */
function StickerBadge({
  label,
  icon,
  tint = "text-buddy-lime",
  size = 112,
  spin = 26,
  className = "",
}: Props) {
  const id = useId().replace(/:/g, "");

  // Repeat the phrase until it comfortably wraps the circumference.
  const phrase = `${label} · `;
  const ring = phrase.repeat(Math.max(2, Math.round(46 / phrase.length)));

  return (
    <div
      aria-hidden
      className={`pointer-events-none select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={tint}
        animate={{ rotate: spin < 0 ? -360 : 360 }}
        transition={{
          duration: Math.abs(spin),
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <defs>
          <path
            id={`ring-${id}`}
            fill="none"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <circle cx="50" cy="50" r="50" fill="currentColor" />
        <text
          className="fill-buddy-ink"
          fontSize="8.5"
          fontWeight={600}
          letterSpacing="0.06em"
        >
          <textPath href={`#ring-${id}`} startOffset="0">
            {ring}
          </textPath>
        </text>
      </motion.svg>
      {/* react-icons default to 1em, so font-size drives the glyph size here. */}
      <span
        className="relative flex items-center justify-center text-buddy-ink"
        style={{ marginTop: -size, height: size, fontSize: size * 0.26 }}
      >
        {icon}
      </span>
    </div>
  );
}

export default StickerBadge;
