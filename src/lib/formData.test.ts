import { describe, expect, it } from "vitest";
import { transformInputsToFinalData } from "@/lib/formData";
import { validInputs } from "@/test/fixtures";

describe("transformInputsToFinalData", () => {
  it("flattens requiredItems from objects to strings", () => {
    const result = transformInputsToFinalData(validInputs);
    expect(result.requiredItems).toEqual(["camera", "walking shoes"]);
  });

  it("returns an empty array when requiredItems is absent", () => {
    const result = transformInputsToFinalData({
      ...validInputs,
      requiredItems: undefined,
    });
    expect(result.requiredItems).toEqual([]);
  });

  it("returns an empty array when requiredItems is empty", () => {
    const result = transformInputsToFinalData({ ...validInputs, requiredItems: [] });
    expect(result.requiredItems).toEqual([]);
  });

  it("keeps empty item strings rather than filtering them", () => {
    // The form seeds one blank row; the transform is not where it gets dropped.
    const result = transformInputsToFinalData({
      ...validInputs,
      requiredItems: [{ item: "" }],
    });
    expect(result.requiredItems).toEqual([""]);
  });

  it("starts with no place and no weather, which the submit fills in", () => {
    const result = transformInputsToFinalData(validInputs);
    expect(result).toMatchObject({ byWeather: false, countryCode: "", lat: null, lng: null });
  });

  it("carries every other field through untouched", () => {
    const result = transformInputsToFinalData(validInputs);
    expect(result).toMatchObject({
      userName: "Ana",
      travellers: "couple",
      ageRanges: ["25-30"],
      passport: "Brazil",
      type: "cultural",
      pace: "balanced",
      city: "Lisbon",
      country: "Portugal",
      luggageSize: "carry-on",
      accommodation: "hotel",
      budget: "comfort",
      transport: "plane",
      interests: ["art", "food"],
      note: "Wants a day trip to Sintra",
      startDate: "2030-05-01T00:00:00.000Z",
      endDate: "2030-05-08T00:00:00.000Z",
      agreement: true,
    });
  });

  it("preserves an optional note left undefined", () => {
    const result = transformInputsToFinalData({ ...validInputs, note: undefined });
    expect(result.note).toBeUndefined();
  });
});
