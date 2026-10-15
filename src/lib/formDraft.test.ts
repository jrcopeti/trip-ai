import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FORM_DRAFT_KEY,
  clearFormDraft,
  readFormDraft,
  resumeStep,
  writeFormDraft,
} from "@/lib/formDraft";
import { validInputs } from "@/test/fixtures";

const draft = { values: validInputs, step: 3, isWeatherSelected: true };

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("the form draft", () => {
  it("reads back what was written", () => {
    writeFormDraft(draft);
    expect(readFormDraft()).toEqual(draft);
  });

  it("is gone once cleared", () => {
    writeFormDraft(draft);
    clearFormDraft();
    expect(readFormDraft()).toBeNull();
    expect(window.sessionStorage.getItem(FORM_DRAFT_KEY)).toBeNull();
  });

  it("is null when nothing was saved", () => {
    expect(readFormDraft()).toBeNull();
  });

  it.each([
    ["not JSON", "{oops"],
    ["not an object", "42"],
    ["no values", JSON.stringify({ step: 1, isWeatherSelected: false })],
    ["a step that isn't a number", JSON.stringify({ ...draft, step: "3" })],
    ["no weather choice", JSON.stringify({ values: validInputs, step: 1 })],
  ])("is null for a stored value that is %s", (_, raw) => {
    window.sessionStorage.setItem(FORM_DRAFT_KEY, raw);
    expect(readFormDraft()).toBeNull();
  });

  // Blocked storage, private mode, a full quota: the form carries on without a draft.
  it("never throws when storage does", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => writeFormDraft(draft)).not.toThrow();
    expect(readFormDraft()).toBeNull();
    expect(() => clearFormDraft()).not.toThrow();
  });
});

// `validInputs`' dates are in May 2030; the clock is pinned before them, in local time.
describe("resumeStep", () => {
  const pin = (date: Date) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(date);
  };

  it("keeps the saved step when every answer still holds", () => {
    pin(new Date(2030, 3, 1, 12, 0, 0));
    expect(resumeStep(validInputs, 6)).toEqual({ step: 6, invalid: [] });
  });

  // Left on the review step, back the day after the trip was meant to start.
  it("goes back to the dates step when the start date has passed", () => {
    pin(new Date(2030, 4, 3, 12, 0, 0));
    expect(resumeStep(validInputs, 6)).toEqual({ step: 4, invalid: ["startDate"] });
  });

  // Steps after the saved one are just not filled in yet; that's not a reason to move.
  it("ignores steps the traveller hasn't reached", () => {
    pin(new Date(2030, 4, 3, 12, 0, 0));
    expect(resumeStep({ ...validInputs, interests: [] as never }, 2)).toEqual({
      step: 2,
      invalid: [],
    });
  });

  it("stops at the first failing step", () => {
    pin(new Date(2030, 4, 3, 12, 0, 0));
    expect(resumeStep({ ...validInputs, pace: "" }, 6)).toEqual({ step: 2, invalid: ["pace"] });
  });
});
