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
  const { generateDailyForecast, isPendingDailyForecast, dailyForecastData } =
    useWeather();
  console.log(dailyForecastData);
  console.log("isPending`Weather", isPendingDailyForecast);

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
      <p className="text-xl font-semibold text-tuna-900">
        <BiMessageSquareError color="#c2150c" /> Forecast data is not available
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-16 2xl:gap-[5rem]">
      <h2 className="hidden text-4xl font-semibold capitalize text-tuna-900 lg:block 2xl:text-5xl">
        5 days forecast
      </h2>
      <div className="grid grid-cols-2 gap-x-8 gap-y-12 p-5 lg:grid-cols-5 lg:gap-8 ">
        <div className="forecast-card relative flex h-[20vh] min-h-[20vh] w-[20vh] max-w-[20vh] flex-col items-center justify-center bg-gallery-50/70 text-center text-tuna-900 shadow-xl  sm:h-[23vh] sm:min-h-[23vh] sm:w-[23vh] sm:max-w-[23vh] md:h-[25vh] md:min-h-[25vh] md:w-[25vh] md:max-w-[25vh] lg:hidden lg:h-[28vh] lg:min-h-[28vh] lg:w-[28vh] lg:max-w-[28vh] xl:h-[30vh] xl:min-h-[30vh] xl:w-[30vh] xl:max-w-[30vh] 2xl:h-[35vh] 2xl:min-h-[35vh] 2xl:w-[35vh] 2xl:max-w-[35vh]">
          <h2 className=" w-[100px] text-lg font-semibold capitalize text-tuna-800 xs:text-2xl">
            5 days forecast
          </h2>
        </div>

        {dailyForecastData?.map((forecast, i) => (
          <ForecastSectionCard key={i} forecast={forecast} />
        ))}
      </div>
    </div>
  );
}

export default ForecastSection;
