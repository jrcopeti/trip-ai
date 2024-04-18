import z from "zod";
import { FormDataSchema } from "@/lib/schema";

type Inputs = z.infer<typeof FormDataSchema>;
type FieldName = keyof Inputs;

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

export interface ImageData {
  tripImage: string | null;
  tripImage2: string | null;
  tripImage3: string | null;
  tripImage4: string | null;
  tripImage5: string | null;
  placeholder: string | null;
}

export interface ImageContextType {
  imageData: ImageData | undefined;
  generateImage: (city: string) => void;
  isPendingImage: boolean;
  errorImage: unknown;
}
