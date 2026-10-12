import { describe, expect, it } from "vitest";
import { toTours } from "./tours";

describe("toTours", () => {
  it("reads today's plain strings as untitled tours", () => {
    expect(toTours(["Walk the Alfama.", "Take the train to Sintra."])).toEqual([
      { description: "Walk the Alfama." },
      { description: "Take the train to Sintra." },
    ]);
  });

  it("reads the future { title, description } shape", () => {
    expect(toTours([{ title: "Alfama at dawn", description: "Walk the Alfama." }])).toEqual([
      { title: "Alfama at dawn", description: "Walk the Alfama." },
    ]);
  });

  it("treats a blank title as no title", () => {
    expect(toTours([{ title: "  ", description: "Walk the Alfama." }])).toEqual([
      { title: undefined, description: "Walk the Alfama." },
    ]);
  });

  it("drops blanks and anything it cannot read", () => {
    expect(toTours(["", "  ", 42, null, { title: "No body" }, "Kept."])).toEqual([
      { description: "Kept." },
    ]);
  });

  it("returns nothing for a missing list", () => {
    expect(toTours(undefined)).toEqual([]);
    expect(toTours(null)).toEqual([]);
  });
});
