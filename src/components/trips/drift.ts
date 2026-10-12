/**
 * Organic hover: each item answers a hover a little differently — its own lift
 * and lean, eased with an overshoot — so a list moves like loose paper rather
 * than a grid. Cycled by index, so neighbours never lean the same way. Under
 * reduced motion the change is instant, as on the polaroids.
 */
export const DRIFT_EASE =
  "transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none";

/** For cards: the packing list. */
export const CARD_DRIFT = [
  "hover:-translate-y-1.5 hover:-rotate-[1.5deg]",
  "hover:-translate-y-1 hover:rotate-1",
  "hover:-translate-y-2 hover:rotate-[0.5deg]",
  "hover:-translate-y-1 hover:-rotate-1",
  "hover:-translate-y-1.5 hover:rotate-[1.5deg]",
] as const;

/**
 * For pills: the Essentials checklists. About half the lean of a card — a long
 * pill swings far at its ends — with a small sideways nudge instead.
 */
export const PILL_DRIFT = [
  "hover:-translate-y-0.5 hover:translate-x-1 hover:-rotate-[0.75deg]",
  "hover:-translate-y-1 hover:rotate-[0.5deg]",
  "hover:-translate-y-0.5 hover:-translate-x-0.5 hover:rotate-[0.75deg]",
  "hover:-translate-y-1 hover:translate-x-0.5 hover:-rotate-[0.5deg]",
] as const;

export function drift(set: readonly string[], index: number) {
  return `${DRIFT_EASE} ${set[index % set.length]}`;
}
