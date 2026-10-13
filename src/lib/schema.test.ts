import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FormDataSchema, LIMITS, fitsGroup } from "@/lib/schema";
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
      ["travellers", "Who's going is required"],
      ["type", "Type of travel is required"],
      ["pace", "Pace is required"],
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
      "travellers",
      "ageRanges",
      "type",
      "pace",
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

    it("accepts a form with no passport — it only feeds the entry-requirements lookup", () => {
      const data: Record<string, unknown> = { ...validInputs };
      delete data.passport;
      expect(FormDataSchema.safeParse(data).success).toBe(true);
      expect(FormDataSchema.safeParse(withField("passport", "")).success).toBe(true);
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

  describe("ageRanges", () => {
    it("rejects an empty list", () => {
      expect(
        messagesFor(withField("ageRanges", [] as unknown as Inputs["ageRanges"]), "ageRanges"),
      ).toContain("Pick at least one age range");
    });

    it("accepts several ranges — a family spans more than one", () => {
      const family = { ...validInputs, travellers: "family", ageRanges: ["2-5", "36-40"] };
      expect(FormDataSchema.safeParse(family).success).toBe(true);
    });

    it("allows one range for a solo trip", () => {
      const solo = { ...validInputs, travellers: "solo" };
      expect(FormDataSchema.safeParse({ ...solo, ageRanges: ["25-30"] }).success).toBe(true);
      expect(messagesFor({ ...solo, ageRanges: ["25-30", "31-35"] }, "ageRanges")).toContain(
        "A solo trip has one age range",
      );
    });

    it("allows up to two ranges for a couple", () => {
      const couple = { ...validInputs, travellers: "couple" };
      expect(FormDataSchema.safeParse({ ...couple, ageRanges: ["25-30", "31-35"] }).success).toBe(
        true,
      );
      expect(
        messagesFor({ ...couple, ageRanges: ["25-30", "31-35", "36-40"] }, "ageRanges"),
      ).toContain("A couple has up to two age ranges");
    });

    it("allows any number for a family", () => {
      const family = { ...validInputs, travellers: "family", ageRanges: ["2-5", "6-12", "36-40", "70+"] };
      expect(FormDataSchema.safeParse(family).success).toBe(true);
    });

    it("keeps children to a family", () => {
      const withGroup = (travellers: string, ageRanges: string[]) => ({
        ...validInputs,
        travellers,
        ageRanges,
      });
      expect(messagesFor(withGroup("solo", ["6-12"]), "ageRanges")).toContain(
        "A solo trip starts at 13",
      );
      expect(messagesFor(withGroup("couple", ["2-5", "31-35"]), "ageRanges")).toContain(
        "A couple starts at 18",
      );
      expect(messagesFor(withGroup("colleagues", ["13-17"]), "ageRanges")).toContain(
        "Colleagues start at 18",
      );
      expect(messagesFor(withGroup("couple", ["13-17"]), "ageRanges")).toContain(
        "A couple starts at 18",
      );
      expect(FormDataSchema.safeParse(withGroup("solo", ["13-17"])).success).toBe(true);
      expect(FormDataSchema.safeParse(withGroup("friends", ["13-17", "18-24"])).success).toBe(true);
      expect(FormDataSchema.safeParse(withGroup("family", ["0-1"])).success).toBe(true);
    });
  });

  describe("fitsGroup", () => {
    it.each([
      ["0-1", "family", true],
      ["0-1", "solo", false],
      ["6-12", "friends", false],
      ["13-17", "solo", true],
      ["13-17", "couple", false],
      ["18-24", "couple", true],
      ["13-17", "friends", true],
      ["13-17", "colleagues", false],
      ["18-24", "colleagues", true],
      ["70+", "solo", true],
      ["0-1", "", true],
    ])("%s for %s → %s", (range, group, fits) => {
      expect(fitsGroup(range, group)).toBe(fits);
    });
  });

  describe("caps", () => {
    it(`rejects more than ${LIMITS.interests} interests`, () => {
      expect(
        messagesFor(withField("interests", ["art", "food", "beach", "music"]), "interests"),
      ).toContain(`Up to ${LIMITS.interests} interests`);
    });

    it(`rejects a note over ${LIMITS.note} characters, and accepts one at the cap`, () => {
      expect(messagesFor(withField("note", "a".repeat(LIMITS.note + 1)), "note")).toContain(
        `Keep notes under ${LIMITS.note} characters`,
      );
      expect(FormDataSchema.safeParse(withField("note", "a".repeat(LIMITS.note))).success).toBe(true);
    });

    it(`rejects more than ${LIMITS.requiredItems} required items`, () => {
      const items = Array.from({ length: LIMITS.requiredItems + 1 }, (_, i) => ({ item: `item ${i}` }));
      expect(messagesFor(withField("requiredItems", items), "requiredItems")).toContain(
        `Up to ${LIMITS.requiredItems} items`,
      );
    });

    it(`rejects a required item over ${LIMITS.requiredItem} characters`, () => {
      const items = [{ item: "a".repeat(LIMITS.requiredItem + 1) }];
      expect(messagesFor(withField("requiredItems", items), "requiredItems.0.item")).toContain(
        `Keep each item under ${LIMITS.requiredItem} characters`,
      );
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
