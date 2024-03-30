"use server";
import axios from "axios";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const getWeatherSchema = z.object({
  city: z
    .string()
    .min(3, { message: "City name must be at least 3 characters long" }),
  country: z
    .string()
    .min(2, { message: "Country name must be at least 2 characters long" }),
});

interface getWeatherFormState {
  errors: {
    city?: string[];
    country?: string[];
  };
}

export async function getWeather(
  formState: getWeatherFormState,
  formData: FormData,
): Promise<any> {
  const result = getWeatherSchema.safeParse({
    city: formData.get("city"),
    country: formData.get("country"),
  });
  console.log("result:", result);

  if (!result.success) {
    console.log(result.error.flatten().fieldErrors);
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }
  const coordinatesUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${result.data.city},${result.data.country}&limit=3&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

  let weather;
  try {
    const getCoordinates = await axios.get(coordinatesUrl);

    const { lat, lon } = getCoordinates.data[0];

    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_KEY}`;

    const getWeather = await axios.get(weatherUrl);
    weather = JSON.stringify(getWeather.data.list);
    // weather = getWeather.data.list;

    console.log("weather", weather);
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      };
    }
  }

  revalidatePath("/");

  return {
    errors: {},
  };
}
