import { useContext } from "react";
import { WeatherContext } from "@/context/WeatherContext";

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  return context;
}
