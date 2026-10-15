"use server";
import { fetchForecast } from "./openWeatherApi";
import type { Coordinates, DailyForecastDataTypes } from "@/types";

// The form's forecast for the prompt: the one OpenWeather call the browser can make.
export async function forecastForForm(coordinates: Coordinates): Promise<DailyForecastDataTypes[]> {
  return fetchForecast(coordinates);
}
