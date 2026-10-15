import { useWatch } from "react-hook-form";
import { useFormFields } from "@/hooks/useFormData";
import { durationInDays, displayDuration } from "@/lib/utils";
import {
  ageRanges as ageRangeOptions,
  interests as interestOptions,
  optionLabel,
  paces,
  travellers as travellerOptions,
  types,
} from "@/data";
import { review } from "./content";
import type { Inputs } from "@/types";

/**
 * Everything entered, as a definition list. Chosen options show their labels,
 * as the chips did; typed values show as written.
 */
function ReviewForm() {
  const { control, isWeatherSelected: weather } = useFormFields();
  // Subscribed here, on the last step only: the provider no longer re-renders on every value.
  const reviewFormData = useWatch({ control }) as Inputs;

  const {
    userName,
    city,
    country,
    travellers,
    ageRanges,
    passport,
    type,
    pace,
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
    { label: labels.travellers, value: optionLabel(travellerOptions, travellers), asWritten: true },
    {
      label: labels.ageRanges,
      value: ageRanges.map((range) => optionLabel(ageRangeOptions, range)).join(", "),
      asWritten: true,
    },
    { label: labels.passport, value: passport || none, asWritten: true },
    { label: labels.destination, value: `${city}, ${country}` },
    { label: labels.type, value: optionLabel(types, type), asWritten: true },
    { label: labels.pace, value: optionLabel(paces, pace), asWritten: true },
    { label: labels.luggageSize, value: luggageSize },
    { label: labels.budget, value: budget },
    { label: labels.transport, value: transport },
    { label: labels.accommodation, value: accommodation },
    { label: labels.duration, value: weather ? review.weatherDuration : duration, asWritten: true },
    {
      label: labels.interests,
      value: interests.length
        ? interests.map((interest) => optionLabel(interestOptions, interest)).join(", ")
        : none,
      asWritten: true,
    },
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
