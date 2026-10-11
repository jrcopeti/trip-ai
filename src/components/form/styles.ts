/**
 * The form's field vocabulary, shared by all seven steps so a label, an input
 * and an error look the same wherever they appear. HeroUI supplies behaviour
 * and these classes supply the look; colours come from the `[data-sorbet]`
 * scope in globals.css.
 */

/** Meta-label idiom. */
export const fieldLabel =
  "text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/55";

/** The focus triad, with `outline-solid` because HeroUI's `outline-none`
 * zeroes Tailwind's outline-style variable (design-notes, gotcha #9). */
export const focusTriad =
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-sorbet-ink";

/** A text input: a pill on white. */
export const fieldInput = `w-full rounded-full border border-sorbet-ink/15 bg-white px-5 py-3.5 text-base text-sorbet-ink shadow-none placeholder:text-sorbet-ink/45 hover:border-sorbet-ink/35 focus:border-sorbet-ink focus:shadow-none focus:ring-0 data-[invalid=true]:border-sorbet-alert sm:text-base ${focusTriad}`;

/** Multi-line: same field, card radius, since a pill cannot hold paragraphs. */
export const fieldTextArea = `w-full rounded-3xl border border-sorbet-ink/15 bg-white px-5 py-4 text-base text-sorbet-ink shadow-none placeholder:text-sorbet-ink/45 hover:border-sorbet-ink/35 focus:border-sorbet-ink focus:shadow-none focus:ring-0 sm:text-base ${focusTriad}`;

export const fieldError = "text-sm font-medium text-sorbet-alert";

/** A field's wrapper: label, control, error stacked. */
export const field = "flex w-full flex-col gap-2";

/**
 * A selectable chip (radio or checkbox). White with a hairline at rest; the
 * group's pastel and an ink rim once chosen, plus `ChipCheck` in the corner.
 * `relative group` is for that check: it is positioned against the chip and
 * shown by the chip's `data-selected`, so the chip's width never changes.
 * `tint` is a full `data-selected:` class so Tailwind sees it literally.
 */
export function chip(tint: string) {
  return `group relative inline-flex cursor-pointer select-none items-center rounded-full border border-sorbet-ink/15 bg-white px-4 py-2 text-sm font-medium text-sorbet-ink transition-colors hover:border-sorbet-ink/40 data-selected:border-sorbet-ink ${tint} data-disabled:cursor-not-allowed data-disabled:opacity-45 data-disabled:hover:border-sorbet-ink/15 data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-2 data-focus-visible:outline-sorbet-ink motion-reduce:transition-none`;
}

/** Pastel per radio group, so neighbouring groups read apart. */
export const tints = {
  lavender: "data-selected:bg-sorbet-lavender",
  blush: "data-selected:bg-sorbet-blush",
  lime: "data-selected:bg-sorbet-lime-punch",
} as const;

/** Pills used as buttons inside the form. */
export const inkPill = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-sorbet-ink px-7 py-3.5 text-base font-semibold text-sorbet-offwhite transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 motion-reduce:transition-none ${focusTriad}`;

export const limePill = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-sorbet-lime px-7 py-3.5 text-base font-semibold text-sorbet-ink transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 motion-reduce:transition-none ${focusTriad}`;
