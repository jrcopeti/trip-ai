import { describe, expect, it } from "vitest";
import { toTripRow } from "@/lib/tripRow";
import { finalFormData, imageDataFixture, tripDataFixture } from "@/test/fixtures";

const row = (overrides: Partial<Parameters<typeof toTripRow>[0]> = {}) =>
  toTripRow({
    formData: finalFormData,
    tripData: tripDataFixture,
    imageData: imageDataFixture,
    tripUrl: "ab12c",
    saved: true,
    ...overrides,
  });

describe("toTripRow", () => {
  it("writes the form's place, kept from the submit", () => {
    expect(row()).toMatchObject({ countryCode: "PT", lat: 38.71667, lng: -9.13333 });
  });

  it("writes byWeather rather than a forecast", () => {
    expect(row({ formData: { ...finalFormData, byWeather: true } }).byWeather).toBe(true);
  });

  it("writes the images in order, and the blur on a discarded trip too", () => {
    expect(row({ saved: false })).toMatchObject({
      tripImages: imageDataFixture.tripImages,
      placeholder: imageDataFixture.placeholder,
      saved: false,
    });
  });

  it("writes no images when the image search failed", () => {
    expect(row({ imageData: undefined })).toMatchObject({ tripImages: [], placeholder: null });
  });

  it("passes Prisma no key it has no column for", () => {
    const keys = Object.keys(row());
    for (const gone of ["flagUrl", "weatherForecast", "image", "age", "nationality"]) {
      expect(keys).not.toContain(gone);
    }
  });

  it("refuses a form with no resolved place", () => {
    expect(() => row({ formData: { ...finalFormData, lat: null } })).toThrow();
  });
});
