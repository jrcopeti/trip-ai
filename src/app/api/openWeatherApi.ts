"use server";
import axios from "axios";
import type {
  WeatherApiResponse,
  FetchForecastParams,
  FetchWeatherParams,
  DailyForecastDataTypes,
} from "@/types";

export const fetchForecast = async ({
  city,
  country,
}: FetchForecastParams): Promise<DailyForecastDataTypes[]> => {
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=${process.env.OPEN_WEATHER_KEY}`;
  let forecast;

  try {
    const getCoordinates = await axios.get(coordinatesUrl);
    const { lat, lon } = getCoordinates.data[0];
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
  country,
}: FetchWeatherParams): Promise<WeatherApiResponse> => {
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=${process.env.OPEN_WEATHER_KEY}`;
  let weather;
  try {
    const getCoordinates = await axios.get(coordinatesUrl);
    const { lat, lon } = getCoordinates.data[0];
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPEN_WEATHER_KEY}`;
    const getWeather = await axios.get(weatherUrl);
    weather = getWeather.data;
    return weather;
  } catch (error: unknown) {
    console.error(error);
    throw new Error("Error fetching weather data");
  }
};
