import { Card, CardBody, CardHeader } from "@nextui-org/react";
import Image from "next/image";
import cloud from "@/assets/weather/sunnycloudy.png";
import { useWeather } from "@/hooks/useWeather";
import { useEffect } from "react";
import { IoWaterOutline } from "react-icons/io5";
import { LuWind } from "react-icons/lu";
import { TbSunrise } from "react-icons/tb";
import { BsSunsetFill } from "react-icons/bs";

import dayjs from "dayjs";

function WeatherSection({ trip }) {
  const { generateWeather, isPendingWeather, weatherData } = useWeather();
  console.log(weatherData);

  if (isPendingWeather) {
    <p>Loading weather section...</p>;
  }

  useEffect(() => {
    if (trip.city && trip.country) {
      generateWeather({ city: trip.city, country: trip.country });
    }
  }, [generateWeather, trip.city, trip.country]);

  if (!weatherData) {
    return <p>loading weather data</p>;
  }

  const { weatherIconSrc } = weatherData;
  const main = weatherData?.main;
  const temperature = Math.round((main?.temp ?? null) - 273.15);
  const feelsLike = Math.round((main?.feels_like ?? null) - 273.15);
  const tempMin = Math.round((main?.temp_min ?? null) - 273.15);
  const tempMax = Math.round((main?.temp_max ?? null) - 273.15);

  const sys = weatherData?.sys;
  const sunrise = dayjs.unix(sys.sunrise);
  const formattedSunrise = sunrise.format("HH:mm");
  const sunset = dayjs.unix(sys.sunset);
  const formattedSunset = sunset.format("HH:mm");

  const weather = weatherData?.weather?.[0];
  const condition = weather?.main;
  const weatherDescription = weather?.description;

  return (
    <>
      <div className="sm:pr-[pr-[100px] px] mx-0 my-[40px] flex w-[80%] flex-col rounded-2xl bg-gallery-100 pb-[60px] pl-[50px] pr-[50px] text-center sm:max-h-[400px] sm:w-[75vw] sm:max-w-[500px] sm:flex-row sm:items-center sm:pb-[50px] sm:pl-[20px] sm:pt-[80px] sm:text-start ">
        <Image
          height={400}
          width={400}
          alt="weather-icon"
          src={cloud}
          className="  md:rounded-inherit  xs:ml-[22%] -mt-[86px] mb-[30px] ml-[10px] h-[45vw] w-[45vw] object-contain sm:-ml-[145px] sm:-mt-[0px] sm:mb-[30px] sm:h-[250px] sm:w-full sm:max-w-[1000px] md:-ml-[161px] md:-mt-[0] md:mr-[30px] md:h-[300px] md:w-[35vw] md:max-w-[280px] "
        />
        <div className="">
          <p className="mb-4 uppercase sm:mb-8">
            {trip?.city}, {trip?.country}
          </p>
          <h2 className="mb-4 mt-0 text-7xl font-semibold sm:mb-8 sm:mr-0 sm:text-[6rem] ">
            {temperature}ºC
          </h2>
          <h3 className="text-3xl font-semibold opacity-70 md:text-4xl">
            {condition}
          </h3>
          <p className="mb-4 ml-1">{weatherDescription}</p>
          <p className=" text-md mb-2 flex gap-x-2 text-xl font-semibold opacity-50 ">
            <span>Min {tempMin}ºC</span>
            <span>Max {tempMax}ºC</span>
          </p>
          <p className=' flex gap-x-4'>
            <span> <TbSunrise/> {formattedSunrise}</span>
            <span> <BsSunsetFill/> {formattedSunset}</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default WeatherSection;
