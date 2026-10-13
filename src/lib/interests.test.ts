import { describe, expect, it } from "vitest";
import { interests } from "@/data";
import { TOUR_KINDS } from "@/lib/tourKinds";
import { INTEREST_TOUR_KIND, tourKindsFor } from "./interests";

describe("INTEREST_TOUR_KIND", () => {
  it("maps every interest the form offers to a tour kind", () => {
    interests.forEach(({ value }) => expect(TOUR_KINDS).toContain(INTEREST_TOUR_KIND[value]));
  });

  it("maps nothing the form does not offer", () => {
    expect(Object.keys(INTEREST_TOUR_KIND).sort()).toEqual(interests.map((i) => i.value).sort());
  });
});

describe("tourKindsFor", () => {
  it("returns each kind once, in the interests' order", () => {
    expect(tourKindsFor(["wine", "art", "food"])).toEqual(["Food", "Art"]);
  });

  it("skips a value no list offers, as an old row's interests might be", () => {
    expect(tourKindsFor(["gardening", "beach"])).toEqual(["Relaxation"]);
  });
});
