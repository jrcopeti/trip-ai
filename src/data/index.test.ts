import { describe, expect, it } from "vitest";
import { travelPhotos, sortedTypes } from "@/data";

describe("travelPhotos", () => {
  it("gives every photo its own non-empty alt", () => {
    const alts = travelPhotos.map((photo) => photo.alt);

    alts.forEach((alt) => expect(alt.trim()).not.toBe(""));
    expect(new Set(alts).size).toBe(alts.length);
  });

  it("gives every photo its own blur placeholder", () => {
    const placeholders = travelPhotos.map((photo) => photo.placeholder);

    placeholders.forEach((p) => expect(p).toMatch(/^data:image\//));
    expect(new Set(placeholders).size).toBe(placeholders.length);
  });

  it("tags every photo with a trip type the form offers", () => {
    const offered = sortedTypes.map((type) => type.value as string);

    travelPhotos.forEach((photo) => expect(offered).toContain(photo.tripType));
  });
});
