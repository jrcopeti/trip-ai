import { BsCheck } from "react-icons/bs";

/**
 * The selected mark on a chip: an ink disc pinned to the top-right corner.
 * Positioned absolutely so choosing a chip never changes its width — an inline
 * check grew the chip and could push its neighbours onto the next line. Shown
 * by the chip's `data-selected` (`chip()` makes the chip a `group`).
 */
function ChipCheck() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -right-1.5 -top-1.5 hidden size-5 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite group-data-selected:grid"
    >
      <BsCheck className="size-4" />
    </span>
  );
}

export default ChipCheck;
