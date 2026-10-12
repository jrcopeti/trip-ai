import Image from "next/image";
import suncloudy from "@/assets/weather/suncloudy.png";
import dayjs from "dayjs";
import { DailyForecastDataTypes } from "@/types";

/**
 * One day of the forecast: an offwhite card (the section ground is white) with
 * the weather icon breaking out of its top edge, as on the current-weather card.
 */
function ForecastSectionCard({
  forecast,
}: {
  forecast: DailyForecastDataTypes;
}) {
  const day = dayjs.unix(forecast.dt).format("dddd");
  const temperature = Math.round((forecast.main?.temp ?? 0) - 273.15);
  const weather = forecast.weather?.[0];

  return (
    <article className="flex h-full flex-col items-center rounded-3xl bg-sorbet-offwhite px-4 pb-6 text-center">
      <Image
        src={forecast.dailyForecastIconSrc ?? suncloudy}
        alt=""
        aria-hidden
        width={200}
        height={200}
        className="-mt-8 h-24 w-24 object-contain saturate-150"
      />
      <h3 className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/50">
        {day}
      </h3>
      <p className="mt-2 text-4xl font-extrabold leading-none tracking-[-0.04em] text-sorbet-ink">
        {temperature}
        <span className="align-top text-xl">ºC</span>
      </p>
      <p className="mt-3 text-lg font-semibold text-sorbet-ink">{weather?.main}</p>
      <p className="text-sm text-sorbet-ink/60 first-letter:uppercase">{weather?.description}</p>
    </article>
  );
}

export default ForecastSectionCard;
