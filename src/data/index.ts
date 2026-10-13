import type { StaticImageData } from "next/image";

import image1 from "@/assets/travel-photos/1.jpg";
import image2 from "@/assets/travel-photos/2.jpg";
import image3 from "@/assets/travel-photos/3.jpg";
import image4 from "@/assets/travel-photos/4.jpg";
import image5 from "@/assets/travel-photos/5.jpg";
import image6 from "@/assets/travel-photos/6.jpeg";
import image7 from "@/assets/travel-photos/7.jpg";
import image8 from "@/assets/travel-photos/8.jpg";
import image9 from "@/assets/travel-photos/9.jpg";
import image10 from "@/assets/travel-photos/10.jpg";
import image11 from "@/assets/travel-photos/11.jpg";
import image12 from "@/assets/travel-photos/12.jpg";
import image13 from "@/assets/travel-photos/13.jpg";
import image14 from "@/assets/travel-photos/14.jpg";
import image15 from "@/assets/travel-photos/15.jpg";
import image16 from "@/assets/travel-photos/16.jpg";
/** Who's going: one answer. Replaces the old age field and the who-answers in `types`. */
const travellers = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "colleagues", label: "Colleagues" },
] as const;

/** Every age in the group, youngest first — the order a person reads them. */
const ageRanges = [
  { value: "0-1", label: "0–1" },
  { value: "2-5", label: "2–5" },
  { value: "6-12", label: "6–12" },
  { value: "13-17", label: "13–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-30", label: "25–30" },
  { value: "31-35", label: "31–35" },
  { value: "36-40", label: "36–40" },
  { value: "41-45", label: "41–45" },
  { value: "46-50", label: "46–50" },
  { value: "51-59", label: "51–59" },
  { value: "60-69", label: "60–69" },
  { value: "70+", label: "70+" },
] as const;

/** What the trip is about. Family and Solo moved to `travellers`; Holiday, City break and Celebration are new. */
const types = [
  { value: "holiday", label: "Holiday" },
  { value: "city break", label: "City break" },
  { value: "celebration", label: "Celebration" },
  { value: "adventure", label: "Adventure" },
  { value: "romantic", label: "Romantic" },
  { value: "business", label: "Business" },
  { value: "cultural", label: "Cultural" },
  { value: "festival", label: "Festival" },
  { value: "gastronomy", label: "Gastronomy" },
  { value: "nature", label: "Nature" },
  { value: "urban", label: "Urban" },
  { value: "party", label: "Party" },
  { value: "road trip", label: "Road Trip" },
] as const;
const sortedTypes = [...types].sort((a, b) => a.label.localeCompare(b.label));

type TripTypeValue = (typeof types)[number]["value"];

/** How much fits in a day, slowest first. */
const paces = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Packed" },
] as const;

type TravelPhoto = {
  src: StaticImageData;
  alt: string;
  tripType: TripTypeValue;
  placeholder: string;
};

const luggageSizes = [
  { value: "backpack", label: "Backpack" },
  { value: "carry-on", label: "Carry-on" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "extra-large", label: "Extra Large" },
];

const accommodations = [
  { value: "hotel", label: "Hotel" },
  { value: "private acommodation", label: "Private Accomodation" },
  { value: "hostel", label: "Hostel" },
  { value: "apartment", label: "Apartment" },
  { value: "friend's house", label: "Friend's Place" },
  { value: "bed and breakfast", label: "Bed and Breakfast" },
  { value: "resort", label: "Resort" },
  { value: "cabin", label: "Cabin" },
  { value: "camping", label: "Camping" },
];
const sortedAccommodations = [
  ...accommodations.sort((a, b) => a.label.localeCompare(b.label)),
];

const budgets = [
  { value: "low-budget", label: "Low Budget" },
  { value: "comfort", label: "Comfort" },
  { value: "luxury", label: "Luxury" },
];

/**
 * Every interest offered, each mapped to a tour kind in `lib/interests.ts`. The values
 * are the stored ones, so old rows still find their label.
 */
const interests = [
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "culture", label: "Culture" },
  { value: "food", label: "Food" },
  { value: "history", label: "History" },
  { value: "nature", label: "Nature" },
  { value: "shopping", label: "Shopping" },
  { value: "art", label: "Art" },
  { value: "wildlife", label: "Wildlife" },
  { value: "beach", label: "Beach" },
  { value: "nightlife", label: "Nightlife" },
  { value: "photography", label: "Photography" },
  { value: "museums", label: "Museums" },
  { value: "wine", label: "Wine" },
  { value: "coffee", label: "Coffee" },
  { value: "wellness", label: "Wellness" },
  { value: "dating", label: "Dating" },
  { value: "music", label: "Music" },
  { value: "hiking", label: "Hiking" },
  { value: "surfing", label: "Surfing" },
  { value: "sports", label: "Sports" },
  { value: "cinema", label: "Cinema" },
  { value: "dance", label: "Dance" },
  { value: "books", label: "Books" },
  { value: "politics", label: "Politics" },
  { value: "architecture", label: "Architecture" },
  { value: "games", label: "Games" },
  { value: "cycling", label: "Cycling" },
  { value: "off road", label: "Off Road" },
  { value: "yoga", label: "Yoga" },
  { value: "spa", label: "Spa" },
  { value: "relax", label: "Relax" },
  { value: "sightseeing", label: "Sightseeing" },
  { value: "fishing", label: "Fishing" },
  { value: "diving", label: "Diving" },
  { value: "skiing", label: "Skiing" },
  { value: "camping", label: "Camping" },
  { value: "backpacking", label: "Backpacking" },
  { value: "LGBT", label: "LGBTQ+" },
  { value: "beer", label: "Beer" },
  { value: "languages", label: "Languages" },
  { value: "volunteering", label: "Volunteering" },
  { value: "local life", label: "Local Life" },
  { value: "kids", label: "Kids' Fun" },
  { value: "markets", label: "Markets" },
  { value: "street art", label: "Street Art" },
  { value: "theatre", label: "Theatre" },
  { value: "festivals", label: "Festivals" },
  { value: "gardens", label: "Gardens" },
  { value: "street food", label: "Street Food" },
] as const;
const sortedInterest = [...interests].sort((a, b) => a.label.localeCompare(b.label));

type InterestValue = (typeof interests)[number]["value"];

const transports = [
  { value: "car", label: "Car" },
  { value: "bus", label: "Bus" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Plane" },
  { value: "boat", label: "Boat" },
  { value: "car-riding", label: "Car Riding" },
  { value: "bicycle", label: "Bicycle" },
  { value: "motorcycle", label: "Motorcycle" },
];

const sortedTransports = [
  ...transports.sort((a, b) => a.label.localeCompare(b.label)),
];

/**
 * Travel photos bundled with the app. Each `alt` describes what is actually in
 * frame — none of these is identifiable as a particular city, so none claims one.
 * `tripType` is one of the form's trip-type values, so a photo can be matched to
 * a trip. `placeholder` is the plaiceholder blur of that exact file.
 */
const travelPhotos: TravelPhoto[] = [
  {
    src: image1,
    alt: "Hot-air balloons drifting over a hazy valley at sunrise",
    tripType: "adventure",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AOzn0v/55v//7P//6wDItJvl0bns3cXj2sUAGQAAOSUYMigfEg4LMQsWIMYHupEAAAAASUVORK5CYII=",
  },
  {
    src: image2,
    alt: "A white fairy-tale castle on a wooded hilltop in autumn",
    tripType: "cultural",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AHTV53Xc7VzF1wDM///E9//K//8Ag31tf3ZmioV0ABYAADsoCUcwD/L6FAbaZxiOAAAAAElFTkSuQmCC",
  },
  {
    src: image3,
    alt: "A saddled donkey resting beside a red sandstone wall and a flowering oleander",
    tripType: "cultural",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAPElEQVR4nGNoUuEslGFo8jZakOHL0KQrZM/OYCvNWWApyxCsI+mnJuUvwnC+KYBBhoFBgYEhxlD6/6dLAC5TDJD6waR7AAAAAElFTkSuQmCC",
  },
  {
    src: image4,
    alt: "Pastel houses stacked on a cliff above the sea",
    tripType: "romantic",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNYceLu6Wc/Xv3/zzAzK3xORdqDR/cZTO3MHB2stWwcGBjEGRgUVBk4JQC3DQ/c3oLnaQAAAABJRU5ErkJggg==",
  },
  {
    src: image5,
    alt: "A passenger train curving through open high country",
    tripType: "nature",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGOY2ZZ1/PrVl///v/v4mqEpPyTAUdrfQUZLloEh1EXTUI7BXJ1BhoEBAH93DhyQDeoiAAAAAElFTkSuQmCC",
  },
  {
    src: image6,
    alt: "A yellow camper van on a desert road between red rock formations",
    tripType: "road trip",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AHldWot2dur//8jHzwBtMhGjcVd9ZFwmAAAAtqKL59G7x6+TlH1feEwTO3KoROoAAAAASUVORK5CYII=",
  },
  {
    src: image7,
    alt: "The bow of a wooden rowing boat on a still mountain lake",
    tripType: "nature",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGPIKij8/vf/tfuvtu49yCCgIBge45eQFMYgzsAgycagysSgxsAgxsAAAFcyDAQUojdhAAAAAElFTkSuQmCC",
  },
  {
    src: image8,
    alt: "A traveller photographing a neon public-market sign",
    tripType: "urban",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/ALu0qvPm3//9+wCqm5HLtq23o58AgHZzhHlwY1VNAJSAfRUAAJ2Mi++IFPun5qYRAAAAAElFTkSuQmCC",
  },
  {
    src: image9,
    alt: "A red-brick flatiron building reflected in a rainy street, towers lost in fog",
    tripType: "urban",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGP48+fV6ycX7948zuBmq63AzmCkKcFgpi0pychgqszPEOJnExfmZGEgCwBW9AycThHg0wAAAABJRU5ErkJggg==",
  },
  {
    src: image10,
    alt: "A hiker leaping between red sandstone rocks above desert buttes",
    tripType: "adventure",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMklEQVR4nAEnANj/AO72/+nu//T+/8Pe/wCtiH+Sdm2XenOofnMAch4AYBIAPAAATwAA9/0THu/nSesAAAAASUVORK5CYII=",
  },
  {
    src: image11,
    alt: "Small boats moored in turquoise water off a white-sand beach, seen from above",
    tripType: "nature",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AB42LBEaHgAHCABV19CJvLaem5sAaPPzkfPo//jiAGn195vy5f/u10KGFcKWGkYiAAAAAElFTkSuQmCC",
  },
  {
    src: image12,
    alt: "A city skyline at dusk above a riverside highway full of traffic",
    tripType: "urban",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMUlEQVR4nGNgM/C2Te8MSaximDN1wf9vn94e2sGQGRtfkpYsr2nAwK6gr2Zgw8AmCQBEeA3eDITVuQAAAABJRU5ErkJggg==",
  },
  {
    src: image13,
    alt: "A figure with arms outstretched below a tall waterfall in a fern-filled gorge",
    tripType: "adventure",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNQtjU6eOEMh7IcA4Ok0Kc//5RtTRiMXK3zG8u5VGQZYvKSGAQYGMT5APqXCql1lP4HAAAAAElFTkSuQmCC",
  },
  {
    src: image14,
    alt: "Rowing boats on a turquoise lake beneath jagged mountain peaks",
    tripType: "romantic",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGMwVOa8////xY//W6evZRCUZyjurWQOCmQQZWRgMJFhyQ0O2zQhZ+ciADpoDp2QD7dzAAAAAElFTkSuQmCC",
  },
  {
    src: image15,
    alt: "Sneakers propped out of a car window on a misty mountain road",
    tripType: "road trip",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/APb58Pv+9vDz7ACan5q0trF+f3kADxISdmpOPzQOABIAAE9AK3xlO9hbEcyFJVu3AAAAAElFTkSuQmCC",
  },
  {
    src: image16,
    alt: "A hiker writing in a notebook on a summit, snowy peaks behind",
    tripType: "adventure",
    placeholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AFi96HTV/3LK9gC///+e0eKn7/8AUWhqFhYBAA4eAPTn1qeqn7atoNtGFjvgJjQHAAAAAElFTkSuQmCC",
  },
];

/**
 * The form's steps: which fields each validates and the progress it reports.
 * The words (titles, subtitles) live in `components/form/content.ts`.
 */
const formSteps = [
  {
    id: "step 1",
    stepValue: 0,
    fields: ["userName", "travellers", "ageRanges", "passport"],
  },
  {
    id: "step 2",
    stepValue: 16,
    fields: ["city", "country"],
  },
  {
    id: "step 3",
    stepValue: 32,
    fields: ["type", "pace", "luggageSize", "accommodation", "budget", "transport"],
  },
  {
    id: "step 4",
    stepValue: 48,
    fields: [],
  },
  {
    id: "step 5",
    stepValue: 64,
    fields: ["startDate", "endDate"],
  },
  {
    id: "step 6",
    stepValue: 80,
    fields: ["interests"],
  },
  {
    id: "step 7",
    stepValue: 100,
    fields: [],
  },
];

/** The label for a stored value, or undefined for a value no list offers (an old row's). */
function optionLabel(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined,
) {
  return options.find((option) => option.value === value)?.label;
}

export type { TravelPhoto, TripTypeValue, InterestValue };

export {
  travellers,
  ageRanges,
  types,
  sortedTypes,
  paces,
  interests,
  optionLabel,
  luggageSizes,
  sortedAccommodations,
  budgets,
  sortedInterest,
  sortedTransports,
  travelPhotos,
  formSteps as steps,
};
