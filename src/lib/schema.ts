import dayjs from "dayjs";
import { z } from "zod";

/** Caps the form shows and the server's request schema (grounded-agent 1c) enforces again. */
export const LIMITS = {
  note: 500,
  requiredItems: 10,
  requiredItem: 60,
  interests: 3,
} as const;

type AgeRangeRule = { max?: number; tooMany?: string; minAge: number; tooYoung: string };

/** Which age ranges, and how many, each group picks; Family has no rule. */
export const AGE_RANGE_RULES: Partial<Record<string, AgeRangeRule>> = {
  solo: {
    max: 1,
    tooMany: "A solo trip has one age range",
    minAge: 13,
    tooYoung: "A solo trip starts at 13",
  },
  couple: {
    max: 2,
    tooMany: "A couple has up to two age ranges",
    minAge: 18,
    tooYoung: "A couple starts at 18",
  },
  friends: { minAge: 13, tooYoung: "Friends' trips start at 13" },
  colleagues: { minAge: 18, tooYoung: "Colleagues start at 18" },
};

/** A range's lower bound is its leading number: "13-17" → 13, "70+" → 70. */
export function fitsGroup(range: string, group: string) {
  return parseInt(range, 10) >= (AGE_RANGE_RULES[group]?.minAge ?? 0);
}

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
).superRefine((data, ctx) => {
  const rule = AGE_RANGE_RULES[data.travellers];
  if (!rule) return;
  const issue = (message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: ["ageRanges"] });
  if (rule.max !== undefined && rule.tooMany && data.ageRanges.length > rule.max) {
    issue(rule.tooMany);
  }
  if (data.ageRanges.some((range) => !fitsGroup(range, data.travellers))) issue(rule.tooYoung);
});
