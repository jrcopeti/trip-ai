import type { IconType } from "react-icons";
import { FaArrowRight } from "react-icons/fa6";

/**
 * One activity card's content: a title, its category chip, and the pastel
 * ground it sits on. Lives here rather than with the landing copy so any
 * migrated page can build a card without importing landing content.
 */
export type ItineraryCard = {
  title: string;
  chip: string;
  Icon: IconType;
  tint: string;
  /** A line under the title, for cards that need more than a name. */
  body?: string;
};

/**
 * The pastel activity card from the reference: title top, category chip
 * bottom-left, dark circular arrow bottom-right.
 *
 * The title is capped at 14ch for a short name; `titleClassName` lifts the cap
 * when the title is a sentence (a suggested tour).
 */
function TripCard({
  card,
  className = "",
  titleClassName = "max-w-[14ch]",
  interactive = true,
}: {
  card: ItineraryCard;
  className?: string;
  titleClassName?: string;
  interactive?: boolean;
}) {
  return (
    <article
      className={`flex min-h-40 flex-col justify-between rounded-3xl p-4 md:min-h-44 md:p-5 ${card.tint} ${className}`}
    >
      <div>
        <h3
          className={`text-lg font-semibold leading-snug text-sorbet-ink first-letter:uppercase md:text-xl ${titleClassName}`}
        >
          {card.title}
        </h3>
        {card.body && (
          <p className="mt-2 text-sm leading-relaxed text-sorbet-ink/70">{card.body}</p>
        )}
      </div>
      <div className="mt-5 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1.5 text-xs font-medium text-sorbet-ink">
          <card.Icon size={12} aria-hidden />
          {card.chip}
        </span>
        {interactive && (
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite"
          >
            <FaArrowRight size={13} />
          </span>
        )}
      </div>
    </article>
  );
}

export default TripCard;
