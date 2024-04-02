"use server";
import axios from "axios";

interface GetWeatherParams {
  city: string;
  country: string;
}

export async function fetchWeather(city: string, country: string) {
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=3&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

  let weather;
  try {
    const getCoordinates = await axios.get(coordinatesUrl);

    const { lat, lon } = getCoordinates.data[0];

    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

    const getWeather = await axios.get(weatherUrl);
    weather = JSON.stringify(getWeather.data.list);
    console.log("weather", weather);
    console.log("getWeather CITY", getWeather.data.city.name);
    console.log("getWeather COUNTRY", getWeather.data.city.country);

    return weather;
  } catch (err: unknown) {
    console.log("error", err);
  }
}
