import { useParams } from "next/navigation";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useImage } from "@/hooks/useImage";
import defaultImage3 from "@/assets/travel-photos/3.jpg";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { MediaFrame, Section, SectionHeading } from "./Section";
import { mustHave as copy } from "./content";

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
              className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-3"
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

function MustHaveSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { imageData } = useImage();

  const image3 = trip?.image3 || imageData?.tripImage3;
  const placeholder = trip?.placeholder || imageData?.placeholder;
  const mustHave = trip?.mustHave || response?.mustHave || [];
  // The form keeps an empty first row when nothing was added, so blanks are dropped.
  const requiredItems = (
    ((trip?.requiredItems || response?.requiredItems) as string[] | undefined) ?? []
  ).filter((item) => item.trim() !== "");

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
        <Reveal delay={0.12} className="hidden lg:block">
          <MediaFrame>
            <Image
              src={image3 ?? defaultImage3}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={placeholder ?? defaultPlaceholder}
              sizes="400px"
              className="object-cover"
            />
          </MediaFrame>
        </Reveal>
      </div>
    </Section>
  );
}

export default MustHaveSection;
