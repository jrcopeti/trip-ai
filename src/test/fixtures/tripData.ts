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
} as unknown as Trip;
