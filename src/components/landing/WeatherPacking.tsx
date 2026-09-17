import Image from "next/image";
import { BsCloudRainFill } from "react-icons/bs";
import { FaCheck } from "react-icons/fa6";

import { currentWeather, forecast, packing } from "./content";
import Reveal from "./Reveal";
import StickerBadge from "./StickerBadge";

function WeatherPacking() {
  const { iconSrc, place, temperature, feelsLike, condition, description, tempMin, tempMax, metrics } =
    currentWeather;

  return (
    <section className="relative bg-white px-5 py-20 sm:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-6">
            <h2 className="max-w-2xl text-[clamp(2rem,5vw,3.5rem)] leading-[1.02] tracking-[-0.03em] text-sorbet-ink">
              <span className="font-extrabold">The packing list</span>{" "}
              <span className="font-medium text-sorbet-ink/60">
                reads the forecast first.
              </span>
            </h2>
            <StickerBadge
              label="check the sky"
              icon={<BsCloudRainFill />}
              tint="text-sorbet-lime-punch"
              size={96}
              spin={-28}
              className="hidden md:block"
            />
          </div>
        </Reveal>

        {/*
          Weather card follows WeatherSection: the icon breaks out of the card on
          the top edge (mobile) and the left edge (from sm up) via negative margins,
          so the card needs generous padding on those sides to make room.
        */}
        <div className="mt-16 grid gap-4 md:mt-20 md:grid-cols-[1.15fr_1fr]">
          <Reveal>
            <div className="relative flex h-full flex-col rounded-[1.75rem] bg-sorbet-offwhite px-6 pb-8 pt-0 sm:flex-row sm:items-center sm:pl-0 sm:pr-8 sm:pt-8">
              <Image
                src={iconSrc}
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
                  {temperature}
                  <span className="align-top text-3xl md:text-4xl">ºC</span>
                </p>
                <p className="mt-1 text-sm text-sorbet-ink/60">
                  Feels like {feelsLike}ºC
                </p>

                <p className="mt-4 text-2xl font-semibold text-sorbet-ink">
                  {condition}
                </p>
                <p className="text-sm text-sorbet-ink/60 first-letter:uppercase">
                  {description}
                </p>

                <p className="mt-3 text-sm font-semibold text-sorbet-ink/70">
                  <span className="font-medium text-sorbet-ink/45">Low</span> {tempMin}ºC
                  <span className="ml-3 font-medium text-sorbet-ink/45">High</span> {tempMax}ºC
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

                <ul className="mt-7 flex gap-2">
                  {forecast.map(({ day, Icon, high }) => (
                    <li
                      key={day}
                      className="flex-1 rounded-2xl bg-white px-1 py-3 text-center"
                    >
                      <p className="text-xs font-medium text-sorbet-ink/55">{day}</p>
                      <Icon
                        size={18}
                        className="mx-auto my-1.5 text-sorbet-ink/70"
                        aria-hidden
                      />
                      <p className="text-sm font-semibold tabular-nums text-sorbet-ink">
                        {high}º
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-[1.75rem] bg-sorbet-lavender p-6 md:p-8">
              <p className="text-sm font-medium text-sorbet-ink/55">
                Because two of those days are wet
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-sorbet-ink">
                Pack these
              </h3>

              <ul className="mt-6 grid gap-2.5">
                {packing.map(({ label, Icon }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-3"
                  >
                    <span
                      aria-hidden
                      className="grid size-5 shrink-0 place-items-center rounded-full bg-sorbet-ink text-sorbet-offwhite"
                    >
                      <FaCheck size={10} />
                    </span>
                    <Icon size={18} className="shrink-0 text-sorbet-ink/60" aria-hidden />
                    <span className="text-base font-medium text-sorbet-ink">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default WeatherPacking;
