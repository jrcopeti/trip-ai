/**
 * One suggested tour as the carousel shows it.
 *
 * The `submit_trip` tool returns each tour as `{ title, kind, description }`. Trips
 * saved before it did hold plain strings, or objects without a kind, and
 * `Trip.tours` is `Json`, so every shape is read here; a string becomes an
 * untitled tour, and a missing kind no kind chip.
 */
export type Tour = { title?: string; kind?: string; description: string };

/** A trimmed, non-empty string, or `undefined`. */
const text = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export function toTours(raw: unknown): Tour[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item): Tour[] => {
    if (typeof item === "string") {
      return item.trim() ? [{ description: item }] : [];
    }
    if (item && typeof item === "object" && typeof item.description === "string") {
      return [{ title: text(item.title), kind: text(item.kind), description: item.description }];
    }
    return [];
  });
}
