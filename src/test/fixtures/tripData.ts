import type { Trip } from "@prisma/client";

/**
 * What `fetchResponseAI` resolves to: the `tripData` tool's input, cast to `Trip`
 * by the API module. Only the seven tool fields are present — the rest of the row
 * is merged in from the form data by `useCreateTrip`.
 */
export const tripDataFixture = {
  title: "Ana's Seven Sunlit Days Across Lisbon, Portugal",
  objectsList: [
    { quantity: 3, item: "linen shirt", description: "Breathable in coastal heat" },
    { quantity: 1, item: "light jacket", description: "Evenings by the river turn cool" },
    { quantity: 2, item: "walking shoes", description: "Cobblestones all week" },
  ],
  mustHave: ["passport", "sunscreen", "adapter", "water bottle"],
  requiredItems: ["camera", "walking shoes"],
  description: "Lisbon in May is all tiled facades and long light.",
  tours: [
    "Walk the Alfama at first light, before the trams fill.",
    "Take the train to Sintra and climb to the Moorish castle.",
    "Spend an afternoon in Belem, pastry in hand.",
  ],
  tip: "A carry-on suits the hills; cobblestones punish wheeled luggage.",
} as unknown as Trip;
