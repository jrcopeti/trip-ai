// Not a server action: the trip page and `generateTrip` call these on the server, so neither
// has a public endpoint.
import { z } from "zod";
import {
  forecastFixtureFromNow,
  useE2EFixtures,
  weatherFixture,
} from "./e2eFixtures";
import type {
  Coordinates,
  WeatherApiResponse,
  DailyForecastDataTypes,
} from "@/types";

// Always a place GeoNames resolved (the row's, or `generateTrip`'s), never OpenWeather's own
// geocoding. Checked here because they go into the URL.
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
  if (useE2EFixtures) return forecastFixtureFromNow();

  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    // The offset comes once, on `city`; each reading gets it, so its day is named where it is.
    const { list, city } = await getJson(forecastUrl);
    return list.map((reading: DailyForecastDataTypes) => ({ ...reading, timezone: city.timezone }));
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
