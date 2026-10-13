import type { InterestValue } from "@/data";
import type { TourKind } from "@/lib/tourKinds";

/** The tour kind each interest asks for, so the prompt can steer the tours' kinds. */
export const INTEREST_TOUR_KIND: Record<InterestValue, TourKind> = {
  mountain: "Nature",
  city: "Sightseeing",
  culture: "Culture",
  food: "Food",
  history: "History",
  nature: "Nature",
  shopping: "Shopping",
  art: "Art",
  wildlife: "Nature",
  beach: "Relaxation",
  nightlife: "Nightlife",
  photography: "Sightseeing",
  museums: "Art",
  wine: "Food",
  coffee: "Food",
  wellness: "Relaxation",
  dating: "Romantic",
  music: "Culture",
  hiking: "Adventure",
  surfing: "Adventure",
  sports: "Adventure",
  cinema: "Culture",
  dance: "Nightlife",
  books: "Culture",
  politics: "History",
  architecture: "Sightseeing",
  games: "Family",
  cycling: "Adventure",
  "off road": "Adventure",
  yoga: "Relaxation",
  spa: "Relaxation",
  relax: "Relaxation",
  sightseeing: "Sightseeing",
  fishing: "Nature",
  diving: "Adventure",
  skiing: "Adventure",
  camping: "Nature",
  backpacking: "Adventure",
  LGBT: "Nightlife",
  beer: "Food",
  languages: "Culture",
  volunteering: "Culture",
  "local life": "Culture",
  kids: "Family",
  markets: "Shopping",
  "street art": "Art",
  theatre: "Culture",
  festivals: "Culture",
  gardens: "Nature",
  "street food": "Food",
};

/** The distinct tour kinds a set of interests points at, in the interests' order. */
export function tourKindsFor(interests: readonly string[]): TourKind[] {
  const kinds = interests
    .map((interest) => INTEREST_TOUR_KIND[interest as InterestValue])
    .filter((kind): kind is TourKind => kind !== undefined);
  return [...new Set(kinds)];
}
