import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchForecast, fetchWeather } from "@/app/api/openWeatherApi";
import { FIXTURE_NOW, forecastListFixture, tripFixture, weatherFixture } from "@/test/fixtures";
import { stubSrc } from "@/test/imageStub";
import loadWeather from "./loadWeather";

vi.mock("@/app/api/openWeatherApi", () => ({ fetchWeather: vi.fn(), fetchForecast: vi.fn() }));

beforeEach(() => {
  // placeWeatherIcons and selectDailyForecasts both read the clock; pin it to
  // midday on the fixture's day so the day/night branch and the start index
  // are the same on every machine.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(FIXTURE_NOW);
  vi.mocked(fetchWeather).mockReset().mockResolvedValue(weatherFixture);
  vi.mocked(fetchForecast).mockReset().mockResolvedValue(forecastListFixture);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("loadWeather", () => {
  it("asks for both at the row's coordinates", async () => {
    const { weather, forecast } = loadWeather(tripFixture);
    await Promise.all([weather, forecast]);

    const coordinates = { lat: tripFixture.lat, lon: tripFixture.lng };
    expect(fetchWeather).toHaveBeenCalledWith(coordinates);
    expect(fetchForecast).toHaveBeenCalledWith(coordinates);
  });

  it("keeps the current weather's payload and adds the icon for its condition", async () => {
    const weather = await loadWeather(tripFixture).weather;

    // The fixture is Clear at midday, so the sun.
    expect(weather).toEqual({ ...weatherFixture, weatherIconSrc: stubSrc("sun.png") });
  });

  it("reduces the forecast to one reading per day, each with its own icon", async () => {
    const days = await loadWeather(tripFixture).forecast;

    expect(days).toHaveLength(5);
    days.forEach((day) => expect(day.dailyForecastIconSrc).toBe(stubSrc("cloudy.png")));
    expect(days[0].main.temp).toBeTypeOf("number");
  });

  it("turns a failure into no weather and no days, and logs each", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(fetchWeather).mockRejectedValue(new Error("down"));
    vi.mocked(fetchForecast).mockRejectedValue(new Error("down"));

    const { weather, forecast } = loadWeather(tripFixture);

    await expect(weather).resolves.toBeNull();
    await expect(forecast).resolves.toEqual([]);
    expect(log).toHaveBeenCalledTimes(2);
  });
});
