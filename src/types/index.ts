import z from 'zod';
import { FormDataSchema } from '@/lib/schema';

type Inputs = z.infer<typeof FormDataSchema>;
type FieldName = keyof Inputs;

export interface WeatherApiResponse {
  main:
    {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
    },

  weather: [
    {
      main: string;
      icon: string;
    },
  ];
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

export interface FinalDataTypes extends Omit<Inputs, 'requiredItems'> {
  requiredItems: string[];
  weatherForecast: string;
}
