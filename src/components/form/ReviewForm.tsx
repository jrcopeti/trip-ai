import { useFormData } from "@/hooks/useFormData";
import { durationInDays, displayDuration } from "@/lib/utils";
import { review } from "./content";

/**
 * Everything entered, as a definition list: the same thirteen entries in the
 * same order as before, restyled rather than restructured.
 */
function ReviewForm() {
  const { reviewFormData, isWeatherSelected: weather } = useFormData();

  const {
    userName,
    city,
    country,
    nationality,
    type,
    age,
    budget,
    luggageSize,
    transport,
    requiredItems,
    accommodation,
    interests,
    note,
    startDate,
    endDate,
  } = reviewFormData;

  const duration = displayDuration(durationInDays(startDate, endDate));
  const requiredItemList = (
    requiredItems?.map((requiredItem: { item: string }) => requiredItem.item) ?? []
  ).filter((item) => item !== "");
  const { labels, none } = review;

  const entries: { label: string; value: React.ReactNode; asWritten?: boolean }[] = [
    { label: labels.name, value: userName },
    { label: labels.age, value: age },
    { label: labels.nationality, value: nationality },
    { label: labels.destination, value: `${city}, ${country}` },
    { label: labels.type, value: type },
    { label: labels.luggageSize, value: luggageSize },
    { label: labels.budget, value: budget },
    { label: labels.transport, value: transport },
    { label: labels.accommodation, value: accommodation },
    { label: labels.duration, value: weather ? review.weatherDuration : duration, asWritten: true },
    { label: labels.interests, value: interests.length ? interests.join(", ") : none },
    {
      label: labels.requiredItems,
      value: requiredItemList.length ? requiredItemList.join(", ") : none,
    },
    // Sentences and free text: shown as written, not title-cased like the option values.
    { label: labels.notes, value: note || none, asWritten: true },
  ];

  return (
    <dl className="grid gap-x-8 gap-y-6 rounded-3xl bg-sorbet-canvas p-6 sm:grid-cols-2 sm:p-8">
      {entries.map(({ label, value, asWritten }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-sorbet-ink/45">
            {label}
          </dt>
          <dd
            className={`mt-1 break-words text-lg font-medium text-sorbet-ink ${asWritten ? "" : "capitalize"}`}
          >
            {value || none}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default ReviewForm;
