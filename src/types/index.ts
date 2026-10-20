import z from "zod";
import { FormDataSchema } from "@/lib/schema";
import { Control, FieldErrors, SubmitHandler } from "react-hook-form";
import { Trip } from "@prisma/client";
import type { Place } from "@/lib/place";

export type Inputs = z.infer<typeof FormDataSchema>;
export type FieldName = keyof Inputs;
export type TripResponse = { trip: Trip | null } | Trip;
export type ObjectsListType = {
  quantity: number;
  item: string;
  description: string;
};
export interface WeatherApiResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };

  weather: [
    {
      main: string;
      icon: string;
      description: string;
    },
  ];
  sys: {
    sunrise: number;
    sunset: number;
  };
  wind: {
    speed: number;
  };
  timezone: number;
}

export interface WeatherDataTypes extends WeatherApiResponse {
  weatherIconSrc?: string;
}
export interface DailyForecastDataTypes extends WeatherApiResponse {
  dt: number;
  dt_txt: string;
  dailyForecastIconSrc?: string;
}

/** A place GeoNames resolved, in OpenWeather's names (the row stores `lng`). */
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface FormStepsContextType {
  currentStep: number;
  delta: number;
  stepValue: number;
  next: () => void;
  prev: () => void;
  /** Empties the form, back to step 1, and drops the draft. */
  startOver: () => void;
  /** False until the draft, if any, is back in the form; `Form` hides the card till then. */
  isDraftRestored: boolean;
}
export interface FormFieldsContextType {
  control: Control<Inputs> | undefined;
  errors: FieldErrors<Inputs>;
  isValid: boolean;
  handleSelectionAutocomplete: (
    selectedKey: string | number | null,
    fieldName: FieldName,
  ) => void;
  handleSubmit: (fn: SubmitHandler<Inputs>) => (e: React.FormEvent) => void;
  processForm: SubmitHandler<Inputs>;
  fields: { id: string }[];
  append: (data: { item: string }) => void;
  insert: (index: number, data: { item: string }) => void;
  remove: (index: number) => void;
  setValue: (name: FieldName, value: string) => void;
  isWeatherSelected: boolean;
  setIsWeatherSelected: (value: boolean) => void;
}
export interface CityCheckContextType {
  countryCode?: string;
  cityCheck: CityCheck;
}
export type FormContextType = FormStepsContextType &
  FormFieldsContextType &
  CityCheckContextType;
export interface ImageDataTypes {
  /** In the order the trip page shows them; `placeholder` is the blur of the first. */
  tripImages: string[];
  placeholder: string | null;
}

export interface Step {
  id: string;
  title: string;
  subtitle: string;
  stepValue: number;
  fields: string[];
}

export interface Country {
  value: string;
  label: string;
  code: string;
  flagUrl: string;
}

/** The button either links somewhere (`path`) or acts in place (`onAction`). */
export type NotFoundComponentProps = { message: string; button: string } & (
  | { path: string; onAction?: never }
  | { onAction: () => void; path?: never }
);
export interface useGeoNamesProps {
  city: string;
  countryCode?: string;
}
export interface CityCheck {
  isLoadingCityValid: boolean;
  isCityValid: boolean;
  message: string;
  place: Place | null;
}
export interface ToggleActions {
  setVisible: (visible: boolean) => void;
  onHidden: () => void;
}

