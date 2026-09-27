import { defaultPlaceholder } from "@/lib/constants";
import type { Prisma, Trip } from "@prisma/client";

/** A saved `Trip` row, matching the Prisma model field for field. */
export const tripFixture: Trip = {
  id: 1,
  userName: "ana",
  age: "31",
  nationality: "Brazilian",
  type: "cultural",
  city: "lisbon",
  country: "Portugal",
  startDate: new Date("2030-05-01T00:00:00.000Z"),
  endDate: new Date("2030-05-08T00:00:00.000Z"),
  luggageSize: "carry-on",
  accommodation: "hotel",
  transport: "plane",
  requiredItems: ["camera", "walking shoes"],
  interests: ["art", "food"],
  note: "wants a day trip to sintra",
  budget: "comfort",
  agreement: true,
  weatherForecast: "",
  flagUrl: "https://flagcdn.com/pt.svg",
  tripUrl: "ab12c",
  image: "https://images.unsplash.com/photo-lisbon-1",
  placeholder: defaultPlaceholder,
  image2: "https://images.unsplash.com/photo-lisbon-2",
  image3: "https://images.unsplash.com/photo-lisbon-3",
  image4: "https://images.unsplash.com/photo-lisbon-4",
  image5: "https://images.unsplash.com/photo-lisbon-5",
  saved: true,
  title: "Ana's Seven Sunlit Days Across Lisbon, Portugal",
  description: "Lisbon in May is all tiled facades and long light.",
  objectsList: [
    { quantity: 3, item: "linen shirt", description: "Breathable in coastal heat" },
    { quantity: 1, item: "light jacket", description: "Evenings by the river turn cool" },
  ],
  mustHave: ["passport", "sunscreen", "adapter", "water bottle"],
  tours: [
    "Walk the Alfama at first light, before the trams fill.",
    "Take the train to Sintra and climb to the Moorish castle.",
    "Spend an afternoon in Belem, pastry in hand.",
  ],
  tip: "A carry-on suits the hills; cobblestones punish wheeled luggage.",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

/** A second row, so search and ordering have something to discriminate. */
export const tripFixture2: Trip = {
  ...tripFixture,
  id: 2,
  userName: "bruno",
  city: "kyoto",
  country: "Japan",
  flagUrl: "https://flagcdn.com/jp.svg",
  tripUrl: "de34f",
  title: "Bruno's Quiet Week Among the Temples of Kyoto, Japan",
  image: "https://images.unsplash.com/photo-kyoto-1",
};

export function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return { ...tripFixture, ...overrides };
}

/**
 * A `Trip` row is the *read* shape: `id` and the timestamps are set by the DB,
 * and the Json columns come back as `JsonValue` (nullable) rather than the
 * `InputJsonValue` a write accepts. This drops the generated columns and
 * narrows the Json fields, giving the shape `createTripInDB` actually takes.
 */
export function tripCreateInput(
  trip: Trip = tripFixture,
): Prisma.TripCreateInput {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = trip;
  return {
    ...rest,
    requiredItems: rest.requiredItems as Prisma.InputJsonValue,
    objectsList: rest.objectsList as Prisma.InputJsonValue,
    tours: rest.tours as Prisma.InputJsonValue,
  };
}
