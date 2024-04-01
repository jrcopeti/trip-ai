import { z } from "zod";

export const FormDataSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  age: z.string().min(1, "Age is required"),
  // nationality: z.string().min(1, "Nationality is required"),
  type: z.string().min(1, "Type of travel is required"),
  city: z.string().min(1, "City is required"),
  // country: z.string().min(1, "Country is required"),
  luggageSize: z.string().min(1, "Lugagge size is required"),
  // requiredItems: z.string().array(),
  accommodation: z.string().min(1, "Accommodation is required"),
  interests: z.string().array().nonempty("At least one interest is required"),
  // note: z.string(),
  startDate: z.string().datetime().min(1, "Start date is required"),
  endDate: z.string().datetime().min(1, "End date is required"),
});
