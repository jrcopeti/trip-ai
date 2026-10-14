import type { Trip } from "@prisma/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import defaultImage1 from "@/assets/travel-photos/1.jpg";
import Polaroid from "@/components/sorbet/Polaroid";
import { defaultPlaceholder } from "@/lib/constants";
import { durationInDays } from "@/lib/utils";
import { title as copy } from "./content";

// Row dates are calendar days at UTC midnight (`toTripRow`), so they're read in UTC.
dayjs.extend(utc);

/**
 * The opening section on both trip routes: the large polaroid, captioned with the
 * trip's title as the page's h1, beside what kind of trip it is and for how long,
 * then the destination, dates and traveller.
 *
 * Not wrapped in `Reveal`: it is above the fold, and the polaroid's photo is a
 * `priority` image that a fade from opacity 0 would waste.
 */
function TitleSection({ trip }: { trip: Trip }) {
  const { title, city, country, userName, byWeather } = trip;
  const startDate = dayjs.utc(trip.startDate);
  const endDate = dayjs.utc(trip.endDate);
  const start = startDate.format("DD.MM.YYYY");
  const end = endDate.format("DD.MM.YYYY");
  const kind = copy.kind(trip.type, durationInDays(startDate, endDate));

  // The real dates either way: a forecast trip's "next five days" were the five
  // days after it was generated, which on a saved trip are long gone.
  const facts = [
    { label: copy.destination, value: `${city}, ${country}`, name: true },
    {
      label: copy.dates,
      value: `${start} – ${end}`,
      note: byWeather ? copy.byWeather : undefined,
    },
    { label: copy.traveller, value: userName, name: true },
  ];

  return (
    <section className="bg-sorbet-canvas px-5 pb-20 pt-24 sm:px-8 md:pb-28 md:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
        <div className="flex justify-center md:justify-start">
          <Polaroid
            size="lg"
            image={trip.tripImages[0] ?? defaultImage1}
            placeholder={trip.placeholder ?? defaultPlaceholder}
            caption={title}
          />
        </div>

        <div>
          <p className="text-pretty text-sm font-medium uppercase tracking-[0.18em] text-sorbet-ink/50">
            {kind}
          </p>
          <dl className="mt-8 grid gap-6 border-t border-sorbet-ink/15 pt-8">
            {facts.map(({ label, value, name, note }) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
                  {label}
                </dt>
                <dd
                  className={`mt-1 text-2xl font-semibold text-sorbet-ink ${name ? "capitalize" : ""}`}
                >
                  {value}
                  {note && (
                    <span className="mt-1 block text-sm font-medium text-sorbet-ink/60">
                      {note}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default TitleSection;
