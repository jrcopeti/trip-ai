import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import type { DailyForecastDataTypes } from "@/types";
dayjs.extend(utc);

/** One day of the forecast, as the prompt shows it. */
export interface ForecastDay {
  date: string;
  temp: string;
  condition: string;
  description: string;
}

const MIDDAY = 12;

/**
 * Reduces OpenWeather's three-hourly list to one reading per trip day, the one closest to 12:00
 * at the destination. Dates and hours are the destination's, never the server's or the browser's.
 */
export function tripForecast(
  readings: DailyForecastDataTypes[],
  startDate: string,
  endDate: string,
): ForecastDay[] {
  const nearest = new Map<string, { reading: DailyForecastDataTypes; distance: number }>();
  for (const reading of readings) {
    // UTC shifted by the offset reads as the destination's clock; without `.utc()` dayjs
    // would use the server's zone.
    const local = dayjs.unix(reading.dt).utc().add(reading.timezone ?? 0, "s");
    const date = local.format("YYYY-MM-DD");
    // YYYY-MM-DD strings compare in date order; both ends are trip days.
    if (date < startDate || date > endDate) continue;
    const distance = Math.abs(local.hour() - MIDDAY);
    const best = nearest.get(date);
    if (!best || distance < best.distance) nearest.set(date, { reading, distance });
  }

  return [...nearest.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { reading }]) => ({
      date,
      temp: `${Math.round(reading.main.temp - 273.15)}°C`,
      condition: reading.weather[0]?.main ?? "",
      description: reading.weather[0]?.description ?? "",
    }));
}
