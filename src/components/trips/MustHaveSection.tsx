import type { Trip } from "@/generated/prisma/client";
import { FaCheck } from "react-icons/fa6";
import { LuBackpack } from "react-icons/lu";
import Reveal from "@/components/sorbet/Reveal";
import StickerBadge from "@/components/sorbet/StickerBadge";
import { Section, SectionHeading } from "./Section";
import { mustHave as copy } from "./content";
import { PILL_DRIFT, drift } from "./drift";

/** A checklist card in the landing's packing-list idiom: check pills on a pastel. */
function Checklist({
  heading,
  items,
  tint,
  empty,
}: {
  heading: string;
  items: string[];
  tint: string;
  empty?: string;
}) {
  return (
    <div className={`h-full rounded-[1.75rem] p-6 md:p-8 ${tint}`}>
      <h3 className="text-2xl font-semibold text-sorbet-ink">{heading}</h3>
      {items.length > 0 ? (
        <ul className="mt-6 grid gap-2.5">
          {items.map((item, i) => (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-full bg-white/70 px-4 py-3 ${drift(PILL_DRIFT, i)}`}
            >
              <span
                aria-hidden
                className="grid size-5 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite"
              >
                <FaCheck size={10} />
              </span>
              <span className="text-base font-medium text-sorbet-ink first-letter:uppercase">
                {item}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-base text-sorbet-ink/70">{empty}</p>
      )}
    </div>
  );
}

function MustHaveSection({ trip }: { trip: Trip }) {
  const { mustHave } = trip;
  // The traveller's own items, not the model's. `toTripRow` drops blanks; rows from
  // before #202 can still hold the form's empty first row.
  const requiredItems = trip.requiredItems.filter((item) => item.trim() !== "");

  return (
    <Section ground="bg-white">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Reveal className="h-full">
            <Checklist heading={copy.mustHave} items={mustHave} tint="bg-sorbet-lavender" />
          </Reveal>
          <Reveal delay={0.06} className="h-full">
            <Checklist
              heading={copy.required}
              items={requiredItems}
              tint="bg-sorbet-blush"
              empty={copy.noRequired}
            />
          </Reveal>
        </div>
        <Reveal delay={0.12} className="grid place-items-center py-4 lg:py-0">
          <StickerBadge
            label={copy.badge}
            icon={<LuBackpack />}
            tint="text-sorbet-lime-punch"
            size={176}
            spin={-34}
          />
        </Reveal>
      </div>
    </Section>
  );
}

export default MustHaveSection;
