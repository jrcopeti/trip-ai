import type { CSSProperties } from "react";
import logo from "@/assets/logo.png";

const SIZES = {
  nav: "size-8 rounded-lg p-1",
  footer: "size-10 rounded-xl p-1.5",
  // The word's own clamp, so `em` is its font size: a touch taller than its
  // `leading-[0.8]` line, as the footer's tile is beside its word.
  lockup: "text-[clamp(3.5rem,12vw,9rem)] size-[0.9em] rounded-[0.225em] p-[0.11em]",
} as const;

/**
 * The app tile: lime, with the suitcase-and-passport glyph in ink.
 *
 * The glyph is `logo.png` used as a mask over an ink fill rather than shown as
 * an image, so its colour comes from the `sorbet-ink` token and not from the
 * artwork's own teal gradient. Only the PNG's alpha matters.
 *
 * Decorative: it always sits beside the "trip ai" wordmark, which is the name.
 * `scripts/render-icons.mjs` draws the same tile for the favicon.
 */
function Logo({
  size = "nav",
  className = "",
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid place-items-stretch bg-sorbet-lime ${SIZES[size]} ${className}`}
    >
      {/* The URL travels as a custom property: the mask itself is Tailwind's. */}
      <span
        data-logo-glyph
        className="bg-sorbet-ink mask-(--logo-mask) mask-contain mask-center mask-no-repeat"
        style={{ "--logo-mask": `url(${logo.src})` } as CSSProperties}
      />
    </span>
  );
}

export default Logo;
