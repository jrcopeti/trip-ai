import dayjs from "dayjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { weatherConditions } from "@/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(dateString?: string | Date, includeTime = true) {
  if (!dateString) return "";

  return dayjs(dateString).format(
    includeTime ? "DD MMM YYYY hh:mm A" : "DD MMM YYYY",
  );
}

export { cn, formatDate };
