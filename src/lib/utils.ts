import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import bolt from "@/assets/weather/bolt.png";
import cloudy from "@/assets/weather/cloudy.png";
import drizzle from "@/assets/weather/drizzle.png";
import hail from "@/assets/weather/hail.png";
import rain from "@/assets/weather/rain.png";
import moon from "@/assets/weather/moon.png";
import mooncloudy from "@/assets/weather/mooncloudy.png";
import snow from "@/assets/weather/snow.png";
import sun from "@/assets/weather/sun.png";
import suncloudy from "@/assets/weather/suncloudy.png";
import type { DailyForecastDataTypes } from "@/types";

dayjs.extend(duration);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(dateString?: string | Date, includeTime = true) {
  if (!dateString) return "";

  return dayjs(dateString).format(
    includeTime ? "DD MMM YYYY hh:mm A" : "DD MMM YYYY",
  );
}

const placeWeatherIcons = (condition: string, icon: string) => {
  const hour = new Date().getHours();

  if (condition === "Clear") {
    if (hour >= 5 && hour <= 19) {
      return sun.src;
    } else {
      return moon.src;
    }
  }

  if (condition === "Thunderstorm") {
    return bolt.src;
  }
  if (condition === "Drizzle") {
    return drizzle.src;
  }
  if (condition === "Rain") {
    return rain.src;
  }
  if (condition === "Snow") {
    return snow.src;
  }
  if (
    condition === "Mist" ||
    condition === "Smoke" ||
    condition === "Haze" ||
    condition === "Dust" ||
    condition === "Fog" ||
    condition === "Sand" ||
    condition === "Ash" ||
    condition === "Squall" ||
    condition === "Tornado"
  ) {
    return hail.src;
  }

  if (condition === "Clouds") {
    if (icon === "02d" || icon === "03d") {
      return suncloudy.src;
    }

    if (icon === "02n" || icon === "03n") {
      return mooncloudy.src;
    }

    if (icon === "04d" || icon === "04n") {
      return cloudy.src;
    }
  }

  console.log("No condition matched, returning default icon.");
  return suncloudy.src;
};

const durationInDays = (startDate: Dayjs | string, endDate: Dayjs | string) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const differenceInDays = end.diff(start);
  return Math.ceil(dayjs.duration(differenceInDays).asDays());
};

const displayDuration = (durationDays: number) => {
  if (durationDays === 0) {
    return "Day Trip";
  }
  if (durationDays > 1) {
    return `${durationDays} days`;
  } else {
    return `${durationDays} day`;
  }
};

const findStartIndex = (data: DailyForecastDataTypes[], chosenHour: number) => {
  const chosenTime = dayjs().startOf("day").add(chosenHour, "hour");
  let startIndex = 0;

  for (let i = 0; i < data.length; i++) {
    const currentTime = dayjs.unix(data[i].dt);
    console.log("currentTime", currentTime);
    if (currentTime.isAfter(chosenTime)) {
      startIndex = i;
      break;
    }
  }
  console.log("startIndex", startIndex);
  return startIndex;
};

const selectDailyForecasts = (
  data: DailyForecastDataTypes[],
  chosenHour: number,
) => {
  if (!data) return [];
  const startIndex = findStartIndex(data, chosenHour);
  console.log("startIndex", startIndex);
  const forecasts = [];

  for (let i = startIndex; i < data.length; i += 8) {
    forecasts.push(data[i]);
  }
  return forecasts;
};

export {
  cn,
  formatDate,
  placeWeatherIcons,
  durationInDays,
  displayDuration,
  findStartIndex,
  selectDailyForecasts,
};
