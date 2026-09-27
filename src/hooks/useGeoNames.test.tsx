import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import { useGeoNames } from "@/hooks/useGeoNames";

const search = vi.fn();

vi.mock("geonames.js", () => ({
  default: () => ({ search }),
}));

let hook: ReturnType<typeof useGeoNames>;

function Probe({ city, countryCode }: { city: string; countryCode?: string }) {
  hook = useGeoNames({ city, countryCode });
  return null;
}

/** The hook debounces by a second; this walks the timer past it. */
async function runDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1000);
  });
}

function geoname(overrides: Record<string, unknown> = {}) {
  return { name: "Lisbon", toponymName: "Lisbon", population: 517_802, ...overrides };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  search.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGeoNames — when it does not search", () => {
  it("stays idle for a city shorter than three characters", async () => {
    renderWithProviders(<Probe city="Li" countryCode="PT" />);
    await runDebounce();

    expect(search).not.toHaveBeenCalled();
    expect(hook).toEqual({
      isLoadingCityValid: false,
      isCityValid: false,
      message: "",
    });
  });

  it("stays idle without a country code", async () => {
    renderWithProviders(<Probe city="Lisbon" countryCode={undefined} />);
    await runDebounce();

    expect(search).not.toHaveBeenCalled();
    expect(hook.isCityValid).toBe(false);
  });

  it("does not fire before the debounce elapses", () => {
    search.mockResolvedValue({ totalResultsCount: 1, geonames: [geoname()] });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(search).not.toHaveBeenCalled();
  });
});

describe("useGeoNames — a valid city", () => {
  it("queries GeoNames with the city and country", async () => {
    search.mockResolvedValue({ totalResultsCount: 1, geonames: [geoname()] });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    expect(search).toHaveBeenCalledWith({
      q: "Lisbon",
      country: "PT",
      maxRows: 5,
      featureClass: "P",
    });
  });

  it("reports the city as found", async () => {
    search.mockResolvedValue({ totalResultsCount: 1, geonames: [geoname()] });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.isCityValid).toBe(true);
    });
    expect(hook.message).toBe("Location has been found");
    expect(hook.isLoadingCityValid).toBe(false);
  });

  it("matches case-insensitively and ignores surrounding whitespace", async () => {
    search.mockResolvedValue({ totalResultsCount: 1, geonames: [geoname()] });
    renderWithProviders(<Probe city="  lisbon  " countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.isCityValid).toBe(true);
    });
  });

  it("accepts a match on toponymName rather than name", async () => {
    search.mockResolvedValue({
      totalResultsCount: 1,
      geonames: [geoname({ name: "Lisboa", toponymName: "Lisbon" })],
    });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.isCityValid).toBe(true);
    });
  });
});

describe("useGeoNames — an invalid city", () => {
  it("reports nothing found when the result set is empty", async () => {
    search.mockResolvedValue({ totalResultsCount: 0, geonames: [] });
    renderWithProviders(<Probe city="Atlantis" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe("No location has been found. Please try again.");
    });
    expect(hook.isCityValid).toBe(false);
  });

  it("rejects a name that does not match the query", async () => {
    search.mockResolvedValue({
      totalResultsCount: 1,
      geonames: [geoname({ name: "Porto", toponymName: "Porto" })],
    });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe("Location is not valid. Please try again.");
    });
    expect(hook.isCityValid).toBe(false);
  });

  it("rejects a match with no population — the API returns uninhabited places too", async () => {
    search.mockResolvedValue({
      totalResultsCount: 1,
      geonames: [geoname({ population: 0 })],
    });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe("Location is not valid. Please try again.");
    });
  });

  it("surfaces a request failure as its message", async () => {
    search.mockRejectedValue(new Error("geonames unreachable"));
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe("geonames unreachable");
    });
    expect(hook.isCityValid).toBe(false);
    expect(hook.isLoadingCityValid).toBe(false);
  });
});
