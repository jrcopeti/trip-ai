"use client";

import { fetchForecast, fetchWeather } from "@/api/openWeatherApi";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface WeatherContextType {
  forecastData: any;
  generateForecast: (city: string, country: string) => void;
  isPendingForecast: boolean;
  errorForecast: any;
  weatherData: any;
  generateWeather: (
    city: string | undefined,
    country: string | undefined,
  ) => void;
  isPendingWeather: boolean;
  errorWeather: any;
}

const defaultContextValue: WeatherContextType = {
  forecastData: null,
  generateForecast: () => {},
  isPendingForecast: false,
  errorForecast: null,
  weatherData: null,
  generateWeather: () => {},
  isPendingWeather: false,
  errorWeather: null,
};

const WeatherContext = createContext<WeatherContextType>(defaultContextValue);

function WeatherProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const {
    mutate: generateForecast,
    data: forecastData,
    isPending: isPendingForecast,
    error: errorForecast,
  } = useMutation({
    mutationKey: ["weather"],
    mutationFn: (city: string, country: string) => fetchForecast(city, country),

    onSuccess: () => {
      console.log("success forecast ");
      // router.push("/trip");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutate: generateWeather,
    data: weatherData,
    isPending: isPendingWeather,
    error: errorWeather,
  } = useMutation({
    mutationKey: ["weather"],
    mutationFn: (city: string | undefined, country: string | undefined) =>
      fetchWeather(city, country),

    onSuccess: () => {
      console.log("success weather ");
      // router.push("/trip");
    },
    onError: (error) => {
      console.log(error);
    },
  });
  console.log("weatherData", weatherData);

  return (
    <WeatherContext.Provider
      value={{
        forecastData,
        generateForecast,
        isPendingForecast,
        errorForecast,
        generateWeather,
        weatherData,
        isPendingWeather,
        errorWeather,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherProvider, WeatherContext };
