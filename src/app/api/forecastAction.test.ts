import { describe, expect, it, vi } from "vitest";
import { forecastListFixture, lisbonPlace } from "@/test/fixtures";
import { fetchForecast } from "./openWeatherApi";
import { forecastForForm } from "./forecastAction";

vi.mock("./openWeatherApi", () => ({ fetchForecast: vi.fn() }));

describe("forecastForForm", () => {
  it("returns the forecast at the coordinates the form resolved", async () => {
    vi.mocked(fetchForecast).mockResolvedValue(forecastListFixture);
    const lisbon = { lat: lisbonPlace.lat, lon: lisbonPlace.lng };

    await expect(forecastForForm(lisbon)).resolves.toEqual(forecastListFixture);
    expect(fetchForecast).toHaveBeenCalledWith(lisbon);
  });
});
