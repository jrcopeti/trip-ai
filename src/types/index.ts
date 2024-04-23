import z from "zod";
import { FormDataSchema } from "@/lib/schema";
import { Control, FieldErrors } from "react-hook-form";
import { Trip } from "@prisma/client";

export type Inputs = z.infer<typeof FormDataSchema>;
export type FieldName = keyof Inputs;
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

export interface FetchForecastParams {
  city: string;
  country: string;
}

export interface FetchWeatherParams {
  city: string;
  country: string;
}

export interface WeatherContextType {
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

export interface FinalDataTypes extends Omit<Inputs, "requiredItems"> {
  requiredItems: string[];
  weatherForecast: string;
}

export interface ProcessFormType {
  (data: Inputs): void;
}

export interface ImageDataTypes {
  tripImage: string | null;
  tripImage2: string | null;
  tripImage3: string | null;
  tripImage4: string | null;
  tripImage5: string | null;
  placeholder: string | null;
}

export interface ImageContextType {
  imageData: ImageDataTypes | undefined;
  generateImage: (city: string) => void;
  isPendingImage: boolean;
  errorImage: unknown;
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

export interface FormStepProps {
  currentStep: number;
  control: Control<Inputs>;
  errors: FieldErrors<Inputs>;
  handleSelectionAutocomplete: (
    selectedKey: string | number,
    fieldName: FieldName,
  ) => void;
  delta: number;
}

export interface FormStep3Props
  extends Omit<FormStepProps, "handleSelectionAutocomplete"> {}

export interface FormStep4Props extends FormStep3Props {
  append: (data: { item: string }) => void;
  remove: (index: number) => void;
  fields: { id: string }[];
}
export interface FormStep5Props extends FormStep3Props {
  isWeatherSelected: boolean;
  setIsWeatherSelected: (value: boolean) => void;
}

export interface FormStep7Props extends Omit<FormStep3Props, "errors"> {
  isWeatherSelected: boolean;
  isValid: boolean;
  reviewFormData: Inputs;
}

export interface FormButtonsProps {
  currentStep: number;
  next: () => void;
  prev: () => void;
}

export interface ContainerProps {
  children: React.ReactNode;
  overflow?: string;
  height?: string;
  animationClass?: string;
}

export interface DescriptionSectionProps {
  trip: Trip;
  imageData?: ImageDataTypes;
}

export interface Gradient1Props {
  left: string;
  top: string;
  color1: string;
  color2: string;
  blur: string;
}

export interface GradientBgProps {
  from: string;
  to: string;
  blur?: string;
}

export interface GradientConicProps {
  left: string;
  top: string;
  from: string;
  to: string;
}

export interface GridContainerProps {
  children: React.ReactNode;
  bg?: string;
}

export interface MustHaveSectionProps {
  trip: Trip;
  imageData?: ImageDataTypes;
}

export interface ReviewFormProps {
  reviewFormData: Inputs;
  weather: boolean;
}

export interface SaveSectionProps {
  handleYesAnswer: () => void;
  handleNoAnswer: () => void;
  imageData?: ImageDataTypes | null;
}

export interface TitleSectionProps {
  trip: Trip;
  imageData?: ImageDataTypes;
}

export interface WeatherSectionProps {
  trip: Trip;
  isPending: boolean;
}

export interface FormContextType {
  formData: FinalDataTypes;
  setFormData: (data: FinalDataTypes) => void;
}

export interface TripContextType {
  tripData: Trip | undefined;
  generateResponseAI: (prompt: string) => void;
  isPendingResponseAI: boolean;
  errorResponseAI: unknown;
  isNavigating: boolean;
}

export interface SavedTripsContainerProps {
  children: React.ReactNode;
  bg?: string;
}
