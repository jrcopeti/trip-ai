"use server";
import axios from "axios";
import { WeatherDataTypes, WeatherApiResponse } from "@/types";

export interface FetchForecastParams {
  city: string;
  country: string;
}

export interface FetchWeatherParams {
  city: string;
  country: string;
}

export const fetchForecast = async ({
  city,
  country,
}: FetchForecastParams): Promise<WeatherDataTypes | undefined> => {
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

  let forecast;

  try {
    const getCoordinates = await axios.get(coordinatesUrl);

    const { lat, lon } = getCoordinates.data[0];

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

    const getForecast = await axios.get(forecastUrl);
    forecast = getForecast.data.list;

    return forecast;
  } catch (err: unknown) {
    console.log("error", err);
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
    console.log("getWeather", getWeather.data);
    weather = getWeather.data;

    return weather;
  } catch (err: unknown) {
    console.log("error", err);
    throw new Error("Failed to fetch weather data");
  }
};
