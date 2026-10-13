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
 * Content for the landing page. Every word on it lives here; the components hold
 * only layout and styling. The saved trips in the hero's deck are not here: they
 * are rows from the database, captioned with their own city and country.
 *
 * The photos are picked and captioned here for the landing's own sections. The
 * captions describe what is actually in frame and make no place claims, the same
 * rule `travelPhotos` in src/data follows. Static imports let next/image
 * generate the blur placeholder on its own.
 */

/**
 * Must match `SiteNav`'s: the intro flies it into the nav, scaled by the width
 * ratio of the two.
 */
const wordmark = "trip ai";

/** The curtain over a first visit: three beats, then the name. */
export const intro = {
  beats: ["Plan.", "Pack.", "Go."],
  with: "with",
  wordmark,
};

export const hero = {
  eyebrow: "Your new travel friend",
  heading: { claim: "Plan the trip.", qualifier: "Pack for the weather." },
  lead: "Describe where you are headed. Trip AI writes the itinerary, the tours worth doing, and a packing list that already knows the forecast.",
  primary: { label: "Plan a trip", href: "/form" },
  secondary: { label: "See saved trips", href: "/saved-trips" },
  /** The polaroids: the latest saved trips. `loading` is read while they stream in. */
  deck: { label: "Latest saved trips", loading: "Loading the latest saved trips" },
  stickers: { goAnywhere: "go anywhere", takeItEasy: "take it easy", packLight: "pack light" },
};

/** The wordmark block: the name, then what the product does, one line each. */
export const features = {
  eyebrow: "What it does",
  wordmark,
  lead: "One form, one answer. Trip AI turns a handful of details into a full itinerary, then checks it against the forecast so you know what to put in the bag before you leave.",
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

export const tripTypes = {
  heading: "Thirteen kinds of trip.",
  lead: "Pick one in the form and the itinerary changes shape around it.",
  href: "/form",
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

export const weatherPacking = {
  heading: { claim: "The packing list", qualifier: "reads the forecast first." },
  badge: "check the sky",
  feelsLike: (t: number) => `Feels like ${t}ºC`,
  low: "Low",
  high: "High",
  packing: { eyebrow: "Because two of those days are wet", heading: "Pack these" },
};

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

export const closing = {
  heading: "Where are you going next?",
  body: "Seven questions. One itinerary. No account needed.",
  cta: { label: "Start planning", href: "/form" },
  badge: "go anywhere",
};
