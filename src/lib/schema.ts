import dayjs from "dayjs";
import { z } from "zod";

/** Caps the form shows and the server's request schema (grounded-agent 1c) enforces again. */
export const LIMITS = {
  note: 500,
  requiredItems: 10,
  requiredItem: 60,
  interests: 3,
} as const;

/** The fields alone, so the request schema can derive from them; the form uses `FormDataSchema`. */
export const FormFieldsSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  travellers: z.string().min(1, "Who's going is required"),
  ageRanges: z.string().array().nonempty("Pick at least one age range"),
  passport: z.string().optional(),
  type: z.string().min(1, "Type of travel is required"),
  pace: z.string().min(1, "Pace is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  luggageSize: z.string().min(1, "Lugagge size is required"),
  requiredItems: z
    .object({
      item: z
        .string()
        .max(LIMITS.requiredItem, `Keep each item under ${LIMITS.requiredItem} characters`),
    })
    .array()
    .max(LIMITS.requiredItems, `Up to ${LIMITS.requiredItems} items`)
    .optional(),
  accommodation: z.string().min(1, "Accommodation is required"),
  budget: z.string().min(1, "Budget is required"),
  transport: z.string().min(1, "Transport is required"),
  interests: z
    .string()
    .array()
    .nonempty("At least one interest is required")
    .max(LIMITS.interests, `Up to ${LIMITS.interests} interests`),
  note: z.string().max(LIMITS.note, `Keep notes under ${LIMITS.note} characters`).optional(),
  startDate: z
    .string()
    .datetime()
    .min(1, "Start date is required")
    .refine((val) => dayjs(val).isAfter(dayjs().subtract(1, "day")), {
      message: "Start date cannot be in the past",
    }),
  endDate: z.string().datetime().min(1, "End date is required"),

  weatherForecast: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms to continue",
  }),
  flagUrl: z.string(),
});

export const FormDataSchema = FormFieldsSchema.refine(
  (data) => !dayjs(data.endDate).isBefore(dayjs(data.startDate)),
  {
    message: "End date must be after start date",
    path: ["endDate"],
  },
);
