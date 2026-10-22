import type { Trip } from "@/generated/prisma/client";
import { fetchForecast, fetchWeather } from "@/app/api/openWeatherApi";
import { placeWeatherIcons, selectDailyForecasts } from "@/lib/utils";
import { getChosenHour } from "@/lib/constants";
import type { Coordinates, DailyForecastDataTypes, WeatherDataTypes } from "@/types";

async function loadCurrent(coordinates: Coordinates): Promise<WeatherDataTypes | null> {
  try {
    const weather = await fetchWeather(coordinates);
    const condition = weather.weather?.[0];
    return { ...weather, weatherIconSrc: placeWeatherIcons(condition?.main, condition?.icon) };
  } catch (error) {
    console.error("Trip page: no current weather", error);
    return null;
  }
}

async function loadForecast(coordinates: Coordinates): Promise<DailyForecastDataTypes[]> {
  try {
    const days = selectDailyForecasts(await fetchForecast(coordinates), getChosenHour());
    return days.map((day) => ({
      ...day,
      dailyForecastIconSrc: placeWeatherIcons(day.weather?.[0]?.main, day.weather?.[0]?.icon),
    }));
  } catch (error) {
    console.error("Trip page: no forecast", error);
    return [];
  }
}

/**
 * The trip page's weather, at the row's coordinates: no geocoding on a trip page. Started, not
 * awaited, so the page streams and each weather section waits in its own `<Suspense>`. Neither
 * promise rejects: a failure is `null` weather or no days, and the section says so.
 */
function loadWeather({ lat, lng }: Pick<Trip, "lat" | "lng">) {
  const coordinates = { lat, lon: lng };
  return { weather: loadCurrent(coordinates), forecast: loadForecast(coordinates) };
}

export default loadWeather;
