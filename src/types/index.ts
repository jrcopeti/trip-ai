import z from "zod";
import { FormDataSchema } from "@/lib/schema";
import { Control, FieldErrors, SubmitHandler } from "react-hook-form";
import { Trip } from "@prisma/client";
import type { TripRequest } from "@/lib/agent/request";
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

export interface ForecastDataTypes extends WeatherApiResponse {
  dt: number;
  dt_txt: string;
}

export interface SelectedForecastDataTypes {
  dt_txt: string;
  temp?: number;
  formattedTemp: string;
  condition: string;
  description: string;
}

/** A place GeoNames resolved, in OpenWeather's names (the row stores `lng`). */
export interface Coordinates {
  lat: number;
  lon: number;
}

export interface FetchResponseAIParams {
  prompt: string;
  city: string;
  country?: string;
}

export interface WeatherContextType {
  forecastData?: SelectedForecastDataTypes[];
  generateForecast: (coordinates: Coordinates) => void;
  isPendingForecast: boolean;
  errorForecast: unknown;
}

export interface FormContextType {
  formData: FinalDataTypes;
  setFormData: (data: FinalDataTypes) => void;
  currentStep: number;
  delta: number;
  control: Control<Inputs> | undefined;
  errors: FieldErrors<Inputs>;
  handleSelectionAutocomplete: (
    selectedKey: string | number | null,
    fieldName: FieldName,
  ) => void;
  handleSubmit: (fn: SubmitHandler<Inputs>) => (e: React.FormEvent) => void;
  processForm: SubmitHandler<Inputs>;
  stepValue: number;
  cityWatch: string;
  countryCode?: string;
  cityCheck: CityCheck;
  fields: { id: string }[];
  append: (data: { item: string }) => void;
  insert: (index: number, data: { item: string }) => void;
  remove: (index: number) => void;
  setValue: (name: FieldName, value: string) => void;
  isWeatherSelected: boolean;
  setIsWeatherSelected: (value: boolean) => void;
  isValid: boolean;
  reviewFormData: Inputs;
  next: () => void;
  prev: () => void;
}
export interface FinalDataTypes extends Omit<Inputs, "requiredItems"> {
  requiredItems: string[];
  // Kept from the submit: the form resets once the traveller leaves /form, before the save.
  byWeather: boolean;
  countryCode: string;
  lat: number | null;
  lng: number | null;
}

export interface TripContextType {
  generateResponseAI: (request: TripRequest) => void;
  isPendingResponseAI: boolean;
  errorResponseAI: unknown;
  resetResponseAI: () => void;
}

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

