import { describe, expect, it, vi } from "vitest";
import { screen } from "@/test/render";
import { renderTripSection } from "@/test/trip";
import { makeTrip } from "@/test/fixtures";
import TripPage from "./TripPage";

vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));
vi.mock("next/image", async () => ({
  default: (await import("@/test/stubs/next")).NextImage,
}));

describe("TripPage", () => {
  it("renders the row's sections between the route's opening and closing", () => {
    const generateWeather = vi.fn();
    const generateDailyForecast = vi.fn();
    renderTripSection(
      <TripPage
        trip={makeTrip({ title: "A Week of Light", city: "kyoto", countryCode: "JP" })}
        before={<p>before</p>}
        closing={<section aria-label="closing" />}
      />,
      { weather: { generateWeather, generateDailyForecast } },
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("A Week of Light");
    const main = screen.getByRole("main");
    expect(main.firstChild).toHaveTextContent("before");
    expect(main.lastChild).toHaveAccessibleName("closing");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    // The weather sections still fetch in the browser, by the row's place.
    expect(generateWeather).toHaveBeenCalledWith({ city: "kyoto", countryCode: "JP" });
    expect(generateDailyForecast).toHaveBeenCalledWith({ city: "kyoto", countryCode: "JP" });
  });
});
