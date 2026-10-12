import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import Reveal from "@/components/sorbet/Reveal";
import { Section, SectionHeading } from "./Section";
import ToursCarousel from "./ToursCarousel";
import { toTours } from "./tours";
import { tours as copy } from "./content";

function ToursSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();

  const tours = toTours(trip?.tours || response?.tours);

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
