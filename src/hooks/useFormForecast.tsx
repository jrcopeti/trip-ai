"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forecastForForm } from "@/app/api/forecastAction";
import { selectDailyForecasts } from "@/lib/utils";
import toast from "react-hot-toast";
import CustomToaster from "@/components/ui/CustomToaster";
import ErrorToaster from "@/components/ui/ErrorToaster";
import { getChosenHour } from "@/lib/constants";
import type {
  Coordinates,
  ForecastDataTypes,
  SelectedForecastDataTypes,
} from "@/types";

/** The form's forecast, for the prompt. The trip page fetches its own on the server. */
function useFormForecast() {
  const [forecastData, setForecastData] = useState<
    SelectedForecastDataTypes[] | undefined
  >(undefined);

  const { mutate: generateForecast } = useMutation({
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

  return { forecastData, generateForecast };
}

export { useFormForecast };
