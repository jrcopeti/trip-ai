"use server";
import axios from "axios";

interface GetWeatherParams {
  city: string;
  country: string;
}

export const fetchForecast = async (city: string, country: string) => {
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

  let forecast;

  try {
    const getCoordinates = await axios.get(coordinatesUrl);

    const { lat, lon } = getCoordinates.data[0];

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

    const getForecast = await axios.get(forecastUrl);
    forecast = JSON.stringify(getForecast.data.list);

    return forecast;
  } catch (err: unknown) {
    console.log("error", err);
  }
};

export const fetchWeather = async (city: string, country: string) => {
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
  }
};
