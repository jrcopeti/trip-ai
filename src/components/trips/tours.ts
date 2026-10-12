/**
 * One suggested tour as the carousel shows it.
 *
 * The AI returns each tour as a single string today, so `title` is empty and the
 * card shows a placeholder in its place. Once the `tripData` tool schema returns
 * `{ title, description }` per tour (see the follow-up in docs/PLAN.md), only
 * the schema changes: `toTours` already reads that shape, and old saved trips
 * keep reading as strings.
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
