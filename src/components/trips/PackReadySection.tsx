import { useParams } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LuLuggage } from "react-icons/lu";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import { useTripResponse } from "@/hooks/useTripResponse";
import Reveal from "@/components/sorbet/Reveal";
import StickerBadge from "@/components/sorbet/StickerBadge";
import { Section, SectionHeading } from "./Section";
import { packReady as copy } from "./content";

// Row dates are calendar days at UTC midnight (`toTripRow`), so they're read in UTC.
dayjs.extend(utc);

/** The beat before the packing list: what it is based on, and for when. */
function PackReadySection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();
  const { tripData: response } = useTripResponse();

  const startDate = dayjs.utc(trip?.startDate || response?.startDate).format("DD.MM.YYYY");
  const endDate = dayjs.utc(trip?.endDate || response?.endDate).format("DD.MM.YYYY");
  const byWeather = trip ? trip.byWeather : formData?.byWeather;

  return (
    <Section ground="bg-white">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading}>
        <StickerBadge
          label={copy.badge}
          icon={<LuLuggage />}
          tint="text-sorbet-orchid"
          size={104}
          spin={30}
        />
      </SectionHeading>
      <Reveal delay={0.06}>
        <p className="mt-8 text-lg leading-relaxed text-sorbet-ink/75 md:text-xl">
          {byWeather && (
            <span className="font-semibold text-sorbet-ink">{copy.byWeather}. </span>
          )}
          {copy.range(startDate, endDate)}.
        </p>
      </Reveal>
    </Section>
  );
}

export default PackReadySection;
