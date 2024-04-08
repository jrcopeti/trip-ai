"use client";

import { fetchForecast, fetchWeather } from "@/api/openWeatherApi";
import { useMutation } from "@tanstack/react-query";
import { createContext, useState } from "react";
import { placeWeatherIcons } from "@/lib/utils";
import { FetchForecastParams } from "@/types";
import { FetchWeatherParams } from "@/types";
import { WeatherDataTypes } from "@/types";

interface WeatherContextType {
  forecastData: WeatherDataTypes | undefined;
  generateForecast: ({
    city,
    country,
  }: {
    city: string;
    country: string;
  }) => void;
  isPendingForecast: boolean;
  errorForecast: unknown;
  weatherData: Partial<WeatherDataTypes> | undefined;
  generateWeather: ({
    city,
    country,
  }: {
    city: string;
    country: string;
  }) => void;

  isPendingWeather: boolean;
  errorWeather: unknown;
}

const defaultContextValue: WeatherContextType = {
  forecastData: undefined,
  generateForecast: async () => {},
  isPendingForecast: false,
  errorForecast: null,
  weatherData: undefined,
  generateWeather: async () => {},
  isPendingWeather: false,
  errorWeather: null,
};

const WeatherContext = createContext<WeatherContextType>(defaultContextValue);

function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData, setWeatherData] = useState<
    Partial<WeatherDataTypes> | undefined
  >(undefined);

  const {
    mutate: generateForecast,
    data: forecastData,
    isPending: isPendingForecast,
    error: errorForecast,
  } = useMutation({
    mutationKey: ["weather"],
    mutationFn: ({ city, country }: FetchForecastParams) =>
      fetchForecast({ city, country }),

    onSuccess: (forecastData) => {
      console.log(forecastData)
      console.log("success forecast ");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutate: generateWeather,
    data,
    isPending: isPendingWeather,
    error: errorWeather,
  } = useMutation({
    mutationKey: ["weather"],
    mutationFn: ({ city, country }: FetchWeatherParams) =>
      fetchWeather({ city, country }),

    onSuccess: (data: WeatherDataTypes) => {
      const condition = data?.weather[0]?.main;
      const iconCode = data?.weather[0]?.icon;
      const weatherIconSrc = placeWeatherIcons(condition, iconCode);
      setWeatherData({ ...data, weatherIconSrc });
    },
    onError: (error) => {
      console.log(error);
    },
  });

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
