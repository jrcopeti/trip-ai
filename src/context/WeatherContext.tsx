"use client";

import { createContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchForecast, fetchWeather } from "@/app/api/openWeatherApi";
import { placeWeatherIcons, selectDailyForecasts } from "@/lib/utils";
import toast from "react-hot-toast";
import CustomToaster from "@/components/ui/CustomToaster";
import ErrorToaster from "@/components/ui/ErrorToaster";
import { CHOSEN_HOUR } from "@/lib/utils";
import type {
  FetchForecastParams,
  FetchWeatherParams,
  WeatherDataTypes,
  WeatherContextType,
  DailyForecastDataTypes,
  ForecastDataTypes,
} from "@/types";

export const defaultContextValue: WeatherContextType = {
  forecastData: undefined,
  generateForecast: async () => {},
  isPendingForecast: false,
  errorForecast: null,
  weatherData: undefined,
  generateWeather: async () => {},
  isPendingWeather: false,
  errorWeather: null,
  dailyForecastData: [],
  generateDailyForecast: async () => {},
  isPendingDailyForecast: false,
  errorDailyForecast: null,
};

const WeatherContext = createContext<WeatherContextType>(defaultContextValue);

function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [weatherData, setWeatherData] = useState<
    Partial<WeatherDataTypes> | undefined
  >(undefined);
  const [dailyForecastData, setDailyForecast] = useState<
    DailyForecastDataTypes[]
  >([]);

  const {
    mutate: generateForecast,
    data: forecastData,
    isPending: isPendingForecast,
    error: errorForecast,
  } = useMutation({
    mutationFn: ({ city, country }: FetchForecastParams) =>
      fetchForecast({ city, country }),

    onSuccess: (forecastData: ForecastDataTypes[]) => {
      console.log("success forecast:", forecastData);
      toast.custom(<CustomToaster message="Forecast generated" />);
    },
    onError: (error) => {
      console.log(error);
      toast.custom(
        <ErrorToaster message="There was an error generating the forecast" />,
      );
    },
  });

  const {
    mutate: generateWeather,
    data: initialWeatherData,
    isPending: isPendingWeather,
    error: errorWeather,
  } = useMutation({
    mutationFn: ({ city, country }: FetchWeatherParams) =>
      fetchWeather({ city, country }),

    onSuccess: (initialWeatherData: WeatherDataTypes) => {
      const condition = initialWeatherData?.weather[0]?.main;
      const iconCode = initialWeatherData?.weather[0]?.icon;
      const weatherIconSrc = placeWeatherIcons(condition, iconCode);
      setWeatherData({ ...initialWeatherData, weatherIconSrc });
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const {
    mutate: generateDailyForecast,
    data: initialDailyForecast,
    isPending: isPendingDailyForecast,
    error: errorDailyForecast,
  } = useMutation({
    mutationFn: ({ city, country }: FetchForecastParams) =>
      fetchForecast({ city, country }),

    onSuccess: (initialDailyForecast: DailyForecastDataTypes[]) => {
      console.log("success forecast:", initialDailyForecast);
      const selectedForecasts = selectDailyForecasts(
        initialDailyForecast,
        CHOSEN_HOUR,
      );
      console.log("selectedForecasts:", selectedForecasts);
      const forecastsWithIcons = selectedForecasts.map((forecast) => {
        const condition = forecast?.weather[0]?.main;
        const iconCode = forecast?.weather[0]?.icon;
        const dailyForecastIconSrc = placeWeatherIcons(condition, iconCode);
        return { ...forecast, dailyForecastIconSrc };
      });
      console.log("forecastsWithIcons", forecastsWithIcons);
      setDailyForecast(forecastsWithIcons);

      toast.custom(<CustomToaster message="Daily Forecast generated" />);
    },
    onError: (error) => {
      console.log(error);
      toast.custom(
        <ErrorToaster message="There was an error generating the forecast" />,
      );
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
        dailyForecastData,
        generateDailyForecast,
        isPendingDailyForecast,
        errorDailyForecast,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherProvider, WeatherContext };
