import { describe, expect, it } from "vitest";
import { travelPhotos } from "@/data";
import pickTravelPhoto from "@/lib/pickTravelPhoto";

describe("pickTravelPhoto", () => {
  it("picks the first image at the bottom of the range", () => {
    expect(pickTravelPhoto(() => 0).src).toBe(travelPhotos[0].src);
  });

  it("picks the last image at the top of the range", () => {
    expect(pickTravelPhoto(() => 0.999999).src).toBe(
      travelPhotos[travelPhotos.length - 1].src,
    );
  });

  it("stays in range even if the source returns exactly 1", () => {
    expect(pickTravelPhoto(() => 1).src).toBe(
      travelPhotos[travelPhotos.length - 1].src,
    );
  });

  it("returns a defined placeholder for every index", () => {
    travelPhotos.forEach((_, i) => {
      const { placeholder } = pickTravelPhoto(() => i / travelPhotos.length);
      expect(placeholder).toMatch(/^data:image\//);
    });
  });
});
