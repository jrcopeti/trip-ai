import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { LuLuggage } from "react-icons/lu";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import Reveal from "@/components/sorbet/Reveal";
import StickerBadge from "@/components/sorbet/StickerBadge";
import { Section, SectionHeading } from "./Section";
import { packReady as copy } from "./content";

/** The beat before the packing list: what it is based on, and for when. */
function PackReadySection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();

  const startDate = dayjs(trip?.startDate || formData?.startDate).format("DD.MM.YYYY");
  const endDate = dayjs(trip?.endDate || formData?.endDate).format("DD.MM.YYYY");
  const weatherForecast = trip?.weatherForecast || formData?.weatherForecast;

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
          {weatherForecast && (
            <span className="font-semibold text-sorbet-ink">{copy.byWeather}. </span>
          )}
          {copy.range(startDate, endDate)}.
        </p>
      </Reveal>
    </Section>
  );
}

export default PackReadySection;
