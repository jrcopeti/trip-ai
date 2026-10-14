import Image from "next/image";
import { useParams } from "next/navigation";
import { useSingleSavedTrip } from "@/hooks/useSingleSavedTrip";
import { useImage } from "@/hooks/useImage";
import { useFormData } from "@/hooks/useFormData";
import dayjs from "dayjs";
import defaultImage4 from "@/assets/travel-photos/4.jpg";
import Reveal from "@/components/sorbet/Reveal";
import { defaultPlaceholder } from "@/lib/constants";
import { flagUrl } from "@/lib/place";
import { displayDuration, durationInDays } from "@/lib/utils";
import {
  ageRanges as ageRangeOptions,
  interests as interestOptions,
  optionLabel,
  paces,
  travellers as travellerOptions,
  types,
} from "@/data";
import { MediaFrame, Section, SectionHeading } from "./Section";
import { details as copy } from "./content";

/** What the traveller entered, as the `<dl>` it is. Known options show their label. */
function FormDetailsSection() {
  const params = useParams();
  const { trip } = useSingleSavedTrip({ params });
  const { imageData } = useImage();
  const { formData } = useFormData();

  const countryCode = trip?.countryCode || formData?.countryCode;
  const city = trip?.city || formData?.city;
  const country = trip?.country || formData?.country;
  const byWeather = trip ? trip.byWeather : formData?.byWeather;
  const note = trip?.note || formData?.note;
  const interests = (trip?.interests || formData?.interests || []).filter(
    (interest) => interest.trim() !== "",
  );

  const startDate = dayjs(trip?.startDate || formData?.startDate);
  const endDate = dayjs(trip?.endDate || formData?.endDate);
  const duration = displayDuration(durationInDays(startDate, endDate));

  const image4 = trip?.tripImages[3] || imageData?.tripImages[3];
  const placeholder = trip?.placeholder || imageData?.placeholder;

  const travellers = trip?.travellers || formData?.travellers;
  const ageRanges = trip?.ageRanges?.length ? trip.ageRanges : (formData?.ageRanges ?? []);
  const pace = trip?.pace || formData?.pace;
  const passport = trip?.passport || formData?.passport;
  const type = trip?.type || formData?.type;

  const { labels } = copy;
  type Row = { label: string; value: string | null | undefined; sentence?: boolean; asLabel?: boolean };
  const rows: Row[] = [
    { label: labels.destination, value: `${city}, ${country}` },
    { label: labels.passport, value: passport },
    { label: labels.name, value: trip?.userName || formData?.userName },
    { label: labels.travellers, value: optionLabel(travellerOptions, travellers), asLabel: true },
    {
      label: labels.ageRanges,
      value: ageRanges.map((range) => optionLabel(ageRangeOptions, range) ?? range).join(", "),
      asLabel: true,
    },
    {
      label: labels.type,
      value: optionLabel(types, type) ?? type,
      asLabel: optionLabel(types, type) !== undefined,
    },
    { label: labels.pace, value: optionLabel(paces, pace), asLabel: true },
    { label: labels.budget, value: trip?.budget || formData?.budget },
    { label: labels.transport, value: trip?.transport || formData?.transport },
    { label: labels.luggage, value: trip?.luggageSize || formData?.luggageSize },
    // A sentence, not a name: the one value the dd's `capitalize` must skip.
    { label: labels.duration, value: byWeather ? copy.byWeather : duration, sentence: true },
    { label: labels.accommodation, value: trip?.accommodation || formData?.accommodation },
  ];

  return (
    <Section ground="bg-sorbet-canvas">
      <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} heading={copy.heading} />

          <Reveal delay={0.06}>
            {countryCode && (
              <Image
                src={flagUrl(countryCode)}
                alt={copy.flag(country ?? "")}
                width={80}
                height={56}
                className="mt-10 h-10 w-auto rounded-md object-cover"
              />
            )}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-sorbet-ink/15 pt-8 sm:grid-cols-3">
              {rows.filter((row) => row.value).map(({ label, value, sentence, asLabel }) => (
                <div key={label}>
                  <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
                    {label}
                  </dt>
                  <dd
                    className={`mt-1 text-lg font-semibold text-sorbet-ink ${sentence ? "first-letter:uppercase" : asLabel ? "" : "capitalize"}`}
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
                      {interests.map((interest) => {
                        const label = optionLabel(interestOptions, interest);
                        return (
                          <li
                            key={interest}
                            className={`rounded-full bg-white px-3 py-1.5 text-sm font-medium text-sorbet-ink ${label ? "" : "capitalize"}`}
                          >
                            {label ?? interest}
                          </li>
                        );
                      })}
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
