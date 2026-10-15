import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders, waitFor } from "@/test/render";
import { useFormForecast } from "@/hooks/useFormForecast";
import { forecastForForm } from "@/app/api/forecastAction";
import toast from "react-hot-toast";
import {
  FIXTURE_NOW,
  forecastListFixture,
  lisbonPlace,
  makeForecastEntry,
  weatherFixture,
} from "@/test/fixtures";

vi.mock("@/app/api/forecastAction", () => ({ forecastForForm: vi.fn() }));
vi.mock("react-hot-toast", () => ({ default: { custom: vi.fn() } }));

const mockForecast = vi.mocked(forecastForForm);

const lisbon = { lat: lisbonPlace.lat, lon: lisbonPlace.lng };

let ctx: ReturnType<typeof useFormForecast>;

function Probe() {
  ctx = useFormForecast();
  return null;
}

function renderWeather() {
  return renderWithProviders(<Probe />);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // selectDailyForecasts reads the clock; pin it to midday on the fixture's day
  // so the start index is the same on every machine.
  vi.setSystemTime(FIXTURE_NOW);
  mockForecast.mockReset();
  vi.mocked(toast.custom).mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useFormForecast — the forecast for the prompt", () => {
  it("starts empty", () => {
    renderWeather();
    expect(ctx.forecastData).toBeUndefined();
  });

  it("reduces the raw list to one reading per day", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateForecast(lisbon);

    await waitFor(() => {
      expect(ctx.forecastData).toHaveLength(5);
    });
  });

  it("converts Kelvin to whole degrees Celsius", async () => {
    mockForecast.mockResolvedValue([
      makeForecastEntry(4, { main: { ...weatherFixture.main, temp: 300.15 } }),
    ]);
    renderWeather();

    ctx.generateForecast(lisbon);

    await waitFor(() => {
      expect(ctx.forecastData?.[0].formattedTemp).toBe("27°C");
    });
  });

  it("keeps only the four fields the prompt needs", async () => {
    mockForecast.mockResolvedValue([makeForecastEntry(4)]);
    renderWeather();

    ctx.generateForecast(lisbon);

    await waitFor(() => {
      expect(ctx.forecastData?.[0]).toBeDefined();
    });
    expect(Object.keys(ctx.forecastData![0]).sort()).toEqual([
      "condition",
      "description",
      "dt_txt",
      "formattedTemp",
    ]);
  });

  it("passes the coordinates through", async () => {
    mockForecast.mockResolvedValue(forecastListFixture);
    renderWeather();

    ctx.generateForecast(lisbon);

    await waitFor(() => {
      expect(mockForecast).toHaveBeenCalledWith(lisbon);
    });
  });

  it("says so and leaves forecastData undefined on failure", async () => {
    mockForecast.mockRejectedValue(new Error("Error fetching forecast data"));
    renderWeather();

    ctx.generateForecast(lisbon);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
    expect(toast.custom).toHaveBeenCalledTimes(1);
    expect(ctx.forecastData).toBeUndefined();
  });
});
