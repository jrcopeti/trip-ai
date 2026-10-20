import { afterEach, describe, expect, it, vi } from "vitest";
import {
  OPEN_TRIP_KEY,
  forgetOpenTrip,
  readOpenTrip,
  rememberOpenTrip,
  subscribeOpenTrip,
} from "@/lib/openTrip";

const URL = "a1b2c3d4e5f6";
const NEWER = "f6e5d4c3b2a1";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the open trip", () => {
  it("reads back what was stored", () => {
    rememberOpenTrip(URL);
    expect(readOpenTrip()).toBe(URL);
  });

  it("is null when nothing was stored", () => {
    expect(readOpenTrip()).toBeNull();
  });

  it("keeps only the latest trip", () => {
    rememberOpenTrip(URL);
    rememberOpenTrip(NEWER);
    expect(readOpenTrip()).toBe(NEWER);
  });

  it("is gone once that trip is forgotten", () => {
    rememberOpenTrip(URL);
    forgetOpenTrip(URL);
    expect(readOpenTrip()).toBeNull();
    expect(window.localStorage.getItem(OPEN_TRIP_KEY)).toBeNull();
  });

  // Answering an older trip's page doesn't free a newer one.
  it("stays when another trip is forgotten", () => {
    rememberOpenTrip(NEWER);
    forgetOpenTrip(URL);
    expect(readOpenTrip()).toBe(NEWER);
  });

  it.each([
    ["empty", ""],
    ["not a trip url", "../saved-trips"],
    ["a url in capitals", "A1B2C3D4E5F6"],
    ["JSON", JSON.stringify(URL)],
  ])("is null for a stored value that is %s", (_, raw) => {
    window.localStorage.setItem(OPEN_TRIP_KEY, raw);
    expect(readOpenTrip()).toBeNull();
  });

  // Blocked storage, private mode, a full quota: nothing is held back.
  it("never throws when storage does", () => {
    for (const method of ["getItem", "setItem", "removeItem"] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error("SecurityError");
      });
    }
    expect(() => rememberOpenTrip(URL)).not.toThrow();
    expect(readOpenTrip()).toBeNull();
    expect(() => forgetOpenTrip(URL)).not.toThrow();
  });

  describe("subscribeOpenTrip", () => {
    it("tells a listener of this tab's changes, until it unsubscribes", () => {
      const listener = vi.fn();
      const unsubscribe = subscribeOpenTrip(listener);
      rememberOpenTrip(URL);
      forgetOpenTrip(URL);
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      rememberOpenTrip(URL);
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it("doesn't call a listener when nothing was forgotten", () => {
      rememberOpenTrip(NEWER);
      const listener = vi.fn();
      subscribeOpenTrip(listener);
      forgetOpenTrip(URL);
      expect(listener).not.toHaveBeenCalled();
    });

    it("tells a listener of another tab's change to the key, and of a cleared storage", () => {
      const listener = vi.fn();
      subscribeOpenTrip(listener);
      window.dispatchEvent(new StorageEvent("storage", { key: OPEN_TRIP_KEY }));
      window.dispatchEvent(new StorageEvent("storage", { key: null }));
      window.dispatchEvent(new StorageEvent("storage", { key: "trip-ai:form-draft:v1" }));
      expect(listener).toHaveBeenCalledTimes(2);
    });
  });
});
