"use client";
import { Suspense, use } from "react";
import ForecastSectionCard from "./ForecastSectionCard";
import { BiMessageSquareError } from "react-icons/bi";
import Reveal from "@/components/sorbet/Reveal";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { Section, SectionHeading, SectionNotice } from "./Section";
import { forecast as copy } from "./content";
import type { DailyForecastDataTypes } from "@/types";

/** The forecast is fetched on the server (`loadWeather`); the heading shows while it streams in. */
function ForecastSection({ forecast }: { forecast: Promise<DailyForecastDataTypes[]> }) {
  return (
    <Section ground="bg-white">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      <Suspense
        fallback={
          <div role="status" aria-label={copy.loading} className="mt-12">
            <SquiggleLoader className="h-12 w-20" />
          </div>
        }
      >
        <ForecastDays forecast={forecast} />
      </Suspense>
    </Section>
  );
}

// A failed request comes back as no days too (`loadWeather`), so both say the same thing.
function ForecastDays({ forecast }: { forecast: Promise<DailyForecastDataTypes[]> }) {
  const days = use(forecast);
  return days.length > 0 ? (
    <ul className="mt-20 grid grid-cols-2 gap-x-4 gap-y-14 lg:grid-cols-5">
      {days.map((day, i) => (
        // Two columns below lg: an odd last card spans both and centres at
        // one column's width (half the row minus half the 1rem gap).
        <li
          key={day.dt}
          className="max-lg:last:odd:col-span-2 max-lg:last:odd:w-[calc(50%-0.5rem)] max-lg:last:odd:justify-self-center"
        >
          <Reveal delay={0.06 * i} className="h-full">
            <ForecastSectionCard forecast={day} />
          </Reveal>
        </li>
      ))}
    </ul>
  ) : (
    <SectionNotice>
      <BiMessageSquareError aria-hidden className="text-sorbet-alert" />
      {copy.unavailable}
    </SectionNotice>
  );
}

export default ForecastSection;
