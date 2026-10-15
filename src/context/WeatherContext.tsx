"use client";

import { createContext, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forecastForForm } from "@/app/api/forecastAction";
import { selectDailyForecasts } from "@/lib/utils";
import toast from "react-hot-toast";
import CustomToaster from "@/components/ui/CustomToaster";
import ErrorToaster from "@/components/ui/ErrorToaster";
import { getChosenHour } from "@/lib/constants";
import type {
  Coordinates,
  WeatherContextType,
  ForecastDataTypes,
  SelectedForecastDataTypes,
} from "@/types";

const defaultContextValue: WeatherContextType = {
  forecastData: undefined,
  generateForecast: async () => {},
  isPendingForecast: false,
  errorForecast: null,
};

const WeatherContext = createContext<WeatherContextType>(defaultContextValue);

/** The form's forecast, for the prompt. The trip page fetches its own on the server. */
function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [forecastData, setForecastData] = useState<
    SelectedForecastDataTypes[] | undefined
  >(undefined);

  const {
    mutate: generateForecast,
    isPending: isPendingForecast,
    error: errorForecast,
  } = useMutation({
    mutationFn: (coordinates: Coordinates) => forecastForForm(coordinates),

    onSuccess: (initialForecastData: ForecastDataTypes[]) => {
      const selectedForecasts = selectDailyForecasts(
        initialForecastData,
        getChosenHour(),
      );
      const selectedProperties = selectedForecasts.map((forecast) => {
        const { dt_txt, main, weather } = forecast;
        const { temp } = main;
        const formattedTemp = `${Math.round(temp - 273.15)}°C`;
        const { main: condition, description } = weather[0];
        return { dt_txt, formattedTemp, condition, description };
      });
      setForecastData(selectedProperties);
      toast.custom(<CustomToaster message="Forecast was generated" />);
    },

    onError: (error) => {
      console.error(error);
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
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export { WeatherProvider, WeatherContext };
