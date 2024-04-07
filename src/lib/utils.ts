import dayjs from "dayjs";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import bolt from "@/assets/weather/bolt.png";
import drizzle from "@/assets/weather/drizzle.png";
import rain from "@/assets/weather/rain.png";
import snow from "@/assets/weather/snow.png";
import hail from "@/assets/weather/hail.png";
import sun from "@/assets/weather/sun.png";
import moon from "@/assets/weather/moon.png";
import nightcloudy from "@/assets/weather/nightcloudy.png";
import sunnycloudy from "@/assets/weather/sunnycloudy.png";
import cloudy from "@/assets/weather/cloudy.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function formatDate(dateString?: string | Date, includeTime = true) {
  if (!dateString) return "";

  return dayjs(dateString).format(
    includeTime ? "DD MMM YYYY hh:mm A" : "DD MMM YYYY",
  );
}

const placeWeatherIcons = (condition: string, icon = null) => {
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
    if ((icon === "02d" || icon === "03d") && (hour > 5 || hour < 19)) {
      return sunnycloudy.src;
    }

    if ((icon === "02n" || icon === "03n") && (hour >= 19 || hour <= 5)) {
      return nightcloudy.src;
    }

    if (icon === "04d" || icon === "04n") {
      return cloudy.src;
    }
  }

  console.log("No condition matched, returning default icon.");
};

export { cn, formatDate, placeWeatherIcons };
