"use client";
import { useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import ForecastSectionCard from "./ForecastSectionCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { BiMessageSquareError } from "react-icons/bi";
import type { ForecastSectionProps } from "@/types";

dayjs.extend(utc);

function ForecastSection({ trip, formData }: ForecastSectionProps) {
  const { generateDailyForecast, dailyForecastData } = useWeather();
  useEffect(() => {
    if ((trip.city && trip.country) || (formData?.city && formData?.country)) {
      generateDailyForecast({
        city: trip.city || formData?.city,
        country: trip.country || formData?.country,
      });
    }
  }, [
    generateDailyForecast,
    trip.city,
    trip.country,
    formData?.city,
    formData?.country,
  ]);

  if (dailyForecastData?.length === 0) {
    return (
      <p className="flex items-center gap-2 text-xl font-semibold text-tuna-900">
        <BiMessageSquareError color="#c2150c" /> Forecast data is not available
      </p>
    );
  }

  console.log("dailyForecastData", dailyForecastData);

  return (
    <div className="flex flex-col items-center gap-16 2xl:gap-[5rem]">
      <div className="hidden text-3xl font-semibold text-tuna-900 lg:flex lg:items-center lg:gap-2 2xl:text-4xl">
        <h2>5 days forecast -</h2>
        <h3 className="font-normal uppercase">
          {trip.city || formData?.city}, {trip.country || formData?.country}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 p-5 lg:grid-cols-5 lg:gap-8 ">
        <div className="forecast-card relative flex h-[140px] min-h-[140px] w-[140px] max-w-[140px] flex-col items-center justify-center bg-gallery-50/70 text-center text-tuna-900 shadow-xl  sm:h-[150px] sm:min-h-[150px] sm:w-[150px] sm:max-w-[150px] md:h-[170px] md:min-h-[170px] md:w-[170px] md:max-w-[170px] lg:hidden ">
          <div className="w-[100px] text-sm font-semibold capitalize text-tuna-800 xs:text-base">
            <h2>5 days forecast</h2>

            <h3 className="mt-2 text-xs font-normal uppercase">
              {trip.city || formData?.city}, {trip.country || formData?.country}
            </h3>
          </div>
        </div>

        {dailyForecastData?.map((forecast, i) => (
          <ForecastSectionCard key={i} forecast={forecast} />
        ))}
      </div>
    </div>
  );
}

export default ForecastSection;
