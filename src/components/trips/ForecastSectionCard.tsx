import Image from "next/image";
import suncloudy from "@/assets/weather/suncloudy.png";
import dayjs from "dayjs";
import { DailyForecastDataTypes } from "@/types";

function ForecastSectionCard({
  forecast,
}: {
  forecast: DailyForecastDataTypes;
}) {
  const dt = forecast?.dt;
  const date = dayjs.unix(dt).format("dddd");

  const main = forecast?.main;
  const temperature = Math.round((main?.temp ?? 0) - 273.15 ?? 0);

  const weather = forecast?.weather[0];
  const condition = weather?.main;
  const description = weather?.description;

  const dailyForecastIconSrc = forecast?.dailyForecastIconSrc;

  return (
    <div className="forecast-card relative flex h-[20vh] min-h-[20vh] w-[20vh] max-w-[20vh] flex-col justify-center rounded-sm bg-gallery-50/70 px-[35px] text-center text-tuna-900 shadow-xl xs:px-[45px] sm:h-[190px] sm:min-h-[190px] sm:w-[190px] sm:max-w-[190px] md:h-[200px] md:min-h-[200px] md:w-[200px] md:max-w-[200px] lg:h-[200px] lg:min-h-[200px] lg:w-[200px] lg:max-w-[200px] lg:px-[50px] xl:h-[220px] xl:min-h-[220px] xl:w-[220px] xl:max-w-[220px] 2xl:h-[250px] 2xl:min-h-[250px] 2xl:w-[250px] 2xl:max-w-[250px]">
      <Image
        height={400}
        width={400}
        alt="weather-icon"
        src={dailyForecastIconSrc ?? suncloudy}
        className="-mt-[70%] mb-2 object-contain saturate-150 filter sm:-mt-[70%]"
      />
      <section className="-ml-[10%] flex flex-col items-center text-tuna-900">
        <p className="mb-1 text-xs uppercase xs:text-sm lg:text-base">{date}</p>

        <h2 className=" mt-0 text-2xl font-semibold xs:text-3xl lg:text-4xl ">
          {temperature}ºC
        </h2>

        <h3 className="text-lg font-semibold text-tuna-600 xs:text-xl lg:text-2xl">
          {condition}
        </h3>
        <p className="w-[200px] text-[0.65rem] capitalize text-tuna-900 xs:text-[0.7rem] lg:text-xs  ">
          {description}
        </p>
      </section>
    </div>
  );
}

export default ForecastSectionCard;
