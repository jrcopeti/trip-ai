import { FaArrowRight } from "react-icons/fa6";

import type { ItineraryCard } from "./content";

/**
 * The pastel activity card from the reference: title top, category chip
 * bottom-left, dark circular arrow bottom-right.
 */
function TripCard({
  card,
  className = "",
  interactive = true,
}: {
  card: ItineraryCard;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <article
      className={`flex min-h-40 flex-col justify-between rounded-3xl p-4 md:min-h-44 md:p-5 ${card.tint} ${className}`}
    >
      <h3 className="max-w-[14ch] text-lg font-semibold leading-snug text-buddy-ink md:text-xl">
        {card.title}
      </h3>
      <div className="mt-5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-buddy-ink">
          <card.Icon size={12} aria-hidden />
          {card.chip}
        </span>
        {interactive && (
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-buddy-ink text-buddy-offwhite"
          >
<FaArrowRight size={13} />
          </span>
        )}
      </div>
    </article>
  );
}

export default TripCard;
