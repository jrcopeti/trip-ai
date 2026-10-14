"use server";
import axios from "axios";
import {
  forecastListFixture,
  useE2EFixtures,
  weatherFixture,
} from "./e2eFixtures";
import { resolvePlace } from "./geoNamesApi";
import type {
  WeatherApiResponse,
  FetchForecastParams,
  FetchWeatherParams,
  DailyForecastDataTypes,
} from "@/types";

// The weather is for the place GeoNames confirmed on step 2, never OpenWeather's own guess at
// "city,country": its geocoder takes ISO codes, not names, and nothing checked its first hit.
async function coordinatesOf(city: string, countryCode: string) {
  const resolved = await resolvePlace(city, countryCode);
  if (!resolved.ok) throw new Error(`No place for ${city}, ${countryCode}: ${resolved.error}`);
  return { lat: resolved.place.lat, lon: resolved.place.lng };
}

export const fetchForecast = async ({
  city,
  countryCode,
}: FetchForecastParams): Promise<DailyForecastDataTypes[]> => {
  if (useE2EFixtures) return forecastListFixture;

  let forecast;

  try {
    const { lat, lon } = await coordinatesOf(city, countryCode);
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    const getForecast = await axios.get(forecastUrl);
    forecast = getForecast.data.list;
    return forecast;
  } catch (error: unknown) {
    console.error("error", error);
    throw new Error("Error fetching forecast data");
  }
};

export const fetchWeather = async ({
  city,
  countryCode,
}: FetchWeatherParams): Promise<WeatherApiResponse> => {
  if (useE2EFixtures) return weatherFixture;

  let weather;
  try {
    const { lat, lon } = await coordinatesOf(city, countryCode);
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    const getWeather = await axios.get(weatherUrl);
    weather = getWeather.data;
    return weather;
  } catch (error: unknown) {
    console.error(error);
    throw new Error("Error fetching weather data");
  }
};
