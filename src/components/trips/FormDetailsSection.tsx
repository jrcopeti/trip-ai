import Image from "next/image";
import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import dayjs from "dayjs";
import defaultImage4 from "@/assets/travel-photos/4.jpg";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { displayDuration, durationInDays } from "@/lib/utils";
import { MediaFrame, Section, SectionHeading } from "./Section";
import { details as copy } from "./content";

/** What the traveller entered, as the `<dl>` it is. Restyled, not restructured. */
function FormDetailsSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { imageData } = useImage();
  const { formData } = useFormData();

  const flag = trip?.flagUrl || formData?.flagUrl;
  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;
  const weatherForecast = trip?.weatherForecast || formData?.weatherForecast;
  const note = trip?.note || formData?.note;
  const interests = (trip?.interests || formData?.interests || []).filter(
    (interest) => interest.trim() !== "",
  );

  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);
  const duration = displayDuration(durationInDays(startDate, endDate));

  const image4 = trip?.image4 || imageData?.tripImage4;
  const placeholder = trip?.placeholder || imageData?.placeholder;

  const { labels } = copy;
  const rows = [
    { label: labels.destination, value: `${city}, ${country}` },
    { label: labels.nationality, value: trip?.nationality || formData?.nationality },
    { label: labels.name, value: trip?.userName || formData?.userName },
    { label: labels.type, value: trip?.type || formData?.type },
    { label: labels.age, value: trip?.age || formData?.age },
    { label: labels.budget, value: trip?.budget || formData?.budget },
    { label: labels.transport, value: trip?.transport || formData?.transport },
    { label: labels.luggage, value: trip?.luggageSize || formData?.luggageSize },
    // A sentence, not a name: the one value the dd's `capitalize` must skip.
    { label: labels.duration, value: weatherForecast ? copy.byWeather : duration, sentence: true },
    { label: labels.accommodation, value: trip?.accommodation || formData?.accommodation },
  ];

  return (
    <Section ground="bg-sorbet-canvas">
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />

          <Reveal delay={0.06}>
            {flag && (
              <Image
                src={flag}
                alt={copy.flag(country ?? "")}
                width={80}
                height={56}
                className="mt-10 h-10 w-auto rounded-md object-cover"
              />
            )}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-sorbet-ink/15 pt-8 sm:grid-cols-3">
              {rows.map(({ label, value, sentence }) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
                    {label}
                  </dt>
                  <dd
                    className={`mt-1 text-lg font-semibold text-sorbet-ink ${sentence ? "first-letter:uppercase" : "capitalize"}`}
                  >
                    {value}
                  </dd>
                </div>
              ))}

              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
                  {labels.interests}
                </dt>
                <dd className="mt-2">
                  {interests.length > 0 ? (
                    <ul className="flex flex-wrap gap-2">
                      {interests.map((interest) => (
                        <li
                          key={interest}
                          className="rounded-full bg-white px-3 py-1.5 text-sm font-medium capitalize text-sorbet-ink"
                        >
                          {interest}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-lg font-semibold text-sorbet-ink">{copy.none}</span>
                  )}
                </dd>
              </div>

              <div className="col-span-2 sm:col-span-3">
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
                  {labels.note}
                </dt>
                <dd className="mt-1 text-lg leading-relaxed text-sorbet-ink/75 first-letter:uppercase">
                  {note || copy.none}
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <MediaFrame>
            <Image
              src={image4 ?? defaultImage4}
              alt=""
              fill
              placeholder="blur"
              blurDataURL={placeholder ?? defaultPlaceholder}
              sizes="(min-width: 1024px) 400px, 100vw"
              className="object-cover"
            />
          </MediaFrame>
        </Reveal>
      </div>
    </Section>
  );
}

export default FormDetailsSection;
