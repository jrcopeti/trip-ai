"use server";
import { z } from "zod";
import {
  forecastListFixture,
  useE2EFixtures,
  weatherFixture,
} from "./e2eFixtures";
import type {
  Coordinates,
  WeatherApiResponse,
  DailyForecastDataTypes,
} from "@/types";

// Always a place GeoNames resolved (the row's, or the form's city check), never OpenWeather's
// own geocoding. Checked here too: an action is a public endpoint, and these go into the URL.
const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

// Readings change about every ten minutes, so a trip page reloaded within that reuses them.
const REVALIDATE_SECONDS = 600;

// `fetch` resolves on a 4xx/5xx, so a bad key or quota error has to be thrown here.
async function getJson(url: string) {
  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) throw new Error(`OpenWeather: ${response.status}`);
  return response.json();
}

export const fetchForecast = async (
  coordinates: Coordinates,
): Promise<DailyForecastDataTypes[]> => {
  const { lat, lon } = CoordinatesSchema.parse(coordinates);
  if (useE2EFixtures) return forecastListFixture;

  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    return (await getJson(forecastUrl)).list;
  } catch (error: unknown) {
    console.error("error", error);
    throw new Error("Error fetching forecast data");
  }
};

export const fetchWeather = async (
  coordinates: Coordinates,
): Promise<WeatherApiResponse> => {
  const { lat, lon } = CoordinatesSchema.parse(coordinates);
  if (useE2EFixtures) return weatherFixture;

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    return await getJson(weatherUrl);
  } catch (error: unknown) {
    console.error(error);
    throw new Error("Error fetching weather data");
  }
};
