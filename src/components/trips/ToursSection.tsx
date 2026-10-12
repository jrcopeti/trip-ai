import { useParams } from "next/navigation";
import { LuMapPin } from "react-icons/lu";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import Reveal from "@/components/sorbet/Reveal";
import TripCard from "@/components/sorbet/TripCard";
import { Section, SectionHeading } from "./Section";
import { tours as copy } from "./content";
import { CARD_TINTS } from "./tints";

function ToursSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();

  const tours = ((trip?.tours || response?.tours) as string[] | undefined) ?? [];

  return (
    <Section ground="bg-sorbet-offwhite">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
        {tours.map((tour, i) => (
          <li key={i}>
            <Reveal delay={0.06 * i} className="h-full">
              <TripCard
                card={{
                  title: tour,
                  chip: copy.chip(i + 1),
                  Icon: LuMapPin,
                  tint: CARD_TINTS[i % CARD_TINTS.length],
                }}
                titleClassName="max-w-[32ch]"
                interactive={false}
                className="h-full"
              />
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export default ToursSection;
