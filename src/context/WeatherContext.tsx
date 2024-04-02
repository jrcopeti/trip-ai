"use client";

import { fetchWeather } from "@/api/openWeatherApi";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext } from "react";

interface WeatherContextType {
  weatherData: any;
  generateWeather: (city: string, country: string) => void;
  isPending: boolean;
  error: any;
}

const defaultContextValue: WeatherContextType = {
  weatherData: null,
  generateWeather: () => {},
  isPending: false,
  error: null,
};

const WeatherContext = createContext<WeatherContextType>(defaultContextValue);

function WeatherProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const {
    mutate: generateWeather,
    data: weatherData,
    isPending,
    error,
  } = useMutation({
    mutationKey: ["weather"],
    mutationFn: (city: string, country: string) => fetchWeather(city, country),

    onSuccess: (responseData) => {
      console.log("success ");
      // router.push("/trip");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <WeatherContext.Provider
      value={{ weatherData, generateWeather, isPending, error }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherProvider, WeatherContext };
