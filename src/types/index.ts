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

export interface FetchForecastParams {
  city?: string;
  country?: string;
}

export interface FetchWeatherParams {
  city?: string;
  country?: string;
}

export interface FetchResponseAIParams {
  prompt: string;
  city: string;
  country?: string;
}

export interface WeatherContextType {
  forecastData?: SelectedForecastDataTypes[];
  generateForecast: ({
    city,
    country,
  }: {
    city?: string;
    country?: string;
  }) => void;
  isPendingForecast: boolean;
  errorForecast: unknown;
  weatherData?: Partial<WeatherDataTypes>;
  generateWeather: ({
    city,
    country,
  }: {
    city?: string;
    country?: string;
  }) => void;
  isPendingWeather: boolean;
  errorWeather: unknown;
  dailyForecastData?: DailyForecastDataTypes[];
  generateDailyForecast: ({
    city,
    country,
  }: {
    city?: string;
    country?: string;
  }) => void;
  isPendingDailyForecast: boolean;
  errorDailyForecast: unknown;
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
  imageData?: ImageDataTypes;
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

export interface FormStep2Props extends FormStepProps {
  isCityValid: boolean;
  isLoadingCityValid: boolean;
  message: string;
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
  setValue: (name: FieldName, value: string) => void;
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
  isCityValid: boolean;
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
  position?: string;
  from?: string;
  to?: string;
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
  animationClass?: string;
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
  trip: Trip;
  isCreatingTrip: boolean;
  isSaved: boolean;
}

export interface FormDetailsSectionProps {
  trip: Trip;
  imageData?: ImageDataTypes;
  formData?: FinalDataTypes;
}

export interface PackReadySectionProps {
  trip: Trip;
  formData?: FinalDataTypes;
}

export interface WeatherSectionProps {
  trip: Trip;
  formData?: FinalDataTypes;
}

export interface ForecastSectionProps extends WeatherSectionProps {}

export interface TitleSectionProps {
  trip: Trip;
  imageData?: ImageDataTypes;
}

export interface FormContextType {
  formData: FinalDataTypes;
  setFormData: (data: FinalDataTypes) => void;
}
export type TripResponse = { trip: Trip | null } | Trip;

export interface TripContextType {
  tripData: Trip | null;
  generateResponseAI: (prompt: string) => void;
  isPendingResponseAI: boolean;
  errorResponseAI: unknown;
  isNavigating: boolean;
}

export interface SavedTripsContainerProps {
  children: React.ReactNode;
  bg?: string;
}
export interface NotFoundComponentProps {
  message: string;
  path: string;
  button: string;
}
export interface useGeoNamesProps {
  city: string;
  countryCode?: string;
}
export interface GeoName {
  name: string;
  population: number;
}
export interface ToggleActions {
  setVisible: (visible: boolean) => void;
  onHidden: () => void;
}
