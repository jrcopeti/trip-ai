import { describe, expect, it } from "vitest";
import { travelPhotos } from "@/data";
import pickAboutImage from "@/components/about/pickAboutImage";

describe("pickAboutImage", () => {
  it("picks the first image at the bottom of the range", () => {
    expect(pickAboutImage(() => 0).src).toBe(travelPhotos[0].src);
  });

  it("picks the last image at the top of the range", () => {
    expect(pickAboutImage(() => 0.999999).src).toBe(
      travelPhotos[travelPhotos.length - 1].src,
    );
  });

  it("stays in range even if the source returns exactly 1", () => {
    expect(pickAboutImage(() => 1).src).toBe(
      travelPhotos[travelPhotos.length - 1].src,
    );
  });

  it("returns a defined placeholder for every index", () => {
    travelPhotos.forEach((_, i) => {
      const { placeholder } = pickAboutImage(() => i / travelPhotos.length);
      expect(placeholder).toMatch(/^data:image\//);
    });
  });
});
