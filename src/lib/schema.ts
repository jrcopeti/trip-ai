import { z } from "zod";

export const FormDataSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  nationality: z.string().min(1, "Nationality is required"),
  type: z.string().min(1, "Type of travel is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  luggageSize: z.string().min(1, "Lugagge size is required"),
  requiredItems: z.object({item: z.string()}).array().optional(),
  accommodation: z.string().min(1, "Accommodation is required"),
  budget: z.string().min(1, "Budget is required"),
  transport: z.string().min(1, "Transport is required"),
  interests: z.string().array().nonempty("At least one interest is required"),
  note: z.string().optional(),
  startDate: z.string().datetime().min(1, "Start date is required"),
  endDate: z.string().datetime().min(1, "End date is required"),
  weatherForecast: z.string().optional(),
  agreement: z.boolean().refine((val) => val === true, { message: "You must agree to the terms" }),
  tripUrl: z.string().optional(),
  flagUrl: z.string(),
});
