import type { Trip } from "@/generated/prisma/client";
import Reveal from "@/components/sorbet/Reveal";
import { Section, SectionHeading } from "./Section";
import ToursCarousel from "./ToursCarousel";
import { toTours } from "./tours";
import { tours as copy } from "./content";

function ToursSection({ trip }: { trip: Trip }) {
  const tours = toTours(trip.tours);

  return (
    <Section ground="bg-sorbet-offwhite">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      <Reveal delay={0.06}>
        <ToursCarousel tours={tours} />
      </Reveal>
    </Section>
  );
}

export default ToursSection;
