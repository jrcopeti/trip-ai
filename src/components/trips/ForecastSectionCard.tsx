import Image from "next/image";
import suncloudy from "@/assets/weather/suncloudy.png";
import { DailyForecastDataTypes } from "@/types";
import dayjs from "dayjs";

export interface ForecastSectionCardProps {
  forecast: DailyForecastDataTypes;
}

function ForecastSectionCard({ forecast }: ForecastSectionCardProps) {
  const dt = forecast?.dt;
  const date = dayjs.unix(dt).format("dddd");

  const main = forecast?.main;
  const temperature = Math.round((main?.temp ?? 0) - 273.15 ?? 0);
  const feelsLike = Math.round((main?.feels_like ?? 0) - 273.15 ?? 0);
  const tempMin = Math.round((main?.temp_min ?? 0) - 273.15 ?? 0);
  const tempMax = Math.round((main?.temp_max ?? 0) - 273.15 ?? 0);

  const weather = forecast?.weather?.[0];
  const condition = weather?.main;

  const dailyForecastIconSrc = forecast?.dailyForecastIconSrc;
  return (
    <div className="relative flex h-[20vh] min-h-[20vh] w-[20vh] max-w-[20vh] flex-col justify-center bg-gallery-50/70 px-[35px] text-center text-tuna-900 shadow-xl xs:px-[45px] lg:h-[23vh] lg:min-h-[23vh] lg:w-[23vh] lg:max-w-[23vh] lg:px-[50px] xl:h-[30vh] xl:min-h-[30vh] xl:w-[30vh] xl:max-w-[30vh] 2xl:h-[35vh] 2xl:min-h-[35vh] 2xl:w-[35vh] 2xl:max-w-[35vh]">
      <Image
        height={400}
        width={400}
        alt="weather-icon"
        src={dailyForecastIconSrc ?? suncloudy}
        className="-mt-[90%] mb-2 object-contain saturate-150 filter sm:-mt-[70%] "
      />
      <section className="-ml-[10%] flex flex-col items-center text-tuna-900">
        <p className="mb-1 text-xs uppercase xs:text-sm lg:text-base">{date}</p>

        <h2 className=" mt-0 text-2xl font-semibold xs:text-3xl lg:text-4xl ">
          {temperature}ºC
        </h2>

        <h3 className=" text-lg font-semibold text-tuna-600 xs:text-xl lg:text-2xl">
          {condition}
        </h3>
      </section>
    </div>
  );
}

export default ForecastSectionCard;
