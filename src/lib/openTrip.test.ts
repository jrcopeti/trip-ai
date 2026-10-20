import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_OPEN_TRIPS,
  OPEN_TRIP_KEY,
  forgetOpenTrip,
  readOpenTrips,
  rememberOpenTrip,
  subscribeOpenTrip,
} from "@/lib/openTrip";

const URL = "a1b2c3d4e5f6";
const NEWER = "f6e5d4c3b2a1";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("the open trips", () => {
  it("reads back what was stored", () => {
    rememberOpenTrip(URL);
    expect(readOpenTrips()).toEqual([URL]);
  });

  it("are none when nothing was stored", () => {
    expect(readOpenTrips()).toEqual([]);
  });

  // Two tabs planning at once: neither trip is lost.
  it("keep every trip, oldest first", () => {
    rememberOpenTrip(URL);
    rememberOpenTrip(NEWER);
    expect(readOpenTrips()).toEqual([URL, NEWER]);
  });

  it("hold a trip once, as the newest when remembered again", () => {
    rememberOpenTrip(URL);
    rememberOpenTrip(NEWER);
    rememberOpenTrip(URL);
    expect(readOpenTrips()).toEqual([NEWER, URL]);
  });

  it(`keep the newest ${MAX_OPEN_TRIPS}`, () => {
    const urls = Array.from({ length: MAX_OPEN_TRIPS + 2 }, (_, i) => i.toString(16).padStart(12, "0"));
    urls.forEach(rememberOpenTrip);
    expect(readOpenTrips()).toEqual(urls.slice(-MAX_OPEN_TRIPS));
  });

  it("drop only the trip forgotten", () => {
    rememberOpenTrip(URL);
    rememberOpenTrip(NEWER);
    forgetOpenTrip(URL);
    expect(readOpenTrips()).toEqual([NEWER]);
  });

  it("leave nothing in storage once the last is forgotten", () => {
    rememberOpenTrip(URL);
    forgetOpenTrip(URL);
    expect(readOpenTrips()).toEqual([]);
    expect(window.localStorage.getItem(OPEN_TRIP_KEY)).toBeNull();
  });

  // `useSyncExternalStore` loops forever on a new array per read.
  it("read as the same array while storage is unchanged", () => {
    rememberOpenTrip(URL);
    expect(readOpenTrips()).toBe(readOpenTrips());
  });

  it.each([
    ["not JSON", "{oops"],
    ["a bare url", URL],
    ["an object", JSON.stringify({ url: URL })],
  ])("are none for a stored value that is %s", (_, raw) => {
    window.localStorage.setItem(OPEN_TRIP_KEY, raw);
    expect(readOpenTrips()).toEqual([]);
  });

  it("skip anything in the list that isn't a trip url", () => {
    window.localStorage.setItem(OPEN_TRIP_KEY, JSON.stringify([URL, "../saved-trips", 42, "A1B2C3D4E5F6"]));
    expect(readOpenTrips()).toEqual([URL]);
  });

  // Blocked storage, private mode, a full quota: nothing is held back.
  it("never throw when storage does", () => {
    for (const method of ["getItem", "setItem", "removeItem"] as const) {
      vi.spyOn(Storage.prototype, method).mockImplementation(() => {
        throw new Error("SecurityError");
      });
    }
    expect(() => rememberOpenTrip(URL)).not.toThrow();
    expect(readOpenTrips()).toEqual([]);
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
