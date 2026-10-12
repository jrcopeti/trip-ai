import { useParams } from "next/navigation";
import { LuPackage } from "react-icons/lu";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import Reveal from "@/components/sorbet/Reveal";
import TripCard from "@/components/sorbet/TripCard";
import type { ObjectsListType } from "@/types";
import { Section, SectionHeading } from "./Section";
import { objects as copy } from "./content";
import { CARD_TINTS } from "@/components/sorbet/tints";
import { CARD_DRIFT, drift } from "./drift";

function ObjectsSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();

  const objectsList =
    ((trip?.objectsList || response?.objectsList) as ObjectsListType[] | undefined) ?? [];

  return (
    <Section ground="bg-sorbet-canvas">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
        {objectsList.map((object, i) => (
          <li key={i}>
            <Reveal delay={0.06 * (i % 3)} className="h-full">
              <TripCard
                card={{
                  title: object.item,
                  body: object.description,
                  chip: copy.chip(object.quantity),
                  Icon: LuPackage,
                  tint: CARD_TINTS[i % CARD_TINTS.length],
                }}
                interactive={false}
                className={`h-full ${drift(CARD_DRIFT, i)}`}
              />
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export default ObjectsSection;
