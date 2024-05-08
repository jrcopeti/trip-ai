"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useFormData } from "@/hooks/useFormData";
import { useWeather } from "@/hooks/useWeather";
import ForecastSectionCard from "./ForecastSectionCard";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { BiMessageSquareError } from "react-icons/bi";

dayjs.extend(utc);

function ForecastSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { formData } = useFormData();
  const { generateDailyForecast, dailyForecastData } = useWeather();

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
          {city}, {country}
        </h3>
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-x-8 gap-y-12 p-5 lg:grid-cols-5 lg:gap-8">
        <div className="forecast-card relative flex h-[21vh] min-h-[21vh] w-[21vh] max-w-[21vh] flex-col items-center justify-center bg-gallery-50/70 text-center text-tuna-900 shadow-xl sm:h-[190px] sm:min-h-[190px] sm:w-[190px] sm:max-w-[190px] md:h-[200px] md:min-h-[200px] md:w-[200px] md:max-w-[200px] lg:hidden ">
          <div className="w-[100px] text-sm font-semibold capitalize text-tuna-800 xs:text-base">
            <h2>5 days forecast</h2>

            <h3 className="mt-2 text-xs font-normal uppercase">
              {city}, {country}
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
