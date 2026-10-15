import { describe, expect, it, vi } from "vitest";
import { act, renderWithProviders, screen } from "@/test/render";
import { makeTrip, weatherFixture } from "@/test/fixtures";
import { fetchForecast, fetchWeather } from "@/app/api/openWeatherApi";
import TripPage from "./TripPage";

vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

describe("TripPage", () => {
  it("renders the row's sections between the route's opening and closing", async () => {
    vi.mocked(fetchWeather).mockResolvedValue(weatherFixture);
    vi.mocked(fetchForecast).mockResolvedValue([]);
    // The weather sections suspend on `use()`, which needs an awaited `act`.
    await act(async () =>
      renderWithProviders(
        <TripPage
          trip={makeTrip({ title: "A Week of Light", city: "kyoto", lat: 35.02107, lng: 135.75385 })}
          before={<p>before</p>}
          closing={<section aria-label="closing" />}
        />,
      ),
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A Week of Light");
    const main = screen.getByRole("main");
    expect(main.firstChild).toHaveTextContent("before");
    expect(main.lastChild).toHaveAccessibleName("closing");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    // The weather is fetched at the row's coordinates, with no geocoding.
    expect(fetchWeather).toHaveBeenCalledWith({ lat: 35.02107, lon: 135.75385 });
    expect(fetchForecast).toHaveBeenCalledWith({ lat: 35.02107, lon: 135.75385 });
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });
});
