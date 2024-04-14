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
  console.log("condition", condition);
  console.log("icon", icon);
  const hour = new Date().getHours();
  console.log("hour", hour);

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
  dayjs.extend(duration);
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const differenceInDays = end.diff(start);
  return dayjs.duration(differenceInDays).asDays();
};

const defaultPlaceholder =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNIL6799/f/jWfflazcGYwtrP+/ffj6yVMta2cGBn5JS3d/U48gBg5RAI1ZEFzy8ZYjAAAAAElFTkSuQmCC";

export {
  cn,
  formatDate,
  placeWeatherIcons,
  durationInDays,
  defaultPlaceholder,
};
