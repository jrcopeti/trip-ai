"use client";
import { useEffect } from "react";
import Image from "next/image";
import { useWeather } from "@/hooks/useWeather";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import suncloudy from "@/assets/weather/suncloudy.png";
import { IoWaterOutline } from "react-icons/io5";
import { LuWind } from "react-icons/lu";
import { TbSunrise } from "react-icons/tb";
import { BsSunsetFill } from "react-icons/bs";
import { BiMessageSquareError } from "react-icons/bi";
import type { WeatherSectionProps } from "@/types";
import ForecastSectionCard from "./ForecastSectionCard";

dayjs.extend(utc);

function ForecastSection({ trip, formData }: WeatherSectionProps) {
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
        <div className="relative flex h-[20vh] min-h-[20vh] w-[20vh] max-w-[20vh] flex-col justify-center bg-gallery-50/70 px-[50px] text-center text-tuna-900 shadow-xl lg:hidden lg:h-[23vh] lg:min-h-[23vh] lg:w-[23vh] lg:max-w-[23vh] xl:h-[30vh] xl:min-h-[30vh] xl:w-[30vh] xl:max-w-[30vh] 2xl:h-[35vh] 2xl:min-h-[35vh] 2xl:w-[35vh] 2xl:max-w-[35vh]">
          <h2 className="-ml-[50%] text-lg font-semibold capitalize text-tuna-800 xs:-ml-[15%] xs:text-2xl">
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
