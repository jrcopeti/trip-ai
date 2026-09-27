import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormDataSchema } from "@/lib/schema";
import { validInputs } from "@/test/fixtures";
import type { Inputs } from "@/types";

/** The fixture with one field replaced, so each case states only what it changes. */
function withField<K extends keyof Inputs>(key: K, value: Inputs[K]) {
  return { ...validInputs, [key]: value };
}

function messagesFor(data: unknown, path: string) {
  const result = FormDataSchema.safeParse(data);
  if (result.success) return [];
  return result.error.issues
    .filter((issue) => issue.path.join(".") === path)
    .map((issue) => issue.message);
}

describe("FormDataSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // The date refinements compare against "now", so the clock is pinned well
    // before the fixture's 2030 dates.
    vi.setSystemTime(new Date(2030, 3, 1, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a complete, valid form", () => {
    expect(FormDataSchema.safeParse(validInputs).success).toBe(true);
  });

  describe("required text fields", () => {
    it.each([
      ["userName", "Name is required"],
      ["age", "Age is required"],
      ["nationality", "Nationality is required"],
      ["type", "Type of travel is required"],
      ["city", "City is required"],
      ["country", "Country is required"],
      ["luggageSize", "Lugagge size is required"],
      ["accommodation", "Accommodation is required"],
      ["budget", "Budget is required"],
      ["transport", "Transport is required"],
    ] as const)("rejects an empty %s", (field, message) => {
      expect(messagesFor(withField(field, ""), field)).toContain(message);
    });

    it.each([
      "userName",
      "age",
      "nationality",
      "type",
      "city",
      "country",
      "luggageSize",
      "accommodation",
      "budget",
      "transport",
      "flagUrl",
    ] as const)("rejects a missing %s", (field) => {
      const data: Record<string, unknown> = { ...validInputs };
      delete data[field];
      expect(FormDataSchema.safeParse(data).success).toBe(false);
    });
  });

  describe("optional fields", () => {
    it("accepts a form with no note", () => {
      const data: Record<string, unknown> = { ...validInputs };
      delete data.note;
      expect(FormDataSchema.safeParse(data).success).toBe(true);
    });

    it("accepts a form with no requiredItems", () => {
      const data: Record<string, unknown> = { ...validInputs };
      delete data.requiredItems;
      expect(FormDataSchema.safeParse(data).success).toBe(true);
    });

    it("accepts an empty requiredItems array", () => {
      expect(FormDataSchema.safeParse(withField("requiredItems", [])).success).toBe(
        true,
      );
    });

    it("accepts a form with no weatherForecast", () => {
      const data: Record<string, unknown> = { ...validInputs };
      delete data.weatherForecast;
      expect(FormDataSchema.safeParse(data).success).toBe(true);
    });
  });

  describe("interests", () => {
    it("rejects an empty list", () => {
      expect(messagesFor(withField("interests", [] as unknown as Inputs["interests"]), "interests")).toContain(
        "At least one interest is required",
      );
    });

    it("accepts a single interest", () => {
      expect(
        FormDataSchema.safeParse(withField("interests", ["art"])).success,
      ).toBe(true);
    });
  });

  describe("agreement", () => {
    it("rejects false", () => {
      expect(messagesFor(withField("agreement", false), "agreement")).toContain(
        "You must agree to the terms to continue",
      );
    });

    it("accepts true", () => {
      expect(FormDataSchema.safeParse(withField("agreement", true)).success).toBe(
        true,
      );
    });
  });

  describe("startDate", () => {
    it("rejects a date in the past", () => {
      expect(
        messagesFor(withField("startDate", "2029-01-01T00:00:00.000Z"), "startDate"),
      ).toContain("Start date cannot be in the past");
    });

    it("accepts today", () => {
      const today = new Date(2030, 3, 1, 12, 0, 0).toISOString();
      const result = FormDataSchema.safeParse({
        ...validInputs,
        startDate: today,
        endDate: new Date(2030, 3, 5, 12, 0, 0).toISOString(),
      });
      expect(result.success).toBe(true);
    });

    it("rejects a non-datetime string", () => {
      expect(FormDataSchema.safeParse(withField("startDate", "01/05/2030")).success).toBe(
        false,
      );
    });

    it("rejects an empty string", () => {
      expect(FormDataSchema.safeParse(withField("startDate", "")).success).toBe(false);
    });
  });

  describe("endDate", () => {
    it("rejects an end date before the start date", () => {
      expect(
        messagesFor(
          { ...validInputs, startDate: "2030-05-08T00:00:00.000Z", endDate: "2030-05-01T00:00:00.000Z" },
          "endDate",
        ),
      ).toContain("End date must be after start date");
    });

    it("accepts an end date equal to the start date — a day trip", () => {
      const sameDay = "2030-05-01T00:00:00.000Z";
      const result = FormDataSchema.safeParse({
        ...validInputs,
        startDate: sameDay,
        endDate: sameDay,
      });
      expect(result.success).toBe(true);
    });

    it("rejects an empty string", () => {
      expect(FormDataSchema.safeParse(withField("endDate", "")).success).toBe(false);
    });
  });
});
