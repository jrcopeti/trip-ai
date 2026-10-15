import { describe, expect, it } from "vitest";
import { toTripRow } from "@/lib/tripRow";
import {
  familyTripRequest,
  generatedTripFixture,
  imageDataFixture,
  lisbonPlace,
  tripCreateInput,
  tripDataFixture,
  validTripRequest,
} from "@/test/fixtures";

const row = (overrides: Partial<Parameters<typeof toTripRow>[0]> = {}) =>
  toTripRow({
    request: validTripRequest,
    place: lisbonPlace,
    tripData: tripDataFixture,
    images: imageDataFixture,
    tripUrl: generatedTripFixture.tripUrl,
    byWeather: false,
    ...overrides,
  });

describe("toTripRow", () => {
  it("writes the request, the place, the photos and the model's trip, unsaved", () => {
    expect(row()).toEqual(tripCreateInput(generatedTripFixture));
  });

  it("writes GeoNames' coordinates and the request's code", () => {
    expect(row({ place: { lat: 1.5, lng: -2.5 } })).toMatchObject({
      countryCode: "PT",
      lat: 1.5,
      lng: -2.5,
    });
  });

  it("stores each calendar day at UTC midnight, whatever the server's zone", () => {
    expect(row().startDate).toEqual(new Date("2030-05-01T00:00:00.000Z"));
    expect(row().endDate).toEqual(new Date("2030-05-08T00:00:00.000Z"));
  });

  it("is planned by the weather when a forecast was used, not when one was asked for", () => {
    expect(row({ byWeather: true }).byWeather).toBe(true);
    expect(row({ request: familyTripRequest, byWeather: false }).byWeather).toBe(false);
  });

  it("writes no passport or note when there is none", () => {
    expect(row({ request: familyTripRequest })).toMatchObject({ passport: null });
    expect(row({ request: { ...validTripRequest, note: undefined } }).note).toBeNull();
  });

  it("writes no photos when the search failed", () => {
    expect(row({ images: { tripImages: [], placeholder: null } })).toMatchObject({
      tripImages: [],
      placeholder: null,
    });
  });
});
