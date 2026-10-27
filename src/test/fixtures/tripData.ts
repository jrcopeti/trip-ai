import type { Trip } from "@/generated/prisma/client";
import type { TripData } from "@/lib/agent/submitTrip";
import { imageDataFixture } from "./image";
import { makeTrip } from "./trip";

/**
 * The model's `submit_trip` input: the six generated fields. `generateTrip` writes them
 * into the row with the request, the place and the photos (`generatedTripFixture`).
 */
export const tripDataFixture = {
  title: "Ana's Seven Sunlit Days Across Lisbon, Portugal",
  objectsList: [
    { quantity: 3, item: "linen shirt", description: "Breathable in coastal heat" },
    { quantity: 1, item: "light jacket", description: "Evenings by the river turn cool" },
    { quantity: 2, item: "sandals", description: "For the evenings after the hills" },
    { quantity: 1, item: "sun hat", description: "Little shade on the miradouros" },
    { quantity: 1, item: "power bank", description: "Maps all day; keep it in your hand luggage" },
    { quantity: 1, item: "travel toiletries", description: "Liquids in 100 ml bottles for the carry-on" },
  ],
  mustHave: ["passport", "sunscreen", "adapter", "water bottle"],
  description: "Lisbon in May is all tiled facades and long light.",
  tours: [
    {
      title: "Alfama at first light",
      kind: "History",
      description: "Walk the Alfama at first light, before the trams fill.",
    },
    {
      title: "Sintra's Moorish castle",
      kind: "Adventure",
      description: "Take the train to Sintra and climb to the Moorish castle.",
    },
    {
      title: "Fado in the Mouraria",
      kind: "Nightlife",
      description: "Find a small fado house in the Mouraria and stay for the late sets.",
    },
    {
      title: "Tiles at the Azulejo museum",
      kind: "Art",
      description: "Spend a morning among five centuries of painted tiles.",
    },
    {
      title: "An afternoon in Belem",
      kind: "Food",
      // Long on purpose: real tours run to a paragraph, and the tours carousel
      // has to hold its height when one does (trip-journey.spec measures it).
      description:
        "Spend an afternoon in Belem, pastry in hand: start at the Jeronimos Monastery before the tour buses arrive, walk the riverfront to the Monument to the Discoveries, then climb the Tower of Belem as the light turns gold over the Tagus.",
    },
  ],
  tip: "A carry-on suits the hills; cobblestones punish wheeled luggage.",
} satisfies TripData;

/** `tours` as 715 characters of JSON text holding one tour, cut off mid-tour and unterminated. */
export const brokenToursString =
  "[{\"title\":\"Marjan Hill Forest Trail Loop\",\"kind\":\"Nature\",\"description\":\"Start from the western end of the Riva and climb the stone steps into Marjan, the pine-covered peninsula that Split locals use as their backyard. Paths lead past small Romanesque chapels, cliffside lookouts and quiet coves, with the Adriatic spread out below. A loop takes two to three hours, which suits your balanced pace and leaves energy for the afternoon. Mild October temperatures make the climb comfortable, so you won't be fighting summer heat. Your trail shoes will matter on the polished limestone. Bring water and a layer for the summit breeze, then reward yourself with a coffee at the Bene beach end of the park on your way down.";

/**
 * What `generateTrip` resolves to for `validTripRequest` at `lisbonPlace`, with
 * `imageDataFixture`'s photos: the row it wrote, not saved yet.
 */
export const generatedTripFixture: Trip = makeTrip({
  ...tripDataFixture,
  tripImages: imageDataFixture.tripImages,
  tripUrl: "0a1b2c3d4e5f",
  saved: false,
});
