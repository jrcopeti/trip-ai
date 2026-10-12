/**
 * The one-word kinds a suggested tour can be, as the `tripData` tool's `enum`
 * offers them. A fixed list rather than a free word, so each kind has its own
 * icon on the tour's chip (`kindIcon` in `components/trips/kinds.ts`).
 */
export const TOUR_KINDS = [
  "Food",
  "History",
  "Culture",
  "Art",
  "Nature",
  "Adventure",
  "Nightlife",
  "Romantic",
  "Shopping",
  "Relaxation",
  "Sightseeing",
  "Family",
] as const;

export type TourKind = (typeof TOUR_KINDS)[number];
