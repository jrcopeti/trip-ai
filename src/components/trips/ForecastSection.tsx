"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import { useWeather } from "@/hooks/useWeather";
import ForecastSectionCard from "./ForecastSectionCard";
import { BiMessageSquareError } from "react-icons/bi";
import Reveal from "@/components/sorbet/Reveal";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { Section, SectionHeading, SectionNotice } from "./Section";
import { forecast as copy } from "./content";

function ForecastSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();
  const { generateDailyForecast, dailyForecastData, isPendingDailyForecast } = useWeather();

  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;
  useEffect(() => {
    if (
      (trip?.city && trip?.country) ||
      (formData?.city && formData?.country)
    ) {
      generateDailyForecast({
        city: city,
        country: country,
      });
    }
  }, [
    generateDailyForecast,
    city,
    country,
    trip?.city,
    trip?.country,
    formData?.city,
    formData?.country,
  ]);

  const days = dailyForecastData ?? [];

  return (
    <Section ground="bg-white">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      {days.length > 0 ? (
        <ul className="mt-20 grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-5">
          {days.map((forecast, i) => (
            // Two columns below lg: an odd last card spans both and centres at
            // one column's width (half the row minus half the 1rem gap).
            <li
              key={forecast.dt}
              className="max-lg:last:odd:col-span-2 max-lg:last:odd:w-[calc(50%-0.5rem)] max-lg:last:odd:justify-self-center"
            >
              <Reveal delay={0.06 * i} className="h-full">
                <ForecastSectionCard forecast={forecast} />
              </Reveal>
            </li>
          ))}
        </ul>
      ) : isPendingDailyForecast ? (
        <div role="status" aria-label={copy.loading} className="mt-12">
          <SquiggleLoader className="h-12 w-20" />
        </div>
      ) : (
        <SectionNotice>
          <BiMessageSquareError aria-hidden className="text-sorbet-alert" />
          {copy.unavailable}
        </SectionNotice>
      )}
    </Section>
  );
}

export default ForecastSection;
