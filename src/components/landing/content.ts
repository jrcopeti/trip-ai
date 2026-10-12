import type { IconType } from "react-icons";
import { BsCloudRainFill, BsCloudSun, BsSunFill, BsSunsetFill } from "react-icons/bs";
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

import lake from "@/assets/travel-photos/7.jpg";
import train from "@/assets/travel-photos/5.jpg";
import suncloudy from "@/assets/weather/suncloudy.png";
import type { TourKind } from "@/lib/tourKinds";

/**
 * Content for the landing page.
 *
 * The photos are picked and captioned here for the landing's own sections. The
 * captions describe what is actually in frame and make no place claims, the same
 * rule `travelPhotos` in src/data follows. Static imports let next/image
 * generate the blur placeholder on its own.
 */

/** The hero's eyebrow, in the meta-label idiom. */
export const heroEyebrow = "Your new travel friend";

/** The hero deck's accessible name: the latest saved trips, as polaroids. */
export const heroDeckLabel = "Latest saved trips";

/** The wordmark block: what the product does, one line each. */
export const features = {
  eyebrow: "What it does",
  items: [
    {
      title: "Checks the weather",
      body: "The 5-day forecast if you're leaving now, the usual weather if you're not, and a packing list that follows it.",
    },
    {
      title: "Uses real photos",
      body: "Pictures of your destination from Unsplash, not stock art.",
    },
    {
      title: "Five tours, by kind",
      body: "Each with a title and what kind of tour it is.",
    },
    {
      title: "Keeps what you save",
      body: "Saved trips stay, with the weather they were planned for.",
    },
  ],
};

/** The photo band's heading: what an answer actually holds. */
export const bandHeading = {
  claim: "What comes back:",
  qualifier: "tours for the city, the weather for your dates, and what to pack.",
};

/**
 * Five sample tours in the shape the AI returns (`{ title, kind, description }`),
 * for one Berlin trip — the city the weather card shows.
 */
export const sampleTours: { title: string; kind: TourKind; description: string }[] = [
  {
    title: "Tempelhof and the quiet parks",
    kind: "Nature",
    description: "Cycle the old runways, then find the still corners of Tiergarten.",
  },
  {
    title: "The Wall at Bernauer Strasse",
    kind: "History",
    description: "Walk the line of the Wall where a stretch of it still stands.",
  },
  {
    title: "A slow morning on Museum Island",
    kind: "Art",
    description: "Five museums on one island. Pick two and take your time.",
  },
  {
    title: "Kreuzberg by the plate",
    kind: "Food",
    description: "Street food along the canal, ending at Markthalle Neun.",
  },
  {
    title: "Late in Friedrichshain",
    kind: "Nightlife",
    description: "Bars along Simon-Dach-Strasse, then wherever the night goes.",
  },
];

export const photos = {
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

export const stepsHeading = "Three steps. That's the app.";

export const steps = [
  {
    n: "01",
    title: "Describe the trip",
    body: "City, dates, who is coming, how you like to travel. Seven short steps, no account needed.",
  },
  {
    n: "02",
    title: "Claude drafts it",
    body: "Five tours worth doing, what the place is like, what you must not miss, and a packing list checked against the forecast.",
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
