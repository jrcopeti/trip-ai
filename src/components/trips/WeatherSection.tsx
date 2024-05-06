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

dayjs.extend(utc);

function WeatherSection({ trip, formData }: WeatherSectionProps) {
  const { generateWeather, isPendingWeather, weatherData } = useWeather();
  console.log(weatherData);
  console.log("isPending`Weather", isPendingWeather);

  useEffect(() => {
    if ((trip.city && trip.country) || (formData?.city && formData?.country)) {
      generateWeather({
        city: trip.city || formData?.city,
        country: trip.country || formData?.country,
      });
    }
  }, [
    generateWeather,
    trip.city,
    trip.country,
    formData?.city,
    formData?.country,
  ]);

  if (!weatherData) {
    return (
      <p className="text-xl font-semibold text-tuna-900">
        <BiMessageSquareError color="#c2150c" /> Weather data is not available
      </p>
    );
  }

  const { weatherIconSrc } = weatherData;
  const main = weatherData?.main;
  const temperature = Math.round((main?.temp ?? 0) - 273.15 ?? 0);
  const feelsLike = Math.round((main?.feels_like ?? 0) - 273.15 ?? 0);
  const tempMin = Math.round((main?.temp_min ?? 0) - 273.15 ?? 0);
  const tempMax = Math.round((main?.temp_max ?? 0) - 273.15 ?? 0);
  const humidity = main?.humidity ?? 0;

  const sys = weatherData?.sys;
  const timezone = weatherData?.timezone ?? 0;

  const sunrise = dayjs
    .unix(sys?.sunrise ?? 0)
    .utc()
    .add(timezone, "s");
  const formattedSunrise = sunrise.format("HH:mm");

  const sunset = dayjs
    .unix(sys?.sunset ?? 0)
    .utc()
    .add(timezone, "s");
  const formattedSunset = sunset.format("HH:mm");

  const weather = weatherData?.weather?.[0];
  const condition = weather?.main;
  const weatherDescription = weather?.description;

  const wind = weatherData?.wind;
  const speed = Math.round((wind?.speed ?? 0) * 3.6);

  return (
    <>
      <div className="weather-card relative mx-0 my-[40px] flex w-[80%] flex-col rounded-sm bg-gallery-50/70  pb-[60px] pl-[50px] pr-[50px] text-center text-tuna-900 shadow-xl sm:max-h-[400px] sm:w-[75vw] sm:max-w-[500px] sm:flex-row sm:items-center sm:pb-[50px] sm:pl-[20px] sm:pr-[100px] sm:pt-[60px] sm:text-start ">
        <Image
          height={400}
          width={400}
          alt="weather-icon"
          src={weatherIconSrc ?? suncloudy}
          className="-mt-[60px] mb-[30px] ml-[10%] h-[40vw] w-[40vw] object-contain saturate-150 filter xs:-mt-[86px] xs:ml-[12%] xs:h-[45vw] xs:w-[45vw] sm:-ml-[145px] sm:-mt-[0px] sm:mb-[30px] sm:h-[300px] sm:w-full md:-ml-[161px] md:-mt-[0] md:mr-[30px] md:h-[300px] md:max-w-full "
        />
        <div className="text-tuna-900">
          <p className="mb-4 uppercase sm:mb-2">
            {trip?.city || formData?.city}, {trip?.country || formData?.country}
          </p>
          <section>
            <h2 className=" mt-0 text-7xl font-semibold sm:mr-0 sm:text-[6rem]">
              {temperature}ºC
            </h2>
            <p className="mb-4 ml-1">Feels like {feelsLike}ºC</p>

            <h3 className="text-3xl font-semibold text-tuna-600 sm:text-4xl">
              {condition}
            </h3>
          </section>
          <p className="mb-3 ml-1 text-xs first-letter:uppercase">
            {weatherDescription}
          </p>
          <section className="text-md mb-3 flex items-center justify-center gap-x-2 text-xl font-semibold text-tuna-400 sm:justify-start">
            <p>
              <small>Low</small> {tempMin}ºC
            </p>
            <p>
              <small>High</small> {tempMax}ºC
            </p>
          </section>
          <section className="flex items-center justify-center gap-x-[30px] text-sm font-semibold sm:justify-start">
            <div className="flex flex-col items-center">
              <IoWaterOutline size={20} />
              <span>{humidity}%</span>
            </div>
            <div className="flex flex-col items-center">
              <LuWind size={20} />
              <span className="whitespace-nowrap">
                {speed.toFixed(0)}
                <small>km/h</small>
              </span>
            </div>
            <div className="flex flex-col items-center">
              <TbSunrise size={20} />
              <span>{formattedSunrise}</span>
            </div>
            <div className="flex flex-col items-center">
              <BsSunsetFill size={20} />
              <span>{formattedSunset}</span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default WeatherSection;
