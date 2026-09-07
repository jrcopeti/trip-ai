import type { IconType } from "react-icons";
import { BsCloudRainFill, BsCloudSun, BsSunFill, BsSunsetFill } from "react-icons/bs";
import { FaChampagneGlasses, FaHeart, FaPizzaSlice, FaTree } from "react-icons/fa6";
import { IoWaterOutline } from "react-icons/io5";
import { LuWind } from "react-icons/lu";
import {
  TbBackpack,
  TbJacket,
  TbShoe,
  TbSunglasses,
  TbSunrise,
  TbUmbrella,
} from "react-icons/tb";

import balloons from "@/assets/homepage/1.jpg";
import lake from "@/assets/homepage/7.jpg";
import train from "@/assets/homepage/5.jpg";
import suncloudy from "@/assets/weather/suncloudy.png";

/**
 * Content for the /landing-v2 experiment.
 *
 * Curated here rather than pulled from `homepageImages` in src/data: that array
 * carries the same alt text, city and blur placeholder on entries 11-16, and its
 * city labels do not match the photographs at all (entry 1 is labelled Berlin but
 * shows Cappadocia, entry 7 is labelled Barcelona but shows an alpine lake). The
 * captions below describe what is actually in frame and make no place claims.
 * Static imports let next/image generate the blur placeholder on its own.
 */

export type ItineraryCard = {
  title: string;
  chip: string;
  Icon: IconType;
  tint: string;
};

/** Sample of the shape Trip AI returns: a titled activity plus its category. */
export const itineraryCards: ItineraryCard[] = [
  {
    title: "Dinner at the Eiffel Tower",
    chip: "Romantic",
    Icon: FaHeart,
    tint: "bg-buddy-lavender",
  },
  {
    title: "Secret parks of Berlin",
    chip: "Guided tour",
    Icon: FaTree,
    tint: "bg-buddy-lime-punch",
  },
  {
    title: "Da Giuseppe, pizza night",
    chip: "Gastronomy",
    Icon: FaPizzaSlice,
    tint: "bg-buddy-blush",
  },
  {
    title: "Rex Club until close",
    chip: "Party",
    Icon: FaChampagneGlasses,
    tint: "bg-buddy-orchid",
  },
];

/** The fanned deck in the hero — kept to three so the stack stays readable. */
export const heroDeck: ItineraryCard[] = itineraryCards.slice(0, 3);

export const photos = {
  band: {
    src: balloons,
    alt: "Hot-air balloons drifting over a hazy valley at sunrise",
    label: "Balloons at sunrise",
    Icon: TbSunrise,
  },
  pair: [
    {
      src: lake,
      alt: "A wooden rowing boat on a still mountain lake",
      label: "Nature",
    },
    {
      src: train,
      alt: "A passenger train curving through open high country",
      label: "Road trip",
    },
  ],
};

export const steps = [
  {
    n: "01",
    title: "Describe the trip",
    body: "City, dates, who is coming, how you like to travel. Seven short steps, no account needed.",
  },
  {
    n: "02",
    title: "Claude drafts it",
    body: "Tours worth doing, what the place is like, what you must not miss, and a packing list checked against the forecast.",
  },
  {
    n: "03",
    title: "Keep it or bin it",
    body: "Save the ones you want. They stay in Saved trips with the weather they were planned for.",
  },
];

/**
 * Sample current conditions, shaped like the fields WeatherSection reads from
 * the OpenWeather response so the card mirrors the real one.
 */
export const currentWeather = {
  iconSrc: suncloudy,
  place: "Berlin, Germany",
  temperature: 17,
  feelsLike: 15,
  condition: "Rain",
  description: "light intensity shower rain",
  tempMin: 14,
  tempMax: 19,
  metrics: [
    { Icon: IoWaterOutline, value: "78%", label: "Humidity" },
    { Icon: LuWind, value: "12km/h", label: "Wind" },
    { Icon: TbSunrise, value: "05:42", label: "Sunrise" },
    { Icon: BsSunsetFill, value: "21:18", label: "Sunset" },
  ],
};

export const forecast: { day: string; Icon: IconType; high: number }[] = [
  { day: "Mon", Icon: BsSunFill, high: 24 },
  { day: "Tue", Icon: BsCloudSun, high: 21 },
  { day: "Wed", Icon: BsCloudRainFill, high: 17 },
  { day: "Thu", Icon: BsCloudRainFill, high: 16 },
  { day: "Fri", Icon: BsSunFill, high: 23 },
];

export const packing: { label: string; Icon: IconType }[] = [
  { label: "Light rain shell", Icon: TbJacket },
  { label: "Comfortable walking shoes", Icon: TbShoe },
  { label: "Portable umbrella", Icon: TbUmbrella },
  { label: "Sunglasses", Icon: TbSunglasses },
  { label: "Day pack", Icon: TbBackpack },
];
