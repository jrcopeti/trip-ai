import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useTripResponse } from "@/hooks/useTripResponse";
import { useFormData } from "@/hooks/useFormData";
import { useImage } from "@/hooks/useImage";
import defaultImage1 from "@/assets/travel-photos/1.jpg";
import Polaroid from "@/components/sorbet/Polaroid";
import { defaultPlaceholder } from "@/lib/constants";
import { durationInDays } from "@/lib/utils";
import { title as copy } from "./content";

/**
 * The opening section on both trip routes: the large polaroid, captioned with the
 * trip's title as the page's h1, beside what kind of trip it is and for how long,
 * then the destination, dates and traveller.
 *
 * Not wrapped in `Reveal`: it is above the fold, and the polaroid's photo is a
 * `priority` image that a fade from opacity 0 would waste.
 */
function TitleSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { tripData: response } = useTripResponse();
  const { formData } = useFormData();
  const { imageData } = useImage();

  const image = trip?.tripImages[0] || imageData?.tripImages[0];
  const placeholder = trip?.placeholder || imageData?.placeholder;
  const title = trip?.title || response?.title || "";
  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;
  const userName = trip?.userName || formData?.userName;
  const byWeather = trip ? trip.byWeather : formData?.byWeather;
  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);
  const start = startDate.format("DD.MM.YYYY");
  const end = endDate.format("DD.MM.YYYY");
  const kind = copy.kind(trip?.type || formData?.type, durationInDays(startDate, endDate));

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
            image={image ?? defaultImage1}
            placeholder={placeholder ?? defaultPlaceholder}
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
