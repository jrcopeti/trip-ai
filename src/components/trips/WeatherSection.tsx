"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import { useWeather } from "@/hooks/useWeather";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import suncloudy from "@/assets/weather/suncloudy.png";
import { IoWaterOutline } from "react-icons/io5";
import { LuWind } from "react-icons/lu";
import { TbSunrise } from "react-icons/tb";
import { BsSunsetFill } from "react-icons/bs";
import { BiMessageSquareError } from "react-icons/bi";
import Reveal from "@/components/sorbet/Reveal";
import SquiggleLoader from "@/components/sorbet/SquiggleLoader";
import { Section, SectionHeading, SectionNotice } from "./Section";
import { weather as copy } from "./content";
dayjs.extend(utc);

const toCelsius = (kelvin?: number) => Math.round((kelvin ?? 0) - 273.15);

function WeatherSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();
  const { generateWeather, weatherData, errorWeather } = useWeather();

  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;

  useEffect(() => {
    if (
      (trip?.city && trip?.country) ||
      (formData?.city && formData?.country)
    ) {
      generateWeather({
        city: city,
        country: country,
      });
    }
  }, [
    generateWeather,
    city,
    country,
    trip?.city,
    trip?.country,
    formData?.city,
    formData?.country,
  ]);

  return (
    <Section ground="bg-sorbet-offwhite">
      <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />
      {weatherData ? (
        <WeatherCard weatherData={weatherData} place={`${city}, ${country}`} />
      ) : !errorWeather ? (
        // Loading until there is weather or an error — including the first render,
        // before the effect above has even started the request.
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

/**
 * The origin of the icon breakout: the weather icon overflows the card's top
 * edge on mobile and its left edge from `sm` up, via negative margins, so the
 * card's padding is asymmetric to make room. `WeatherPacking` on the landing
 * copies this card; keep the two aligned.
 */
function WeatherCard({
  weatherData,
  place,
}: {
  weatherData: NonNullable<ReturnType<typeof useWeather>["weatherData"]>;
  place: string;
}) {
  const { weatherIconSrc, main, sys, wind } = weatherData;
  const timezone = weatherData.timezone ?? 0;
  const condition = weatherData.weather?.[0];

  const localTime = (unix?: number) =>
    dayjs
      .unix(unix ?? 0)
      .utc()
      .add(timezone, "s")
      .format("HH:mm");

  const metrics = [
    { Icon: IoWaterOutline, value: `${main?.humidity ?? 0}%`, label: copy.metrics.humidity },
    {
      Icon: LuWind,
      value: `${Math.round((wind?.speed ?? 0) * 3.6)} km/h`,
      label: copy.metrics.wind,
    },
    { Icon: TbSunrise, value: localTime(sys?.sunrise), label: copy.metrics.sunrise },
    { Icon: BsSunsetFill, value: localTime(sys?.sunset), label: copy.metrics.sunset },
  ];

  return (
    <Reveal delay={0.06}>
      <div className="relative mt-16 flex max-w-3xl flex-col rounded-[1.75rem] bg-white px-6 pb-8 pt-0 sm:flex-row sm:items-center sm:pl-0 sm:pr-8 sm:pt-8 md:mt-20">
        <Image
          src={weatherIconSrc ?? suncloudy}
          alt=""
          aria-hidden
          width={400}
          height={400}
          className="-mt-12 mb-2 h-40 w-40 self-center object-contain saturate-150 sm:-ml-14 sm:-mt-6 sm:mb-0 sm:mr-2 sm:h-56 sm:w-56 md:-ml-16 md:h-64 md:w-64"
        />

        <div className="min-w-0">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-sorbet-ink/50">
            {place}
          </p>

          <p className="mt-1 text-6xl font-extrabold leading-none tracking-[-0.04em] text-sorbet-ink md:text-7xl">
            {toCelsius(main?.temp)}
            <span className="align-top text-3xl md:text-4xl">ºC</span>
          </p>
          <p className="mt-1 text-sm text-sorbet-ink/60">
            {copy.feelsLike(toCelsius(main?.feels_like))}
          </p>

          <p className="mt-4 text-2xl font-semibold text-sorbet-ink">{condition?.main}</p>
          <p className="text-sm text-sorbet-ink/60 first-letter:uppercase">
            {condition?.description}
          </p>

          <p className="mt-3 text-sm font-semibold text-sorbet-ink/70">
            <span className="font-medium text-sorbet-ink/45">{copy.low}</span>{" "}
            {toCelsius(main?.temp_min)}ºC
            <span className="ml-3 font-medium text-sorbet-ink/45">{copy.high}</span>{" "}
            {toCelsius(main?.temp_max)}ºC
          </p>

          <ul className="mt-6 flex flex-wrap items-start gap-x-7 gap-y-3">
            {metrics.map(({ Icon, value, label }) => (
              <li key={label} className="flex flex-col items-center gap-1">
                <Icon size={20} className="text-sorbet-ink/70" aria-hidden />
                <span className="whitespace-nowrap text-sm font-semibold text-sorbet-ink">
                  {value}
                </span>
                <span className="sr-only">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Reveal>
  );
}

export default WeatherSection;
