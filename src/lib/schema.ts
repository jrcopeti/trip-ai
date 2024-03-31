import { z } from "zod";

export const FormDataSchema = z.object({
  userName: z.string().min(1, "Name is required"),
  age: z.number().min(16, "You must be at least 16 years old"),
  nationality: z.string().min(1, "Nationality is required"),
  type: z.string().min(1, "Type of travel is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  lugaggeSize: z.string().min(1, "Lugagge size is required"),
  accommodation: z.string().min(1, "Accommodation is required"),
  interests: z.string().array().nonempty("At least one interest is required"),
});
