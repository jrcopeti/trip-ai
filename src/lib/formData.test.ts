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

  it("coerces an absent weatherForecast to an empty string", () => {
    const result = transformInputsToFinalData({
      ...validInputs,
      weatherForecast: undefined,
    });
    expect(result.weatherForecast).toBe("");
  });

  it("keeps a weatherForecast that is present", () => {
    const result = transformInputsToFinalData({
      ...validInputs,
      weatherForecast: '[{"dt_txt":"2030-05-01 09:00:00"}]',
    });
    expect(result.weatherForecast).toBe('[{"dt_txt":"2030-05-01 09:00:00"}]');
  });

  it("carries every other field through untouched", () => {
    const result = transformInputsToFinalData(validInputs);
    expect(result).toMatchObject({
      userName: "Ana",
      age: "31",
      nationality: "Brazilian",
      type: "cultural",
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
      flagUrl: "https://flagcdn.com/pt.svg",
    });
  });

  it("preserves an optional note left undefined", () => {
    const result = transformInputsToFinalData({ ...validInputs, note: undefined });
    expect(result.note).toBeUndefined();
  });
});
