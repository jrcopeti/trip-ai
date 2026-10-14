import dayjs from "dayjs";
import { z } from "zod";
import {
  sortedAccommodations as accommodations,
  ageRanges,
  budgets,
  interests,
  luggageSizes,
  paces,
  sortedTransports as transports,
  travellers,
  types,
} from "@/data";
import { FormFieldsSchema, LIMITS, checkAgeRanges, checkEndDate } from "@/lib/schema";
import type { Inputs, SelectedForecastDataTypes } from "@/types";

type Options = readonly { value: string; label: string }[];

/** A choice field must be one the form offers: the prompt is built from it on the server. */
const oneOf = (options: Options) =>
  z.string().refine((value) => options.some((option) => option.value === value), {
    message: "Not one of the options",
  });

const text = (max: number) => z.string().trim().min(1).max(max);

// These sit in the prompt's trusted facts, so they can't add a line or open a tag there.
const SINGLE_LINE = /^[^\r\n<>]*$/;
const line = (max: number) => text(max).regex(SINGLE_LINE, "Keep it to one line");

// The round trip rejects days that don't exist: dayjs rolls "2030-02-31" over to 3 March.
const calendarDay = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
  .refine((day) => dayjs(day).format("YYYY-MM-DD") === day, { message: "Not a real date" });

export const ForecastDaySchema = z.object({
  date: calendarDay,
  temp: line(10),
  condition: line(40),
  description: line(80),
});

/** What the browser sends `generateTrip`: the form minus `agreement`, checked again. */
export const TripRequestSchema = FormFieldsSchema.omit({ agreement: true })
  .extend({
    userName: line(LIMITS.name),
    travellers: oneOf(travellers),
    ageRanges: oneOf(ageRanges).array().nonempty(),
    passport: z.string().trim().max(100).regex(SINGLE_LINE, "Keep it to one line").optional(),
    type: oneOf(types),
    pace: oneOf(paces),
    city: line(LIMITS.city),
    country: line(100),
    // `resolvePlace`'s format: ISO 3166-1, or a UK nation's subdivision ("GB-SCT").
    countryCode: z.string().regex(/^[A-Z]{2}(-[A-Z]{3})?$/),
    luggageSize: oneOf(luggageSizes),
    accommodation: oneOf(accommodations),
    budget: oneOf(budgets),
    transport: oneOf(transports),
    interests: oneOf(interests).array().nonempty().max(LIMITS.interests),
    requiredItems: text(LIMITS.requiredItem).array().max(LIMITS.requiredItems),
    note: z.string().trim().max(LIMITS.note).optional(),
    // A day of slack: the browser's today can be the server's yesterday.
    startDate: calendarDay.refine(
      (day) => !dayjs(day).isBefore(dayjs().startOf("day").subtract(1, "day")),
      { message: "Start date cannot be in the past" },
    ),
    endDate: calendarDay,
    forecast: ForecastDaySchema.array().max(7).optional(),
  })
  .superRefine(checkEndDate)
  .superRefine(checkAgeRanges);

export type TripRequest = z.infer<typeof TripRequestSchema>;
export type ForecastDay = z.infer<typeof ForecastDaySchema>;

/** Built in the browser, where the dates are still in the traveller's own timezone. */
export function toTripRequest(
  inputs: Inputs,
  countryCode: string,
  forecast?: SelectedForecastDataTypes[],
): TripRequest {
  const { agreement, requiredItems, note, passport, ...fields } = inputs;
  const items = (requiredItems ?? []).map(({ item }) => item.trim()).filter(Boolean);
  return {
    ...fields,
    userName: inputs.userName.trim(),
    city: inputs.city.trim(),
    countryCode,
    requiredItems: items,
    note: note?.trim() || undefined,
    passport: passport?.trim() || undefined,
    startDate: dayjs(inputs.startDate).format("YYYY-MM-DD"),
    endDate: dayjs(inputs.endDate).format("YYYY-MM-DD"),
    forecast: forecast?.map((day) => ({
      // OpenWeather's `dt_txt` is "YYYY-MM-DD HH:mm:ss".
      date: day.dt_txt.slice(0, 10),
      temp: day.formattedTemp,
      condition: day.condition,
      description: day.description,
    })),
  };
}
