import { describe, expect, it } from "vitest";
import { FaCompass } from "react-icons/fa6";
import { TOUR_KINDS } from "@/lib/tourKinds";
import { kindIcon } from "./kinds";

describe("kindIcon", () => {
  it("gives every kind the AI may return its own icon", () => {
    const icons = TOUR_KINDS.map(kindIcon);
    icons.forEach((icon) => expect(icon).not.toBe(FaCompass));
    expect(new Set(icons).size).toBe(TOUR_KINDS.length);
  });

  it("falls back to a compass for a kind outside the list", () => {
    expect(kindIcon("Spelunking")).toBe(FaCompass);
  });

  it("matches regardless of case", () => {
    expect(kindIcon("food")).toBe(kindIcon("Food"));
  });
});
