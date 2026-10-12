/**
 * One suggested tour as the carousel shows it.
 *
 * The `tripData` tool returns each tour as `{ title, description }`. Trips saved
 * before it did hold plain strings, and `Trip.tours` is `Json`, so both shapes
 * are read here; a string becomes an untitled tour.
 */
export type Tour = { title?: string; description: string };

export function toTours(raw: unknown): Tour[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item): Tour[] => {
    if (typeof item === "string") {
      return item.trim() ? [{ description: item }] : [];
    }
    if (item && typeof item === "object" && typeof item.description === "string") {
      const title = typeof item.title === "string" && item.title.trim() ? item.title : undefined;
      return [{ title, description: item.description }];
    }
    return [];
  });
}
