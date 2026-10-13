import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderWithProviders, waitFor } from "@/test/render";
import { useGeoNames } from "@/hooks/useGeoNames";
import { destination } from "@/components/form/content";
import { matchCity } from "@/lib/place";
import { lisbonGeoName } from "@/test/fixtures";

const resolvePlace = vi.fn();

vi.mock("@/app/api/geoNamesApi", () => ({
  resolvePlace: (...args: unknown[]) => resolvePlace(...args),
}));

const lisbon = matchCity("Lisbon", [lisbonGeoName], "PT")!;

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

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  resolvePlace.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useGeoNames — when it does not search", () => {
  it("stays idle for a city shorter than three characters", async () => {
    renderWithProviders(<Probe city="Li" countryCode="PT" />);
    await runDebounce();

    expect(resolvePlace).not.toHaveBeenCalled();
    expect(hook).toEqual({
      isLoadingCityValid: false,
      isCityValid: false,
      message: "",
      place: null,
    });
  });

  it("stays idle without a country code", async () => {
    renderWithProviders(<Probe city="Lisbon" countryCode={undefined} />);
    await runDebounce();

    expect(resolvePlace).not.toHaveBeenCalled();
    expect(hook.isCityValid).toBe(false);
  });

  it("does not fire before the debounce elapses", () => {
    resolvePlace.mockResolvedValue({ ok: true, place: lisbon });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(resolvePlace).not.toHaveBeenCalled();
  });
});

describe("useGeoNames — a city that resolves", () => {
  it("asks the server with the city and country", async () => {
    resolvePlace.mockResolvedValue({ ok: true, place: lisbon });
    renderWithProviders(<Probe city="Lisboa" countryCode="PT" />);
    await runDebounce();

    expect(resolvePlace).toHaveBeenCalledWith("Lisboa", "PT");
  });

  it("reports the canonical name it found", async () => {
    resolvePlace.mockResolvedValue({ ok: true, place: lisbon });
    renderWithProviders(<Probe city="Lisboa" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.isCityValid).toBe(true);
    });
    expect(hook.message).toBe("Found Lisbon, Portugal");
    expect(hook.place).toEqual(lisbon);
    expect(hook.isLoadingCityValid).toBe(false);
  });

  it.each([
    ["the city", { city: "Lisbonx", countryCode: "PT" }],
    ["the country", { city: "Lisbon", countryCode: "ES" }],
  ])("drops the last result at once when %s changes", async (_, next) => {
    resolvePlace.mockResolvedValue({ ok: true, place: lisbon });
    const { rerender } = renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();
    await waitFor(() => {
      expect(hook.isCityValid).toBe(true);
    });

    rerender(<Probe {...next} />);
    expect(hook.isCityValid).toBe(false);
    expect(hook.isLoadingCityValid).toBe(true);
    expect(hook.place).toBeNull();
  });

  it("ignores an answer for a spelling that has since changed", async () => {
    let answerFirst!: (value: unknown) => void;
    resolvePlace
      .mockReturnValueOnce(new Promise((resolve) => (answerFirst = resolve)))
      .mockResolvedValueOnce({ ok: false, error: "not-found" });
    const { rerender } = renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    rerender(<Probe city="Lisbonx" countryCode="PT" />);
    await runDebounce();
    await waitFor(() => {
      expect(hook.message).toBe(destination.notFound);
    });

    await act(async () => answerFirst({ ok: true, place: lisbon }));
    expect(hook.isCityValid).toBe(false);
    expect(hook.message).toBe(destination.notFound);
  });
});

describe("useGeoNames — a city that does not", () => {
  it("says it found nothing", async () => {
    resolvePlace.mockResolvedValue({ ok: false, error: "not-found" });
    renderWithProviders(<Probe city="Atlantis" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe(destination.notFound);
    });
    expect(hook.isCityValid).toBe(false);
    expect(hook.place).toBeNull();
  });

  it("says the check is unavailable when GeoNames is", async () => {
    resolvePlace.mockResolvedValue({ ok: false, error: "unavailable" });
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe(destination.unavailable);
    });
    expect(hook.isCityValid).toBe(false);
  });

  it("treats a failed server call as unavailable", async () => {
    resolvePlace.mockRejectedValue(new Error("network down"));
    renderWithProviders(<Probe city="Lisbon" countryCode="PT" />);
    await runDebounce();

    await waitFor(() => {
      expect(hook.message).toBe(destination.unavailable);
    });
    expect(hook.isLoadingCityValid).toBe(false);
  });
});
